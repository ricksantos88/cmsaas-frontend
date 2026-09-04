import { useState } from 'react'
import { Link, useParams } from 'react-router'
import { ArrowLeft, Pencil } from 'lucide-react'
import { useMusician } from './musicians.queries'
import { MusicianFormDialog } from './MusicianFormDialog'
import { useSession } from '@/features/auth/useSession'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card, CardBody, CardHeader, CardTitle } from '@/shared/ui/card'
import { DetailItem, DetailList } from '@/shared/ui/detail-list'
import { PageHeader } from '@/shared/ui/page-header'
import { QueryStates } from '@/shared/ui/query-states'
import { CardSkeleton } from '@/shared/ui/skeleton'
import {
  DAY_LABELS,
  INSTRUMENT_LABELS,
  MINISTRY_ROLE_LABELS,
  MUSICIAN_STATUS_LABELS,
  MUSICIAN_STATUS_TONES,
  SKILL_LEVEL_LABELS,
  VOICE_TYPE_LABELS,
} from '@/shared/types/labels'

export function MusicianDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { can } = useSession()
  const query = useMusician(id)
  const [editOpen, setEditOpen] = useState(false)

  return (
    <div className="space-y-6">
      <PageHeader
        title={query.data?.member?.fullName ?? 'Músico'}
        description={query.data ? MINISTRY_ROLE_LABELS[query.data.ministryRole] : undefined}
        actions={
          <>
            <Button asChild variant="outline">
              <Link to="/musicos">
                <ArrowLeft aria-hidden />
                Voltar
              </Link>
            </Button>
            {can('musician.write') && (
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
            <CardSkeleton rows={5} />
          </Card>
        }
      >
        {(musician) => (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Ministério</CardTitle>
              </CardHeader>
              <CardBody>
                <DetailList>
                  <DetailItem label="Situação">
                    <Badge tone={MUSICIAN_STATUS_TONES[musician.status]}>
                      {MUSICIAN_STATUS_LABELS[musician.status]}
                    </Badge>
                  </DetailItem>
                  <DetailItem label="Função">
                    {MINISTRY_ROLE_LABELS[musician.ministryRole]}
                  </DetailItem>
                  <DetailItem label="Ministra louvor">
                    {musician.isWorshipLeader ? 'Sim' : 'Não'}
                  </DetailItem>
                  <DetailItem label="Canta">{musician.canSing ? 'Sim' : 'Não'}</DetailItem>
                  <DetailItem label="Tipo de voz">
                    {musician.voiceType ? VOICE_TYPE_LABELS[musician.voiceType] : '—'}
                  </DetailItem>
                  <DetailItem label="Membro">
                    {musician.member ? (
                      <Link
                        to={`/membros/${musician.member.id}`}
                        className="text-primary hover:underline"
                      >
                        {musician.member.fullName}
                      </Link>
                    ) : (
                      '—'
                    )}
                  </DetailItem>
                </DetailList>
              </CardBody>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Instrumentos e disponibilidade</CardTitle>
              </CardHeader>
              <CardBody>
                <DetailList>
                  <DetailItem label="Instrumentos" wide>
                    {musician.instruments.length > 0 ? (
                      <span className="flex flex-wrap gap-1.5">
                        {musician.instruments.map((item) => (
                          <Badge key={item.instrument} tone={item.primary ? 'info' : 'neutral'}>
                            {INSTRUMENT_LABELS[item.instrument]}
                            {item.skillLevel ? ` · ${SKILL_LEVEL_LABELS[item.skillLevel]}` : ''}
                            {item.primary ? ' · principal' : ''}
                          </Badge>
                        ))}
                      </span>
                    ) : (
                      '—'
                    )}
                  </DetailItem>
                  <DetailItem label="Dias disponíveis" wide>
                    {musician.availability?.daysAvailable.length
                      ? musician.availability.daysAvailable.map((day) => DAY_LABELS[day]).join(' · ')
                      : '—'}
                  </DetailItem>
                  <DetailItem label="Observações" wide>
                    {musician.availability?.notes ?? '—'}
                  </DetailItem>
                </DetailList>
              </CardBody>
            </Card>

            <MusicianFormDialog open={editOpen} onOpenChange={setEditOpen} musician={musician} />
          </div>
        )}
      </QueryStates>
    </div>
  )
}
