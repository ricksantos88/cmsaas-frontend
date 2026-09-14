import { useSession } from '@/features/auth/useSession'
import { AppShell } from '@/layouts/AppShell'
import { DashboardPage } from '@/pages/DashboardPage'
import { HomePage } from '@/pages/HomePage'
import { LoadingState } from '@/shared/ui/states'

/**
 * Rota raiz (`/`):
 * - Anônimo: exibe a HomePage pública (com botões de Login e Registro).
 * - Autenticado: exibe o Dashboard dentro do AppShell do console administrativo (ADR-008).
 */
export function RootRoute() {
  const { status } = useSession()

  if (status === 'loading') {
    return <LoadingState label="Verificando sessão…" />
  }

  if (status === 'authenticated') {
    return (
      <AppShell>
        <DashboardPage />
      </AppShell>
    )
  }

  return <HomePage />
}
