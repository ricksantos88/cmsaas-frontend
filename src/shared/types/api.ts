/**
 * Envelopes transversais da API — ADR-004 (convenções C1, C3, C4).
 * Espelham `common/web/PageResponse.kt` e `common/exception/ErrorResponse.kt`.
 */

/** Timestamp UTC ISO-8601 (`2026-07-29T10:30:00Z`). */
export type IsoInstant = string
/** Data sem fuso (`2026-07-29`). */
export type IsoDate = string
/** Hora local (`19:30`). */
export type IsoTime = string
export type Uuid = string

export interface PaginationMeta {
  page: number
  pageSize: number
  totalItems: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

export interface PageResponse<T> {
  data: T[]
  pagination: PaginationMeta
}

export interface FieldValidationError {
  field: string
  message: string
}

export interface ErrorDetail {
  code: string
  message: string
  details?: FieldValidationError[] | unknown
}

export interface ApiErrorBody {
  error: ErrorDetail
  traceId: string
  timestamp: IsoInstant
}

/** Parâmetros que toda listagem aceita (ADR-004 C1/C2). */
export interface PageParams {
  page?: number
  limit?: number
}

export interface SortParams {
  sortBy?: string
  sortOrder?: 'ASC' | 'DESC'
}

export const DEFAULT_PAGE_SIZE = 20
export const MAX_PAGE_SIZE = 100

export type DayOfWeek =
  | 'MONDAY'
  | 'TUESDAY'
  | 'WEDNESDAY'
  | 'THURSDAY'
  | 'FRIDAY'
  | 'SATURDAY'
  | 'SUNDAY'
