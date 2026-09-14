import { http } from '@/shared/api/http'
import type { InviteUserRequest, UserInviteResponse } from '@/shared/types/domain'

export const usersApi = {
  /** Enviar convite com token numérico de 4 dígitos para operador da igreja (ADR-006). */
  invite: (payload: InviteUserRequest) =>
    http.post<UserInviteResponse>('/api/v1/users/invites', payload).then((r) => r.data),
}
