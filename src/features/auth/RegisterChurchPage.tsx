import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, Navigate, useNavigate } from 'react-router'
import { Church, Loader2, Sparkles } from 'lucide-react'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useSessionStore } from './session.store'
import { useSession } from './useSession'
import { ApiError } from '@/shared/api/api-error'
import { Button } from '@/shared/ui/button'
import { Card, CardBody, CardHeader, CardTitle } from '@/shared/ui/card'
import { Field } from '@/shared/ui/field'
import { Input } from '@/shared/ui/input'
import { notifySuccess } from '@/shared/ui/toast'
import { DENOMINATION_LABELS } from '@/shared/types/labels'
import type { Denomination } from '@/shared/types/domain'

const registerSchema = z.object({
  churchName: z.string().min(3, 'Nome da igreja deve ter no mínimo 3 caracteres'),
  denomination: z.string().min(1, 'Selecione a denominação') as z.ZodType<Denomination>,
  phone: z.string().optional(),
  adminName: z.string().min(3, 'Nome completo deve ter no mínimo 3 caracteres'),
  adminEmail: z.string().min(1, 'Informe o e-mail').email('E-mail inválido'),
  adminPassword: z.string().min(8, 'A senha deve ter no mínimo 8 caracteres'),
  adminRole: z
    .enum(['PASTOR_PRESIDENT', 'PASTOR_AUXILIARY', 'ADMIN_CHURCH'])
    .default('PASTOR_PRESIDENT'),
  // Endereço opcional
  city: z.string().optional(),
  state: z.string().optional(),
})

type RegisterFormValues = z.infer<typeof registerSchema>

const DENOMINATIONS = Object.keys(DENOMINATION_LABELS) as Denomination[]

/**
 * Página de onboarding self-service de igreja e pastor (ADR-008, ADR-009).
 * Rota: `/registro`
 */
export function RegisterChurchPage() {
  const registerChurch = useSessionStore((s) => s.registerChurch)
  const { status } = useSession()
  const navigate = useNavigate()
  const [formError, setFormError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      churchName: '',
      denomination: 'BATISTA',
      phone: '',
      adminName: '',
      adminEmail: '',
      adminPassword: '',
      adminRole: 'PASTOR_PRESIDENT',
      city: '',
      state: '',
    },
  })

  if (status === 'authenticated') return <Navigate to="/" replace />

  async function onSubmit(values: RegisterFormValues) {
    setFormError(null)
    try {
      await registerChurch({
        churchName: values.churchName,
        denomination: values.denomination,
        adminName: values.adminName,
        adminEmail: values.adminEmail,
        adminPassword: values.adminPassword,
        adminRole: values.adminRole,
        isPastor: values.adminRole.startsWith('PASTOR'),
        phone: values.phone || undefined,
        address:
          values.city || values.state
            ? {
                city: values.city || undefined,
                state: values.state || undefined,
              }
            : undefined,
      })

      notifySuccess('Igreja cadastrada com sucesso! Bem-vindo ao CMSaaS.')
      void navigate('/', { replace: true })
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.code === 'EMAIL_ALREADY_EXISTS') {
          setError('adminEmail', { message: 'Este e-mail já está em uso.' })
          return
        }
        if (error.code === 'INVALID_CREDENTIALS') {
          setError('adminPassword', {
            message: 'A senha informada não confere com a sua conta já existente.',
          })
          return
        }
        if (error.code === 'USER_NOT_ELIGIBLE_FOR_MULTI_CHURCH') {
          setFormError(
            'Este e-mail possui um perfil local que não tem permissão para gerenciar múltiplas congregações.',
          )
          return
        }
        setFormError(error.message)
      } else {
        setFormError('Não foi possível realizar o cadastro. Tente novamente.')
      }
    }
  }

  return (
    <main className="min-h-full bg-canvas px-4 py-12">
      <div className="mx-auto w-full max-w-xl space-y-6">
        <div className="space-y-2 text-center">
          <div className="mx-auto grid size-12 place-items-center rounded-card bg-primary text-primary-foreground shadow-sm">
            <Church className="size-6" aria-hidden />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-content">Cadastre sua Igreja</h1>
          <p className="text-sm text-content-muted">
            Crie o espaço digital da sua congregação e comece a gerenciar membros, cultos e ministérios.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Sparkles className="size-4 text-primary" aria-hidden />
              <span>Dados da Congregação e Liderança</span>
            </CardTitle>
          </CardHeader>
          <CardBody className="p-6">
            <form className="space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
              {/* Seção da Igreja */}
              <div className="space-y-4">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-content-muted">
                  Informações da Igreja
                </h2>

                <Field label="Nome da Igreja" required error={errors.churchName?.message}>
                  {(field) => (
                    <Input
                      placeholder="Ex.: Igreja Batista Esperança"
                      autoFocus
                      {...field}
                      {...register('churchName')}
                    />
                  )}
                </Field>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Denominação" required error={errors.denomination?.message}>
                    {(field) => (
                      <select
                        className="flex h-10 w-full rounded-md border border-border-subtle bg-surface px-3 py-2 text-sm text-content focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                        {...field}
                        {...register('denomination')}
                      >
                        {DENOMINATIONS.map((d) => (
                          <option key={d} value={d}>
                            {DENOMINATION_LABELS[d]}
                          </option>
                        ))}
                      </select>
                    )}
                  </Field>

                  <Field label="Telefone / WhatsApp" error={errors.phone?.message}>
                    {(field) => (
                      <Input
                        type="tel"
                        placeholder="(11) 98765-4321"
                        {...field}
                        {...register('phone')}
                      />
                    )}
                  </Field>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Cidade" error={errors.city?.message}>
                    {(field) => (
                      <Input placeholder="Ex.: Campinas" {...field} {...register('city')} />
                    )}
                  </Field>

                  <Field label="Estado (UF)" error={errors.state?.message}>
                    {(field) => (
                      <Input placeholder="SP" maxLength={2} {...field} {...register('state')} />
                    )}
                  </Field>
                </div>
              </div>

              {/* Seção do Administrador / Pastor */}
              <div className="space-y-4 pt-4 border-t border-border-subtle">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-content-muted">
                  Pastor ou Administrador Responsável
                </h2>

                <Field label="Seu Nome Completo" required error={errors.adminName?.message}>
                  {(field) => (
                    <Input
                      placeholder="Pastor Carlos Alberto"
                      autoComplete="name"
                      {...field}
                      {...register('adminName')}
                    />
                  )}
                </Field>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="E-mail de Acesso" required error={errors.adminEmail?.message}>
                    {(field) => (
                      <Input
                        type="email"
                        placeholder="carlos@igreja.com"
                        autoComplete="email"
                        {...field}
                        {...register('adminEmail')}
                      />
                    )}
                  </Field>

                  <Field label="Senha" required error={errors.adminPassword?.message}>
                    {(field) => (
                      <Input
                        type="password"
                        placeholder="Mínimo 8 caracteres"
                        autoComplete="new-password"
                        {...field}
                        {...register('adminPassword')}
                      />
                    )}
                  </Field>
                </div>

                <Field label="Seu Papel nesta Igreja" required error={errors.adminRole?.message}>
                  {(field) => (
                    <select
                      className="flex h-10 w-full rounded-md border border-border-subtle bg-surface px-3 py-2 text-sm text-content focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      {...field}
                      {...register('adminRole')}
                    >
                      <option value="PASTOR_PRESIDENT">Pastor Presidente (Liderança máxima)</option>
                      <option value="PASTOR_AUXILIARY">Pastor Auxiliar (Apoio pastoral)</option>
                      <option value="ADMIN_CHURCH">Administrador Local (Secretaria / Gestão)</option>
                    </select>
                  )}
                </Field>
              </div>

              {formError && (
                <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger" role="alert">
                  {formError}
                </p>
              )}

              <Button type="submit" className="w-full text-base py-2.5" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="animate-spin mr-2" aria-hidden />}
                Concluir Cadastro e Acessar
              </Button>

              <p className="text-center text-sm text-content-muted">
                Já possui uma conta?{' '}
                <Link to="/login" className="font-medium text-primary hover:underline">
                  Entrar no console
                </Link>
              </p>
            </form>
          </CardBody>
        </Card>
      </div>
    </main>
  )
}
