import { describe, expect, it } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http } from 'msw'
import { ChurchSettingsPage } from './ChurchSettingsPage'
import { renderWithProviders } from '@/test/render'
import { server } from '@/test/msw/server'
import { errorResponse } from '@/test/msw/handlers'

describe('configuração da igreja', () => {
  it('carrega os dados da própria igreja', async () => {
    renderWithProviders(<ChurchSettingsPage />, { roles: ['PASTOR_PRESIDENT'] })

    await waitFor(() => expect(screen.getByLabelText(/nome da igreja/i)).toHaveValue('Igreja Central'))
    expect(screen.getByText('3')).toBeInTheDocument() // pastores
  })

  it('envia as alterações sem mandar churchId no payload (ADR-004 R1)', async () => {
    let payload: Record<string, unknown> | undefined

    server.use(
      http.put('*/api/v1/churches/:id', async ({ request }) => {
        payload = (await request.json()) as Record<string, unknown>
        return errorResponse(200, 'OK', 'ok')
      }),
    )

    const user = userEvent.setup()
    renderWithProviders(<ChurchSettingsPage />, { roles: ['PASTOR_PRESIDENT'] })

    const nameField = await screen.findByLabelText(/nome da igreja/i)
    await user.clear(nameField)
    await user.type(nameField, 'Igreja Central Renovada')
    await user.click(screen.getByRole('button', { name: /salvar alterações/i }))

    await waitFor(() => expect(payload).toBeDefined())
    expect(payload).toMatchObject({ name: 'Igreja Central Renovada' })
    expect(payload).not.toHaveProperty('churchId')
  })

  it('avisa quando a conta não está vinculada a uma igreja', () => {
    renderWithProviders(<ChurchSettingsPage />, { roles: ['SUPER_ADMIN'], churchId: null })

    expect(screen.getByRole('alert')).toHaveTextContent('não está vinculada a uma igreja')
  })
})
