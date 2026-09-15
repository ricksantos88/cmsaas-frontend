import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { useSchedulePastoralVisit } from './pastoral-visits.queries'
import { Button } from '@/shared/ui/button'
import { Dialog, DialogClose, DialogContent } from '@/shared/ui/dialog'
import { Field } from '@/shared/ui/field'
import { Input, Select } from '@/shared/ui/input'
import { notifySuccess } from '@/shared/ui/toast'
import { useMembers } from '@/features/members/members.queries'
import { usePastors } from '@/features/pastors/pastors.queries'

interface PastoralVisitFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialMemberId?: string
}

export function PastoralVisitFormDialog({
  open,
  onOpenChange,
  initialMemberId,
}: PastoralVisitFormDialogProps) {
  const scheduleVisit = useSchedulePastoralVisit()
  const { data: membersPage } = useMembers({ limit: 100 })
  const { data: pastorsPage } = usePastors({ limit: 100 })

  const members = membersPage?.data ?? []
  const pastors = pastorsPage?.data ?? []

  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>(
    initialMemberId ? [initialMemberId] : [],
  )
  const [pastorId, setPastorId] = useState<string>('')
  const [scheduledAt, setScheduledAt] = useState<string>('')
  const [location, setLocation] = useState<string>('Residência do Membro')
  const [reason, setReason] = useState<string>('')
  const [submitting, setSubmitting] = useState(false)

  const toggleMember = (memberId: string) => {
    setSelectedMemberIds((prev) =>
      prev.includes(memberId) ? prev.filter((id) => id !== memberId) : [...prev, memberId],
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!scheduledAt || selectedMemberIds.length === 0 || !reason.trim()) {
      return
    }

    setSubmitting(true)
    try {
      await scheduleVisit.mutateAsync({
        pastorId: pastorId || undefined,
        memberIds: selectedMemberIds,
        scheduledAt: new Date(scheduledAt).toISOString(),
        location: location.trim() || undefined,
        reason: reason.trim(),
      })
      notifySuccess('Visita pastoral agendada com sucesso.')
      onOpenChange(false)
      setSelectedMemberIds([])
      setScheduledAt('')
      setReason('')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        size="lg"
        title="Agendar Visita Pastoral"
        description="Agende uma visita para um ou mais irmãos da congregação."
        footer={
          <>
            <DialogClose asChild>
              <Button variant="outline" disabled={submitting}>
                Cancelar
              </Button>
            </DialogClose>
            <Button
              form="visit-form"
              type="submit"
              disabled={submitting || selectedMemberIds.length === 0 || !scheduledAt || !reason.trim()}
            >
              {submitting && <Loader2 className="animate-spin" aria-hidden />}
              Agendar Visita
            </Button>
          </>
        }
      >
        <form id="visit-form" className="grid gap-4 sm:grid-cols-2" onSubmit={handleSubmit}>
          <div className="sm:col-span-2">
            <Field label="Membros a serem visitados" required hint="Selecione um ou mais irmãos (família/grupo).">
              {() => (
                <div className="max-h-40 overflow-y-auto rounded-md border p-2 space-y-1 bg-surface">
                  {members.map((m) => (
                    <label key={m.id} className="flex items-center gap-2 text-sm p-1 hover:bg-surface-hover rounded cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedMemberIds.includes(m.id)}
                        onChange={() => toggleMember(m.id)}
                        className="rounded border-content-muted"
                      />
                      <span>{m.fullName}</span>
                    </label>
                  ))}
                </div>
              )}
            </Field>
          </div>

          <Field label="Pastor Responsável" hint="Deixe em branco para você mesmo.">
            {() => (
              <Select value={pastorId} onChange={(e) => setPastorId(e.target.value)}>
                <option value="">Selecione o pastor...</option>
                {pastors?.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </Select>
            )}
          </Field>

          <Field label="Data e Horário" required>
            {() => (
              <Input
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                required
              />
            )}
          </Field>

          <Field label="Localização">
            {() => (
              <Input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Ex: Residência, Hospital, Igreja..."
              />
            )}
          </Field>

          <div className="sm:col-span-2">
            <Field label="Motivo da Visita" required>
              {() => (
                <Input
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Ex: Acompanhamento familiar, oração por enfermidade..."
                  required
                />
              )}
            </Field>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
