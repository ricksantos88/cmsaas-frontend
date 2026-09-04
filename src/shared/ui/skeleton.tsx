import type { ComponentProps } from 'react'
import { cn } from '@/shared/lib/cn'

/** Bloco cinza pulsante com a forma do conteúdo que está por vir. */
export function Skeleton({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-surface-muted', className)}
      aria-hidden
      {...props}
    />
  )
}

/**
 * Esqueleto de tabela — preferido ao spinner nas listagens: mantém a altura da
 * página e o olho no lugar onde o dado vai aparecer (layout-model.md → seção 3).
 */
export function TableSkeleton({ columns, rows = 5 }: { columns: number; rows?: number }) {
  return (
    <div className="divide-y divide-border-subtle" role="status" aria-label="Carregando dados">
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex items-center gap-4 px-4 py-3.5">
          {Array.from({ length: columns }).map((_, columnIndex) => (
            <Skeleton
              key={columnIndex}
              className={cn('h-4 flex-1', columnIndex === 0 && 'max-w-52')}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

export function CardSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-3 p-5" role="status" aria-label="Carregando">
      {Array.from({ length: rows }).map((_, index) => (
        <Skeleton key={index} className={cn('h-4', index === 0 ? 'w-1/3' : 'w-full')} />
      ))}
    </div>
  )
}
