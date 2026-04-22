import type { Card } from '../types/pokemon'

function getMarketPrice(card: Card): number | null {
  const p = card.tcgplayer?.prices
  if (!p) return null
  const entry = p.holofoil ?? p.normal ?? p.reverseHolofoil ?? p['1stEditionHolofoil']
  return entry?.market ?? entry?.mid ?? null
}

interface Props {
  cards: Card[]
  onAdd: (card: Card) => void
}

const TYPE_PASTEL: Record<string, { bg: string; color: string; emoji: string }> = {
  Fire:      { bg: '#fee2e2', color: '#dc2626', emoji: '🔥' },
  Water:     { bg: '#dbeafe', color: '#1d4ed8', emoji: '💧' },
  Grass:     { bg: '#dcfce7', color: '#15803d', emoji: '🌿' },
  Lightning: { bg: '#fef9c3', color: '#a16207', emoji: '⚡' },
  Psychic:   { bg: '#f3e8ff', color: '#7e22ce', emoji: '🔮' },
  Fighting:  { bg: '#ffedd5', color: '#c2410c', emoji: '🥊' },
  Darkness:  { bg: '#f1f5f9', color: '#475569', emoji: '🌑' },
  Metal:     { bg: '#e2e8f0', color: '#334155', emoji: '⚙️' },
  Dragon:    { bg: '#ede9fe', color: '#4338ca', emoji: '🐉' },
  Colorless: { bg: '#f3f4f6', color: '#4b5563', emoji: '⭐' },
}

const SUPERTYPE_STYLE: Record<string, { bg: string; color: string }> = {
  'Pokémon': { bg: '#fce7f3', color: '#be185d' },
  'Trainer': { bg: '#dbeafe', color: '#1e40af' },
  'Energy':  { bg: '#dcfce7', color: '#166534' },
}

export default function CardGrid({ cards, onAdd }: Props) {
  if (cards.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 0', color: '#f9a8d4', fontSize: 14 }}>
        No cards found 🌸 Try a different search!
      </div>
    )
  }

  return (
    <div className="masonry">
      {cards.map((card) => (
        <div
          key={card.id}
          className="masonry-item"
          onClick={() => onAdd(card)}
          style={{
            background: '#fff',
            borderRadius: 16,
            overflow: 'hidden',
            border: '1.5px solid #fce7f3',
            cursor: 'pointer',
            transition: 'transform 0.15s, box-shadow 0.15s',
            boxShadow: '0 2px 8px rgba(236,72,153,0.06)',
            position: 'relative',
          }}
          onMouseEnter={e => {
            const el = e.currentTarget
            el.style.transform = 'translateY(-3px) scale(1.02)'
            el.style.boxShadow = '0 8px 24px rgba(236,72,153,0.18)'
            el.style.borderColor = '#f472b6'
          }}
          onMouseLeave={e => {
            const el = e.currentTarget
            el.style.transform = ''
            el.style.boxShadow = '0 2px 8px rgba(236,72,153,0.06)'
            el.style.borderColor = '#fce7f3'
          }}
        >
          <img
            src={card.images.small}
            alt={card.name}
            style={{ width: '100%', display: 'block' }}
            loading="lazy"
          />

          {/* Add pill — appears on hover via CSS class trick using inline opacity + pointer events */}
          <div
            style={{
              position: 'absolute',
              top: 8,
              right: 8,
              background: 'linear-gradient(135deg, #f472b6, #c084fc)',
              color: '#fff',
              fontSize: 10,
              fontWeight: 700,
              padding: '3px 9px',
              borderRadius: 99,
              opacity: 0,
              transition: 'opacity 0.15s',
              pointerEvents: 'none',
            }}
            className="add-pill"
          >
            + Add
          </div>

          <div style={{ padding: '8px 10px 10px' }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: '#3b1f2b', marginBottom: 5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {card.name}
            </p>
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              {card.types?.map(t => {
                const s = TYPE_PASTEL[t] ?? { bg: '#f3f4f6', color: '#4b5563', emoji: '•' }
                return (
                  <span key={t} style={{ background: s.bg, color: s.color, fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 99 }}>
                    {s.emoji} {t}
                  </span>
                )
              })}
              {(() => {
                const s = SUPERTYPE_STYLE[card.supertype] ?? { bg: '#f3f4f6', color: '#4b5563' }
                return (
                  <span style={{ background: s.bg, color: s.color, fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 99 }}>
                    {card.supertype}
                  </span>
                )
              })()}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
              {card.set?.name && (
                <p style={{ fontSize: 10, color: '#c084fc', margin: 0 }}>{card.set.name}</p>
              )}
              {(() => {
                const price = getMarketPrice(card)
                return price != null ? (
                  <span style={{ fontSize: 10, fontWeight: 700, color: '#16a34a', background: '#dcfce7', borderRadius: 99, padding: '1px 6px' }}>
                    ${price.toFixed(2)}
                  </span>
                ) : null
              })()}
            </div>
          </div>
        </div>
      ))}

      <style>{`.masonry-item:hover .add-pill { opacity: 1 !important; }`}</style>
    </div>
  )
}
