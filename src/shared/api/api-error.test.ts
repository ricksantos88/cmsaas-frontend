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

  it('preserva mensagem específica de negócio em VALIDATION_ERROR', () => {
    const error = toApiError(400, {
      error: { code: 'VALIDATION_ERROR', message: 'Senha atual incorreta' },
      traceId: 'trace-pwd',
      timestamp: '2026-08-31T09:00:00Z',
    })

    expect(error.code).toBe('VALIDATION_ERROR')
    expect(error.message).toBe('Senha atual incorreta')
    expect(error.fieldErrors).toEqual([])
  })

  it('humaniza mensagens técnicas com nomes de campos e popula fieldErrors automaticamente', () => {
    const error = toApiError(400, {
      error: { code: 'VALIDATION_ERROR', message: 'dateOfBirth deve estar no passado' },
      traceId: '275250ee-3e18-4dd5-8d4e-db6a180c246c',
      timestamp: '2026-09-14T10:00:00Z',
    })

    expect(error.code).toBe('VALIDATION_ERROR')
    expect(error.message).toBe('Data de nascimento deve ser uma data no passado')
    expect(error.isValidation).toBe(true)
    expect(error.fieldErrors).toEqual([
      { field: 'dateOfBirth', message: 'Data de nascimento deve ser uma data no passado' },
    ])
  })

  it('usa texto padrão quando VALIDATION_ERROR traz mensagem genérica do backend', () => {
    const error = toApiError(400, {
      error: {
        code: 'VALIDATION_ERROR',
        message: 'A requisição contém dados inválidos',
        details: [{ field: 'name', message: 'obrigatório' }],
      },
      traceId: 'trace-generic',
      timestamp: '2026-08-31T09:00:00Z',
    })

    expect(error.message).toBe('Confira os campos destacados.')
    expect(error.fieldErrors).toEqual([{ field: 'name', message: 'obrigatório' }])
  })

  it('extrai mensagem de respostas de erro no padrão Spring Boot', () => {
    const error = toApiError(400, {
      timestamp: '2026-09-14T10:00:00Z',
      status: 400,
      error: 'Bad Request',
      message: 'Token expirado ou inválido',
      path: '/api/v1/auth/reset-password',
    })

    expect(error.status).toBe(400)
    expect(error.code).toBe('Bad Request')
    expect(error.message).toBe('Token expirado ou inválido')
  })

  it('traduz novos códigos de negócio adicionados ao catálogo', () => {
    const userError = toApiError(409, {
      error: { code: 'USER_ALREADY_EXISTS', message: 'already exists' },
      traceId: 'trace-user',
    })
    expect(userError.message).toContain('Já existe um usuário')

    const inviteError = toApiError(409, {
      error: { code: 'INVITE_ALREADY_EXISTS', message: 'already exists' },
      traceId: 'trace-invite',
    })
    expect(inviteError.message).toContain('Já existe um convite')

    const confidentialError = toApiError(403, {
      error: { code: 'RECORD_CONFIDENTIAL', message: 'restricted' },
      traceId: 'trace-conf',
    })
    expect(confidentialError.message).toContain('confidencial')
  })

  it('não quebra com corpo fora do contrato', () => {
    const error = toApiError(500, '<html>gateway</html>')

    expect(error.code).toBe('UNEXPECTED_ERROR')
    expect(error.message).toBe('Erro interno do servidor.')
  })
})
