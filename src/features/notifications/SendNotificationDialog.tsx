import { useState } from 'react'
import { Loader2, Send } from 'lucide-react'
import { z } from 'zod'
import { useSendNotification } from './notifications.queries'
import { useCellOptions } from '@/features/cells/cells.queries'
import { Button } from '@/shared/ui/button'
import { Dialog, DialogClose, DialogContent } from '@/shared/ui/dialog'
import { Field } from '@/shared/ui/field'
import { Input, Select } from '@/shared/ui/input'
import { Checkbox, Textarea } from '@/shared/ui/textarea'
import { notifySuccess } from '@/shared/ui/toast'
import { useApiForm } from '@/shared/lib/use-api-form'
import { fromDateTimeLocal } from '@/shared/lib/format'
import { NOTIFICATION_CHANNEL_LABELS, NOTIFICATION_TYPE_LABELS } from '@/shared/types/labels'
import { ROLE_LABELS } from '@/shared/types/roles'
import type { Role } from '@/shared/types/roles'
import type { AudienceTarget, NotificationChannel, NotificationType } from '@/shared/types/domain'

const AUDIENCE_LABELS: Record<AudienceTarget, string> = {
  ALL_MEMBERS: 'Todos os membros',
  SPECIFIC_MEMBERS: 'Membros específicos',
  BY_ROLE: 'Por perfil de acesso',
  BY_CELL: 'Por célula',
}

const notificationSchema = z.object({
  type: z.string().min(1),
  title: z.string().trim().min(3, 'Mínimo de 3 caracteres').max(120),
  body: z.string().trim().min(1, 'Escreva a mensagem').max(500),
  target: z.string().min(1),
  cellId: z.string().optional().or(z.literal('')),
  scheduledFor: z.string().optional().or(z.literal('')),
})

type NotificationValues = z.infer<typeof notificationSchema>

const AUDIENCE_ROLES: Role[] = [
  'PASTOR_PRESIDENT',
  'PASTOR_AUXILIARY',
  'ADMIN_CHURCH',
  'TREASURER',
  'WORSHIP_LEADER',
  'MEMBER',
]

/**
 * Envio de aviso. A audiência é resolvida **no disparo** pelo backend — entre
 * agendar e enviar, quem entra numa célula passa a receber (notification.md).
 */
export function SendNotificationDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const sendNotification = useSendNotification()
  const cells = useCellOptions()
  const [channels, setChannels] = useState<NotificationChannel[]>(['PUSH'])
  const [roles, setRoles] = useState<Role[]>([])

  const form = useApiForm<NotificationValues>({
    schema: notificationSchema,
    defaultValues: {
      type: 'GENERAL_ANNOUNCEMENT',
      title: '',
      body: '',
      target: 'ALL_MEMBERS',
      cellId: '',
      scheduledFor: '',
    },
    onSubmit: async (values) => {
      const target = values.target as AudienceTarget
      await sendNotification.mutateAsync({
        type: values.type as NotificationType,
        title: values.title.trim(),
        body: values.body.trim(),
        channels,
        audience: {
          target,
          roles: target === 'BY_ROLE' ? roles : undefined,
          cellId: target === 'BY_CELL' ? values.cellId || undefined : undefined,
        },
        scheduledFor: fromDateTimeLocal(values.scheduledFor),
      })
    },
    onSuccess: () => {
      notifySuccess('Aviso enviado para a fila de envio.')
      form.reset()
      onOpenChange(false)
    },
  })

  const { register, formState, submit, submitting, watch } = form
  const target = watch('target')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        size="lg"
        title="Enviar aviso"
        description="A mensagem chega pelo app e/ou por e-mail, conforme a preferência de cada pessoa."
        footer={
          <>
            <DialogClose asChild>
              <Button variant="outline" disabled={submitting}>
                Cancelar
              </Button>
            </DialogClose>
            <Button
              form="notification-form"
              type="submit"
              disabled={submitting || channels.length === 0}
            >
              {submitting ? <Loader2 className="animate-spin" aria-hidden /> : <Send aria-hidden />}
              Enviar
            </Button>
          </>
        }
      >
        <form
          id="notification-form"
          className="grid gap-4 sm:grid-cols-2"
          onSubmit={(event) => void submit(event)}
          noValidate
        >
          <Field label="Tipo" required>
            {(field) => (
              <Select {...field} {...register('type')}>
                {Object.entries(NOTIFICATION_TYPE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </Select>
            )}
          </Field>

          <Field
            label="Agendar para"
            hint="Em branco, entra no próximo ciclo de envio."
          >
            {(field) => <Input type="datetime-local" {...field} {...register('scheduledFor')} />}
          </Field>

          <div className="sm:col-span-2">
            <Field label="Título" required error={formState.errors.title?.message}>
              {(field) => <Input maxLength={120} {...field} {...register('title')} />}
            </Field>
          </div>

          <div className="sm:col-span-2">
            <Field label="Mensagem" required error={formState.errors.body?.message}>
              {(field) => <Textarea rows={3} maxLength={500} {...field} {...register('body')} />}
            </Field>
          </div>

          <Field label="Destinatários" required>
            {(field) => (
              <Select {...field} {...register('target')}>
                {Object.entries(AUDIENCE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </Select>
            )}
          </Field>

          {target === 'BY_CELL' && (
            <Field label="Célula" required>
              {(field) => (
                <Select {...field} {...register('cellId')}>
                  <option value="">Selecione</option>
                  {cells.data?.data.map((cell) => (
                    <option key={cell.id} value={cell.id}>
                      {cell.name}
                    </option>
                  ))}
                </Select>
              )}
            </Field>
          )}

          {target === 'BY_ROLE' && (
            <div className="space-y-2 sm:col-span-2">
              <p className="text-sm font-medium text-content">Perfis</p>
              <div className="grid grid-cols-2 gap-1.5">
                {AUDIENCE_ROLES.map((role) => (
                  <label key={role} className="flex items-center gap-2 text-sm text-content">
                    <Checkbox
                      checked={roles.includes(role)}
                      onChange={(event) =>
                        setRoles((current) =>
                          event.target.checked
                            ? [...current, role]
                            : current.filter((item) => item !== role),
                        )
                      }
                    />
                    {ROLE_LABELS[role]}
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2 sm:col-span-2">
            <p className="text-sm font-medium text-content">Canais</p>
            <div className="flex gap-6">
              {Object.entries(NOTIFICATION_CHANNEL_LABELS).map(([value, label]) => (
                <label key={value} className="flex items-center gap-2 text-sm text-content">
                  <Checkbox
                    checked={channels.includes(value as NotificationChannel)}
                    onChange={(event) =>
                      setChannels((current) =>
                        event.target.checked
                          ? [...current, value as NotificationChannel]
                          : current.filter((channel) => channel !== value),
                      )
                    }
                  />
                  {label}
                </label>
              ))}
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
