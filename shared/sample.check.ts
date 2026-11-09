// Fails if data/series1.sample.json drifts from types.ts. Run: node shared/sample.check.ts
import sample from '../data/series1.sample.json' with { type: 'json' }
import { TIERS, type Card, type Tier } from './types.ts'

// Compile time: every field and type except `tier` (JSON widens it to string).
type AnyTier<T> = T extends unknown ? Omit<T, 'tier'> & { tier: any } : never
const cards: Card[] = sample as AnyTier<(typeof sample)[number]>[]

const keys = {
  season: 'id number name tier position teams season games pts reb ast stl blk tov fp',
  legend: 'id number name tier position teams game date pts reb ast stl blk tov fp',
}
for (const c of cards) {
  const want = keys[c.tier === 'legend' ? 'legend' : 'season'].split(' ').sort().join(' ')
  const got = Object.keys(c).sort().join(' ')
  if (got !== want) throw new Error(`${c.id}: keys "${got}", want "${want}"`)
  if (!TIERS.includes(c.tier as Tier)) throw new Error(`${c.id}: bad tier ${c.tier}`)
  const fp = c.pts + c.reb * 1.2 + c.ast * 1.5 + c.stl * 3 + c.blk * 3 - c.tov
  if (Math.abs(fp - c.fp) > 0.051) throw new Error(`${c.id}: fp ${c.fp}, want ${fp.toFixed(1)}`)
}
if (new Set(cards.map(c => c.id)).size !== cards.length) throw new Error('duplicate id')
console.log(`ok: ${cards.length} sample cards match shared/types.ts`)
