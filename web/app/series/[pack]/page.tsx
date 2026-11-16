import Link from 'next/link'
import { notFound } from 'next/navigation'
import { TIERS, type Tier } from '../../../../shared/types'
import { cards, collectors } from '../../../lib/db'
import { pack } from '../../../lib/packs'
import { CardTile } from '../../card'

// "9,000 pulled · 2% of collectors"; a tiny share reads "<1%" rather than "0%".
function pulledLine(pulls: number, people: number) {
  if (pulls === 0 || people === 0) return 'Not pulled yet'
  const pct = (pulls / people) * 100
  return `${pulls.toLocaleString('en-US')} pulled · ${pct < 1 ? '<1' : Math.round(pct)}% of collectors`
}

export default async function Pack({ params, searchParams }: {
  params: Promise<{ pack: string }>; searchParams: Promise<{ tier?: string }>
}) {
  const p = pack((await params).pack)
  if (!p) notFound()
  const { tier } = await searchParams
  const [all, people] = await Promise.all([cards(), collectors()])
  const active = TIERS.find(t => t === tier)
  const shown = active ? all.filter(c => c.tier === active) : all
  const count = (t: Tier) => all.filter(c => c.tier === t).length
  const base = `/series/${p.slug}`
  return (
    <>
      <h1>{p.name}</h1>
      <p className="lede">{all.length} cards. One pulled at the start of every Claude Code session.</p>
      <nav className="tiers" aria-label="Filter by tier">
        <Link href={base} aria-current={!active ? 'page' : undefined}>All<span>{all.length}</span></Link>
        {TIERS.map(t => (
          <Link key={t} href={`${base}?tier=${t}`} aria-current={active === t ? 'page' : undefined}>
            {t}<span>{count(t)}</span>
          </Link>
        ))}
      </nav>
      <section className="grid">
        {shown.map(c => (
          <CardTile key={c.id} card={c} total={all.length}
            footer={pulledLine(c.pulls, people)} />
        ))}
      </section>
    </>
  )
}
