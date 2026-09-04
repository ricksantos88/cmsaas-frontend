import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { useDeleteMember, useMembers } from './members.queries'
import type { MemberFilters } from './members.api'
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
import { formatDate } from '@/shared/lib/format'
import { MEMBER_STATUS_LABELS, MEMBER_STATUS_TONES } from '@/shared/types/labels'
import type { MemberStatus, MemberSummary } from '@/shared/types/domain'

/**
 * Listagem de referência do console. Todo módulo segue esta forma:
 * PageHeader → FilterBar → QueryStates → tabela → paginação
 * (docs/guides/layout-model.md § 2).
 */
export function MembersPage() {
  const { can } = useSession()
  const navigate = useNavigate()
  const { get, page, setFilters, setPage, clear, hasFilters } = useListFilters()
  const [pendingDelete, setPendingDelete] = useState<MemberSummary | null>(null)

  const filters: MemberFilters = {
    page,
    limit: 20,
    search: get('search'),
    status: get('status') as MemberStatus | undefined,
    city: get('city'),
  }

  const query = useMembers(filters)
  const deleteMember = useDeleteMember()
  const canWrite = can('member.write')

  async function confirmDelete() {
    if (!pendingDelete) return
    try {
      await deleteMember.mutateAsync(pendingDelete.id)
      notifySuccess(`${pendingDelete.fullName} foi removido das listagens.`)
      setPendingDelete(null)
    } catch (error) {
      notifyError(error)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Membros"
        description="Cadastro de membros da igreja."
        actions={
          canWrite && (
            <Button asChild>
              <Link to="/membros/novo">
                <Plus aria-hidden />
                Novo membro
              </Link>
            </Button>
          )
        }
      />

      <Card>
        <FilterBar
          searchValue={get('search')}
          searchPlaceholder="Buscar por nome, e-mail ou telefone"
          onSearch={(value) => setFilters({ search: value })}
          onClear={clear}
          showClear={hasFilters}
        >
          <EnumSelect
            label="Filtrar por situação"
            placeholder="Todas as situações"
            options={MEMBER_STATUS_LABELS}
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
              title="Nenhum membro encontrado"
              description={
                hasFilters
                  ? 'Nenhum membro corresponde aos filtros aplicados.'
                  : 'Comece cadastrando o primeiro membro da igreja.'
              }
              action={
                hasFilters ? (
                  <Button variant="outline" onClick={clear}>
                    Limpar filtros
                  </Button>
                ) : (
                  canWrite && (
                    <Button asChild>
                      <Link to="/membros/novo">Cadastrar membro</Link>
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
                    <TH>Nome</TH>
                    <TH>Contato</TH>
                    <TH>Cidade</TH>
                    <TH>Situação</TH>
                    <TH>Batizado</TH>
                    <TH>Filiação</TH>
                    <TH className="w-12" />
                  </TR>
                </THead>
                <TBody>
                  {data.data.map((member) => (
                    <TR key={member.id}>
                      <TD className="font-medium">
                        <Link to={`/membros/${member.id}`} className="hover:text-primary">
                          {member.fullName}
                        </Link>
                      </TD>
                      <TD className="text-content-muted">{member.email ?? member.phone ?? '—'}</TD>
                      <TD className="text-content-muted">{member.city ?? '—'}</TD>
                      <TD>
                        <Badge tone={MEMBER_STATUS_TONES[member.status]}>
                          {MEMBER_STATUS_LABELS[member.status]}
                        </Badge>
                      </TD>
                      <TD className="text-content-muted">{member.baptized ? 'Sim' : 'Não'}</TD>
                      <TD className="text-content-muted">{formatDate(member.membershipDate)}</TD>
                      <TD>
                        <DropdownMenu>
                          <RowActionsTrigger label={`Ações de ${member.fullName}`} />
                          <DropdownMenuContent>
                            <DropdownMenuItem onSelect={() => void navigate(`/membros/${member.id}`)}>
                              Ver detalhes
                            </DropdownMenuItem>
                            {canWrite && (
                              <>
                                <DropdownMenuItem
                                  onSelect={() => void navigate(`/membros/${member.id}/editar`)}
                                >
                                  <Pencil aria-hidden />
                                  Editar
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  destructive
                                  onSelect={() => setPendingDelete(member)}
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

      <ConfirmDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title="Excluir membro"
        description={`${pendingDelete?.fullName ?? ''} sai das listagens e dos relatórios. O histórico é mantido no banco (exclusão lógica) e a operação pode ser revertida pela equipe técnica.`}
        confirmLabel="Excluir"
        loading={deleteMember.isPending}
        onConfirm={() => void confirmDelete()}
      />
    </div>
  )
}
