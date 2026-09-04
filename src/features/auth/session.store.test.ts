import { beforeEach, describe, expect, it } from 'vitest'
import { http, HttpResponse } from 'msw'
import { useSessionStore } from './session.store'
import { tokenStore } from '@/shared/api/token-store'
import { server } from '@/test/msw/server'
import { fakeSession } from '@/test/msw/handlers'
import { ApiError } from '@/shared/api/api-error'

describe('sessão do console', () => {
  beforeEach(() => {
    useSessionStore.setState({ user: null, status: 'loading' })
  })

  it('autentica um usuário administrativo', async () => {
    await useSessionStore.getState().login({ email: 'joao@igreja.com', password: 'senha12345' })

    expect(useSessionStore.getState().status).toBe('authenticated')
    expect(tokenStore.getAccessToken()).toBe('access-token')
    expect(tokenStore.getRefreshToken()).toBe('refresh-token')
  })

  it('barra o membro: a web é canal administrativo (ADR-005)', async () => {
    server.use(
      http.post('*/api/v1/auth/login', () =>
        HttpResponse.json({ ...fakeSession, user: { ...fakeSession.user, roles: ['MEMBER'] } }),
      ),
    )

    await expect(
      useSessionStore.getState().login({ email: 'membro@igreja.com', password: 'senha12345' }),
    ).rejects.toBeInstanceOf(ApiError)

    expect(useSessionStore.getState().status).not.toBe('authenticated')
    // Nada de token guardado para quem não pode usar o console.
    expect(tokenStore.getAccessToken()).toBeNull()
  })

  it('restaura a sessão a partir do refresh token guardado', async () => {
    tokenStore.setRefreshToken('refresh-token')

    await useSessionStore.getState().restore()

    expect(useSessionStore.getState().status).toBe('authenticated')
    expect(useSessionStore.getState().user?.email).toBe('joao@igreja.com')
  })

  it('sobrevive ao F5: sem access token em memória, renova antes de perguntar quem é', async () => {
    // Regressão: o `/auth/me` casava com o guard de rota pública do interceptor,
    // nunca renovava e derrubava a sessão a cada recarga da página.
    let refreshes = 0
    server.use(
      http.post('*/api/v1/auth/refresh', () => {
        refreshes += 1
        return HttpResponse.json({ accessToken: 'token-renovado', tokenType: 'Bearer', expiresIn: 3600 })
      }),
      // O backend de verdade exige o header; sem exigir, o teste não via o bug.
      http.get('*/api/v1/auth/me', ({ request }) =>
        request.headers.get('Authorization') === 'Bearer token-renovado'
          ? HttpResponse.json(fakeSession.user)
          : HttpResponse.json(
              { error: { code: 'INVALID_TOKEN', message: 'expirado' }, traceId: 't', timestamp: '' },
              { status: 401 },
            ),
      ),
    )

    // Estado depois de um F5: refresh token no storage, memória vazia.
    tokenStore.setRefreshToken('refresh-token')
    tokenStore.setAccessToken(null)

    await useSessionStore.getState().restore()

    expect(useSessionStore.getState().status).toBe('authenticated')
    expect(tokenStore.getAccessToken()).toBe('token-renovado')
    expect(refreshes).toBe(1)
  })

  it('duas recargas simultâneas compartilham um único refresh', async () => {
    let refreshes = 0
    server.use(
      http.post('*/api/v1/auth/refresh', () => {
        refreshes += 1
        return HttpResponse.json({ accessToken: 'token-renovado', tokenType: 'Bearer', expiresIn: 3600 })
      }),
    )
    tokenStore.setRefreshToken('refresh-token')

    await Promise.all([useSessionStore.getState().restore(), useSessionStore.getState().restore()])

    expect(refreshes).toBe(1)
    expect(useSessionStore.getState().status).toBe('authenticated')
  })

  it('refresh recusado encerra a sessão em vez de deixar meio-logado', async () => {
    server.use(
      http.post('*/api/v1/auth/refresh', () => new HttpResponse(null, { status: 401 })),
      http.get('*/api/v1/auth/me', () =>
        HttpResponse.json(
          { error: { code: 'INVALID_TOKEN', message: 'expirado' }, traceId: 't', timestamp: '' },
          { status: 401 },
        ),
      ),
    )
    tokenStore.setRefreshToken('refresh-vencido')

    await useSessionStore.getState().restore()

    expect(useSessionStore.getState().status).toBe('anonymous')
    expect(tokenStore.getRefreshToken()).toBeNull()
  })

  it('vai para anônimo quando não há refresh token', async () => {
    await useSessionStore.getState().restore()

    expect(useSessionStore.getState().status).toBe('anonymous')
  })
})
