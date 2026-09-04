import type { ComponentProps } from 'react'
import { cn } from '@/shared/lib/cn'

export function Textarea({ className, rows = 4, ...props }: ComponentProps<'textarea'>) {
  return (
    <textarea
      rows={rows}
      className={cn(
        'w-full rounded-lg border border-border-subtle bg-surface px-3 py-2 text-sm text-content',
        'placeholder:text-content-muted aria-invalid:border-danger',
        className,
      )}
      {...props}
    />
  )
}

export function Checkbox({ className, ...props }: ComponentProps<'input'>) {
  return (
    <input
      type="checkbox"
      className={cn(
        'size-4 rounded border-border-subtle text-primary accent-[var(--color-primary)]',
        className,
      )}
      {...props}
    />
  )
}
