import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router'
import { LogOut, Menu, UserCog, X } from 'lucide-react'
import { NAVIGATION } from './navigation'
import { ChurchSwitcher } from './ChurchSwitcher'
import { useSession } from '@/features/auth/useSession'
import { useSessionStore } from '@/features/auth/session.store'
import { useChurch } from '@/features/church/church.queries'
import { Button } from '@/shared/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'
import { Skeleton } from '@/shared/ui/skeleton'
import { cn } from '@/shared/lib/cn'
import { initials } from '@/shared/lib/format'
import type { ReactNode } from 'react'
import { ROLE_LABELS } from '@/shared/types/roles'

/**
 * Casca do console: sidebar fixa em desktop, gaveta em mobile, topbar com a
 * identidade do usuário. Estrutura descrita em docs/guides/layout-model.md.
 */
export function AppShell({ children }: { children?: ReactNode } = {}) {
  const { user, roles, can } = useSession()
  const logout = useSessionStore((s) => s.logout)
  // Um usuário pertence a uma única igreja (ADR-003 do backend). Buscar só quando
  // a role pode ler a igreja — as demais tomariam 403 a cada carregamento do shell.
  const churchId = can('church.read') ? user?.churchId : undefined
  const church = useChurch(churchId)
  // Query desabilitada fica `pending` para sempre: sem o `churchId` aqui, quem não
  // pode ler a igreja veria um esqueleto que nunca resolve.
  const loadingChurch = Boolean(churchId) && church.isPending
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const groups = NAVIGATION.map((group) => ({
    ...group,
    items: group.items.filter((item) => !item.permission || can(item.permission)),
  })).filter((group) => group.items.length > 0)

  return (
    <div className="min-h-full bg-canvas">
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-lg focus:bg-surface focus:px-3 focus:py-2 focus:text-sm"
      >
        Pular para o conteúdo
      </a>

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex w-sidebar flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-transform lg:translate-x-0',
          menuOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex h-topbar items-center justify-between gap-2 border-b border-sidebar-border px-4">
          {/* A igreja do usuário é a identidade do console com o selo eclesiástico */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground font-bold text-sm shadow-sm shrink-0">
              ⛪
            </div>
            <div className="min-w-0">
              {loadingChurch ? (
                <Skeleton className="h-4 w-32 bg-sidebar-accent" />
              ) : (
                <>
                  <p className="truncate text-sm font-semibold tracking-tight text-sidebar-foreground">
                    {church.data?.name ?? 'CMSaaS'}
                  </p>
                  <p className="text-xs text-sidebar-muted">
                    {church.data ? 'Console administrativo' : 'Administração da plataforma'}
                  </p>
                </>
              )}
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden text-sidebar-foreground hover:bg-sidebar-accent"
            aria-label="Fechar menu"
            onClick={() => setMenuOpen(false)}
          >
            <X aria-hidden />
          </Button>
        </div>

        <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-4" aria-label="Menu principal">
          {groups.map((group) => (
            <div key={group.title} className="space-y-1">
              <p className="px-3 text-xs font-semibold tracking-wide text-sidebar-muted uppercase">
                {group.title}
              </p>
              {group.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                      isActive
                        ? 'bg-primary text-primary-foreground font-semibold shadow-sm'
                        : 'text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground',
                    )
                  }
                >
                  <item.icon className="size-4 shrink-0" aria-hidden />
                  {item.label}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>
      </aside>

      {menuOpen && (
        <button
          type="button"
          aria-label="Fechar menu"
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={() => setMenuOpen(false)}
        />
      )}

      <div className="lg:pl-sidebar">
        <header className="sticky top-0 z-20 flex h-topbar items-center gap-3 border-b border-border-subtle bg-surface/95 px-4 backdrop-blur shadow-xs">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            aria-label="Abrir menu"
            onClick={() => setMenuOpen(true)}
          >
            <Menu aria-hidden />
          </Button>

          {/* Seletor de congregações (ADR-009) */}
          <ChurchSwitcher />

          {/* Identidade e ações da conta ficam no canto superior direito. */}
          <DropdownMenu>
            <DropdownMenuTrigger
              aria-label="Menu da conta"
              className="ml-auto flex items-center gap-3 rounded-lg px-2 py-1.5 hover:bg-surface-muted transition-colors"
            >
              <span className="hidden text-right sm:block">
                <span className="block text-sm font-medium text-content">{user?.name}</span>
                <span className="block text-xs text-content-muted">
                  {roles.map((role) => ROLE_LABELS[role]).join(' · ')}
                </span>
              </span>
              <span className="grid size-9 place-items-center rounded-full bg-accent text-accent-foreground text-xs font-bold shadow-sm">
                {initials(user?.name ?? '')}
              </span>
            </DropdownMenuTrigger>

            <DropdownMenuContent>
              <DropdownMenuItem onSelect={() => void navigate('/minha-conta')}>
                <UserCog aria-hidden />
                Minha conta
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem destructive onSelect={() => void logout()}>
                <LogOut aria-hidden />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        <main id="conteudo" className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          {children ?? <Outlet />}
        </main>
      </div>
    </div>
  )
}
