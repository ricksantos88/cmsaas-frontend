import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { pastorsApi, type PastorFilters, type PastorPayload } from './pastors.api'

export const pastorKeys = {
  all: ['pastors'] as const,
  list: (filters: PastorFilters) => [...pastorKeys.all, 'list', filters] as const,
  detail: (id: string) => [...pastorKeys.all, 'detail', id] as const,
  contacts: (id: string) => [...pastorKeys.all, 'contacts', id] as const,
}

export function usePastors(filters: PastorFilters) {
  return useQuery({
    queryKey: pastorKeys.list(filters),
    queryFn: () => pastorsApi.list(filters),
    placeholderData: (previous) => previous,
  })
}

/** Lista enxuta para preencher selects (pastor responsável, pregador, supervisor). */
export function usePastorOptions() {
  return useQuery({
    queryKey: pastorKeys.list({ page: 1, limit: 100 }),
    queryFn: () => pastorsApi.list({ page: 1, limit: 100 }),
    staleTime: 5 * 60_000,
  })
}

export function usePastor(id: string | undefined) {
  return useQuery({
    queryKey: pastorKeys.detail(id ?? ''),
    queryFn: () => pastorsApi.getById(id as string),
    enabled: Boolean(id),
  })
}

/** Contatos com a visibilidade já aplicada pelo servidor — não filtre de novo aqui. */
export function usePastorContacts(id: string | undefined) {
  return useQuery({
    queryKey: pastorKeys.contacts(id ?? ''),
    queryFn: () => pastorsApi.contacts(id as string),
    enabled: Boolean(id),
  })
}

export function useSavePastor(id?: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: PastorPayload) =>
      id ? pastorsApi.update(id, payload) : pastorsApi.create(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: pastorKeys.all }),
  })
}

export function useDeletePastor() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => pastorsApi.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: pastorKeys.all }),
  })
}
