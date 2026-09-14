import { describe, expect, it } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ScheduleDetailPage } from './ScheduleDetailPage'
import { renderWithProviders } from '@/test/render'

describe('ScheduleDetailPage — Presença e Ausentes', () => {
  const options = { route: '/agenda/schedule-1', path: '/agenda/:id' } as const

  it('mostra os dados do evento e a lista de presentes por padrão', async () => {
    renderWithProviders(<ScheduleDetailPage />, { roles: ['PASTOR_PRESIDENT'], ...options })

    expect(await screen.findByText('Culto de Domingo')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /presentes \(1\)/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /ausentes \(1\)/i })).toBeInTheDocument()
    expect(screen.getByText('Maria Souza')).toBeInTheDocument()
  })

  it('alterna para a aba de ausentes e exibe os faltosos com ações rápidas', async () => {
    const user = userEvent.setup({ pointerEventsCheck: 0 })
    renderWithProviders(<ScheduleDetailPage />, { roles: ['PASTOR_PRESIDENT'], ...options })

    const ausentesTab = await screen.findByRole('button', { name: /ausentes \(1\)/i })
    await user.click(ausentesTab)

    expect(await screen.findByText('Carlos Eduardo')).toBeInTheDocument()
    expect(screen.getByText('Célula Betel')).toBeInTheDocument()

    // Botão do WhatsApp
    const whatsappLink = screen.getByRole('link', {
      name: /Enviar mensagem no WhatsApp para Carlos Eduardo/i,
    })
    expect(whatsappLink).toBeInTheDocument()
    expect(whatsappLink.getAttribute('href')).toContain('https://wa.me/5511988882222')
    expect(whatsappLink.getAttribute('href')).toContain(
      encodeURIComponent('A paz do Senhor, Carlos Eduardo! Sentimos sua falta no culto de hoje'),
    )

    // Botão de agendar visita
    expect(
      screen.getByRole('button', { name: /Agendar visita para Carlos Eduardo/i }),
    ).toBeInTheDocument()

    // Botão de check-in manual
    expect(
      screen.getByRole('button', { name: /Fazer check-in manual de Carlos Eduardo/i }),
    ).toBeInTheDocument()
  })

  it('executa o check-in manual de um membro ausente', async () => {
    const user = userEvent.setup({ pointerEventsCheck: 0 })
    renderWithProviders(<ScheduleDetailPage />, { roles: ['PASTOR_PRESIDENT'], ...options })

    const ausentesTab = await screen.findByRole('button', { name: /ausentes \(1\)/i })
    await user.click(ausentesTab)

    const checkInBtn = await screen.findByRole('button', {
      name: /Fazer check-in manual de Carlos Eduardo/i,
    })
    await user.click(checkInBtn)

    await waitFor(() => {
      expect(screen.getByText(/Presença de Carlos Eduardo registrada/i)).toBeInTheDocument()
    })
  })
})
