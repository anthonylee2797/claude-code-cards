import Link from 'next/link'
import { redirect } from 'next/navigation'
import { TIERS } from '../../shared/types'
import { cards } from '../lib/db'
import { PACKS } from '../lib/packs'
import { CardTile } from './card'
import { Command } from './copy'

const REPO = 'anthonylee2797/claude-code-cards'

export default async function Home({ searchParams }: { searchParams: Promise<{ tier?: string }> }) {
  // The catalog used to live here; keep old /?tier= links working.
  const { tier } = await searchParams
  if (tier) redirect(`/series/${PACKS[0].slug}?tier=${encodeURIComponent(tier)}`)
  const all = await cards()
  // One card of each tier, rarest first, as a teaser.
  const teaser = [...TIERS].reverse().map(t => all.find(c => c.tier === t)).filter(c => c !== undefined)
  return (
    <>
      <section className="hero">
        <h1>An NBA card every time you start Claude Code.</h1>
        <p className="lede">
          A Claude Code plugin. Start a session and pull a card you don't own yet, up to 2 a day.
          Collect all {all.length} in the {PACKS[0].name}.
        </p>
        <div className="cta">
          <a href="#install" className="primary">Install the plugin</a>
          <Link href="/series">Browse the cards</Link>
        </div>
      </section>

      <section className="grid">
        {teaser.map(c => <CardTile key={c.id} card={c} total={all.length} />)}
      </section>

      <section id="install" className="install">
        <h2>Install</h2>
        <p>
          <b>Desktop app:</b> click <b>+</b> next to the prompt box, choose <b>Plugins</b>, then <b>Add marketplace</b> and
          enter <code>{REPO}</code>. Then choose <b>Add plugin</b> and pick <code>nba-cards</code>.
        </p>
        <p><b>Inside Claude Code</b> (desktop app or terminal):</p>
        <Command text={`/plugin marketplace add ${REPO}`} />
        <Command text="/plugin install nba-cards@claude-code-cards" />
        <p><b>From a shell:</b></p>
        <Command text={`claude plugin marketplace add ${REPO}`} />
        <Command text="claude plugin install nba-cards@claude-code-cards" />
        <p>Then start a new session. Your card shows above the prompt, with a link to your collection here.</p>
        <p className="muted">
          No account needed: the plugin signs you in anonymously. <a href={`https://github.com/${REPO}#privacy`}>Privacy</a> · <a href={`https://github.com/${REPO}`}>GitHub</a>
        </p>
      </section>
    </>
  )
}
