import { useState } from 'react'
import { Calendar, CheckCircle2, Clock, Plus, UserCheck } from 'lucide-react'
import {
  useCancelPastoralVisit,
  usePastoralVisits,
} from './pastoral-visits.queries'
import { PastoralVisitFormDialog } from './PastoralVisitFormDialog'
import { CompleteVisitModal } from './CompleteVisitModal'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { PageHeader } from '@/shared/ui/page-header'
import { notifySuccess } from '@/shared/ui/toast'
import {
  PASTORAL_VISIT_STATUS_LABELS,
  PASTORAL_VISIT_STATUS_TONES,
} from '@/shared/types/labels'
import type { PastoralVisit } from '@/shared/types/domain'

export function PastoralVisitsPage() {
  const { data: visits = [], isLoading } = usePastoralVisits()
  const cancelVisit = useCancelPastoralVisit()

  const [activeTab, setActiveTab] = useState<'SCHEDULED' | 'REQUESTED' | 'COMPLETED'>('SCHEDULED')
  const [formOpen, setFormOpen] = useState(false)
  const [selectedVisitToComplete, setSelectedVisitToComplete] = useState<PastoralVisit | null>(null)

  const filteredVisits = visits.filter((v) => {
    if (activeTab === 'SCHEDULED') return v.status === 'SCHEDULED'
    if (activeTab === 'REQUESTED') return v.status === 'REQUESTED'
    if (activeTab === 'COMPLETED') return v.status === 'COMPLETED' || v.status === 'CANCELLED'
    return true
  })

  const handleCancel = async (id: string) => {
    if (confirm('Deseja realmente cancelar este agendamento de visita?')) {
      await cancelVisit.mutateAsync(id)
      notifySuccess('Agendamento de visita cancelado.')
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Visitas Pastorais"
        description="Gestão de agendamentos, solicitações de membros e prontuário de atendimentos realizados."
        actions={
          <Button onClick={() => setFormOpen(true)}>
            <Plus className="h-4 w-4" aria-hidden />
            Agendar Visita
          </Button>
        }
      />

      {/* Tabs / Filtros */}
      <div className="flex border-b border-border gap-4">
        <button
          type="button"
          onClick={() => setActiveTab('SCHEDULED')}
          className={`pb-3 px-1 text-sm font-medium border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'SCHEDULED'
              ? 'border-primary text-primary'
              : 'border-transparent text-content-muted hover:text-content'
          }`}
        >
          <Calendar className="h-4 w-4" />
          Visitas Agendadas ({visits.filter((v) => v.status === 'SCHEDULED').length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('REQUESTED')}
          className={`pb-3 px-1 text-sm font-medium border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'REQUESTED'
              ? 'border-primary text-primary'
              : 'border-transparent text-content-muted hover:text-content'
          }`}
        >
          <Clock className="h-4 w-4" />
          Solicitações de Membros ({visits.filter((v) => v.status === 'REQUESTED').length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('COMPLETED')}
          className={`pb-3 px-1 text-sm font-medium border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'COMPLETED'
              ? 'border-primary text-primary'
              : 'border-transparent text-content-muted hover:text-content'
          }`}
        >
          <CheckCircle2 className="h-4 w-4" />
          Histórico e Retornos (
          {visits.filter((v) => v.status === 'COMPLETED' || v.status === 'CANCELLED').length})
        </button>
      </div>

      {isLoading ? (
        <div className="p-8 text-center text-content-muted">Carregando visitas pastorais...</div>
      ) : filteredVisits.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-8 text-center text-content-muted">
          Nenhuma visita pastoral encontrada nesta categoria.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredVisits.map((visit) => (
            <div
              key={visit.id}
              className="rounded-lg border border-border bg-surface p-5 shadow-sm space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <Badge tone={PASTORAL_VISIT_STATUS_TONES[visit.status]}>
                    {PASTORAL_VISIT_STATUS_LABELS[visit.status]}
                  </Badge>

                  {visit.requiresReturn && (
                    <Badge tone="warning">Requer Retorno</Badge>
                  )}
                </div>

                <div className="font-semibold text-content text-base">
                  {visit.members.length > 0
                    ? visit.members.map((m) => m.name).join(', ')
                    : 'Membro solicitante'}
                </div>

                <div className="text-sm text-content-muted space-y-1">
                  <div>
                    <span className="font-medium text-content">Motivo:</span> {visit.reason}
                  </div>
                  {visit.scheduledAt && (
                    <div>
                      <span className="font-medium text-content">Data:</span>{' '}
                      {new Date(visit.scheduledAt).toLocaleString('pt-BR')}
                    </div>
                  )}
                  {visit.location && (
                    <div>
                      <span className="font-medium text-content">Local:</span> {visit.location}
                    </div>
                  )}
                  {visit.pastorName && (
                    <div className="flex items-center gap-1">
                      <UserCheck className="h-3.5 w-3.5 text-primary" />
                      <span>{visit.pastorName}</span>
                    </div>
                  )}
                  {visit.summary && (
                    <div className="pt-2 text-xs border-t border-border italic text-content">
                      &quot;{visit.summary}&quot;
                    </div>
                  )}
                </div>
              </div>

              {visit.status === 'SCHEDULED' && (
                <div className="flex items-center gap-2 pt-3 border-t border-border">
                  <Button
                    size="sm"
                    className="w-full"
                    onClick={() => setSelectedVisitToComplete(visit)}
                  >
                    Concluir Visita
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => void handleCancel(visit.id)}
                  >
                    Cancelar
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modais */}
      <PastoralVisitFormDialog open={formOpen} onOpenChange={setFormOpen} />
      <CompleteVisitModal
        visit={selectedVisitToComplete}
        open={Boolean(selectedVisitToComplete)}
        onOpenChange={(open) => !open && setSelectedVisitToComplete(null)}
      />
    </div>
  )
}
