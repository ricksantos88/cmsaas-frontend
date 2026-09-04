import * as DialogPrimitive from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import type { ComponentProps, ReactNode } from 'react'
import { cn } from '@/shared/lib/cn'

export const Dialog = DialogPrimitive.Root
export const DialogTrigger = DialogPrimitive.Trigger
export const DialogClose = DialogPrimitive.Close

interface DialogContentProps extends ComponentProps<typeof DialogPrimitive.Content> {
  title: string
  description?: string
  /** `lg` para formulários com duas colunas. */
  size?: 'md' | 'lg'
  footer?: ReactNode
}

/**
 * Modal do console. O Radix cuida de foco preso, Esc e leitura por leitor de
 * tela — nunca reimplemente isso à mão (ADR-003 R2).
 */
export function DialogContent({
  title,
  description,
  size = 'md',
  footer,
  className,
  children,
  ...props
}: DialogContentProps) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-[1px] data-[state=open]:animate-in data-[state=open]:fade-in" />
      <DialogPrimitive.Content
        className={cn(
          'fixed top-1/2 left-1/2 z-50 flex max-h-[90vh] w-[calc(100vw-2rem)] -translate-x-1/2 -translate-y-1/2 flex-col',
          'rounded-card border border-border-subtle bg-surface shadow-xl',
          size === 'lg' ? 'max-w-3xl' : 'max-w-lg',
          className,
        )}
        {...props}
      >
        <header className="flex items-start justify-between gap-4 border-b border-border-subtle px-5 py-4">
          <div className="space-y-1">
            <DialogPrimitive.Title className="text-base font-semibold text-content">
              {title}
            </DialogPrimitive.Title>
            {description && (
              <DialogPrimitive.Description className="text-sm text-content-muted">
                {description}
              </DialogPrimitive.Description>
            )}
          </div>
          <DialogPrimitive.Close
            aria-label="Fechar"
            className="rounded-lg p-1 text-content-muted hover:bg-surface-muted hover:text-content"
          >
            <X className="size-4" aria-hidden />
          </DialogPrimitive.Close>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>

        {footer && (
          <footer className="flex items-center justify-end gap-2 border-t border-border-subtle px-5 py-4">
            {footer}
          </footer>
        )}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  )
}
