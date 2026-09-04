import { http, omitUndefined, toQuery } from '@/shared/api/http'
import type { PageParams, PageResponse, SortParams, IsoDate } from '@/shared/types/api'
import type {
  CreateMemberRequest,
  Member,
  MemberStatus,
  MemberSummary,
  UpdateMemberRequest,
} from '@/shared/types/domain'

const BASE = '/api/v1/members'

/** Filtros de `GET /members` — `churchId` não existe aqui de propósito (ADR-004). */
export interface MemberFilters extends PageParams, SortParams {
  search?: string
  status?: MemberStatus
  baptized?: boolean
  city?: string
  fromDate?: IsoDate
  toDate?: IsoDate
}

export const membersApi = {
  list: (filters: MemberFilters) =>
    http
      .get<PageResponse<MemberSummary>>(BASE, { params: toQuery({ ...filters }) })
      .then((r) => r.data),

  getById: (id: string) => http.get<Member>(`${BASE}/${id}`).then((r) => r.data),

  create: (payload: CreateMemberRequest) =>
    http.post<Member>(BASE, omitUndefined({ ...payload })).then((r) => r.data),

  update: (id: string, payload: UpdateMemberRequest) =>
    http.put<Member>(`${BASE}/${id}`, omitUndefined({ ...payload })).then((r) => r.data),

  remove: (id: string) => http.delete<void>(`${BASE}/${id}`).then(() => undefined),
}
