import axios from 'axios'
import type { Card, CardSearchResponse, Deck, DeckCard } from '../types/pokemon'

const api = axios.create({ baseURL: '/api' })

// Cards
export async function searchCards(
  query: string,
  page = 1,
  pageSize = 20,
  orderBy = '-set.releaseDate',
): Promise<CardSearchResponse> {
  const { data } = await api.get('/cards', { params: { q: query, page, pageSize, orderBy } })
  return data
}

export async function getCard(cardId: string): Promise<{ data: Card }> {
  const { data } = await api.get(`/cards/${cardId}`)
  return data
}

export async function getSets() {
  const { data } = await api.get('/cards/sets')
  return data
}

// Decks
export async function listDecks(q = '', page = 1, pageSize = 20): Promise<{ data: Deck[]; total: number }> {
  const { data } = await api.get('/decks', { params: { q, skip: (page - 1) * pageSize, limit: pageSize } })
  return data
}

export async function createDeck(name: string, cards: DeckCard[] = []): Promise<Deck> {
  const { data } = await api.post('/decks', { name, cards })
  return data
}

export async function updateDeck(deckId: string, name: string, cards: DeckCard[]): Promise<Deck> {
  const { data } = await api.put(`/decks/${deckId}`, { name, cards })
  return data
}

export async function deleteDeck(deckId: string): Promise<void> {
  await api.delete(`/decks/${deckId}`)
}

export async function importDeck(name: string, ptcglText: string): Promise<{ deck: Deck; resolved: number }> {
  const { data } = await api.post('/decks/import', { name, ptcgl_text: ptcglText })
  return data
}

export async function getMetaDecks(format = 'standard'): Promise<{ data: MetaDeck[] }> {
  const { data } = await api.get('/meta/decks', { params: { format } })
  return data
}

export async function getMetaDeckCards(deckId: string): Promise<{ data: MetaDeckCard[] }> {
  const { data } = await api.get(`/meta/decks/${deckId}`)
  return data
}

export interface MetaDeck {
  id: string
  name: string
  share: string
  count: string
  thumbnail: string
}

export interface MetaDeckCard {
  card_id: string
  quantity: number
  card: Card
}
