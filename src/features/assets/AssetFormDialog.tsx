import { useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import { z } from 'zod'
import { useSaveAsset } from './assets.queries'
import type { AssetDetail } from './assets.api'
import { useMemberOptions } from '@/shared/queries/options.queries'
import { Button } from '@/shared/ui/button'
import { Dialog, DialogClose, DialogContent } from '@/shared/ui/dialog'
import { Field } from '@/shared/ui/field'
import { Input, Select } from '@/shared/ui/input'
import { Textarea } from '@/shared/ui/textarea'
import { notifySuccess } from '@/shared/ui/toast'
import { useApiForm } from '@/shared/lib/use-api-form'
import {
  blankToNull,
  blankToUndefined,
  numberOrUndefined,
  selectToUndefined,
} from '@/shared/lib/payload'
import {
  ACQUISITION_TYPE_LABELS,
  ASSET_CATEGORY_LABELS,
  ASSET_CONDITION_LABELS,
  ASSET_STATUS_LABELS,
} from '@/shared/types/labels'
import type { AcquisitionType, AssetCategory, AssetCondition, AssetStatus } from '@/shared/types/domain'

const optionalText = z.string().trim().optional().or(z.literal(''))

const assetSchema = z.object({
  name: z.string().trim().min(3, 'Mínimo de 3 caracteres').max(255),
  description: optionalText,
  category: z.string().min(1),
  assetTag: optionalText,
  serialNumber: optionalText,
  acquisitionType: optionalText,
  acquisitionDate: optionalText,
  acquisitionValue: optionalText,
  supplier: optionalText,
  condition: z.string().min(1),
  status: z.string().min(1),
  location: optionalText,
  responsibleMemberId: optionalText,
  warrantyUntil: optionalText,
  nextMaintenanceDate: optionalText,
  notes: optionalText,
})

type AssetFormValues = z.infer<typeof assetSchema>

const emptyForm: AssetFormValues = {
  name: '',
  description: '',
  category: 'OTHER',
  assetTag: '',
  serialNumber: '',
  acquisitionType: '',
  acquisitionDate: '',
  acquisitionValue: '',
  supplier: '',
  condition: 'GOOD',
  status: 'IN_USE',
  location: '',
  responsibleMemberId: '',
  warrantyUntil: '',
  nextMaintenanceDate: '',
  notes: '',
}

export function AssetFormDialog({
  open,
  onOpenChange,
  asset,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  asset?: AssetDetail
}) {
  const isEditing = Boolean(asset)
  const saveAsset = useSaveAsset(asset?.id)
  const members = useMemberOptions()

  const form = useApiForm<AssetFormValues>({
    schema: assetSchema,
    defaultValues: emptyForm,
    onSubmit: async (values) => {
      const acquisition = {
        type: selectToUndefined<AcquisitionType>(values.acquisitionType),
        date: blankToUndefined(values.acquisitionDate),
        value: numberOrUndefined(values.acquisitionValue),
        supplier: blankToUndefined(values.supplier),
      }

      await saveAsset.mutateAsync({
        name: values.name.trim(),
        description: blankToUndefined(values.description),
        category: values.category as AssetCategory,
        assetTag: blankToUndefined(values.assetTag),
        serialNumber: blankToUndefined(values.serialNumber),
        acquisition: Object.values(acquisition).some((v) => v !== undefined) ? acquisition : undefined,
        condition: values.condition as AssetCondition,
        status: values.status as AssetStatus,
        // Campos limpáveis: na edição, vazio significa apagar o valor.
        location: isEditing ? blankToNull(values.location) : blankToUndefined(values.location),
        responsibleMemberId: isEditing
          ? blankToNull(values.responsibleMemberId)
          : blankToUndefined(values.responsibleMemberId),
        warrantyUntil: isEditing
          ? blankToNull(values.warrantyUntil)
          : blankToUndefined(values.warrantyUntil),
        nextMaintenanceDate: isEditing
          ? blankToNull(values.nextMaintenanceDate)
          : blankToUndefined(values.nextMaintenanceDate),
        notes: isEditing ? blankToNull(values.notes) : blankToUndefined(values.notes),
      })
    },
    onSuccess: () => {
      notifySuccess(isEditing ? 'Item atualizado.' : 'Item cadastrado no patrimônio.')
      onOpenChange(false)
    },
  })

  const { register, formState, submit, submitting, reset } = form

  useEffect(() => {
    if (!open) return
    reset(
      asset
        ? {
            name: asset.name,
            description: asset.description ?? '',
            category: asset.category,
            assetTag: asset.assetTag ?? '',
            serialNumber: asset.serialNumber ?? '',
            acquisitionType: asset.acquisition?.type ?? '',
            acquisitionDate: asset.acquisition?.date ?? '',
            acquisitionValue: asset.acquisition?.value?.toString() ?? '',
            supplier: asset.acquisition?.supplier ?? '',
            condition: asset.condition,
            status: asset.status,
            location: asset.location ?? '',
            responsibleMemberId: asset.responsible?.id ?? '',
            warrantyUntil: asset.warrantyUntil ?? '',
            nextMaintenanceDate: asset.nextMaintenanceDate ?? '',
            notes: asset.notes ?? '',
          }
        : emptyForm,
    )
  }, [open, asset, reset])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        size="lg"
        title={isEditing ? 'Editar item' : 'Novo item do patrimônio'}
        description="Identificação, aquisição e responsável."
        footer={
          <>
            <DialogClose asChild>
              <Button variant="outline" disabled={submitting}>
                Cancelar
              </Button>
            </DialogClose>
            <Button form="asset-form" type="submit" disabled={submitting}>
              {submitting && <Loader2 className="animate-spin" aria-hidden />}
              {isEditing ? 'Salvar alterações' : 'Cadastrar item'}
            </Button>
          </>
        }
      >
        <form
          id="asset-form"
          className="grid gap-4 sm:grid-cols-2"
          onSubmit={(event) => void submit(event)}
          noValidate
        >
          <div className="sm:col-span-2">
            <Field label="Nome" required error={formState.errors.name?.message}>
              {(field) => <Input {...field} {...register('name')} />}
            </Field>
          </div>

          <Field label="Categoria" required>
            {(field) => (
              <Select {...field} {...register('category')}>
                {Object.entries(ASSET_CATEGORY_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </Select>
            )}
          </Field>
          <Field label="Etiqueta" hint="Única por igreja." error={formState.errors.assetTag?.message}>
            {(field) => <Input placeholder="PAT-0001" {...field} {...register('assetTag')} />}
          </Field>
          <Field label="Número de série">
            {(field) => <Input {...field} {...register('serialNumber')} />}
          </Field>
          <Field label="Localização">
            {(field) => <Input placeholder="Templo, sala 2" {...field} {...register('location')} />}
          </Field>

          <Field label="Forma de aquisição">
            {(field) => (
              <Select {...field} {...register('acquisitionType')}>
                <option value="">Não informada</option>
                {Object.entries(ACQUISITION_TYPE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </Select>
            )}
          </Field>
          <Field label="Data de aquisição" hint="Não pode ser futura.">
            {(field) => <Input type="date" {...field} {...register('acquisitionDate')} />}
          </Field>
          <Field label="Valor de aquisição (R$)">
            {(field) => (
              <Input type="number" min="0" step="0.01" {...field} {...register('acquisitionValue')} />
            )}
          </Field>
          <Field label="Fornecedor">{(field) => <Input {...field} {...register('supplier')} />}</Field>

          <Field label="Estado de conservação" required>
            {(field) => (
              <Select {...field} {...register('condition')}>
                {Object.entries(ASSET_CONDITION_LABELS).map(([value, label]) => (
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
                {Object.entries(ASSET_STATUS_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </Select>
            )}
          </Field>

          <Field label="Responsável">
            {(field) => (
              <Select {...field} {...register('responsibleMemberId')}>
                <option value="">Sem responsável</option>
                {members.data?.data.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.fullName}
                  </option>
                ))}
              </Select>
            )}
          </Field>
          <Field label="Garantia até" hint="Precisa ser posterior à aquisição.">
            {(field) => <Input type="date" {...field} {...register('warrantyUntil')} />}
          </Field>
          <Field label="Próxima manutenção">
            {(field) => <Input type="date" {...field} {...register('nextMaintenanceDate')} />}
          </Field>

          <div className="sm:col-span-2">
            <Field label="Observações">
              {(field) => <Textarea rows={2} {...field} {...register('notes')} />}
            </Field>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
