import type { ReactNode } from 'react'
import { cn } from '@/shared/lib/cn'

/** Grade rótulo/valor das páginas de detalhe (layout-model.md § 2). */
export function DetailList({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <dl className={cn('grid gap-4 sm:grid-cols-2 lg:grid-cols-3', className)}>{children}</dl>
  )
}

export function DetailItem({
  label,
  children,
  wide,
}: {
  label: string
  children: ReactNode
  wide?: boolean
}) {
  return (
    <div className={cn('space-y-1', wide && 'sm:col-span-2 lg:col-span-3')}>
      <dt className="text-xs font-medium tracking-wide text-content-muted uppercase">{label}</dt>
      {/* Valor ausente é travessão, nunca espaço em branco. */}
      <dd className="text-sm text-content">{children ?? '—'}</dd>
    </div>
  )
}
