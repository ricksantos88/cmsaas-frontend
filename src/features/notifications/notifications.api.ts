import { http, omitUndefined } from '@/shared/api/http'
import type { IsoInstant } from '@/shared/types/api'
import type {
  Audience,
  InboxResponse,
  NotificationChannel,
  NotificationType,
} from '@/shared/types/domain'

const BASE = '/api/v1/notifications'

export interface CreateNotificationInput {
  type: NotificationType
  title: string
  body: string
  channels: NotificationChannel[]
  audience: Audience
  scheduledFor?: IsoInstant
}

export interface PreferencesResponse {
  channels: { push: boolean; email: boolean }
  types: Record<NotificationType, { push: boolean; email: boolean }>
}

export const notificationsApi = {
  /** Inbox do próprio usuário — nunca a de outra pessoa. */
  inbox: (params: { page?: number; limit?: number; unreadOnly?: boolean; type?: NotificationType }) =>
    http.get<InboxResponse>(BASE, { params }).then((r) => r.data),

  markAsRead: (id: string) => http.patch<void>(`${BASE}/${id}/read`).then(() => undefined),

  markAllAsRead: () =>
    http.patch<{ markedAsRead: number }>(`${BASE}/read-all`).then((r) => r.data),

  /** Cria a ordem de envio; os destinatários são resolvidos no disparo. */
  create: (input: CreateNotificationInput) =>
    http.post(BASE, omitUndefined({ ...input })).then((r) => r.data),

  preferences: () => http.get<PreferencesResponse>(`${BASE}/preferences`).then((r) => r.data),

  updatePreferences: (types: PreferencesResponse['types']) =>
    http.put<void>(`${BASE}/preferences`, { types }).then(() => undefined),
}
