import { describe, expect, it } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http } from 'msw'
import { MemberFormPage } from './MemberFormPage'
import { renderWithProviders } from '@/test/render'
import { server } from '@/test/msw/server'
import { errorResponse } from '@/test/msw/handlers'

describe('formulário de membro', () => {
  it('valida os campos obrigatórios antes de chamar a API', async () => {
    const user = userEvent.setup()
    renderWithProviders(<MemberFormPage />, { roles: ['ADMIN_CHURCH'] })

    await user.click(screen.getByRole('button', { name: /cadastrar membro/i }))

    expect(await screen.findByText('Informe o e-mail')).toBeInTheDocument()
    expect(screen.getAllByText('Mínimo de 2 caracteres')).toHaveLength(2)
  })

  it('mostra o erro de validação da API no campo correspondente', async () => {
    server.use(
      http.post('*/api/v1/members', () =>
        errorResponse(400, 'VALIDATION_ERROR', 'inválido', [
          { field: 'email', message: 'e-mail já cadastrado nesta igreja' },
        ]),
      ),
    )

    const user = userEvent.setup()
    renderWithProviders(<MemberFormPage />, { roles: ['ADMIN_CHURCH'] })

    await user.type(screen.getByLabelText(/^nome/i), 'Maria')
    await user.type(screen.getByLabelText(/sobrenome/i), 'Souza')
    await user.type(screen.getByLabelText(/e-mail/i), 'maria@exemplo.com')
    await user.click(screen.getByRole('button', { name: /cadastrar membro/i }))

    expect(await screen.findByText('e-mail já cadastrado nesta igreja')).toBeInTheDocument()
  })

  it('carrega os dados do membro na edição e bloqueia a troca de e-mail', async () => {
    renderWithProviders(<MemberFormPage />, {
      roles: ['ADMIN_CHURCH'],
      route: '/membros/member-1/editar',
      path: '/membros/:id/editar',
    })

    await waitFor(() => expect(screen.getByLabelText(/^nome/i)).toHaveValue('Maria'))
    expect(screen.getByLabelText(/e-mail/i)).toBeDisabled()
  })
})
