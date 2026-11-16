import { cards } from '../../lib/db'
import { PACKS } from '../../lib/packs'
import { PackTile } from '../pack'

export default async function Packs() {
  const all = await cards()
  return (
    <>
      <h1>Packs</h1>
      <p className="lede">Pick a pack to see its cards.</p>
      <section className="packs">
        {PACKS.map(p => <PackTile key={p.slug} href={`/series/${p.slug}`} name={p.name} line={`${all.length} cards`} />)}
      </section>
    </>
  )
}
