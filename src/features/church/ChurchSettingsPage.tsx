import { useEffect } from 'react'
import { Link } from 'react-router'
import { Building2, Users } from 'lucide-react'
import { useChurch, useUpdateChurch } from './church.queries'
import { churchSchema, type ChurchFormValues } from './church.schema'
import { usePastorOptions } from '@/shared/queries/options.queries'
import { useSession } from '@/features/auth/useSession'
import { Card, CardBody, CardHeader, CardTitle } from '@/shared/ui/card'
import { Field } from '@/shared/ui/field'
import { FormActions, FormRow, FormSection } from '@/shared/ui/form'
import { Input, Select } from '@/shared/ui/input'
import { PageHeader } from '@/shared/ui/page-header'
import { CardSkeleton } from '@/shared/ui/skeleton'
import { ErrorState } from '@/shared/ui/states'
import { StatCard } from '@/shared/ui/stat-card'
import { Textarea } from '@/shared/ui/textarea'
import { notifySuccess } from '@/shared/ui/toast'
import { useApiForm } from '@/shared/lib/use-api-form'
import { blankToUndefined, selectToUndefined, toAddress } from '@/shared/lib/payload'
import { formatDate } from '@/shared/lib/format'
import { DENOMINATION_LABELS } from '@/shared/types/labels'
import type { ChurchStatus, Denomination } from '@/shared/types/domain'

/**
 * Configuração da própria igreja. O id vem do token (`user.churchId`) — não há
 * seletor de igreja nem `churchId` em nenhum payload (ADR-004 R1).
 */
export function ChurchSettingsPage() {
  const { user } = useSession()
  const churchId = user?.churchId ?? undefined
  const query = useChurch(churchId)

  // Conta de plataforma (SUPER_ADMIN sem igreja): não existe "própria igreja".
  if (!churchId) {
    return (
      <div className="space-y-6">
        <PageHeader title="Dados da igreja" />
        <Card>
          <div className="px-6 py-16 text-center" role="alert">
            <p className="text-sm font-medium text-content">
              Sua conta não está vinculada a uma igreja.
            </p>
            <p className="mt-1 text-sm text-content-muted">
              Contas de plataforma administram as igrejas em{' '}
              <Link to="/plataforma/igrejas" className="text-primary hover:underline">
                Igrejas da plataforma
              </Link>
              .
            </p>
          </div>
        </Card>
      </div>
    )
  }

  if (query.isPending) {
    return (
      <div className="space-y-6">
        <PageHeader title="Dados da igreja" />
        <Card>
          <CardSkeleton rows={8} />
        </Card>
      </div>
    )
  }

  if (query.isError || !query.data) {
    return (
      <div className="space-y-6">
        <PageHeader title="Dados da igreja" />
        <Card>
          <ErrorState error={query.error} onRetry={() => void query.refetch()} />
        </Card>
      </div>
    )
  }

  return <ChurchSettingsForm churchId={churchId} church={query.data} />
}

type Church = NonNullable<ReturnType<typeof useChurch>['data']>

function ChurchSettingsForm({ churchId, church }: { churchId: string; church: Church }) {
  const updateChurch = useUpdateChurch(churchId)
  const pastors = usePastorOptions()

  const form = useApiForm<ChurchFormValues>({
    schema: churchSchema,
    defaultValues: {
      name: church.name,
      description: church.description ?? '',
      denomination: church.denomination ?? '',
      status: church.status,
      presidentPastorId: church.presidentPastorId ?? '',
      phone: church.contact?.phone ?? '',
      email: church.contact?.email ?? '',
      website: church.contact?.website ?? '',
      street: church.address?.street ?? '',
      number: church.address?.number ?? '',
      complement: church.address?.complement ?? '',
      neighborhood: church.address?.neighborhood ?? '',
      city: church.address?.city ?? '',
      state: church.address?.state ?? '',
      zipCode: church.address?.zipCode ?? '',
    },
    onSubmit: async (values) => {
      const contact = {
        phone: blankToUndefined(values.phone),
        email: blankToUndefined(values.email),
        website: blankToUndefined(values.website),
      }

      await updateChurch.mutateAsync({
        name: values.name.trim(),
        description: blankToUndefined(values.description),
        denomination: selectToUndefined<Denomination>(values.denomination),
        status: selectToUndefined<ChurchStatus>(values.status),
        presidentPastorId: blankToUndefined(values.presidentPastorId),
        address: toAddress(values),
        contact: Object.values(contact).some(Boolean) ? contact : undefined,
      })
    },
    onSuccess: () => notifySuccess('Dados da igreja atualizados.'),
  })

  const { register, formState, submit, submitting, reset } = form

  // Depois de salvar, a query traz a versão do servidor: o formulário se realinha
  // com ela (campos normalizados pelo backend, por exemplo).
  useEffect(() => {
    reset(undefined, { keepValues: true, keepDirty: false })
  }, [church.updatedAt, reset])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dados da igreja"
        description="Identificação, contatos e endereço usados em toda a plataforma."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Pastores" value={church.statistics.pastorCount} icon={Users} />
        <StatCard
          label="Fundação"
          value={formatDate(church.foundationDate)}
          icon={Building2}
          hint="Definida no cadastro da igreja."
        />
        <StatCard
          label="Situação"
          value={church.status === 'ACTIVE' ? 'Ativa' : 'Inativa'}
          icon={Building2}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Configurações</CardTitle>
        </CardHeader>
        <CardBody>
          <form className="space-y-6" onSubmit={(event) => void submit(event)} noValidate>
            <FormSection title="Identificação">
              <Field label="Nome da igreja" required error={formState.errors.name?.message}>
                {(field) => <Input {...field} {...register('name')} />}
              </Field>
              <Field label="Denominação">
                {(field) => (
                  <Select {...field} {...register('denomination')}>
                    <option value="">Não informada</option>
                    {Object.entries(DENOMINATION_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </Select>
                )}
              </Field>
              <Field
                label="Pastor presidente"
                hint="Só um pastor pode ser presidente, e ele precisa ser desta igreja."
              >
                {(field) => (
                  <Select {...field} {...register('presidentPastorId')}>
                    <option value="">Não definido</option>
                    {pastors.data?.data.map((pastor) => (
                      <option key={pastor.id} value={pastor.id}>
                        {pastor.name}
                      </option>
                    ))}
                  </Select>
                )}
              </Field>
              <Field label="Situação">
                {(field) => (
                  <Select {...field} {...register('status')}>
                    <option value="ACTIVE">Ativa</option>
                    <option value="INACTIVE">Inativa</option>
                  </Select>
                )}
              </Field>
              <FormRow>
                <Field label="Descrição">
                  {(field) => <Textarea {...field} {...register('description')} />}
                </Field>
              </FormRow>
            </FormSection>

            <FormSection title="Contatos">
              <Field label="Telefone" error={formState.errors.phone?.message}>
                {(field) => <Input {...field} {...register('phone')} />}
              </Field>
              <Field label="E-mail" error={formState.errors.email?.message}>
                {(field) => <Input type="email" {...field} {...register('email')} />}
              </Field>
              <FormRow>
                <Field label="Site">
                  {(field) => (
                    <Input placeholder="https://" {...field} {...register('website')} />
                  )}
                </Field>
              </FormRow>
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
              <Field label="CEP">{(field) => <Input {...field} {...register('zipCode')} />}</Field>
            </FormSection>

            <FormActions
              onCancel={() => reset()}
              submitting={submitting}
              submitLabel="Salvar alterações"
            />
          </form>
        </CardBody>
      </Card>
    </div>
  )
}
