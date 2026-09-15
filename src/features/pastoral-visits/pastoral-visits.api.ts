import { http, omitUndefined } from '@/shared/api/http'
import type {
  CompletePastoralVisitRequest,
  PastoralVisit,
  RequestPastoralVisitPayload,
  SchedulePastoralVisitRequest,
} from '@/shared/types/domain'

export const pastoralVisitsApi = {
  list: () => http.get<PastoralVisit[]>('/api/v1/pastoral-visits').then((r) => r.data),

  listMyRequests: () => http.get<PastoralVisit[]>('/api/v1/pastoral-visits/requests/my').then((r) => r.data),

  getById: (id: string) => http.get<PastoralVisit>(`/api/v1/pastoral-visits/${id}`).then((r) => r.data),

  requestVisit: (payload: RequestPastoralVisitPayload) =>
    http.post<PastoralVisit>('/api/v1/pastoral-visits/requests', omitUndefined({ ...payload })).then((r) => r.data),

  scheduleVisit: (payload: SchedulePastoralVisitRequest) =>
    http.post<PastoralVisit>('/api/v1/pastoral-visits', omitUndefined({ ...payload })).then((r) => r.data),

  completeVisit: (id: string, payload: CompletePastoralVisitRequest) =>
    http.post<PastoralVisit>(`/api/v1/pastoral-visits/${id}/complete`, omitUndefined({ ...payload })).then((r) => r.data),

  cancelVisit: (id: string) => http.post<PastoralVisit>(`/api/v1/pastoral-visits/${id}/cancel`).then((r) => r.data),
}
