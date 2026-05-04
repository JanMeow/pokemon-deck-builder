import { useCallback, useState, type CSSProperties } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { ArrowLeft, Crosshair, X, Zap } from 'lucide-react'
import { getMetaDeckCards, getMetaDecks, type MetaDeck, type MetaDeckCard } from '../api/client'
import type { Card } from '../types/pokemon'

function isPokemon(c: Card): boolean {
  const t = (c.supertype || '').toLowerCase()
  return t.includes('pok')
}

function expandDeck(rows: MetaDeckCard[]): Card[] {
  const out: Card[] = []
  for (const row of rows) {
    for (let i = 0; i < row.quantity; i++) out.push(row.card)
  }
  return out
}

function shuffle<T>(items: T[]): T[] {
  const deck = [...items]
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[deck[i], deck[j]] = [deck[j], deck[i]]
  }
  return deck
}

export type PlayerBoard = {
  deckRemaining: number
  hand: Card[]
  active: Card | null
  bench: Card[]
}

/** Toy opening: shuffle, first Pokémon → active, next Pokémon → bench (max 3), then draw 6 for hand. */
function simulateOpening(pool: Card[]): PlayerBoard {
  const pile = shuffle(pool)
  if (pile.length === 0) {
    return { deckRemaining: 0, hand: [], active: null, bench: [] }
  }

  const activeIdx = pile.findIndex(isPokemon)
  if (activeIdx < 0) {
    const hand = pile.splice(0, Math.min(6, pile.length))
    return { deckRemaining: pile.length, hand, active: null, bench: [] }
  }

  const active = pile.splice(activeIdx, 1)[0]
  const bench: Card[] = []
  let guard = 0
  while (bench.length < 3 && guard++ < 80) {
    const idx = pile.findIndex(isPokemon)
    if (idx < 0) break
    bench.push(pile.splice(idx, 1)[0])
  }
  const hand = pile.splice(0, Math.min(6, pile.length))
  return { deckRemaining: pile.length, hand, active, bench }
}

function MiniCard({ card, tall }: { card: Card; tall?: boolean }) {
  const src = card.images?.small
  const h = tall ? 112 : 72
  return (
    <div
      title={card.name}
      style={{
        width: tall ? 80 : 52,
        height: h,
        borderRadius: 8,
        overflow: 'hidden',
        flexShrink: 0,
        boxShadow: '0 6px 16px rgba(0,0,0,0.45)',
        border: '1px solid rgba(255,255,255,0.12)',
        background: '#1e293b',
      }}
    >
      {src ? (
        <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }} />
      ) : (
        <div
          style={{
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 9,
            color: '#94a3b8',
            padding: 4,
            textAlign: 'center',
          }}
        >
          {card.name}
        </div>
      )}
    </div>
  )
}

function DeckPile({ count, accent }: { count: number; accent: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
      <div style={{ position: 'relative', width: 44, height: 56 }}>
        {[0, 1, 2].map(i => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: i * 3,
              top: i * 2,
              width: 40,
              height: 52,
              borderRadius: 6,
              background: `linear-gradient(135deg, ${accent}, #0f172a)`,
              border: '1px solid rgba(255,255,255,0.15)',
              boxShadow: '0 4px 8px rgba(0,0,0,0.35)',
            }}
          />
        ))}
      </div>
      <span style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.06em' }}>DECK · {count}</span>
    </div>
  )
}

function PlayerField({ label, accent, board }: { label: string; accent: string; board: PlayerBoard }) {
  const rowStyle: CSSProperties = {
    display: 'flex',
    gap: 8,
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'flex-end',
  }

  const inner = (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%', gap: 16 }}>
        <div>
          <p style={{ margin: 0, fontSize: 11, fontWeight: 800, letterSpacing: '0.14em', color: accent }}>{label}</p>
          <p style={{ margin: '4px 0 0', fontSize: 10, color: '#64748b' }}>Mock opening · cards from this loadout</p>
        </div>
        <DeckPile count={board.deckRemaining} accent={accent} />
      </div>

      <div style={{ marginTop: 14 }}>
        <p style={{ margin: '0 0 8px', fontSize: 9, fontWeight: 700, color: '#64748b', letterSpacing: '0.12em' }}>HAND</p>
        <div style={rowStyle}>
          {board.hand.length === 0 ? (
            <span style={{ fontSize: 12, color: '#475569' }}>—</span>
          ) : (
            board.hand.map((c, i) => <MiniCard key={`${c.id}-h-${i}`} card={c} />)
          )}
        </div>
      </div>

      <div style={{ marginTop: 14 }}>
        <p style={{ margin: '0 0 8px', fontSize: 9, fontWeight: 700, color: '#64748b', letterSpacing: '0.12em' }}>BENCH</p>
        <div style={rowStyle}>
          {board.bench.length === 0 ? (
            <span style={{ fontSize: 12, color: '#475569' }}>—</span>
          ) : (
            board.bench.map((c, i) => <MiniCard key={`${c.id}-b-${i}`} card={c} />)
          )}
        </div>
      </div>

      <div style={{ marginTop: 14 }}>
        <p style={{ margin: '0 0 8px', fontSize: 9, fontWeight: 700, color: '#64748b', letterSpacing: '0.12em' }}>ACTIVE</p>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          {board.active ? (
            <MiniCard card={board.active} tall />
          ) : (
            <span style={{ fontSize: 12, color: '#475569' }}>No Pokémon in pile</span>
          )}
        </div>
      </div>
    </>
  )

  return (
    <div
      style={{
        borderRadius: 16,
        padding: '18px 16px',
        background: 'rgba(15,23,42,0.75)',
        border: `1px solid rgba(148,163,184,0.12)`,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {inner}
    </div>
  )
}

function LoadoutSlot({
  label,
  slot,
  deck,
  onDeckClick,
}: {
  label: string
  slot: 'alpha' | 'beta'
  deck: MetaDeck | undefined
  onDeckClick?: () => void
}) {
  const accent = slot === 'alpha' ? '#22d3ee' : '#f472b6'
  const dim = slot === 'alpha' ? 'rgba(34,211,238,0.12)' : 'rgba(244,114,182,0.12)'
  const interactive = Boolean(deck && onDeckClick)

  return (
    <div
      style={{
        flex: 1,
        minWidth: 0,
        maxWidth: 420,
        borderRadius: 20,
        padding: 3,
        background: `linear-gradient(145deg, ${accent}, transparent 55%, rgba(15,23,42,0.9))`,
        boxShadow: deck ? `0 0 40px ${dim}, inset 0 1px 0 rgba(255,255,255,0.06)` : 'none',
      }}
    >
      <div
        role={interactive ? 'button' : undefined}
        tabIndex={interactive ? 0 : undefined}
        onClick={interactive ? onDeckClick : undefined}
        onKeyDown={e => {
          if (interactive && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault()
            onDeckClick?.()
          }
        }}
        style={{
          borderRadius: 17,
          background: 'linear-gradient(180deg, #0f172a 0%, #020617 100%)',
          border: '1px solid rgba(148,163,184,0.15)',
          padding: '22px 20px',
          minHeight: 320,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          cursor: interactive ? 'pointer' : 'default',
          outline: 'none',
          transition: 'transform 0.15s, box-shadow 0.15s',
        }}
        onMouseEnter={e => {
          if (interactive) {
            e.currentTarget.style.transform = 'scale(1.02)'
            e.currentTarget.style.boxShadow = `0 0 0 2px ${accent}55`
          }
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = 'none'
          e.currentTarget.style.boxShadow = 'none'
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 10,
            fontWeight: 800,
            letterSpacing: '0.2em',
            color: accent,
            marginBottom: 16,
          }}
        >
          <Crosshair style={{ width: 14, height: 14 }} />
          {label}
        </div>

        {deck?.thumbnail ? (
          <div
            style={{
              width: 120,
              height: 120,
              borderRadius: 16,
              padding: 8,
              background: `radial-gradient(circle at 30% 20%, ${dim}, #0f172a)`,
              border: `1px solid rgba(148,163,184,0.2)`,
              marginBottom: 16,
              pointerEvents: 'none',
            }}
          >
            <img
              src={deck.thumbnail}
              alt=""
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          </div>
        ) : (
          <div
            style={{
              width: 120,
              height: 120,
              borderRadius: 16,
              background: '#1e293b',
              border: '1px dashed rgba(148,163,184,0.25)',
              marginBottom: 16,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#475569',
              fontSize: 11,
              fontWeight: 600,
            }}
          >
            EMPTY SLOT
          </div>
        )}

        <p
          style={{
            margin: 0,
            fontSize: 16,
            fontWeight: 800,
            color: '#f1f5f9',
            lineHeight: 1.25,
            letterSpacing: '-0.02em',
            pointerEvents: 'none',
          }}
        >
          {deck?.name ?? '— Awaiting meta data —'}
        </p>
        {deck && (
          <p style={{ margin: '10px 0 0', fontSize: 12, color: '#94a3b8', pointerEvents: 'none' }}>
            {deck.share ? `${deck.share} meta share` : 'Standard meta'}
            {deck.count ? ` · ${deck.count} tournament decks` : ''}
          </p>
        )}

        {interactive && (
          <p
            style={{
              margin: '14px 0 0',
              fontSize: 11,
              fontWeight: 700,
              color: accent,
              letterSpacing: '0.08em',
              pointerEvents: 'none',
            }}
          >
            Click — simulate α vs β board
          </p>
        )}

        <div style={{ marginTop: 'auto', paddingTop: 20, width: '100%' }}>
          <div
            style={{
              height: 4,
              borderRadius: 99,
              background: '#1e293b',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: deck ? '100%' : '12%',
                height: '100%',
                borderRadius: 99,
                background: deck ? `linear-gradient(90deg, ${accent}, transparent)` : '#334155',
                transition: 'width 0.4s ease',
              }}
            />
          </div>
          <p style={{ margin: '8px 0 0', fontSize: 10, color: '#64748b', fontWeight: 600 }}>
            {deck ? 'DEFAULT LOADOUT LOCKED' : 'NO DECK ASSIGNED'}
          </p>
        </div>
      </div>
    </div>
  )
}

export default function Simulation() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['meta-decks', 'simulation-defaults'],
    queryFn: () => getMetaDecks('standard'),
    staleTime: 1000 * 60 * 30,
  })

  const [battleOpen, setBattleOpen] = useState(false)
  const [battleLoading, setBattleLoading] = useState(false)
  const [battleErr, setBattleErr] = useState<string | null>(null)
  const [alphaBoard, setAlphaBoard] = useState<PlayerBoard | null>(null)
  const [betaBoard, setBetaBoard] = useState<PlayerBoard | null>(null)
  const [alphaName, setAlphaName] = useState('')
  const [betaName, setBetaName] = useState('')

  const decks = data?.data ?? []
  const defaultA = decks[0]
  const defaultB = decks[1]

  const runSimulation = useCallback(async () => {
    if (!defaultA?.id || !defaultB?.id) {
      setBattleErr('Need at least two meta decks in the list to run a match.')
      return
    }
    setBattleErr(null)
    setBattleLoading(true)
    try {
      const [aRes, bRes] = await Promise.all([getMetaDeckCards(defaultA.id), getMetaDeckCards(defaultB.id)])
      const poolA = expandDeck(aRes.data)
      const poolB = expandDeck(bRes.data)
      setAlphaBoard(simulateOpening(poolA))
      setBetaBoard(simulateOpening(poolB))
      setAlphaName(defaultA.name)
      setBetaName(defaultB.name)
      setBattleOpen(true)
    } catch {
      setBattleErr('Could not load deck lists. Check the API and try again.')
    } finally {
      setBattleLoading(false)
    }
  }, [defaultA, defaultB])

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'radial-gradient(ellipse 120% 80% at 50% -20%, #1e1b4b 0%, #020617 45%, #000 100%)',
        color: '#e2e8f0',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <header
        style={{
          padding: '14px 24px',
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          borderBottom: '1px solid rgba(148,163,184,0.12)',
          background: 'rgba(2,6,23,0.6)',
          backdropFilter: 'blur(8px)',
        }}
      >
        <Link
          to="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            color: '#94a3b8',
            textDecoration: 'none',
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          <ArrowLeft style={{ width: 16, height: 16 }} />
          Deck builder
        </Link>
        <div style={{ flex: 1 }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Zap style={{ width: 18, height: 18, color: '#fbbf24' }} />
          <span style={{ fontSize: 14, fontWeight: 800, letterSpacing: '0.04em' }}>MATCH ARSENAL</span>
        </div>
      </header>

      <div style={{ flex: 1, padding: '28px 24px 40px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <p
          style={{
            margin: 0,
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.18em',
            color: '#64748b',
            textTransform: 'uppercase',
          }}
        >
          Tournament Meta Decks
        </p>
        <h1
          style={{
            margin: '6px 0 8px',
            fontSize: 22,
            fontWeight: 800,
            background: 'linear-gradient(90deg, #e2e8f0, #a5b4fc, #f9a8d4)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          Live from Limitless TCG · Standard
        </h1>
        <p style={{ margin: '0 0 32px', fontSize: 13, color: '#64748b', maxWidth: 520, textAlign: 'center' }}>
          Default loadouts are the top two meta entries — click either deck to open a mock two-player board (shuffled
          cards from each list).
        </p>

        {battleErr && (
          <p style={{ color: '#f87171', fontSize: 13, marginBottom: 16, textAlign: 'center' }}>{battleErr}</p>
        )}
        {battleLoading && (
          <p style={{ color: '#a5b4fc', fontSize: 13, marginBottom: 16 }}>Dealing mock opening…</p>
        )}

        {isLoading && <p style={{ color: '#64748b', fontSize: 14 }}>Syncing meta from Limitless…</p>}
        {error && (
          <p style={{ color: '#f87171', fontSize: 13, marginBottom: 24 }}>
            Could not load meta decks. Open the builder and check Find & Import, then retry.
          </p>
        )}

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'stretch',
            justifyContent: 'center',
            gap: 20,
            width: '100%',
            maxWidth: 960,
          }}
        >
          <LoadoutSlot label="LOADOUT α" slot="alpha" deck={defaultA} onDeckClick={runSimulation} />

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              width: 64,
            }}
          >
            <span
              style={{
                fontSize: 20,
                fontWeight: 900,
                color: '#fbbf24',
                textShadow: '0 0 24px rgba(251,191,36,0.5)',
                letterSpacing: '0.05em',
              }}
            >
              VS
            </span>
          </div>

          <LoadoutSlot label="LOADOUT β" slot="beta" deck={defaultB} onDeckClick={runSimulation} />
        </div>

        {defaultA && defaultB && !isLoading && !error && (
          <button
            type="button"
            onClick={() => void runSimulation()}
            disabled={battleLoading}
            style={{
              marginTop: 28,
              padding: '14px 28px',
              borderRadius: 12,
              border: 'none',
              cursor: battleLoading ? 'wait' : 'pointer',
              fontSize: 14,
              fontWeight: 800,
              letterSpacing: '0.04em',
              color: '#fff',
              background: 'linear-gradient(135deg,#f472b6,#6366f1,#22d3ee)',
              boxShadow: '0 8px 32px rgba(99,102,241,0.35)',
              opacity: battleLoading ? 0.75 : 1,
            }}
          >
            {battleLoading ? 'Loading deck lists…' : 'Open mock two-player board (α vs β)'}
          </button>
        )}
      </div>

      {battleOpen && alphaBoard && betaBoard && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 50,
            background: 'rgba(2,6,23,0.92)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            flexDirection: 'column',
            padding: '16px 20px 24px',
            overflow: 'auto',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12, flexShrink: 0 }}>
            <button
              type="button"
              onClick={() => setBattleOpen(false)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 14px',
                borderRadius: 10,
                border: '1px solid rgba(148,163,184,0.25)',
                background: 'rgba(15,23,42,0.9)',
                color: '#e2e8f0',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <X style={{ width: 16, height: 16 }} />
              Close
            </button>
            <button
              type="button"
              onClick={() => {
                void runSimulation()
              }}
              disabled={battleLoading}
              style={{
                marginLeft: 10,
                padding: '8px 14px',
                borderRadius: 10,
                border: 'none',
                background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                color: '#fff',
                fontSize: 13,
                fontWeight: 600,
                cursor: battleLoading ? 'wait' : 'pointer',
                opacity: battleLoading ? 0.7 : 1,
              }}
            >
              Re-shuffle
            </button>
            <div style={{ flex: 1 }} />
            <span style={{ fontSize: 12, fontWeight: 700, color: '#64748b', letterSpacing: '0.1em' }}>
              MOCK GAME ENGINE
            </span>
          </div>

          <div
            style={{
              flex: 1,
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 16,
              maxWidth: 1100,
              margin: '0 auto',
              width: '100%',
              alignContent: 'start',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <p style={{ margin: 0, fontSize: 12, fontWeight: 800, color: '#f472b6', letterSpacing: '0.06em' }}>
                {betaName}
              </p>
              <PlayerField label="PLAYER β" accent="#f472b6" board={betaBoard} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <p style={{ margin: 0, fontSize: 12, fontWeight: 800, color: '#22d3ee', letterSpacing: '0.06em' }}>
                {alphaName}
              </p>
              <PlayerField label="PLAYER α" accent="#22d3ee" board={alphaBoard} />
            </div>
          </div>

          <p
            style={{
              margin: '16px auto 0',
              fontSize: 11,
              color: '#475569',
              textAlign: 'center',
              maxWidth: 560,
            }}
          >
            Face-up hands for preview only. Not a rules-complete Pokémon TCG engine — each side uses only cards from
            its own meta list.
          </p>
        </div>
      )}
    </div>
  )
}
