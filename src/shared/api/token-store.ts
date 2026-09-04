/**
 * Guarda os tokens da sessão.
 *
 * O access token fica **só em memória** — some ao fechar a aba, e XSS não o
 * encontra num lugar previsível. O refresh token vai para o `localStorage`
 * porque o backend o devolve no corpo (não é cookie httpOnly) e sem ele um F5
 * derrubaria a sessão. Trade-off registrado na ADR-004 do frontend.
 */
const REFRESH_KEY = 'cmsaas.refreshToken'

let accessToken: string | null = null

export const tokenStore = {
  getAccessToken: (): string | null => accessToken,

  setAccessToken(token: string | null): void {
    accessToken = token
  },

  getRefreshToken(): string | null {
    try {
      return localStorage.getItem(REFRESH_KEY)
    } catch {
      return null
    }
  },

  setRefreshToken(token: string | null): void {
    try {
      if (token) localStorage.setItem(REFRESH_KEY, token)
      else localStorage.removeItem(REFRESH_KEY)
    } catch {
      /* modo privado / storage bloqueado: a sessão vira só-memória */
    }
  },

  clear(): void {
    accessToken = null
    this.setRefreshToken(null)
  },
}
