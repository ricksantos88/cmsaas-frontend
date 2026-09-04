import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { Eye, Flame, Heart, Pencil, Plus, Trash2, Youtube } from 'lucide-react'
import { useDeleteSermon, useSermons, useTrendingSermons } from './sermons.queries'
import type { SermonFilters } from './sermons.api'
import { useSession } from '@/features/auth/useSession'
import { useListFilters } from '@/shared/hooks/use-list-filters'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card, CardHeader, CardTitle } from '@/shared/ui/card'
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
import { CardSkeleton, TableSkeleton } from '@/shared/ui/skeleton'
import { EmptyState } from '@/shared/ui/states'
import { Table, TBody, TD, TH, THead, TR } from '@/shared/ui/table'
import { notifyError, notifySuccess } from '@/shared/ui/toast'
import { formatDate } from '@/shared/lib/format'
import { SERMON_TOPIC_LABELS, SERMON_TYPE_LABELS } from '@/shared/types/labels'
import type { SermonSummary, SermonTopic, SermonType } from '@/shared/types/domain'

export function SermonsPage() {
  const { can } = useSession()
  const navigate = useNavigate()
  const { get, page, setFilters, setPage, clear, hasFilters } = useListFilters()
  const [pendingDelete, setPendingDelete] = useState<SermonSummary | null>(null)

  const filters: SermonFilters = {
    page,
    limit: 20,
    search: get('search'),
    topic: get('topic') as SermonTopic | undefined,
    sermonType: get('sermonType') as SermonType | undefined,
  }

  const query = useSermons(filters)
  const trending = useTrendingSermons('MONTH')
  const deleteSermon = useDeleteSermon()
  const canWrite = can('sermon.write')

  async function confirmDelete() {
    if (!pendingDelete) return
    try {
      await deleteSermon.mutateAsync(pendingDelete.id)
      notifySuccess('Sermão removido do acervo.')
      setPendingDelete(null)
    } catch (error) {
      notifyError(error)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sermões"
        description="Acervo de pregações, com referências bíblicas e vídeo."
        actions={
          canWrite && (
            <Button asChild>
              <Link to="/sermoes/novo">
                <Plus aria-hidden />
                Novo sermão
              </Link>
            </Button>
          )
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <FilterBar
            searchValue={get('search')}
            searchPlaceholder="Buscar por título ou palavra-chave"
            onSearch={(value) => setFilters({ search: value })}
            onClear={clear}
            showClear={hasFilters}
          >
            <EnumSelect
              label="Filtrar por tópico"
              placeholder="Todos os tópicos"
              options={SERMON_TOPIC_LABELS}
              value={filters.topic}
              onChange={(topic) => setFilters({ topic })}
            />
            <EnumSelect
              label="Filtrar por tipo"
              placeholder="Todos os tipos"
              options={SERMON_TYPE_LABELS}
              value={filters.sermonType}
              onChange={(sermonType) => setFilters({ sermonType })}
            />
          </FilterBar>

          <QueryStates
            query={query}
            skeleton={<TableSkeleton columns={5} />}
            isEmpty={(data) => data.data.length === 0}
            empty={
              <EmptyState
                title="Nenhum sermão encontrado"
                description={
                  hasFilters
                    ? 'Nenhum sermão corresponde aos filtros.'
                    : 'Registre a primeira pregação do acervo.'
                }
                action={
                  hasFilters ? (
                    <Button variant="outline" onClick={clear}>
                      Limpar filtros
                    </Button>
                  ) : (
                    canWrite && (
                      <Button asChild>
                        <Link to="/sermoes/novo">Registrar sermão</Link>
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
                      <TH>Título</TH>
                      <TH>Pregador</TH>
                      <TH>Data</TH>
                      <TH>Tópico</TH>
                      <TH className="text-right">Audiência</TH>
                      <TH className="w-12" />
                    </TR>
                  </THead>
                  <TBody>
                    {data.data.map((sermon) => (
                      <TR key={sermon.id}>
                        <TD className="font-medium">
                          <Link to={`/sermoes/${sermon.id}`} className="hover:text-primary">
                            {sermon.title}
                          </Link>
                          {sermon.youtubeLink && (
                            <Youtube
                              className="ml-2 inline size-4 text-danger"
                              aria-label="Tem vídeo no YouTube"
                            />
                          )}
                        </TD>
                        <TD className="text-content-muted">{sermon.preacher ?? '—'}</TD>
                        <TD className="text-content-muted">{formatDate(sermon.sermonDate)}</TD>
                        <TD className="text-content-muted">{SERMON_TOPIC_LABELS[sermon.topic]}</TD>
                        <TD className="text-right text-content-muted">
                          <span className="inline-flex items-center gap-3">
                            <span className="inline-flex items-center gap-1">
                              <Eye className="size-3.5" aria-hidden />
                              {sermon.viewCount}
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <Heart className="size-3.5" aria-hidden />
                              {sermon.likes}
                            </span>
                          </span>
                        </TD>
                        <TD>
                          <DropdownMenu>
                            <RowActionsTrigger label={`Ações de ${sermon.title}`} />
                            <DropdownMenuContent>
                              <DropdownMenuItem onSelect={() => void navigate(`/sermoes/${sermon.id}`)}>
                                Ver sermão
                              </DropdownMenuItem>
                              {canWrite && (
                                <>
                                  <DropdownMenuItem
                                    onSelect={() => void navigate(`/sermoes/${sermon.id}/editar`)}
                                  >
                                    <Pencil aria-hidden />
                                    Editar
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    destructive
                                    onSelect={() => setPendingDelete(sermon)}
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

        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Flame className="size-4 text-warning" aria-hidden />
              Em alta no mês
            </CardTitle>
          </CardHeader>

          <QueryStates
            query={trending}
            skeleton={<CardSkeleton rows={4} />}
            isEmpty={(data) => data.trending.length === 0}
            empty={<EmptyState title="Sem dados de audiência ainda" />}
          >
            {(data) => (
              <ol className="divide-y divide-border-subtle">
                {data.trending.map((item) => (
                  <li key={item.id} className="flex items-start gap-3 px-5 py-3">
                    <Badge tone="info">{item.rank}</Badge>
                    <div className="min-w-0 flex-1">
                      <Link
                        to={`/sermoes/${item.id}`}
                        className="block truncate text-sm font-medium text-content hover:text-primary"
                      >
                        {item.title}
                      </Link>
                      <p className="text-xs text-content-muted">
                        {item.preacher ?? '—'} · {item.viewCount} visualizações · {item.likes} curtidas
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </QueryStates>
        </Card>
      </div>

      <ConfirmDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title="Excluir sermão"
        description={`"${pendingDelete?.title ?? ''}" sai do acervo e do aplicativo dos membros. O registro é mantido no banco (exclusão lógica).`}
        confirmLabel="Excluir"
        loading={deleteSermon.isPending}
        onConfirm={() => void confirmDelete()}
      />
    </div>
  )
}
