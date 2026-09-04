import type { ComponentProps } from 'react'
import { cn } from '@/shared/lib/cn'

export function Input({ className, ...props }: ComponentProps<'input'>) {
  return (
    <input
      className={cn(
        'h-10 w-full rounded-lg border border-border-subtle bg-surface px-3 text-sm text-content',
        'placeholder:text-content-muted disabled:cursor-not-allowed disabled:opacity-50',
        'aria-invalid:border-danger',
        className,
      )}
      {...props}
    />
  )
}

export function Select({ className, ...props }: ComponentProps<'select'>) {
  return (
    <select
      className={cn(
        'h-10 w-full rounded-lg border border-border-subtle bg-surface px-3 text-sm text-content',
        className,
      )}
      {...props}
    />
  )
}
