import { describe, expect, it } from 'vitest'
import {
  blankToNull,
  blankToUndefined,
  numberOrUndefined,
  selectToUndefined,
  toAddress,
} from './payload'

describe('montagem de payload', () => {
  it('trata campo em branco como ausente na criação', () => {
    expect(blankToUndefined('')).toBeUndefined()
    expect(blankToUndefined('   ')).toBeUndefined()
    expect(blankToUndefined(' São Paulo ')).toBe('São Paulo')
  })

  it('trata campo em branco como null no update de campo limpável', () => {
    // Ausente não altera; `null` limpa. A distinção é a razão de existir das duas funções.
    expect(blankToNull('')).toBeNull()
    expect(blankToNull('centro')).toBe('centro')
  })

  it('ignora select vazio', () => {
    expect(selectToUndefined('')).toBeUndefined()
    expect(selectToUndefined('ACTIVE')).toBe('ACTIVE')
  })

  it('não manda NaN quando o campo numérico está vazio', () => {
    expect(numberOrUndefined('')).toBeUndefined()
    expect(numberOrUndefined(null)).toBeUndefined()
    expect(numberOrUndefined('abc')).toBeUndefined()
    expect(numberOrUndefined('12.5')).toBe(12.5)
  })

  it('omite o endereço quando nenhum campo foi preenchido', () => {
    expect(toAddress({ street: '', city: '' })).toBeUndefined()
    expect(toAddress({ city: 'Santos' })).toEqual({
      street: undefined,
      number: undefined,
      complement: undefined,
      neighborhood: undefined,
      city: 'Santos',
      state: undefined,
      zipCode: undefined,
    })
  })
})
