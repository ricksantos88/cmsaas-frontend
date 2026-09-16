import { describe, expect, it } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemberDetailPage } from './MemberDetailPage'
import { renderWithProviders } from '@/test/render'

describe('detalhe do membro e acompanhamento pastoral', () => {
  const options = { route: '/membros/member-1', path: '/membros/:id' } as const

  it('mostra os dados gerais do membro', async () => {
    renderWithProviders(<MemberDetailPage />, { roles: ['PASTOR_PRESIDENT'], ...options })

    expect(await screen.findByText('Maria Souza')).toBeInTheDocument()
    expect(screen.getByText('maria@exemplo.com')).toBeInTheDocument()
    expect(screen.getByText('Professora')).toBeInTheDocument()
  })

  it('exibe o histórico pastoral e registros confidenciais para pastor presidente', async () => {
    renderWithProviders(<MemberDetailPage />, { roles: ['PASTOR_PRESIDENT'], ...options })

    expect(await screen.findByText('Acompanhamento Pastoral')).toBeInTheDocument()
    expect(await screen.findByText('Aconselhamento familiar')).toBeInTheDocument()
    expect(screen.getByText('Visita domiciliar com oração pelo lar.')).toBeInTheDocument()
    expect(screen.getByText('Confidencial')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /novo registro/i })).toBeInTheDocument()
  })

  it('não exibe a seção de acompanhamento pastoral para usuários sem perfil pastoral', async () => {
    renderWithProviders(<MemberDetailPage />, { roles: ['ADMIN_CHURCH'], ...options })

    expect(await screen.findByText('Maria Souza')).toBeInTheDocument()
    expect(screen.queryByText('Acompanhamento Pastoral')).not.toBeInTheDocument()
    expect(screen.queryByText('Aconselhamento familiar')).not.toBeInTheDocument()
  })

  it('permite registrar um novo atendimento pastoral via modal', async () => {
    const user = userEvent.setup({ pointerEventsCheck: 0 })
    renderWithProviders(<MemberDetailPage />, { roles: ['PASTOR_PRESIDENT'], ...options })

    const novoBtn = await screen.findByRole('button', { name: /novo registro/i })
    await user.click(novoBtn)

    expect(await screen.findByText('Novo registro pastoral')).toBeInTheDocument()

    const subjectInput = screen.getByPlaceholderText(/Aconselhamento familiar, Visita pós-cirurgia/i)
    const notesInput = screen.getByPlaceholderText(/Descreva como foi o atendimento/i)

    await user.type(subjectInput, 'Visita de encorajamento')
    await user.type(notesInput, 'Membro recebeu oração e passou bem.')

    const saveBtn = screen.getByRole('button', { name: /salvar registro/i })
    await user.click(saveBtn)

    await waitFor(() => {
      expect(screen.queryByText('Novo registro pastoral')).not.toBeInTheDocument()
    })
  })

  it('exibe a seção de Conta de Acesso e Permissões em modo leitura no detalhe do membro', async () => {
    renderWithProviders(<MemberDetailPage />, { roles: ['ADMIN_CHURCH'], ...options })

    expect(await screen.findByText('Conta de acesso e Permissões')).toBeInTheDocument()
    expect(screen.getByText('Possui conta de operador')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /alterar papéis/i })).not.toBeInTheDocument()
  })
})
