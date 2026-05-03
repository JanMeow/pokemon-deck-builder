import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Play, Eye } from 'lucide-react'
import CardSearch from '../components/CardSearch'
import DeckBuilder from '../components/DeckBuilder'
import FindDecks from '../components/FindDecks'
import SavedDecks from '../components/SavedDecks'
import type { Card, DeckCard } from '../types/pokemon'

function SectionDivider({ label }: { label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '4px 0 14px' }}>
      <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
      <span style={{
        fontSize: 10, fontWeight: 700, color: '#94a3b8',
        textTransform: 'uppercase', letterSpacing: '0.1em', whiteSpace: 'nowrap',
      }}>
        {label}
      </span>
      <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
    </div>
  )
}

export default function Home() {
  const navigate = useNavigate()
  const addCardRef = useRef<((card: Card) => void) | null>(null)
  const loadDeckRef = useRef<((cards: DeckCard[], name: string) => void) | null>(null)
  const [simHover, setSimHover] = useState<'start' | 'watch' | null>(null)

  function handleDeckLoaded(cards: DeckCard[], name: string) {
    loadDeckRef.current?.(cards, name)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f1f5f9', display: 'flex', flexDirection: 'column' }}>

      <header style={{
        height: 56, padding: '0 24px', display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0,
        background: '#0f172a', borderBottom: '1px solid #1e293b',
      }}>
        <span style={{ fontSize: 20 }}>🃏</span>
        <div style={{ lineHeight: 1 }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9', letterSpacing: '-0.01em' }}>Pokédeck</span>
          <span style={{ fontSize: 11, color: '#475569', marginLeft: 8 }}>build · import · optimise</span>
        </div>

        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          <button
            type="button"
            title="Open match simulation arsenal"
            onClick={() => navigate('/simulation')}
            onMouseEnter={() => setSimHover('start')}
            onMouseLeave={() => setSimHover(null)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '7px 16px',
              borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600,
              background: simHover === 'start'
                ? 'linear-gradient(135deg,#4f46e5,#7c3aed)'
                : 'linear-gradient(135deg,#6366f1,#8b5cf6)',
              color: '#fff', transition: 'background 0.15s',
              boxShadow: simHover === 'start' ? '0 0 0 3px rgba(99,102,241,0.3)' : 'none',
            }}
          >
            <Play style={{ width: 12, height: 12, fill: 'currentColor' }} />
            Start Simulation
          </button>
          <button
            type="button"
            title="Watch last simulation replay"
            onMouseEnter={() => setSimHover('watch')}
            onMouseLeave={() => setSimHover(null)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px',
              borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 600,
              border: `1px solid ${simHover === 'watch' ? '#475569' : '#1e293b'}`,
              background: simHover === 'watch' ? '#1e293b' : 'transparent',
              color: simHover === 'watch' ? '#e2e8f0' : '#64748b',
              transition: 'all 0.15s',
            }}
          >
            <Eye style={{ width: 12, height: 12 }} />
            Watch
          </button>
        </div>
      </header>

      <main style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 24 }}>

          <section>
            <SectionDivider label="Card Library" />
            <CardSearch onAddCard={card => addCardRef.current?.(card)} />
          </section>

          <section>
            <SectionDivider label="My Saved Decks" />
            <SavedDecks onDeckLoaded={handleDeckLoaded} />
          </section>

          <section>
            <SectionDivider label="Find & Import Decks" />
            <FindDecks onDeckLoaded={handleDeckLoaded} />
          </section>

        </div>

        <aside style={{
          width: 296, flexShrink: 0, overflowY: 'auto',
          background: '#fff', borderLeft: '1px solid #e2e8f0',
          display: 'flex', flexDirection: 'column',
        }}>
          <div style={{
            padding: '14px 18px 10px', borderBottom: '1px solid #f1f5f9', flexShrink: 0,
          }}>
            <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#94a3b8', margin: 0 }}>
              Active Deck
            </p>
          </div>
          <div style={{ flex: 1, padding: '14px 18px', overflowY: 'auto' }}>
            <DeckBuilder onAddCardRef={addCardRef} onLoadDeckRef={loadDeckRef} />
          </div>
        </aside>

      </main>
    </div>
  )
}
