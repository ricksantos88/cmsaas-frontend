import { toast } from 'sonner'
import { ApiError } from '@/shared/api/api-error'

/** Feedback de mutação bem-sucedida — curto e no passado. */
export function notifySuccess(message: string): void {
  toast.success(message)
}

/**
 * Feedback de falha. A mensagem sai da `ApiError` já traduzida; o `traceId`
 * aparece na descrição para o usuário conseguir reportar o caso.
 */
export function notifyError(error: unknown, fallback = 'Não foi possível concluir a ação.'): void {
  if (error instanceof ApiError) {
    toast.error(error.message, error.traceId ? { description: `traceId: ${error.traceId}` } : undefined)
    return
  }
  toast.error(fallback)
}
