import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { z } from 'zod'
import { useSaveMusician } from './musicians.queries'
import { useMemberOptions } from '@/features/members/members.queries'
import { Button } from '@/shared/ui/button'
import { Dialog, DialogClose, DialogContent } from '@/shared/ui/dialog'
import { Field } from '@/shared/ui/field'
import { Select } from '@/shared/ui/input'
import { Checkbox, Textarea } from '@/shared/ui/textarea'
import { notifySuccess } from '@/shared/ui/toast'
import { useApiForm } from '@/shared/lib/use-api-form'
import { selectToUndefined } from '@/shared/lib/payload'
import {
  DAY_LABELS,
  INSTRUMENT_LABELS,
  MINISTRY_ROLE_LABELS,
  MUSICIAN_STATUS_LABELS,
  VOICE_TYPE_LABELS,
} from '@/shared/types/labels'
import type { DayOfWeek } from '@/shared/types/api'
import type { Instrument, MinistryRole, Musician, MusicianStatus, VoiceType } from '@/shared/types/domain'

const musicianSchema = z.object({
  memberId: z.string().min(1, 'Escolha o membro'),
  ministryRole: z.enum(['INSTRUMENTALIST', 'VOCALIST', 'WORSHIP_LEADER', 'SOUND_TECHNICIAN', 'MEDIA']),
  voiceType: z.string().optional().or(z.literal('')),
  canSing: z.boolean(),
  isWorshipLeader: z.boolean(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'ON_LEAVE']),
  availabilityNotes: z.string().trim().optional().or(z.literal('')),
})

type MusicianFormValues = z.infer<typeof musicianSchema>

const emptyForm: MusicianFormValues = {
  memberId: '',
  ministryRole: 'INSTRUMENTALIST',
  voiceType: '',
  canSing: false,
  isWorshipLeader: false,
  status: 'ACTIVE',
  availabilityNotes: '',
}

export function MusicianFormDialog({
  open,
  onOpenChange,
  musician,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  musician?: Musician
}) {
  const isEditing = Boolean(musician)
  const saveMusician = useSaveMusician(musician?.id)
  const members = useMemberOptions()

  // Instrumentos e dias são listas: ficam fora do RHF, que não ganha nada aqui.
  const [instruments, setInstruments] = useState<Instrument[]>([])
  const [primary, setPrimary] = useState<Instrument | ''>('')
  const [days, setDays] = useState<DayOfWeek[]>([])

  const form = useApiForm<MusicianFormValues>({
    schema: musicianSchema,
    defaultValues: emptyForm,
    onSubmit: async (values) => {
      await saveMusician.mutateAsync({
        memberId: isEditing ? undefined : values.memberId,
        ministryRole: values.ministryRole as MinistryRole,
        instruments: instruments.map((instrument) => ({
          instrument,
          primary: instrument === primary,
        })),
        voiceType: selectToUndefined<VoiceType>(values.voiceType),
        canSing: values.canSing,
        isWorshipLeader: values.isWorshipLeader,
        availability: {
          daysAvailable: days,
          notes: values.availabilityNotes?.trim() || undefined,
        },
        status: values.status as MusicianStatus,
      })
    },
    onSuccess: () => {
      notifySuccess(isEditing ? 'Músico atualizado.' : 'Músico cadastrado.')
      onOpenChange(false)
    },
  })

  const { register, formState, submit, submitting, reset } = form

  useEffect(() => {
    if (!open) return
    setInstruments(musician?.instruments.map((item) => item.instrument) ?? [])
    setPrimary(musician?.instruments.find((item) => item.primary)?.instrument ?? '')
    setDays(musician?.availability?.daysAvailable ?? [])
    reset(
      musician
        ? {
            memberId: musician.member?.id ?? '',
            ministryRole: musician.ministryRole,
            voiceType: musician.voiceType ?? '',
            canSing: musician.canSing,
            isWorshipLeader: musician.isWorshipLeader,
            status: musician.status,
            availabilityNotes: musician.availability?.notes ?? '',
          }
        : emptyForm,
    )
  }, [open, musician, reset])

  function toggleInstrument(instrument: Instrument, checked: boolean) {
    setInstruments((current) =>
      checked ? [...current, instrument] : current.filter((item) => item !== instrument),
    )
    // Tirar o instrumento principal da lista não pode deixar um "principal" fantasma.
    if (!checked && primary === instrument) setPrimary('')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        size="lg"
        title={isEditing ? 'Editar músico' : 'Novo músico'}
        description="Vincule um membro ao ministério de música."
        footer={
          <>
            <DialogClose asChild>
              <Button variant="outline" disabled={submitting}>
                Cancelar
              </Button>
            </DialogClose>
            <Button form="musician-form" type="submit" disabled={submitting}>
              {submitting && <Loader2 className="animate-spin" aria-hidden />}
              {isEditing ? 'Salvar alterações' : 'Cadastrar'}
            </Button>
          </>
        }
      >
        <form
          id="musician-form"
          className="grid gap-4 sm:grid-cols-2"
          onSubmit={(event) => void submit(event)}
          noValidate
        >
          <Field
            label="Membro"
            required
            error={formState.errors.memberId?.message}
            hint={isEditing ? 'O vínculo com o membro não muda.' : undefined}
          >
            {(field) => (
              <Select disabled={isEditing} {...field} {...register('memberId')}>
                <option value="">Selecione</option>
                {members.data?.data.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.fullName}
                  </option>
                ))}
              </Select>
            )}
          </Field>

          <Field label="Função no ministério" required>
            {(field) => (
              <Select {...field} {...register('ministryRole')}>
                {Object.entries(MINISTRY_ROLE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </Select>
            )}
          </Field>

          <Field label="Tipo de voz">
            {(field) => (
              <Select {...field} {...register('voiceType')}>
                <option value="">Não informado</option>
                {Object.entries(VOICE_TYPE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </Select>
            )}
          </Field>

          <Field label="Situação">
            {(field) => (
              <Select {...field} {...register('status')}>
                {Object.entries(MUSICIAN_STATUS_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </Select>
            )}
          </Field>

          <div className="space-y-2 sm:col-span-2">
            <p className="text-sm font-medium text-content">Instrumentos</p>
            <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
              {Object.entries(INSTRUMENT_LABELS).map(([value, label]) => (
                <label key={value} className="flex items-center gap-2 text-sm text-content">
                  <Checkbox
                    checked={instruments.includes(value as Instrument)}
                    onChange={(event) => toggleInstrument(value as Instrument, event.target.checked)}
                  />
                  {label}
                </label>
              ))}
            </div>
          </div>

          {instruments.length > 0 && (
            <Field label="Instrumento principal">
              {(field) => (
                <Select
                  {...field}
                  value={primary}
                  onChange={(event) => setPrimary(event.target.value as Instrument | '')}
                >
                  <option value="">Não definido</option>
                  {instruments.map((instrument) => (
                    <option key={instrument} value={instrument}>
                      {INSTRUMENT_LABELS[instrument]}
                    </option>
                  ))}
                </Select>
              )}
            </Field>
          )}

          <div className="space-y-2 sm:col-span-2">
            <p className="text-sm font-medium text-content">Disponibilidade</p>
            <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
              {Object.entries(DAY_LABELS).map(([value, label]) => (
                <label key={value} className="flex items-center gap-2 text-sm text-content">
                  <Checkbox
                    checked={days.includes(value as DayOfWeek)}
                    onChange={(event) =>
                      setDays((current) =>
                        event.target.checked
                          ? [...current, value as DayOfWeek]
                          : current.filter((day) => day !== value),
                      )
                    }
                  />
                  {label}
                </label>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-6 sm:col-span-2">
            <label className="flex items-center gap-2 text-sm text-content">
              <Checkbox {...register('canSing')} />
              Também canta
            </label>
            <label className="flex items-center gap-2 text-sm text-content">
              <Checkbox {...register('isWorshipLeader')} />
              Pode ministrar louvor
            </label>
          </div>

          <div className="sm:col-span-2">
            <Field label="Observações de disponibilidade">
              {(field) => <Textarea rows={2} {...field} {...register('availabilityNotes')} />}
            </Field>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
