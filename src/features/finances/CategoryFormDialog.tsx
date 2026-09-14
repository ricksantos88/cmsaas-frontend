import { useEffect } from 'react'
import { z } from 'zod'
import { Loader2 } from 'lucide-react'
import { useApiForm } from '@/shared/lib/use-api-form'
import type { Category } from '@/shared/types/domain'
import { Dialog, DialogClose, DialogContent } from '@/shared/ui/dialog'
import { Field } from '@/shared/ui/field'
import { Input, Select } from '@/shared/ui/input'
import { Button } from '@/shared/ui/button'
import { FINANCIAL_TYPE_LABELS } from '@/shared/types/labels'
import { useCreateCategory, useUpdateCategory } from './finances.queries'
import { notifySuccess } from '@/shared/ui/toast'

const categorySchema = z.object({
  name: z.string().min(2, 'O nome deve ter no mínimo 2 caracteres.'),
  type: z.enum(['INCOME', 'EXPENSE'], { required_error: 'Campo obrigatório.' }),
})

interface CategoryFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  category?: Category
}

export function CategoryFormDialog({ open, onOpenChange, category }: CategoryFormDialogProps) {
  const isEditing = Boolean(category)
  const createMutation = useCreateCategory()
  const updateMutation = useUpdateCategory(category?.id ?? '')

  const { register, formState, submit, submitting, reset } = useApiForm<z.infer<typeof categorySchema>>({
    schema: categorySchema,
    defaultValues: {
      name: '',
      type: 'EXPENSE',
    },
    onSubmit: async (values) => {
      if (isEditing) {
        await updateMutation.mutateAsync(values)
      } else {
        await createMutation.mutateAsync(values)
      }
    },
    onSuccess: () => {
      notifySuccess(isEditing ? 'Categoria atualizada.' : 'Categoria criada com sucesso.')
      onOpenChange(false)
    },
  })

  useEffect(() => {
    if (!open) return
    reset({
      name: category?.name ?? '',
      type: category?.type ?? 'EXPENSE',
    })
  }, [open, category, reset])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        title={isEditing ? 'Editar Categoria' : 'Nova Categoria'}
        description={isEditing ? 'Altere o nome e o tipo da categoria.' : 'Crie uma nova categoria financeira.'}
        footer={
          <>
            <DialogClose asChild>
              <Button variant="outline" disabled={submitting}>
                Cancelar
              </Button>
            </DialogClose>
            <Button form="category-form" type="submit" disabled={submitting}>
              {submitting && <Loader2 className="animate-spin mr-2" aria-hidden />}
              {isEditing ? 'Salvar' : 'Criar Categoria'}
            </Button>
          </>
        }
      >
        <form
          id="category-form"
          className="grid gap-4"
          onSubmit={(event) => void submit(event)}
          noValidate
        >
          <Field label="Nome da Categoria" required error={formState.errors.name?.message}>
            {(field) => (
              <Input placeholder="Ex: Dízimos, Conta de Luz" {...field} {...register('name')} />
            )}
          </Field>

          <Field label="Tipo" required error={formState.errors.type?.message}>
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
        </form>
      </DialogContent>
    </Dialog>
  )
}
