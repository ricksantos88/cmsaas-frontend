import { useState } from 'react'
import { Link, useParams } from 'react-router'
import { ArrowLeft, Pencil, Wrench } from 'lucide-react'
import { useAsset } from './assets.queries'
import { AssetFormDialog } from './AssetFormDialog'
import { MaintenanceDialog } from './MaintenanceDialog'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card, CardBody, CardHeader, CardTitle } from '@/shared/ui/card'
import { DetailItem, DetailList } from '@/shared/ui/detail-list'
import { PageHeader } from '@/shared/ui/page-header'
import { QueryStates } from '@/shared/ui/query-states'
import { CardSkeleton } from '@/shared/ui/skeleton'
import { EmptyState } from '@/shared/ui/states'
import { Table, TBody, TD, TH, THead, TR } from '@/shared/ui/table'
import { formatCurrency, formatDate, formatDateTime } from '@/shared/lib/format'
import {
  ACQUISITION_TYPE_LABELS,
  ASSET_CATEGORY_LABELS,
  ASSET_CONDITION_LABELS,
  ASSET_CONDITION_TONES,
  ASSET_STATUS_LABELS,
  ASSET_STATUS_TONES,
  MAINTENANCE_TYPE_LABELS,
} from '@/shared/types/labels'

/**
 * Detalhe do item, com o **histórico de manutenção** — que só existe aqui: a
 * listagem devolve o resumo e nunca o histórico.
 */
export function AssetDetailPage() {
  const { id } = useParams<{ id: string }>()
  const query = useAsset(id)
  const [editOpen, setEditOpen] = useState(false)
  const [maintenanceOpen, setMaintenanceOpen] = useState(false)

  return (
    <div className="space-y-6">
      <PageHeader
        title={query.data?.name ?? 'Item do patrimônio'}
        description={query.data?.assetTag ?? undefined}
        actions={
          <>
            <Button asChild variant="outline">
              <Link to="/patrimonio">
                <ArrowLeft aria-hidden />
                Voltar
              </Link>
            </Button>
            <Button variant="outline" onClick={() => setMaintenanceOpen(true)}>
              <Wrench aria-hidden />
              Registrar manutenção
            </Button>
            <Button onClick={() => setEditOpen(true)}>
              <Pencil aria-hidden />
              Editar
            </Button>
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
        {(asset) => (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Dados do item</CardTitle>
              </CardHeader>
              <CardBody>
                <DetailList>
                  <DetailItem label="Categoria">{ASSET_CATEGORY_LABELS[asset.category]}</DetailItem>
                  <DetailItem label="Situação">
                    <Badge tone={ASSET_STATUS_TONES[asset.status]}>
                      {ASSET_STATUS_LABELS[asset.status]}
                    </Badge>
                  </DetailItem>
                  <DetailItem label="Estado de conservação">
                    <Badge tone={ASSET_CONDITION_TONES[asset.condition]}>
                      {ASSET_CONDITION_LABELS[asset.condition]}
                    </Badge>
                  </DetailItem>
                  <DetailItem label="Etiqueta">{asset.assetTag ?? '—'}</DetailItem>
                  <DetailItem label="Número de série">{asset.serialNumber ?? '—'}</DetailItem>
                  <DetailItem label="Localização">{asset.location ?? '—'}</DetailItem>
                  <DetailItem label="Responsável">{asset.responsible?.fullName ?? '—'}</DetailItem>
                  <DetailItem label="Garantia até">{formatDate(asset.warrantyUntil)}</DetailItem>
                  <DetailItem label="Próxima manutenção">
                    {formatDate(asset.nextMaintenanceDate)}
                  </DetailItem>
                  <DetailItem label="Observações" wide>
                    {asset.notes ?? '—'}
                  </DetailItem>
                </DetailList>
              </CardBody>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Aquisição</CardTitle>
              </CardHeader>
              <CardBody>
                <DetailList>
                  <DetailItem label="Forma">
                    {asset.acquisition?.type ? ACQUISITION_TYPE_LABELS[asset.acquisition.type] : '—'}
                  </DetailItem>
                  <DetailItem label="Data">{formatDate(asset.acquisition?.date)}</DetailItem>
                  <DetailItem label="Valor de aquisição">
                    {formatCurrency(asset.acquisition?.value, asset.acquisition?.currency ?? 'BRL')}
                  </DetailItem>
                  <DetailItem label="Valor atual">{formatCurrency(asset.currentValue)}</DetailItem>
                  <DetailItem label="Fornecedor">{asset.acquisition?.supplier ?? '—'}</DetailItem>
                  <DetailItem label="Nota fiscal">
                    {asset.acquisition?.invoiceNumber ?? '—'}
                  </DetailItem>
                </DetailList>
              </CardBody>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Histórico de manutenção</CardTitle>
              </CardHeader>

              {asset.maintenanceHistory.length === 0 ? (
                <EmptyState
                  title="Nenhuma manutenção registrada"
                  description="Registre revisões e consertos para acompanhar o custo e o estado do item."
                  action={<Button onClick={() => setMaintenanceOpen(true)}>Registrar manutenção</Button>}
                />
              ) : (
                <Table>
                  <THead>
                    <TR>
                      <TH>Data</TH>
                      <TH>Tipo</TH>
                      <TH>Descrição</TH>
                      <TH>Executado por</TH>
                      <TH>Estado após</TH>
                      <TH className="text-right">Custo</TH>
                    </TR>
                  </THead>
                  <TBody>
                    {asset.maintenanceHistory.map((maintenance) => (
                      <TR key={maintenance.id}>
                        <TD>{formatDate(maintenance.date)}</TD>
                        <TD className="text-content-muted">
                          {MAINTENANCE_TYPE_LABELS[maintenance.type]}
                        </TD>
                        <TD className="text-content-muted">{maintenance.description ?? '—'}</TD>
                        <TD className="text-content-muted">{maintenance.performedBy ?? '—'}</TD>
                        <TD className="text-content-muted">
                          {maintenance.conditionAfter
                            ? ASSET_CONDITION_LABELS[maintenance.conditionAfter]
                            : '—'}
                        </TD>
                        <TD className="text-right text-content-muted">
                          {formatCurrency(maintenance.cost)}
                        </TD>
                      </TR>
                    ))}
                  </TBody>
                </Table>
              )}
            </Card>

            <p className="text-xs text-content-muted">
              Cadastrado em {formatDateTime(asset.createdAt)} · atualizado em{' '}
              {formatDateTime(asset.updatedAt)}
            </p>

            <AssetFormDialog open={editOpen} onOpenChange={setEditOpen} asset={asset} />
            <MaintenanceDialog
              asset={asset}
              open={maintenanceOpen}
              onOpenChange={setMaintenanceOpen}
            />
          </div>
        )}
      </QueryStates>
    </div>
  )
}
