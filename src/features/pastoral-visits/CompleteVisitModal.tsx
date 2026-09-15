import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { useCompletePastoralVisit } from './pastoral-visits.queries'
import { Button } from '@/shared/ui/button'
import { Dialog, DialogClose, DialogContent } from '@/shared/ui/dialog'
import { Field } from '@/shared/ui/field'
import { Input } from '@/shared/ui/input'
import { Textarea } from '@/shared/ui/textarea'
import { notifySuccess } from '@/shared/ui/toast'
import type { PastoralVisit } from '@/shared/types/domain'

interface CompleteVisitModalProps {
  visit: PastoralVisit | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CompleteVisitModal({ visit, open, onOpenChange }: CompleteVisitModalProps) {
  const completeVisit = useCompletePastoralVisit()

  const [summary, setSummary] = useState('')
  const [requiresReturn, setRequiresReturn] = useState(false)
  const [returnDate, setReturnDate] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!visit || !summary.trim()) return

    setSubmitting(true)
    try {
      await completeVisit.mutateAsync({
        id: visit.id,
        payload: {
          summary: summary.trim(),
          requiresReturn,
          returnDate: requiresReturn && returnDate ? returnDate : undefined,
        },
      })
      notifySuccess('Visita concluída e relatório salvo.')
      onOpenChange(false)
      setSummary('')
      setRequiresReturn(false)
      setReturnDate('')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        size="md"
        title="Concluir Visita Pastoral"
        description="Registre o resumo do atendimento realizado e defina se haverá retorno."
        footer={
          <>
            <DialogClose asChild>
              <Button variant="outline" disabled={submitting}>
                Cancelar
              </Button>
            </DialogClose>
            <Button
              form="complete-visit-form"
              type="submit"
              disabled={submitting || !summary.trim()}
            >
              {submitting && <Loader2 className="animate-spin" aria-hidden />}
              Concluir Visita
            </Button>
          </>
        }
      >
        <form id="complete-visit-form" className="space-y-4" onSubmit={handleSubmit}>
          <Field label="Resumo / Parecer da Visita" required hint="Anotações sigilosas do atendimento pastoral.">
            {() => (
              <Textarea
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="Descreva resumidamente como foi a visita, momentos de oração, aconselhamento ou necessidades observadas..."
                rows={4}
                required
              />
            )}
          </Field>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="requiresReturn"
              checked={requiresReturn}
              onChange={(e) => setRequiresReturn(e.target.checked)}
              className="rounded border-content-muted"
            />
            <label htmlFor="requiresReturn" className="text-sm font-medium text-content cursor-pointer">
              Haverá necessidade de visita de retorno?
            </label>
          </div>

          {requiresReturn && (
            <Field label="Data Sugerida para Retorno">
              {() => (
                <Input
                  type="date"
                  value={returnDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                />
              )}
            </Field>
          )}
        </form>
      </DialogContent>
    </Dialog>
  )
}
