import { useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import { useCreatePastoralRecord } from './pastoral-care.queries'
import {
  emptyPastoralRecordForm,
  pastoralRecordSchema,
  type PastoralRecordFormValues,
} from './pastoral-care.schema'
import { Button } from '@/shared/ui/button'
import { Dialog, DialogClose, DialogContent } from '@/shared/ui/dialog'
import { Field } from '@/shared/ui/field'
import { FormRow } from '@/shared/ui/form'
import { Input, Select } from '@/shared/ui/input'
import { Checkbox, Textarea } from '@/shared/ui/textarea'
import { notifySuccess } from '@/shared/ui/toast'
import { useApiForm } from '@/shared/lib/use-api-form'
import { PASTORAL_RECORD_TYPE_LABELS } from '@/shared/types/labels'
import type { PastoralRecordType } from '@/shared/types/domain'

interface PastoralRecordDialogProps {
  memberId: string
  memberName?: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PastoralRecordDialog({
  memberId,
  memberName,
  open,
  onOpenChange,
}: PastoralRecordDialogProps) {
  const createRecord = useCreatePastoralRecord(memberId)

  const form = useApiForm<PastoralRecordFormValues>({
    schema: pastoralRecordSchema,
    defaultValues: emptyPastoralRecordForm,
    onSubmit: async (values) => {
      await createRecord.mutateAsync({
        type: values.type as PastoralRecordType,
        date: values.date,
        subject: values.subject.trim(),
        notes: values.notes.trim(),
        confidential: values.confidential,
      })
    },
    onSuccess: () => {
      notifySuccess('Atendimento pastoral registrado com sucesso.')
      onOpenChange(false)
    },
  })

  const { register, formState, submit, submitting, reset } = form

  useEffect(() => {
    if (open) {
      reset({
        ...emptyPastoralRecordForm,
        date: new Date().toISOString().slice(0, 10),
      })
    }
  }, [open, reset])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        size="lg"
        title="Novo registro pastoral"
        description={
          memberName
            ? `Registrar ocorrência ou atendimento pastoral para ${memberName}.`
            : 'Registrar ocorrência ou atendimento pastoral.'
        }
        footer={
          <>
            <DialogClose asChild>
              <Button variant="outline" disabled={submitting}>
                Cancelar
              </Button>
            </DialogClose>
            <Button disabled={submitting} onClick={() => void submit()}>
              {submitting && <Loader2 className="animate-spin" aria-hidden />}
              Salvar registro
            </Button>
          </>
        }
      >
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault()
            void submit()
          }}
        >
          <FormRow>
            <Field label="Tipo de atendimento" required error={formState.errors.type?.message}>
              {(field) => (
                <Select {...field} {...register('type')}>
                  {Object.entries(PASTORAL_RECORD_TYPE_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </Select>
              )}
            </Field>

            <Field label="Data do atendimento" required error={formState.errors.date?.message}>
              {(field) => <Input type="date" {...field} {...register('date')} />}
            </Field>
          </FormRow>

          <Field label="Assunto" required error={formState.errors.subject?.message}>
            {(field) => (
              <Input
                placeholder="Ex.: Aconselhamento familiar, Visita pós-cirurgia..."
                {...field}
                {...register('subject')}
              />
            )}
          </Field>

          <Field
            label="Relatório / Notas do atendimento"
            required
            error={formState.errors.notes?.message}
            hint="Detalhes da conversa, direcionamentos e pedidos de oração."
          >
            {(field) => (
              <Textarea
                rows={4}
                placeholder="Descreva como foi o atendimento, orientações dadas e observações importantes..."
                {...field}
                {...register('notes')}
              />
            )}
          </Field>

          <div className="rounded-lg border border-border-subtle bg-surface-subtle p-3">
            <label className="flex cursor-pointer items-start gap-3 text-sm">
              <Checkbox className="mt-0.5" {...register('confidential')} />
              <div>
                <span className="font-medium text-content">
                  Confidencial (apenas pastores presidentes)
                </span>
                <p className="text-xs text-content-muted">
                  Quando marcado, este registro não será visível para pastores auxiliares ou
                  outros membros da equipe pastoral.
                </p>
              </div>
            </label>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
