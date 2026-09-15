import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { pastoralVisitsApi } from './pastoral-visits.api'
import type {
  CompletePastoralVisitRequest,
  RequestPastoralVisitPayload,
  SchedulePastoralVisitRequest,
} from '@/shared/types/domain'

export const pastoralVisitsKeys = {
  all: ['pastoral-visits'] as const,
  list: () => [...pastoralVisitsKeys.all, 'list'] as const,
  myRequests: () => [...pastoralVisitsKeys.all, 'my-requests'] as const,
  detail: (id: string) => [...pastoralVisitsKeys.all, 'detail', id] as const,
}

export function usePastoralVisits() {
  return useQuery({
    queryKey: pastoralVisitsKeys.list(),
    queryFn: () => pastoralVisitsApi.list(),
  })
}

export function useMyPastoralVisitRequests() {
  return useQuery({
    queryKey: pastoralVisitsKeys.myRequests(),
    queryFn: () => pastoralVisitsApi.listMyRequests(),
  })
}

export function usePastoralVisit(id: string | undefined) {
  return useQuery({
    queryKey: pastoralVisitsKeys.detail(id ?? ''),
    queryFn: () => pastoralVisitsApi.getById(id as string),
    enabled: Boolean(id),
  })
}

export function useRequestPastoralVisit() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: RequestPastoralVisitPayload) => pastoralVisitsApi.requestVisit(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pastoralVisitsKeys.all })
    },
  })
}

export function useSchedulePastoralVisit() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: SchedulePastoralVisitRequest) => pastoralVisitsApi.scheduleVisit(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pastoralVisitsKeys.all })
    },
  })
}

export function useCompletePastoralVisit() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: CompletePastoralVisitRequest }) =>
      pastoralVisitsApi.completeVisit(id, payload),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: pastoralVisitsKeys.all })
      queryClient.invalidateQueries({ queryKey: pastoralVisitsKeys.detail(id) })
    },
  })
}

export function useCancelPastoralVisit() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => pastoralVisitsApi.cancelVisit(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: pastoralVisitsKeys.all })
      queryClient.invalidateQueries({ queryKey: pastoralVisitsKeys.detail(id) })
    },
  })
}
