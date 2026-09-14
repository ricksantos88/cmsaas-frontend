import { http, omitUndefined, toQuery } from '@/shared/api/http'
import type { IsoDate, IsoInstant, PageParams, PageResponse, PaginationMeta } from '@/shared/types/api'
import type {
  AbsenteeListResponse,
  CalendarResponse,
  EventDetails,
  Instrument,
  Preacher,
  ScaleStatus,
  Schedule,
  ScheduleMusician,
  ScheduleStatus,
  ScheduleSummary,
  ScheduleType,
  ScheduleVisibility,
} from '@/shared/types/domain'

const BASE = '/api/v1/schedules'

export interface ScheduleFilters extends PageParams {
  search?: string
  type?: ScheduleType
  fromDate?: IsoDate
  toDate?: IsoDate
  status?: ScheduleStatus
  visibility?: ScheduleVisibility
  pastorId?: string
}

export interface SchedulePayload {
  type?: ScheduleType
  title?: string
  description?: string | null
  startDateTime?: IsoInstant
  endDateTime?: IsoInstant | null
  location?: string | null
  address?: string | null
  city?: string | null
  preacher?: Preacher | null
  eventDetails?: EventDetails
  notifications?: { sendReminder?: boolean; reminderDays?: number }
  status?: ScheduleStatus
}

export interface AttendanceListResponse {
  data: {
    id: string
    memberId: string
    memberName: string | null
    checkInTime: IsoInstant
    checkOutTime: IsoInstant | null
    present: boolean
  }[]
  pagination: PaginationMeta
  summary: { totalAttended: number; totalExpected: number | null; attendancePercentage: number | null }
}

export const schedulesApi = {
  list: (filters: ScheduleFilters) =>
    http
      .get<PageResponse<ScheduleSummary>>(BASE, { params: toQuery({ ...filters }) })
      .then((r) => r.data),

  calendar: (year: number, month: number) =>
    http.get<CalendarResponse>(`${BASE}/calendar`, { params: { year, month } }).then((r) => r.data),

  getById: (id: string) => http.get<Schedule>(`${BASE}/${id}`).then((r) => r.data),

  create: (payload: SchedulePayload) =>
    http.post<Schedule>(BASE, omitUndefined({ ...payload })).then((r) => r.data),

  update: (id: string, payload: SchedulePayload) =>
    http.put<Schedule>(`${BASE}/${id}`, omitUndefined({ ...payload })).then((r) => r.data),

  /** DELETE cancela o evento (soft delete + status CANCELLED). */
  cancel: (id: string) => http.delete<void>(`${BASE}/${id}`).then(() => undefined),

  // ── presença ───────────────────────────────────────────────────────────────

  listAttendance: (id: string, page = 1, limit = 50) =>
    http
      .get<AttendanceListResponse>(`${BASE}/${id}/attendance`, { params: { page, limit } })
      .then((r) => r.data),

  /** Check-in individual ou em lote; é idempotente do lado do servidor. */
  registerAttendance: (id: string, memberIds: string[]) =>
    http
      .post<{ registered: number; alreadyRegistered: number; totalAttended: number }>(
        `${BASE}/${id}/attendance`,
        memberIds.length === 1 ? { memberId: memberIds[0] } : { memberIds },
      )
      .then((r) => r.data),

  undoAttendance: (id: string, memberId: string) =>
    http.delete<void>(`${BASE}/${id}/attendance/${memberId}`).then(() => undefined),

  getAbsentees: (id: string, filters?: PageParams & { search?: string }) =>
    http
      .get<AbsenteeListResponse>(`${BASE}/${id}/absentees`, { params: toQuery({ ...filters }) })
      .then((r) => r.data),

  // ── escala de músicos ──────────────────────────────────────────────────────

  listScale: (id: string) =>
    http.get<ScheduleMusician[]>(`${BASE}/${id}/musicians`).then((r) => r.data),

  scaleMusician: (id: string, payload: { musicianId: string; instrument?: Instrument; notes?: string }) =>
    http.post<ScheduleMusician>(`${BASE}/${id}/musicians`, omitUndefined({ ...payload })).then((r) => r.data),

  updateScale: (id: string, musicianId: string, payload: { status?: ScaleStatus }) =>
    http
      .put<ScheduleMusician>(`${BASE}/${id}/musicians/${musicianId}`, omitUndefined({ ...payload }))
      .then((r) => r.data),

  removeFromScale: (id: string, musicianId: string) =>
    http.delete<void>(`${BASE}/${id}/musicians/${musicianId}`).then(() => undefined),
}
