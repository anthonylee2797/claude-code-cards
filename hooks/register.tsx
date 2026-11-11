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
  return post($, '/rest/v1/rpc/pull_card', {}, session.access_token)
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

  on('prompt.submit', ($, e, next) => {
    isPromptSent = true
    $.ui.invalidate('ui.render')
    return next(e)
  })

  on('session.start', ($, e, next) => {
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

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    // total 0 means no cards seeded yet: nothing worth showing.
    if (!isShown || !pull || !pull.total || e.props.hasSurvey) return next(e)
    if (e.surface === 'terminal' && isPromptSent) return next(e)
    const below = await next(e)
    const { Box, Button, Text } = $.ui.resolve(e)
    if (e.surface === 'terminal') return <Box flexDirection="column">{pullLine($, e, pull)}{below}</Box>
    const hideButton = <Button key="hide" label="Hide" onPress={() => hide($)} />

    if (!('card' in pull)) {
      return (
        <Box flexDirection="column">
          <Box>
            <Text bold color="yellow">🏆 Set complete {pull.total}/{pull.total} </Text>
            {hideButton}
          </Box>
          {below}
        </Box>
      )
    }

    const { card, owned, total } = pull
    return (
      <Box flexDirection="column">
        {cardView($, e, card, total)}
        <Box>
          <Text bold color="green">NEW! </Text>
          <Text>{owned}/{total} collected </Text>
          {hideButton}
        </Box>
        {below}
      </Box>
    )
  })
}

// Pack-opening style: the rarer the pull, the louder the line (badge, stars, sparkles).
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
