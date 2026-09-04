import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { sermonsApi, type SermonFilters, type SermonPayload } from './sermons.api'
import type { TrendingPeriod } from '@/shared/types/domain'

export const sermonKeys = {
  all: ['sermons'] as const,
  list: (filters: SermonFilters) => [...sermonKeys.all, 'list', filters] as const,
  detail: (id: string) => [...sermonKeys.all, 'detail', id] as const,
  trending: (period: TrendingPeriod) => [...sermonKeys.all, 'trending', period] as const,
  recommendations: (id: string) => [...sermonKeys.all, 'recommendations', id] as const,
}

export function useSermons(filters: SermonFilters) {
  return useQuery({
    queryKey: sermonKeys.list(filters),
    queryFn: () => sermonsApi.list(filters),
    placeholderData: (previous) => previous,
  })
}

export function useTrendingSermons(period: TrendingPeriod = 'MONTH') {
  return useQuery({
    queryKey: sermonKeys.trending(period),
    queryFn: () => sermonsApi.trending(period),
  })
}

export function useSermon(id: string | undefined) {
  return useQuery({
    queryKey: sermonKeys.detail(id ?? ''),
    queryFn: () => sermonsApi.getById(id as string),
    enabled: Boolean(id),
  })
}

export function useSermonRecommendations(id: string | undefined) {
  return useQuery({
    queryKey: sermonKeys.recommendations(id ?? ''),
    queryFn: () => sermonsApi.recommendations(id as string),
    enabled: Boolean(id),
  })
}

export function useSaveSermon(id?: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: SermonPayload) =>
      id ? sermonsApi.update(id, payload) : sermonsApi.create(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: sermonKeys.all }),
  })
}

export function useDeleteSermon() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => sermonsApi.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: sermonKeys.all }),
  })
}
