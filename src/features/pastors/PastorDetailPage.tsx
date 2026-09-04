import { useState } from 'react'
import { Link, useParams } from 'react-router'
import { ArrowLeft, Pencil } from 'lucide-react'
import { usePastor, usePastorContacts } from './pastors.queries'
import { PastorFormDialog } from './PastorFormDialog'
import { useSession } from '@/features/auth/useSession'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card, CardBody, CardHeader, CardTitle } from '@/shared/ui/card'
import { DetailItem, DetailList } from '@/shared/ui/detail-list'
import { PageHeader } from '@/shared/ui/page-header'
import { QueryStates } from '@/shared/ui/query-states'
import { CardSkeleton } from '@/shared/ui/skeleton'
import { formatDate } from '@/shared/lib/format'
import {
  CONTACT_VISIBILITY_LABELS,
  DAY_LABELS,
  PASTOR_ROLE_LABELS,
  PASTOR_STATUS_LABELS,
  PASTOR_STATUS_TONES,
} from '@/shared/types/labels'

export function PastorDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { can } = useSession()
  const query = usePastor(id)
  // Endpoint separado de propósito: o backend decide o que este usuário pode ver.
  const contacts = usePastorContacts(id)
  const [editOpen, setEditOpen] = useState(false)

  return (
    <div className="space-y-6">
      <PageHeader
        title={query.data?.name ?? 'Pastor'}
        description={query.data ? PASTOR_ROLE_LABELS[query.data.role] : undefined}
        actions={
          <>
            <Button asChild variant="outline">
              <Link to="/pastores">
                <ArrowLeft aria-hidden />
                Voltar
              </Link>
            </Button>
            {can('pastor.write') && (
              <Button onClick={() => setEditOpen(true)}>
                <Pencil aria-hidden />
                Editar
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
        {(pastor) => (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Dados pastorais</CardTitle>
              </CardHeader>
              <CardBody className="space-y-4">
                <DetailList>
                  <DetailItem label="Situação">
                    <Badge tone={PASTOR_STATUS_TONES[pastor.status]}>
                      {PASTOR_STATUS_LABELS[pastor.status]}
                    </Badge>
                  </DetailItem>
                  <DetailItem label="Cargo">{pastor.position ?? '—'}</DetailItem>
                  <DetailItem label="Ordenação">{formatDate(pastor.ordainmentDate)}</DetailItem>
                  <DetailItem label="Nascimento">{formatDate(pastor.dateOfBirth)}</DetailItem>
                  <DetailItem label="Especializações" wide>
                    {pastor.specializations.length > 0 ? (
                      <span className="flex flex-wrap gap-1.5">
                        {pastor.specializations.map((item) => (
                          <Badge key={item}>{item}</Badge>
                        ))}
                      </span>
                    ) : (
                      '—'
                    )}
                  </DetailItem>
                  <DetailItem label="Biografia" wide>
                    {pastor.biography ?? '—'}
                  </DetailItem>
                </DetailList>
              </CardBody>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Contatos</CardTitle>
              </CardHeader>

              <QueryStates query={contacts} skeleton={<CardSkeleton rows={3} />}>
                {(data) => (
                  <CardBody>
                    <DetailList>
                      <DetailItem label="E-mail">{data.email ?? 'Não disponível para você'}</DetailItem>
                      <DetailItem label="Telefone">{data.phone ?? 'Não disponível para você'}</DetailItem>
                      <DetailItem label="Visibilidade">
                        {CONTACT_VISIBILITY_LABELS[data.visibilityLevel]}
                      </DetailItem>
                      <DetailItem label="Dias de atendimento" wide>
                        {data.workSchedule?.daysAvailable.length
                          ? data.workSchedule.daysAvailable.map((day) => DAY_LABELS[day]).join(' · ')
                          : '—'}
                      </DetailItem>
                      <DetailItem label="Horário">
                        {data.workSchedule?.startTime
                          ? `${data.workSchedule.startTime.slice(0, 5)} às ${data.workSchedule.endTime?.slice(0, 5) ?? '—'}`
                          : '—'}
                      </DetailItem>
                    </DetailList>
                  </CardBody>
                )}
              </QueryStates>
            </Card>

            <PastorFormDialog open={editOpen} onOpenChange={setEditOpen} pastor={pastor} />
          </div>
        )}
      </QueryStates>
    </div>
  )
}
