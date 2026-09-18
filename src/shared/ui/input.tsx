import type { ComponentProps } from 'react'
import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
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

export function PasswordInput({ className, ...props }: ComponentProps<'input'>) {
  const [show, setShow] = useState(false)
  return (
    <div className="relative">
      <Input
        type={show ? 'text' : 'password'}
        className={cn('pr-10', className)}
        {...props}
      />
      <button
        type="button"
        onClick={() => setShow(!show)}
        className="absolute inset-y-0 right-0 flex items-center pr-3 text-content-muted hover:text-content"
        aria-label={show ? 'Ocultar senha' : 'Exibir senha'}
        title={show ? 'Ocultar senha' : 'Exibir senha'}
      >
        {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </button>
    </div>
  )
}
