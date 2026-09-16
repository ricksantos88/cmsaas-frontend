import { http } from '@/shared/api/http'
import type {
  InviteUserRequest,
  UpdateUserRolesRequest,
  UserInviteResponse,
  UserSummary,
} from '@/shared/types/domain'

export const usersApi = {
  /** Listar usuários operadores da igreja atual. */
  list: () => http.get<UserSummary[]>('/api/v1/users').then((r) => r.data),

  /** Enviar convite com token numérico de 4 dígitos para operador da igreja (ADR-006). */
  invite: (payload: InviteUserRequest) =>
    http.post<UserInviteResponse>('/api/v1/users/invites', payload).then((r) => r.data),

  /** Alterar papéis (roles) de um usuário (ADR-0013). */
  updateRoles: (userId: string, payload: UpdateUserRolesRequest) =>
    http.put<UserSummary>(`/api/v1/users/${userId}/roles`, payload).then((r) => r.data),
}
