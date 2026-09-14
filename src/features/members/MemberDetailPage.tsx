import { useState } from 'react'
import { Link, useParams } from 'react-router'
import { ArrowLeft, Pencil, Plus } from 'lucide-react'
import { useMember } from './members.queries'
import { useSession } from '@/features/auth/useSession'
import { usePastoralCare } from '@/features/pastoral-care/pastoral-care.queries'
import { PastoralRecordDialog } from '@/features/pastoral-care/PastoralRecordDialog'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card, CardBody, CardHeader, CardTitle } from '@/shared/ui/card'
import { DetailItem, DetailList } from '@/shared/ui/detail-list'
import { PageHeader } from '@/shared/ui/page-header'
import { QueryStates } from '@/shared/ui/query-states'
import { CardSkeleton } from '@/shared/ui/skeleton'
import { EmptyState } from '@/shared/ui/states'
import { formatDate, formatDateTime } from '@/shared/lib/format'
import {
  GENDER_LABELS,
  MARITAL_STATUS_LABELS,
  MEMBER_STATUS_LABELS,
  MEMBER_STATUS_TONES,
  PASTORAL_RECORD_TYPE_LABELS,
  PASTORAL_RECORD_TYPE_TONES,
} from '@/shared/types/labels'

export function MemberDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { can } = useSession()
  const query = useMember(id)

  return (
    <div className="space-y-6">
      <PageHeader
        title={query.data?.fullName ?? 'Membro'}
        description={query.data?.email ?? undefined}
        actions={
          <>
            <Button asChild variant="outline">
              <Link to="/membros">
                <ArrowLeft aria-hidden />
                Voltar
              </Link>
            </Button>
            {can('member.write') && id && (
              <Button asChild>
                <Link to={`/membros/${id}/editar`}>
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
        {(member) => (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Dados gerais</CardTitle>
              </CardHeader>
              <CardBody>
                <DetailList>
                  <DetailItem label="Situação">
                    <Badge tone={MEMBER_STATUS_TONES[member.status]}>
                      {MEMBER_STATUS_LABELS[member.status]}
                    </Badge>
                  </DetailItem>
                  <DetailItem label="Telefone">{member.phone ?? '—'}</DetailItem>
                  <DetailItem label="WhatsApp">{member.whatsapp ?? '—'}</DetailItem>
                  <DetailItem label="Nascimento">{formatDate(member.dateOfBirth)}</DetailItem>
                  <DetailItem label="Gênero">
                    {member.gender ? GENDER_LABELS[member.gender] : '—'}
                  </DetailItem>
                  <DetailItem label="Estado civil">
                    {member.maritalStatus ? MARITAL_STATUS_LABELS[member.maritalStatus] : '—'}
                  </DetailItem>
                </DetailList>
              </CardBody>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Vida eclesiástica</CardTitle>
              </CardHeader>
              <CardBody>
                <DetailList>
                  <DetailItem label="Filiação">{formatDate(member.membershipDate)}</DetailItem>
                  <DetailItem label="Batismo">{formatDate(member.baptizationDate)}</DetailItem>
                  <DetailItem label="Batizado">{member.baptized ? 'Sim' : 'Não'}</DetailItem>
                  <DetailItem label="Célula">
                    {member.cellId ? (
                      <Link to={`/celulas/${member.cellId}`} className="text-primary hover:underline">
                        Ver célula
                      </Link>
                    ) : (
                      'Não participa'
                    )}
                  </DetailItem>
                </DetailList>
              </CardBody>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Endereço e trabalho</CardTitle>
              </CardHeader>
              <CardBody>
                <DetailList>
                  <DetailItem label="Endereço" wide>
                    {[
                      member.address?.street,
                      member.address?.number,
                      member.address?.complement,
                      member.address?.neighborhood,
                    ]
                      .filter(Boolean)
                      .join(', ') || '—'}
                  </DetailItem>
                  <DetailItem label="Cidade">
                    {[member.address?.city, member.address?.state].filter(Boolean).join(' / ') || '—'}
                  </DetailItem>
                  <DetailItem label="CEP">{member.address?.zipCode ?? '—'}</DetailItem>
                  <DetailItem label="Profissão">{member.profession ?? '—'}</DetailItem>
                  <DetailItem label="Empresa">{member.company ?? '—'}</DetailItem>
                  <DetailItem label="Observações" wide>
                    {member.notes ?? '—'}
                  </DetailItem>
                </DetailList>
              </CardBody>
            </Card>

            {can('pastoralCare.read') && id && (
              <PastoralCareSection memberId={id} memberName={member.fullName} />
            )}

            <p className="text-xs text-content-muted">
              Cadastrado em {formatDateTime(member.createdAt)} · atualizado em{' '}
              {formatDateTime(member.updatedAt)}
            </p>
          </div>
        )}
      </QueryStates>
    </div>
  )
}

function PastoralCareSection({
  memberId,
  memberName,
}: {
  memberId: string
  memberName: string
}) {
  const { can } = useSession()
  const [dialogOpen, setDialogOpen] = useState(false)
  const query = usePastoralCare(memberId)
  const canWrite = can('pastoralCare.write')

  return (
    <Card>
      <CardHeader className="flex items-center justify-between gap-4">
        <div>
          <CardTitle>Acompanhamento Pastoral</CardTitle>
          <p className="text-xs text-content-muted">
            Prontuário e histórico de atendimentos, visitas e aconselhamentos.
          </p>
        </div>
        {canWrite && (
          <Button size="sm" onClick={() => setDialogOpen(true)}>
            <Plus aria-hidden />
            Novo registro
          </Button>
        )}
      </CardHeader>

      <CardBody>
        <QueryStates
          query={query}
          skeleton={<CardSkeleton rows={3} />}
          isEmpty={(data) => data.length === 0}
          empty={
            <EmptyState
              title="Nenhum atendimento registrado"
              description="Registre o primeiro atendimento ou visita pastoral para este membro."
              action={
                canWrite && (
                  <Button variant="outline" onClick={() => setDialogOpen(true)}>
                    <Plus aria-hidden />
                    Registrar atendimento
                  </Button>
                )
              }
            />
          }
        >
          {(records) => (
            <div className="relative space-y-6 pl-6 before:absolute before:top-2 before:bottom-2 before:left-2 before:w-0.5 before:bg-border-subtle">
              {records.map((record) => (
                <div key={record.id} className="relative space-y-2">
                  <div className="absolute -left-[1.85rem] top-1.5 size-3 rounded-full border-2 border-surface bg-primary" />
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Badge tone={PASTORAL_RECORD_TYPE_TONES[record.type]}>
                        {PASTORAL_RECORD_TYPE_LABELS[record.type]}
                      </Badge>
                      <span className="font-medium text-sm text-content">{record.subject}</span>
                      {record.confidential && (
                        <Badge tone="warning" className="text-[10px] py-0 px-1.5 font-medium">
                          Confidencial
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-content-muted">
                      <span>{formatDate(record.date)}</span>
                      {record.pastorName && <span>· Pastor: {record.pastorName}</span>}
                    </div>
                  </div>
                  <p className="whitespace-pre-line rounded-lg border border-border-subtle bg-surface-subtle p-3 text-sm text-content-muted">
                    {record.notes}
                  </p>
                </div>
              ))}
            </div>
          )}
        </QueryStates>
      </CardBody>

      <PastoralRecordDialog
        memberId={memberId}
        memberName={memberName}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </Card>
  )
}

