import { useNavigate, useParams, useSearchParams } from 'react-router'
import { z } from 'zod'
import { useSaveSchedule, useSchedule } from './schedules.queries'
import { usePastorOptions } from '@/shared/queries/options.queries'
import { Card, CardBody } from '@/shared/ui/card'
import { Field } from '@/shared/ui/field'
import { FormActions, FormRow, FormSection } from '@/shared/ui/form'
import { Input, Select } from '@/shared/ui/input'
import { PageHeader } from '@/shared/ui/page-header'
import { CardSkeleton } from '@/shared/ui/skeleton'
import { ErrorState } from '@/shared/ui/states'
import { Checkbox, Textarea } from '@/shared/ui/textarea'
import { notifySuccess } from '@/shared/ui/toast'
import { useApiForm } from '@/shared/lib/use-api-form'
import { blankToNull, blankToUndefined, numberOrUndefined } from '@/shared/lib/payload'
import { fromDateTimeLocal, toDateTimeLocal } from '@/shared/lib/format'
import {
  SCHEDULE_STATUS_LABELS,
  SCHEDULE_TYPE_LABELS,
  SCHEDULE_VISIBILITY_LABELS,
} from '@/shared/types/labels'
import type { Schedule, ScheduleStatus, ScheduleType, ScheduleVisibility } from '@/shared/types/domain'

const optionalText = z.string().trim().optional().or(z.literal(''))

const scheduleSchema = z.object({
  type: z.string().min(1),
  title: z.string().trim().min(3, 'Mínimo de 3 caracteres').max(255),
  description: optionalText,
  startDateTime: z.string().min(1, 'Informe a data e a hora'),
  endDateTime: optionalText,
  location: optionalText,
  address: optionalText,
  city: optionalText,
  pastorId: optionalText,
  topic: optionalText,
  capacity: optionalText,
  visibility: z.string().min(1),
  status: z.string().min(1),
  sendReminder: z.boolean(),
  reminderDays: optionalText,
})

type ScheduleFormValues = z.infer<typeof scheduleSchema>

/** Evento tem muitos campos e seções: formulário em página, não em modal. */
export function ScheduleFormPage() {
  const { id } = useParams<{ id: string }>()
  const [searchParams] = useSearchParams()
  const query = useSchedule(id)
  const isEditing = Boolean(id)

  const initialType = (searchParams.get('type') as ScheduleType | null) ?? undefined
  const initialMemberId = searchParams.get('memberId')

  if (isEditing && query.isPending) {
    return (
      <div className="space-y-6">
        <PageHeader title="Editar evento" />
        <Card>
          <CardSkeleton rows={8} />
        </Card>
      </div>
    )
  }

  if (isEditing && query.isError) {
    return (
      <div className="space-y-6">
        <PageHeader title="Editar evento" />
        <Card>
          <ErrorState error={query.error} onRetry={() => void query.refetch()} />
        </Card>
      </div>
    )
  }

  return (
    <ScheduleForm
      schedule={query.data}
      initialType={initialType}
      initialMemberId={initialMemberId}
    />
  )
}

function toFormValues(
  schedule: Schedule | undefined,
  initialType?: ScheduleType,
  initialMemberId?: string | null,
): ScheduleFormValues {
  if (!schedule) {
    return {
      type: initialType ?? 'CHURCH_EVENT',
      title: initialType === 'PASTOR_VISIT' ? 'Visita Pastoral' : '',
      description: initialMemberId ? `Visita agendada para o membro (${initialMemberId})` : '',
      startDateTime: '',
      endDateTime: '',
      location: '',
      address: '',
      city: '',
      pastorId: '',
      topic: '',
      capacity: '',
      visibility: 'PUBLIC',
      status: 'SCHEDULED',
      sendReminder: false,
      reminderDays: '',
    }
  }

  return {
    type: schedule.type,
    title: schedule.title,
    description: schedule.description ?? '',
    startDateTime: toDateTimeLocal(schedule.startDateTime),
    endDateTime: toDateTimeLocal(schedule.endDateTime),
    location: schedule.location ?? '',
    address: schedule.address ?? '',
    city: schedule.city ?? '',
    pastorId: schedule.preacher?.pastorId ?? '',
    topic: schedule.preacher?.topic ?? '',
    capacity: schedule.eventDetails?.capacity?.toString() ?? '',
    visibility: schedule.eventDetails?.visibility ?? 'PUBLIC',
    status: schedule.status,
    sendReminder: schedule.notifications?.sendReminder ?? false,
    reminderDays: schedule.notifications?.reminderDays?.toString() ?? '',
  }
}

function ScheduleForm({
  schedule,
  initialType,
  initialMemberId,
}: {
  schedule: Schedule | undefined
  initialType?: ScheduleType
  initialMemberId?: string | null
}) {
  const navigate = useNavigate()
  const isEditing = Boolean(schedule)
  const saveSchedule = useSaveSchedule(schedule?.id)
  const pastors = usePastorOptions()

  const form = useApiForm<ScheduleFormValues>({
    schema: scheduleSchema,
    defaultValues: toFormValues(schedule, initialType, initialMemberId),
    onSubmit: async (values) => {
      const preacher =
        values.pastorId || values.topic
          ? { pastorId: blankToUndefined(values.pastorId), topic: blankToUndefined(values.topic) }
          : undefined

      await saveSchedule.mutateAsync({
        type: values.type as ScheduleType,
        title: values.title.trim(),
        startDateTime: fromDateTimeLocal(values.startDateTime),
        status: values.status as ScheduleStatus,
        eventDetails: {
          capacity: numberOrUndefined(values.capacity),
          visibility: values.visibility as ScheduleVisibility,
        },
        notifications: {
          sendReminder: values.sendReminder,
          reminderDays: numberOrUndefined(values.reminderDays),
        },
        // Limpáveis: na edição, vazio apaga o valor no servidor.
        description: isEditing ? blankToNull(values.description) : blankToUndefined(values.description),
        endDateTime: isEditing
          ? (fromDateTimeLocal(values.endDateTime) ?? null)
          : fromDateTimeLocal(values.endDateTime),
        location: isEditing ? blankToNull(values.location) : blankToUndefined(values.location),
        address: isEditing ? blankToNull(values.address) : blankToUndefined(values.address),
        city: isEditing ? blankToNull(values.city) : blankToUndefined(values.city),
        preacher: isEditing ? (preacher ?? null) : preacher,
      })
    },
    onSuccess: () => {
      notifySuccess(isEditing ? 'Evento atualizado.' : 'Evento criado.')
      void navigate('/agenda')
    },
  })

  const { register, formState, submit, submitting, watch } = form

  return (
    <div className="space-y-6">
      <PageHeader
        title={isEditing ? 'Editar evento' : 'Novo evento'}
        description={isEditing ? schedule?.title : 'Culto, estudo, célula, visita ou treinamento.'}
      />

      <Card>
        <CardBody>
          <form className="space-y-6" onSubmit={(event) => void submit(event)} noValidate>
            <FormSection title="Evento">
              <Field label="Tipo" required>
                {(field) => (
                  <Select {...field} {...register('type')}>
                    {Object.entries(SCHEDULE_TYPE_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </Select>
                )}
              </Field>
              <Field label="Título" required error={formState.errors.title?.message}>
                {(field) => <Input {...field} {...register('title')} />}
              </Field>
              <Field label="Início" required error={formState.errors.startDateTime?.message}>
                {(field) => <Input type="datetime-local" {...field} {...register('startDateTime')} />}
              </Field>
              <Field label="Término">
                {(field) => <Input type="datetime-local" {...field} {...register('endDateTime')} />}
              </Field>
              <FormRow>
                <Field label="Descrição">
                  {(field) => <Textarea rows={3} {...field} {...register('description')} />}
                </Field>
              </FormRow>
            </FormSection>

            <FormSection title="Local">
              <Field label="Local">
                {(field) => <Input placeholder="Templo principal" {...field} {...register('location')} />}
              </Field>
              <Field label="Endereço">{(field) => <Input {...field} {...register('address')} />}</Field>
              <Field label="Cidade">{(field) => <Input {...field} {...register('city')} />}</Field>
              <Field label="Capacidade" hint="O check-in respeita este limite.">
                {(field) => <Input type="number" min="1" {...field} {...register('capacity')} />}
              </Field>
            </FormSection>

            <FormSection title="Pregação">
              <Field label="Pregador">
                {(field) => (
                  <Select {...field} {...register('pastorId')}>
                    <option value="">Não definido</option>
                    {pastors.data?.data.map((pastor) => (
                      <option key={pastor.id} value={pastor.id}>
                        {pastor.name}
                      </option>
                    ))}
                  </Select>
                )}
              </Field>
              <Field label="Tema">{(field) => <Input {...field} {...register('topic')} />}</Field>
            </FormSection>

            <FormSection title="Visibilidade e lembretes">
              <Field label="Quem vê o evento" required>
                {(field) => (
                  <Select {...field} {...register('visibility')}>
                    {Object.entries(SCHEDULE_VISIBILITY_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </Select>
                )}
              </Field>
              <Field label="Situação" required>
                {(field) => (
                  <Select {...field} {...register('status')}>
                    {Object.entries(SCHEDULE_STATUS_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </Select>
                )}
              </Field>
              <div className="flex items-center gap-2 sm:col-span-2">
                <Checkbox id="send-reminder" {...register('sendReminder')} />
                <label htmlFor="send-reminder" className="text-sm text-content">
                  Enviar lembrete antes do evento
                </label>
              </div>
              {watch('sendReminder') && (
                <Field label="Dias de antecedência" hint="Entre 0 e 30.">
                  {(field) => (
                    <Input type="number" min="0" max="30" {...field} {...register('reminderDays')} />
                  )}
                </Field>
              )}
            </FormSection>

            <FormActions
              onCancel={() => void navigate('/agenda')}
              submitting={submitting}
              submitLabel={isEditing ? 'Salvar alterações' : 'Criar evento'}
            />
          </form>
        </CardBody>
      </Card>
    </div>
  )
}
