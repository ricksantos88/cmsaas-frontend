import { beforeEach, describe, expect, it, vi } from 'vitest'
import { http as msw, HttpResponse } from 'msw'
import { http, setSessionExpiredHandler } from './http'
import { ApiError } from './api-error'
import { tokenStore } from './token-store'
import { server } from '@/test/msw/server'

describe('renovação de sessão no interceptor', () => {
  beforeEach(() => {
    tokenStore.setAccessToken('expirado')
    tokenStore.setRefreshToken('refresh-valido')
  })

  it('renova o access token no 401 e repete a requisição original', async () => {
    let attempts = 0

    server.use(
      msw.get('*/api/v1/members', ({ request }) => {
        attempts += 1
        const authorization = request.headers.get('Authorization')
        if (authorization !== 'Bearer novo-token') {
          return HttpResponse.json(
            { error: { code: 'INVALID_TOKEN', message: 'expirado' }, traceId: 't', timestamp: '' },
            { status: 401 },
          )
        }
        return HttpResponse.json({ data: [], pagination: {} })
      }),
      msw.post('*/api/v1/auth/refresh', () => HttpResponse.json({ accessToken: 'novo-token' })),
    )

    const response = await http.get('/api/v1/members')

    expect(response.status).toBe(200)
    expect(attempts).toBe(2)
    expect(tokenStore.getAccessToken()).toBe('novo-token')
  })

  it('dispara um único refresh para várias requisições simultâneas', async () => {
    let refreshes = 0

    server.use(
      msw.get('*/api/v1/members', ({ request }) =>
        request.headers.get('Authorization') === 'Bearer novo-token'
          ? HttpResponse.json({ data: [], pagination: {} })
          : HttpResponse.json(
              { error: { code: 'INVALID_TOKEN', message: 'expirado' }, traceId: 't', timestamp: '' },
              { status: 401 },
            ),
      ),
      msw.post('*/api/v1/auth/refresh', () => {
        refreshes += 1
        return HttpResponse.json({ accessToken: 'novo-token' })
      }),
    )

    await Promise.all([
      http.get('/api/v1/members'),
      http.get('/api/v1/members'),
      http.get('/api/v1/members'),
    ])

    expect(refreshes).toBe(1)
  })

  it('derruba a sessão quando o refresh falha', async () => {
    const onExpired = vi.fn()
    setSessionExpiredHandler(onExpired)

    server.use(
      msw.get('*/api/v1/members', () =>
        HttpResponse.json(
          { error: { code: 'INVALID_TOKEN', message: 'expirado' }, traceId: 't', timestamp: '' },
          { status: 401 },
        ),
      ),
      msw.post('*/api/v1/auth/refresh', () => new HttpResponse(null, { status: 401 })),
    )

    await expect(http.get('/api/v1/members')).rejects.toBeInstanceOf(ApiError)

    expect(onExpired).toHaveBeenCalledOnce()
    expect(tokenStore.getAccessToken()).toBeNull()
    expect(tokenStore.getRefreshToken()).toBeNull()

    setSessionExpiredHandler(() => {})
  })

  it('renova em rota protegida de /auth (o me restaura a sessão no F5)', async () => {
    let refreshes = 0
    server.use(
      msw.get('*/api/v1/auth/me', ({ request }) =>
        request.headers.get('Authorization') === 'Bearer novo-token'
          ? HttpResponse.json({ id: 'u-1', email: 'joao@igreja.com' })
          : HttpResponse.json(
              { error: { code: 'INVALID_TOKEN', message: 'expirado' }, traceId: 't', timestamp: '' },
              { status: 401 },
            ),
      ),
      msw.post('*/api/v1/auth/refresh', () => {
        refreshes += 1
        return HttpResponse.json({ accessToken: 'novo-token' })
      }),
    )

    const response = await http.get('/api/v1/auth/me')

    expect(response.status).toBe(200)
    expect(refreshes).toBe(1)
  })

  it('não tenta renovar quando a própria rota de auth falha', async () => {
    let refreshes = 0
    server.use(
      msw.post('*/api/v1/auth/login', () =>
        HttpResponse.json(
          { error: { code: 'INVALID_TOKEN', message: 'credenciais' }, traceId: 't', timestamp: '' },
          { status: 401 },
        ),
      ),
      msw.post('*/api/v1/auth/refresh', () => {
        refreshes += 1
        return HttpResponse.json({ accessToken: 'novo-token' })
      }),
    )

    await expect(http.post('/api/v1/auth/login', {})).rejects.toBeInstanceOf(ApiError)
    expect(refreshes).toBe(0)
  })
})
