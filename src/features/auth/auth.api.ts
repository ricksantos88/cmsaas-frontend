import { http, omitUndefined } from '@/shared/api/http'
import type {
  AcceptInviteRequest,
  LoginRequest,
  LoginResponse,
  MyChurchResponse,
  RegisterChurchRequest,
  SwitchChurchRequest,
  UpdateMeRequest,
  UserInfo,
} from '@/shared/types/domain'

export const authApi = {
  login: (payload: LoginRequest) =>
    http.post<LoginResponse>('/api/v1/auth/login', payload).then((r) => r.data),

  /** Ativação de conta por convite com código de 4 dígitos (ADR-006). */
  acceptInvite: (payload: AcceptInviteRequest) =>
    http.post<LoginResponse>('/api/v1/auth/accept-invite', payload).then((r) => r.data),

  /** Listar congregações vinculadas ao usuário logado (ADR-009). */
  myChurches: () => http.get<MyChurchResponse[]>('/api/v1/auth/my-churches').then((r) => r.data),

  /** Alternar congregação ativa (ADR-009). */
  switchChurch: (data: SwitchChurchRequest) =>
    http.post<LoginResponse>('/api/v1/auth/switch-church', data).then((r) => r.data),

  /** Onboarding self-service de igreja e pastor/administrador principal (ADR-008, ADR-009). */
  registerChurch: (payload: RegisterChurchRequest) =>
    http
      .post<LoginResponse>('/api/v1/auth/register-church', omitUndefined({ ...payload }))
      .then((r) => r.data),

  me: () => http.get<UserInfo>('/api/v1/auth/me').then((r) => r.data),

  /** Nome e/ou e-mail do próprio usuário. Trocar o e-mail exige `currentPassword`. */
  updateMe: (payload: UpdateMeRequest) =>
    http.put<UserInfo>('/api/v1/auth/me', omitUndefined({ ...payload })).then((r) => r.data),

  logout: (refreshToken: string) =>
    http.post<void>('/api/v1/auth/logout', { refreshToken }).then(() => undefined),

  changePassword: (payload: { currentPassword: string; newPassword: string }) =>
    http.post<void>('/api/v1/auth/change-password', payload).then(() => undefined),

  forgotPassword: (email: string) =>
    http.post<{ message: string }>('/api/v1/auth/forgot-password', { email }).then((r) => r.data),

  resetPassword: (payload: { token: string; newPassword: string }) =>
    http.post<void>('/api/v1/auth/reset-password', payload).then(() => undefined),
}
