import Link from 'next/link'
import { TIERS, type Tier } from '../../shared/types'
import { cards } from '../lib/db'
import { CardTile } from './card'

export default async function Home({ searchParams }: { searchParams: Promise<{ tier?: string }> }) {
  const { tier } = await searchParams
  const all = await cards()
  const active = TIERS.find(t => t === tier)
  const shown = active ? all.filter(c => c.tier === active) : all
  const count = (t: Tier) => all.filter(c => c.tier === t).length
  return (
    <>
      <h1>Series 1</h1>
      <p className="lede">{all.length} cards. One pulled at the start of every Claude Code session.</p>
      <nav className="tiers" aria-label="Filter by tier">
        <Link href="/" aria-current={!active ? 'page' : undefined}>All<span>{all.length}</span></Link>
        {TIERS.map(t => (
          <Link key={t} href={`/?tier=${t}`} aria-current={active === t ? 'page' : undefined}>
            {t}<span>{count(t)}</span>
          </Link>
        ))}
      </nav>
      <section className="grid">
        {shown.map(c => (
          <CardTile key={c.id} card={c} total={all.length}
            footer={c.pulls === 0 ? 'Not pulled yet' : `In ${c.pulls} ${c.pulls === 1 ? 'collection' : 'collections'}`} />
        ))}
      </section>
    </>
  )
}
