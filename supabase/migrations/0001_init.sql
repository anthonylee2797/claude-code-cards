-- Series 1 contract: final tables, RLS, sign-up trigger and pull_card().
-- Never edit this file once merged; add a new migration instead.

-- Cards: written only by the seed script (service role). Columns mirror shared/types.ts Card.
create table public.cards (
  id        text primary key,               -- stable slug: s1-stephen-curry
  number    int not null,
  series    int not null default 1,
  tier      text not null check (tier in ('common', 'middle', 'top', 'legend')),
  weight    double precision not null generated always as (
              case tier when 'common' then 0.76 when 'middle' then 0.50
                        when 'top' then 0.27 else 0.20 end) stored,
  name      text not null,
  position  text not null,
  teams     text[] not null,
  season    text,                           -- season cards
  games     int,
  game      text,                           -- legend cards
  date      date,
  pts numeric(4,1) not null, reb numeric(4,1) not null, ast numeric(4,1) not null,
  stl numeric(4,1) not null, blk numeric(4,1) not null, tov numeric(4,1) not null,
  fp  numeric(4,1) not null,
  check (case when tier = 'legend'
              then game is not null and date is not null and season is null and games is null
              else season is not null and games is not null and game is null and date is null end)
);

-- Profiles: one per auth user, created by the trigger below.
create table public.profiles (
  user_id      uuid primary key references auth.users (id) on delete cascade,
  public_id    text not null unique,         -- hoop-7k2f
  github_id    bigint unique,
  github_login text,
  created_at   timestamptz not null default now()
);

-- Pulls: written only by pull_card(). The primary key is the no-duplicates rule.
create table public.pulls (
  user_id   uuid not null references public.profiles (user_id) on delete cascade,
  card_id   text not null references public.cards (id),
  pulled_at timestamptz not null default now(),
  primary key (user_id, card_id)
);
create index pulls_card_id_idx on public.pulls (card_id);

-- Everyone can read; no insert/update/delete policies, so clients cannot write.
alter table public.cards    enable row level security;
alter table public.profiles enable row level security;
alter table public.pulls    enable row level security;
create policy "cards are public"    on public.cards    for select to anon, authenticated using (true);
create policy "profiles are public" on public.profiles for select to anon, authenticated using (true);
create policy "pulls are public"    on public.pulls    for select to anon, authenticated using (true);

-- Sign-up trigger: give every new auth user (anonymous included) a profile.
create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  alphabet constant text := '0123456789abcdefghijklmnopqrstuvwxyz';
begin
  for attempt in 1..10 loop
    begin
      insert into public.profiles (user_id, public_id)
      select new.id, 'hoop-' || string_agg(substr(alphabet, 1 + floor(random() * 36)::int, 1), '')
      from generate_series(1, 4);
      return new;
    exception when unique_violation then
      if attempt = 10 then raise; end if;  -- public_id collision: retry with a new one
    end;
  end loop;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- pull_card(): give the caller one card they don't own yet, weighted by tier.
-- Returns { card, owned, total } or { status: 'set_complete', total } (shared/types.ts PullResult).
create function public.pull_card() returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  uid   uuid := auth.uid();
  c     public.cards;
  total int;
begin
  if uid is null then
    raise exception 'pull_card: not signed in' using errcode = '28000';
  end if;
  -- One pull at a time per user, so parallel session starts can't race.
  perform pg_advisory_xact_lock(hashtextextended(uid::text, 0));

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

revoke execute on function public.pull_card() from public, anon;
grant execute on function public.pull_card() to authenticated;
revoke execute on function public.handle_new_user() from public, anon, authenticated;
