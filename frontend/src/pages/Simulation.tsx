import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { ArrowLeft, Crosshair, Zap } from 'lucide-react'
import { getMetaDecks, type MetaDeck } from '../api/client'

function LoadoutSlot({
  label,
  slot,
  deck,
}: {
  label: string
  slot: 'alpha' | 'beta'
  deck: MetaDeck | undefined
}) {
  const accent = slot === 'alpha' ? '#22d3ee' : '#f472b6'
  const dim = slot === 'alpha' ? 'rgba(34,211,238,0.12)' : 'rgba(244,114,182,0.12)'

  return (
    <div
      style={{
        flex: 1,
        minWidth: 0,
        maxWidth: 420,
        borderRadius: 20,
        padding: 3,
        background: `linear-gradient(145deg, ${accent}, transparent 55%, rgba(15,23,42,0.9))`,
        boxShadow: deck
          ? `0 0 40px ${dim}, inset 0 1px 0 rgba(255,255,255,0.06)`
          : 'none',
      }}
    >
      <div
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
          }}
        >
          {deck?.name ?? '— Awaiting meta data —'}
        </p>
        {deck && (
          <p style={{ margin: '10px 0 0', fontSize: 12, color: '#94a3b8' }}>
            {deck.share ? `${deck.share} meta share` : 'Standard meta'}
            {deck.count ? ` · ${deck.count} tournament decks` : ''}
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

  const decks = data?.data ?? []
  const defaultA = decks[0]
  const defaultB = decks[1]

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
          Default loadouts are the top two meta entries scraped from the same list as Find & Import — swap logic comes next.
        </p>

        {isLoading && (
          <p style={{ color: '#64748b', fontSize: 14 }}>Syncing meta from Limitless…</p>
        )}
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
          <LoadoutSlot label="LOADOUT α" slot="alpha" deck={defaultA} />

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

          <LoadoutSlot label="LOADOUT β" slot="beta" deck={defaultB} />
        </div>
      </div>
    </div>
  )
}
