import { http, omitUndefined, toQuery } from '@/shared/api/http'
import type { PageResponse } from '@/shared/types/api'
import type {
  CreateMemberRequest,
  Member,
  MemberFilters,
  MemberSummary,
  UpdateMemberRequest,
} from '@/shared/types/domain'

const BASE = '/api/v1/members'

export type { MemberFilters }

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
