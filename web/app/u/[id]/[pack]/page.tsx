import Link from 'next/link'
import { notFound } from 'next/navigation'
import { cards, profiles } from '../../../../lib/db'
import { pack } from '../../../../lib/packs'
import { CardTile } from '../../../card'

/** Only the cards this collector owns from one pack. */
export default async function OwnedCards({ params }: { params: Promise<{ id: string; pack: string }> }) {
  const { id: raw, pack: slug } = await params
  const id = decodeURIComponent(raw)
  const k = pack(slug)
  if (!k) notFound()
  const [all, found] = await Promise.all([cards(), profiles(id)])
  if (found.length === 0) notFound()
  return found.map(p => {
    const owned = all.filter(c => p.owned.has(c.id))
    return (
      <section key={p.public_id}>
        <p><Link href={`/u/${encodeURIComponent(p.public_id)}`}>← {p.public_id}</Link></p>
        <h1>
          {k.name}
          <small>{p.github_login && `@${p.github_login} · `}{owned.length} of {all.length} owned</small>
        </h1>
        {owned.length === 0
          ? <p className="lede">No cards from this pack yet. Start a Claude Code session to pull one.</p>
          : <div className="grid">{owned.map(c => <CardTile key={c.id} card={c} total={all.length} />)}</div>}
      </section>
    )
  })
}
