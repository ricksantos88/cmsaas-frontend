import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, Navigate, useLocation, useNavigate } from 'react-router'
import { Loader2 } from 'lucide-react'
import { z } from 'zod'
import { useSessionStore } from './session.store'
import { useSession } from './useSession'
import { Logo } from '@/shared/ui/logo'
import { ApiError } from '@/shared/api/api-error'
import { Button } from '@/shared/ui/button'
import { Field } from '@/shared/ui/field'
import { Input } from '@/shared/ui/input'

const loginSchema = z.object({
  email: z.string().min(1, 'Informe o e-mail').email('E-mail inválido'),
  password: z.string().min(8, 'A senha tem no mínimo 8 caracteres'),
})

type LoginForm = z.infer<typeof loginSchema>

export function LoginPage() {
  const login = useSessionStore((s) => s.login)
  const { status } = useSession()
  const navigate = useNavigate()
  const location = useLocation()
  const [formError, setFormError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({ defaultValues: { email: '', password: '' } })

  if (status === 'authenticated') return <Navigate to="/" replace />

  async function onSubmit(values: LoginForm) {
    setFormError(null)
    const parsed = loginSchema.safeParse(values)
    if (!parsed.success) {
      setFormError(parsed.error.issues[0]?.message ?? 'Dados inválidos')
      return
    }

    try {
      await login(parsed.data)
      const from = (location.state as { from?: string } | null)?.from ?? '/'
      void navigate(from, { replace: true })
    } catch (error) {
      // Credencial errada e rate limit são a mesma tela: a mensagem vem da API.
      setFormError(
        error instanceof ApiError ? error.message : 'Não foi possível entrar. Tente de novo.',
      )
    }
  }

  return (
    <main className="grid min-h-full place-items-center bg-canvas px-4 py-12">
      <div className="w-full max-w-sm space-y-8">
        <div className="space-y-3 text-center">
          <Link to="/" className="inline-block focus-visible:outline-none">
            <Logo className="mx-auto h-10 w-auto" />
          </Link>
          <h1 className="text-xl font-bold tracking-tight text-primary">Console da Igreja</h1>
          <p className="text-sm text-content-muted leading-relaxed">Acesso administrativo do CMSaaS.</p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
          <Field label="E-mail" required error={errors.email?.message}>
            {(field) => (
              <Input type="email" autoComplete="email" autoFocus {...field} {...register('email')} />
            )}
          </Field>

          <Field label="Senha" required error={errors.password?.message}>
            {(field) => (
              <Input
                type="password"
                autoComplete="current-password"
                {...field}
                {...register('password')}
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
            Entrar
          </Button>

          <div className="space-y-2 text-center text-sm text-content-muted">
            <p>
              Primeiro acesso?{' '}
              <Link to="/primeiro-acesso" className="font-medium text-primary hover:underline">
                Ative sua conta com seu código
              </Link>
            </p>
            <p>
              Ainda não cadastrou sua igreja?{' '}
              <Link to="/registro" className="font-medium text-primary hover:underline">
                Cadastre-se aqui
              </Link>
            </p>
          </div>
        </form>
      </div>
    </main>
  )
}
