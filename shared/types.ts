// Contract shared by the plugin (#6), web app (#7) and seed (#5).
// Change it only in a pull request of its own (see CONTRIBUTING.md).

export const TIERS = ['common', 'middle', 'top', 'legend'] as const
export type Tier = (typeof TIERS)[number]

type CardBase = {
  id: string // stable slug: s1-stephen-curry, s1-legend-lebron-james
  number: number // position in the set, shown as #023/155
  name: string
  position: string
  teams: string[] // all teams that season, e.g. ['SAC', 'IND']
  pts: number
  reb: number
  ast: number
  stl: number
  blk: number
  tov: number
  fp: number // PTS + REB×1.2 + AST×1.5 + STL×3 + BLK×3 − TOV
}

/** A player's best qualifying regular season (per-game stats). */
export type SeasonCard = CardBase & {
  tier: Exclude<Tier, 'legend'>
  season: string // '2015-16'
  games: number
}

/** One hand-picked game (box-score stats). */
export type LegendCard = CardBase & {
  tier: 'legend'
  game: string // '2016 Finals G7 at GSW'
  date: string // ISO date, '2016-06-19'
}

export type Card = SeasonCard | LegendCard

/** What pull_card() returns. Tell them apart with `'card' in result`. */
export type PullResult =
  | { card: Card; owned: number; total: number }
  | { status: 'set_complete'; total: number }
