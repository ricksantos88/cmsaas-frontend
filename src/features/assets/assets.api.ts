import { http, omitUndefined, toQuery } from '@/shared/api/http'
import type { PageParams, PageResponse } from '@/shared/types/api'
import type {
  Acquisition,
  AssetCategory,
  AssetCondition,
  AssetsSummary,
  AssetStatus,
  AssetSummary,
  MaintenanceType,
} from '@/shared/types/domain'

const BASE = '/api/v1/assets'

/** Detalhe do item, com histórico de manutenção (`AssetResponse` do backend). */
export interface AssetDetail extends AssetSummary {
  churchId: string | null
  description: string | null
  serialNumber: string | null
  acquisition: Acquisition
  responsible: { id: string; fullName: string | null } | null
  warrantyUntil: string | null
  nextMaintenanceDate: string | null
  notes: string | null
  maintenanceHistory: {
    id: string
    date: string
    type: MaintenanceType
    description: string | null
    cost: number | null
    performedBy: string | null
    conditionAfter: AssetCondition | null
  }[]
  createdAt: string
  updatedAt: string
}

export interface AssetFilters extends PageParams {
  search?: string
  category?: AssetCategory
  condition?: AssetCondition
  status?: AssetStatus
  location?: string
  responsibleMemberId?: string
  minValue?: number
  maxValue?: number
}

export interface AssetPayload {
  name?: string
  description?: string
  category?: AssetCategory
  assetTag?: string
  serialNumber?: string
  acquisition?: Acquisition
  condition?: AssetCondition
  /** Limpáveis no update: `null` apaga o valor. */
  location?: string | null
  responsibleMemberId?: string | null
  warrantyUntil?: string | null
  nextMaintenanceDate?: string | null
  notes?: string | null
  status?: AssetStatus
}

export interface MaintenancePayload {
  date: string
  type: MaintenanceType
  description?: string
  cost?: number
  performedBy?: string
  conditionAfter?: AssetCondition
  nextMaintenanceDate?: string
}

export const assetsApi = {
  list: (filters: AssetFilters) =>
    http
      .get<PageResponse<AssetSummary>>(BASE, { params: toQuery({ ...filters }) })
      .then((r) => r.data),

  summary: () => http.get<AssetsSummary>(`${BASE}/summary`).then((r) => r.data),

  getById: (id: string) => http.get<AssetDetail>(`${BASE}/${id}`).then((r) => r.data),

  create: (payload: AssetPayload) =>
    http.post<AssetDetail>(BASE, omitUndefined({ ...payload })).then((r) => r.data),

  update: (id: string, payload: AssetPayload) =>
    http.put<AssetDetail>(`${BASE}/${id}`, omitUndefined({ ...payload })).then((r) => r.data),

  remove: (id: string) => http.delete<void>(`${BASE}/${id}`).then(() => undefined),

  registerMaintenance: (id: string, payload: MaintenancePayload) =>
    http
      .post<AssetDetail>(`${BASE}/${id}/maintenance`, omitUndefined({ ...payload }))
      .then((r) => r.data),
}
