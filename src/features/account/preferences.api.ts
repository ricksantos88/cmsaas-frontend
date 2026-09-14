/**
 * Chamadas de preferências da conta do usuário.
 * Endpoint: `/api/v1/notifications/preferences` (ADR-006).
 */
import { http } from '@/shared/api/http'
import type { NotificationType } from '@/shared/types/domain'

export interface PreferencesResponse {
  channels: { push: boolean; email: boolean }
  types: Record<NotificationType, { push: boolean; email: boolean }>
}

export const preferencesApi = {
  get: () =>
    http.get<PreferencesResponse>('/api/v1/notifications/preferences').then((r) => r.data),

  update: (types: PreferencesResponse['types']) =>
    http.put<void>('/api/v1/notifications/preferences', { types }).then(() => undefined),
}
