import type { On } from 'claude-code'
import { expect, test } from 'claude-code/testing'

import type { Card } from '../shared/types'

// From data/series1.sample.json.
const CURRY: Card = { id: 's1-stephen-curry', number: 23, name: 'Stephen Curry', tier: 'top',
  position: 'PG', teams: ['GSW'], season: '2015-16', games: 79,
  pts: 30.1, reb: 5.4, ast: 6.7, stl: 2.1, blk: 0.2, tov: 3.3, fp: 50.2 }
const LEBRON: Card = { id: 's1-legend-lebron-james', number: 151, name: 'LeBron James', tier: 'legend',
  position: 'SF', teams: ['CLE'], game: '2016 Finals G7 at GSW', date: '2016-06-19',
  pts: 27, reb: 11, ast: 11, stl: 2, blk: 3, tov: 5, fp: 66.7 }

const BAND = { plugin: 'nba-cards', component: 'AbovePrompt', props: {
  hasSurvey: false, isCollapsed: false, isWorking: false, maxRows: 20, bodyColumns: 80,
  scroll: { offset: 0, bodyRows: 20 }, view: {},
} } as const
const SURFACES = ['terminal', 'desktop'] as const
// The pull runs in the background after session.start; let the mocked fetches resolve.
const settle = async () => { for (let i = 0; i < 100; i++) await Promise.resolve() }

// A store in memory whose contents the test can read back.
function store(on: On, entries: Record<string, unknown> = {}) {
  on('store.get', (_, e) => ({ value: entries[e.key] }))
  on('store.set', (_, e) => { entries[e.key] = e.value; return { value: undefined } })
  return entries
}

// What the engine answers beneath the plugin: session start, and its own prompt drawing.
function engine(on: On) {
  on('session.start', (_, e) => ({ cwd: e.cwd }))
  on('ui.render', ($, e) => { const { Text } = $.ui.resolve(e); return <Text>engine</Text> })
}

const ok = (body: unknown) => ({ value: { status: 200, ok: true, headers: {}, text: JSON.stringify(body) } })

test('first session signs up, saves the token and shows the card', async ($, on) => {
  const saved = store(on)
  const calls: string[] = []
  on('http.fetch', (_, e) => {
    calls.push(e.url.replace(/^https:\/\/[^/]+/, '') + ' ' + (e.init?.headers?.authorization ?? ''))
    if (e.url.includes('/auth/v1/signup')) return ok({ access_token: 'a1', refresh_token: 'r1' })
    return ok({ card: CURRY, owned: 47, total: 155 })
  })
  engine(on)
  await $.session.start({ cwd: '/', surface: 'terminal', isInteractive: true })
  await settle()

  expect(calls).toEqual(['/auth/v1/signup ', '/rest/v1/rpc/pull_card Bearer a1'])
  expect(saved.refreshToken).toBe('r1')
  for (const surface of SURFACES) {
    const ui = await $.ui.mount({ ...BAND, surface })
    expect((await ui.find({ type: 'Text', text: /Stephen Curry/ }))?.text).toBe('Stephen Curry')
    expect(await ui.find({ type: 'Text', text: /#023\/155/ })).toBeDefined()
    expect(await ui.find({ type: 'Text', text: /47\/155 collected/ })).toBeDefined()
    await ui.unmount()
  }
})

test('later sessions refresh the saved token, legends show the game line', async ($, on) => {
  const saved = store(on, { refreshToken: 'r1' })
  on('http.fetch', (_, e) => {
    if (e.url.includes('/auth/v1/signup')) throw new Error('should not sign up again')
    if (e.url.includes('grant_type=refresh_token')) return ok({ access_token: 'a2', refresh_token: 'r2' })
    return ok({ card: LEBRON, owned: 48, total: 155 })
  })
  engine(on)
  await $.session.start({ cwd: '/', surface: 'desktop', isInteractive: true })
  await settle()

  expect(saved.refreshToken).toBe('r2')
  const ui = await $.ui.mount({ ...BAND, surface: 'desktop' })
  expect(await ui.find({ type: 'Text', text: /2016 Finals G7 at GSW/ })).toBeDefined()
  await ui.unmount()
})

test('set complete', async ($, on) => {
  const saved = store(on, { refreshToken: 'r1' })
  on('http.fetch', (_, e) =>
    ok(e.url.includes('pull_card') ? { status: 'set_complete', total: 155 } : { access_token: 'a', refresh_token: 'r' }))
  engine(on)
  await $.session.start({ cwd: '/', surface: 'terminal', isInteractive: true })
  await settle()

  const ui = await $.ui.mount({ ...BAND, surface: 'terminal' })
  expect(await ui.find({ type: 'Text', text: /Set complete 155\/155/ })).toBeDefined()
  await ui.unmount()
})

test('offline or sign-ins off: nothing shows', async ($, on) => {
  const saved = store(on)
  on('http.fetch', () => ({ value: { status: 422, ok: false, headers: {}, text: '{}' } }))
  engine(on)
  await $.session.start({ cwd: '/', surface: 'terminal', isInteractive: true })
  await settle()

  expect(saved.refreshToken).toBeUndefined()
  const ui = await $.ui.mount({ ...BAND, surface: 'terminal' })
  expect((await ui.find({ type: 'Text' }))?.text).toBe('engine')
  await ui.unmount()
})

test('the card stays after a prompt is sent', async ($, on) => {
  store(on, { refreshToken: 'r1' })
  on('http.fetch', (_, e) =>
    ok(e.url.includes('pull_card') ? { card: CURRY, owned: 3, total: 155 } : { access_token: 'a', refresh_token: 'r' }))
  engine(on)
  on('prompt.submit', (_, e) => ({ text: e.text }))
  await $.session.start({ cwd: '/', surface: 'terminal', isInteractive: true })
  await settle()
  await $.prompt.submit({ text: 'test' })

  const ui = await $.ui.mount({ ...BAND, surface: 'terminal' })
  expect(await ui.find({ type: 'Text', text: /Stephen Curry/ })).toBeDefined()
  await ui.unmount()
})
