import { Loader2 } from 'lucide-react'
import { Button } from './button'
import { Dialog, DialogClose, DialogContent } from './dialog'

interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  /** Diga o que acontece de verdade — no backend DELETE é soft delete. */
  description: string
  confirmLabel?: string
  destructive?: boolean
  loading?: boolean
  onConfirm: () => void
}

/** Confirmação de ação irreversível ou destrutiva (layout-model.md → seção 6). */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Confirmar',
  destructive = true,
  loading = false,
  onConfirm,
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        title={title}
        footer={
          <>
            <DialogClose asChild>
              <Button variant="outline" disabled={loading}>
                Cancelar
              </Button>
            </DialogClose>
            <Button variant={destructive ? 'danger' : 'primary'} disabled={loading} onClick={onConfirm}>
              {loading && <Loader2 className="animate-spin" aria-hidden />}
              {confirmLabel}
            </Button>
          </>
        }
      >
        <p className="text-sm text-content-muted">{description}</p>
      </DialogContent>
    </Dialog>
  )
}
