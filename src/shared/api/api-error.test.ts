import { describe, expect, it } from 'vitest'
import { ApiError, toApiError } from './api-error'

describe('tradução do erro da API', () => {
  it('traduz o código de negócio para português', () => {
    const error = toApiError(409, {
      error: { code: 'MEMBER_IS_CELL_LEADER', message: 'Member leads a cell' },
      traceId: 'trace-1',
      timestamp: '2026-08-31T09:00:00Z',
    })

    expect(error).toBeInstanceOf(ApiError)
    expect(error.status).toBe(409)
    expect(error.message).toContain('lidera uma célula')
    expect(error.traceId).toBe('trace-1')
  })

  it('mantém a mensagem da API quando o código não tem tradução', () => {
    const error = toApiError(400, {
      error: { code: 'CODIGO_NOVO_DO_BACKEND', message: 'Mensagem vinda da API' },
      traceId: 'trace-2',
      timestamp: '2026-08-31T09:00:00Z',
    })

    expect(error.message).toBe('Mensagem vinda da API')
  })

  it('expõe os erros de campo da validação', () => {
    const error = toApiError(400, {
      error: {
        code: 'VALIDATION_ERROR',
        message: 'inválido',
        details: [{ field: 'email', message: 'email inválido' }],
      },
      traceId: 'trace-3',
      timestamp: '2026-08-31T09:00:00Z',
    })

    expect(error.isValidation).toBe(true)
    expect(error.fieldErrors).toEqual([{ field: 'email', message: 'email inválido' }])
  })

  it('não quebra com corpo fora do contrato', () => {
    const error = toApiError(500, '<html>gateway</html>')

    expect(error.code).toBe('UNEXPECTED_ERROR')
    expect(error.message).toBe('Erro interno do servidor.')
  })
})
