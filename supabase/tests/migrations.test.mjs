import { PGlite } from '@electric-sql/pglite'
import { readFileSync, readdirSync } from 'node:fs'
// Runs every migration against an in-memory Postgres with a stub of Supabase's auth schema.
// Run: npm i --no-save @electric-sql/pglite@0.2.17 && node supabase/tests/migrations.test.mjs
const root = new URL('../../', import.meta.url)
const sample = new URL('data/series1.sample.json', root)
const db = new PGlite()
// Stub of what Supabase provides.
await db.exec(`
  create role anon; create role authenticated;
  create schema auth;
  create table auth.users (id uuid primary key);
  create function auth.uid() returns uuid language sql stable as
    $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
  grant usage on schema auth, public to anon, authenticated;
  alter default privileges in schema public grant all on tables to anon, authenticated;
  alter default privileges in schema public grant all on functions to anon, authenticated;`)
for (const f of readdirSync(new URL('supabase/migrations/', root)).sort()) await db.exec(readFileSync(new URL('supabase/migrations/' + f, root), 'utf8'))
const cards = JSON.parse(readFileSync(sample, 'utf8'))
for (const c of cards) {
  const cols = Object.keys(c)
  await db.query(`insert into public.cards (${cols.join(',')}) values (${cols.map((_, i) => '$' + (i + 1))})`, Object.values(c))
}
const assert = (ok, msg) => { if (!ok) { console.error('FAIL', msg); process.exit(1) } }
const uid = '00000000-0000-0000-0000-000000000001'
await db.query(`insert into auth.users values ($1)`, [uid])
const prof = (await db.query(`select public_id from public.profiles`)).rows
assert(prof.length === 1 && /^hoop-[0-9a-z]{4}$/.test(prof[0].public_id), 'profile created ' + JSON.stringify(prof))

await db.exec(`set role authenticated; select set_config('request.jwt.claim.sub', '${uid}', false)`)
const seen = new Set()
for (let i = 1; i <= cards.length; i++) {
  const r = (await db.query(`select public.pull_card() r`)).rows[0].r
  assert(r.owned === i && r.total === cards.length && !seen.has(r.card.id), 'pull ' + JSON.stringify(r))
  const want = cards.find(c => c.id === r.card.id)
  assert(JSON.stringify(Object.keys(r.card).sort()) === JSON.stringify(Object.keys(want).sort()), 'card keys ' + JSON.stringify(r.card))
  assert(r.card.fp === want.fp && r.card.teams.join() === want.teams.join(), 'card values')
  seen.add(r.card.id)
}
const done = (await db.query(`select public.pull_card() r`)).rows[0].r
assert(done.status === 'set_complete' && done.total === cards.length, 'complete ' + JSON.stringify(done))
// Clients cannot write.
for (const sql of [`insert into public.pulls values ('${uid}', 's1-stephen-curry')`, `delete from public.pulls`, `update public.cards set tier = 'top'`]) {
  const n = await db.query(sql).then(r => r.affectedRows ?? 0, () => 0)
  assert(n === 0, 'client write allowed: ' + sql)
}
await db.exec(`set role anon`)
assert((await db.query(`select count(*)::int n from public.pulls`)).rows[0].n === cards.length, 'anon can read')
assert(await db.query(`select public.pull_card()`).then(() => false, () => true), 'anon cannot pull')
console.log('ok: profile, 5 distinct pulls, set_complete, no client writes, anon read-only')
