import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { churchApi, type ChurchPayload } from './church.api'
import type { PageParams } from '@/shared/types/api'

export const churchKeys = {
  all: ['churches'] as const,
  list: (filters: PageParams & { search?: string }) => [...churchKeys.all, 'list', filters] as const,
  detail: (id: string) => [...churchKeys.all, 'detail', id] as const,
}

export function useChurch(id: string | undefined | null) {
  return useQuery({
    queryKey: churchKeys.detail(id ?? ''),
    queryFn: () => churchApi.getById(id as string),
    enabled: Boolean(id),
  })
}

export function useUpdateChurch(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: ChurchPayload) => churchApi.update(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: churchKeys.all }),
  })
}

export function useChurches(filters: PageParams & { search?: string }) {
  return useQuery({
    queryKey: churchKeys.list(filters),
    queryFn: () => churchApi.list(filters),
    placeholderData: (previous) => previous,
  })
}

export function useCreateChurch() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: ChurchPayload) => churchApi.create(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: churchKeys.all }),
  })
}

export function useDeleteChurch() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => churchApi.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: churchKeys.all }),
  })
}
