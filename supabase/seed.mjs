import { existsSync, readFileSync } from 'node:fs'
// Upserts the Series 1 cards into Supabase by id. Run: node supabase/seed.mjs
// Needs SUPABASE_SERVICE_ROLE_KEY (and optionally SUPABASE_URL) in the repo's .env. Never commit it.
const root = new URL('../', import.meta.url)

// data/series1.json once #4 lands, else the 5-card sample. weight is a generated column, so never send it.
export function loadCards() {
  const full = new URL('data/series1.json', root)
  const file = existsSync(full) ? full : new URL('data/series1.sample.json', root)
  const cards = JSON.parse(readFileSync(file, 'utf8')).map(({ weight, ...c }) => c)
  const ids = new Set(cards.map(c => c.id))
  if (ids.size !== cards.length) throw new Error(`duplicate card ids in ${file.pathname}`)
  return { file: file.pathname.split('/').pop(), cards }
}

if (import.meta.main) {
  const env = new URL('.env', root)
  if (existsSync(env)) process.loadEnvFile(env)
  const url = process.env.SUPABASE_URL ?? 'https://taeiympniwgxcpynlbsh.supabase.co'
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!key) { console.error('Set SUPABASE_SERVICE_ROLE_KEY in .env'); process.exit(1) }
  const { file, cards } = loadCards()
  // Season and legend cards have different keys; list them all so missing ones are written as null.
  const columns = [...new Set(cards.flatMap(Object.keys))].join(',')
  const res = await fetch(`${url}/rest/v1/cards?on_conflict=id&columns=${columns}`, {
    method: 'POST',
    headers: {
      apikey: key,
      // Legacy service_role keys are JWTs and also go in Authorization; new sb_secret_ keys only in apikey.
      ...(key.startsWith('eyJ') && { Authorization: `Bearer ${key}` }),
      'Content-Type': 'application/json',
      Prefer: 'resolution=merge-duplicates,return=minimal',
    },
    body: JSON.stringify(cards),
  })
  if (!res.ok) { console.error(`seed failed: ${res.status} ${await res.text()}`); process.exit(1) }
  console.log(`upserted ${cards.length} cards from ${file} into ${url}`)
}
