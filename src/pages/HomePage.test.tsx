import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import { HomePage } from './HomePage'
import { renderWithProviders } from '@/test/render'

describe('HomePage', () => {
  it('renderiza o título principal e os dois botões de CTA (Login e Registro)', () => {
    renderWithProviders(<HomePage />)

    // Título principal
    expect(
      screen.getByRole('heading', {
        level: 1,
        name: /gestão completa, moderna e bíblica para sua igreja/i,
      }),
    ).toBeInTheDocument()

    // Os dois botões principais de ação
    const registerButtons = screen.getAllByRole('link', { name: /cadastrar igreja/i })
    expect(registerButtons.length).toBeGreaterThanOrEqual(1)
    expect(registerButtons[0]).toHaveAttribute('href', '/registro')

    const loginButtons = screen.getAllByRole('link', { name: /acessar console/i })
    expect(loginButtons.length).toBeGreaterThanOrEqual(1)
    expect(loginButtons[0]).toHaveAttribute('href', '/login')
  })

  it('exibe os pilares da plataforma CMSaaS', () => {
    renderWithProviders(<HomePage />)

    expect(screen.getByText('Membros & Células')).toBeInTheDocument()
    expect(screen.getByText('Agenda & Louvor')).toBeInTheDocument()
    expect(screen.getByText('Patrimônio & Ativos')).toBeInTheDocument()
    expect(screen.getByText('Segurança & Documentos')).toBeInTheDocument()
  })
})
