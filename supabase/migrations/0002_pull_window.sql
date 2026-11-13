-- Pull limit (#20, #21): one card per 12-hour window, 12am–12pm and 12pm–12am New York time.
-- A second call in the same window returns { status: 'wait', next_at } and adds nothing,
-- so repeated session starts can no longer pull extra cards.

-- The window that contains `at`, as [start, next start). Local midnight and noon never fall in a DST gap.
create function public.pull_window(at timestamptz) returns tstzrange
language sql stable set search_path = '' as $$
  select tstzrange(start_local at time zone 'America/New_York',
                   (start_local + interval '12 hours') at time zone 'America/New_York')
  from (select date_trunc('day', local)
               + case when extract(hour from local) >= 12 then interval '12 hours' else interval '0' end as start_local
        from (select at at time zone 'America/New_York' as local) l) s
$$;

create or replace function public.pull_card() returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  uid    uuid := auth.uid();
  c      public.cards;
  total  int;
  win    tstzrange := public.pull_window(now());
begin
  if uid is null then
    raise exception 'pull_card: not signed in' using errcode = '28000';
  end if;
  -- One pull at a time per user, so parallel session starts can't race past the window check.
  perform pg_advisory_xact_lock(hashtextextended(uid::text, 0));

  if exists (select 1 from public.pulls where user_id = uid and pulled_at >= lower(win)) then
    return jsonb_build_object('status', 'wait', 'next_at', upper(win));
  end if;

  -- shortcut: ignores series; a Series 2 migration must add a series filter or parameter.
  select count(*) into total from public.cards;

  -- Weighted random pick: smallest Exp(1)/weight wins. 1 - random() avoids ln(0).
  select * into c from public.cards k
  where not exists (select 1 from public.pulls p where p.user_id = uid and p.card_id = k.id)
  order by -ln(1 - random()) / k.weight
  limit 1;

  if not found then
    return jsonb_build_object('status', 'set_complete', 'total', total);
  end if;

  insert into public.pulls (user_id, card_id) values (uid, c.id);

  return jsonb_build_object(
    'card',  jsonb_strip_nulls(to_jsonb(c) - 'series' - 'weight'),
    'owned', (select count(*) from public.pulls where user_id = uid),
    'total', total);
end $$;

-- create or replace keeps the grants from 0001: authenticated only.
