import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Check, ChevronsUpDown, Church } from 'lucide-react'
import { authApi } from '@/features/auth/auth.api'
import { useSessionStore } from '@/features/auth/session.store'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'
import { notifyError, notifySuccess } from '@/shared/ui/toast'
import type { MyChurchResponse } from '@/shared/types/domain'

/**
 * Seletor de congregações ativas para líderes com múltiplas igrejas (ADR-009).
 * - Se possui 1 congregação: exibe o nome fixo.
 * - Se possui 2+ congregações: exibe dropdown permitindo alternar de congregação,
 *   purgando o cache do TanStack Query na troca para evitar vazamento entre tenants (ADR-009 R3).
 */
export function ChurchSwitcher() {
  const queryClient = useQueryClient()
  const switchChurch = useSessionStore((s) => s.switchChurch)

  const { data: churches = [], isPending } = useQuery({
    queryKey: ['my-churches'],
    queryFn: () => authApi.myChurches(),
  })

  if (isPending && churches.length === 0) {
    return (
      <div className="flex items-center gap-2 text-xs text-content-muted">
        <Church className="size-4 animate-pulse text-content-muted" aria-hidden />
        <span className="hidden sm:inline">Carregando congregações…</span>
      </div>
    )
  }

  if (churches.length === 0) return null

  const currentChurch = churches.find((c) => c.isCurrent) ?? churches[0]

  // Apenas 1 congregação vinculada: nome fixo (sem dropdown interativo).
  if (churches.length === 1) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-border-subtle bg-surface-muted px-2.5 py-1.5 text-sm font-medium text-content shadow-xs">
        <Church className="size-4 text-primary shrink-0" aria-hidden />
        <span className="truncate max-w-[180px] sm:max-w-xs">{currentChurch.churchName}</span>
      </div>
    )
  }

/**
 * Ao alternar de congregação, a aplicação recarrega a página para montar todas as telas,
 * rotas e queries do zero com os dados limpos do novo tenant (ADR-009 R3).
 * Se o usuário estiver em rota de sub-recurso com ID específico (ex.: /membros/:id),
 * redireciona para a listagem (/membros) para evitar 404 de ID que não existe na nova igreja.
 */
function reloadPageForTenantSwitch() {
  if (typeof window === 'undefined' || !window.location) return
  const pathname = window.location.pathname
  const subRouteMatch = pathname.match(
    /^\/(membros|celulas|pastores|musicos|cultos|sermoes|documentos|patrimonio)\/.+/,
  )
  const targetUrl = subRouteMatch ? `/${subRouteMatch[1]}` : pathname

  try {
    if (window.location.pathname === targetUrl && !window.location.search) {
      window.location.reload()
    } else {
      window.location.href = targetUrl
    }
  } catch {
    // Fallback silencioso para ambientes onde jsdom bloqueia navegação em testes
  }
}

  async function handleSwitch(church: MyChurchResponse) {
    if (church.isCurrent) return
    try {
      await switchChurch(church.churchId)
      // ADR-009 R3: purga obrigatória de cache ao alternar de congregação.
      queryClient.clear()

      try {
        sessionStorage.setItem(
          'cmsaas.switchChurchToast',
          `Congregação alterada para ${church.churchName}`,
        )
      } catch {
        /* storage bloqueado/indisponível */
      }

      notifySuccess(`Congregação alterada para ${church.churchName}`)
      reloadPageForTenantSwitch()
    } catch (error) {
      notifyError(error)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Alternar congregação"
        className="flex items-center gap-2 rounded-lg border border-border-subtle bg-surface-muted px-2.5 py-1.5 text-sm font-medium text-content hover:bg-surface transition-colors max-w-[220px] sm:max-w-xs shadow-xs"
      >
        <Church className="size-4 text-primary shrink-0" aria-hidden />
        <span className="truncate text-left">{currentChurch.churchName}</span>
        <ChevronsUpDown className="size-3.5 text-content-muted shrink-0 ml-1" aria-hidden />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" className="w-64">
        <DropdownMenuLabel>Alternar congregação</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {churches.map((church) => (
          <DropdownMenuItem
            key={church.churchId}
            onSelect={() => void handleSwitch(church)}
            className="flex items-center justify-between gap-2 cursor-pointer"
          >
            <span className="truncate">{church.churchName}</span>
            {church.isCurrent && (
              <Check className="size-4 text-primary shrink-0" aria-label="Congregação ativa" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
