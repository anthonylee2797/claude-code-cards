-- 'wait' also carries the card pulled this window (plus owned and total), so every session
-- can show it, not just the one that pulled it. Same function as 0002 otherwise.

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

  -- shortcut: ignores series; a Series 2 migration must add a series filter or parameter.
  select count(*) into total from public.cards;

  select k.* into c from public.pulls p join public.cards k on k.id = p.card_id
  where p.user_id = uid and p.pulled_at >= lower(win)
  order by p.pulled_at desc limit 1;
  if found then
    return jsonb_build_object('status', 'wait', 'next_at', upper(win),
      'card',  jsonb_strip_nulls(to_jsonb(c) - 'series' - 'weight'),
      'owned', (select count(*) from public.pulls where user_id = uid),
      'total', total);
  end if;

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
