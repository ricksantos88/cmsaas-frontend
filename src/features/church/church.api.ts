import { http, omitUndefined, toQuery } from '@/shared/api/http'
import type { PageParams, PageResponse } from '@/shared/types/api'
import type {
  Address,
  Church,
  ChurchContact,
  ChurchStatus,
  ChurchSummary,
  Denomination,
} from '@/shared/types/domain'

const BASE = '/api/v1/churches'

export interface ChurchPayload {
  name?: string
  description?: string
  denomination?: Denomination
  status?: ChurchStatus
  address?: Address
  contact?: ChurchContact
  presidentPastorId?: string
  adminUserId?: string
  foundationDate?: string
}

export const churchApi = {
  /** Dados da própria igreja — o id vem do token, exposto em `user.churchId`. */
  getById: (id: string) => http.get<Church>(`${BASE}/${id}`).then((r) => r.data),

  update: (id: string, payload: ChurchPayload) =>
    http.put<Church>(`${BASE}/${id}`, omitUndefined({ ...payload })).then((r) => r.data),

  // ── plataforma (SUPER_ADMIN, cross-tenant — ADR-004 R7 do backend) ─────────

  list: (filters: PageParams & { search?: string }) =>
    http
      .get<PageResponse<ChurchSummary>>(BASE, { params: toQuery({ ...filters }) })
      .then((r) => r.data),

  create: (payload: ChurchPayload) =>
    http.post<Church>(BASE, omitUndefined({ ...payload })).then((r) => r.data),

  remove: (id: string) => http.delete<void>(`${BASE}/${id}`).then(() => undefined),
}
