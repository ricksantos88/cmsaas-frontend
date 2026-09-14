import { describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { InviteUserDialog } from './InviteUserDialog'
import { renderWithProviders } from '@/test/render'
import { server } from '@/test/msw/server'

describe('InviteUserDialog', () => {
  it('renderiza dados do membro e opções de papéis', () => {
    renderWithProviders(
      <InviteUserDialog
        open={true}
        onOpenChange={vi.fn()}
        entity={{ name: 'Lucas Silva', email: 'lucas@igreja.com' }}
      />,
    )

    expect(screen.getByRole('heading', { name: /tornar usuário do sistema/i })).toBeInTheDocument()
    expect(screen.getByText('Lucas Silva')).toBeInTheDocument()
    expect(screen.getByText('lucas@igreja.com')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /gerar acesso/i })).toBeInTheDocument()
  })

  it('submete convite e exibe o código de 4 dígitos gerado', async () => {
    const user = userEvent.setup({ pointerEventsCheck: 0 })
    let payloadSent: unknown = null

    server.use(
      http.post('*/api/v1/users/invites', async ({ request }) => {
        payloadSent = await request.json()
        return HttpResponse.json({
          id: 'inv-1',
          churchId: 'church-1',
          email: 'lucas@igreja.com',
          name: 'Lucas Silva',
          roles: ['ADMIN_CHURCH'],
          token: '7842',
          expiresAt: new Date(Date.now() + 48 * 3600 * 1000).toISOString(),
          createdAt: new Date().toISOString(),
        })
      }),
    )

    renderWithProviders(
      <InviteUserDialog
        open={true}
        onOpenChange={vi.fn()}
        entity={{ name: 'Lucas Silva', email: 'lucas@igreja.com' }}
      />,
    )

    await user.click(screen.getByRole('button', { name: /gerar acesso/i }))

    expect(await screen.findByRole('heading', { name: /acesso criado com sucesso/i })).toBeInTheDocument()
    expect(screen.getByText('7842')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /copiar mensagem e link para whatsapp/i })).toBeInTheDocument()
    expect(payloadSent).toEqual({
      name: 'Lucas Silva',
      email: 'lucas@igreja.com',
      roles: ['ADMIN_CHURCH'],
    })
  })

  it('permite selecionar Pastor Presidente quando for pastor e a igreja nao tiver presidente', async () => {
    const user = userEvent.setup({ pointerEventsCheck: 0 })
    let payloadSent: unknown = null

    server.use(
      http.post('*/api/v1/users/invites', async ({ request }) => {
        payloadSent = await request.json()
        return HttpResponse.json({
          id: 'inv-pres',
          churchId: 'church-1',
          email: 'pastor@igreja.com',
          name: 'Pastor João',
          roles: ['PASTOR_PRESIDENT'],
          token: '1234',
          expiresAt: new Date(Date.now() + 48 * 3600 * 1000).toISOString(),
          createdAt: new Date().toISOString(),
        })
      }),
    )

    renderWithProviders(
      <InviteUserDialog
        open={true}
        onOpenChange={vi.fn()}
        hasPresident={false}
        entity={{
          name: 'Pastor João',
          email: 'pastor@igreja.com',
          isPastor: true,
          currentRole: 'PASTOR_AUXILIARY',
        }}
      />,
    )

    expect(
      screen.getByText(/esta congregação ainda não possui pastor presidente/i),
    ).toBeInTheDocument()

    // Desmarca Pastor Auxiliar (selecionado por padrão) e marca Pastor Presidente
    await user.click(screen.getByRole('checkbox', { name: /pastor auxiliar/i }))
    await user.click(screen.getByRole('checkbox', { name: /pastor presidente/i }))

    await user.click(screen.getByRole('button', { name: /gerar acesso/i }))

    expect(await screen.findByRole('heading', { name: /acesso criado com sucesso/i })).toBeInTheDocument()
    expect(payloadSent).toEqual({
      name: 'Pastor João',
      email: 'pastor@igreja.com',
      roles: ['PASTOR_PRESIDENT'],
    })
  })

  it('desabilita Pastor Presidente quando a igreja ja possui outro pastor presidente', () => {
    renderWithProviders(
      <InviteUserDialog
        open={true}
        onOpenChange={vi.fn()}
        hasPresident={true}
        entity={{
          name: 'Pastor Marcos',
          email: 'marcos@igreja.com',
          isPastor: true,
          currentRole: 'PASTOR_AUXILIARY',
        }}
      />,
    )

    expect(screen.getByText(/igreja já possui pastor presidente/i)).toBeInTheDocument()
    const presidentCheckbox = screen.getByRole('checkbox', { name: /pastor presidente/i })
    expect(presidentCheckbox).toBeDisabled()
  })
})
