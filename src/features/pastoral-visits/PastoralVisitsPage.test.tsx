import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import { PastoralVisitsPage } from './PastoralVisitsPage'
import { renderWithProviders } from '@/test/render'

describe('PastoralVisitsPage', () => {
  it('renderiza a página e mostra as visitas agendadas', async () => {
    renderWithProviders(<PastoralVisitsPage />, { roles: ['PASTOR_PRESIDENT'] })

    expect(await screen.findByText('Visitas Pastorais')).toBeInTheDocument()
    expect(await screen.findByText('Maria Souza')).toBeInTheDocument()
    expect(screen.getByText('Acompanhamento da família')).toBeInTheDocument()
  })

  it('exibe o botão de agendar visita para pastores', async () => {
    renderWithProviders(<PastoralVisitsPage />, { roles: ['PASTOR_AUXILIARY'] })

    expect(await screen.findByRole('button', { name: /agendar visita/i })).toBeInTheDocument()
  })
})
