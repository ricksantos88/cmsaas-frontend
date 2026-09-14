import { toast } from 'sonner'
import { ApiError } from '@/shared/api/api-error'

/** Feedback de mutação bem-sucedida — curto e no passado. */
export function notifySuccess(message: string): void {
  toast.success(message)
}

/**
 * Feedback de falha. A mensagem sai da `ApiError` já traduzida; o `traceId`
 * aparece na descrição para o usuário conseguir reportar o caso.
 * Também suporta strings simples, instâncias de `Error` e objetos com `message`.
 */
export function notifyError(error: unknown, fallback = 'Não foi possível concluir a ação.'): void {
  if (typeof error === 'string' && error.trim() !== '') {
    toast.error(error)
    return
  }

  if (error instanceof ApiError) {
    toast.error(error.message, error.traceId ? { description: `traceId: ${error.traceId}` } : undefined)
    return
  }

  if (error instanceof Error && error.message.trim() !== '') {
    toast.error(error.message)
    return
  }

  if (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as { message: unknown }).message === 'string' &&
    (error as { message: string }).message.trim() !== ''
  ) {
    toast.error((error as { message: string }).message)
    return
  }

  toast.error(fallback)
}
