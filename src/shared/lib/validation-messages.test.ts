import { describe, expect, it } from 'vitest'
import { humanizeValidationMessage } from './validation-messages'

describe('humanizeValidationMessage', () => {
  it('traduz mensagem técnica com dateOfBirth para linguagem natural e detecta o campo', () => {
    const result = humanizeValidationMessage('dateOfBirth deve estar no passado')
    expect(result.message).toBe('Data de nascimento deve ser uma data no passado')
    expect(result.field).toBe('dateOfBirth')
  })

  it('traduz ordainmentDate não pode ser futura e detecta o campo', () => {
    const result = humanizeValidationMessage('ordainmentDate não pode ser futura')
    expect(result.message).toBe('Data de ordenação não pode ser uma data futura')
    expect(result.field).toBe('ordainmentDate')
  })

  it('traduz ordainmentDate não pode ser anterior ao nascimento', () => {
    const result = humanizeValidationMessage('ordainmentDate não pode ser anterior ao nascimento')
    expect(result.message).toBe('Data de ordenação não pode ser anterior à data de nascimento')
    expect(result.field).toBe('ordainmentDate')
  })

  it('traduz identificadores camelCase com padrão "é obrigatório" ou "não pode ser vazio"', () => {
    const r1 = humanizeValidationMessage('firstName é obrigatório')
    expect(r1.message).toBe('Nome é obrigatório')
    expect(r1.field).toBe('firstName')

    const r2 = humanizeValidationMessage('adminPassword é obrigatório')
    expect(r2.message).toBe('Senha do administrador é obrigatório')
    expect(r2.field).toBe('adminPassword')
  })

  it('preserva mensagens simples de campos sem modificar desnecessariamente', () => {
    const result = humanizeValidationMessage('email inválido', 'email')
    expect(result.message).toBe('email inválido')
    expect(result.field).toBe('email')
  })
})
