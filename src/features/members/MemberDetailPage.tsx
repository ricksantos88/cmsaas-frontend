import { Link, useParams } from 'react-router'
import { ArrowLeft, Pencil } from 'lucide-react'
import { useMember } from './members.queries'
import { useSession } from '@/features/auth/useSession'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card, CardBody, CardHeader, CardTitle } from '@/shared/ui/card'
import { DetailItem, DetailList } from '@/shared/ui/detail-list'
import { PageHeader } from '@/shared/ui/page-header'
import { QueryStates } from '@/shared/ui/query-states'
import { CardSkeleton } from '@/shared/ui/skeleton'
import { formatDate, formatDateTime } from '@/shared/lib/format'
import {
  GENDER_LABELS,
  MARITAL_STATUS_LABELS,
  MEMBER_STATUS_LABELS,
  MEMBER_STATUS_TONES,
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
