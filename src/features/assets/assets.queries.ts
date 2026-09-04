import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  assetsApi,
  type AssetFilters,
  type AssetPayload,
  type MaintenancePayload,
} from './assets.api'

export const assetKeys = {
  all: ['assets'] as const,
  list: (filters: AssetFilters) => [...assetKeys.all, 'list', filters] as const,
  detail: (id: string) => [...assetKeys.all, 'detail', id] as const,
  summary: () => [...assetKeys.all, 'summary'] as const,
}

export function useAssets(filters: AssetFilters) {
  return useQuery({
    queryKey: assetKeys.list(filters),
    queryFn: () => assetsApi.list(filters),
    placeholderData: (previous) => previous,
  })
}

export function useAssetsSummary() {
  return useQuery({ queryKey: assetKeys.summary(), queryFn: () => assetsApi.summary() })
}

export function useAsset(id: string | undefined) {
  return useQuery({
    queryKey: assetKeys.detail(id ?? ''),
    queryFn: () => assetsApi.getById(id as string),
    enabled: Boolean(id),
  })
}

export function useSaveAsset(id?: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: AssetPayload) =>
      id ? assetsApi.update(id, payload) : assetsApi.create(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: assetKeys.all }),
  })
}

export function useDeleteAsset() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => assetsApi.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: assetKeys.all }),
  })
}

export function useRegisterMaintenance(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: MaintenancePayload) => assetsApi.registerMaintenance(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: assetKeys.all }),
  })
}
