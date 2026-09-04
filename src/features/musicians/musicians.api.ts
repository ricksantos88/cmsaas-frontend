import { http, omitUndefined, toQuery } from '@/shared/api/http'
import type { DayOfWeek, PageParams, PageResponse } from '@/shared/types/api'
import type {
  Instrument,
  MinistryRole,
  Musician,
  MusicianInstrument,
  MusicianStatus,
  MusicianSummary,
  VoiceType,
} from '@/shared/types/domain'

const BASE = '/api/v1/musicians'

export interface MusicianFilters extends PageParams {
  search?: string
  instrument?: Instrument
  ministryRole?: MinistryRole
  canSing?: boolean
  status?: MusicianStatus
  availableOn?: DayOfWeek
}

export interface MusicianPayload {
  memberId?: string
  ministryRole?: MinistryRole
  instruments?: MusicianInstrument[]
  voiceType?: VoiceType
  canSing?: boolean
  isWorshipLeader?: boolean
  availability?: { daysAvailable: DayOfWeek[]; notes?: string }
  status?: MusicianStatus
}

export const musiciansApi = {
  list: (filters: MusicianFilters) =>
    http
      .get<PageResponse<MusicianSummary>>(BASE, { params: toQuery({ ...filters }) })
      .then((r) => r.data),

  getById: (id: string) => http.get<Musician>(`${BASE}/${id}`).then((r) => r.data),

  create: (payload: MusicianPayload) =>
    http.post<Musician>(BASE, omitUndefined({ ...payload })).then((r) => r.data),

  update: (id: string, payload: MusicianPayload) =>
    http.put<Musician>(`${BASE}/${id}`, omitUndefined({ ...payload })).then((r) => r.data),

  remove: (id: string) => http.delete<void>(`${BASE}/${id}`).then(() => undefined),
}
