import type { IsoDate, IsoInstant } from '@/shared/types/api'

const LOCALE = 'pt-BR'

/**
 * A API manda instantes em UTC (ADR-004 C4). A exibição é sempre no fuso do
 * navegador — converter é responsabilidade da view, não do backend.
 */
export function formatDateTime(value: IsoInstant | null | undefined): string {
  if (!value) return '—'
  return new Intl.DateTimeFormat(LOCALE, { dateStyle: 'short', timeStyle: 'short' }).format(
    new Date(value),
  )
}

/**
 * `LocalDate` não tem fuso: `2026-07-29` interpretado como UTC vira 28/07 em
 * São Paulo. Por isso a data é formatada a partir das partes, sem `Date`.
 */
export function formatDate(value: IsoDate | null | undefined): string {
  if (!value) return '—'
  const [year, month, day] = value.split('-')
  return `${day}/${month}/${year}`
}

export function formatCurrency(value: number | null | undefined, currency = 'BRL'): string {
  if (value === null || value === undefined) return '—'
  return new Intl.NumberFormat(LOCALE, { style: 'currency', currency }).format(value)
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  const units = ['KB', 'MB', 'GB']
  let size = bytes / 1024
  let unit = 0
  while (size >= 1024 && unit < units.length - 1) {
    size /= 1024
    unit += 1
  }
  return `${size.toFixed(1).replace('.', ',')} ${units[unit]}`
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/)
  const first = parts.at(0)?.at(0) ?? ''
  const last = parts.length > 1 ? (parts.at(-1)?.at(0) ?? '') : ''
  return (first + last).toUpperCase()
}

/**
 * `<input type="datetime-local">` trabalha em hora local e sem fuso; a API fala
 * UTC ISO-8601. As duas funções abaixo são a tradução entre os dois mundos.
 */
export function toDateTimeLocal(value: IsoInstant | null | undefined): string {
  if (!value) return ''
  const date = new Date(value)
  const offsetMs = date.getTimezoneOffset() * 60_000
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16)
}

export function fromDateTimeLocal(value: string | undefined): string | undefined {
  if (!value) return undefined
  return new Date(value).toISOString()
}

/** Hora do dia de um instante — usada nas listas de agenda. */
export function formatTime(value: IsoInstant | null | undefined): string {
  if (!value) return '—'
  return new Intl.DateTimeFormat(LOCALE, { timeStyle: 'short' }).format(new Date(value))
}
