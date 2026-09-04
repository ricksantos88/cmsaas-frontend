import { create } from 'zustand'
import { authApi } from './auth.api'
import { refreshAccessToken, setSessionExpiredHandler } from '@/shared/api/http'
import { tokenStore } from '@/shared/api/token-store'
import { ADMIN_ROLES } from '@/shared/types/roles'
import { hasRole } from './permissions'
import type { LoginRequest, UserInfo } from '@/shared/types/domain'
import { ApiError } from '@/shared/api/api-error'

interface SessionState {
  user: UserInfo | null
  /** `loading` até o boot decidir se há sessão válida — evita piscar o login. */
  status: 'loading' | 'authenticated' | 'anonymous'
  login: (credentials: LoginRequest) => Promise<void>
  logout: () => Promise<void>
  restore: () => Promise<void>
}

export const useSessionStore = create<SessionState>((set) => ({
  user: null,
  status: 'loading',

  async login(credentials) {
    const session = await authApi.login(credentials)

    // A web é canal administrativo: MEMBER/GUEST usam o app (ADR-002).
    if (!hasRole(session.user.roles, ADMIN_ROLES)) {
      throw new ApiError(
        403,
        'CHANNEL_NOT_ALLOWED',
        'Este console é da administração da igreja. Membros acessam pelo aplicativo.',
      )
    }

    tokenStore.setAccessToken(session.accessToken)
    tokenStore.setRefreshToken(session.refreshToken)
    set({ user: session.user, status: 'authenticated' })
  },

  async logout() {
    const refreshToken = tokenStore.getRefreshToken()
    // Revogar o refresh no servidor é o que encerra a sessão de fato; falhar aqui
    // (offline, token já revogado) não pode impedir a saída local.
    if (refreshToken) await authApi.logout(refreshToken).catch(() => undefined)
    tokenStore.clear()
    set({ user: null, status: 'anonymous' })
  },

  /**
   * Boot da aplicação (inclusive depois de um F5).
   *
   * O access token vive só em memória, então recarregar a página o perde. O
   * refresh token sobrevive no storage: renovamos primeiro e só então
   * perguntamos quem é o usuário — assim o boot não depende de tomar um 401.
   */
  async restore() {
    if (!tokenStore.getRefreshToken()) {
      set({ user: null, status: 'anonymous' })
      return
    }
    try {
      if (!tokenStore.getAccessToken()) await refreshAccessToken()
      const user = await authApi.me()
      set({ user, status: 'authenticated' })
    } catch {
      // Refresh recusado (expirado, revogado por troca de senha): sessão acabou.
      tokenStore.clear()
      set({ user: null, status: 'anonymous' })
    }
  },
}))

setSessionExpiredHandler(() => {
  useSessionStore.setState({ user: null, status: 'anonymous' })
})
