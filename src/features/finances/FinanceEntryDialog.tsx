import { useEffect, useMemo } from 'react'
import { Loader2 } from 'lucide-react'
import { useCategoriesOptions, useCreateEntry, useUpdateEntry } from './finances.queries'
import { emptyFinanceEntryForm, financeEntrySchema, type FinanceEntryFormValues } from './finances.schema'
import { Button } from '@/shared/ui/button'
import { Dialog, DialogClose, DialogContent } from '@/shared/ui/dialog'
import { Field } from '@/shared/ui/field'
import { Input, Select } from '@/shared/ui/input'
import { notifySuccess } from '@/shared/ui/toast'
import { useApiForm } from '@/shared/lib/use-api-form'
import { blankToUndefined } from '@/shared/lib/payload'
import { ENTRY_STATUS_LABELS, FINANCIAL_TYPE_LABELS, PAYMENT_METHOD_LABELS } from '@/shared/types/labels'
import type { FinancialEntry } from '@/shared/types/domain'

interface FinanceEntryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  entry?: FinancialEntry
}

export function FinanceEntryDialog({ open, onOpenChange, entry }: FinanceEntryDialogProps) {
  const isEditing = Boolean(entry)
  const createEntry = useCreateEntry()
  const updateEntry = useUpdateEntry(entry?.id ?? '')
  const { data: categories = [] } = useCategoriesOptions()

  const form = useApiForm<FinanceEntryFormValues>({
    schema: financeEntrySchema,
    defaultValues: emptyFinanceEntryForm,
    onSubmit: async (values) => {
      const payload = {
        type: values.type,
        amount: values.amount,
        date: values.date,
        categoryId: values.categoryId,
        paymentMethod: values.paymentMethod,
        status: values.status,
        description: blankToUndefined(values.description),
        memberId: blankToUndefined(values.memberId),
      }

      if (isEditing) {
        await updateEntry.mutateAsync(payload)
      } else {
        await createEntry.mutateAsync(payload)
      }
    },
    onSuccess: () => {
      notifySuccess(isEditing ? 'Lançamento atualizado.' : 'Lançamento registrado com sucesso.')
      onOpenChange(false)
    },
  })

  const { register, formState, submit, submitting, reset, watch } = form
  const selectedType = watch('type')

  const filteredCategories = useMemo(() => {
    return categories.filter((c) => c.type === selectedType)
  }, [categories, selectedType])

  useEffect(() => {
    if (!open) return
    reset(
      entry
        ? {
            type: entry.type,
            amount: entry.amount,
            date: entry.date,
            categoryId: entry.categoryId,
            paymentMethod: entry.paymentMethod,
            description: entry.description ?? '',
            status: entry.status,
            memberId: entry.memberId ?? '',
          }
        : emptyFinanceEntryForm,
    )
  }, [open, entry, reset])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        size="lg"
        title={isEditing ? 'Editar lançamento' : 'Novo lançamento'}
        description="Preencha os dados da transação financeira."
        footer={
          <>
            <DialogClose asChild>
              <Button variant="outline" disabled={submitting}>
                Cancelar
              </Button>
            </DialogClose>
            <Button form="finance-entry-form" type="submit" disabled={submitting}>
              {submitting && <Loader2 className="animate-spin mr-2" aria-hidden />}
              {isEditing ? 'Salvar alterações' : 'Registrar lançamento'}
            </Button>
          </>
        }
      >
        <form
          id="finance-entry-form"
          className="grid gap-4 sm:grid-cols-2"
          onSubmit={(event) => void submit(event)}
          noValidate
        >
          <Field label="Tipo" required>
            {(field) => (
              <Select {...field} {...register('type')}>
                {Object.entries(FINANCIAL_TYPE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </Select>
            )}
          </Field>
          
          <Field label="Categoria" required error={formState.errors.categoryId?.message}>
            {(field) => (
              <Select {...field} {...register('categoryId')}>
                <option value="">Selecione uma categoria...</option>
                {filteredCategories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            )}
          </Field>

          <Field label="Valor" required error={formState.errors.amount?.message}>
            {(field) => (
              <Input
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                {...field}
                {...register('amount', { valueAsNumber: true })}
              />
            )}
          </Field>

          <Field label="Data" required error={formState.errors.date?.message}>
            {(field) => <Input type="date" {...field} {...register('date')} />}
          </Field>

          <Field label="Forma de Pagamento" required error={formState.errors.paymentMethod?.message}>
            {(field) => (
              <Select {...field} {...register('paymentMethod')}>
                {Object.entries(PAYMENT_METHOD_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </Select>
            )}
          </Field>

          <Field label="Status" required error={formState.errors.status?.message}>
            {(field) => (
              <Select {...field} {...register('status')}>
                {Object.entries(ENTRY_STATUS_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </Select>
            )}
          </Field>

          <div className="sm:col-span-2">
            <Field label="Descrição" error={formState.errors.description?.message}>
              {(field) => (
                <Input placeholder="Detalhes do lançamento (opcional)" {...field} {...register('description')} />
              )}
            </Field>
          </div>
          
          <div className="sm:col-span-2">
            <Field label="Membro vinculado (opcional)" error={formState.errors.memberId?.message}>
              {(field) => (
                <Input placeholder="ID do Membro" {...field} {...register('memberId')} />
              )}
            </Field>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
