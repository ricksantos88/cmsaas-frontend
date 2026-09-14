import { describe, expect, it } from 'vitest'
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { FinancialCategoriesPage } from './FinancialCategoriesPage'
import { renderWithProviders } from '@/test/render'
import { server } from '@/test/msw/server'

const mockCategories = [
  {
    id: '1',
    name: 'Dízimos',
    type: 'INCOME',
    isSystemDefault: true,
  },
  {
    id: '2',
    name: 'Energia',
    type: 'EXPENSE',
    isSystemDefault: false,
  },
]

describe('listagem de categorias financeiras', () => {
  it('mostra as categorias na tabela', async () => {
    server.use(
      http.get('*/api/v1/finances/categories', () => HttpResponse.json(mockCategories))
    )

    renderWithProviders(<FinancialCategoriesPage />, { roles: ['TREASURER'] })

    expect(await screen.findByText('Dízimos')).toBeInTheDocument()
    expect(screen.getByText('Energia')).toBeInTheDocument()

    const table = within(screen.getByRole('table'))
    expect(table.getByText('Entrada')).toBeInTheDocument()
    expect(table.getByText('Saída')).toBeInTheDocument()
  })

  it('abre o modal de nova categoria ao clicar no botão', async () => {
    server.use(
      http.get('*/api/v1/finances/categories', () => HttpResponse.json(mockCategories))
    )
    
    const user = userEvent.setup()
    renderWithProviders(<FinancialCategoriesPage />, { roles: ['TREASURER'] })

    await screen.findByText('Dízimos')

    await user.click(screen.getByRole('button', { name: /nova categoria/i }))

    expect(screen.getByRole('dialog', { name: /nova categoria/i })).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: /nome da categoria/i })).toBeInTheDocument()
  })
})
