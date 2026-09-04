import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { z } from 'zod'
import { useUpdateDocument } from './documents.queries'
import { Button } from '@/shared/ui/button'
import { Dialog, DialogClose, DialogContent } from '@/shared/ui/dialog'
import { Field } from '@/shared/ui/field'
import { Input, Select } from '@/shared/ui/input'
import { Checkbox, Textarea } from '@/shared/ui/textarea'
import { notifySuccess } from '@/shared/ui/toast'
import { useApiForm } from '@/shared/lib/use-api-form'
import { DOCUMENT_CATEGORY_LABELS, DOCUMENT_VISIBILITY_LABELS } from '@/shared/types/labels'
import { ROLE_LABELS } from '@/shared/types/roles'
import type { Role } from '@/shared/types/roles'
import type { DocumentCategory, DocumentDetail, DocumentVisibility } from '@/shared/types/domain'

const editSchema = z.object({
  title: z.string().trim().min(3, 'Mínimo de 3 caracteres').max(255),
  description: z.string().trim().max(1000).optional().or(z.literal('')),
  category: z.string().min(1),
  visibility: z.string().min(1),
  tags: z.string().trim().optional().or(z.literal('')),
})

type EditValues = z.infer<typeof editSchema>

const ACCESS_ROLES: Role[] = [
  'PASTOR_PRESIDENT',
  'PASTOR_AUXILIARY',
  'ADMIN_CHURCH',
  'TREASURER',
  'WORSHIP_LEADER',
]

/**
 * Edição dos **metadados** do documento. O arquivo em si não é substituível
 * pela API — trocar o conteúdo significa enviar um documento novo.
 */
export function DocumentEditDialog({
  document,
  open,
  onOpenChange,
}: {
  document: DocumentDetail
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const updateDocument = useUpdateDocument(document.id)
  const [accessLevel, setAccessLevel] = useState<Role[]>(document.accessLevel)

  const form = useApiForm<EditValues>({
    schema: editSchema,
    defaultValues: {
      title: document.title,
      description: document.description ?? '',
      category: document.category,
      visibility: document.visibility,
      tags: document.tags.join(', '),
    },
    onSubmit: async (values) => {
      const visibility = values.visibility as DocumentVisibility
      await updateDocument.mutateAsync({
        title: values.title.trim(),
        description: values.description?.trim() || undefined,
        category: values.category as DocumentCategory,
        visibility,
        accessLevel: visibility === 'PRIVATE' ? accessLevel : undefined,
        tags: values.tags
          ?.split(',')
          .map((tag) => tag.trim())
          .filter(Boolean),
      })
    },
    onSuccess: () => {
      notifySuccess('Documento atualizado.')
      onOpenChange(false)
    },
  })

  const { register, formState, submit, submitting, reset, watch } = form
  const visibility = watch('visibility')

  useEffect(() => {
    if (!open) return
    setAccessLevel(document.accessLevel)
    reset({
      title: document.title,
      description: document.description ?? '',
      category: document.category,
      visibility: document.visibility,
      tags: document.tags.join(', '),
    })
  }, [open, document, reset])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        size="lg"
        title="Editar documento"
        description={`${document.fileName} — o arquivo não muda, só as informações.`}
        footer={
          <>
            <DialogClose asChild>
              <Button variant="outline" disabled={submitting}>
                Cancelar
              </Button>
            </DialogClose>
            <Button form="document-edit-form" type="submit" disabled={submitting}>
              {submitting && <Loader2 className="animate-spin" aria-hidden />}
              Salvar alterações
            </Button>
          </>
        }
      >
        <form
          id="document-edit-form"
          className="grid gap-4 sm:grid-cols-2"
          onSubmit={(event) => void submit(event)}
          noValidate
        >
          <div className="sm:col-span-2">
            <Field label="Título" required error={formState.errors.title?.message}>
              {(field) => <Input {...field} {...register('title')} />}
            </Field>
          </div>

          <Field label="Categoria" required>
            {(field) => (
              <Select {...field} {...register('category')}>
                {Object.entries(DOCUMENT_CATEGORY_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </Select>
            )}
          </Field>

          <Field label="Visibilidade" required>
            {(field) => (
              <Select {...field} {...register('visibility')}>
                {Object.entries(DOCUMENT_VISIBILITY_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </Select>
            )}
          </Field>

          {visibility === 'PRIVATE' && (
            <div className="space-y-2 sm:col-span-2">
              <p className="text-sm font-medium text-content">Quem pode baixar</p>
              <div className="grid grid-cols-2 gap-1.5">
                {ACCESS_ROLES.map((role) => (
                  <label key={role} className="flex items-center gap-2 text-sm text-content">
                    <Checkbox
                      checked={accessLevel.includes(role)}
                      onChange={(event) =>
                        setAccessLevel((current) =>
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

          <div className="sm:col-span-2">
            <Field label="Etiquetas" hint="Separadas por vírgula, no máximo 10.">
              {(field) => <Input {...field} {...register('tags')} />}
            </Field>
          </div>

          <div className="sm:col-span-2">
            <Field label="Descrição">
              {(field) => <Textarea rows={2} {...field} {...register('description')} />}
            </Field>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
