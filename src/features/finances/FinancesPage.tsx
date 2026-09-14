import { useState } from 'react'
import {
  ArrowDownCircle,
  ArrowUpCircle,
  Calculator,
  List,
  Pencil,
  Plus,
  Trash2,
} from 'lucide-react'
import { FinanceEntryDialog } from './FinanceEntryDialog'
import { useDeleteEntry, useFinancialEntries, useFinancialReport } from './finances.queries'
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
import { StatCard } from '@/shared/ui/stat-card'
import { EmptyState } from '@/shared/ui/states'
import { Table, TBody, TD, TH, THead, TR } from '@/shared/ui/table'
import { notifyError, notifySuccess } from '@/shared/ui/toast'
import { formatDate } from '@/shared/lib/format'
import {
  ENTRY_STATUS_LABELS,
  ENTRY_STATUS_TONES,
  FINANCIAL_TYPE_LABELS,
  MONTH_LABELS,
} from '@/shared/types/labels'
import type { EntryStatus, FinancialEntry, FinancialType } from '@/shared/types/domain'

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

export function FinancesPage() {
  const { can } = useSession()
  const { get, page, setFilters, setPage, clear, hasFilters } = useListFilters()
  
  const [view, setView] = useState<'EXTRACT' | 'REPORT'>('EXTRACT')
  const [formOpen, setFormOpen] = useState(false)
  const [entryToEdit, setEntryToEdit] = useState<FinancialEntry | undefined>(undefined)
  const [pendingDelete, setPendingDelete] = useState<FinancialEntry | null>(null)

  const currentYear = new Date().getFullYear()
  const yearParam = get('year')
  const year = yearParam ? Number(yearParam) : currentYear
  const monthParam = get('month')
  const month = monthParam ? Number(monthParam) : new Date().getMonth() + 1

  const filters = {
    page,
    limit: 20,
    search: get('search'),
    status: get('status') as EntryStatus | undefined,
    type: get('type') as FinancialType | undefined,
    year,
    month,
  }

  const query = useFinancialEntries(filters)
  const reportQuery = useFinancialReport(year, month)
  const deleteEntry = useDeleteEntry()
  const canWrite = can('finance.write')

  function handleOpenForm(entry?: FinancialEntry) {
    setEntryToEdit(entry)
    setFormOpen(true)
  }

  async function confirmDelete() {
    if (!pendingDelete) return
    try {
      await deleteEntry.mutateAsync(pendingDelete.id)
      notifySuccess('Lançamento excluído com sucesso.')
      setPendingDelete(null)
    } catch (error) {
      notifyError(error)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Financeiro"
        description="Gestão de receitas, despesas e relatórios consolidados."
        actions={
          canWrite && (
            <Button onClick={() => handleOpenForm()}>
              <Plus aria-hidden />
              Novo lançamento
            </Button>
          )
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Entradas"
          value={formatCurrency(reportQuery.data?.totalIncome ?? 0)}
          icon={ArrowUpCircle}
          loading={reportQuery.isPending}
        />
        <StatCard
          label="Saídas"
          value={formatCurrency(reportQuery.data?.totalExpense ?? 0)}
          icon={ArrowDownCircle}
          loading={reportQuery.isPending}
        />
        <StatCard
          label="Saldo do Período"
          value={formatCurrency(reportQuery.data?.balance ?? 0)}
          icon={Calculator}
          loading={reportQuery.isPending}
        />
      </div>

      <Card>
        <FilterBar
          searchValue={get('search')}
          searchPlaceholder="Buscar descrição..."
          onSearch={(value) => setFilters({ search: value })}
          onClear={clear}
          showClear={hasFilters}
        >
          <div className="flex bg-surface-muted p-1 rounded-md">
            <Button
              variant={view === 'EXTRACT' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setView('EXTRACT')}
            >
              <List className="size-4 mr-2" />
              Extrato
            </Button>
            <Button
              variant={view === 'REPORT' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setView('REPORT')}
            >
              <Calculator className="size-4 mr-2" />
              DRE
            </Button>
          </div>

          {view === 'EXTRACT' && (
            <EnumSelect
              label="Filtrar por tipo"
              placeholder="Todos os tipos"
              options={FINANCIAL_TYPE_LABELS}
              value={filters.type}
              onChange={(type) => setFilters({ type })}
            />
          )}
          {view === 'EXTRACT' && (
            <EnumSelect
              label="Filtrar por situação"
              placeholder="Todas as situações"
              options={ENTRY_STATUS_LABELS}
              value={filters.status}
              onChange={(status) => setFilters({ status })}
            />
          )}
          
          <EnumSelect
            label="Filtrar por mês"
            placeholder="Mês atual"
            options={MONTH_LABELS}
            value={month}
            onChange={(m) => setFilters({ month: m ? String(m) : undefined })}
          />
        </FilterBar>

        {view === 'EXTRACT' ? (
          <QueryStates
            query={query}
            skeleton={<TableSkeleton columns={7} />}
            isEmpty={(data) => !data?.data?.length}
            empty={
              <EmptyState
                title="Nenhum lançamento encontrado"
                description={
                  hasFilters
                    ? 'Nenhum registro corresponde aos filtros aplicados.'
                    : 'Nenhum lançamento financeiro registrado neste período.'
                }
                action={
                  hasFilters ? (
                    <Button variant="outline" onClick={clear}>
                      Limpar filtros
                    </Button>
                  ) : undefined
                }
              />
            }
          >
            {(data) => (
              <>
                <Table>
                  <THead>
                    <TR>
                      <TH>Data</TH>
                      <TH>Descrição</TH>
                      <TH>Categoria</TH>
                      <TH>Tipo</TH>
                      <TH className="text-right">Valor</TH>
                      <TH>Situação</TH>
                      <TH className="w-12" />
                    </TR>
                  </THead>
                  <TBody>
                    {data?.data?.map((entry) => (
                      <TR key={entry.id}>
                        <TD className="text-content-muted whitespace-nowrap">{formatDate(entry.date)}</TD>
                        <TD className="font-medium max-w-xs truncate" title={entry.description || ''}>
                          {entry.description || 'Sem descrição'}
                        </TD>
                        <TD className="text-content-muted">{entry.categoryName}</TD>
                        <TD>
                          <span className={entry.type === 'INCOME' ? 'text-success font-medium' : 'text-danger font-medium'}>
                            {FINANCIAL_TYPE_LABELS[entry.type]}
                          </span>
                        </TD>
                        <TD className="text-right font-medium">
                          {entry.type === 'EXPENSE' ? '-' : ''}{formatCurrency(entry.amount)}
                        </TD>
                        <TD>
                          <Badge tone={ENTRY_STATUS_TONES[entry.status]}>
                            {ENTRY_STATUS_LABELS[entry.status]}
                          </Badge>
                        </TD>
                        <TD>
                          <div className="flex items-center justify-end">
                            <DropdownMenu>
                              <RowActionsTrigger label="Ações do lançamento" />
                              <DropdownMenuContent>
                                {canWrite && (
                                  <>
                                    <DropdownMenuItem onSelect={() => handleOpenForm(entry)}>
                                      <Pencil aria-hidden />
                                      Editar
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem destructive onSelect={() => setPendingDelete(entry)}>
                                      <Trash2 aria-hidden />
                                      Excluir
                                    </DropdownMenuItem>
                                  </>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TD>
                      </TR>
                    ))}
                  </TBody>
                </Table>
                <Pagination meta={data.pagination} onPageChange={setPage} />
              </>
            )}
          </QueryStates>
        ) : (
          <QueryStates
            query={reportQuery}
            skeleton={<div className="p-8"><TableSkeleton columns={2} rows={5} /></div>}
            isEmpty={(data) => !data?.incomesByCategory?.length && !data?.expensesByCategory?.length}
            empty={
              <EmptyState
                title="Relatório Vazio"
                description="Não há lançamentos financeiros para gerar o DRE neste período."
              />
            }
          >
            {(data) => (
              <div className="p-6 md:p-8 space-y-8">
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg text-success flex items-center gap-2">
                    <ArrowUpCircle className="size-5" />
                    Receitas
                  </h3>
                  <div className="rounded-lg border border-border-subtle divide-y divide-border-subtle overflow-hidden">
                    {data?.incomesByCategory?.map(cat => (
                      <div key={cat.categoryId} className="flex justify-between p-3 hover:bg-surface-muted/50">
                        <span className="text-content-muted">{cat.categoryName}</span>
                        <span className="font-medium text-success">{formatCurrency(cat.amount)}</span>
                      </div>
                    ))}
                    <div className="flex justify-between p-4 bg-success-subtle/20">
                      <span className="font-semibold text-content">Total de Entradas</span>
                      <span className="font-bold text-success">{formatCurrency(data.totalIncome)}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-lg text-danger flex items-center gap-2">
                    <ArrowDownCircle className="size-5" />
                    Despesas
                  </h3>
                  <div className="rounded-lg border border-border-subtle divide-y divide-border-subtle overflow-hidden">
                    {data?.expensesByCategory?.map(cat => (
                      <div key={cat.categoryId} className="flex justify-between p-3 hover:bg-surface-muted/50">
                        <span className="text-content-muted">{cat.categoryName}</span>
                        <span className="font-medium text-danger">-{formatCurrency(cat.amount)}</span>
                      </div>
                    ))}
                    <div className="flex justify-between p-4 bg-danger-subtle/20">
                      <span className="font-semibold text-content">Total de Saídas</span>
                      <span className="font-bold text-danger">-{formatCurrency(data.totalExpense)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between p-5 rounded-lg bg-primary/5 border border-primary/20">
                  <span className="font-bold text-xl text-content">Saldo Final Consolidado</span>
                  <span className={`font-bold text-xl ${data.balance >= 0 ? 'text-success' : 'text-danger'}`}>
                    {formatCurrency(data.balance)}
                  </span>
                </div>
              </div>
            )}
          </QueryStates>
        )}
      </Card>

      <FinanceEntryDialog 
        open={formOpen} 
        onOpenChange={(open) => {
          setFormOpen(open)
          if (!open) setEntryToEdit(undefined)
        }} 
        entry={entryToEdit} 
      />

      <ConfirmDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title="Excluir lançamento"
        description={`O lançamento de ${pendingDelete?.amount ? formatCurrency(pendingDelete.amount) : ''} será apagado. Esta operação não pode ser desfeita e afetará os relatórios imediatamente.`}
        confirmLabel="Excluir"
        loading={deleteEntry.isPending}
        onConfirm={() => void confirmDelete()}
      />
    </div>
  )
}
