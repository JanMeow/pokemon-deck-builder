import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Download, Loader, ChevronDown, ChevronUp, Upload } from 'lucide-react'
import { getMetaDecks, getMetaDeckCards, importDeck, type MetaDeck } from '../api/client'
import type { Deck, DeckCard } from '../types/pokemon'

interface Props {
  onDeckLoaded: (cards: DeckCard[], name: string) => void
}

function MetaDeckRow({ deck, onLoad }: { deck: MetaDeck; onLoad: (id: string, name: string) => void }) {
  const [loading, setLoading] = useState(false)
  const [done,    setDone]    = useState(false)

  async function handleLoad() {
    setLoading(true)
    await onLoad(deck.id, deck.name)
    setLoading(false)
    setDone(true)
    setTimeout(() => setDone(false), 3000)
  }

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px',
      background: '#fff', borderRadius: 12, border: '1.5px solid #fce7f3',
      transition: 'border-color 0.12s',
    }}
      onMouseEnter={e => (e.currentTarget.style.borderColor = '#f9a8d4')}
      onMouseLeave={e => (e.currentTarget.style.borderColor = '#fce7f3')}
    >
      {deck.thumbnail
        ? <img src={deck.thumbnail} alt="" style={{ width: 32, height: 32, objectFit: 'contain', flexShrink: 0 }} />
        : <div style={{ width: 32, height: 32, borderRadius: 8, background: '#fce7f3', flexShrink: 0 }} />
      }
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: '#9d174d', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {deck.name}
        </p>
        {deck.share && (
          <p style={{ fontSize: 11, color: '#c084fc', margin: 0 }}>{deck.share} meta share · {deck.count} decks</p>
        )}
      </div>
      <button
        onClick={handleLoad}
        disabled={loading}
        style={{
          flexShrink: 0, display: 'flex', alignItems: 'center', gap: 5,
          padding: '5px 12px', borderRadius: 99, border: 'none', cursor: loading ? 'default' : 'pointer',
          background: done ? '#dcfce7' : 'linear-gradient(135deg,#f472b6,#c084fc)',
          color: done ? '#16a34a' : '#fff',
          fontSize: 11, fontWeight: 700, transition: 'background 0.2s',
        }}
      >
        {loading
          ? <><Loader style={{ width: 12, height: 12, animation: 'spin 1s linear infinite' }} /> Loading…</>
          : done
          ? '✓ Loaded'
          : <><Download style={{ width: 12, height: 12 }} /> Load</>
        }
      </button>
    </div>
  )
}

export default function FindDecks({ onDeckLoaded }: Props) {
  const [showPaste,  setShowPaste]  = useState(false)
  const [pasteText,  setPasteText]  = useState('')
  const [pasteName,  setPasteName]  = useState('')
  const [pasting,    setPasting]    = useState(false)
  const [pasteError, setPasteError] = useState('')
  const [pasteOk,    setPasteOk]    = useState('')

  const { data, isLoading, error } = useQuery({
    queryKey: ['meta-decks'],
    queryFn: () => getMetaDecks('standard'),
    staleTime: 1000 * 60 * 30,
  })

  async function handleMetaLoad(id: string, name: string) {
    const result = await getMetaDeckCards(id)
    const cards: DeckCard[] = result.data.map(c => ({ card_id: c.card_id, quantity: c.quantity }))
    onDeckLoaded(cards, name)
  }

  async function handlePasteImport() {
    if (!pasteText.trim() || !pasteName.trim()) return
    setPasting(true); setPasteError(''); setPasteOk('')
    try {
      const { deck, resolved } = await importDeck(pasteName, pasteText)
      onDeckLoaded(deck.cards, deck.name)
      setPasteOk(`Loaded "${deck.name}" — ${resolved} cards ✨`)
      setPasteText(''); setPasteName('')
    } catch (e: any) {
      setPasteError(e?.response?.data?.detail ?? 'Import failed — check the format.')
    } finally {
      setPasting(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <p style={{ fontSize: 13, fontWeight: 700, color: '#9d174d', margin: 0 }}>Tournament Meta Decks</p>
          <p style={{ fontSize: 11, color: '#c084fc', margin: 0 }}>Live from Limitless TCG · Standard format</p>
        </div>
        <button
          onClick={() => setShowPaste(v => !v)}
          style={{
            display: 'flex', alignItems: 'center', gap: 5, padding: '5px 12px',
            borderRadius: 99, fontSize: 11, fontWeight: 600, cursor: 'pointer',
            border: '1.5px solid #fce7f3', background: showPaste ? '#fdf4ff' : '#fff',
            color: '#c084fc', transition: 'all 0.12s',
          }}
        >
          <Upload style={{ width: 12, height: 12 }} />
          Paste PTCGL
          {showPaste ? <ChevronUp style={{ width: 12, height: 12 }} /> : <ChevronDown style={{ width: 12, height: 12 }} />}
        </button>
      </div>

      {/* PTCGL paste panel */}
      {showPaste && (
        <div style={{ background: '#fdf4ff', border: '1.5px solid #e9d5ff', borderRadius: 14, padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <input value={pasteName} onChange={e => setPasteName(e.target.value)} placeholder="Deck name…"
            style={{ padding: '8px 12px', borderRadius: 10, border: '1px solid #e9d5ff', background: '#fff', fontSize: 12, color: '#3b1f2b', outline: 'none' }} />
          <textarea value={pasteText} onChange={e => setPasteText(e.target.value)}
            placeholder={'Pokémon: 4\n4 Charizard ex OBF 125\nTrainer: 4\n4 Professor\'s Research SVI 190\nEnergy: 8\n8 Basic Fire Energy SVE 2'}
            rows={6}
            style={{ padding: '8px 10px', borderRadius: 10, border: '1px solid #e9d5ff', background: '#fff', fontSize: 11, color: '#3b1f2b', outline: 'none', resize: 'vertical', fontFamily: 'monospace' }} />
          {pasteError && <p style={{ fontSize: 11, color: '#dc2626', margin: 0 }}>⚠️ {pasteError}</p>}
          {pasteOk    && <p style={{ fontSize: 11, color: '#16a34a', margin: 0 }}>{pasteOk}</p>}
          <button onClick={handlePasteImport} disabled={pasting || !pasteText.trim() || !pasteName.trim()}
            style={{ padding: '8px', borderRadius: 10, border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg,#c084fc,#818cf8)', color: '#fff', fontWeight: 600, fontSize: 12, opacity: !pasteText.trim() || !pasteName.trim() ? 0.45 : 1 }}>
            {pasting ? 'Resolving cards…' : 'Load deck →'}
          </button>
        </div>
      )}

      {/* Meta deck list */}
      {isLoading && (
        <div style={{ textAlign: 'center', padding: '24px 0', color: '#f9a8d4', fontSize: 13 }}>
          Fetching meta from Limitless TCG… ✨
        </div>
      )}
      {error && (
        <div style={{ fontSize: 12, color: '#dc2626', background: '#fef2f2', borderRadius: 10, padding: '10px 14px' }}>
          Could not reach Limitless TCG. Try again later or paste a deck manually above.
        </div>
      )}
      {data?.data && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {data.data.map(deck => (
            <MetaDeckRow key={deck.id} deck={deck} onLoad={handleMetaLoad} />
          ))}
        </div>
      )}
    </div>
  )
}
