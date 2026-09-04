import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { Boxes, CircleDollarSign, Pencil, Plus, Trash2, Wrench } from 'lucide-react'
import { useAsset, useAssets, useAssetsSummary, useDeleteAsset } from './assets.queries'
import { AssetFormDialog } from './AssetFormDialog'
import { MaintenanceDialog } from './MaintenanceDialog'
import type { AssetFilters } from './assets.api'
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
import { StatCard } from '@/shared/ui/stat-card'
import { EmptyState } from '@/shared/ui/states'
import { Table, TBody, TD, TH, THead, TR } from '@/shared/ui/table'
import { notifyError, notifySuccess } from '@/shared/ui/toast'
import { formatCurrency } from '@/shared/lib/format'
import {
  ASSET_CATEGORY_LABELS,
  ASSET_CONDITION_LABELS,
  ASSET_CONDITION_TONES,
  ASSET_STATUS_LABELS,
  ASSET_STATUS_TONES,
} from '@/shared/types/labels'
import type { AssetCategory, AssetStatus, AssetSummary } from '@/shared/types/domain'

/**
 * Patrimônio: a rota inteira é restrita ao administrativo e à tesouraria — a
 * tela mostra valores financeiros (ADR-005 R3 e `asset.md` → Segurança).
 */
export function AssetsPage() {
  const navigate = useNavigate()
  const { get, page, setFilters, setPage, clear, hasFilters } = useListFilters()
  const [formOpen, setFormOpen] = useState(false)
  const [maintenanceOpen, setMaintenanceOpen] = useState(false)
  const [selectedId, setSelectedId] = useState<string | undefined>()
  const [pendingDelete, setPendingDelete] = useState<AssetSummary | null>(null)

  const filters: AssetFilters = {
    page,
    limit: 20,
    search: get('search'),
    category: get('category') as AssetCategory | undefined,
    status: get('status') as AssetStatus | undefined,
  }

  const query = useAssets(filters)
  const summary = useAssetsSummary()
  const selected = useAsset(selectedId)
  const deleteAsset = useDeleteAsset()

  async function confirmDelete() {
    if (!pendingDelete) return
    try {
      await deleteAsset.mutateAsync(pendingDelete.id)
      notifySuccess(`${pendingDelete.name} foi baixado do patrimônio.`)
      setPendingDelete(null)
    } catch (error) {
      notifyError(error)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Patrimônio"
        description="Bens da igreja, estado de conservação e manutenção."
        actions={
          <Button
            onClick={() => {
              setSelectedId(undefined)
              setFormOpen(true)
            }}
          >
            <Plus aria-hidden />
            Novo item
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label="Itens ativos"
          value={summary.data?.totalItems}
          icon={Boxes}
          loading={summary.isPending}
        />
        <StatCard
          label="Valor total"
          value={formatCurrency(summary.data?.totalValue, summary.data?.currency ?? 'BRL')}
          icon={CircleDollarSign}
          loading={summary.isPending}
        />
        <StatCard
          label="Manutenção em 30 dias"
          value={summary.data?.maintenanceDueSoon}
          hint="Itens com manutenção prevista para o próximo mês."
          icon={Wrench}
          loading={summary.isPending}
        />
      </div>

      <Card>
        <FilterBar
          searchValue={get('search')}
          searchPlaceholder="Buscar por nome, etiqueta ou série"
          onSearch={(value) => setFilters({ search: value })}
          onClear={clear}
          showClear={hasFilters}
        >
          <EnumSelect
            label="Filtrar por categoria"
            placeholder="Todas as categorias"
            options={ASSET_CATEGORY_LABELS}
            value={filters.category}
            onChange={(category) => setFilters({ category })}
          />
          <EnumSelect
            label="Filtrar por situação"
            placeholder="Todas as situações"
            options={ASSET_STATUS_LABELS}
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
              title="Nenhum item encontrado"
              description={
                hasFilters
                  ? 'Nenhum item corresponde aos filtros.'
                  : 'Cadastre instrumentos, equipamentos e móveis da igreja.'
              }
              action={
                hasFilters ? (
                  <Button variant="outline" onClick={clear}>
                    Limpar filtros
                  </Button>
                ) : (
                  <Button onClick={() => setFormOpen(true)}>Cadastrar item</Button>
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
                    <TH>Item</TH>
                    <TH>Categoria</TH>
                    <TH>Local</TH>
                    <TH>Responsável</TH>
                    <TH>Estado</TH>
                    <TH className="text-right">Valor</TH>
                    <TH>Situação</TH>
                    <TH className="w-12" />
                  </TR>
                </THead>
                <TBody>
                  {data.data.map((asset) => (
                    <TR key={asset.id}>
                      <TD className="font-medium">
                        <Link to={`/patrimonio/${asset.id}`} className="hover:text-primary">
                          {asset.name}
                        </Link>
                        {asset.assetTag && (
                          <span className="ml-2 font-mono text-xs text-content-muted">
                            {asset.assetTag}
                          </span>
                        )}
                      </TD>
                      <TD className="text-content-muted">{ASSET_CATEGORY_LABELS[asset.category]}</TD>
                      <TD className="text-content-muted">{asset.location ?? '—'}</TD>
                      <TD className="text-content-muted">{asset.responsibleName ?? '—'}</TD>
                      <TD>
                        <Badge tone={ASSET_CONDITION_TONES[asset.condition]}>
                          {ASSET_CONDITION_LABELS[asset.condition]}
                        </Badge>
                      </TD>
                      <TD className="text-right text-content-muted">
                        {formatCurrency(asset.currentValue)}
                      </TD>
                      <TD>
                        <Badge tone={ASSET_STATUS_TONES[asset.status]}>
                          {ASSET_STATUS_LABELS[asset.status]}
                        </Badge>
                      </TD>
                      <TD>
                        <DropdownMenu>
                          <RowActionsTrigger label={`Ações de ${asset.name}`} />
                          <DropdownMenuContent>
                            <DropdownMenuItem onSelect={() => void navigate(`/patrimonio/${asset.id}`)}>
                              Ver detalhes
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onSelect={() => {
                                setSelectedId(asset.id)
                                setFormOpen(true)
                              }}
                            >
                              <Pencil aria-hidden />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onSelect={() => {
                                setSelectedId(asset.id)
                                setMaintenanceOpen(true)
                              }}
                            >
                              <Wrench aria-hidden />
                              Registrar manutenção
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem destructive onSelect={() => setPendingDelete(asset)}>
                              <Trash2 aria-hidden />
                              Dar baixa
                            </DropdownMenuItem>
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

      <AssetFormDialog
        open={formOpen && (!selectedId || Boolean(selected.data))}
        onOpenChange={setFormOpen}
        asset={selectedId ? selected.data : undefined}
      />

      {selected.data && (
        <MaintenanceDialog
          asset={selected.data}
          open={maintenanceOpen}
          onOpenChange={setMaintenanceOpen}
        />
      )}

      <ConfirmDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title="Dar baixa no item"
        description={`${pendingDelete?.name ?? 'O item'} passa para a situação "Baixado" e sai da listagem e do resumo. O histórico de manutenção e movimentação é preservado.`}
        confirmLabel="Dar baixa"
        loading={deleteAsset.isPending}
        onConfirm={() => void confirmDelete()}
      />
    </div>
  )
}
