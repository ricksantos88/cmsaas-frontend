/**
 * Consultas leves compartilhadas para popular seletores (combobox, select).
 * Centralizado aqui para respeitar o isolamento entre features (ADR-006 R2).
 */
import { useQuery } from '@tanstack/react-query'
import { http } from '@/shared/api/http'
import type { PageResponse } from '@/shared/types/api'
import type { CellSummary, MemberSummary, MusicianSummary, PastorSummary } from '@/shared/types/domain'

export const optionKeys = {
  members: ['options', 'members'] as const,
  pastors: ['options', 'pastors'] as const,
  cells: ['options', 'cells'] as const,
  musicians: ['options', 'musicians'] as const,
}

/** Membros ativos para seleção (líder de célula, responsável por item, escala). */
export function useMemberOptions() {
  return useQuery({
    queryKey: optionKeys.members,
    queryFn: () =>
      http
        .get<PageResponse<MemberSummary>>('/api/v1/members', {
          params: { page: 1, limit: 100, status: 'ACTIVE' },
        })
        .then((r) => r.data),
    staleTime: 5 * 60_000,
  })
}

/** Pastores ativos para seleção (pastor supervisor de célula, pregador, presidente). */
export function usePastorOptions() {
  return useQuery({
    queryKey: optionKeys.pastors,
    queryFn: () =>
      http
        .get<PageResponse<PastorSummary>>('/api/v1/pastors', {
          params: { page: 1, limit: 100, status: 'ACTIVE' },
        })
        .then((r) => r.data),
    staleTime: 5 * 60_000,
  })
}

/** Células para seleção (audiência de notificação, relatórios). */
export function useCellOptions() {
  return useQuery({
    queryKey: optionKeys.cells,
    queryFn: () =>
      http
        .get<PageResponse<CellSummary>>('/api/v1/cells', {
          params: { page: 1, limit: 100, status: 'ACTIVE' },
        })
        .then((r) => r.data),
    staleTime: 5 * 60_000,
  })
}

/** Músicos ativos para seleção (escala de louvor). */
export function useMusicianOptions() {
  return useQuery({
    queryKey: optionKeys.musicians,
    queryFn: () =>
      http
        .get<PageResponse<MusicianSummary>>('/api/v1/musicians', {
          params: { page: 1, limit: 100, status: 'ACTIVE' },
        })
        .then((r) => r.data),
    staleTime: 5 * 60_000,
  })
}
