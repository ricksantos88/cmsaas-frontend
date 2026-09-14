import { http, omitUndefined } from '@/shared/api/http'
import type { CreatePastoralRecordRequest, PastoralCareRecord } from '@/shared/types/domain'

export const pastoralCareApi = {
  listByMember: (memberId: string) =>
    http.get<PastoralCareRecord[]>(`/api/v1/members/${memberId}/pastoral-care`).then((r) => r.data),

  create: (memberId: string, payload: CreatePastoralRecordRequest) =>
    http
      .post<PastoralCareRecord>(`/api/v1/members/${memberId}/pastoral-care`, omitUndefined({ ...payload }))
      .then((r) => r.data),
}
