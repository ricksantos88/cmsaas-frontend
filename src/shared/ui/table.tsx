import type { ComponentProps } from 'react'
import { cn } from '@/shared/lib/cn'

/**
 * Tabela de dados do padrão de listagem. O scroll horizontal fica no wrapper —
 * a página nunca rola no eixo X (docs/guides/layout-model.md).
 */
export function Table({ className, ...props }: ComponentProps<'table'>) {
  return (
    <div className="w-full overflow-x-auto">
      <table className={cn('w-full border-collapse text-sm', className)} {...props} />
    </div>
  )
}

export function THead({ className, ...props }: ComponentProps<'thead'>) {
  return <thead className={cn('bg-surface-muted', className)} {...props} />
}

export function TH({ className, ...props }: ComponentProps<'th'>) {
  return (
    <th
      className={cn(
        'px-4 py-3 text-left text-xs font-semibold tracking-wide text-content-muted uppercase',
        className,
      )}
      {...props}
    />
  )
}

export function TBody({ className, ...props }: ComponentProps<'tbody'>) {
  return <tbody className={cn('divide-y divide-border-subtle', className)} {...props} />
}

export function TR({ className, ...props }: ComponentProps<'tr'>) {
  return <tr className={cn('hover:bg-surface-muted/60', className)} {...props} />
}

export function TD({ className, ...props }: ComponentProps<'td'>) {
  return <td className={cn('px-4 py-3 align-middle text-content', className)} {...props} />
}
