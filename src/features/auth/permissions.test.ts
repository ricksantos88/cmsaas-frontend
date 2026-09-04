import { describe, expect, it } from 'vitest'
import { can, hasRole } from './permissions'
import { ADMIN_ROLES } from '@/shared/types/roles'

describe('permissões do console', () => {
  it('libera patrimônio para a tesouraria', () => {
    expect(can(['TREASURER'], 'asset.read')).toBe(true)
  })

  it('nega patrimônio ao líder de louvor', () => {
    expect(can(['WORSHIP_LEADER'], 'asset.read')).toBe(false)
  })

  it('libera a escala de louvor ao líder de louvor', () => {
    expect(can(['WORSHIP_LEADER'], 'scale.write')).toBe(true)
  })

  it('nega criar evento ao líder de louvor', () => {
    expect(can(['WORSHIP_LEADER'], 'schedule.write')).toBe(false)
  })

  it('acumula permissões quando o usuário tem várias roles', () => {
    expect(can(['WORSHIP_LEADER', 'TREASURER'], 'asset.read')).toBe(true)
  })

  it('mantém membro e visitante fora do canal administrativo', () => {
    expect(hasRole(['MEMBER'], ADMIN_ROLES)).toBe(false)
    expect(hasRole(['GUEST'], ADMIN_ROLES)).toBe(false)
    expect(hasRole(['ADMIN_CHURCH'], ADMIN_ROLES)).toBe(true)
  })
})
