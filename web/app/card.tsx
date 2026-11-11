import type { Card } from '../../shared/types'

const STATS = ['pts', 'reb', 'ast', 'stl', 'blk', 'tov'] as const

export function CardTile({ card, total, locked, footer }: {
  card: Card; total: number; locked?: boolean; footer?: string
}) {
  const no = `#${String(card.number).padStart(3, '0')}/${total}`
  if (locked) return (
    <article className={`card locked ${card.tier}`}>
      <div className="head"><span className="no">{no}</span><span className="chip">{card.tier}</span></div>
      <div className="lock">?</div>
    </article>
  )
  const when = card.tier === 'legend' ? `${card.game} · ${card.date}` : `${card.season} · ${card.games} games`
  return (
    <article className={`card ${card.tier}`}>
      <div className="head"><span className="no">{no}</span><span className="chip">{card.tier}</span></div>
      <h2 className="name">{card.name}</h2>
      <div className="meta">{card.position} · {card.teams.join(' / ')}</div>
      <div className="meta">{when}</div>
      <dl className="stats">
        {STATS.map(s => <div key={s}><dt>{s}</dt><dd>{card[s]}</dd></div>)}
      </dl>
      {footer && <div className="foot">{footer}</div>}
    </article>
  )
}
