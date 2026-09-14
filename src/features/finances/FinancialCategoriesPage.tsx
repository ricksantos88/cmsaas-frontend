import { useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { useCategoriesOptions, useDeleteCategory } from './finances.queries'
import { useSession } from '@/features/auth/useSession'
import { PageHeader } from '@/shared/ui/page-header'
import { Button } from '@/shared/ui/button'
import { Card } from '@/shared/ui/card'
import { QueryStates } from '@/shared/ui/query-states'
import { EmptyState } from '@/shared/ui/states'
import { Table, THead, TBody, TR, TH, TD } from '@/shared/ui/table'
import { TableSkeleton } from '@/shared/ui/skeleton'
import { Badge } from '@/shared/ui/badge'
import { ConfirmDialog } from '@/shared/ui/confirm-dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  RowActionsTrigger,
} from '@/shared/ui/dropdown-menu'
import { notifyError, notifySuccess } from '@/shared/ui/toast'
import { FINANCIAL_TYPE_LABELS } from '@/shared/types/labels'
import type { Category } from '@/shared/types/domain'
import { CategoryFormDialog } from './CategoryFormDialog'

export function FinancialCategoriesPage() {
  const { can } = useSession()
  const canWrite = can('finance.write')

  const query = useCategoriesOptions()
  const deleteMutation = useDeleteCategory()

  const [formOpen, setFormOpen] = useState(false)
  const [categoryToEdit, setCategoryToEdit] = useState<Category | undefined>(undefined)
  const [pendingDelete, setPendingDelete] = useState<Category | null>(null)

  function handleOpenForm(category?: Category) {
    setCategoryToEdit(category)
    setFormOpen(true)
  }

  async function confirmDelete() {
    if (!pendingDelete) return
    try {
      await deleteMutation.mutateAsync(pendingDelete.id)
      notifySuccess('Categoria excluída com sucesso.')
      setPendingDelete(null)
    } catch (error) {
      notifyError(error)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Configurações Financeiras"
        description="Gerencie as categorias de entradas e saídas do sistema."
        actions={
          canWrite && (
            <Button onClick={() => handleOpenForm()}>
              <Plus aria-hidden />
              Nova categoria
            </Button>
          )
        }
      />

      <Card>
        <QueryStates
          query={query}
          skeleton={<TableSkeleton columns={3} />}
          isEmpty={(categories) => categories.length === 0}
          empty={
            <EmptyState
              title="Nenhuma categoria encontrada"
              description="Você ainda não possui categorias financeiras cadastradas."
            />
          }
        >
          {(categories) => (
            <Table>
              <THead>
                <TR>
                  <TH>Nome da Categoria</TH>
                  <TH>Tipo</TH>
                  <TH className="w-12" />
                </TR>
              </THead>
              <TBody>
                {categories.map((category) => (
                  <TR key={category.id}>
                    <TD className="font-medium text-content">{category.name}</TD>
                    <TD>
                      <Badge tone={category.type === 'INCOME' ? 'success' : 'danger'}>
                        {FINANCIAL_TYPE_LABELS[category.type]}
                      </Badge>
                    </TD>
                    <TD>
                      <div className="flex items-center justify-end">
                        <DropdownMenu>
                          <RowActionsTrigger label="Ações da categoria" />
                          <DropdownMenuContent>
                            {canWrite && (
                              <>
                                <DropdownMenuItem onSelect={() => handleOpenForm(category)}>
                                  <Pencil aria-hidden />
                                  Editar
                                </DropdownMenuItem>
                                {!category.isSystemDefault && (
                                  <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem destructive onSelect={() => setPendingDelete(category)}>
                                      <Trash2 aria-hidden />
                                      Excluir
                                    </DropdownMenuItem>
                                  </>
                                )}
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
          )}
        </QueryStates>
      </Card>

      <CategoryFormDialog
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open)
          if (!open) setCategoryToEdit(undefined)
        }}
        category={categoryToEdit}
      />

      <ConfirmDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title="Excluir categoria"
        description={`A categoria "${pendingDelete?.name}" será apagada. Não será possível recuperá-la.`}
        confirmLabel="Excluir"
        loading={deleteMutation.isPending}
        onConfirm={() => void confirmDelete()}
      />
    </div>
  )
}
