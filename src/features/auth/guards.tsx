import { Navigate, Outlet, useLocation } from 'react-router'
import { useSession } from './useSession'
import { LoadingState } from '@/shared/ui/states'
import type { Permission } from './permissions'

/** Barra rota privada. Enquanto o boot decide, não redireciona — espera. */
export function RequireAuth() {
  const { status } = useSession()
  const location = useLocation()

  if (status === 'loading') return <LoadingState label="Verificando sessão…" />
  if (status === 'anonymous') {
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />
  }
  return <Outlet />
}

/**
 * Esconde uma área inteira de quem não tem a role. É só UX — quem forjar a rota
 * ainda toma 403 da API, que é onde a autorização de fato acontece.
 */
export function RequirePermission({ permission }: { permission: Permission }) {
  const { can } = useSession()
  return can(permission) ? <Outlet /> : <Navigate to="/sem-permissao" replace />
}
