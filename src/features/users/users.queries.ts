import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { usersApi } from './users.api'
import type { InviteUserRequest } from '@/shared/types/domain'
import type { Role } from '@/shared/types/roles'

export function useUsers(enabled = true) {
  return useQuery({
    queryKey: ['users'],
    queryFn: () => usersApi.list(),
    enabled,
  })
}

export function useInviteUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: InviteUserRequest) => usersApi.invite(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['members'] })
      void queryClient.invalidateQueries({ queryKey: ['pastors'] })
      void queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}

export function useUpdateUserRoles() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ userId, roles }: { userId: string; roles: Role[] }) =>
      usersApi.updateRoles(userId, { roles }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['members'] })
      void queryClient.invalidateQueries({ queryKey: ['pastors'] })
      void queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}
