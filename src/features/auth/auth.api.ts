import { http, omitUndefined } from '@/shared/api/http'
import type { LoginRequest, LoginResponse, UpdateMeRequest, UserInfo } from '@/shared/types/domain'

export const authApi = {
  login: (payload: LoginRequest) =>
    http.post<LoginResponse>('/api/v1/auth/login', payload).then((r) => r.data),

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
