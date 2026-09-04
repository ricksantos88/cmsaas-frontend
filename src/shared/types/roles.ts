/** RBAC do backend — `domain/user/Role.kt`. */
export const ROLES = [
  'SUPER_ADMIN',
  'PASTOR_PRESIDENT',
  'PASTOR_AUXILIARY',
  'ADMIN_CHURCH',
  'TREASURER',
  'WORSHIP_LEADER',
  'MEMBER',
  'GUEST',
] as const

export type Role = (typeof ROLES)[number]

/**
 * A web é canal **administrativo**. MEMBER e GUEST existem só no app mobile
 * (ADR-002 → Canais de acesso; ADR-004 do frontend).
 */
export const ADMIN_ROLES: readonly Role[] = [
  'SUPER_ADMIN',
  'PASTOR_PRESIDENT',
  'PASTOR_AUXILIARY',
  'ADMIN_CHURCH',
  'TREASURER',
  'WORSHIP_LEADER',
]

export const ROLE_LABELS: Record<Role, string> = {
  SUPER_ADMIN: 'Administrador da plataforma',
  PASTOR_PRESIDENT: 'Pastor presidente',
  PASTOR_AUXILIARY: 'Pastor auxiliar',
  ADMIN_CHURCH: 'Administração da igreja',
  TREASURER: 'Tesouraria',
  WORSHIP_LEADER: 'Líder de louvor',
  MEMBER: 'Membro',
  GUEST: 'Visitante',
}
