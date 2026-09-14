import { useState } from 'react'
import { Link, useParams } from 'react-router'
import { ArrowLeft, Loader2, Music, Pencil, UserCheck, UserMinus, X } from 'lucide-react'
import {
  useAttendance,
  useRegisterAttendance,
  useRemoveFromScale,
  useScale,
  useScaleMusician,
  useSchedule,
  useUndoAttendance,
  useUpdateScale,
} from './schedules.queries'
import { useMemberOptions, useMusicianOptions } from '@/shared/queries/options.queries'
import { useSession } from '@/features/auth/useSession'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card, CardBody, CardHeader, CardTitle } from '@/shared/ui/card'
import { DetailItem, DetailList } from '@/shared/ui/detail-list'
import { Dialog, DialogClose, DialogContent } from '@/shared/ui/dialog'
import { Input, Select } from '@/shared/ui/input'
import { PageHeader } from '@/shared/ui/page-header'
import { QueryStates } from '@/shared/ui/query-states'
import { CardSkeleton } from '@/shared/ui/skeleton'
import { EmptyState } from '@/shared/ui/states'
import { Checkbox } from '@/shared/ui/textarea'
import { notifyError, notifySuccess } from '@/shared/ui/toast'
import { formatDateTime } from '@/shared/lib/format'
import {
  INSTRUMENT_LABELS,
  SCALE_STATUS_LABELS,
  SCALE_STATUS_TONES,
  SCHEDULE_STATUS_LABELS,
  SCHEDULE_STATUS_TONES,
  SCHEDULE_TYPE_LABELS,
  SCHEDULE_VISIBILITY_LABELS,
} from '@/shared/types/labels'
import type { Instrument, ScaleStatus } from '@/shared/types/domain'

export function ScheduleDetailPage() {
  const { id = '' } = useParams<{ id: string }>()
  const { can } = useSession()
  const query = useSchedule(id)
  const [checkInOpen, setCheckInOpen] = useState(false)
  const [scaleOpen, setScaleOpen] = useState(false)

  return (
    <div className="space-y-6">
      <PageHeader
        title={query.data?.title ?? 'Evento'}
        description={query.data ? SCHEDULE_TYPE_LABELS[query.data.type] : undefined}
        actions={
          <>
            <Button asChild variant="outline">
              <Link to="/agenda">
                <ArrowLeft aria-hidden />
                Voltar
              </Link>
            </Button>
            {can('schedule.write') && (
              <Button asChild>
                <Link to={`/agenda/${id}/editar`}>
                  <Pencil aria-hidden />
                  Editar
                </Link>
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
        {(schedule) => (
          <Card>
            <CardHeader>
              <CardTitle>Informações do evento</CardTitle>
            </CardHeader>
            <CardBody>
              <DetailList>
                <DetailItem label="Situação">
                  <Badge tone={SCHEDULE_STATUS_TONES[schedule.status]}>
                    {SCHEDULE_STATUS_LABELS[schedule.status]}
                  </Badge>
                </DetailItem>
                <DetailItem label="Início">{formatDateTime(schedule.startDateTime)}</DetailItem>
                <DetailItem label="Término">{formatDateTime(schedule.endDateTime)}</DetailItem>
                <DetailItem label="Local">{schedule.location ?? '—'}</DetailItem>
                <DetailItem label="Pregador">
                  {schedule.preacher?.pastorName ?? '—'}
                  {schedule.preacher?.topic ? ` · ${schedule.preacher.topic}` : ''}
                </DetailItem>
                <DetailItem label="Capacidade">
                  {schedule.eventDetails?.capacity ?? 'Sem limite'}
                </DetailItem>
                <DetailItem label="Visibilidade">
                  {schedule.eventDetails?.visibility
                    ? SCHEDULE_VISIBILITY_LABELS[schedule.eventDetails.visibility]
                    : '—'}
                </DetailItem>
                <DetailItem label="Descrição" wide>
                  {schedule.description ?? '—'}
                </DetailItem>
              </DetailList>
            </CardBody>
          </Card>
        )}
      </QueryStates>

      <AttendanceCard scheduleId={id} onOpenCheckIn={() => setCheckInOpen(true)} />
      <ScaleCard scheduleId={id} onOpenScale={() => setScaleOpen(true)} />

      <CheckInDialog scheduleId={id} open={checkInOpen} onOpenChange={setCheckInOpen} />
      <ScaleDialog scheduleId={id} open={scaleOpen} onOpenChange={setScaleOpen} />
    </div>
  )
}

function AttendanceCard({
  scheduleId,
  onOpenCheckIn,
}: {
  scheduleId: string
  onOpenCheckIn: () => void
}) {
  const query = useAttendance(scheduleId)
  const undoAttendance = useUndoAttendance(scheduleId)

  async function undo(memberId: string, memberName: string) {
    try {
      await undoAttendance.mutateAsync(memberId)
      notifySuccess(`Presença de ${memberName} desfeita.`)
    } catch (error) {
      notifyError(error)
    }
  }

  return (
    <Card>
      <CardHeader className="flex items-center justify-between gap-4">
        <CardTitle>
          Presença
          {query.data && (
            <span className="ml-2 text-sm font-normal text-content-muted">
              {query.data.summary.totalAttended}
              {query.data.summary.attendancePercentage !== null &&
                ` · ${query.data.summary.attendancePercentage}% da capacidade`}
            </span>
          )}
        </CardTitle>
        <Button size="sm" onClick={onOpenCheckIn}>
          <UserCheck aria-hidden />
          Registrar presença
        </Button>
      </CardHeader>

      <QueryStates
        query={query}
        skeleton={<CardSkeleton rows={3} />}
        isEmpty={(data) => data.data.length === 0}
        empty={
          <EmptyState
            title="Nenhuma presença registrada"
            description="Registre o check-in dos participantes durante ou depois do evento."
          />
        }
      >
        {(attendance) => (
          <ul className="divide-y divide-border-subtle">
            {attendance.data.map((entry) => (
              <li key={entry.id} className="flex items-center justify-between gap-4 px-5 py-3">
                <div>
                  <p className="text-sm font-medium text-content">{entry.memberName ?? '—'}</p>
                  <p className="text-xs text-content-muted">{formatDateTime(entry.checkInTime)}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  aria-label={`Desfazer presença de ${entry.memberName ?? 'membro'}`}
                  onClick={() => void undo(entry.memberId, entry.memberName ?? 'membro')}
                >
                  <UserMinus aria-hidden />
                  Desfazer
                </Button>
              </li>
            ))}
          </ul>
        )}
      </QueryStates>
    </Card>
  )
}

function ScaleCard({ scheduleId, onOpenScale }: { scheduleId: string; onOpenScale: () => void }) {
  const { can } = useSession()
  const query = useScale(scheduleId)
  const updateScale = useUpdateScale(scheduleId)
  const removeFromScale = useRemoveFromScale(scheduleId)
  const canWrite = can('scale.write')

  async function changeStatus(musicianId: string, status: ScaleStatus) {
    try {
      await updateScale.mutateAsync({ musicianId, status })
    } catch (error) {
      notifyError(error)
    }
  }

  return (
    <Card>
      <CardHeader className="flex items-center justify-between gap-4">
        <CardTitle>Escala de louvor</CardTitle>
        {canWrite && (
          <Button size="sm" variant="outline" onClick={onOpenScale}>
            <Music aria-hidden />
            Escalar músico
          </Button>
        )}
      </CardHeader>

      <QueryStates
        query={query}
        skeleton={<CardSkeleton rows={2} />}
        isEmpty={(data) => data.length === 0}
        empty={<EmptyState title="Ninguém escalado" description="Monte a escala do ministério de música." />}
      >
        {(scale) => (
          <ul className="divide-y divide-border-subtle">
            {scale.map((entry) => (
              <li key={entry.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3">
                <div>
                  <p className="text-sm font-medium text-content">{entry.musicianName ?? '—'}</p>
                  <p className="text-xs text-content-muted">
                    {entry.instrument ? INSTRUMENT_LABELS[entry.instrument] : 'Instrumento não definido'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge tone={SCALE_STATUS_TONES[entry.status]}>
                    {SCALE_STATUS_LABELS[entry.status]}
                  </Badge>
                  {canWrite && (
                    <>
                      <Select
                        className="w-40"
                        aria-label={`Situação de ${entry.musicianName ?? 'músico'} na escala`}
                        value={entry.status}
                        onChange={(event) =>
                          void changeStatus(entry.musicianId, event.target.value as ScaleStatus)
                        }
                      >
                        {Object.entries(SCALE_STATUS_LABELS).map(([value, label]) => (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        ))}
                      </Select>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Remover ${entry.musicianName ?? 'músico'} da escala`}
                        onClick={() => void removeFromScale.mutateAsync(entry.musicianId)}
                      >
                        <X aria-hidden />
                      </Button>
                    </>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </QueryStates>
    </Card>
  )
}

/** Check-in em lote — é assim que a secretaria registra a presença do culto. */
function CheckInDialog({
  scheduleId,
  open,
  onOpenChange,
}: {
  scheduleId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const members = useMemberOptions()
  const registerAttendance = useRegisterAttendance(scheduleId)
  const [selected, setSelected] = useState<string[]>([])
  const [search, setSearch] = useState('')

  const available = (members.data?.data ?? []).filter((member) =>
    member.fullName.toLowerCase().includes(search.trim().toLowerCase()),
  )

  async function confirm() {
    try {
      const result = await registerAttendance.mutateAsync(selected)
      notifySuccess(
        result.alreadyRegistered > 0
          ? `${result.registered} presenças registradas · ${result.alreadyRegistered} já constavam.`
          : `${result.registered} presenças registradas.`,
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
        title="Registrar presença"
        description="O registro é idempotente: quem já tem check-in não é duplicado."
        footer={
          <>
            <DialogClose asChild>
              <Button variant="outline" disabled={registerAttendance.isPending}>
                Cancelar
              </Button>
            </DialogClose>
            <Button
              disabled={selected.length === 0 || registerAttendance.isPending}
              onClick={() => void confirm()}
            >
              {registerAttendance.isPending && <Loader2 className="animate-spin" aria-hidden />}
              Registrar {selected.length > 0 && `(${selected.length})`}
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

function ScaleDialog({
  scheduleId,
  open,
  onOpenChange,
}: {
  scheduleId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const musicians = useMusicianOptions()
  const scaleMusician = useScaleMusician(scheduleId)
  const [musicianId, setMusicianId] = useState('')
  const [instrument, setInstrument] = useState<Instrument | ''>('')

  async function confirm() {
    try {
      await scaleMusician.mutateAsync({
        musicianId,
        instrument: instrument || undefined,
      })
      notifySuccess('Músico escalado.')
      setMusicianId('')
      setInstrument('')
      onOpenChange(false)
    } catch (error) {
      notifyError(error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        title="Escalar músico"
        description="O músico entra como convidado e confirma depois."
        footer={
          <>
            <DialogClose asChild>
              <Button variant="outline" disabled={scaleMusician.isPending}>
                Cancelar
              </Button>
            </DialogClose>
            <Button disabled={!musicianId || scaleMusician.isPending} onClick={() => void confirm()}>
              {scaleMusician.isPending && <Loader2 className="animate-spin" aria-hidden />}
              Escalar
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-content">Músico</span>
            <Select value={musicianId} onChange={(event) => setMusicianId(event.target.value)}>
              <option value="">Selecione</option>
              {musicians.data?.data.map((musician) => (
                <option key={musician.id} value={musician.id}>
                  {musician.memberName ?? 'Sem nome'}
                </option>
              ))}
            </Select>
          </label>

          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-content">Instrumento</span>
            <Select
              value={instrument}
              onChange={(event) => setInstrument(event.target.value as Instrument | '')}
            >
              <option value="">Não definido</option>
              {Object.entries(INSTRUMENT_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </label>
        </div>
      </DialogContent>
    </Dialog>
  )
}
