import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { z } from 'zod'
import { ApiError } from '@/shared/api/api-error'
import { notifyError } from '@/shared/ui/toast'
import { useApiForm } from './use-api-form'

vi.mock('@/shared/ui/toast', () => ({
  notifyError: vi.fn(),
  notifySuccess: vi.fn(),
}))

const schema = z.object({
  name: z.string(),
  email: z.string().email(),
  zipCode: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

describe('useApiForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('distribui erros exatos nos campos do formulário', async () => {
    const onSubmit = vi.fn().mockRejectedValue(
      new ApiError(400, 'VALIDATION_ERROR', 'A requisição contém dados inválidos', null, [
        { field: 'name', message: 'Nome é obrigatório' },
      ]),
    )

    const { result } = renderHook(() =>
      useApiForm<FormValues>({
        schema,
        defaultValues: { name: '', email: 'teste@email.com', zipCode: '' },
        onSubmit,
      }),
    )

    await act(async () => {
      await result.current.submit()
    })

    expect(result.current.formState.errors.name?.message).toBe('Nome é obrigatório')
    expect(notifyError).toHaveBeenCalledWith('Confira os campos destacados.')
  })

  it('mapeia caminhos aninhados para campos planos correspondentes (ex: address.zipCode -> zipCode)', async () => {
    const onSubmit = vi.fn().mockRejectedValue(
      new ApiError(400, 'VALIDATION_ERROR', 'A requisição contém dados inválidos', null, [
        { field: 'address.zipCode', message: 'CEP deve estar no formato 00000-000' },
      ]),
    )

    const { result } = renderHook(() =>
      useApiForm<FormValues>({
        schema,
        defaultValues: { name: 'João', email: 'joao@email.com', zipCode: '123' },
        onSubmit,
      }),
    )

    await act(async () => {
      await result.current.submit()
    })

    expect(result.current.formState.errors.zipCode?.message).toBe(
      'CEP deve estar no formato 00000-000',
    )
    expect(notifyError).toHaveBeenCalledWith('Confira os campos destacados.')
  })

  it('notifica via toast quando há campos não mapeados no formulário', async () => {
    const onSubmit = vi.fn().mockRejectedValue(
      new ApiError(400, 'VALIDATION_ERROR', 'A requisição contém dados inválidos', null, [
        { field: 'unmappedField', message: 'deve ser informado' },
      ]),
    )

    const { result } = renderHook(() =>
      useApiForm<FormValues>({
        schema,
        defaultValues: { name: 'João', email: 'joao@email.com', zipCode: '' },
        onSubmit,
      }),
    )

    await act(async () => {
      await result.current.submit()
    })

    expect(notifyError).toHaveBeenCalledWith('unmappedField: deve ser informado')
  })

  it('notifica a mensagem específica quando VALIDATION_ERROR não possui fieldErrors', async () => {
    const onSubmit = vi
      .fn()
      .mockRejectedValue(
        new ApiError(400, 'VALIDATION_ERROR', 'A data de término deve ser posterior à de início'),
      )

    const { result } = renderHook(() =>
      useApiForm<FormValues>({
        schema,
        defaultValues: { name: 'João', email: 'joao@email.com', zipCode: '' },
        onSubmit,
      }),
    )

    await act(async () => {
      await result.current.submit()
    })

    expect(notifyError).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'A data de término deve ser posterior à de início',
      }),
    )
  })
})
