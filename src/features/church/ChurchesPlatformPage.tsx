import { useState } from 'react'
import { Loader2, Plus, Trash2 } from 'lucide-react'
import { z } from 'zod'
import { useChurches, useCreateChurch, useDeleteChurch } from './church.queries'
import { useListFilters } from '@/shared/hooks/use-list-filters'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card } from '@/shared/ui/card'
import { ConfirmDialog } from '@/shared/ui/confirm-dialog'
import { Dialog, DialogClose, DialogContent } from '@/shared/ui/dialog'
import { Field } from '@/shared/ui/field'
import { FilterBar } from '@/shared/ui/filter-bar'
import { Input, Select } from '@/shared/ui/input'
import { PageHeader } from '@/shared/ui/page-header'
import { Pagination } from '@/shared/ui/pagination'
import { QueryStates } from '@/shared/ui/query-states'
import { TableSkeleton } from '@/shared/ui/skeleton'
import { EmptyState } from '@/shared/ui/states'
import { Table, TBody, TD, TH, THead, TR } from '@/shared/ui/table'
import { notifyError, notifySuccess } from '@/shared/ui/toast'
import { useApiForm } from '@/shared/lib/use-api-form'
import { blankToUndefined, selectToUndefined } from '@/shared/lib/payload'
import { formatDate } from '@/shared/lib/format'
import { DENOMINATION_LABELS } from '@/shared/types/labels'
import type { ChurchSummary, Denomination } from '@/shared/types/domain'

const newChurchSchema = z.object({
  name: z.string().trim().min(3, 'Mínimo de 3 caracteres').max(255),
  denomination: z.string().trim().optional().or(z.literal('')),
  foundationDate: z.string().trim().optional().or(z.literal('')),
  city: z.string().trim().optional().or(z.literal('')),
  state: z.string().trim().optional().or(z.literal('')),
})

type NewChurchValues = z.infer<typeof newChurchSchema>

/**
 * Console de plataforma: as únicas rotas cross-tenant da API
 * (`SUPER_ADMIN`, ADR-004 R7 do backend). Nenhuma outra tela do sistema
 * enxerga mais de uma igreja.
 */
export function ChurchesPlatformPage() {
  const { get, page, setFilters, setPage, clear, hasFilters } = useListFilters()
  const [createOpen, setCreateOpen] = useState(false)
  const [pendingDelete, setPendingDelete] = useState<ChurchSummary | null>(null)

  const query = useChurches({ page, limit: 20, search: get('search') })
  const createChurch = useCreateChurch()
  const deleteChurch = useDeleteChurch()

  const form = useApiForm<NewChurchValues>({
    schema: newChurchSchema,
    defaultValues: { name: '', denomination: '', foundationDate: '', city: '', state: '' },
    onSubmit: async (values) => {
      const address = {
        city: blankToUndefined(values.city),
        state: blankToUndefined(values.state),
      }
      await createChurch.mutateAsync({
        name: values.name.trim(),
        denomination: selectToUndefined<Denomination>(values.denomination),
        foundationDate: blankToUndefined(values.foundationDate),
        address: Object.values(address).some(Boolean) ? address : undefined,
      })
    },
    onSuccess: () => {
      notifySuccess('Igreja criada.')
      form.reset()
      setCreateOpen(false)
    },
  })

  async function confirmDelete() {
    if (!pendingDelete) return
    try {
      await deleteChurch.mutateAsync(pendingDelete.id)
      notifySuccess(`${pendingDelete.name} foi desativada.`)
      setPendingDelete(null)
    } catch (error) {
      notifyError(error)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Igrejas da plataforma"
        description="Operação cross-tenant, disponível apenas para a administração da plataforma."
        actions={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus aria-hidden />
            Nova igreja
          </Button>
        }
      />

      <Card>
        <FilterBar
          searchValue={get('search')}
          searchPlaceholder="Buscar por nome"
          onSearch={(value) => setFilters({ search: value })}
          onClear={clear}
          showClear={hasFilters}
        />

        <QueryStates
          query={query}
          skeleton={<TableSkeleton columns={5} />}
          isEmpty={(data) => data.data.length === 0}
          empty={<EmptyState title="Nenhuma igreja cadastrada" />}
        >
          {(data) => (
            <>
              <Table>
                <THead>
                  <TR>
                    <TH>Nome</TH>
                    <TH>Denominação</TH>
                    <TH>Cidade</TH>
                    <TH>Situação</TH>
                    <TH>Criada em</TH>
                    <TH className="w-12" />
                  </TR>
                </THead>
                <TBody>
                  {data.data.map((church) => (
                    <TR key={church.id}>
                      <TD className="font-medium">{church.name}</TD>
                      <TD className="text-content-muted">
                        {church.denomination ? DENOMINATION_LABELS[church.denomination] : '—'}
                      </TD>
                      <TD className="text-content-muted">{church.city ?? '—'}</TD>
                      <TD>
                        <Badge tone={church.status === 'ACTIVE' ? 'success' : 'neutral'}>
                          {church.status === 'ACTIVE' ? 'Ativa' : 'Inativa'}
                        </Badge>
                      </TD>
                      <TD className="text-content-muted">{formatDate(church.createdAt.slice(0, 10))}</TD>
                      <TD>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={`Desativar ${church.name}`}
                          onClick={() => setPendingDelete(church)}
                        >
                          <Trash2 aria-hidden />
                        </Button>
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

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent
          title="Nova igreja"
          description="O administrador da igreja é vinculado depois, pelo cadastro de usuários."
          footer={
            <>
              <DialogClose asChild>
                <Button variant="outline" disabled={form.submitting}>
                  Cancelar
                </Button>
              </DialogClose>
              <Button form="new-church-form" type="submit" disabled={form.submitting}>
                {form.submitting && <Loader2 className="animate-spin" aria-hidden />}
                Criar igreja
              </Button>
            </>
          }
        >
          <form
            id="new-church-form"
            className="grid gap-4 sm:grid-cols-2"
            onSubmit={(event) => void form.submit(event)}
            noValidate
          >
            <div className="sm:col-span-2">
              <Field label="Nome" required error={form.formState.errors.name?.message}>
                {(field) => <Input {...field} {...form.register('name')} />}
              </Field>
            </div>
            <Field label="Denominação">
              {(field) => (
                <Select {...field} {...form.register('denomination')}>
                  <option value="">Não informada</option>
                  {Object.entries(DENOMINATION_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </Select>
              )}
            </Field>
            <Field label="Data de fundação">
              {(field) => <Input type="date" {...field} {...form.register('foundationDate')} />}
            </Field>
            <Field label="Cidade">{(field) => <Input {...field} {...form.register('city')} />}</Field>
            <Field label="Estado">
              {(field) => <Input maxLength={2} {...field} {...form.register('state')} />}
            </Field>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title="Desativar igreja"
        description={`${pendingDelete?.name ?? ''} sai das listagens e seus usuários perdem acesso. O dado permanece no banco (exclusão lógica).`}
        confirmLabel="Desativar"
        loading={deleteChurch.isPending}
        onConfirm={() => void confirmDelete()}
      />
    </div>
  )
}
