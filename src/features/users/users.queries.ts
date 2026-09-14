import { useMutation, useQueryClient } from '@tanstack/react-query'
import { usersApi } from './users.api'
import type { InviteUserRequest } from '@/shared/types/domain'

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
