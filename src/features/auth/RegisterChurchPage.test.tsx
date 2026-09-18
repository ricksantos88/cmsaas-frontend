import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { RegisterChurchPage } from './RegisterChurchPage'
import { renderWithProviders } from '@/test/render'
import { server } from '@/test/msw/server'

import { useSessionStore } from './session.store'

const navigate = vi.fn()
vi.mock('react-router', async (importOriginal) => ({
  ...(await importOriginal<Record<string, unknown>>()),
  useNavigate: () => navigate,
  Navigate: () => null,
}))

describe('RegisterChurchPage', () => {
  beforeEach(() => {
    navigate.mockClear()
    useSessionStore.setState({ user: null, status: 'anonymous' })
  })

  it('exibe todos os campos do formulário de onboarding de igreja', () => {
    renderWithProviders(<RegisterChurchPage />)

    expect(screen.getByRole('heading', { level: 1, name: /cadastre sua igreja/i })).toBeInTheDocument()
    expect(screen.getByLabelText(/nome da igreja/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/denominação/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/seu nome completo/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/e-mail de acesso/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^senha/i, { selector: 'input' })).toBeInTheDocument()
    expect(screen.getByLabelText(/seu papel nesta igreja/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /concluir cadastro e acessar/i })).toBeInTheDocument()
  })

  it('valida campos obrigatórios ao submeter vazio', async () => {
    const user = userEvent.setup({ pointerEventsCheck: 0 })
    renderWithProviders(<RegisterChurchPage />)

    await user.click(screen.getByRole('button', { name: /concluir cadastro e acessar/i }))

    expect(await screen.findByText(/nome da igreja deve ter no mínimo 3 caracteres/i)).toBeInTheDocument()
    expect(await screen.findByText(/nome completo deve ter no mínimo 3 caracteres/i)).toBeInTheDocument()
    expect(await screen.findByText(/informe o e-mail/i)).toBeInTheDocument()
    expect(await screen.findByText(/a senha deve ter no mínimo 8 caracteres/i)).toBeInTheDocument()
  })

  it('submete com sucesso e envia payload correto para a API', async () => {
    const user = userEvent.setup({ pointerEventsCheck: 0 })
    let payloadSent: unknown = null

    server.use(
      http.post('*/api/v1/auth/register-church', async ({ request }) => {
        payloadSent = await request.json()
        return HttpResponse.json({
          accessToken: 'token-123',
          refreshToken: 'refresh-123',
          tokenType: 'Bearer',
          expiresIn: 3600,
          user: {
            id: 'user-new',
            name: 'Pastor Samuel',
            email: 'samuel@batista.com',
            roles: ['PASTOR_PRESIDENT'],
            churchId: 'church-new',
            lastLoginAt: '2026-09-13T14:00:00Z',
          },
        }, { status: 201 })
      }),
    )

    renderWithProviders(<RegisterChurchPage />)

    await user.type(screen.getByLabelText(/nome da igreja/i), 'Igreja Batista Nova Vida')
    await user.type(screen.getByLabelText(/seu nome completo/i), 'Pastor Samuel Silva')
    await user.type(screen.getByLabelText(/e-mail de acesso/i), 'samuel@batista.com')
    await user.type(screen.getByLabelText(/^senha/i, { selector: 'input' }), 'senhaForte123')
    await user.selectOptions(screen.getByLabelText(/seu papel nesta igreja/i), 'PASTOR_PRESIDENT')

    await user.click(screen.getByRole('button', { name: /concluir cadastro e acessar/i }))

    expect(await screen.findByText(/igreja cadastrada com sucesso/i)).toBeInTheDocument()
    expect(payloadSent).toMatchObject({
      churchName: 'Igreja Batista Nova Vida',
      adminName: 'Pastor Samuel Silva',
      adminEmail: 'samuel@batista.com',
      adminPassword: 'senhaForte123',
      denomination: 'BATISTA',
      adminRole: 'PASTOR_PRESIDENT',
      isPastor: true,
    })
  })

  it('exibe erro amigável se o e-mail já estiver em uso (409 Conflict)', async () => {
    const user = userEvent.setup({ pointerEventsCheck: 0 })

    server.use(
      http.post('*/api/v1/auth/register-church', () => {
        return HttpResponse.json(
          {
            error: {
              code: 'EMAIL_ALREADY_EXISTS',
              message: 'E-mail já cadastrado na plataforma.',
              details: [],
            },
            traceId: 'trace-conflict',
            timestamp: new Date().toISOString(),
          },
          { status: 409 },
        )
      }),
    )

    renderWithProviders(<RegisterChurchPage />)

    await user.type(screen.getByLabelText(/nome da igreja/i), 'Igreja Batista Nova Vida')
    await user.type(screen.getByLabelText(/seu nome completo/i), 'Pastor Samuel Silva')
    await user.type(screen.getByLabelText(/e-mail de acesso/i), 'samuel@batista.com')
    await user.type(screen.getByLabelText(/^senha/i, { selector: 'input' }), 'senhaForte123')

    await user.click(screen.getByRole('button', { name: /concluir cadastro e acessar/i }))

    expect(await screen.findByText(/este e-mail já está em uso/i)).toBeInTheDocument()
  })

  it('exibe erro se usuário existente não for elegível para multi-igreja (403 Forbidden)', async () => {
    const user = userEvent.setup({ pointerEventsCheck: 0 })

    server.use(
      http.post('*/api/v1/auth/register-church', () => {
        return HttpResponse.json(
          {
            error: {
              code: 'USER_NOT_ELIGIBLE_FOR_MULTI_CHURCH',
              message: 'Apenas membros da liderança podem gerenciar múltiplas congregações.',
              details: [],
            },
            traceId: 'trace-not-eligible',
            timestamp: new Date().toISOString(),
          },
          { status: 403 },
        )
      }),
    )

    renderWithProviders(<RegisterChurchPage />)

    await user.type(screen.getByLabelText(/nome da igreja/i), 'Igreja Filial Sul')
    await user.type(screen.getByLabelText(/seu nome completo/i), 'Membro Comum')
    await user.type(screen.getByLabelText(/e-mail de acesso/i), 'membro@igreja.com')
    await user.type(screen.getByLabelText(/^senha/i, { selector: 'input' }), 'senhaForte123')

    await user.click(screen.getByRole('button', { name: /concluir cadastro e acessar/i }))

    expect(
      await screen.findByText(/não tem permissão para gerenciar múltiplas congregações/i),
    ).toBeInTheDocument()
  })

  it('exibe erro se a senha do usuário existente estiver incorreta (401 Unauthorized)', async () => {
    const user = userEvent.setup({ pointerEventsCheck: 0 })

    server.use(
      http.post('*/api/v1/auth/register-church', () => {
        return HttpResponse.json(
          {
            error: {
              code: 'INVALID_CREDENTIALS',
              message: 'Senha incorreta para o e-mail existente.',
              details: [],
            },
            traceId: 'trace-invalid-cred',
            timestamp: new Date().toISOString(),
          },
          { status: 401 },
        )
      }),
    )

    renderWithProviders(<RegisterChurchPage />)

    await user.type(screen.getByLabelText(/nome da igreja/i), 'Igreja Filial Sul')
    await user.type(screen.getByLabelText(/seu nome completo/i), 'Pastor Samuel')
    await user.type(screen.getByLabelText(/e-mail de acesso/i), 'samuel@batista.com')
    await user.type(screen.getByLabelText(/^senha/i, { selector: 'input' }), 'senhaIncorreta123')

    await user.click(screen.getByRole('button', { name: /concluir cadastro e acessar/i }))

    expect(
      await screen.findByText(/a senha informada não confere com a sua conta já existente/i),
    ).toBeInTheDocument()
  })
})
