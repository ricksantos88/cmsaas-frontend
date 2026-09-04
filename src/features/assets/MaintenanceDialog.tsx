import { Loader2 } from 'lucide-react'
import { z } from 'zod'
import { useRegisterMaintenance } from './assets.queries'
import type { AssetDetail } from './assets.api'
import { Button } from '@/shared/ui/button'
import { Dialog, DialogClose, DialogContent } from '@/shared/ui/dialog'
import { Field } from '@/shared/ui/field'
import { Input, Select } from '@/shared/ui/input'
import { Textarea } from '@/shared/ui/textarea'
import { notifySuccess } from '@/shared/ui/toast'
import { useApiForm } from '@/shared/lib/use-api-form'
import { blankToUndefined, numberOrUndefined, selectToUndefined } from '@/shared/lib/payload'
import { ASSET_CONDITION_LABELS, MAINTENANCE_TYPE_LABELS } from '@/shared/types/labels'
import type { AssetCondition, MaintenanceType } from '@/shared/types/domain'

const maintenanceSchema = z.object({
  date: z.string().min(1, 'Informe a data'),
  type: z.string().min(1),
  description: z.string().trim().optional().or(z.literal('')),
  cost: z.string().optional().or(z.literal('')),
  performedBy: z.string().trim().optional().or(z.literal('')),
  conditionAfter: z.string().optional().or(z.literal('')),
  nextMaintenanceDate: z.string().optional().or(z.literal('')),
})

type MaintenanceValues = z.infer<typeof maintenanceSchema>

/** Registro de manutenção: ação pontual sobre um item, cabe em modal. */
export function MaintenanceDialog({
  asset,
  open,
  onOpenChange,
}: {
  asset: AssetDetail
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const registerMaintenance = useRegisterMaintenance(asset.id)

  const form = useApiForm<MaintenanceValues>({
    schema: maintenanceSchema,
    defaultValues: {
      date: new Date().toISOString().slice(0, 10),
      type: 'PREVENTIVE',
      description: '',
      cost: '',
      performedBy: '',
      conditionAfter: '',
      nextMaintenanceDate: '',
    },
    onSubmit: async (values) => {
      await registerMaintenance.mutateAsync({
        date: values.date,
        type: values.type as MaintenanceType,
        description: blankToUndefined(values.description),
        cost: numberOrUndefined(values.cost),
        performedBy: blankToUndefined(values.performedBy),
        conditionAfter: selectToUndefined<AssetCondition>(values.conditionAfter),
        nextMaintenanceDate: blankToUndefined(values.nextMaintenanceDate),
      })
    },
    onSuccess: () => {
      notifySuccess('Manutenção registrada.')
      onOpenChange(false)
    },
  })

  const { register, formState, submit, submitting } = form

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        title="Registrar manutenção"
        description={asset.name}
        footer={
          <>
            <DialogClose asChild>
              <Button variant="outline" disabled={submitting}>
                Cancelar
              </Button>
            </DialogClose>
            <Button form="maintenance-form" type="submit" disabled={submitting}>
              {submitting && <Loader2 className="animate-spin" aria-hidden />}
              Registrar
            </Button>
          </>
        }
      >
        <form
          id="maintenance-form"
          className="grid gap-4 sm:grid-cols-2"
          onSubmit={(event) => void submit(event)}
          noValidate
        >
          <Field label="Data" required error={formState.errors.date?.message}>
            {(field) => <Input type="date" {...field} {...register('date')} />}
          </Field>
          <Field label="Tipo" required>
            {(field) => (
              <Select {...field} {...register('type')}>
                {Object.entries(MAINTENANCE_TYPE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </Select>
            )}
          </Field>
          <Field label="Custo (R$)">
            {(field) => <Input type="number" min="0" step="0.01" {...field} {...register('cost')} />}
          </Field>
          <Field label="Executado por">
            {(field) => <Input {...field} {...register('performedBy')} />}
          </Field>
          <Field label="Estado após a manutenção">
            {(field) => (
              <Select {...field} {...register('conditionAfter')}>
                <option value="">Não alterar</option>
                {Object.entries(ASSET_CONDITION_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </Select>
            )}
          </Field>
          <Field label="Próxima manutenção" hint="Alimenta o alerta de manutenção próxima.">
            {(field) => <Input type="date" {...field} {...register('nextMaintenanceDate')} />}
          </Field>
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
