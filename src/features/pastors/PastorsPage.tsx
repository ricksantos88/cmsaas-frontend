import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { Pencil, Plus, Trash2, UserPlus } from 'lucide-react'
import { useDeletePastor, usePastor, usePastors } from './pastors.queries'
import { PastorFormDialog } from './PastorFormDialog'
import type { PastorFilters } from './pastors.api'
import { useSession } from '@/features/auth/useSession'
import { InviteUserDialog } from '@/features/users/InviteUserDialog'
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
  PASTOR_ROLE_LABELS,
  PASTOR_STATUS_LABELS,
  PASTOR_STATUS_TONES,
} from '@/shared/types/labels'
import type { PastorRole, PastorSummary } from '@/shared/types/domain'

export function PastorsPage() {
  const { can } = useSession()
  const navigate = useNavigate()
  const { get, page, setFilters, setPage, clear, hasFilters } = useListFilters()
  const [formOpen, setFormOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | undefined>()
  const [pendingDelete, setPendingDelete] = useState<PastorSummary | null>(null)
  const [invitingEntity, setInvitingEntity] = useState<{
    name: string
    email: string
    isPastor?: boolean
    currentRole?: PastorRole
  } | null>(null)

  const filters: PastorFilters = {
    page,
    limit: 20,
    search: get('search'),
    role: get('role') as PastorRole | undefined,
  }

  const query = usePastors(filters)
  const hasPresident = query.data?.data.some((p) => p.role === 'PASTOR_PRESIDENT') ?? false
  // O formulário precisa do pastor completo; a lista só traz o resumo.
  const editing = usePastor(editingId)
  const deletePastor = useDeletePastor()
  const canWrite = can('pastor.write')

  function openCreate() {
    setEditingId(undefined)
    setFormOpen(true)
  }

  function openEdit(id: string) {
    setEditingId(id)
    setFormOpen(true)
  }

  async function confirmDelete() {
    if (!pendingDelete) return
    try {
      await deletePastor.mutateAsync(pendingDelete.id)
      notifySuccess(`${pendingDelete.name} foi removido das listagens.`)
      setPendingDelete(null)
    } catch (error) {
      notifyError(error)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pastores"
        description="Corpo pastoral da igreja e visibilidade dos contatos."
        actions={
          canWrite && (
            <Button onClick={openCreate}>
              <Plus aria-hidden />
              Novo pastor
            </Button>
          )
        }
      />

      <Card>
        <FilterBar
          searchValue={get('search')}
          searchPlaceholder="Buscar por nome ou e-mail"
          onSearch={(value) => setFilters({ search: value })}
          onClear={clear}
          showClear={hasFilters}
        >
          <EnumSelect
            label="Filtrar por função"
            placeholder="Todas as funções"
            options={PASTOR_ROLE_LABELS}
            value={filters.role}
            onChange={(role) => setFilters({ role })}
          />
        </FilterBar>

        <QueryStates
          query={query}
          skeleton={<TableSkeleton columns={5} />}
          isEmpty={(data) => data.data.length === 0}
          empty={
            <EmptyState
              title="Nenhum pastor encontrado"
              description={
                hasFilters
                  ? 'Nenhum pastor corresponde aos filtros.'
                  : 'Cadastre o pastor presidente e os auxiliares da igreja.'
              }
              action={
                hasFilters ? (
                  <Button variant="outline" onClick={clear}>
                    Limpar filtros
                  </Button>
                ) : (
                  canWrite && <Button onClick={openCreate}>Cadastrar pastor</Button>
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
                    <TH>Nome</TH>
                    <TH>E-mail</TH>
                    <TH>Função</TH>
                    <TH>Cargo</TH>
                    <TH>Situação</TH>
                    <TH className="w-12" />
                  </TR>
                </THead>
                <TBody>
                  {data.data.map((pastor) => (
                    <TR key={pastor.id}>
                      <TD className="font-medium">
                        <div className="flex items-center gap-2">
                          <Link to={`/pastores/${pastor.id}`} className="hover:text-primary">
                            {pastor.name}
                          </Link>
                          {pastor.hasUser && (
                            <Badge tone="info" className="text-[10px] py-0 px-1.5">
                              Usuário
                            </Badge>
                          )}
                        </div>
                      </TD>
                      <TD className="text-content-muted">{pastor.email}</TD>
                      <TD className="text-content-muted">{PASTOR_ROLE_LABELS[pastor.role]}</TD>
                      <TD className="text-content-muted">{pastor.position ?? '—'}</TD>
                      <TD>
                        <Badge tone={PASTOR_STATUS_TONES[pastor.status]}>
                          {PASTOR_STATUS_LABELS[pastor.status]}
                        </Badge>
                      </TD>
                      <TD>
                        <DropdownMenu>
                            <RowActionsTrigger label={`Ações de ${pastor.name}`} />
                            <DropdownMenuContent>
                              <DropdownMenuItem onSelect={() => void navigate(`/pastores/${pastor.id}`)}>
                                Ver detalhes
                              </DropdownMenuItem>
                              {canWrite && !pastor.hasUser && pastor.email && (
                                <DropdownMenuItem
                                  onSelect={() =>
                                    setInvitingEntity({
                                      name: pastor.name,
                                      email: pastor.email,
                                      isPastor: true,
                                      currentRole: pastor.role,
                                    })
                                  }
                                >
                                  <UserPlus aria-hidden />
                                  Tornar usuário
                                </DropdownMenuItem>
                              )}
                              {canWrite && (
                                <DropdownMenuItem onSelect={() => openEdit(pastor.id)}>
                                  <Pencil aria-hidden />
                                  Editar
                                </DropdownMenuItem>
                              )}
                              {canWrite && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    destructive
                                    onSelect={() => setPendingDelete(pastor)}
                                  >
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

      <PastorFormDialog
        open={formOpen && (!editingId || Boolean(editing.data))}
        onOpenChange={setFormOpen}
        pastor={editingId ? editing.data : undefined}
      />

      <ConfirmDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title="Excluir pastor"
        description={`${pendingDelete?.name ?? ''} sai das listagens. O registro é mantido no banco (exclusão lógica).`}
        confirmLabel="Excluir"
        loading={deletePastor.isPending}
        onConfirm={() => void confirmDelete()}
      />

      <InviteUserDialog
        open={invitingEntity !== null}
        onOpenChange={(open) => !open && setInvitingEntity(null)}
        hasPresident={hasPresident}
        entity={invitingEntity}
      />
    </div>
  )
}
