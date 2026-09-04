import type { ReactNode } from 'react'
import { Loader2 } from 'lucide-react'
import { Button } from './button'
import { cn } from '@/shared/lib/cn'

/** Bloco temático do formulário: identificação, contato, endereço… */
export function FormSection({
  title,
  description,
  children,
  className,
}: {
  title: string
  description?: string
  children: ReactNode
  className?: string
}) {
  return (
    <fieldset className={cn('space-y-4 border-t border-border-subtle pt-5 first:border-0 first:pt-0', className)}>
      <legend className="sr-only">{title}</legend>
      <div className="space-y-0.5">
        <h3 className="text-sm font-semibold text-content">{title}</h3>
        {description && <p className="text-xs text-content-muted">{description}</p>}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">{children}</div>
    </fieldset>
  )
}

/** Ocupa a linha inteira do grid de duas colunas (textarea, observações). */
export function FormRow({ children }: { children: ReactNode }) {
  return <div className="sm:col-span-2">{children}</div>
}

export function FormActions({
  onCancel,
  submitting,
  submitLabel = 'Salvar',
}: {
  onCancel: () => void
  submitting: boolean
  submitLabel?: string
}) {
  return (
    <div className="flex items-center justify-end gap-2 border-t border-border-subtle pt-5">
      <Button type="button" variant="outline" onClick={onCancel} disabled={submitting}>
        Cancelar
      </Button>
      <Button type="submit" disabled={submitting}>
        {submitting && <Loader2 className="animate-spin" aria-hidden />}
        {submitLabel}
      </Button>
    </div>
  )
}
