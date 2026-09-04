import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { Pencil, Plus, Trash2, Users } from 'lucide-react'
import { useCell, useCells, useDeleteCell } from './cells.queries'
import { CellFormDialog } from './CellFormDialog'
import type { CellFilters } from './cells.api'
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
import { CELL_STATUS_LABELS, CELL_STATUS_TONES, DAY_LABELS } from '@/shared/types/labels'
import type { CellStatus, CellSummary } from '@/shared/types/domain'
import type { DayOfWeek } from '@/shared/types/api'

export function CellsPage() {
  const { can } = useSession()
  const navigate = useNavigate()
  const { get, page, setFilters, setPage, clear, hasFilters } = useListFilters()
  const [formOpen, setFormOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | undefined>()
  const [pendingDelete, setPendingDelete] = useState<CellSummary | null>(null)

  const filters: CellFilters = {
    page,
    limit: 20,
    search: get('search'),
    status: get('status') as CellStatus | undefined,
    dayOfWeek: get('dayOfWeek') as DayOfWeek | undefined,
  }

  const query = useCells(filters)
  const editing = useCell(editingId)
  const deleteCell = useDeleteCell()
  const canWrite = can('cell.write')

  async function confirmDelete() {
    if (!pendingDelete) return
    try {
      await deleteCell.mutateAsync(pendingDelete.id)
      notifySuccess(`A célula ${pendingDelete.name} foi removida das listagens.`)
      setPendingDelete(null)
    } catch (error) {
      notifyError(error)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Células"
        description="Grupos familiares, liderança e reuniões."
        actions={
          canWrite && (
            <Button
              onClick={() => {
                setEditingId(undefined)
                setFormOpen(true)
              }}
            >
              <Plus aria-hidden />
              Nova célula
            </Button>
          )
        }
      />

      <Card>
        <FilterBar
          searchValue={get('search')}
          searchPlaceholder="Buscar por nome da célula"
          onSearch={(value) => setFilters({ search: value })}
          onClear={clear}
          showClear={hasFilters}
        >
          <EnumSelect
            label="Filtrar por situação"
            placeholder="Todas as situações"
            options={CELL_STATUS_LABELS}
            value={filters.status}
            onChange={(status) => setFilters({ status })}
          />
          <EnumSelect
            label="Filtrar por dia"
            placeholder="Todos os dias"
            options={DAY_LABELS}
            value={filters.dayOfWeek}
            onChange={(dayOfWeek) => setFilters({ dayOfWeek })}
          />
        </FilterBar>

        <QueryStates
          query={query}
          skeleton={<TableSkeleton columns={5} />}
          isEmpty={(data) => data.data.length === 0}
          empty={
            <EmptyState
              title="Nenhuma célula encontrada"
              description={
                hasFilters ? 'Nenhuma célula corresponde aos filtros.' : 'Crie a primeira célula.'
              }
              action={
                hasFilters ? (
                  <Button variant="outline" onClick={clear}>
                    Limpar filtros
                  </Button>
                ) : (
                  canWrite && <Button onClick={() => setFormOpen(true)}>Criar célula</Button>
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
                    <TH>Célula</TH>
                    <TH>Reunião</TH>
                    <TH>Bairro</TH>
                    <TH>Participantes</TH>
                    <TH>Situação</TH>
                    <TH className="w-12" />
                  </TR>
                </THead>
                <TBody>
                  {data.data.map((cell) => (
                    <TR key={cell.id}>
                      <TD className="font-medium">
                        <Link to={`/celulas/${cell.id}`} className="hover:text-primary">
                          {cell.name}
                        </Link>
                      </TD>
                      <TD className="text-content-muted">
                        {cell.meeting?.dayOfWeek
                          ? `${DAY_LABELS[cell.meeting.dayOfWeek]}${cell.meeting.time ? ` · ${cell.meeting.time.slice(0, 5)}` : ''}`
                          : '—'}
                      </TD>
                      <TD className="text-content-muted">{cell.neighborhood ?? '—'}</TD>
                      <TD className="text-content-muted">
                        <span className="inline-flex items-center gap-1.5">
                          <Users className="size-3.5" aria-hidden />
                          {cell.memberCount}
                        </span>
                      </TD>
                      <TD>
                        <Badge tone={CELL_STATUS_TONES[cell.status]}>
                          {CELL_STATUS_LABELS[cell.status]}
                        </Badge>
                      </TD>
                      <TD>
                        <DropdownMenu>
                          <RowActionsTrigger label={`Ações da célula ${cell.name}`} />
                          <DropdownMenuContent>
                            <DropdownMenuItem onSelect={() => void navigate(`/celulas/${cell.id}`)}>
                              Ver participantes
                            </DropdownMenuItem>
                            {canWrite && (
                              <>
                                <DropdownMenuItem
                                  onSelect={() => {
                                    setEditingId(cell.id)
                                    setFormOpen(true)
                                  }}
                                >
                                  <Pencil aria-hidden />
                                  Editar
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem destructive onSelect={() => setPendingDelete(cell)}>
                                  <Trash2 aria-hidden />
                                  Excluir
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

      <CellFormDialog
        open={formOpen && (!editingId || Boolean(editing.data))}
        onOpenChange={setFormOpen}
        cell={editingId ? editing.data : undefined}
      />

      <ConfirmDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title="Excluir célula"
        description={`A célula ${pendingDelete?.name ?? ''} sai das listagens. Os membros continuam cadastrados, apenas sem célula.`}
        confirmLabel="Excluir"
        loading={deleteCell.isPending}
        onConfirm={() => void confirmDelete()}
      />
    </div>
  )
}
