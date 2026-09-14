import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { cellsApi, type CellFilters, type CellPayload } from './cells.api'

export const cellKeys = {
  all: ['cells'] as const,
  list: (filters: CellFilters) => [...cellKeys.all, 'list', filters] as const,
  detail: (id: string) => [...cellKeys.all, 'detail', id] as const,
}

export function useCells(filters: CellFilters) {
  return useQuery({
    queryKey: cellKeys.list(filters),
    queryFn: () => cellsApi.list(filters),
    placeholderData: (previous) => previous,
  })
}

export function useCellOptions() {
  return useQuery({
    queryKey: cellKeys.list({ page: 1, limit: 100 }),
    queryFn: () => cellsApi.list({ page: 1, limit: 100 }),
    staleTime: 5 * 60_000,
  })
}

export function useCell(id: string | undefined) {
  return useQuery({
    queryKey: cellKeys.detail(id ?? ''),
    queryFn: () => cellsApi.getById(id as string),
    enabled: Boolean(id),
  })
}

export function useSaveCell(id?: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CellPayload) => (id ? cellsApi.update(id, payload) : cellsApi.create(payload)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: cellKeys.all }),
  })
}

export function useDeleteCell() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => cellsApi.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: cellKeys.all }),
  })
}

/** Participantes mudam o `cellId` do membro: as duas caches precisam cair. */
function useCellMembershipMutation<TVariables>(
  mutationFn: (variables: TVariables) => Promise<unknown>,
) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: cellKeys.all })
      void queryClient.invalidateQueries({ queryKey: ['members'] })
    },
  })
}

export function useAddCellMembers(id: string) {
  return useCellMembershipMutation((memberIds: string[]) => cellsApi.addMembers(id, memberIds))
}

export function useRemoveCellMember(id: string) {
  return useCellMembershipMutation((memberId: string) => cellsApi.removeMember(id, memberId))
}
