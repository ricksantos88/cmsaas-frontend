import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  documentsApi,
  type DocumentFilters,
  type UpdateDocumentInput,
  type UploadDocumentInput,
} from './documents.api'

export const documentKeys = {
  all: ['documents'] as const,
  list: (filters: DocumentFilters) => [...documentKeys.all, 'list', filters] as const,
  detail: (id: string) => [...documentKeys.all, 'detail', id] as const,
}

export function useDocuments(filters: DocumentFilters) {
  return useQuery({
    queryKey: documentKeys.list(filters),
    queryFn: () => documentsApi.list(filters),
    placeholderData: (previous) => previous,
  })
}

export function useDocument(id: string | undefined) {
  return useQuery({
    queryKey: documentKeys.detail(id ?? ''),
    queryFn: () => documentsApi.getById(id as string),
    enabled: Boolean(id),
  })
}

export function useUploadDocument() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: UploadDocumentInput) => documentsApi.upload(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: documentKeys.all }),
  })
}

export function useUpdateDocument(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: UpdateDocumentInput) => documentsApi.update(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: documentKeys.all }),
  })
}

export function useDeleteDocument() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => documentsApi.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: documentKeys.all }),
  })
}
