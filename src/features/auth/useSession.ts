import { useSessionStore } from './session.store'
import { can, type Permission } from './permissions'
import type { Role } from '@/shared/types/roles'

const NO_ROLES: readonly Role[] = []

/** Sessão atual + o predicado de permissão usado para esconder ações. */
export function useSession() {
  const user = useSessionStore((s) => s.user)
  const status = useSessionStore((s) => s.status)
  const roles = user?.roles ?? NO_ROLES

  return {
    user,
    status,
    roles,
    isAuthenticated: status === 'authenticated',
    can: (permission: Permission) => can(roles, permission),
  }
}
