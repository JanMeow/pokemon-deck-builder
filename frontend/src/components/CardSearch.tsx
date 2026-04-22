import { useState, useEffect } from 'react'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { useCardSearch } from '../hooks/useCards'
import CardGrid from './CardGrid'
import type { Card } from '../types/pokemon'

interface Props {
  onAddCard: (card: Card) => void
}

const TYPES = ['Fire', 'Water', 'Grass', 'Lightning', 'Psychic', 'Fighting', 'Darkness', 'Metal', 'Dragon', 'Colorless']
const TYPE_EMOJI: Record<string, string> = {
  Fire: '🔥', Water: '💧', Grass: '🌿', Lightning: '⚡', Psychic: '🔮',
  Fighting: '🥊', Darkness: '🌑', Metal: '⚙️', Dragon: '🐉', Colorless: '⭐',
}
const SUPERTYPES = ['', 'Pokémon', 'Trainer', 'Energy']
const SUBTYPES   = ['', 'Basic', 'Stage 1', 'Stage 2', 'GX', 'V', 'VMAX', 'ex', 'EX', 'Item', 'Supporter']
const RARITIES   = ['', 'Common', 'Uncommon', 'Rare', 'Rare Holo', 'Rare Ultra', 'Rare Secret', 'Illustration Rare']

const SORT_OPTIONS = [
  { label: 'Newest', value: '-set.releaseDate' },
  { label: 'Oldest', value: 'set.releaseDate'  },
  { label: 'A → Z',  value: 'name'             },
  { label: 'Z → A',  value: '-name'            },
]

interface CommittedFilters {
  name: string
  types: string[]
  supertype: string
  subtype: string
  rarity: string
}

interface RecentSearch {
  id: string
  label: string
  thumbnail: string
  committed: CommittedFilters
  standardOnly: boolean
  sortBy: string
}

function buildQuery(f: CommittedFilters, standardOnly: boolean) {
  const parts: string[] = []
  if (f.name.trim()) {
    const n = f.name.trim()
    parts.push(n.includes(' ') ? `name:"${n}"` : `name:${n}*`)
  }
  if (f.types.length === 1) parts.push(`types:${f.types[0]}`)
  else if (f.types.length > 1) parts.push(`(${f.types.map(t => `types:${t}`).join(' OR ')})`)
  if (f.supertype) parts.push(`supertype:${f.supertype}`)
  if (f.subtype)   parts.push(`subtypes:"${f.subtype}"`)
  if (f.rarity)    parts.push(`rarity:"${f.rarity}"`)
  if (standardOnly) parts.push('legalities.standard:legal')
  return parts.join(' ')
}

function searchLabel(f: CommittedFilters, standardOnly: boolean) {
  if (f.name.trim()) return f.name.trim()
  if (f.types.length > 0) return f.types.join(' + ')
  if (f.supertype) return f.supertype
  if (standardOnly) return 'Current Rotation'
  return 'All cards'
}

export default function CardSearch({ onAddCard }: Props) {
  const [formName,    setFormName]    = useState('')
  const [formTypes,   setFormTypes]   = useState<string[]>([])
  const [supertype,   setSupertype]   = useState('')
  const [subtype,     setSubtype]     = useState('')
  const [rarity,      setRarity]      = useState('')
  const [showFilters, setShowFilters] = useState(false)

  const [sortBy,       setSortBy]       = useState('-set.releaseDate')
  const [standardOnly, setStandardOnly] = useState(false)
  const [page,         setPage]         = useState(1)
  const [committed,    setCommitted]    = useState<CommittedFilters | null>(null)

  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([])

  const query = committed ? buildQuery(committed, standardOnly) : ''
  const { data, isLoading, isFetching } = useCardSearch(query, page, sortBy, committed !== null)

  // When results arrive, snapshot this search into the recent list
  useEffect(() => {
    if (!data?.data?.[0] || !committed) return
    const thumbnail = data.data[0].images.small
    const label     = searchLabel(committed, standardOnly)
    const id        = query || '__all__'
    setRecentSearches(prev => {
      const without = prev.filter(s => s.id !== id)
      return [{ id, label, thumbnail, committed, standardOnly, sortBy }, ...without].slice(0, 8)
    })
  }, [data])

  function restoreSearch(s: RecentSearch) {
    setFormName(s.committed.name)
    setFormTypes(s.committed.types)
    setSupertype(s.committed.supertype)
    setSubtype(s.committed.subtype)
    setRarity(s.committed.rarity)
    setStandardOnly(s.standardOnly)
    setSortBy(s.sortBy)
    setCommitted(s.committed)
    setPage(1)
  }

  function toggleType(t: string) {
    setFormTypes(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t])
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    setPage(1)
    setCommitted({ name: formName, types: formTypes, supertype, subtype, rarity })
  }

  function handleClear() {
    setFormName(''); setFormTypes([]); setSupertype(''); setSubtype(''); setRarity('')
    setStandardOnly(false); setCommitted(null); setPage(1)
  }

  const activeFilterCount =
    formTypes.length + (supertype ? 1 : 0) + (subtype ? 1 : 0) + (rarity ? 1 : 0) + (standardOnly ? 1 : 0)

  const selectStyle: React.CSSProperties = {
    background: '#fff', border: '1.5px solid #fce7f3', borderRadius: 10,
    color: '#9d174d', fontSize: 12, padding: '6px 10px', outline: 'none', cursor: 'pointer',
  }

  function Pill({ label, active, onClick, activeColor = '#ec4899' }: {
    label: string; active: boolean; onClick: () => void; activeColor?: string
  }) {
    return (
      <button type="button" onClick={onClick} style={{
        padding: '4px 11px', borderRadius: 99, fontSize: 12, fontWeight: 500, cursor: 'pointer',
        border: `1.5px solid ${active ? activeColor : '#fce7f3'}`,
        background: active ? '#fce7f3' : '#fff',
        color: active ? activeColor : '#9d174d',
        transition: 'all 0.12s',
      }}>
        {label}
      </button>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <form onSubmit={handleSearch} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>

        {/* Search bar */}
        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 15, height: 15, color: '#f9a8d4' }} />
            <input
              value={formName}
              onChange={e => setFormName(e.target.value)}
              placeholder="Search by name…"
              style={{
                width: '100%', paddingLeft: 36, paddingRight: 14, paddingTop: 10, paddingBottom: 10,
                borderRadius: 14, border: '1.5px solid #fce7f3', background: '#fff',
                fontSize: 14, color: '#3b1f2b', outline: 'none', boxSizing: 'border-box',
              }}
              onFocus={e => (e.target.style.borderColor = '#f9a8d4')}
              onBlur={e  => (e.target.style.borderColor = '#fce7f3')}
            />
          </div>
          <button type="button" onClick={() => setShowFilters(f => !f)} style={{
            padding: '10px 14px', borderRadius: 14, cursor: 'pointer',
            border: `1.5px solid ${showFilters || activeFilterCount > 0 ? '#ec4899' : '#fce7f3'}`,
            background: showFilters || activeFilterCount > 0 ? '#fce7f3' : '#fff',
            color: '#ec4899', display: 'flex', alignItems: 'center', gap: 5,
          }}>
            <SlidersHorizontal style={{ width: 15, height: 15 }} />
            {activeFilterCount > 0 && (
              <span style={{ fontSize: 10, fontWeight: 700, background: '#ec4899', color: '#fff', borderRadius: 99, padding: '1px 6px' }}>
                {activeFilterCount}
              </span>
            )}
          </button>
          <button type="submit" style={{
            padding: '10px 20px', borderRadius: 14, border: 'none', cursor: 'pointer',
            fontWeight: 600, fontSize: 13, color: '#fff',
            background: 'linear-gradient(135deg, #f472b6, #c084fc)',
          }}>
            Search
          </button>
        </div>

        {/* Sort + Rotation */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: 11, color: '#c084fc', fontWeight: 600, marginRight: 2 }}>Sort:</span>
          {SORT_OPTIONS.map(opt => (
            <Pill key={opt.value} label={opt.label} active={sortBy === opt.value} onClick={() => { setSortBy(opt.value); setPage(1) }} />
          ))}
          <div style={{ width: 1, height: 18, background: '#fce7f3', margin: '0 4px' }} />
          <Pill label={`${standardOnly ? '✓' : '○'} Current Rotation`} active={standardOnly} onClick={() => { setStandardOnly(v => !v); setPage(1) }} activeColor="#7c3aed" />
        </div>

        {/* Filter panel */}
        {showFilters && (
          <div style={{ background: '#fff', border: '1.5px solid #fce7f3', borderRadius: 16, padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <p style={{ fontSize: 11, fontWeight: 600, color: '#c084fc', textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 8px' }}>Energy Type</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {TYPES.map(t => <Pill key={t} label={`${TYPE_EMOJI[t]} ${t}`} active={formTypes.includes(t)} onClick={() => toggleType(t)} />)}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {[
                { label: 'Supertype', value: supertype, set: setSupertype, opts: SUPERTYPES },
                { label: 'Subtype',   value: subtype,   set: setSubtype,   opts: SUBTYPES  },
                { label: 'Rarity',    value: rarity,    set: setRarity,    opts: RARITIES  },
              ].map(f => (
                <div key={f.label}>
                  <p style={{ fontSize: 11, fontWeight: 600, color: '#c084fc', textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 6px' }}>{f.label}</p>
                  <select value={f.value} onChange={e => f.set(e.target.value)} style={selectStyle}>
                    {f.opts.map(o => <option key={o} value={o}>{o || 'Any'}</option>)}
                  </select>
                </div>
              ))}
            </div>
            {activeFilterCount > 0 && (
              <button type="button" onClick={handleClear} style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#f472b6', fontSize: 12, background: 'none', border: 'none', cursor: 'pointer', width: 'fit-content' }}>
                <X style={{ width: 12, height: 12 }} /> Clear all
              </button>
            )}
          </div>
        )}

        {query && (
          <p style={{ fontSize: 11, color: '#9333ea', background: '#fdf4ff', borderRadius: 8, padding: '4px 10px', margin: 0 }}>
            🔍 <code>{query}</code>
          </p>
        )}
      </form>

      {isLoading && <div style={{ textAlign: 'center', padding: '40px 0', color: '#f9a8d4', fontSize: 14 }}>Loading cards… ✨</div>}

      {data && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#c084fc' }}>
            <span>{data.totalCount.toLocaleString()} cards found</span>
            {isFetching && <span>Refreshing…</span>}
          </div>

          <CardGrid cards={data.data} onAdd={onAddCard} />

          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, paddingTop: 8 }}>
            <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
              style={{ padding: '7px 16px', borderRadius: 99, border: '1.5px solid #fce7f3', background: '#fff', color: page === 1 ? '#f9a8d4' : '#ec4899', fontSize: 12, cursor: page === 1 ? 'default' : 'pointer', opacity: page === 1 ? 0.5 : 1 }}>
              ← Prev
            </button>
            <span style={{ fontSize: 12, color: '#c084fc' }}>{page} / {Math.ceil((data.totalCount || 1) / 20)}</span>
            <button disabled={page * 20 >= data.totalCount} onClick={() => setPage(p => p + 1)}
              style={{ padding: '7px 16px', borderRadius: 99, border: '1.5px solid #fce7f3', background: '#fff', color: page * 20 >= data.totalCount ? '#f9a8d4' : '#ec4899', fontSize: 12, cursor: page * 20 >= data.totalCount ? 'default' : 'pointer', opacity: page * 20 >= data.totalCount ? 0.5 : 1 }}>
              Next →
            </button>
          </div>
        </>
      )}

      {/* Recent searches row */}
      {recentSearches.length > 0 && (
        <div style={{ marginTop: 8, paddingTop: 12, borderTop: '1.5px solid #fce7f3' }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: '#c084fc', textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 10px' }}>
            Recent searches
          </p>
          <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 4 }}>
            {recentSearches.map(s => (
              <button
                key={s.id}
                type="button"
                onClick={() => restoreSearch(s)}
                title={`Re-run: ${s.label}`}
                style={{
                  flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5,
                  padding: 0, background: 'none', border: 'none', cursor: 'pointer',
                }}
              >
                <div style={{
                  width: 52, borderRadius: 10, overflow: 'hidden',
                  border: '2px solid #fce7f3', transition: 'border-color 0.12s, transform 0.12s',
                }}
                  onMouseEnter={e => { const el = e.currentTarget; el.style.borderColor = '#f472b6'; el.style.transform = 'translateY(-2px)' }}
                  onMouseLeave={e => { const el = e.currentTarget; el.style.borderColor = '#fce7f3'; el.style.transform = '' }}
                >
                  <img src={s.thumbnail} alt={s.label} style={{ width: '100%', display: 'block' }} />
                </div>
                <span style={{
                  fontSize: 10, color: '#9d174d', fontWeight: 600, maxWidth: 58,
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {s.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
