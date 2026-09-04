import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http } from 'msw'
import { AccountPage } from './AccountPage'
import { renderWithProviders } from '@/test/render'
import { server } from '@/test/msw/server'
import { errorResponse } from '@/test/msw/handlers'
import { useSessionStore } from '@/features/auth/session.store'
import { fakeSession } from '@/test/msw/handlers'
import { tokenStore } from '@/shared/api/token-store'

/**
 * O `navigate` real dispara uma navegação do React Router, que constrói um
 * `Request` com o `AbortSignal` do jsdom — e o `Request` do MSW (undici) rejeita
 * sinal de outro realm. Espionar é melhor que navegar: o teste passa a afirmar
 * *para onde* a tela manda o usuário, que é o comportamento que importa.
 */
const navigate = vi.fn()
vi.mock('react-router', async (importOriginal) => ({
  ...(await importOriginal<Record<string, unknown>>()),
  useNavigate: () => navigate,
}))

describe('minha conta', () => {
  beforeEach(() => navigate.mockClear())

  it('carrega o perfil no formulário e mantém perfis de acesso em leitura', () => {
    renderWithProviders(<AccountPage />, { roles: ['PASTOR_PRESIDENT'] })

    expect(screen.getByLabelText(/^nome/i)).toHaveValue('Pastor João Silva')
    expect(screen.getByLabelText(/^e-mail/i)).toHaveValue('joao@igreja.com')
    expect(screen.getByText('Pastor presidente')).toBeInTheDocument()
    expect(
      screen.getByText(/perfis de acesso e vínculo com a igreja são definidos pela administração/i),
    ).toBeInTheDocument()
  })

  it('salva o nome sem pedir senha e sem derrubar a sessão', async () => {
    let payload: Record<string, unknown> | undefined
    server.use(
      http.put('*/api/v1/auth/me', async ({ request }) => {
        payload = (await request.json()) as Record<string, unknown>
        return Response.json({ ...fakeSession.user, name: 'João P. Silva' })
      }),
    )

    const user = userEvent.setup({ pointerEventsCheck: 0 })
    renderWithProviders(<AccountPage />, { roles: ['PASTOR_PRESIDENT'] })

    const nome = screen.getByLabelText(/^nome/i)
    await user.clear(nome)
    await user.type(nome, 'João P. Silva')
    // Sem trocar o e-mail, o campo de senha nem aparece.
    expect(screen.queryByLabelText(/senha atual/i)).toBeInTheDocument() // o card de senha tem o seu
    await user.click(screen.getByRole('button', { name: /salvar dados/i }))

    await waitFor(() => expect(payload).toBeDefined())
    expect(payload).toMatchObject({ name: 'João P. Silva' })
    expect(payload).not.toHaveProperty('currentPassword')
    expect(useSessionStore.getState().status).toBe('authenticated')
  })

  it('exige a senha atual ao trocar o e-mail', async () => {
    let called = false
    server.use(
      http.put('*/api/v1/auth/me', () => {
        called = true
        return Response.json(fakeSession.user)
      }),
    )

    const user = userEvent.setup({ pointerEventsCheck: 0 })
    renderWithProviders(<AccountPage />, { roles: ['PASTOR_PRESIDENT'] })

    const email = screen.getByLabelText(/^e-mail/i)
    await user.clear(email)
    await user.type(email, 'novo@igreja.com')
    await user.click(screen.getByRole('button', { name: /salvar dados/i }))

    expect(await screen.findByText(/confirme sua senha para alterar o e-mail/i)).toBeInTheDocument()
    expect(called).toBe(false)
  })

  it('encerra a sessão depois de trocar o e-mail', async () => {
    tokenStore.setRefreshToken('refresh-token')

    const user = userEvent.setup({ pointerEventsCheck: 0 })
    renderWithProviders(<AccountPage />, { roles: ['PASTOR_PRESIDENT'] })

    const email = screen.getByLabelText(/^e-mail/i)
    await user.clear(email)
    await user.type(email, 'novo@igreja.com')
    await user.type(screen.getAllByLabelText(/senha atual/i)[0], 'senhaAtual123')
    await user.click(screen.getByRole('button', { name: /salvar dados/i }))

    await waitFor(() => expect(useSessionStore.getState().status).toBe('anonymous'))
    expect(navigate).toHaveBeenCalledWith('/login', { replace: true })
  })

  it('mostra e-mail duplicado no campo de e-mail', async () => {
    server.use(
      http.put('*/api/v1/auth/me', () =>
        errorResponse(409, 'EMAIL_ALREADY_EXISTS', 'Este e-mail já está em uso'),
      ),
    )

    const user = userEvent.setup({ pointerEventsCheck: 0 })
    renderWithProviders(<AccountPage />, { roles: ['PASTOR_PRESIDENT'] })

    const email = screen.getByLabelText(/^e-mail/i)
    await user.clear(email)
    await user.type(email, 'ocupado@igreja.com')
    await user.type(screen.getAllByLabelText(/senha atual/i)[0], 'senhaAtual123')
    await user.click(screen.getByRole('button', { name: /salvar dados/i }))

    expect(await screen.findByText(/este e-mail já está em uso/i)).toBeInTheDocument()
  })

  it('exige que a confirmação da nova senha confira', async () => {
    const user = userEvent.setup({ pointerEventsCheck: 0 })
    renderWithProviders(<AccountPage />, { roles: ['ADMIN_CHURCH'] })

    await user.type(screen.getByLabelText(/senha atual/i), 'senhaAntiga1')
    await user.type(screen.getByLabelText(/^nova senha/i), 'senhaNova123')
    await user.type(screen.getByLabelText(/repita a nova senha/i), 'senhaDiferente')
    await user.click(screen.getByRole('button', { name: /alterar senha/i }))

    expect(await screen.findByText('As senhas não conferem')).toBeInTheDocument()
  })

  it('recusa nova senha igual à atual sem chamar a API', async () => {
    let called = false
    server.use(
      http.post('*/api/v1/auth/change-password', () => {
        called = true
        return new Response(null, { status: 204 })
      }),
    )

    const user = userEvent.setup({ pointerEventsCheck: 0 })
    renderWithProviders(<AccountPage />, { roles: ['ADMIN_CHURCH'] })

    await user.type(screen.getByLabelText(/senha atual/i), 'mesmaSenha123')
    await user.type(screen.getByLabelText(/^nova senha/i), 'mesmaSenha123')
    await user.type(screen.getByLabelText(/repita a nova senha/i), 'mesmaSenha123')
    await user.click(screen.getByRole('button', { name: /alterar senha/i }))

    expect(await screen.findByText(/precisa ser diferente da atual/i)).toBeInTheDocument()
    expect(called).toBe(false)
  })

  it('encerra a sessão depois de trocar a senha (o backend revoga tudo)', async () => {
    tokenStore.setRefreshToken('refresh-token')

    const user = userEvent.setup({ pointerEventsCheck: 0 })
    renderWithProviders(<AccountPage />, { roles: ['ADMIN_CHURCH'] })

    await user.type(screen.getByLabelText(/senha atual/i), 'senhaAntiga1')
    await user.type(screen.getByLabelText(/^nova senha/i), 'senhaNova123')
    await user.type(screen.getByLabelText(/repita a nova senha/i), 'senhaNova123')
    await user.click(screen.getByRole('button', { name: /alterar senha/i }))

    await waitFor(() => expect(useSessionStore.getState().status).toBe('anonymous'))
    expect(tokenStore.getRefreshToken()).toBeNull()
    expect(navigate).toHaveBeenCalledWith('/login', { replace: true })
  })

  it('mostra a mensagem da API quando a senha atual está errada', async () => {
    server.use(
      http.post('*/api/v1/auth/change-password', () =>
        errorResponse(401, 'INVALID_TOKEN', 'senha atual incorreta'),
      ),
    )

    const user = userEvent.setup({ pointerEventsCheck: 0 })
    renderWithProviders(<AccountPage />, { roles: ['ADMIN_CHURCH'] })

    await user.type(screen.getByLabelText(/senha atual/i), 'errada12345')
    await user.type(screen.getByLabelText(/^nova senha/i), 'senhaNova123')
    await user.type(screen.getByLabelText(/repita a nova senha/i), 'senhaNova123')
    await user.click(screen.getByRole('button', { name: /alterar senha/i }))

    expect(await screen.findByText(/sessão expirada|senha atual incorreta/i)).toBeInTheDocument()
  })

  it('carrega e salva as preferências de notificação', async () => {
    let saved: unknown
    server.use(
      http.put('*/api/v1/notifications/preferences', async ({ request }) => {
        saved = await request.json()
        return new Response(null, { status: 204 })
      }),
    )

    const user = userEvent.setup({ pointerEventsCheck: 0 })
    renderWithProviders(<AccountPage />, { roles: ['ADMIN_CHURCH'] })

    const emailToggle = await screen.findByLabelText(/receber novo documento por e-mail/i)
    expect(emailToggle).not.toBeChecked()

    await user.click(emailToggle)
    await user.click(screen.getByRole('button', { name: /salvar preferências/i }))

    await waitFor(() => expect(saved).toBeDefined())
    expect(saved).toMatchObject({ types: { NEW_DOCUMENT: { push: false, email: true } } })
  })
})
