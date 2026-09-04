import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ConfirmDialog } from './confirm-dialog'

describe('confirmação de ação destrutiva', () => {
  const props = {
    open: true,
    onOpenChange: vi.fn(),
    title: 'Excluir membro',
    description: 'Maria Souza sai das listagens. O histórico é mantido (exclusão lógica).',
  }

  it('explica a consequência antes de confirmar', () => {
    render(<ConfirmDialog {...props} onConfirm={vi.fn()} />)

    expect(screen.getByRole('dialog')).toHaveTextContent('exclusão lógica')
  })

  it('só chama a ação quando o usuário confirma', async () => {
    const onConfirm = vi.fn()
    const user = userEvent.setup({ pointerEventsCheck: 0 })

    render(<ConfirmDialog {...props} confirmLabel="Excluir" onConfirm={onConfirm} />)

    expect(onConfirm).not.toHaveBeenCalled()
    await user.click(screen.getByRole('button', { name: 'Excluir' }))
    expect(onConfirm).toHaveBeenCalledOnce()
  })

  it('bloqueia os botões enquanto a ação está em andamento', () => {
    render(<ConfirmDialog {...props} confirmLabel="Excluir" loading onConfirm={vi.fn()} />)

    expect(screen.getByRole('button', { name: 'Excluir' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeDisabled()
  })
})
