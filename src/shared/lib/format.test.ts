import { describe, expect, it } from 'vitest'
import {
  formatCurrency,
  formatDate,
  formatDateTime,
  formatFileSize,
  formatTime,
  fromDateTimeLocal,
  initials,
  toDateTimeLocal,
} from './format'

describe('formatação', () => {
  it('não desloca LocalDate por causa de fuso', () => {
    expect(formatDate('2026-07-29')).toBe('29/07/2026')
  })

  it('mostra travessão no lugar de vazio', () => {
    expect(formatDate(null)).toBe('—')
    expect(formatCurrency(null)).toBe('—')
  })

  it('formata valores em real', () => {
    expect(formatCurrency(1234.5)).toContain('1.234,50')
  })

  it('formata tamanho de arquivo', () => {
    expect(formatFileSize(512)).toBe('512 B')
    expect(formatFileSize(2048)).toBe('2,0 KB')
  })

  it('monta iniciais com primeiro e último nome', () => {
    expect(initials('Pastor João Silva')).toBe('PS')
    expect(initials('Ana')).toBe('A')
  })
})

describe('conversão de data e hora para o formulário', () => {
  it('leva o instante UTC para o input local e volta sem perder o momento', () => {
    const original = '2026-09-06T22:00:00.000Z'
    const local = toDateTimeLocal(original)

    expect(local).toHaveLength(16) // AAAA-MM-DDTHH:mm
    expect(fromDateTimeLocal(local)).toBe(original)
  })

  it('trata vazio nas duas direções', () => {
    expect(toDateTimeLocal(null)).toBe('')
    expect(fromDateTimeLocal('')).toBeUndefined()
  })

  it('formata instante e hora no fuso do navegador', () => {
    expect(formatDateTime(null)).toBe('—')
    expect(formatTime(null)).toBe('—')
    expect(formatTime('2026-09-06T12:00:00Z')).toMatch(/\d{2}:\d{2}/)
  })
})
