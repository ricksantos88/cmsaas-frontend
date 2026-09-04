import { useMutation } from '@tanstack/react-query'
import { authApi } from '@/features/auth/auth.api'
import { useSessionStore } from '@/features/auth/session.store'
import type { UpdateMeRequest } from '@/shared/types/domain'

/**
 * Trocar a senha **revoga todas as sessões** no backend (auth.md → Segurança).
 * Quem chama isto precisa encerrar a sessão local em seguida — senão o usuário
 * fica com um access token que morre sozinho em até uma hora, sem aviso.
 */
export function useChangePassword() {
  return useMutation({
    mutationFn: (payload: { currentPassword: string; newPassword: string }) =>
      authApi.changePassword(payload),
  })
}

/**
 * Atualiza os próprios dados. A resposta traz o usuário já gravado — ela vira a
 * sessão em memória, senão o cabeçalho continuaria mostrando o nome antigo.
 */
export function useUpdateMe() {
  return useMutation({
    mutationFn: (payload: UpdateMeRequest) => authApi.updateMe(payload),
    onSuccess: (user) => useSessionStore.setState({ user }),
  })
}
