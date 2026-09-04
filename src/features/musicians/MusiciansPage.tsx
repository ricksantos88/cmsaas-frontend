import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { useDeleteMusician, useMusician, useMusicians } from './musicians.queries'
import { MusicianFormDialog } from './MusicianFormDialog'
import type { MusicianFilters } from './musicians.api'
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
import {
  INSTRUMENT_LABELS,
  MINISTRY_ROLE_LABELS,
  MUSICIAN_STATUS_LABELS,
  MUSICIAN_STATUS_TONES,
} from '@/shared/types/labels'
import type { Instrument, MinistryRole, MusicianStatus, MusicianSummary } from '@/shared/types/domain'

export function MusiciansPage() {
  const { can } = useSession()
  const navigate = useNavigate()
  const { get, page, setFilters, setPage, clear, hasFilters } = useListFilters()
  const [formOpen, setFormOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | undefined>()
  const [pendingDelete, setPendingDelete] = useState<MusicianSummary | null>(null)

  const filters: MusicianFilters = {
    page,
    limit: 20,
    search: get('search'),
    instrument: get('instrument') as Instrument | undefined,
    ministryRole: get('ministryRole') as MinistryRole | undefined,
    status: get('status') as MusicianStatus | undefined,
  }

  const query = useMusicians(filters)
  const editing = useMusician(editingId)
  const deleteMusician = useDeleteMusician()
  const canWrite = can('musician.write')

  async function confirmDelete() {
    if (!pendingDelete) return
    try {
      await deleteMusician.mutateAsync(pendingDelete.id)
      notifySuccess('Músico removido do ministério.')
      setPendingDelete(null)
    } catch (error) {
      notifyError(error)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Ministério de música"
        description="Músicos, instrumentos e disponibilidade para escala."
        actions={
          canWrite && (
            <Button
              onClick={() => {
                setEditingId(undefined)
                setFormOpen(true)
              }}
            >
              <Plus aria-hidden />
              Novo músico
            </Button>
          )
        }
      />

      <Card>
        <FilterBar
          searchValue={get('search')}
          searchPlaceholder="Buscar por nome do músico"
          onSearch={(value) => setFilters({ search: value })}
          onClear={clear}
          showClear={hasFilters}
        >
          <EnumSelect
            label="Filtrar por instrumento"
            placeholder="Todos os instrumentos"
            options={INSTRUMENT_LABELS}
            value={filters.instrument}
            onChange={(instrument) => setFilters({ instrument })}
          />
          <EnumSelect
            label="Filtrar por função"
            placeholder="Todas as funções"
            options={MINISTRY_ROLE_LABELS}
            value={filters.ministryRole}
            onChange={(ministryRole) => setFilters({ ministryRole })}
          />
        </FilterBar>

        <QueryStates
          query={query}
          skeleton={<TableSkeleton columns={5} />}
          isEmpty={(data) => data.data.length === 0}
          empty={
            <EmptyState
              title="Nenhum músico encontrado"
              description={
                hasFilters
                  ? 'Nenhum músico corresponde aos filtros.'
                  : 'Vincule membros ao ministério de música para montar escalas.'
              }
              action={
                hasFilters ? (
                  <Button variant="outline" onClick={clear}>
                    Limpar filtros
                  </Button>
                ) : (
                  canWrite && <Button onClick={() => setFormOpen(true)}>Cadastrar músico</Button>
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
                    <TH>Músico</TH>
                    <TH>Função</TH>
                    <TH>Instrumento principal</TH>
                    <TH>Canta</TH>
                    <TH>Situação</TH>
                    <TH className="w-12" />
                  </TR>
                </THead>
                <TBody>
                  {data.data.map((musician) => (
                    <TR key={musician.id}>
                      <TD className="font-medium">
                        <Link to={`/musicos/${musician.id}`} className="hover:text-primary">
                          {musician.memberName ?? 'Sem nome'}
                        </Link>
                      </TD>
                      <TD className="text-content-muted">
                        {MINISTRY_ROLE_LABELS[musician.ministryRole]}
                        {musician.isWorshipLeader && (
                          <Badge tone="info" className="ml-2">
                            Ministra
                          </Badge>
                        )}
                      </TD>
                      <TD className="text-content-muted">
                        {musician.primaryInstrument
                          ? INSTRUMENT_LABELS[musician.primaryInstrument]
                          : musician.instruments.map((i) => INSTRUMENT_LABELS[i]).join(', ') || '—'}
                      </TD>
                      <TD className="text-content-muted">{musician.canSing ? 'Sim' : 'Não'}</TD>
                      <TD>
                        <Badge tone={MUSICIAN_STATUS_TONES[musician.status]}>
                          {MUSICIAN_STATUS_LABELS[musician.status]}
                        </Badge>
                      </TD>
                      <TD>
                        <DropdownMenu>
                          <RowActionsTrigger label={`Ações de ${musician.memberName ?? 'músico'}`} />
                          <DropdownMenuContent>
                            <DropdownMenuItem onSelect={() => void navigate(`/musicos/${musician.id}`)}>
                              Ver detalhes
                            </DropdownMenuItem>
                            {canWrite && (
                              <>
                                <DropdownMenuItem
                                  onSelect={() => {
                                    setEditingId(musician.id)
                                    setFormOpen(true)
                                  }}
                                >
                                  <Pencil aria-hidden />
                                  Editar
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  destructive
                                  onSelect={() => setPendingDelete(musician)}
                                >
                                  <Trash2 aria-hidden />
                                  Remover do ministério
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

      <MusicianFormDialog
        open={formOpen && (!editingId || Boolean(editing.data))}
        onOpenChange={setFormOpen}
        musician={editingId ? editing.data : undefined}
      />

      <ConfirmDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title="Remover do ministério"
        description={`${pendingDelete?.memberName ?? 'O músico'} sai das escalas e das listagens. O cadastro do membro é preservado, e ele pode ser recadastrado depois.`}
        confirmLabel="Remover"
        loading={deleteMusician.isPending}
        onConfirm={() => void confirmDelete()}
      />
    </div>
  )
}
