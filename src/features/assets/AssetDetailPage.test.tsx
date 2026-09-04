import { describe, expect, it } from 'vitest'
import { screen, within } from '@testing-library/react'
import { AssetDetailPage } from './AssetDetailPage'
import { renderWithProviders } from '@/test/render'

describe('detalhe do patrimônio', () => {
  it('mostra o histórico de manutenção, que a listagem não traz', async () => {
    renderWithProviders(<AssetDetailPage />, {
      roles: ['TREASURER'],
      route: '/patrimonio/asset-1',
      path: '/patrimonio/:id',
    })

    expect(await screen.findByText('Teclado Yamaha PSR')).toBeInTheDocument()

    const historico = within(await screen.findByRole('table'))
    expect(historico.getByText('Limpeza e revisão geral')).toBeInTheDocument()
    expect(historico.getByText('Preventiva')).toBeInTheDocument()
    expect(historico.getByText('Assistência Musical')).toBeInTheDocument()
    expect(historico.getByText(/180,00/)).toBeInTheDocument()
  })

  it('mostra os dados de aquisição em reais', async () => {
    renderWithProviders(<AssetDetailPage />, {
      roles: ['TREASURER'],
      route: '/patrimonio/asset-1',
      path: '/patrimonio/:id',
    })

    expect(await screen.findByText('Fornecedor Demo')).toBeInTheDocument()
    expect(screen.getAllByText(/4\.800,00/).length).toBeGreaterThan(0)
    expect(screen.getByText('10/05/2024')).toBeInTheDocument()
  })
})
