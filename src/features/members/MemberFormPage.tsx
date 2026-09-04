import { useNavigate, useParams } from 'react-router'
import { useCreateMember, useMember, useUpdateMember } from './members.queries'
import { emptyMemberForm, memberSchema, type MemberFormValues } from './members.schema'
import { Card, CardBody } from '@/shared/ui/card'
import { CardSkeleton } from '@/shared/ui/skeleton'
import { ErrorState } from '@/shared/ui/states'
import { Field } from '@/shared/ui/field'
import { FormActions, FormRow, FormSection } from '@/shared/ui/form'
import { Input, Select } from '@/shared/ui/input'
import { PageHeader } from '@/shared/ui/page-header'
import { Textarea } from '@/shared/ui/textarea'
import { notifySuccess } from '@/shared/ui/toast'
import { useApiForm } from '@/shared/lib/use-api-form'
import { blankToUndefined, selectToUndefined, toAddress } from '@/shared/lib/payload'
import {
  GENDER_LABELS,
  MARITAL_STATUS_LABELS,
  MEMBER_STATUS_LABELS,
} from '@/shared/types/labels'
import type { Gender, MaritalStatus, Member, MemberStatus } from '@/shared/types/domain'

/** Cadastro e edição usam o mesmo formulário — muda o que se faz no submit. */
export function MemberFormPage() {
  const { id } = useParams<{ id: string }>()
  const isEditing = Boolean(id)
  const memberQuery = useMember(id)

  if (isEditing && memberQuery.isPending) {
    return (
      <div className="space-y-6">
        <PageHeader title="Editar membro" />
        <Card>
          <CardSkeleton rows={8} />
        </Card>
      </div>
    )
  }

  if (isEditing && memberQuery.isError) {
    return (
      <div className="space-y-6">
        <PageHeader title="Editar membro" />
        <Card>
          <ErrorState error={memberQuery.error} onRetry={() => void memberQuery.refetch()} />
        </Card>
      </div>
    )
  }

  return <MemberForm member={memberQuery.data} />
}

function toFormValues(member: Member | undefined): MemberFormValues {
  if (!member) return emptyMemberForm
  return {
    firstName: member.firstName,
    lastName: member.lastName,
    email: member.email ?? '',
    phone: member.phone ?? '',
    whatsapp: member.whatsapp ?? '',
    dateOfBirth: member.dateOfBirth ?? '',
    gender: member.gender ?? '',
    maritalStatus: member.maritalStatus ?? '',
    status: member.status,
    membershipDate: member.membershipDate ?? '',
    baptizationDate: member.baptizationDate ?? '',
    profession: member.profession ?? '',
    company: member.company ?? '',
    notes: member.notes ?? '',
    street: member.address?.street ?? '',
    number: member.address?.number ?? '',
    complement: member.address?.complement ?? '',
    neighborhood: member.address?.neighborhood ?? '',
    city: member.address?.city ?? '',
    state: member.address?.state ?? '',
    zipCode: member.address?.zipCode ?? '',
  }
}

function MemberForm({ member }: { member: Member | undefined }) {
  const navigate = useNavigate()
  const createMember = useCreateMember()
  const updateMember = useUpdateMember(member?.id ?? '')
  const isEditing = Boolean(member)

  const form = useApiForm<MemberFormValues>({
    schema: memberSchema,
    defaultValues: toFormValues(member),
    onSubmit: async (values) => {
      const common = {
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
        phone: blankToUndefined(values.phone),
        whatsapp: blankToUndefined(values.whatsapp),
        dateOfBirth: blankToUndefined(values.dateOfBirth),
        gender: selectToUndefined<Gender>(values.gender),
        maritalStatus: selectToUndefined<MaritalStatus>(values.maritalStatus),
        address: toAddress(values),
        membershipDate: blankToUndefined(values.membershipDate),
        baptizationDate: blankToUndefined(values.baptizationDate),
        profession: blankToUndefined(values.profession),
        company: blankToUndefined(values.company),
        notes: blankToUndefined(values.notes),
      }

      if (member) {
        // `email` não vai no update: o backend não aceita troca de e-mail aqui.
        await updateMember.mutateAsync({
          ...common,
          status: selectToUndefined<MemberStatus>(values.status),
        })
        return
      }

      await createMember.mutateAsync({ ...common, email: values.email.trim() })
    },
    onSuccess: () => {
      notifySuccess(isEditing ? 'Membro atualizado.' : 'Membro cadastrado.')
      void navigate('/membros')
    },
  })

  const { register, formState, submit, submitting } = form

  return (
    <div className="space-y-6">
      <PageHeader
        title={isEditing ? 'Editar membro' : 'Novo membro'}
        description={
          isEditing ? member?.fullName : 'Preencha os dados de identificação e contato.'
        }
      />

      <Card>
        <CardBody>
          <form className="space-y-6" onSubmit={(event) => void submit(event)} noValidate>
            <FormSection title="Identificação">
              <Field label="Nome" required error={formState.errors.firstName?.message}>
                {(field) => <Input {...field} {...register('firstName')} />}
              </Field>
              <Field label="Sobrenome" required error={formState.errors.lastName?.message}>
                {(field) => <Input {...field} {...register('lastName')} />}
              </Field>
              <Field
                label="E-mail"
                required={!isEditing}
                error={formState.errors.email?.message}
                hint={isEditing ? 'O e-mail não pode ser alterado por aqui.' : undefined}
              >
                {(field) => (
                  <Input type="email" disabled={isEditing} {...field} {...register('email')} />
                )}
              </Field>
              <Field label="Data de nascimento" error={formState.errors.dateOfBirth?.message}>
                {(field) => <Input type="date" {...field} {...register('dateOfBirth')} />}
              </Field>
              <Field label="Gênero">
                {(field) => (
                  <Select {...field} {...register('gender')}>
                    <option value="">Não informado</option>
                    {Object.entries(GENDER_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </Select>
                )}
              </Field>
              <Field label="Estado civil">
                {(field) => (
                  <Select {...field} {...register('maritalStatus')}>
                    <option value="">Não informado</option>
                    {Object.entries(MARITAL_STATUS_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </Select>
                )}
              </Field>
            </FormSection>

            <FormSection title="Contato">
              <Field label="Telefone" error={formState.errors.phone?.message}>
                {(field) => <Input placeholder="(11) 99999-0000" {...field} {...register('phone')} />}
              </Field>
              <Field label="WhatsApp" error={formState.errors.whatsapp?.message}>
                {(field) => <Input placeholder="(11) 99999-0000" {...field} {...register('whatsapp')} />}
              </Field>
            </FormSection>

            <FormSection title="Endereço">
              <Field label="Rua">{(field) => <Input {...field} {...register('street')} />}</Field>
              <Field label="Número">{(field) => <Input {...field} {...register('number')} />}</Field>
              <Field label="Complemento">
                {(field) => <Input {...field} {...register('complement')} />}
              </Field>
              <Field label="Bairro">
                {(field) => <Input {...field} {...register('neighborhood')} />}
              </Field>
              <Field label="Cidade">{(field) => <Input {...field} {...register('city')} />}</Field>
              <Field label="Estado">
                {(field) => <Input maxLength={2} placeholder="SP" {...field} {...register('state')} />}
              </Field>
              <Field label="CEP" error={formState.errors.zipCode?.message}>
                {(field) => <Input placeholder="00000-000" {...field} {...register('zipCode')} />}
              </Field>
            </FormSection>

            <FormSection title="Vida eclesiástica">
              <Field label="Data de filiação">
                {(field) => <Input type="date" {...field} {...register('membershipDate')} />}
              </Field>
              <Field label="Data de batismo">
                {(field) => <Input type="date" {...field} {...register('baptizationDate')} />}
              </Field>
              {isEditing && (
                <Field label="Situação">
                  {(field) => (
                    <Select {...field} {...register('status')}>
                      {Object.entries(MEMBER_STATUS_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </Select>
                  )}
                </Field>
              )}
            </FormSection>

            <FormSection title="Profissional">
              <Field label="Profissão">
                {(field) => <Input {...field} {...register('profession')} />}
              </Field>
              <Field label="Empresa">{(field) => <Input {...field} {...register('company')} />}</Field>
              <FormRow>
                <Field label="Observações">
                  {(field) => <Textarea {...field} {...register('notes')} />}
                </Field>
              </FormRow>
            </FormSection>

            <FormActions
              onCancel={() => void navigate('/membros')}
              submitting={submitting}
              submitLabel={isEditing ? 'Salvar alterações' : 'Cadastrar membro'}
            />
          </form>
        </CardBody>
      </Card>
    </div>
  )
}
