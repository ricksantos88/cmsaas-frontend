import type { LucideIcon } from 'lucide-react'
import { Card } from './card'
import { Skeleton } from './skeleton'

interface StatCardProps {
  label: string
  value: string | number | undefined
  hint?: string
  icon: LucideIcon
  loading?: boolean
}

/** Indicador do painel: rótulo, número grande e uma linha de contexto. */
export function StatCard({ label, value, hint, icon: Icon, loading }: StatCardProps) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-xs font-medium tracking-wide text-content-muted uppercase">{label}</p>
          {loading ? (
            <Skeleton className="h-8 w-20" />
          ) : (
            <p className="text-2xl font-semibold text-content">{value ?? '—'}</p>
          )}
          {hint && <p className="text-xs text-content-muted">{hint}</p>}
        </div>
        <div className="grid size-9 place-items-center rounded-lg bg-primary/10 text-primary">
          <Icon className="size-4" aria-hidden />
        </div>
      </div>
    </Card>
  )
}
