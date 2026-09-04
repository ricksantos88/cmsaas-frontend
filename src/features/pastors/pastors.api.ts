import { http, omitUndefined, toQuery } from '@/shared/api/http'
import type { PageParams, PageResponse } from '@/shared/types/api'
import type { ContactVisibility, Pastor, PastorRole, PastorSummary, WorkSchedule } from '@/shared/types/domain'

/** `GET /pastors/{id}/contacts` — o backend filtra os campos pela visibilidade. */
export interface PastorContacts {
  id: string
  name: string
  role: PastorRole
  visibilityLevel: ContactVisibility
  email: string | null
  phone: string | null
  workSchedule: WorkSchedule | null
}

const BASE = '/api/v1/pastors'

export interface PastorFilters extends PageParams {
  search?: string
  role?: PastorRole
}

export interface PastorPayload {
  name?: string
  email?: string
  phone?: string
  dateOfBirth?: string
  role?: PastorRole
  position?: string
  biography?: string
  ordainmentDate?: string
  specializations?: string[]
  contactVisibility?: string
  status?: string
}

export const pastorsApi = {
  list: (filters: PastorFilters) =>
    http
      .get<PageResponse<PastorSummary>>(BASE, { params: toQuery({ ...filters }) })
      .then((r) => r.data),

  getById: (id: string) => http.get<Pastor>(`${BASE}/${id}`).then((r) => r.data),

  contacts: (id: string) =>
    http.get<PastorContacts>(`${BASE}/${id}/contacts`).then((r) => r.data),

  create: (payload: PastorPayload) =>
    http.post<Pastor>(BASE, omitUndefined({ ...payload })).then((r) => r.data),

  update: (id: string, payload: PastorPayload) =>
    http.put<Pastor>(`${BASE}/${id}`, omitUndefined({ ...payload })).then((r) => r.data),

  remove: (id: string) => http.delete<void>(`${BASE}/${id}`).then(() => undefined),
}
