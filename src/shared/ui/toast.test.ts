import { describe, expect, it, vi } from 'vitest'
import { toast } from 'sonner'
import { ApiError } from '@/shared/api/api-error'
import { notifyError, notifySuccess } from './toast'

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

describe('toast notification helpers', () => {
  it('exibe mensagem de sucesso', () => {
    notifySuccess('Salvo com sucesso!')
    expect(toast.success).toHaveBeenCalledWith('Salvo com sucesso!')
  })

  it('exibe erro a partir de string direta sem substituir por mensagem genérica', () => {
    notifyError('Selecione ao menos um papel no sistema.')
    expect(toast.error).toHaveBeenCalledWith('Selecione ao menos um papel no sistema.')
  })

  it('exibe erro a partir de ApiError com traceId na descrição', () => {
    const apiError = new ApiError(400, 'VALIDATION_ERROR', 'Senha atual incorreta', 'trace-123')
    notifyError(apiError)
    expect(toast.error).toHaveBeenCalledWith('Senha atual incorreta', {
      description: 'traceId: trace-123',
    })
  })

  it('exibe erro a partir de Error padrão', () => {
    notifyError(new Error('Falha no upload do arquivo'))
    expect(toast.error).toHaveBeenCalledWith('Falha no upload do arquivo')
  })

  it('exibe erro a partir de objeto com propriedade message', () => {
    notifyError({ message: 'Erro customizado de serviço' })
    expect(toast.error).toHaveBeenCalledWith('Erro customizado de serviço')
  })

  it('usa fallback para valores desconhecidos ou vazios', () => {
    notifyError(null, 'Ação falhou.')
    expect(toast.error).toHaveBeenCalledWith('Ação falhou.')
  })
})
