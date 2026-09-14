import { http, omitUndefined, toQuery } from '@/shared/api/http'
import type { PageResponse } from '@/shared/types/api'
import type {
  Category,
  CreateFinancialEntryRequest,
  FinancialEntry,
  FinancialFilters,
  FinancialReport,
  UpdateFinancialEntryRequest,
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from '@/shared/types/domain'
import type { Uuid } from '@/shared/types/api'

const BASE = '/api/v1/finances'

export const financesApi = {
  findMany: async (filters: FinancialFilters): Promise<PageResponse<FinancialEntry>> => {
    const { data } = await http.get<PageResponse<FinancialEntry>>(`${BASE}/entries`, {
      params: toQuery({ ...filters }),
    })
    return data
  },

  getReport: async (year: number, month: number): Promise<FinancialReport> => {
    const { data } = await http.get<FinancialReport>(`${BASE}/report`, {
      params: { year, month },
    })
    return data
  },

  getCategories: async (): Promise<Category[]> => {
    const { data } = await http.get<Category[]>(`${BASE}/categories`)
    return data
  },

  createCategory: async (payload: CreateCategoryRequest): Promise<Category> => {
    const { data } = await http.post<Category>(`${BASE}/categories`, omitUndefined({ ...payload }))
    return data
  },

  updateCategory: async (id: Uuid, payload: UpdateCategoryRequest): Promise<Category> => {
    const { data } = await http.put<Category>(`${BASE}/categories/${id}`, omitUndefined({ ...payload }))
    return data
  },

  deleteCategory: async (id: Uuid): Promise<void> => {
    await http.delete(`${BASE}/categories/${id}`)
  },

  create: async (payload: CreateFinancialEntryRequest): Promise<FinancialEntry> => {
    const { data } = await http.post<FinancialEntry>(`${BASE}/entries`, omitUndefined({ ...payload }))
    return data
  },

  update: async (id: Uuid, payload: UpdateFinancialEntryRequest): Promise<FinancialEntry> => {
    const { data } = await http.patch<FinancialEntry>(`${BASE}/entries/${id}`, omitUndefined({ ...payload }))
    return data
  },

  delete: async (id: Uuid): Promise<void> => {
    await http.delete(`${BASE}/entries/${id}`)
  },
}
