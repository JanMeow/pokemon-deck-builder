import { useState, useCallback, useEffect, type RefObject } from 'react'
import { Trash2, Save, Upload, X } from 'lucide-react'
import type { Card, DeckCard } from '../types/pokemon'
import { useCard } from '../hooks/useCards'
import { useCreateDeck, useUpdateDeck } from '../hooks/useDecks'
import { importDeck } from '../api/client'
import DeckStats from './DeckStats'

interface Props {
  deckId?: string
  initialName?: string
  initialCards?: DeckCard[]
  onSaved?: () => void
  onAddCardRef?: RefObject<((card: Card) => void) | null>
  onLoadDeckRef?: RefObject<((cards: DeckCard[], name: string) => void) | null>
}

// Only used for cards loaded from a saved deck that aren't in resolvedMap yet
function CardRowFetch({ cardId, quantity, onRemove, onQtyChange, onResolved }: {
  cardId: string
  quantity: number
  onRemove: () => void
  onQtyChange: (q: number) => void
  onResolved: (card: Card) => void
}) {
  const { data } = useCard(cardId)
  const card = data?.data
  useEffect(() => { if (card) onResolved(card) }, [card])
  return <CardRowUI card={card} quantity={quantity} onRemove={onRemove} onQtyChange={onQtyChange} />
}

function CardRowUI({ card, quantity, onRemove, onQtyChange }: {
  card: Card | undefined
  quantity: number
  onRemove: () => void
  onQtyChange: (q: number) => void
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0', borderBottom: '1px solid #fce7f3' }}>
      {card
        ? <img src={card.images.small} alt={card.name} style={{ width: 30, height: 42, objectFit: 'cover', borderRadius: 6 }} />
        : <div style={{ width: 30, height: 42, borderRadius: 6, background: '#fce7f3', flexShrink: 0 }} />
      }
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 12, fontWeight: 600, color: '#3b1f2b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: 0 }}>
          {card?.name ?? '…'}
        </p>
        <p style={{ fontSize: 10, color: '#c084fc', margin: 0 }}>{card?.set?.name}</p>
      </div>
      <select
        value={quantity}
        onChange={e => onQtyChange(Number(e.target.value))}
        style={{ fontSize: 11, background: '#fdf4ff', border: '1px solid #fce7f3', borderRadius: 8, padding: '3px 6px', color: '#9d174d', cursor: 'pointer', flexShrink: 0 }}
      >
        {[1, 2, 3, 4].map(n => <option key={n} value={n}>{n}×</option>)}
      </select>
      <button
        onClick={onRemove}
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#f9a8d4', padding: 2, flexShrink: 0 }}
        onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = '#ec4899')}
        onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = '#f9a8d4')}
      >
        <Trash2 style={{ width: 13, height: 13 }} />
      </button>
    </div>
  )
}

export default function DeckBuilder({ deckId, initialName = '', initialCards = [], onSaved, onAddCardRef, onLoadDeckRef }: Props) {
  const [name,        setName]        = useState(initialName)
  const [cards,       setCards]       = useState<DeckCard[]>(initialCards)
  const [resolvedMap, setResolvedMap] = useState<Map<string, Card>>(new Map())
  const [saved,       setSaved]       = useState(false)
  const [showImport,  setShowImport]  = useState(false)
  const [importText,  setImportText]  = useState('')
  const [importName,  setImportName]  = useState('')
  const [importing,   setImporting]   = useState(false)
  const [importError, setImportError] = useState('')

  const createDeck = useCreateDeck()
  const updateDeck = useUpdateDeck()

  const addCard = useCallback((card: Card) => {
    // Always keep resolvedMap up to date so CardRowUI has data instantly
    setResolvedMap(prev => new Map(prev).set(card.id, card))
    setCards(prev => {
      const existing = prev.find(c => c.card_id === card.id)
      if (existing) {
        if (existing.quantity >= 4) return prev
        return prev.map(c => c.card_id === card.id ? { ...c, quantity: c.quantity + 1 } : c)
      }
      return [...prev, { card_id: card.id, quantity: 1 }]
    })
  }, [])

  useEffect(() => {
    if (onAddCardRef) {
      (onAddCardRef as React.MutableRefObject<((card: Card) => void) | null>).current = addCard
    }
  }, [addCard, onAddCardRef])

  useEffect(() => {
    if (onLoadDeckRef) {
      (onLoadDeckRef as React.MutableRefObject<((cards: DeckCard[], name: string) => void) | null>).current =
        (newCards, newName) => {
          setCards(newCards)
          setName(newName)
          setResolvedMap(new Map())
        }
    }
  }, [onLoadDeckRef])

  async function handleImport() {
    if (!importText.trim() || !importName.trim()) return
    setImporting(true)
    setImportError('')
    try {
      const { deck, resolved } = await importDeck(importName, importText)
      setName(deck.name)
      setCards(deck.cards)
      setResolvedMap(new Map())   // cards will lazy-fetch via CardRowFetch
      setShowImport(false)
      setImportText('')
      setImportName('')
      alert(`Loaded ${resolved} cards into "${deck.name}" ✨`)
    } catch (e: any) {
      setImportError(e?.response?.data?.detail ?? 'Import failed — check the format and try again.')
    } finally {
      setImporting(false)
    }
  }

  async function handleSave() {
    if (!name.trim()) return
    if (deckId) {
      await updateDeck.mutateAsync({ id: deckId, name, cards })
    } else {
      await createDeck.mutateAsync({ name, cards })
    }
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    onSaved?.()
  }

  const isSaving = createDeck.isPending || updateDeck.isPending

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, height: '100%' }}>
      <div style={{ display: 'flex', gap: 6 }}>
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Name your deck…"
          style={{ flex: 1, padding: '9px 12px', borderRadius: 12, border: '1.5px solid #fce7f3', background: '#fff', fontSize: 13, color: '#3b1f2b', outline: 'none' }}
          onFocus={e => (e.target.style.borderColor = '#f9a8d4')}
          onBlur={e  => (e.target.style.borderColor = '#fce7f3')}
        />
        <button
          onClick={handleSave}
          disabled={isSaving || !name.trim()}
          style={{
            padding: '9px 12px', borderRadius: 12, border: 'none', fontWeight: 600, fontSize: 12,
            cursor: isSaving || !name.trim() ? 'default' : 'pointer',
            opacity: !name.trim() ? 0.5 : 1,
            background: saved ? '#dcfce7' : 'linear-gradient(135deg, #f472b6, #c084fc)',
            color: saved ? '#16a34a' : '#fff',
            display: 'flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap', transition: 'background 0.3s',
          }}
        >
          <Save style={{ width: 13, height: 13 }} />
          {saved ? '✓ Saved!' : isSaving ? '…' : 'Save'}
        </button>
      </div>

      {/* Import from PTCGL button */}
      <button
        onClick={() => setShowImport(v => !v)}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          padding: '7px 12px', borderRadius: 10, fontSize: 12, fontWeight: 600, cursor: 'pointer',
          border: `1.5px solid ${showImport ? '#c084fc' : '#fce7f3'}`,
          background: showImport ? '#fdf4ff' : '#fff',
          color: showImport ? '#7e22ce' : '#c084fc',
          transition: 'all 0.12s',
        }}
      >
        <Upload style={{ width: 13, height: 13 }} />
        Import PTCGL deck
      </button>

      {/* Import modal */}
      {showImport && (
        <div style={{ background: '#fdf4ff', border: '1.5px solid #e9d5ff', borderRadius: 14, padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: '#7e22ce', margin: 0 }}>Paste PTCGL export</p>
            <button onClick={() => { setShowImport(false); setImportError('') }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#c084fc', padding: 0 }}>
              <X style={{ width: 14, height: 14 }} />
            </button>
          </div>
          <input
            value={importName}
            onChange={e => setImportName(e.target.value)}
            placeholder="Deck name…"
            style={{ padding: '7px 10px', borderRadius: 8, border: '1px solid #e9d5ff', background: '#fff', fontSize: 12, color: '#3b1f2b', outline: 'none' }}
          />
          <textarea
            value={importText}
            onChange={e => setImportText(e.target.value)}
            placeholder={`Pokémon: 4\n4 Charizard ex OBF 125\nTrainer: 4\n4 Professor's Research SVI 190\nEnergy: 8\n8 Basic Fire Energy SVE 2`}
            rows={8}
            style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid #e9d5ff', background: '#fff', fontSize: 11, color: '#3b1f2b', outline: 'none', resize: 'vertical', fontFamily: 'monospace' }}
          />
          {importError && (
            <p style={{ fontSize: 11, color: '#dc2626', margin: 0 }}>{importError}</p>
          )}
          <button
            onClick={handleImport}
            disabled={importing || !importText.trim() || !importName.trim()}
            style={{
              padding: '8px', borderRadius: 10, border: 'none', cursor: importing ? 'default' : 'pointer',
              background: 'linear-gradient(135deg, #c084fc, #818cf8)',
              color: '#fff', fontWeight: 600, fontSize: 12,
              opacity: importing || !importText.trim() || !importName.trim() ? 0.5 : 1,
            }}
          >
            {importing ? 'Resolving cards…' : 'Load deck'}
          </button>
          <p style={{ fontSize: 10, color: '#a78bfa', margin: 0 }}>
            Copy any deck from Limitless TCG, Reddit, or Discord and paste it here.
          </p>
        </div>
      )}

      <DeckStats deckCards={cards} resolvedCards={resolvedMap} />

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {cards.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px 0', color: '#f9a8d4', fontSize: 13 }}>
            Click any card to add it ✨
          </div>
        ) : (
          cards.map(dc => {
            const resolved = resolvedMap.get(dc.card_id)
            const common = {
              quantity: dc.quantity,
              onRemove: () => setCards(prev => prev.filter(c => c.card_id !== dc.card_id)),
              onQtyChange: (q: number) => setCards(prev => prev.map(c => c.card_id === dc.card_id ? { ...c, quantity: q } : c)),
            }
            return resolved
              // Card is already in memory — render instantly, no fetch
              ? <CardRowUI key={dc.card_id} card={resolved} {...common} />
              // Card came from a saved deck — fetch once then cache in resolvedMap
              : <CardRowFetch key={dc.card_id} cardId={dc.card_id} {...common}
                  onResolved={card => setResolvedMap(prev => new Map(prev).set(card.id, card))} />
          })
        )}
      </div>
    </div>
  )
}
