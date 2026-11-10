import type { Card } from '../../shared/types'

export function CardTile({ card, total, locked, footer }: {
  card: Card; total: number; locked?: boolean; footer?: string
}) {
  const no = `#${String(card.number).padStart(3, '0')}/${total}`
  if (locked) return (
    <article className={`card locked ${card.tier}`}>
      <div className="no">{no}</div>
      <div className="name">Locked</div>
      <div className="tier">{card.tier}</div>
    </article>
  )
  return (
    <article className={`card ${card.tier}`}>
      <div className="no">{no}</div>
      <div className="name">{card.name}</div>
      <div className="meta">
        {card.position} · {card.teams.join('/')} ·{' '}
        {card.tier === 'legend' ? `${card.game}, ${card.date}` : `${card.season}, ${card.games} G`}
      </div>
      <div className="stats">
        {card.pts} PTS · {card.reb} REB · {card.ast} AST
        <br />{card.stl} STL · {card.blk} BLK · {card.tov} TOV
      </div>
      <div className="fp">{card.fp} FP</div>
      <div className="tier">{card.tier}</div>
      {footer && <div className="foot">{footer}</div>}
    </article>
  )
}
