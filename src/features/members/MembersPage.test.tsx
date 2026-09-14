import { describe, expect, it } from 'vitest'
import { screen, waitFor, within } from '@testing-library/react'
import { http } from 'msw'
import { MembersPage } from './MembersPage'
import { renderWithProviders } from '@/test/render'
import { server } from '@/test/msw/server'
import { errorResponse } from '@/test/msw/handlers'

describe('listagem de membros', () => {
  it('mostra os membros da igreja', async () => {
    renderWithProviders(<MembersPage />, { roles: ['ADMIN_CHURCH'] })

    expect(await screen.findByText('Maria Souza')).toBeInTheDocument()

    // Dentro da tabela: "Ativo" também aparece no <select> de filtro.
    const table = within(screen.getByRole('table'))
    expect(table.getByText('Ativo')).toBeInTheDocument()
    expect(table.getByText('10/03/2024')).toBeInTheDocument()
  })

  it('esconde "Novo membro" de quem não pode escrever', async () => {
    renderWithProviders(<MembersPage />, { roles: ['TREASURER'] })

    await screen.findByText('Maria Souza')
    expect(screen.queryByRole('button', { name: /novo membro/i })).not.toBeInTheDocument()
  })

  it('mostra a mensagem da API quando a listagem falha', async () => {
    server.use(
      http.get('*/api/v1/members', () =>
        errorResponse(403, 'INSUFFICIENT_PERMISSIONS', 'sem permissão'),
      ),
    )

    renderWithProviders(<MembersPage />, { roles: ['ADMIN_CHURCH'] })

    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent(
        'Você não tem permissão para esta ação.',
      ),
    )
  })

  it('leva o filtro de busca para a URL', async () => {
    const { container } = renderWithProviders(<MembersPage />, {
      roles: ['ADMIN_CHURCH'],
      route: '/membros?search=maria',
    })

    await screen.findByText('Maria Souza')
    expect(
      container.querySelector('input[aria-label="Buscar por nome, e-mail ou telefone"]'),
    ).toHaveValue('maria')
  })

  it('mostra o badge de aniversário e ação do WhatsApp quando filtrado por mês', async () => {
    renderWithProviders(<MembersPage />, {
      roles: ['ADMIN_CHURCH'],
      route: '/membros?birthMonth=5',
    })

    expect(await screen.findByText('Maria Souza')).toBeInTheDocument()
    expect(screen.getByText(/Aniversário: 20\/05/i)).toBeInTheDocument()

    const whatsappLink = screen.getByRole('link', {
      name: /Enviar felicitação pelo WhatsApp para Maria Souza/i,
    })
    expect(whatsappLink).toBeInTheDocument()
    expect(whatsappLink.getAttribute('href')).toContain('https://wa.me/5511999990000')
    expect(whatsappLink.getAttribute('href')).toContain(
      encodeURIComponent('A Paz do Senhor, Maria Souza! Toda a igreja celebra a sua vida hoje'),
    )
  })
})
