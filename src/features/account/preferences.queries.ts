import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { preferencesApi, type PreferencesResponse } from './preferences.api'

export const preferenceKeys = {
  all: ['account', 'preferences'] as const,
}

export function usePreferences() {
  return useQuery({
    queryKey: preferenceKeys.all,
    queryFn: () => preferencesApi.get(),
  })
}

export function useUpdatePreferences() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (types: PreferencesResponse['types']) => preferencesApi.update(types),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: preferenceKeys.all }),
  })
}
