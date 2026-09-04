import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  notificationsApi,
  type CreateNotificationInput,
  type PreferencesResponse,
} from './notifications.api'
import type { NotificationType } from '@/shared/types/domain'

export const notificationKeys = {
  all: ['notifications'] as const,
  inbox: (params: object) => [...notificationKeys.all, 'inbox', params] as const,
  preferences: () => [...notificationKeys.all, 'preferences'] as const,
}

export function useInbox(params: { page?: number; unreadOnly?: boolean; type?: NotificationType }) {
  return useQuery({
    queryKey: notificationKeys.inbox(params),
    queryFn: () => notificationsApi.inbox({ limit: 20, ...params }),
    placeholderData: (previous) => previous,
  })
}

export function useMarkAsRead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => notificationsApi.markAsRead(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: notificationKeys.all }),
  })
}

export function useMarkAllAsRead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => notificationsApi.markAllAsRead(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: notificationKeys.all }),
  })
}

export function useSendNotification() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateNotificationInput) => notificationsApi.create(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: notificationKeys.all }),
  })
}

export function usePreferences() {
  return useQuery({
    queryKey: notificationKeys.preferences(),
    queryFn: () => notificationsApi.preferences(),
  })
}

export function useUpdatePreferences() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (types: PreferencesResponse['types']) => notificationsApi.updatePreferences(types),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: notificationKeys.preferences() }),
  })
}
