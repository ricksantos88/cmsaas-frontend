import { Link, useParams } from 'react-router'
import { ArrowLeft, Eye, Heart, Pencil } from 'lucide-react'
import { useSermon, useSermonRecommendations } from './sermons.queries'
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
  SERMON_TOPIC_LABELS,
  SERMON_TYPE_LABELS,
  SERMON_VISIBILITY_LABELS,
} from '@/shared/types/labels'

export function SermonDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { can } = useSession()
  const query = useSermon(id)
  const recommendations = useSermonRecommendations(id)

  return (
    <div className="space-y-6">
      <PageHeader
        title={query.data?.title ?? 'Sermão'}
        description={query.data?.preacher?.name ?? undefined}
        actions={
          <>
            <Button asChild variant="outline">
              <Link to="/sermoes">
                <ArrowLeft aria-hidden />
                Voltar
              </Link>
            </Button>
            {can('sermon.write') && id && (
              <Button asChild>
                <Link to={`/sermoes/${id}/editar`}>
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
        {(sermon) => (
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              {/* O embed vem pronto do backend (id validado); nunca renderize HTML do cliente. */}
              {sermon.youtubeEmbedUrl && (
                <Card className="overflow-hidden">
                  <div className="aspect-video w-full">
                    <iframe
                      src={sermon.youtubeEmbedUrl}
                      title={sermon.title}
                      className="size-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <CardTitle>Detalhes</CardTitle>
                </CardHeader>
                <CardBody>
                  <DetailList>
                    <DetailItem label="Data">{formatDate(sermon.sermonDate)}</DetailItem>
                    <DetailItem label="Horário">{sermon.sermonTime?.slice(0, 5) ?? '—'}</DetailItem>
                    <DetailItem label="Duração">
                      {sermon.duration ? `${sermon.duration} min` : '—'}
                    </DetailItem>
                    <DetailItem label="Tópico">{SERMON_TOPIC_LABELS[sermon.topic]}</DetailItem>
                    <DetailItem label="Tipo">{SERMON_TYPE_LABELS[sermon.sermonType]}</DetailItem>
                    <DetailItem label="Visibilidade">
                      {SERMON_VISIBILITY_LABELS[sermon.visibility]}
                    </DetailItem>
                    <DetailItem label="Referências bíblicas" wide>
                      {sermon.bibleReferences.length > 0
                        ? sermon.bibleReferences
                            .map(
                              (reference) =>
                                `${reference.book} ${reference.chapter}${reference.verses ? `:${reference.verses}` : ''}`,
                            )
                            .join(' · ')
                        : '—'}
                    </DetailItem>
                    <DetailItem label="Descrição" wide>
                      {sermon.description ?? '—'}
                    </DetailItem>
                  </DetailList>

                  {sermon.keywords.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {sermon.keywords.map((keyword) => (
                        <Badge key={keyword}>{keyword}</Badge>
                      ))}
                    </div>
                  )}
                </CardBody>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Audiência</CardTitle>
                </CardHeader>
                <CardBody className="flex gap-6">
                  <div className="flex items-center gap-2 text-sm text-content">
                    <Eye className="size-4 text-content-muted" aria-hidden />
                    {sermon.statistics.viewCount} visualizações
                  </div>
                  <div className="flex items-center gap-2 text-sm text-content">
                    <Heart className="size-4 text-content-muted" aria-hidden />
                    {sermon.statistics.likes} curtidas
                  </div>
                </CardBody>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Relacionados</CardTitle>
                </CardHeader>
                <QueryStates
                  query={recommendations}
                  skeleton={<CardSkeleton rows={3} />}
                  isEmpty={(data) => data.recommendations.length === 0}
                  empty={
                    <p className="px-5 py-4 text-sm text-content-muted">
                      Sem sermões relacionados no mesmo tópico.
                    </p>
                  }
                >
                  {(data) => (
                    <ul className="divide-y divide-border-subtle">
                      {data.recommendations.map((item) => (
                        <li key={item.id} className="px-5 py-3">
                          <Link
                            to={`/sermoes/${item.id}`}
                            className="text-sm font-medium text-content hover:text-primary"
                          >
                            {item.title}
                          </Link>
                          <p className="text-xs text-content-muted">
                            {item.preacher ?? '—'} · {formatDate(item.sermonDate)}
                          </p>
                        </li>
                      ))}
                    </ul>
                  )}
                </QueryStates>
              </Card>
            </div>
          </div>
        )}
      </QueryStates>
    </div>
  )
}
