import { http, omitUndefined, toQuery } from '@/shared/api/http'
import type { DayOfWeek, PageParams, PageResponse } from '@/shared/types/api'
import type { Address, Cell, CellStatus, CellSummary, Meeting } from '@/shared/types/domain'

const BASE = '/api/v1/cells'

export interface CellFilters extends PageParams {
  search?: string
  leaderId?: string
  supervisorPastorId?: string
  dayOfWeek?: DayOfWeek
  status?: CellStatus
}

export interface CellPayload {
  name?: string
  description?: string
  /** Limpáveis: `null` remove o vínculo, ausente não altera (contracts/README). */
  leaderId?: string | null
  coLeaderId?: string | null
  supervisorPastorId?: string | null
  meeting?: Meeting
  address?: Address
  status?: CellStatus
}

export const cellsApi = {
  list: (filters: CellFilters) =>
    http.get<PageResponse<CellSummary>>(BASE, { params: toQuery({ ...filters }) }).then((r) => r.data),

  getById: (id: string) => http.get<Cell>(`${BASE}/${id}`).then((r) => r.data),

  create: (payload: CellPayload) =>
    http.post<Cell>(BASE, omitUndefined({ ...payload })).then((r) => r.data),

  update: (id: string, payload: CellPayload) =>
    http.put<Cell>(`${BASE}/${id}`, omitUndefined({ ...payload })).then((r) => r.data),

  remove: (id: string) => http.delete<void>(`${BASE}/${id}`).then(() => undefined),

  addMembers: (id: string, memberIds: string[]) =>
    http.post<Cell>(`${BASE}/${id}/members`, { memberIds }).then((r) => r.data),

  removeMember: (id: string, memberId: string) =>
    http.delete<void>(`${BASE}/${id}/members/${memberId}`).then(() => undefined),
}
