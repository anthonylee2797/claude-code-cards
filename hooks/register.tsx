import type { EngineInterface, Register } from 'claude-code'

import type { Card, PullResult, Tier } from '../shared/types'

// Only the publishable key belongs here: RLS lets it read, and pull_card() is the only write.
const SUPABASE_URL = 'https://taeiympniwgxcpynlbsh.supabase.co'
const PUBLISHABLE_KEY = 'sb_publishable_MKquRgBdbxG1-XC7wmLBTA_2sJc0gHD'
const TOKEN_KEY = 'refreshToken'

const TIERS: Record<Tier, { label: string; color: string }> = {
  common: { label: 'SILVER', color: 'gray' },
  middle: { label: 'GOLD', color: 'yellow' },
  top: { label: 'ALL-STAR', color: 'cyan' },
  legend: { label: 'ALL-TIME LEGEND', color: 'magenta' },
}

let isShown = true
// The terminal shows the pull as one line until the first prompt; the desktop keeps its card until Hide.
let isPromptSent = false
let pull: PullResult | null = null
// shortcut: the access token expires after an hour, so /collection fails in longer sessions; refresh on 401 if users hit it.
let auth: { token: string; userId: string } | null = null
type Owned = Pick<Card, 'number' | 'name' | 'tier'>
let owned: Owned[] = []
const PANE = 'collection'

async function post($: EngineInterface, path: string, body: unknown, token?: string) {
  const headers: Record<string, string> = { apikey: PUBLISHABLE_KEY, 'content-type': 'application/json' }
  if (token) headers.authorization = `Bearer ${token}`
  const res = await $.http.fetch(SUPABASE_URL + path, { method: 'POST', headers, body: JSON.stringify(body) })
  if (!res.ok) throw new Error(`${path}: ${res.status}`)
  return JSON.parse(res.text)
}

/** Signs in (anonymously the first time, by refresh token after) and pulls one card. */
export async function pullCard($: EngineInterface): Promise<PullResult> {
  const saved = await $.store.get(TOKEN_KEY)
  // shortcut: a refresh token the server has revoked stays stuck (no new sign-up, so the collection is never orphaned silently); add a reset command if users hit it.
  const session = typeof saved === 'string'
    ? await post($, '/auth/v1/token?grant_type=refresh_token', { refresh_token: saved })
    : await post($, '/auth/v1/signup', {})
  // Refresh tokens rotate: save the new one before anything else can fail.
  await $.store.set(TOKEN_KEY, session.refresh_token)
  auth = { token: session.access_token, userId: session.user?.id }
  return post($, '/rest/v1/rpc/pull_card', {}, session.access_token)
}

/** This user's cards, read with their own token (RLS lets clients read pulls, never write). */
async function ownedCards($: EngineInterface, { token, userId }: NonNullable<typeof auth>): Promise<Owned[]> {
  const res = await $.http.fetch(`${SUPABASE_URL}/rest/v1/pulls?select=cards(number,name,tier)&user_id=eq.${userId}`, {
    headers: { apikey: PUBLISHABLE_KEY, authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error(`pulls: ${res.status}`)
  return (JSON.parse(res.text) as { cards: Owned }[]).map(r => r.cards).sort((a, b) => a.number - b.number)
}

function hide($: EngineInterface) {
  isShown = false
  $.ui.invalidate('ui.render')
}

const pad = (n: number) => String(n).padStart(3, '0')

export const register: Register = on => {
  isShown = true
  isPromptSent = false
  pull = null
  auth = null
  owned = []

  on('prompt.submit', ($, e, next) => {
    isPromptSent = true
    $.ui.invalidate('ui.render')
    return next(e)
  }).catch(($, e, next) => next(e)) // a throw here must never block the prompt

  on('session.start', async ($, e, next) => {
    await $.command.register({ name: 'card', description: 'Show the card you pulled this session' })
    await $.command.register({ name: 'collection', description: 'List the cards you own' })
    // Offline, Supabase down, sign-ins off: stay silent, the band just never shows.
    pullCard($).then(
      result => {
        pull = result
        $.ui.invalidate('ui.render')
      },
      () => {},
    )
    return next(e)
  })

  on('command.run', { command: 'card' }, () => {
    if (!pull) return { text: 'No card pulled yet this session.' }
    if (!('card' in pull)) return { text: `Set complete ${pull.total}/${pull.total}` }
    const { card, total } = pull
    return { text: `${TIERS[card.tier].label} #${pad(card.number)}/${total} ${card.name}` }
  })

  // The text above stays the row's fallback; every surface that draws this gets the full card.
  on('ui.render', { component: 'CommandOutput', props: { command: 'card' } }, ($, e, next) =>
    pull && 'card' in pull ? cardView($, e, pull.card, pull.total) : next(e))

  on('command.run', { command: 'collection' }, async $ => {
    if (!auth) return { text: 'Not signed in to the card server this session.' }
    try {
      owned = await ownedCards($, auth)
    } catch {
      return { text: 'Could not load your collection.' }
    }
    $.ui.invalidate('ui.render')
    await $.ui.open({ id: PANE, title: 'Collection' })
    return { text: `Collection: ${owned.length} cards.` }
  })

  // Long lists page by the pane's own scrolling (the engine moves its window over the body).
  on('ui.render', { component: 'Pane', requestId: PANE }, ($, e) => {
    const { Box, Text } = $.ui.resolve(e)
    return (
      <Box flexDirection="column">
        <Text bold>{owned.length}{pull ? `/${pull.total}` : ''} collected</Text>
        {owned.map(c => (
          <Box key={c.number}>
            <Text bold color="black" backgroundColor={TIERS[c.tier].color}> {TIERS[c.tier].label} </Text>
            <Text dimColor> #{pad(c.number)} </Text>
            <Text>{c.name}</Text>
          </Box>
        ))}
      </Box>
    )
  })

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    // total 0 means no cards seeded yet: nothing worth showing.
    if (!isShown || !pull || !pull.total || e.props.hasSurvey) return next(e)
    if (e.surface === 'terminal' && isPromptSent) return next(e)
    const below = await next(e)
    const { Box, Button, Text } = $.ui.resolve(e)
    const hideButton = <Button key="hide" label="Hide" onPress={() => hide($)} />
    // The plugin version sits at the right end of the pull's row.
    const row = (...left: unknown[]) => (
      <Box justifyContent="space-between"><Box>{left}</Box><Text dimColor>v{VERSION}</Text></Box>
    )
    if (e.surface === 'terminal') return <Box flexDirection="column">{row(pullLine($, e, pull))}{below}</Box>

    if (!('card' in pull)) {
      return (
        <Box flexDirection="column">
          {row(<Text key="t" bold color="yellow">🏆 Set complete {pull.total}/{pull.total} </Text>, hideButton)}
          {below}
        </Box>
      )
    }

    const { card, owned, total } = pull
    return (
      <Box flexDirection="column">
        {cardView($, e, card, total)}
        {row(
          <Text key="n" bold color="green">NEW! </Text>,
          <Text key="c">{owned}/{total} collected </Text>,
          hideButton,
        )}
        {below}
      </Box>
    )
  })
}

// Pack-opening style: the rarer the pull, the louder the line (badge, stars, sparkles).
// shortcut: bump together with .claude-plugin/plugin.json (modules can't import JSON); read the manifest if the API ever exposes it.
export const VERSION = '0.6.1'

const STARS: Record<Tier, string> = { common: '★', middle: '★★', top: '★★★', legend: '★★★★' }

function pullLine($: EngineInterface, e: Parameters<EngineInterface['ui']['resolve']>[0], pull: PullResult) {
  const { Box, Text } = $.ui.resolve(e)
  if (!('card' in pull)) return <Text bold color="yellow">🏆 Set complete {pull.total}/{pull.total}</Text>
  const { card, owned, total } = pull
  const tier = TIERS[card.tier]
  const isRare = card.tier === 'top' || card.tier === 'legend'
  const filled = Math.ceil((owned / total) * 10)
  return (
    <Box>
      {card.tier === 'legend' && <Text color={tier.color}>✦ ✧ ✦ </Text>}
      <Text dimColor>You pulled </Text>
      <Text bold color="black" backgroundColor={tier.color}> {tier.label} </Text>
      <Text color={tier.color}> {STARS[card.tier]} </Text>
      <Text dimColor>#{pad(card.number)} </Text>
      {isRare && <Text color={tier.color}>✦ </Text>}
      <Text bold color={card.tier === 'common' ? undefined : tier.color}>{card.name}</Text>
      {isRare && <Text color={tier.color}> ✦</Text>}
      <Text dimColor> {card.tier === 'legend' ? card.game : `${card.position} · ${card.teams.join('/')}`}  </Text>
      <Text bold color="black" backgroundColor="green"> NEW </Text>
      <Text dimColor> {owned}/{total} </Text>
      <Text color="green">{'▰'.repeat(filled)}</Text>
      <Text dimColor>{'▱'.repeat(10 - filled)}</Text>
    </Box>
  )
}

function cardView($: EngineInterface, e: Parameters<EngineInterface['ui']['resolve']>[0], card: Card, total: number) {
  const { Box, Text } = $.ui.resolve(e)
  const tier = TIERS[card.tier]
  const when = card.tier === 'legend' ? `${card.game} · ${card.date}` : `${card.season} · ${card.games} G`
  const stats: [string, number][] = [
    ['PTS', card.pts], ['REB', card.reb], ['AST', card.ast], ['STL', card.stl], ['BLK', card.blk], ['FP', card.fp],
  ]
  return (
    <Box borderStyle={card.tier === 'legend' ? 'double' : 'round'} borderColor={tier.color} paddingX={1} flexDirection="column">
      <Box>
        <Text bold color={tier.color}>{tier.label} </Text>
        <Text dimColor>#{pad(card.number)}/{total} </Text>
        <Text bold>{card.name}</Text>
      </Box>
      <Text dimColor>{card.position} · {card.teams.join('/')} · {when}</Text>
      <Box>
        {stats.map(([k, v]) => (
          <Box key={k}>
            <Text dimColor>{k} </Text>
            <Text bold>{v}  </Text>
          </Box>
        ))}
      </Box>
    </Box>
  )
}
