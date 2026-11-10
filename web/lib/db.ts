import type { Card } from '../../shared/types'
import sample from '../../data/series1.sample.json'

// Publishable key: safe to ship, RLS makes every table read-only for clients.
const URL = process.env.SUPABASE_URL ?? 'https://taeiympniwgxcpynlbsh.supabase.co'
const KEY = process.env.SUPABASE_PUBLISHABLE_KEY ?? 'sb_publishable_MKquRgBdbxG1-XC7wmLBTA_2sJc0gHD'

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${URL}/rest/v1/${path}`, {
    headers: { apikey: KEY },
    next: { revalidate: 60 },
  })
  if (!res.ok) throw new Error(`Supabase ${res.status}: ${await res.text()}`)
  return res.json()
}

const COLS = 'id,number,name,tier,position,teams,season,games,game,date,pts,reb,ast,stl,blk,tov,fp'

/** Every card in the set with how many people pulled it, ordered by number. */
export async function cards(): Promise<(Card & { pulls: number })[]> {
  const rows = await get<(Card & { pulls: { count: number }[] })[]>(
    `cards?select=${COLS},pulls(count)&order=number`)
  // shortcut: an unseeded database shows the 5 sample cards; drop once #5 has seeded prod.
  if (rows.length === 0) return (sample as Card[]).map(c => ({ ...c, pulls: 0 })).sort((a, b) => a.number - b.number)
  return rows.map(r => ({ ...r, pulls: r.pulls[0]?.count ?? 0 }))
}

export type Profile = { public_id: string; github_login: string | null; owned: Set<string> }

export const VALID_ID = /^[A-Za-z0-9-]{1,39}$/

/** Profiles matching a public_id or GitHub login (one login can link several profiles). */
export async function profiles(id: string): Promise<Profile[]> {
  if (!VALID_ID.test(id)) return [] // keeps the id safe to put in the PostgREST filter
  const rows = await get<{ public_id: string; github_login: string | null; pulls: { card_id: string }[] }[]>(
    `profiles?select=public_id,github_login,pulls(card_id)&or=(public_id.eq.${id},github_login.ilike.${id})&order=created_at`)
  return rows.map(r => ({ ...r, owned: new Set(r.pulls.map(p => p.card_id)) }))
}
