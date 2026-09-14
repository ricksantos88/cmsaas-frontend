import { useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import { useSavePastor } from './pastors.queries'
import { emptyPastorForm, pastorSchema, type PastorFormValues } from './pastors.schema'
import { Button } from '@/shared/ui/button'
import { Dialog, DialogClose, DialogContent } from '@/shared/ui/dialog'
import { Field } from '@/shared/ui/field'
import { Input, Select } from '@/shared/ui/input'
import { Textarea } from '@/shared/ui/textarea'
import { notifySuccess } from '@/shared/ui/toast'
import { useApiForm } from '@/shared/lib/use-api-form'
import { blankToUndefined, selectToUndefined } from '@/shared/lib/payload'
import {
  CONTACT_VISIBILITY_LABELS,
  PASTOR_ROLE_LABELS,
  PASTOR_STATUS_LABELS,
} from '@/shared/types/labels'
import type { Pastor, PastorStatus } from '@/shared/types/domain'

interface PastorFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Ausente = cadastro; presente = edição. */
  pastor?: Pastor
}

/**
 * Cadastro/edição em modal: são poucos campos e a pessoa costuma vir da lista e
 * voltar para ela (layout-model.md § 2 → quando usar modal).
 */
export function PastorFormDialog({ open, onOpenChange, pastor }: PastorFormDialogProps) {
  const isEditing = Boolean(pastor)
  const savePastor = useSavePastor(pastor?.id)

  const form = useApiForm<PastorFormValues>({
    schema: pastorSchema,
    defaultValues: emptyPastorForm,
    onSubmit: async (values) => {
      const specializations = values.specializations
        ?.split(',')
        .map((item) => item.trim())
        .filter(Boolean)

      await savePastor.mutateAsync({
        name: values.name.trim(),
        // O e-mail identifica o pastor no tenant e não é alterável na edição.
        email: isEditing ? undefined : values.email.trim(),
        phone: blankToUndefined(values.phone),
        dateOfBirth: blankToUndefined(values.dateOfBirth),
        role: values.role,
        position: blankToUndefined(values.position),
        biography: blankToUndefined(values.biography),
        ordainmentDate: blankToUndefined(values.ordainmentDate),
        contactVisibility: values.contactVisibility,
        status: isEditing ? selectToUndefined<PastorStatus>(values.status) : undefined,
        specializations: specializations?.length ? specializations : undefined,
      })
    },
    onSuccess: () => {
      notifySuccess(isEditing ? 'Pastor atualizado.' : 'Pastor cadastrado.')
      onOpenChange(false)
    },
  })

  const { register, formState, submit, submitting, reset } = form

  // O modal é montado uma vez e reaproveitado: sem isto, abrir "editar" depois de
  // "novo" mostraria o formulário anterior.
  useEffect(() => {
    if (!open) return
    reset(
      pastor
        ? {
            name: pastor.name,
            email: pastor.email,
            phone: pastor.phone ?? '',
            dateOfBirth: pastor.dateOfBirth ?? '',
            role: pastor.role,
            position: pastor.position ?? '',
            biography: pastor.biography ?? '',
            ordainmentDate: pastor.ordainmentDate ?? '',
            contactVisibility: pastor.contactVisibility,
            status: pastor.status,
            specializations: pastor.specializations.join(', '),
          }
        : emptyPastorForm,
    )
  }, [open, pastor, reset])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        size="lg"
        title={isEditing ? 'Editar pastor' : 'Novo pastor'}
        description={isEditing ? pastor?.name : 'Dados do pastor e visibilidade dos contatos.'}
        footer={
          <>
            <DialogClose asChild>
              <Button variant="outline" disabled={submitting}>
                Cancelar
              </Button>
            </DialogClose>
            <Button form="pastor-form" type="submit" disabled={submitting}>
              {submitting && <Loader2 className="animate-spin" aria-hidden />}
              {isEditing ? 'Salvar alterações' : 'Cadastrar'}
            </Button>
          </>
        }
      >
        <form
          id="pastor-form"
          className="grid gap-4 sm:grid-cols-2"
          onSubmit={(event) => void submit(event)}
          noValidate
        >
          <Field label="Nome" required error={formState.errors.name?.message}>
            {(field) => <Input {...field} {...register('name')} />}
          </Field>
          <Field
            label="E-mail"
            required={!isEditing}
            error={formState.errors.email?.message}
            hint={isEditing ? 'Não alterável por aqui.' : undefined}
          >
            {(field) => <Input type="email" disabled={isEditing} {...field} {...register('email')} />}
          </Field>
          <Field label="Telefone" error={formState.errors.phone?.message}>
            {(field) => <Input {...field} {...register('phone')} />}
          </Field>
          <Field label="Data de nascimento" error={formState.errors.dateOfBirth?.message}>
            {(field) => <Input type="date" {...field} {...register('dateOfBirth')} />}
          </Field>
          <Field label="Função" required>
            {(field) => (
              <Select {...field} {...register('role')}>
                {Object.entries(PASTOR_ROLE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </Select>
            )}
          </Field>
          <Field label="Cargo" error={formState.errors.position?.message}>
            {(field) => <Input {...field} {...register('position')} />}
          </Field>
          <Field label="Data de ordenação" error={formState.errors.ordainmentDate?.message}>
            {(field) => <Input type="date" {...field} {...register('ordainmentDate')} />}
          </Field>
          <Field
            label="Visibilidade dos contatos"
            hint="Quem enxerga telefone e e-mail deste pastor."
          >
            {(field) => (
              <Select {...field} {...register('contactVisibility')}>
                {Object.entries(CONTACT_VISIBILITY_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </Select>
            )}
          </Field>
          {isEditing && (
            <Field label="Situação">
              {(field) => (
                <Select {...field} {...register('status')}>
                  {Object.entries(PASTOR_STATUS_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </Select>
              )}
            </Field>
          )}
          <div className="sm:col-span-2">
            <Field label="Especializações" hint="Separadas por vírgula.">
              {(field) => (
                <Input placeholder="Aconselhamento, Missões" {...field} {...register('specializations')} />
              )}
            </Field>
          </div>
          <div className="sm:col-span-2">
            <Field label="Biografia">
              {(field) => <Textarea {...field} {...register('biography')} />}
            </Field>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
