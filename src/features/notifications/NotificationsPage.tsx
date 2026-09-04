import { useState } from 'react'
import { CheckCheck, Send } from 'lucide-react'
import { useInbox, useMarkAllAsRead, useMarkAsRead } from './notifications.queries'
import { SendNotificationDialog } from './SendNotificationDialog'
import { useSession } from '@/features/auth/useSession'
import { useListFilters } from '@/shared/hooks/use-list-filters'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card } from '@/shared/ui/card'
import { EnumSelect } from '@/shared/ui/filter-bar'
import { PageHeader } from '@/shared/ui/page-header'
import { Pagination } from '@/shared/ui/pagination'
import { QueryStates } from '@/shared/ui/query-states'
import { CardSkeleton } from '@/shared/ui/skeleton'
import { EmptyState } from '@/shared/ui/states'
import { notifyError, notifySuccess } from '@/shared/ui/toast'
import { cn } from '@/shared/lib/cn'
import { formatDateTime } from '@/shared/lib/format'
import { NOTIFICATION_TYPE_LABELS } from '@/shared/types/labels'
import type { NotificationType } from '@/shared/types/domain'

/** Inbox do próprio usuário + envio de avisos para quem tem permissão. */
export function NotificationsPage() {
  const { can } = useSession()
  const { get, page, setFilters, setPage } = useListFilters()
  const [sendOpen, setSendOpen] = useState(false)

  const unreadOnly = get('naoLidas') === 'true'
  const type = get('type') as NotificationType | undefined

  const query = useInbox({ page, unreadOnly, type })
  const markAsRead = useMarkAsRead()
  const markAllAsRead = useMarkAllAsRead()

  async function markAll() {
    try {
      const result = await markAllAsRead.mutateAsync()
      notifySuccess(
        result.markedAsRead === 0
          ? 'Nenhum aviso pendente.'
          : `${result.markedAsRead} avisos marcados como lidos.`,
      )
    } catch (error) {
      notifyError(error)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notificações"
        description="Avisos recebidos e envio de comunicados para a igreja."
        actions={
          <>
            <Button variant="outline" onClick={() => void markAll()} disabled={markAllAsRead.isPending}>
              <CheckCheck aria-hidden />
              Marcar tudo como lido
            </Button>
            {can('notification.send') && (
              <Button onClick={() => setSendOpen(true)}>
                <Send aria-hidden />
                Enviar aviso
              </Button>
            )}
          </>
        }
      />

      <Card>
        <div className="flex flex-wrap items-center gap-3 border-b border-border-subtle p-4">
          <div className="flex rounded-lg border border-border-subtle p-0.5">
            <Button
              variant={unreadOnly ? 'ghost' : 'secondary'}
              size="sm"
              onClick={() => setFilters({ naoLidas: undefined })}
            >
              Todos
            </Button>
            <Button
              variant={unreadOnly ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setFilters({ naoLidas: 'true' })}
            >
              Não lidos
              {query.data && query.data.pagination.unreadCount > 0 && (
                <Badge tone="info">{query.data.pagination.unreadCount}</Badge>
              )}
            </Button>
          </div>

          <EnumSelect
            label="Filtrar por tipo"
            placeholder="Todos os tipos"
            options={NOTIFICATION_TYPE_LABELS}
            value={type}
            onChange={(value) => setFilters({ type: value })}
          />
        </div>

        <QueryStates
          query={query}
          skeleton={<CardSkeleton rows={5} />}
          isEmpty={(data) => data.data.length === 0}
          empty={
            <EmptyState
              title={unreadOnly ? 'Nenhum aviso não lido' : 'Nenhum aviso recebido'}
              description="Avisos de eventos, documentos e escalas aparecem aqui."
            />
          }
        >
          {(data) => (
            <>
              <ul className="divide-y divide-border-subtle">
                {data.data.map((item) => (
                  <li
                    key={item.id}
                    className={cn('flex gap-4 px-5 py-4', !item.read && 'bg-primary/[0.04]')}
                  >
                    {/* Marcador de não lido: o texto do badge também informa, não só a cor. */}
                    <div className="pt-1">
                      <span
                        className={cn(
                          'block size-2 rounded-full',
                          item.read ? 'bg-border-subtle' : 'bg-primary',
                        )}
                        aria-hidden
                      />
                    </div>

                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-medium text-content">{item.title}</p>
                        <Badge>{NOTIFICATION_TYPE_LABELS[item.type]}</Badge>
                        {!item.read && <Badge tone="info">Não lido</Badge>}
                      </div>
                      <p className="text-sm text-content-muted">{item.body}</p>
                      <p className="text-xs text-content-muted">
                        {formatDateTime(item.sentAt ?? item.createdAt)}
                      </p>
                    </div>

                    {!item.read && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => void markAsRead.mutateAsync(item.id)}
                      >
                        Marcar como lido
                      </Button>
                    )}
                  </li>
                ))}
              </ul>
              <Pagination meta={data.pagination} onPageChange={setPage} />
            </>
          )}
        </QueryStates>
      </Card>

      <SendNotificationDialog open={sendOpen} onOpenChange={setSendOpen} />
    </div>
  )
}
