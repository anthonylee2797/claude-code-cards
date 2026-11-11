// Builds data/series1.json from Basketball-Reference per-game pages. Run: node data/build.mjs
// Pages are fetched once into data/.cache/ (git-ignored); later runs only read the cache.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'

const dir = new URL('.', import.meta.url)
const cache = new URL('.cache/', dir)
const YEARS = [2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025] // season end year
const fpOf = s => s.pts + s.reb * 1.2 + s.ast * 1.5 + s.stl * 3 + s.blk * 3 - s.tov
const r1 = x => Math.round(x * 10) / 10

// Box scores checked by hand on Basketball-Reference (links in the PR). Position and team come from that season's row.
const LEGENDS = [
  { pid: 'jamesle01', year: 2016, game: '2016 Finals G7 at GSW', date: '2016-06-19', pts: 27, reb: 11, ast: 11, stl: 2, blk: 3, tov: 5 },
  { pid: 'curryst01', year: 2016, game: 'Regular season at OKC', date: '2016-02-27', pts: 46, reb: 3, ast: 6, stl: 2, blk: 0, tov: 3 },
  { pid: 'duranke01', year: 2017, game: '2017 Finals G3 at CLE', date: '2017-06-07', pts: 31, reb: 9, ast: 4, stl: 1, blk: 1, tov: 3 },
  { pid: 'antetgi01', year: 2021, game: '2021 Finals G6 vs PHX', date: '2021-07-20', pts: 50, reb: 14, ast: 2, stl: 0, blk: 5, tov: 6 },
  { pid: 'leonaka01', year: 2019, game: '2019 ECSF G7 vs PHI', date: '2019-05-12', pts: 41, reb: 8, ast: 3, stl: 3, blk: 0, tov: 4 },
]

async function page(year) {
  const file = new URL(`NBA_${year}_per_game.html`, cache)
  if (!existsSync(file)) {
    mkdirSync(cache, { recursive: true })
    await new Promise(r => setTimeout(r, 6000)) // be polite: BR allows ~20 requests/min
    const res = await fetch(`https://www.basketball-reference.com/leagues/NBA_${year}_per_game.html`)
    if (!res.ok) throw new Error(`NBA_${year}: HTTP ${res.status}`)
    writeFileSync(file, await res.text())
  }
  return readFileSync(file, 'utf8')
}

// One entry per player: the first row is the season (or combined "2TM" row), later rows add each team.
function parse(page, year) {
  const html = page.match(/id="per_game_stats"(.*?)<\/table>/s)?.[1] ?? '' // regular season only; the page also has a playoffs table
  const players = new Map()
  for (const [row] of html.matchAll(/<tr[^>]*>(?:(?!<\/tr>).)*data-append-csv="[^"]+"(?:(?!<\/tr>).)*<\/tr>/gs)) {
    const cell = k => row.match(new RegExp(`data-stat="${k}"[^>]*>(?:<a[^>]*>)?([^<]*)`))?.[1]
    const pid = row.match(/data-append-csv="([^"]+)"/)[1]
    const team = cell('team_name_abbr')
    const p = players.get(pid)
    if (p) { if (!/^\dTM$/.test(team)) p.teams.push(team); continue }
    const n = k => Number(cell(k) || 0)
    const exact = k => Number(row.match(new RegExp(`data-stat="${k}" csk="([^"]+)"`))?.[1] ?? n(k))
    players.set(pid, {
      pid, name: cell('name_display'), position: cell('pos'), teams: /^\dTM$/.test(team) ? [] : [team],
      season: `${year - 1}-${String(year).slice(2)}`, year, games: n('games'),
      pts: n('pts_per_g'), reb: n('trb_per_g'), ast: n('ast_per_g'), stl: n('stl_per_g'), blk: n('blk_per_g'), tov: n('tov_per_g'),
      score: fpOf({ pts: exact('pts_per_g'), reb: exact('trb_per_g'), ast: exact('ast_per_g'), stl: exact('stl_per_g'), blk: exact('blk_per_g'), tov: exact('tov_per_g') }),
    })
  }
  if (players.size < 400) throw new Error(`NBA_${year}: only ${players.size} players parsed`)
  return players
}

const seasons = new Map(YEARS.map(y => [y, null]))
for (const y of YEARS) seasons.set(y, parse(await page(y), y))

// Best qualifying season per player (50+ games; later season wins a tie since years run ascending).
const best = new Map()
for (const players of seasons.values())
  for (const s of players.values()) {
    if (s.games < 50) continue
    s.fp = r1(fpOf(s)) // ranked on the fp the card shows (its rounded stats); the unrounded score breaks player ties
    if (!best.has(s.pid) || s.fp >= best.get(s.pid).fp) best.set(s.pid, s) // years ascend, so a tie goes to the later season
  }

const ranked = [...best.values()].sort((a, b) => b.fp - a.fp || b.score - a.score)
const cut = s => `${s.name} ${s.fp} (${s.score.toFixed(2)})`
console.log(`#150 ${cut(ranked[149])}, first out: ${cut(ranked[150])}`)
const slug = name => name.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

const cards = ranked.slice(0, 150).map((s, i) => ({
  id: `s1-${slug(s.name)}`, number: i + 1, name: s.name, tier: i < 15 ? 'top' : i < 45 ? 'middle' : 'common',
  position: s.position, teams: s.teams, season: s.season, games: s.games,
  pts: s.pts, reb: s.reb, ast: s.ast, stl: s.stl, blk: s.blk, tov: s.tov, fp: s.fp,
}))
LEGENDS.forEach(({ pid, year, ...g }, i) => {
  const s = seasons.get(year).get(pid)
  if (!s) throw new Error(`legend ${pid} not found in ${year}`)
  cards.push({
    id: `s1-legend-${slug(s.name)}`, number: 151 + i, name: s.name, tier: 'legend', position: s.position, teams: s.teams,
    game: g.game, date: g.date, pts: g.pts, reb: g.reb, ast: g.ast, stl: g.stl, blk: g.blk, tov: g.tov, fp: r1(fpOf(g)),
  })
})

// Same checks as shared/sample.check.ts, plus the set rules.
const keys = {
  season: 'id number name tier position teams season games pts reb ast stl blk tov fp',
  legend: 'id number name tier position teams game date pts reb ast stl blk tov fp',
}
const assert = (ok, msg) => { if (!ok) throw new Error(msg) }
for (const c of cards) {
  const want = keys[c.tier === 'legend' ? 'legend' : 'season'].split(' ').sort().join(' ')
  assert(Object.keys(c).sort().join(' ') === want, `${c.id}: wrong keys`)
  assert(Math.abs(fpOf(c) - c.fp) <= 0.051, `${c.id}: fp ${c.fp}, want ${fpOf(c).toFixed(1)}`)
  assert(c.name && c.position && c.teams.length && c.teams.every(t => /^[A-Z]{3}$/.test(t)), `${c.id}: missing name/position/teams`)
  assert(c.tier === 'legend' ? /^\d{4}-\d\d-\d\d$/.test(c.date) : c.games >= 50, `${c.id}: bad date/games`)
}
const count = t => cards.filter(c => c.tier === t).length
assert(cards.length === 155, `${cards.length} cards`)
assert(new Set(cards.map(c => c.id)).size === 155, 'duplicate id')
assert(cards.every((c, i) => c.number === i + 1), 'numbers not 1-155')
assert(count('common') === 105 && count('middle') === 30 && count('top') === 15 && count('legend') === 5, 'tier counts')

writeFileSync(new URL('series1.json', dir), '[\n' + cards.map(c => '  ' + JSON.stringify(c)).join(',\n') + '\n]\n')
console.log(`ok: wrote data/series1.json (${cards.length} cards)`)
