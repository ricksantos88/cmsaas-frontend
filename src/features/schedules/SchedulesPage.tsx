import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { CalendarDays, List, Pencil, Plus, XCircle } from 'lucide-react'
import { useCancelSchedule, useSchedules } from './schedules.queries'
import { ScheduleCalendar } from './ScheduleCalendar'
import type { ScheduleFilters } from './schedules.api'
import { useSession } from '@/features/auth/useSession'
import { useListFilters } from '@/shared/hooks/use-list-filters'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card } from '@/shared/ui/card'
import { ConfirmDialog } from '@/shared/ui/confirm-dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  RowActionsTrigger,
} from '@/shared/ui/dropdown-menu'
import { EnumSelect, FilterBar } from '@/shared/ui/filter-bar'
import { PageHeader } from '@/shared/ui/page-header'
import { Pagination } from '@/shared/ui/pagination'
import { QueryStates } from '@/shared/ui/query-states'
import { TableSkeleton } from '@/shared/ui/skeleton'
import { EmptyState } from '@/shared/ui/states'
import { Table, TBody, TD, TH, THead, TR } from '@/shared/ui/table'
import { notifyError, notifySuccess } from '@/shared/ui/toast'
import { formatDateTime } from '@/shared/lib/format'
import {
  SCHEDULE_STATUS_LABELS,
  SCHEDULE_STATUS_TONES,
  SCHEDULE_TYPE_LABELS,
} from '@/shared/types/labels'
import type { ScheduleStatus, ScheduleSummary, ScheduleType } from '@/shared/types/domain'

export function SchedulesPage() {
  const { can } = useSession()
  const navigate = useNavigate()
  const { get, page, setFilters, setPage, clear, hasFilters } = useListFilters()
  const [pendingCancel, setPendingCancel] = useState<ScheduleSummary | null>(null)

  // A visão (lista/calendário) também vive na URL: o link leva a pessoa ao mesmo lugar.
  const view = get('view') === 'calendario' ? 'calendario' : 'lista'

  const filters: ScheduleFilters = {
    page,
    limit: 20,
    search: get('search'),
    type: get('type') as ScheduleType | undefined,
    status: get('status') as ScheduleStatus | undefined,
    fromDate: get('fromDate'),
  }

  const query = useSchedules(filters)
  const cancelSchedule = useCancelSchedule()
  const canWrite = can('schedule.write')

  async function confirmCancel() {
    if (!pendingCancel) return
    try {
      await cancelSchedule.mutateAsync(pendingCancel.id)
      notifySuccess('Evento cancelado.')
      setPendingCancel(null)
    } catch (error) {
      notifyError(error)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Agenda"
        description="Cultos, estudos, células, visitas e treinamentos."
        actions={
          <>
            <div className="flex rounded-lg border border-border-subtle p-0.5">
              <Button
                variant={view === 'lista' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setFilters({ view: undefined })}
              >
                <List aria-hidden />
                Lista
              </Button>
              <Button
                variant={view === 'calendario' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setFilters({ view: 'calendario' })}
              >
                <CalendarDays aria-hidden />
                Calendário
              </Button>
            </div>
            {canWrite && (
              <Button asChild>
                <Link to="/agenda/novo">
                  <Plus aria-hidden />
                  Novo evento
                </Link>
              </Button>
            )}
          </>
        }
      />

      {view === 'calendario' ? (
        <ScheduleCalendar />
      ) : (
        <Card>
          <FilterBar
            searchValue={get('search')}
            searchPlaceholder="Buscar por título ou tema"
            onSearch={(value) => setFilters({ search: value })}
            onClear={clear}
            showClear={hasFilters}
          >
            <EnumSelect
              label="Filtrar por tipo"
              placeholder="Todos os tipos"
              options={SCHEDULE_TYPE_LABELS}
              value={filters.type}
              onChange={(type) => setFilters({ type })}
            />
            <EnumSelect
              label="Filtrar por situação"
              placeholder="Todas as situações"
              options={SCHEDULE_STATUS_LABELS}
              value={filters.status}
              onChange={(status) => setFilters({ status })}
            />
          </FilterBar>

          <QueryStates
            query={query}
            skeleton={<TableSkeleton columns={6} />}
            isEmpty={(data) => data.data.length === 0}
            empty={
              <EmptyState
                title="Nenhum evento encontrado"
                description={
                  hasFilters
                    ? 'Nenhum evento corresponde aos filtros.'
                    : 'Crie o primeiro evento da agenda.'
                }
                action={
                  hasFilters ? (
                    <Button variant="outline" onClick={clear}>
                      Limpar filtros
                    </Button>
                  ) : (
                    canWrite && (
                      <Button asChild>
                        <Link to="/agenda/novo">Criar evento</Link>
                      </Button>
                    )
                  )
                }
              />
            }
          >
            {(data) => (
              <>
                <Table>
                  <THead>
                    <TR>
                      <TH>Evento</TH>
                      <TH>Tipo</TH>
                      <TH>Início</TH>
                      <TH>Local</TH>
                      <TH>Presenças</TH>
                      <TH>Situação</TH>
                      <TH className="w-12" />
                    </TR>
                  </THead>
                  <TBody>
                    {data.data.map((schedule) => (
                      <TR key={schedule.id}>
                        <TD className="font-medium">
                          <Link to={`/agenda/${schedule.id}`} className="hover:text-primary">
                            {schedule.title}
                          </Link>
                          {schedule.preacher && (
                            <span className="block text-xs text-content-muted">
                              {schedule.preacher}
                              {schedule.topic ? ` · ${schedule.topic}` : ''}
                            </span>
                          )}
                        </TD>
                        <TD className="text-content-muted">{SCHEDULE_TYPE_LABELS[schedule.type]}</TD>
                        <TD className="text-content-muted">
                          {formatDateTime(schedule.startDateTime)}
                        </TD>
                        <TD className="text-content-muted">{schedule.location ?? '—'}</TD>
                        <TD className="text-content-muted">{schedule.attendanceCount}</TD>
                        <TD>
                          <Badge tone={SCHEDULE_STATUS_TONES[schedule.status]}>
                            {SCHEDULE_STATUS_LABELS[schedule.status]}
                          </Badge>
                        </TD>
                        <TD>
                          <DropdownMenu>
                            <RowActionsTrigger label={`Ações de ${schedule.title}`} />
                            <DropdownMenuContent>
                              <DropdownMenuItem
                                onSelect={() => void navigate(`/agenda/${schedule.id}`)}
                              >
                                Ver evento
                              </DropdownMenuItem>
                              {canWrite && (
                                <>
                                  <DropdownMenuItem
                                    onSelect={() => void navigate(`/agenda/${schedule.id}/editar`)}
                                  >
                                    <Pencil aria-hidden />
                                    Editar
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    destructive
                                    disabled={schedule.status === 'CANCELLED'}
                                    onSelect={() => setPendingCancel(schedule)}
                                  >
                                    <XCircle aria-hidden />
                                    Cancelar evento
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TD>
                      </TR>
                    ))}
                  </TBody>
                </Table>
                <Pagination meta={data.pagination} onPageChange={setPage} />
              </>
            )}
          </QueryStates>
        </Card>
      )}

      <ConfirmDialog
        open={pendingCancel !== null}
        onOpenChange={(open) => !open && setPendingCancel(null)}
        title="Cancelar evento"
        description={`"${pendingCancel?.title ?? ''}" passa para a situação "Cancelado" e deixa de aceitar check-in. As presenças já registradas são mantidas.`}
        confirmLabel="Cancelar evento"
        loading={cancelSchedule.isPending}
        onConfirm={() => void confirmCancel()}
      />
    </div>
  )
}
