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

  it('exibe a seção de Alterar Papéis do Usuário na edição para administrador da igreja', async () => {
    renderWithProviders(<MemberFormPage />, {
      roles: ['ADMIN_CHURCH'],
      route: '/membros/member-1/editar',
      path: '/membros/:id/editar',
    })

    await waitFor(() => expect(screen.getAllByText('Permissões de Acesso (Console Web)')[0]).toBeInTheDocument())
    expect(screen.getByRole('button', { name: /alterar papéis do usuário/i })).toBeInTheDocument()
  })

  it('permite abrir o modal e salvar novos papéis na tela de edição do membro', async () => {
    const user = userEvent.setup({ pointerEventsCheck: 0 })
    renderWithProviders(<MemberFormPage />, {
      roles: ['PASTOR_PRESIDENT'],
      route: '/membros/member-1/editar',
      path: '/membros/:id/editar',
    })

    const rolesBtn = await screen.findByRole('button', { name: /alterar papéis do usuário/i })
    await user.click(rolesBtn)

    expect(await screen.findByText('Alterar Papéis (Roles) do Usuário')).toBeInTheDocument()

    const tesourariaCheckbox = screen.getByLabelText(/tesouraria/i)
    await user.click(tesourariaCheckbox)

    const saveBtn = screen.getByRole('button', { name: /salvar alterações/i })
    await user.click(saveBtn)

    await waitFor(() => {
      expect(screen.queryByText('Alterar Papéis (Roles) do Usuário')).not.toBeInTheDocument()
    })
  })
})
