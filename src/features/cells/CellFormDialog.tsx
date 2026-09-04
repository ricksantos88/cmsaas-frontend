import { useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import { z } from 'zod'
import { useSaveCell } from './cells.queries'
import { useMemberOptions } from '@/features/members/members.queries'
import { usePastorOptions } from '@/features/pastors/pastors.queries'
import { Button } from '@/shared/ui/button'
import { Dialog, DialogClose, DialogContent } from '@/shared/ui/dialog'
import { Field } from '@/shared/ui/field'
import { Input, Select } from '@/shared/ui/input'
import { Textarea } from '@/shared/ui/textarea'
import { notifySuccess } from '@/shared/ui/toast'
import { useApiForm } from '@/shared/lib/use-api-form'
import { blankToNull, blankToUndefined, selectToUndefined, toAddress } from '@/shared/lib/payload'
import { CELL_STATUS_LABELS, DAY_LABELS, MEETING_FREQUENCY_LABELS } from '@/shared/types/labels'
import type { DayOfWeek } from '@/shared/types/api'
import type { Cell, CellStatus, MeetingFrequency } from '@/shared/types/domain'

const optionalText = z.string().trim().optional().or(z.literal(''))

const cellSchema = z.object({
  name: z.string().trim().min(3, 'Mínimo de 3 caracteres').max(255),
  description: optionalText,
  leaderId: optionalText,
  coLeaderId: optionalText,
  supervisorPastorId: optionalText,
  dayOfWeek: optionalText,
  time: optionalText,
  frequency: optionalText,
  status: z.enum(['ACTIVE', 'INACTIVE', 'MULTIPLYING']),
  street: optionalText,
  neighborhood: optionalText,
  city: optionalText,
})

type CellFormValues = z.infer<typeof cellSchema>

const emptyForm: CellFormValues = {
  name: '',
  description: '',
  leaderId: '',
  coLeaderId: '',
  supervisorPastorId: '',
  dayOfWeek: '',
  time: '',
  frequency: '',
  status: 'ACTIVE',
  street: '',
  neighborhood: '',
  city: '',
}

export function CellFormDialog({
  open,
  onOpenChange,
  cell,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  cell?: Cell
}) {
  const isEditing = Boolean(cell)
  const saveCell = useSaveCell(cell?.id)
  const members = useMemberOptions()
  const pastors = usePastorOptions()

  const form = useApiForm<CellFormValues>({
    schema: cellSchema,
    defaultValues: emptyForm,
    onSubmit: async (values) => {
      const meeting = {
        dayOfWeek: selectToUndefined<DayOfWeek>(values.dayOfWeek),
        time: blankToUndefined(values.time),
        frequency: selectToUndefined<MeetingFrequency>(values.frequency),
      }

      await saveCell.mutateAsync({
        name: values.name.trim(),
        description: blankToUndefined(values.description),
        // Na edição, campo vazio significa **remover** a liderança (limpável).
        leaderId: isEditing ? blankToNull(values.leaderId) : blankToUndefined(values.leaderId),
        coLeaderId: isEditing ? blankToNull(values.coLeaderId) : blankToUndefined(values.coLeaderId),
        supervisorPastorId: isEditing
          ? blankToNull(values.supervisorPastorId)
          : blankToUndefined(values.supervisorPastorId),
        meeting: Object.values(meeting).some(Boolean) ? meeting : undefined,
        address: toAddress(values),
        status: values.status as CellStatus,
      })
    },
    onSuccess: () => {
      notifySuccess(isEditing ? 'Célula atualizada.' : 'Célula criada.')
      onOpenChange(false)
    },
  })

  const { register, formState, submit, submitting, reset } = form

  useEffect(() => {
    if (!open) return
    reset(
      cell
        ? {
            name: cell.name,
            description: cell.description ?? '',
            leaderId: cell.leaderId ?? '',
            coLeaderId: cell.coLeaderId ?? '',
            supervisorPastorId: cell.supervisorPastorId ?? '',
            dayOfWeek: cell.meeting?.dayOfWeek ?? '',
            time: cell.meeting?.time ?? '',
            frequency: cell.meeting?.frequency ?? '',
            status: cell.status,
            street: cell.address?.street ?? '',
            neighborhood: cell.address?.neighborhood ?? '',
            city: cell.address?.city ?? '',
          }
        : emptyForm,
    )
  }, [open, cell, reset])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        size="lg"
        title={isEditing ? 'Editar célula' : 'Nova célula'}
        description="Liderança, reunião e local de encontro."
        footer={
          <>
            <DialogClose asChild>
              <Button variant="outline" disabled={submitting}>
                Cancelar
              </Button>
            </DialogClose>
            <Button form="cell-form" type="submit" disabled={submitting}>
              {submitting && <Loader2 className="animate-spin" aria-hidden />}
              {isEditing ? 'Salvar alterações' : 'Criar célula'}
            </Button>
          </>
        }
      >
        <form
          id="cell-form"
          className="grid gap-4 sm:grid-cols-2"
          onSubmit={(event) => void submit(event)}
          noValidate
        >
          <div className="sm:col-span-2">
            <Field label="Nome" required error={formState.errors.name?.message}>
              {(field) => <Input {...field} {...register('name')} />}
            </Field>
          </div>

          <Field label="Líder" hint="Deixe em branco para remover a liderança.">
            {(field) => (
              <Select {...field} {...register('leaderId')}>
                <option value="">Sem líder</option>
                {members.data?.data.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.fullName}
                  </option>
                ))}
              </Select>
            )}
          </Field>
          <Field label="Co-líder">
            {(field) => (
              <Select {...field} {...register('coLeaderId')}>
                <option value="">Sem co-líder</option>
                {members.data?.data.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.fullName}
                  </option>
                ))}
              </Select>
            )}
          </Field>
          <Field label="Pastor supervisor">
            {(field) => (
              <Select {...field} {...register('supervisorPastorId')}>
                <option value="">Sem supervisor</option>
                {pastors.data?.data.map((pastor) => (
                  <option key={pastor.id} value={pastor.id}>
                    {pastor.name}
                  </option>
                ))}
              </Select>
            )}
          </Field>
          <Field label="Situação">
            {(field) => (
              <Select {...field} {...register('status')}>
                {Object.entries(CELL_STATUS_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </Select>
            )}
          </Field>

          <Field label="Dia da reunião">
            {(field) => (
              <Select {...field} {...register('dayOfWeek')}>
                <option value="">Não definido</option>
                {Object.entries(DAY_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </Select>
            )}
          </Field>
          <Field label="Horário">
            {(field) => <Input type="time" {...field} {...register('time')} />}
          </Field>
          <Field label="Frequência">
            {(field) => (
              <Select {...field} {...register('frequency')}>
                <option value="">Não definida</option>
                {Object.entries(MEETING_FREQUENCY_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </Select>
            )}
          </Field>
          <Field label="Bairro">
            {(field) => <Input {...field} {...register('neighborhood')} />}
          </Field>
          <Field label="Rua">{(field) => <Input {...field} {...register('street')} />}</Field>
          <Field label="Cidade">{(field) => <Input {...field} {...register('city')} />}</Field>

          <div className="sm:col-span-2">
            <Field label="Descrição">
              {(field) => <Textarea rows={3} {...field} {...register('description')} />}
            </Field>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
