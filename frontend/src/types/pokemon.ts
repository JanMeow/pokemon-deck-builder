export interface CardImage {
  small: string
  large: string
}

export interface CardSet {
  id: string
  name: string
  series: string
  releaseDate: string
  images: { symbol: string; logo: string }
}

export interface CardAttack {
  name: string
  cost: string[]
  convertedEnergyCost: number
  damage: string
  text: string
}

interface TcgPlayerPriceEntry {
  low?: number
  mid?: number
  high?: number
  market?: number
}

export interface Card {
  id: string
  name: string
  supertype: string        // Pokémon | Trainer | Energy
  subtypes: string[]
  hp?: string
  types?: string[]
  set: CardSet
  number: string
  rarity?: string
  images: CardImage
  attacks?: CardAttack[]
  rules?: string[]
  tcgplayer?: {
    url: string
    updatedAt: string
    prices?: {
      normal?: TcgPlayerPriceEntry
      holofoil?: TcgPlayerPriceEntry
      reverseHolofoil?: TcgPlayerPriceEntry
      '1stEditionHolofoil'?: TcgPlayerPriceEntry
    }
  }
}

export interface CardSearchResponse {
  data: Card[]
  page: number
  pageSize: number
  count: number
  totalCount: number
}

export interface DeckCard {
  card_id: string
  quantity: number
}

export interface Deck {
  id: string
  name: string
  cards: DeckCard[]
}

export interface DeckWithCards extends Deck {
  resolvedCards: { card: Card; quantity: number }[]
}
