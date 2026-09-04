import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router'
import { Info, KeyRound, Loader2, Save } from 'lucide-react'
import { useChangePassword, useUpdateMe } from './account.queries'
import {
  changePasswordSchema,
  profileSchema,
  type ChangePasswordValues,
  type ProfileValues,
} from './account.schema'
import { NotificationPreferences } from './NotificationPreferences'
import { useSession } from '@/features/auth/useSession'
import { useSessionStore } from '@/features/auth/session.store'
import { ApiError } from '@/shared/api/api-error'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card, CardBody, CardHeader, CardTitle } from '@/shared/ui/card'
import { DetailItem, DetailList } from '@/shared/ui/detail-list'
import { Field } from '@/shared/ui/field'
import { Input } from '@/shared/ui/input'
import { PageHeader } from '@/shared/ui/page-header'
import { notifyError, notifySuccess } from '@/shared/ui/toast'
import { useApiForm } from '@/shared/lib/use-api-form'
import { blankToUndefined } from '@/shared/lib/payload'
import { formatDateTime, initials } from '@/shared/lib/format'
import { ROLE_LABELS } from '@/shared/types/roles'

/**
 * Minha conta: perfil, senha e preferências de notificação.
 *
 * Perfis de acesso e vínculo com a igreja continuam em leitura — quem os define
 * é a administração, e o `PUT /auth/me` ignora esses campos de propósito.
 */
export function AccountPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Minha conta" description="Seus dados de acesso e preferências." />

      <ProfileCard />
      <ChangePasswordCard />
      <NotificationPreferences />
    </div>
  )
}

/**
 * Perfil (`PUT /auth/me`).
 *
 * Trocar o e-mail é trocar a credencial de login: o backend exige a senha atual
 * e revoga todas as sessões. A tela só pede a senha quando o e-mail muda de
 * fato, e encerra a sessão depois — seguir logado seria mentira de curta duração.
 *
 * Não usa `useApiForm` porque o desfecho do sucesso depende de *o que* mudou.
 */
function ProfileCard() {
  const navigate = useNavigate()
  const { user, roles } = useSession()
  const logout = useSessionStore((state) => state.logout)
  const updateMe = useUpdateMe()
  const currentEmail = user?.email ?? ''

  const {
    register,
    handleSubmit,
    formState,
    reset,
    setError,
    watch,
  } = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema(currentEmail)),
    defaultValues: { name: user?.name ?? '', email: currentEmail, currentPassword: '' },
  })

  // A sessão é a fonte da verdade; ao voltar do servidor, o formulário acompanha.
  useEffect(() => {
    reset({ name: user?.name ?? '', email: currentEmail, currentPassword: '' })
  }, [user?.name, currentEmail, reset])

  const emailChanged = watch('email').trim().toLowerCase() !== currentEmail.toLowerCase()

  async function onSubmit(values: ProfileValues) {
    const changingEmail = values.email.trim().toLowerCase() !== currentEmail.toLowerCase()
    try {
      await updateMe.mutateAsync({
        name: values.name.trim(),
        email: values.email.trim(),
        currentPassword: changingEmail ? blankToUndefined(values.currentPassword) : undefined,
      })

      if (changingEmail) {
        notifySuccess('E-mail alterado. Entre novamente com o novo endereço.')
        await logout()
        void navigate('/login', { replace: true })
        return
      }
      notifySuccess('Dados atualizados.')
    } catch (error) {
      routeProfileError(error, setError)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Dados da conta</CardTitle>
      </CardHeader>
      <CardBody className="space-y-5">
        <div className="flex flex-wrap items-center gap-4">
          <div className="grid size-14 place-items-center rounded-full bg-primary/10 text-base font-semibold text-primary">
            {initials(user?.name ?? '')}
          </div>
          <DetailList className="flex-1 sm:grid-cols-2 lg:grid-cols-2">
            <DetailItem label="Perfis de acesso">
              <span className="flex flex-wrap gap-1.5">
                {roles.map((role) => (
                  <Badge key={role} tone="info">
                    {ROLE_LABELS[role]}
                  </Badge>
                ))}
              </span>
            </DetailItem>
            <DetailItem label="Último acesso">{formatDateTime(user?.lastLoginAt)}</DetailItem>
          </DetailList>
        </div>

        <form
          className="max-w-md space-y-4"
          onSubmit={handleSubmit((values) => onSubmit(values))}
          noValidate
        >
          <Field label="Nome" required error={formState.errors.name?.message}>
            {(field) => <Input autoComplete="name" {...field} {...register('name')} />}
          </Field>

          <Field label="E-mail" required error={formState.errors.email?.message}>
            {(field) => (
              <Input type="email" autoComplete="email" {...field} {...register('email')} />
            )}
          </Field>

          {emailChanged && (
            <>
              <Field
                label="Senha atual"
                required
                error={formState.errors.currentPassword?.message}
                hint="O e-mail é sua credencial de login — confirme a senha para alterá-lo."
              >
                {(field) => (
                  <Input
                    type="password"
                    autoComplete="current-password"
                    {...field}
                    {...register('currentPassword')}
                  />
                )}
              </Field>

              <p className="flex items-start gap-2 rounded-lg bg-surface-muted px-3 py-2.5 text-sm text-content-muted">
                <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
                <span>
                  Ao trocar o e-mail, todas as suas sessões são encerradas e você entra de novo
                  com o endereço novo.
                </span>
              </p>
            </>
          )}

          <p className="text-xs text-content-muted">
            Perfis de acesso e vínculo com a igreja são definidos pela administração e não podem
            ser alterados por aqui.
          </p>

          <Button type="submit" disabled={formState.isSubmitting}>
            {formState.isSubmitting ? (
              <Loader2 className="animate-spin" aria-hidden />
            ) : (
              <Save aria-hidden />
            )}
            Salvar dados
          </Button>
        </form>
      </CardBody>
    </Card>
  )
}

/** E-mail duplicado e senha errada vão para o campo certo; o resto vira toast. */
function routeProfileError(
  error: unknown,
  setError: (field: keyof ProfileValues, options: { message: string }) => void,
): void {
  if (!(error instanceof ApiError)) {
    notifyError(error)
    return
  }

  if (error.code === 'EMAIL_ALREADY_EXISTS') {
    setError('email', { message: error.message })
    return
  }

  if (error.isValidation) {
    for (const { field, message } of error.fieldErrors) {
      setError(field as keyof ProfileValues, { message })
    }
    return
  }

  // O backend recusa a senha com 400 VALIDATION_ERROR sem `details` por campo.
  if (error.status === 400) {
    setError('currentPassword', { message: error.message })
    return
  }

  notifyError(error)
}

function ChangePasswordCard() {
  const navigate = useNavigate()
  const logout = useSessionStore((state) => state.logout)
  const changePassword = useChangePassword()

  const form = useApiForm<ChangePasswordValues>({
    schema: changePasswordSchema,
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
    onSubmit: async (values) => {
      await changePassword.mutateAsync({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      })
    },
    onSuccess: async () => {
      // O backend revoga todas as sessões ao trocar a senha: continuar na tela
      // deixaria o usuário com uma sessão que morre sozinha em até uma hora.
      notifySuccess('Senha alterada. Entre novamente com a nova senha.')
      await logout()
      void navigate('/login', { replace: true })
    },
  })

  const { register, formState, submit, submitting } = form

  return (
    <Card>
      <CardHeader>
        <CardTitle>Segurança</CardTitle>
      </CardHeader>
      <CardBody>
        <form className="max-w-md space-y-4" onSubmit={(event) => void submit(event)} noValidate>
          <Field label="Senha atual" required error={formState.errors.currentPassword?.message}>
            {(field) => (
              <Input
                type="password"
                autoComplete="current-password"
                {...field}
                {...register('currentPassword')}
              />
            )}
          </Field>

          <Field
            label="Nova senha"
            required
            error={formState.errors.newPassword?.message}
            hint="Mínimo de 8 caracteres."
          >
            {(field) => (
              <Input
                type="password"
                autoComplete="new-password"
                {...field}
                {...register('newPassword')}
              />
            )}
          </Field>

          <Field
            label="Repita a nova senha"
            required
            error={formState.errors.confirmPassword?.message}
          >
            {(field) => (
              <Input
                type="password"
                autoComplete="new-password"
                {...field}
                {...register('confirmPassword')}
              />
            )}
          </Field>

          <p className="text-xs text-content-muted">
            Ao trocar a senha, todas as suas sessões são encerradas — inclusive no aplicativo.
            Você precisará entrar de novo.
          </p>

          <Button type="submit" disabled={submitting}>
            {submitting ? <Loader2 className="animate-spin" aria-hidden /> : <KeyRound aria-hidden />}
            Alterar senha
          </Button>
        </form>
      </CardBody>
    </Card>
  )
}
