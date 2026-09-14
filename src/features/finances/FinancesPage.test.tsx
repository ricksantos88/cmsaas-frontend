import { describe, expect, it } from 'vitest'
import { screen, waitFor, within } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { FinancesPage } from './FinancesPage'
import { renderWithProviders } from '@/test/render'
import { server } from '@/test/msw/server'
import { errorResponse } from '@/test/msw/handlers'

const mockEntries = {
  data: [
    {
      id: '1',
      description: 'Dízimo do fulano',
      type: 'INCOME',
      amount: 1000,
      date: '2024-03-01',
      categoryId: 'cat1',
      categoryName: 'Dízimos',
      status: 'PAID',
    },
    {
      id: '2',
      description: 'Conta de luz',
      type: 'EXPENSE',
      amount: 250,
      date: '2024-03-05',
      categoryId: 'cat2',
      categoryName: 'Energia',
      status: 'PENDING',
    },
  ],
  pagination: {
    page: 1,
    pageSize: 20,
    totalItems: 2,
    totalPages: 1,
    hasNext: false,
    hasPrev: false,
  },
}

const mockReport = {
  year: 2024,
  month: 3,
  totalIncome: 1000,
  totalExpense: 250,
  balance: 750,
  incomesByCategory: [{ categoryId: 'cat1', categoryName: 'Dízimos', amount: 1000 }],
  expensesByCategory: [{ categoryId: 'cat2', categoryName: 'Energia', amount: 250 }],
}

describe('listagem e extrato financeiro', () => {
  it('mostra os lançamentos financeiros', async () => {
    server.use(
      http.get('*/api/v1/finances/entries', () => HttpResponse.json(mockEntries)),
      http.get('*/api/v1/finances/categories', () => HttpResponse.json([])),
      http.get('*/api/v1/finances/report', () => HttpResponse.json(mockReport))
    )

    renderWithProviders(<FinancesPage />, { roles: ['TREASURER'] })

    expect(await screen.findByText('Dízimo do fulano')).toBeInTheDocument()
    expect(screen.getByText('Conta de luz')).toBeInTheDocument()

    const table = within(screen.getByRole('table'))
    expect(table.getByText('Dízimos')).toBeInTheDocument()
    expect(table.getByText('Pendente')).toBeInTheDocument()
  })

  it('esconde "Novo lançamento" de quem não tem permissão de escrita', async () => {
    server.use(
      http.get('*/api/v1/finances/entries', () => HttpResponse.json(mockEntries)),
      http.get('*/api/v1/finances/categories', () => HttpResponse.json([])),
      http.get('*/api/v1/finances/report', () => HttpResponse.json(mockReport))
    )
    
    // Supondo role genérica (ou 'MEMBER')
    renderWithProviders(<FinancesPage />, { roles: ['MEMBER'] })

    await screen.findByText('Dízimo do fulano')
    expect(screen.queryByRole('button', { name: /novo lançamento/i })).not.toBeInTheDocument()
  })

  it('mostra mensagem de erro de acesso para usuários sem permissão', async () => {
    server.use(
      http.get('*/api/v1/finances/entries', () =>
        errorResponse(403, 'INSUFFICIENT_PERMISSIONS', 'sem permissão'),
      ),
      http.get('*/api/v1/finances/categories', () =>
        errorResponse(403, 'INSUFFICIENT_PERMISSIONS', 'sem permissão'),
      ),
      http.get('*/api/v1/finances/report', () =>
        errorResponse(403, 'INSUFFICIENT_PERMISSIONS', 'sem permissão'),
      )
    )

    renderWithProviders(<FinancesPage />, { roles: ['MEMBER'] })

    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent('Você não tem permissão para esta ação.')
    )
  })
})
