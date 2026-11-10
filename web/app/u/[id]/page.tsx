import { notFound } from 'next/navigation'
import { cards, profiles } from '../../../lib/db'
import { CardTile } from '../../card'

export default async function Collection({ params }: { params: Promise<{ id: string }> }) {
  const id = decodeURIComponent((await params).id)
  const [all, found] = await Promise.all([cards(), profiles(id)])
  if (found.length === 0) notFound()
  return found.map(p => (
    <section key={p.public_id}>
      <h1>
        {p.public_id}
        {p.github_login && <small> · @{p.github_login}</small>}
        <small> · {p.owned.size}/{all.length} owned</small>
      </h1>
      <div className="grid">
        {all.map(c => <CardTile key={c.id} card={c} total={all.length} locked={!p.owned.has(c.id)} />)}
      </div>
    </section>
  ))
}
