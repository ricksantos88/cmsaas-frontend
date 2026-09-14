import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { financesApi } from './finances.api'
import type {
  CreateFinancialEntryRequest,
  FinancialFilters,
  UpdateFinancialEntryRequest,
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from '@/shared/types/domain'
import type { Uuid } from '@/shared/types/api'

export const financesKeys = {
  all: ['finances'] as const,
  lists: () => [...financesKeys.all, 'list'] as const,
  list: (filters: FinancialFilters) => [...financesKeys.lists(), filters] as const,
  reports: () => [...financesKeys.all, 'report'] as const,
  report: (year: number, month: number) => [...financesKeys.reports(), { year, month }] as const,
  categories: () => [...financesKeys.all, 'categories'] as const,
}

export function useFinancialEntries(filters: FinancialFilters) {
  return useQuery({
    queryKey: financesKeys.list(filters),
    queryFn: () => financesApi.findMany(filters),
  })
}

export function useFinancialReport(year: number, month: number) {
  return useQuery({
    queryKey: financesKeys.report(year, month),
    queryFn: () => financesApi.getReport(year, month),
  })
}

export function useCategoriesOptions() {
  return useQuery({
    queryKey: financesKeys.categories(),
    queryFn: () => financesApi.getCategories(),
  })
}

export function useCreateEntry() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateFinancialEntryRequest) => financesApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financesKeys.lists() })
      queryClient.invalidateQueries({ queryKey: financesKeys.reports() })
    },
  })
}

export function useUpdateEntry(id: Uuid) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: UpdateFinancialEntryRequest) => financesApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financesKeys.lists() })
      queryClient.invalidateQueries({ queryKey: financesKeys.reports() })
    },
  })
}

export function useDeleteEntry() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: Uuid) => financesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financesKeys.lists() })
      queryClient.invalidateQueries({ queryKey: financesKeys.reports() })
    },
  })
}

export function useCreateCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateCategoryRequest) => financesApi.createCategory(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financesKeys.categories() })
    },
  })
}

export function useUpdateCategory(id: Uuid) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: UpdateCategoryRequest) => financesApi.updateCategory(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financesKeys.categories() })
    },
  })
}

export function useDeleteCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: Uuid) => financesApi.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financesKeys.categories() })
    },
  })
}
