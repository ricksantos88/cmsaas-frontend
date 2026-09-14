import { useState } from 'react'
import { Link, useParams } from 'react-router'
import { ArrowLeft, Loader2, UserMinus, UserPlus } from 'lucide-react'
import { useAddCellMembers, useCell, useRemoveCellMember } from './cells.queries'
import { useMemberOptions } from '@/shared/queries/options.queries'
import { useSession } from '@/features/auth/useSession'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card, CardBody, CardHeader, CardTitle } from '@/shared/ui/card'
import { ConfirmDialog } from '@/shared/ui/confirm-dialog'
import { DetailItem, DetailList } from '@/shared/ui/detail-list'
import { Dialog, DialogClose, DialogContent } from '@/shared/ui/dialog'
import { Input } from '@/shared/ui/input'
import { PageHeader } from '@/shared/ui/page-header'
import { QueryStates } from '@/shared/ui/query-states'
import { CardSkeleton } from '@/shared/ui/skeleton'
import { EmptyState } from '@/shared/ui/states'
import { Checkbox } from '@/shared/ui/textarea'
import { notifyError, notifySuccess } from '@/shared/ui/toast'
import {
  CELL_STATUS_LABELS,
  CELL_STATUS_TONES,
  DAY_LABELS,
  MEETING_FREQUENCY_LABELS,
} from '@/shared/types/labels'

export function CellDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { can } = useSession()
  const query = useCell(id)
  const [addOpen, setAddOpen] = useState(false)
  const [pendingRemove, setPendingRemove] = useState<{ id: string; fullName: string } | null>(null)

  const removeMember = useRemoveCellMember(id ?? '')
  const canWrite = can('cell.write')

  async function confirmRemove() {
    if (!pendingRemove) return
    try {
      await removeMember.mutateAsync(pendingRemove.id)
      notifySuccess(`${pendingRemove.fullName} saiu da célula.`)
      setPendingRemove(null)
    } catch (error) {
      notifyError(error)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={query.data?.name ?? 'Célula'}
        description={query.data?.description ?? undefined}
        actions={
          <>
            <Button asChild variant="outline">
              <Link to="/celulas">
                <ArrowLeft aria-hidden />
                Voltar
              </Link>
            </Button>
            {canWrite && (
              <Button onClick={() => setAddOpen(true)}>
                <UserPlus aria-hidden />
                Adicionar participantes
              </Button>
            )}
          </>
        }
      />

      <QueryStates
        query={query}
        skeleton={
          <Card>
            <CardSkeleton rows={6} />
          </Card>
        }
      >
        {(cell) => (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informações</CardTitle>
              </CardHeader>
              <CardBody>
                <DetailList>
                  <DetailItem label="Situação">
                    <Badge tone={CELL_STATUS_TONES[cell.status]}>
                      {CELL_STATUS_LABELS[cell.status]}
                    </Badge>
                  </DetailItem>
                  <DetailItem label="Reunião">
                    {cell.meeting?.dayOfWeek
                      ? `${DAY_LABELS[cell.meeting.dayOfWeek]}${cell.meeting.time ? ` às ${cell.meeting.time.slice(0, 5)}` : ''}`
                      : '—'}
                  </DetailItem>
                  <DetailItem label="Frequência">
                    {cell.meeting?.frequency ? MEETING_FREQUENCY_LABELS[cell.meeting.frequency] : '—'}
                  </DetailItem>
                  <DetailItem label="Local" wide>
                    {[cell.address?.street, cell.address?.neighborhood, cell.address?.city]
                      .filter(Boolean)
                      .join(', ') || '—'}
                  </DetailItem>
                </DetailList>
              </CardBody>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Participantes ({cell.memberCount})</CardTitle>
              </CardHeader>

              {cell.members.length === 0 ? (
                <EmptyState
                  title="Nenhum participante"
                  description="Adicione membros à célula para acompanhar as reuniões."
                  action={
                    canWrite && <Button onClick={() => setAddOpen(true)}>Adicionar participantes</Button>
                  }
                />
              ) : (
                <ul className="divide-y divide-border-subtle">
                  {cell.members.map((member) => (
                    <li key={member.id} className="flex items-center justify-between gap-4 px-5 py-3">
                      <Link
                        to={`/membros/${member.id}`}
                        className="text-sm font-medium text-content hover:text-primary"
                      >
                        {member.fullName}
                      </Link>
                      {canWrite && (
                        <Button
                          variant="ghost"
                          size="sm"
                          aria-label={`Remover ${member.fullName} da célula`}
                          onClick={() => setPendingRemove(member)}
                        >
                          <UserMinus aria-hidden />
                          Remover
                        </Button>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>
        )}
      </QueryStates>

      {id && (
        <AddMembersDialog
          cellId={id}
          open={addOpen}
          onOpenChange={setAddOpen}
          currentIds={query.data?.members.map((member) => member.id) ?? []}
        />
      )}

      <ConfirmDialog
        open={pendingRemove !== null}
        onOpenChange={(open) => !open && setPendingRemove(null)}
        title="Remover da célula"
        description={`${pendingRemove?.fullName ?? ''} deixa de participar desta célula. O cadastro do membro não é alterado.`}
        confirmLabel="Remover"
        loading={removeMember.isPending}
        onConfirm={() => void confirmRemove()}
      />
    </div>
  )
}

/** Seleção múltipla em modal: adicionar dez pessoas de uma vez é o caso comum. */
function AddMembersDialog({
  cellId,
  open,
  onOpenChange,
  currentIds,
}: {
  cellId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  currentIds: string[]
}) {
  const members = useMemberOptions()
  const addMembers = useAddCellMembers(cellId)
  const [selected, setSelected] = useState<string[]>([])
  const [search, setSearch] = useState('')

  const available = (members.data?.data ?? []).filter(
    (member) =>
      !currentIds.includes(member.id) &&
      member.fullName.toLowerCase().includes(search.trim().toLowerCase()),
  )

  async function confirm() {
    try {
      await addMembers.mutateAsync(selected)
      notifySuccess(
        selected.length === 1 ? 'Participante adicionado.' : `${selected.length} participantes adicionados.`,
      )
      setSelected([])
      onOpenChange(false)
    } catch (error) {
      notifyError(error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        title="Adicionar participantes"
        description="Um membro só participa de uma célula por vez."
        footer={
          <>
            <DialogClose asChild>
              <Button variant="outline" disabled={addMembers.isPending}>
                Cancelar
              </Button>
            </DialogClose>
            <Button
              disabled={selected.length === 0 || addMembers.isPending}
              onClick={() => void confirm()}
            >
              {addMembers.isPending && <Loader2 className="animate-spin" aria-hidden />}
              Adicionar {selected.length > 0 && `(${selected.length})`}
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <Input
            placeholder="Filtrar membros"
            aria-label="Filtrar membros"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />

          {members.isPending && <CardSkeleton rows={4} />}

          {!members.isPending && available.length === 0 && (
            <p className="py-6 text-center text-sm text-content-muted">
              Nenhum membro disponível para adicionar.
            </p>
          )}

          <ul className="max-h-72 space-y-1 overflow-y-auto">
            {available.map((member) => (
              <li key={member.id}>
                <label className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 text-sm hover:bg-surface-muted">
                  <Checkbox
                    checked={selected.includes(member.id)}
                    onChange={(event) =>
                      setSelected((current) =>
                        event.target.checked
                          ? [...current, member.id]
                          : current.filter((id) => id !== member.id),
                      )
                    }
                  />
                  <span className="text-content">{member.fullName}</span>
                </label>
              </li>
            ))}
          </ul>
        </div>
      </DialogContent>
    </Dialog>
  )
}
