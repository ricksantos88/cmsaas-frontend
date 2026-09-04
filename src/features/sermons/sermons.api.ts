import { http, omitUndefined, toQuery } from '@/shared/api/http'
import type { IsoDate, PageParams, PageResponse } from '@/shared/types/api'
import type {
  BibleReference,
  Sermon,
  SermonStatus,
  SermonSummary,
  SermonTopic,
  SermonType,
  SermonVisibility,
  TrendingPeriod,
} from '@/shared/types/domain'

const BASE = '/api/v1/sermons'

export interface SermonFilters extends PageParams {
  search?: string
  preacherId?: string
  topic?: SermonTopic
  sermonType?: SermonType
  fromDate?: IsoDate
  toDate?: IsoDate
  keyword?: string
  sortBy?: string
}

export interface SermonPayload {
  title?: string
  description?: string | null
  preacherId?: string | null
  bibleReferences?: BibleReference[]
  sermonDate?: IsoDate
  sermonTime?: string | null
  duration?: number | null
  topic?: SermonTopic
  sermonType?: SermonType
  /** Só o link: o embed é derivado no backend (HTML do cliente é ignorado). */
  youtubeLink?: string | null
  visibility?: SermonVisibility
  keywords?: string[]
  status?: SermonStatus
}

export interface TrendingResponse {
  period: TrendingPeriod
  trending: {
    rank: number
    id: string
    title: string
    preacher: string | null
    viewCount: number
    likes: number
    trendingScore: number
  }[]
}

export const sermonsApi = {
  list: (filters: SermonFilters) =>
    http
      .get<PageResponse<SermonSummary>>(BASE, { params: toQuery({ ...filters }) })
      .then((r) => r.data),

  trending: (period: TrendingPeriod = 'MONTH', limit = 5) =>
    http.get<TrendingResponse>(`${BASE}/trending`, { params: { period, limit } }).then((r) => r.data),

  getById: (id: string) => http.get<Sermon>(`${BASE}/${id}`).then((r) => r.data),

  recommendations: (id: string, limit = 5) =>
    http
      .get<{ recommendations: SermonSummary[] }>(`${BASE}/${id}/recommendations`, { params: { limit } })
      .then((r) => r.data),

  create: (payload: SermonPayload) =>
    http.post<Sermon>(BASE, omitUndefined({ ...payload })).then((r) => r.data),

  update: (id: string, payload: SermonPayload) =>
    http.put<Sermon>(`${BASE}/${id}`, omitUndefined({ ...payload })).then((r) => r.data),

  remove: (id: string) => http.delete<void>(`${BASE}/${id}`).then(() => undefined),
}
