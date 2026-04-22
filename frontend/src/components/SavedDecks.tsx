import { useState } from 'react'
import { Loader, FolderOpen, Trash2, ChevronLeft, ChevronRight } from 'lucide-react'
import { useDecks, useDeleteDeck } from '../hooks/useDecks'
import type { DeckCard } from '../types/pokemon'

const PAGE_SIZE = 20

interface Props {
  onDeckLoaded: (cards: DeckCard[], name: string) => void
}

export default function SavedDecks({ onDeckLoaded }: Props) {
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [page, setPage] = useState(1)
  const deleteDeck = useDeleteDeck()

  const { data, isLoading } = useDecks(debouncedQuery, page, PAGE_SIZE)
  const decks = data?.data ?? []
  const total = data?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  function handleQueryChange(val: string) {
    setQuery(val)
    setPage(1)
    // Simple debounce via timeout stored in module scope
    clearTimeout((handleQueryChange as any)._t)
    ;(handleQueryChange as any)._t = setTimeout(() => setDebouncedQuery(val), 250)
  }

  if (isLoading && !data) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#94a3b8', fontSize: 13, padding: '12px 0' }}>
        <Loader style={{ width: 14, height: 14, animation: 'spin 1s linear infinite' }} />
        Loading saved decks…
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <input
        value={query}
        onChange={e => handleQueryChange(e.target.value)}
        placeholder="Search decks…"
        style={{
          padding: '8px 12px', borderRadius: 10, border: '1px solid #e2e8f0',
          background: '#fff', fontSize: 12, color: '#1e293b', outline: 'none',
        }}
        onFocus={e => (e.target.style.borderColor = '#6366f1')}
        onBlur={e  => (e.target.style.borderColor = '#e2e8f0')}
      />

      {total === 0 && !isLoading && (
        <p style={{ fontSize: 12, color: '#94a3b8', margin: 0 }}>
          {debouncedQuery ? `No decks match "${debouncedQuery}"` : 'No saved decks yet — build one and hit Save ✨'}
        </p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {decks.map(deck => (
          <div key={deck.id} style={{
            display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px',
            background: '#fff', borderRadius: 10, border: '1px solid #e2e8f0',
            transition: 'border-color 0.12s',
          }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = '#c7d2fe')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = '#e2e8f0')}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {deck.name}
              </p>
              <p style={{ fontSize: 11, color: '#94a3b8', margin: 0 }}>
                {deck.cards.reduce((s, c) => s + c.quantity, 0)} cards
              </p>
            </div>
            <button
              onClick={() => onDeckLoaded(deck.cards, deck.name)}
              title="Load into builder"
              style={{
                display: 'flex', alignItems: 'center', gap: 4, padding: '5px 10px',
                borderRadius: 8, border: 'none', cursor: 'pointer',
                background: '#eef2ff', color: '#6366f1', fontSize: 11, fontWeight: 600, flexShrink: 0,
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#6366f1'; (e.currentTarget as HTMLElement).style.color = '#fff' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#eef2ff'; (e.currentTarget as HTMLElement).style.color = '#6366f1' }}
            >
              <FolderOpen style={{ width: 12, height: 12 }} /> Load
            </button>
            <button
              onClick={() => deleteDeck.mutate(deck.id)}
              title="Delete deck"
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#cbd5e1', padding: 2, flexShrink: 0 }}
              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = '#ef4444')}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = '#cbd5e1')}
            >
              <Trash2 style={{ width: 13, height: 13 }} />
            </button>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 4 }}>
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            style={{
              display: 'flex', alignItems: 'center', gap: 4, padding: '5px 10px',
              borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff',
              fontSize: 11, color: page === 1 ? '#cbd5e1' : '#6366f1', cursor: page === 1 ? 'default' : 'pointer',
            }}
          >
            <ChevronLeft style={{ width: 13, height: 13 }} /> Prev
          </button>
          <span style={{ fontSize: 11, color: '#94a3b8' }}>
            {page} / {totalPages} &nbsp;·&nbsp; {total} deck{total !== 1 ? 's' : ''}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            style={{
              display: 'flex', alignItems: 'center', gap: 4, padding: '5px 10px',
              borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff',
              fontSize: 11, color: page === totalPages ? '#cbd5e1' : '#6366f1', cursor: page === totalPages ? 'default' : 'pointer',
            }}
          >
            Next <ChevronRight style={{ width: 13, height: 13 }} />
          </button>
        </div>
      )}
    </div>
  )
}
