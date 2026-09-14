import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { FirstAccessPage } from './FirstAccessPage'
import { renderWithProviders } from '@/test/render'
import { server } from '@/test/msw/server'
import { useSessionStore } from './session.store'

const navigate = vi.fn()
vi.mock('react-router', async (importOriginal) => ({
  ...(await importOriginal<Record<string, unknown>>()),
  useNavigate: () => navigate,
  Navigate: () => null,
  useSearchParams: () => [new URLSearchParams('email=colaborador@igreja.com&token=1234')],
}))

describe('FirstAccessPage', () => {
  beforeEach(() => {
    navigate.mockClear()
    useSessionStore.setState({ user: null, status: 'anonymous' })
  })

  it('exibe todos os campos com valores pré-preenchidos da URL', () => {
    renderWithProviders(<FirstAccessPage />)

    expect(screen.getByRole('heading', { level: 1, name: /primeiro acesso/i })).toBeInTheDocument()
    expect(screen.getByLabelText(/e-mail/i)).toHaveValue('colaborador@igreja.com')
    expect(screen.getByLabelText(/código de 4 dígitos/i)).toHaveValue('1234')
    expect(screen.getByLabelText(/^nova senha/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/confirmar senha/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /ativar conta e entrar/i })).toBeInTheDocument()
  })

  it('valida senhas divergentes', async () => {
    const user = userEvent.setup({ pointerEventsCheck: 0 })
    renderWithProviders(<FirstAccessPage />)

    await user.type(screen.getByLabelText(/^nova senha/i), 'senha1234')
    await user.type(screen.getByLabelText(/confirmar senha/i), 'outrasenha123')
    await user.click(screen.getByRole('button', { name: /ativar conta e entrar/i }))

    expect(await screen.findByText(/as senhas não conferem/i)).toBeInTheDocument()
  })

  it('submete com sucesso e redireciona para o painel', async () => {
    const user = userEvent.setup({ pointerEventsCheck: 0 })
    let payloadSent: unknown = null

    server.use(
      http.post('*/api/v1/auth/accept-invite', async ({ request }) => {
        payloadSent = await request.json()
        return HttpResponse.json({
          accessToken: 'test-token',
          refreshToken: 'test-refresh',
          tokenType: 'Bearer',
          expiresIn: 3600,
          user: {
            id: 'u-1',
            name: 'Colaborador',
            email: 'colaborador@igreja.com',
            roles: ['ADMIN_CHURCH'],
            churchId: 'church-1',
          },
        })
      }),
    )

    renderWithProviders(<FirstAccessPage />)

    await user.type(screen.getByLabelText(/^nova senha/i), 'senha1234')
    await user.type(screen.getByLabelText(/confirmar senha/i), 'senha1234')
    await user.click(screen.getByRole('button', { name: /ativar conta e entrar/i }))

    expect(navigate).toHaveBeenCalledWith('/painel', { replace: true })
    expect(payloadSent).toEqual({
      email: 'colaborador@igreja.com',
      token: '1234',
      password: 'senha1234',
    })
  })

  it('exibe erro caso o código seja inválido ou expirado', async () => {
    const user = userEvent.setup({ pointerEventsCheck: 0 })

    server.use(
      http.post('*/api/v1/auth/accept-invite', () => {
        return HttpResponse.json(
          {
            error: {
              code: 'VALIDATION_FAILED',
              message: 'Código de convite inválido ou expirado',
            },
          },
          { status: 400 },
        )
      }),
    )

    renderWithProviders(<FirstAccessPage />)

    await user.type(screen.getByLabelText(/^nova senha/i), 'senha1234')
    await user.type(screen.getByLabelText(/confirmar senha/i), 'senha1234')
    await user.click(screen.getByRole('button', { name: /ativar conta e entrar/i }))

    expect(await screen.findByText(/código de convite inválido ou expirado/i)).toBeInTheDocument()
  })
})
