import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { musiciansApi, type MusicianFilters, type MusicianPayload } from './musicians.api'

export const musicianKeys = {
  all: ['musicians'] as const,
  list: (filters: MusicianFilters) => [...musicianKeys.all, 'list', filters] as const,
  detail: (id: string) => [...musicianKeys.all, 'detail', id] as const,
}

export function useMusicians(filters: MusicianFilters) {
  return useQuery({
    queryKey: musicianKeys.list(filters),
    queryFn: () => musiciansApi.list(filters),
    placeholderData: (previous) => previous,
  })
}

export function useMusicianOptions() {
  return useQuery({
    queryKey: musicianKeys.list({ page: 1, limit: 100, status: 'ACTIVE' }),
    queryFn: () => musiciansApi.list({ page: 1, limit: 100, status: 'ACTIVE' }),
    staleTime: 5 * 60_000,
  })
}

export function useMusician(id: string | undefined) {
  return useQuery({
    queryKey: musicianKeys.detail(id ?? ''),
    queryFn: () => musiciansApi.getById(id as string),
    enabled: Boolean(id),
  })
}

export function useSaveMusician(id?: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: MusicianPayload) =>
      id ? musiciansApi.update(id, payload) : musiciansApi.create(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: musicianKeys.all }),
  })
}

export function useDeleteMusician() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => musiciansApi.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: musicianKeys.all }),
  })
}
