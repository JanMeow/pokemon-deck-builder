import { useQuery } from '@tanstack/react-query'
import { searchCards, getCard, getSets } from '../api/client'

export function useCardSearch(query: string, page = 1, orderBy = '-set.releaseDate', enabled?: boolean) {
  return useQuery({
    queryKey: ['cards', query, page, orderBy],
    queryFn: () => searchCards(query, page, 20, orderBy),
    enabled: enabled ?? query.length >= 2,
    staleTime: 1000 * 60 * 10,
  })
}

export function useCard(cardId: string) {
  return useQuery({
    queryKey: ['card', cardId],
    queryFn: () => getCard(cardId),
    enabled: !!cardId,
    staleTime: 1000 * 60 * 30,
  })
}

export function useSets() {
  return useQuery({
    queryKey: ['sets'],
    queryFn: getSets,
    staleTime: 1000 * 60 * 60,
  })
}
