import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { schedulesApi, type ScheduleFilters, type SchedulePayload } from './schedules.api'
import type { Instrument, ScaleStatus } from '@/shared/types/domain'

export const scheduleKeys = {
  all: ['schedules'] as const,
  list: (filters: ScheduleFilters) => [...scheduleKeys.all, 'list', filters] as const,
  calendar: (year: number, month: number) => [...scheduleKeys.all, 'calendar', year, month] as const,
  detail: (id: string) => [...scheduleKeys.all, 'detail', id] as const,
  attendance: (id: string) => [...scheduleKeys.all, 'attendance', id] as const,
  scale: (id: string) => [...scheduleKeys.all, 'scale', id] as const,
}

export function useSchedules(filters: ScheduleFilters) {
  return useQuery({
    queryKey: scheduleKeys.list(filters),
    queryFn: () => schedulesApi.list(filters),
    placeholderData: (previous) => previous,
  })
}

export function useCalendar(year: number, month: number) {
  return useQuery({
    queryKey: scheduleKeys.calendar(year, month),
    queryFn: () => schedulesApi.calendar(year, month),
  })
}

export function useSchedule(id: string | undefined) {
  return useQuery({
    queryKey: scheduleKeys.detail(id ?? ''),
    queryFn: () => schedulesApi.getById(id as string),
    enabled: Boolean(id),
  })
}

export function useSaveSchedule(id?: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: SchedulePayload) =>
      id ? schedulesApi.update(id, payload) : schedulesApi.create(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: scheduleKeys.all }),
  })
}

export function useCancelSchedule() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => schedulesApi.cancel(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: scheduleKeys.all }),
  })
}

export function useAttendance(id: string | undefined) {
  return useQuery({
    queryKey: scheduleKeys.attendance(id ?? ''),
    queryFn: () => schedulesApi.listAttendance(id as string),
    enabled: Boolean(id),
  })
}

/** Presença altera o `attendanceCount` da lista: invalida o domínio inteiro. */
export function useRegisterAttendance(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (memberIds: string[]) => schedulesApi.registerAttendance(id, memberIds),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: scheduleKeys.all }),
  })
}

export function useUndoAttendance(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (memberId: string) => schedulesApi.undoAttendance(id, memberId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: scheduleKeys.all }),
  })
}

export function useScale(id: string | undefined) {
  return useQuery({
    queryKey: scheduleKeys.scale(id ?? ''),
    queryFn: () => schedulesApi.listScale(id as string),
    enabled: Boolean(id),
  })
}

export function useScaleMusician(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: { musicianId: string; instrument?: Instrument; notes?: string }) =>
      schedulesApi.scaleMusician(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: scheduleKeys.scale(id) }),
  })
}

export function useUpdateScale(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ musicianId, status }: { musicianId: string; status: ScaleStatus }) =>
      schedulesApi.updateScale(id, musicianId, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: scheduleKeys.scale(id) }),
  })
}

export function useRemoveFromScale(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (musicianId: string) => schedulesApi.removeFromScale(id, musicianId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: scheduleKeys.scale(id) }),
  })
}
