import axios, { type AxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from 'axios'
import { ApiError, toApiError } from './api-error'
import { tokenStore } from './token-store'

/** Vazio em dev: o proxy do Vite encaminha `/api` para o backend. */
const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''

export const http: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 30_000,
  headers: { 'X-API-Version': '1.0' },
})

/** Chamado quando a sessão morre de vez (refresh falhou). Ligado pelo store de sessão. */
let onSessionExpired: () => void = () => {}
export function setSessionExpiredHandler(handler: () => void): void {
  onSessionExpired = handler
}

type RetriableConfig = InternalAxiosRequestConfig & { _retried?: boolean }

http.interceptors.request.use((config) => {
  const token = tokenStore.getAccessToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

/**
 * Rotas que **não podem** disparar renovação: ou são públicas (login, redefinição
 * de senha), ou são a própria renovação — tentar renovar nelas daria laço.
 *
 * O resto de `/auth/` **é** protegido e precisa da renovação como qualquer outra
 * rota: `GET /auth/me` é justamente o que restaura a sessão depois de um F5.
 */
const NO_REFRESH_ROUTES = [
  '/auth/login',
  '/auth/refresh',
  '/auth/logout',
  '/auth/forgot-password',
  '/auth/reset-password',
]

function skipsRefresh(url: string | undefined): boolean {
  return NO_REFRESH_ROUTES.some((route) => url?.includes(route))
}

/**
 * Um único refresh por vez: se cinco requisições tomam 401 juntas, quatro
 * esperam a mesma promessa em vez de disparar cinco refreshes concorrentes
 * (que invalidariam uns aos outros).
 */
let refreshing: Promise<string> | null = null

async function requestNewAccessToken(): Promise<string> {
  const refreshToken = tokenStore.getRefreshToken()
  if (!refreshToken) throw new ApiError(401, 'INVALID_TOKEN', 'Sessão expirada. Entre novamente.')

  const { data } = await axios.post<{ accessToken: string }>(
    `${BASE_URL}/api/v1/auth/refresh`,
    { refreshToken },
    { headers: { 'Content-Type': 'application/json' } },
  )
  tokenStore.setAccessToken(data.accessToken)
  return data.accessToken
}

/**
 * Renova o access token compartilhando a mesma chamada em voo. Exportado porque
 * o boot da aplicação renova **antes** de perguntar quem é o usuário: depois de
 * um F5 não existe access token em memória, e sair perguntando garantiria um 401.
 */
export function refreshAccessToken(): Promise<string> {
  refreshing ??= requestNewAccessToken().finally(() => {
    refreshing = null
  })
  return refreshing
}

http.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (!error.response) return Promise.reject(ApiError.offline())

    const { status, data } = error.response
    const config = error.config as RetriableConfig | undefined

    if (status !== 401 || !config || config._retried || skipsRefresh(config.url)) {
      return Promise.reject(toApiError(status, data))
    }

    config._retried = true
    try {
      await refreshAccessToken()
      return await http.request(config)
    } catch {
      tokenStore.clear()
      onSessionExpired()
      return Promise.reject(toApiError(401, data))
    }
  },
)

/**
 * Remove chaves `undefined` antes de mandar o payload.
 *
 * O backend distingue **ausente** (não altera) de **`null`** (limpa o campo)
 * nos updates parciais — ver contracts/README. Serializar `undefined` como
 * `null` apagaria dados sem querer.
 */
export function omitUndefined<T extends Record<string, unknown>>(payload: T): Partial<T> {
  return Object.fromEntries(Object.entries(payload).filter(([, v]) => v !== undefined)) as Partial<T>
}

/** Monta query string ignorando vazios — filtro em branco não vira `?search=`. */
export function toQuery(params: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== ''),
  )
}
