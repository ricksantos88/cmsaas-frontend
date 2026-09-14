import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router'
import { Church, KeyRound, Loader2 } from 'lucide-react'
import { z } from 'zod'
import { useSessionStore } from './session.store'
import { useSession } from './useSession'
import { ApiError } from '@/shared/api/api-error'
import { Button } from '@/shared/ui/button'
import { Field } from '@/shared/ui/field'
import { Input } from '@/shared/ui/input'
import { notifySuccess } from '@/shared/ui/toast'

const firstAccessSchema = z
  .object({
    email: z.string().min(1, 'Informe o e-mail').email('E-mail inválido'),
    token: z
      .string()
      .trim()
      .min(1, 'Informe o código de 4 dígitos')
      .regex(/^\d{4}$/, 'O código deve conter exatamente 4 dígitos numéricos'),
    password: z.string().min(8, 'A senha deve ter no mínimo 8 caracteres'),
    confirmPassword: z.string().min(1, 'Confirme a senha'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não conferem',
    path: ['confirmPassword'],
  })

type FirstAccessForm = z.infer<typeof firstAccessSchema>

export function FirstAccessPage() {
  const acceptInvite = useSessionStore((s) => s.acceptInvite)
  const { status } = useSession()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [formError, setFormError] = useState<string | null>(null)

  const initialEmail = searchParams.get('email') ?? ''
  const initialToken = searchParams.get('token') ?? ''

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FirstAccessForm>({
    defaultValues: {
      email: initialEmail,
      token: initialToken,
      password: '',
      confirmPassword: '',
    },
  })

  if (status === 'authenticated') return <Navigate to="/" replace />

  async function onSubmit(values: FirstAccessForm) {
    setFormError(null)
    const parsed = firstAccessSchema.safeParse(values)
    if (!parsed.success) {
      setFormError(parsed.error.issues[0]?.message ?? 'Dados inválidos')
      return
    }

    try {
      await acceptInvite({
        email: parsed.data.email,
        token: parsed.data.token,
        password: parsed.data.password,
      })
      notifySuccess('Conta ativada com sucesso! Seja bem-vindo.')
      void navigate('/painel', { replace: true })
    } catch (error) {
      setFormError(
        error instanceof ApiError
          ? error.message
          : 'Não foi possível ativar sua conta. Verifique o código e tente novamente.',
      )
    }
  }

  return (
    <main className="grid min-h-full place-items-center bg-canvas px-4 py-12">
      <div className="w-full max-w-sm space-y-8">
        <div className="space-y-2 text-center">
          <div className="mx-auto grid size-12 place-items-center rounded-card bg-primary text-primary-foreground">
            <Church className="size-6" aria-hidden />
          </div>
          <h1 className="text-xl font-semibold text-content">Primeiro Acesso</h1>
          <p className="text-sm text-content-muted">
            Informe seu e-mail, o código de 4 dígitos recebido e cadastre sua senha.
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
          <Field label="E-mail" required error={errors.email?.message}>
            {(field) => (
              <Input
                type="email"
                autoComplete="email"
                placeholder="seu.email@exemplo.com"
                {...field}
                {...register('email')}
              />
            )}
          </Field>

          <Field
            label="Código de 4 Dígitos"
            required
            error={errors.token?.message}
            hint="Código de ativação válido por 48 horas"
          >
            {(field) => (
              <div className="relative">
                <Input
                  type="text"
                  inputMode="numeric"
                  maxLength={4}
                  placeholder="0000"
                  className="font-mono text-center tracking-widest text-lg font-bold"
                  {...field}
                  {...register('token')}
                />
                <KeyRound
                  className="size-4 text-content-muted absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                  aria-hidden
                />
              </div>
            )}
          </Field>

          <Field label="Nova Senha" required error={errors.password?.message}>
            {(field) => (
              <Input
                type="password"
                autoComplete="new-password"
                placeholder="No mínimo 8 caracteres"
                {...field}
                {...register('password')}
              />
            )}
          </Field>

          <Field label="Confirmar Senha" required error={errors.confirmPassword?.message}>
            {(field) => (
              <Input
                type="password"
                autoComplete="new-password"
                placeholder="Repita a senha"
                {...field}
                {...register('confirmPassword')}
              />
            )}
          </Field>

          {formError && (
            <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger" role="alert">
              {formError}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="animate-spin" aria-hidden />}
            Ativar Conta e Entrar
          </Button>

          <p className="text-center text-sm text-content-muted">
            Já cadastrou sua senha?{' '}
            <Link to="/login" className="font-medium text-primary hover:underline">
              Fazer login
            </Link>
          </p>
        </form>
      </div>
    </main>
  )
}
