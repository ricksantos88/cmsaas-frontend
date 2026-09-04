import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import { http } from 'msw'
import { PastorDetailPage } from './PastorDetailPage'
import { renderWithProviders } from '@/test/render'
import { server } from '@/test/msw/server'

describe('detalhe do pastor', () => {
  const options = { route: '/pastores/pastor-1', path: '/pastores/:id' } as const

  it('mostra os dados pastorais e os contatos liberados pelo servidor', async () => {
    renderWithProviders(<PastorDetailPage />, { roles: ['ADMIN_CHURCH'], ...options })

    expect(await screen.findByText('Serve a igreja desde 2005.')).toBeInTheDocument()
    expect(await screen.findByText('(11) 98888-1000')).toBeInTheDocument()
    expect(screen.getByText('Somente membros')).toBeInTheDocument()
    expect(screen.getByText(/terça-feira/i)).toBeInTheDocument()
  })

  it('diz quando o contato não está disponível para quem olha', async () => {
    // Quem decide o que aparece é o backend: aqui ele devolve os campos nulos.
    server.use(
      http.get('*/api/v1/pastors/:id/contacts', () =>
        Response.json({
          id: 'pastor-1',
          name: 'Pastor João Silva',
          role: 'PASTOR_PRESIDENT',
          visibilityLevel: 'PASTORS_ONLY',
          email: null,
          phone: null,
          workSchedule: null,
        }),
      ),
    )

    renderWithProviders(<PastorDetailPage />, { roles: ['WORSHIP_LEADER'], ...options })

    expect((await screen.findAllByText('Não disponível para você')).length).toBe(2)
  })

  it('esconde o botão de editar de quem não pode escrever', async () => {
    renderWithProviders(<PastorDetailPage />, { roles: ['WORSHIP_LEADER'], ...options })

    await screen.findByText('Serve a igreja desde 2005.')
    expect(screen.queryByRole('button', { name: 'Editar' })).not.toBeInTheDocument()
  })
})
