import { Link } from 'react-router'
import { Boxes, CalendarDays, Music, UsersRound, Users, Video } from 'lucide-react'
import { useMembers } from '@/features/members/members.queries'
import { useCells } from '@/features/cells/cells.queries'
import { useMusicians } from '@/features/musicians/musicians.queries'
import { useSchedules } from '@/features/schedules/schedules.queries'
import { useSermons } from '@/features/sermons/sermons.queries'
import { useAssetsSummary } from '@/features/assets/assets.queries'
import { useSession } from '@/features/auth/useSession'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card, CardHeader, CardTitle } from '@/shared/ui/card'
import { PageHeader } from '@/shared/ui/page-header'
import { QueryStates } from '@/shared/ui/query-states'
import { CardSkeleton } from '@/shared/ui/skeleton'
import { StatCard } from '@/shared/ui/stat-card'
import { EmptyState } from '@/shared/ui/states'
import { formatCurrency, formatDateTime } from '@/shared/lib/format'
import { SCHEDULE_STATUS_LABELS, SCHEDULE_STATUS_TONES, SCHEDULE_TYPE_LABELS } from '@/shared/types/labels'

/**
 * Painel do console.
 *
 * A API não tem endpoint de dashboard agregado: cada indicador é o `totalItems`
 * de uma listagem paginada em 1 item — barato no servidor e sem inventar rota.
 * Se o número de cartões crescer, é hora de pedir um endpoint de resumo.
 */
export function DashboardPage() {
  const { user, can } = useSession()

  const countOnly = { page: 1, limit: 1 } as const
  const members = useMembers({ ...countOnly, status: 'ACTIVE' })
  const cells = useCells({ ...countOnly, status: 'ACTIVE' })
  const musicians = useMusicians({ ...countOnly, status: 'ACTIVE' })
  const sermons = useSermons(countOnly)
  const assets = useAssetsSummary()

  const today = new Date().toISOString().slice(0, 10)
  const upcoming = useSchedules({ page: 1, limit: 5, fromDate: today, status: 'SCHEDULED' })

  const canSeeAssets = can('asset.read')

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Olá, ${user?.name?.split(' ')[0] ?? ''}`}
        description="Panorama da igreja e próximos eventos."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label="Membros ativos"
          value={members.data?.pagination.totalItems}
          icon={Users}
          loading={members.isPending}
        />
        <StatCard
          label="Células ativas"
          value={cells.data?.pagination.totalItems}
          icon={UsersRound}
          loading={cells.isPending}
        />
        <StatCard
          label="Músicos ativos"
          value={musicians.data?.pagination.totalItems}
          icon={Music}
          loading={musicians.isPending}
        />
        <StatCard
          label="Sermões no acervo"
          value={sermons.data?.pagination.totalItems}
          icon={Video}
          loading={sermons.isPending}
        />
        <StatCard
          label="Eventos agendados"
          value={upcoming.data?.pagination.totalItems}
          hint="A partir de hoje."
          icon={CalendarDays}
          loading={upcoming.isPending}
        />
        {canSeeAssets && (
          <StatCard
            label="Patrimônio"
            value={formatCurrency(assets.data?.totalValue, assets.data?.currency ?? 'BRL')}
            hint={
              assets.data?.maintenanceDueSoon
                ? `${assets.data.maintenanceDueSoon} item(ns) com manutenção próxima`
                : undefined
            }
            icon={Boxes}
            loading={assets.isPending}
          />
        )}
      </div>

      <Card>
        <CardHeader className="flex items-center justify-between gap-4">
          <CardTitle>Próximos eventos</CardTitle>
          <Button asChild variant="ghost" size="sm">
            <Link to="/agenda">Ver agenda</Link>
          </Button>
        </CardHeader>

        <QueryStates
          query={upcoming}
          skeleton={<CardSkeleton rows={4} />}
          isEmpty={(data) => data.data.length === 0}
          empty={
            <EmptyState
              title="Nenhum evento agendado"
              description="Crie o próximo culto, estudo ou reunião na agenda."
              action={
                can('schedule.write') && (
                  <Button asChild>
                    <Link to="/agenda/novo">Criar evento</Link>
                  </Button>
                )
              }
            />
          }
        >
          {(data) => (
            <ul className="divide-y divide-border-subtle">
              {data.data.map((schedule) => (
                <li key={schedule.id} className="flex flex-wrap items-center gap-3 px-5 py-3">
                  <div className="min-w-0 flex-1">
                    <Link
                      to={`/agenda/${schedule.id}`}
                      className="text-sm font-medium text-content hover:text-primary"
                    >
                      {schedule.title}
                    </Link>
                    <p className="text-xs text-content-muted">
                      {SCHEDULE_TYPE_LABELS[schedule.type]} · {formatDateTime(schedule.startDateTime)}
                      {schedule.location ? ` · ${schedule.location}` : ''}
                    </p>
                  </div>
                  <Badge tone={SCHEDULE_STATUS_TONES[schedule.status]}>
                    {SCHEDULE_STATUS_LABELS[schedule.status]}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </QueryStates>
      </Card>
    </div>
  )
}
