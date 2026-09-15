import type { Role } from '@/shared/types/roles'

/**
 * Espelho das `@PreAuthorize` dos controllers (`api/v1/*Controller.kt`).
 *
 * Isto **não é segurança** — é UX: serve para não mostrar um botão que a API vai
 * recusar com 403. A autorização de verdade é do backend, e continua sendo a
 * única que vale. Ao mudar uma role no backend, mude aqui no mesmo PR.
 */
export const PERMISSIONS = {
  /** `GET /churches/{id}` — só estas roles; as demais tomam 403. */
  'church.read': ['SUPER_ADMIN', 'PASTOR_PRESIDENT', 'ADMIN_CHURCH'],
  'church.write': ['SUPER_ADMIN', 'PASTOR_PRESIDENT', 'ADMIN_CHURCH'],
  'church.platform': ['SUPER_ADMIN'],

  'pastor.write': ['PASTOR_PRESIDENT', 'ADMIN_CHURCH'],
  'member.write': ['PASTOR_PRESIDENT', 'PASTOR_AUXILIARY', 'ADMIN_CHURCH'],
  'cell.write': ['PASTOR_PRESIDENT', 'PASTOR_AUXILIARY', 'ADMIN_CHURCH'],
  'musician.write': ['WORSHIP_LEADER', 'PASTOR_PRESIDENT', 'PASTOR_AUXILIARY', 'ADMIN_CHURCH'],
  'document.write': ['PASTOR_PRESIDENT', 'PASTOR_AUXILIARY', 'ADMIN_CHURCH'],
  'asset.read': ['PASTOR_PRESIDENT', 'PASTOR_AUXILIARY', 'ADMIN_CHURCH', 'TREASURER'],
  'asset.write': ['PASTOR_PRESIDENT', 'PASTOR_AUXILIARY', 'ADMIN_CHURCH', 'TREASURER'],
  'schedule.write': ['PASTOR_PRESIDENT', 'PASTOR_AUXILIARY', 'ADMIN_CHURCH'],
  'scale.write': ['PASTOR_PRESIDENT', 'PASTOR_AUXILIARY', 'ADMIN_CHURCH', 'WORSHIP_LEADER'],
  'sermon.write': ['PASTOR_PRESIDENT', 'PASTOR_AUXILIARY', 'ADMIN_CHURCH'],
  'notification.send': ['PASTOR_PRESIDENT', 'PASTOR_AUXILIARY', 'ADMIN_CHURCH', 'WORSHIP_LEADER'],
  'pastoralCare.read': ['PASTOR_PRESIDENT', 'PASTOR_AUXILIARY'],
  'pastoralCare.write': ['PASTOR_PRESIDENT', 'PASTOR_AUXILIARY'],
  'pastoralVisit.read': ['PASTOR_PRESIDENT', 'PASTOR_AUXILIARY', 'ADMIN_CHURCH'],
  'pastoralVisit.write': ['PASTOR_PRESIDENT', 'PASTOR_AUXILIARY', 'ADMIN_CHURCH'],
  'finance.read': ['PASTOR_PRESIDENT', 'ADMIN_CHURCH', 'TREASURER'],
  'finance.write': ['PASTOR_PRESIDENT', 'ADMIN_CHURCH', 'TREASURER'],
} as const satisfies Record<string, readonly Role[]>

export type Permission = keyof typeof PERMISSIONS

export function hasRole(roles: readonly Role[], allowed: readonly Role[]): boolean {
  return roles.some((role) => allowed.includes(role))
}

export function can(roles: readonly Role[], permission: Permission): boolean {
  return hasRole(roles, PERMISSIONS[permission])
}
