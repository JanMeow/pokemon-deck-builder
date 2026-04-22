import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { listDecks, createDeck, updateDeck, deleteDeck } from '../api/client'
import type { DeckCard } from '../types/pokemon'

export function useDecks(q = '', page = 1, pageSize = 20) {
  return useQuery({
    queryKey: ['decks', q, page, pageSize],
    queryFn: () => listDecks(q, page, pageSize),
  })
}

export function useCreateDeck() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ name, cards }: { name: string; cards: DeckCard[] }) =>
      createDeck(name, cards),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['decks'] }),
  })
}

export function useUpdateDeck() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, name, cards }: { id: string; name: string; cards: DeckCard[] }) =>
      updateDeck(id, name, cards),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['decks'] }),
  })
}

export function useDeleteDeck() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteDeck(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['decks'] }),
  })
}
