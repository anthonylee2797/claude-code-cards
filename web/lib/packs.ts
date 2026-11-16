// shortcut: one pack holds every card; give cards a pack (schema change) when a second pack ships.
export const PACKS = [{ slug: 'beta-nba', name: 'BETA NBA Pack' }]

export const pack = (slug: string) => PACKS.find(p => p.slug === slug)
