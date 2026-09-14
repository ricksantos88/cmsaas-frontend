import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { pastoralCareApi } from './pastoral-care.api'
import type { CreatePastoralRecordRequest } from '@/shared/types/domain'

export const pastoralCareKeys = {
  all: ['pastoral-care'] as const,
  member: (memberId: string) => [...pastoralCareKeys.all, 'member', memberId] as const,
}

export function usePastoralCare(memberId: string | undefined) {
  return useQuery({
    queryKey: pastoralCareKeys.member(memberId ?? ''),
    queryFn: () => pastoralCareApi.listByMember(memberId as string),
    enabled: Boolean(memberId),
  })
}

export function useCreatePastoralRecord(memberId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreatePastoralRecordRequest) =>
      pastoralCareApi.create(memberId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pastoralCareKeys.member(memberId) })
    },
  })
}
