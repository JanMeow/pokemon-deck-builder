import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis } from 'recharts'
import type { Card, DeckCard } from '../types/pokemon'

interface Props {
  deckCards: DeckCard[]
  resolvedCards: Map<string, Card>
}

const TYPE_HEX: Record<string, string> = {
  Fire: '#fca5a5', Water: '#93c5fd', Grass: '#86efac',
  Lightning: '#fde047', Psychic: '#d8b4fe', Fighting: '#fdba74',
  Darkness: '#cbd5e1', Metal: '#e2e8f0', Dragon: '#c4b5fd',
  Colorless: '#e5e7eb',
}

const SUPERTYPE_HEX = ['#f9a8d4', '#a5b4fc', '#6ee7b7']

export default function DeckStats({ deckCards, resolvedCards }: Props) {
  const total = deckCards.reduce((s, c) => s + c.quantity, 0)

  const supertypeCounts: Record<string, number> = {}
  for (const dc of deckCards) {
    const card = resolvedCards.get(dc.card_id)
    if (!card) continue
    supertypeCounts[card.supertype] = (supertypeCounts[card.supertype] ?? 0) + dc.quantity
  }

  const typeCounts: Record<string, number> = {}
  for (const dc of deckCards) {
    const card = resolvedCards.get(dc.card_id)
    if (!card || card.supertype !== 'Pokémon') continue
    for (const t of card.types ?? ['Colorless']) {
      typeCounts[t] = (typeCounts[t] ?? 0) + dc.quantity
    }
  }

  const supertypeData = Object.entries(supertypeCounts).map(([name, value]) => ({ name, value }))
  const typeData = Object.entries(typeCounts).map(([name, value]) => ({ name, value }))

  const counterColor = total === 60 ? '#16a34a' : total > 60 ? '#dc2626' : '#d97706'
  const counterBg   = total === 60 ? '#dcfce7' : total > 60 ? '#fee2e2' : '#fef9c3'

  const tooltipStyle = { background: '#fff', border: '1px solid #fce7f3', color: '#3b1f2b', borderRadius: 10, fontSize: 12 }

  return (
    <div style={{ background: '#fff', borderRadius: 16, padding: 14, border: '1.5px solid #fce7f3', display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: '#9d174d' }}>Deck Stats</p>
        <span style={{ fontSize: 12, fontWeight: 700, background: counterBg, color: counterColor, padding: '2px 10px', borderRadius: 99 }}>
          {total}/60
        </span>
      </div>

      {total === 0 ? (
        <p style={{ fontSize: 12, color: '#f9a8d4', textAlign: 'center', padding: '12px 0' }}>
          Add cards to see stats 🌸
        </p>
      ) : (
        <>
          <div>
            <p style={{ fontSize: 10, fontWeight: 600, color: '#c084fc', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Card Breakdown</p>
            <ResponsiveContainer width="100%" height={110}>
              <PieChart>
                <Pie data={supertypeData} dataKey="value" cx="50%" cy="50%" outerRadius={46} innerRadius={22}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {supertypeData.map((_, i) => <Cell key={i} fill={SUPERTYPE_HEX[i % SUPERTYPE_HEX.length]} />)}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {typeData.length > 0 && (
            <div>
              <p style={{ fontSize: 10, fontWeight: 600, color: '#c084fc', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Energy Types</p>
              <ResponsiveContainer width="100%" height={Math.max(60, typeData.length * 22)}>
                <BarChart data={typeData} layout="vertical" margin={{ left: 0, right: 8, top: 0, bottom: 0 }}>
                  <XAxis type="number" tick={{ fontSize: 10, fill: '#c084fc' }} axisLine={false} tickLine={false} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: '#9d174d' }} width={65} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                    {typeData.map((entry, i) => (
                      <Cell key={i} fill={TYPE_HEX[entry.name] ?? '#f9a8d4'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </>
      )}
    </div>
  )
}
