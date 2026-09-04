import { AlertTriangle, Inbox, Loader2 } from 'lucide-react'
import type { ReactNode } from 'react'
import { ApiError } from '@/shared/api/api-error'
import { Button } from './button'

/**
 * Os três estados que toda listagem tem que resolver antes de mostrar dados:
 * carregando, vazio e erro. Padrão obrigatório — ver layout-model.md.
 */

export function LoadingState({ label = 'Carregando…' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center gap-3 py-16 text-content-muted" role="status">
      <Loader2 className="size-6 animate-spin" aria-hidden />
      <p className="text-sm">{label}</p>
    </div>
  )
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string
  description?: string
  action?: ReactNode
}) {
  return (
    <div className="flex flex-col items-center gap-2 px-6 py-16 text-center">
      <Inbox className="size-8 text-content-muted" aria-hidden />
      <p className="text-sm font-medium text-content">{title}</p>
      {description && <p className="max-w-sm text-sm text-content-muted">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}

export function ErrorState({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  const apiError = error instanceof ApiError ? error : null

  return (
    <div className="flex flex-col items-center gap-2 px-6 py-16 text-center" role="alert">
      <AlertTriangle className="size-8 text-danger" aria-hidden />
      <p className="text-sm font-medium text-content">
        {apiError?.message ?? 'Não foi possível carregar os dados.'}
      </p>
      {apiError?.traceId && (
        <p className="font-mono text-xs text-content-muted">traceId: {apiError.traceId}</p>
      )}
      {onRetry && (
        <Button variant="outline" size="sm" className="mt-2" onClick={onRetry}>
          Tentar de novo
        </Button>
      )}
    </div>
  )
}
