import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import { AppShell } from './AppShell'
import { renderWithProviders } from '@/test/render'

describe('menu do console', () => {
  it('mostra Patrimônio para a tesouraria', () => {
    renderWithProviders(<AppShell />, { roles: ['TREASURER'] })

    expect(screen.getByRole('link', { name: 'Patrimônio' })).toBeInTheDocument()
  })

  it('esconde Patrimônio do líder de louvor', () => {
    renderWithProviders(<AppShell />, { roles: ['WORSHIP_LEADER'] })

    expect(screen.queryByRole('link', { name: 'Patrimônio' })).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Músicos' })).toBeInTheDocument()
  })

  it('mostra a área de plataforma só para o administrador da plataforma', () => {
    renderWithProviders(<AppShell />, { roles: ['SUPER_ADMIN'] })

    expect(screen.getByRole('link', { name: 'Igrejas da plataforma' })).toBeInTheDocument()
  })

  it('mostra a igreja do usuário no topo do menu', async () => {
    renderWithProviders(<AppShell />, { roles: ['PASTOR_PRESIDENT'] })

    expect(await screen.findByText('Igreja Central')).toBeInTheDocument()
  })

  it('não busca a igreja para quem não pode lê-la (evita 403 no shell)', () => {
    // WORSHIP_LEADER não tem church.read: o shell mostra a marca, sem chamada.
    renderWithProviders(<AppShell />, { roles: ['WORSHIP_LEADER'] })

    expect(screen.getByText('CMSaaS')).toBeInTheDocument()
  })

  it('esconde a área de plataforma do pastor presidente', () => {
    renderWithProviders(<AppShell />, { roles: ['PASTOR_PRESIDENT'] })

    expect(screen.queryByRole('link', { name: 'Igrejas da plataforma' })).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Dados da igreja' })).toBeInTheDocument()
  })
})
