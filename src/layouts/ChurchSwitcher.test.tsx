import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { ChurchSwitcher } from './ChurchSwitcher'
import { renderWithProviders } from '@/test/render'
import { server } from '@/test/msw/server'
import type { MyChurchResponse } from '@/shared/types/domain'

describe('ChurchSwitcher', () => {
  it('renderiza o nome fixo quando o usuário possui apenas 1 congregação', async () => {
    const singleChurch: MyChurchResponse[] = [
      {
        churchId: 'church-1',
        churchName: 'Igreja Central',
        roles: ['PASTOR_PRESIDENT'],
        isCurrent: true,
      },
    ]

    server.use(
      http.get('*/api/v1/auth/my-churches', () => HttpResponse.json(singleChurch)),
    )

    renderWithProviders(<ChurchSwitcher />)

    expect(await screen.findByText('Igreja Central')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /alternar congregação/i })).not.toBeInTheDocument()
  })

  it('renderiza o seletor dropdown quando o usuário possui múltiplas congregações', async () => {
    const multipleChurches: MyChurchResponse[] = [
      {
        churchId: 'church-1',
        churchName: 'Igreja Central',
        roles: ['PASTOR_PRESIDENT'],
        isCurrent: true,
      },
      {
        churchId: 'church-2',
        churchName: 'Igreja Filial Sul',
        roles: ['PASTOR_AUXILIARY'],
        isCurrent: false,
      },
    ]

    server.use(
      http.get('*/api/v1/auth/my-churches', () => HttpResponse.json(multipleChurches)),
    )

    renderWithProviders(<ChurchSwitcher />)

    const trigger = await screen.findByRole('button', { name: /alternar congregação/i })
    expect(trigger).toBeInTheDocument()
    expect(trigger).toHaveTextContent('Igreja Central')
  })

  it('não renderiza nada se a lista de congregações for vazia', async () => {
    server.use(
      http.get('*/api/v1/auth/my-churches', () => HttpResponse.json([])),
    )

    const { container } = renderWithProviders(<ChurchSwitcher />)

    expect(container.querySelector('[aria-label="Alternar congregação"]')).toBeNull()
  })
})
