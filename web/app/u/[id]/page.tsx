import { notFound } from 'next/navigation'
import { cards, profiles } from '../../../lib/db'
import { PACKS } from '../../../lib/packs'
import { PackTile } from '../../pack'

export default async function Collection({ params }: { params: Promise<{ id: string }> }) {
  const id = decodeURIComponent((await params).id)
  const [all, found] = await Promise.all([cards(), profiles(id)])
  if (found.length === 0) notFound()
  return found.map(p => (
    <section key={p.public_id}>
      <h1>
        {p.public_id}
        <small>{p.github_login && `@${p.github_login} · `}{p.owned.size} of {all.length} owned</small>
      </h1>
      <div className="packs">
        {PACKS.map(k => (
          <PackTile key={k.slug} href={`/u/${encodeURIComponent(p.public_id)}/${k.slug}`} name={k.name}
            line={`${p.owned.size} of ${all.length} owned`} />
        ))}
      </div>
    </section>
  ))
}
