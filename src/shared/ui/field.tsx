import * as LabelPrimitive from '@radix-ui/react-label'
import { useId, type ReactNode } from 'react'
import { cn } from '@/shared/lib/cn'

interface FieldProps {
  label: string
  error?: string
  hint?: string
  required?: boolean
  className?: string
  children: (props: { id: string; 'aria-invalid': boolean; 'aria-describedby'?: string }) => ReactNode
}

/**
 * Rótulo, controle e erro amarrados por id — leitor de tela anuncia o erro
 * junto do campo (docs/guides/layout-model.md → Formulários).
 */
export function Field({ label, error, hint, required, className, children }: FieldProps) {
  const id = useId()
  const messageId = `${id}-message`
  const message = error ?? hint

  return (
    <div className={cn('space-y-1.5', className)}>
      <LabelPrimitive.Root htmlFor={id} className="text-sm font-medium text-content">
        {label}
        {required && <span className="ml-0.5 text-danger">*</span>}
      </LabelPrimitive.Root>
      {children({
        id,
        'aria-invalid': Boolean(error),
        ...(message ? { 'aria-describedby': messageId } : {}),
      })}
      {message && (
        <p id={messageId} className={cn('text-xs', error ? 'text-danger' : 'text-content-muted')}>
          {message}
        </p>
      )}
    </div>
  )
}
