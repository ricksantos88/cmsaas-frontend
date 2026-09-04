import { useEffect, useState } from 'react'
import { Loader2, Upload } from 'lucide-react'
import { z } from 'zod'
import { useUploadDocument } from './documents.queries'
import { Button } from '@/shared/ui/button'
import { Dialog, DialogClose, DialogContent } from '@/shared/ui/dialog'
import { Field } from '@/shared/ui/field'
import { Input, Select } from '@/shared/ui/input'
import { Checkbox, Textarea } from '@/shared/ui/textarea'
import { notifyError, notifySuccess } from '@/shared/ui/toast'
import { useApiForm } from '@/shared/lib/use-api-form'
import { formatFileSize } from '@/shared/lib/format'
import { DOCUMENT_CATEGORY_LABELS, DOCUMENT_VISIBILITY_LABELS } from '@/shared/types/labels'
import { ROLE_LABELS } from '@/shared/types/roles'
import type { Role } from '@/shared/types/roles'
import type { DocumentCategory, DocumentVisibility } from '@/shared/types/domain'

const uploadSchema = z.object({
  title: z.string().trim().min(3, 'Mínimo de 3 caracteres').max(255),
  description: z.string().trim().max(1000).optional().or(z.literal('')),
  category: z.string().min(1),
  visibility: z.string().min(1),
  tags: z.string().trim().optional().or(z.literal('')),
})

type UploadValues = z.infer<typeof uploadSchema>

/** Roles que fazem sentido liberar num documento restrito. */
const ACCESS_ROLES: Role[] = [
  'PASTOR_PRESIDENT',
  'PASTOR_AUXILIARY',
  'ADMIN_CHURCH',
  'TREASURER',
  'WORSHIP_LEADER',
]

export function DocumentUploadDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const uploadDocument = useUploadDocument()
  const [file, setFile] = useState<File | null>(null)
  const [accessLevel, setAccessLevel] = useState<Role[]>(['PASTOR_PRESIDENT'])

  const form = useApiForm<UploadValues>({
    schema: uploadSchema,
    defaultValues: {
      title: '',
      description: '',
      category: 'DOCUMENTS',
      visibility: 'MEMBERS_ONLY',
      tags: '',
    },
    onSubmit: async (values) => {
      if (!file) {
        notifyError(new Error('Escolha um arquivo'), 'Selecione o arquivo antes de enviar.')
        return
      }

      const visibility = values.visibility as DocumentVisibility
      await uploadDocument.mutateAsync({
        file,
        title: values.title.trim(),
        description: values.description?.trim() || undefined,
        category: values.category as DocumentCategory,
        visibility,
        // `accessLevel` só significa algo em documento restrito.
        accessLevel: visibility === 'PRIVATE' ? accessLevel : undefined,
        tags: values.tags
          ?.split(',')
          .map((tag) => tag.trim())
          .filter(Boolean),
      })
    },
    onSuccess: () => {
      notifySuccess('Documento enviado.')
      setFile(null)
      onOpenChange(false)
    },
  })

  const { register, formState, submit, submitting, reset, watch } = form
  const visibility = watch('visibility')

  useEffect(() => {
    if (open) return
    reset()
    setFile(null)
  }, [open, reset])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        size="lg"
        title="Enviar documento"
        description="Arquivos ficam disponíveis conforme a visibilidade escolhida."
        footer={
          <>
            <DialogClose asChild>
              <Button variant="outline" disabled={submitting}>
                Cancelar
              </Button>
            </DialogClose>
            <Button form="upload-form" type="submit" disabled={submitting || !file}>
              {submitting ? <Loader2 className="animate-spin" aria-hidden /> : <Upload aria-hidden />}
              Enviar
            </Button>
          </>
        }
      >
        <form
          id="upload-form"
          className="grid gap-4 sm:grid-cols-2"
          onSubmit={(event) => void submit(event)}
          noValidate
        >
          <div className="sm:col-span-2">
            <Field
              label="Arquivo"
              required
              hint={
                file
                  ? `${file.name} · ${formatFileSize(file.size)}`
                  : 'Arquivos grandes demais são recusados pelo servidor.'
              }
            >
              {(field) => (
                <Input
                  type="file"
                  className="h-auto py-2 file:mr-3 file:rounded-md file:border-0 file:bg-surface-muted file:px-3 file:py-1.5 file:text-sm"
                  {...field}
                  onChange={(event) => setFile(event.target.files?.[0] ?? null)}
                />
              )}
            </Field>
          </div>

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
              {(field) => <Input placeholder="ata, 2026" {...field} {...register('tags')} />}
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
