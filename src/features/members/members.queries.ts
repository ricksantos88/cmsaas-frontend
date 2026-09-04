import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { membersApi, type MemberFilters } from './members.api'
import type { CreateMemberRequest, UpdateMemberRequest } from '@/shared/types/domain'

/** Chaves hierárquicas: invalidar `all` realinha lista e detalhe juntos (ADR-002 R2). */
export const memberKeys = {
  all: ['members'] as const,
  list: (filters: MemberFilters) => [...memberKeys.all, 'list', filters] as const,
  detail: (id: string) => [...memberKeys.all, 'detail', id] as const,
}

export function useMembers(filters: MemberFilters) {
  return useQuery({
    queryKey: memberKeys.list(filters),
    queryFn: () => membersApi.list(filters),
    placeholderData: (previous) => previous, // troca de página sem piscar a tabela
  })
}

/** Lista enxuta para selects (líder de célula, responsável por item, músico). */
export function useMemberOptions() {
  return useQuery({
    queryKey: memberKeys.list({ page: 1, limit: 100, status: 'ACTIVE' }),
    queryFn: () => membersApi.list({ page: 1, limit: 100, status: 'ACTIVE' }),
    staleTime: 5 * 60_000,
  })
}

export function useMember(id: string | undefined) {
  return useQuery({
    queryKey: memberKeys.detail(id ?? ''),
    queryFn: () => membersApi.getById(id as string),
    enabled: Boolean(id),
  })
}

export function useCreateMember() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateMemberRequest) => membersApi.create(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: memberKeys.all }),
  })
}

export function useUpdateMember(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: UpdateMemberRequest) => membersApi.update(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: memberKeys.all }),
  })
}

export function useDeleteMember() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => membersApi.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: memberKeys.all }),
  })
}
