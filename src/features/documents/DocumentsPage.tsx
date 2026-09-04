import { useState } from 'react'
import { Download, Pencil, Trash2, Upload } from 'lucide-react'
import { documentsApi } from './documents.api'
import type { DocumentFilters } from './documents.api'
import { useDeleteDocument, useDocument, useDocuments } from './documents.queries'
import { DocumentUploadDialog } from './DocumentUploadDialog'
import { DocumentEditDialog } from './DocumentEditDialog'
import { useSession } from '@/features/auth/useSession'
import { useListFilters } from '@/shared/hooks/use-list-filters'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card } from '@/shared/ui/card'
import { ConfirmDialog } from '@/shared/ui/confirm-dialog'
import { EnumSelect, FilterBar } from '@/shared/ui/filter-bar'
import { PageHeader } from '@/shared/ui/page-header'
import { Pagination } from '@/shared/ui/pagination'
import { QueryStates } from '@/shared/ui/query-states'
import { TableSkeleton } from '@/shared/ui/skeleton'
import { EmptyState } from '@/shared/ui/states'
import { Table, TBody, TD, TH, THead, TR } from '@/shared/ui/table'
import { notifyError, notifySuccess } from '@/shared/ui/toast'
import { formatDate, formatFileSize } from '@/shared/lib/format'
import {
  DOCUMENT_CATEGORY_LABELS,
  DOCUMENT_VISIBILITY_LABELS,
  DOCUMENT_VISIBILITY_TONES,
} from '@/shared/types/labels'
import type { DocumentCategory, DocumentSummary, DocumentVisibility } from '@/shared/types/domain'

export function DocumentsPage() {
  const { can } = useSession()
  const { get, page, setFilters, setPage, clear, hasFilters } = useListFilters()
  const [uploadOpen, setUploadOpen] = useState(false)
  const [pendingDelete, setPendingDelete] = useState<DocumentSummary | null>(null)
  const [editingId, setEditingId] = useState<string | undefined>()
  const [downloadingId, setDownloadingId] = useState<string | null>(null)

  const filters: DocumentFilters = {
    page,
    limit: 20,
    search: get('search'),
    category: get('category') as DocumentCategory | undefined,
    visibility: get('visibility') as DocumentVisibility | undefined,
  }

  const query = useDocuments(filters)
  const deleteDocument = useDeleteDocument()
  // A edição precisa do documento completo (accessLevel, descrição): a lista só traz o resumo.
  const editing = useDocument(editingId)
  const canWrite = can('document.write')

  async function download(document: DocumentSummary) {
    setDownloadingId(document.id)
    try {
      await documentsApi.download(document.id, document.title)
    } catch (error) {
      notifyError(error, 'Não foi possível baixar o arquivo.')
    } finally {
      setDownloadingId(null)
    }
  }

  async function confirmDelete() {
    if (!pendingDelete) return
    try {
      await deleteDocument.mutateAsync(pendingDelete.id)
      notifySuccess('Documento removido.')
      setPendingDelete(null)
    } catch (error) {
      notifyError(error)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Documentos"
        description="Atas, apostilas, relatórios e resumos de sermão."
        actions={
          canWrite && (
            <Button onClick={() => setUploadOpen(true)}>
              <Upload aria-hidden />
              Enviar documento
            </Button>
          )
        }
      />

      <Card>
        <FilterBar
          searchValue={get('search')}
          searchPlaceholder="Buscar por título ou etiqueta"
          onSearch={(value) => setFilters({ search: value })}
          onClear={clear}
          showClear={hasFilters}
        >
          <EnumSelect
            label="Filtrar por categoria"
            placeholder="Todas as categorias"
            options={DOCUMENT_CATEGORY_LABELS}
            value={filters.category}
            onChange={(category) => setFilters({ category })}
          />
          <EnumSelect
            label="Filtrar por visibilidade"
            placeholder="Todas as visibilidades"
            options={DOCUMENT_VISIBILITY_LABELS}
            value={filters.visibility}
            onChange={(visibility) => setFilters({ visibility })}
          />
        </FilterBar>

        <QueryStates
          query={query}
          skeleton={<TableSkeleton columns={5} />}
          isEmpty={(data) => data.data.length === 0}
          empty={
            <EmptyState
              title="Nenhum documento encontrado"
              description={
                hasFilters
                  ? 'Nenhum documento corresponde aos filtros.'
                  : 'Envie o primeiro arquivo da igreja.'
              }
              action={
                hasFilters ? (
                  <Button variant="outline" onClick={clear}>
                    Limpar filtros
                  </Button>
                ) : (
                  canWrite && <Button onClick={() => setUploadOpen(true)}>Enviar documento</Button>
                )
              }
            />
          }
        >
          {(data) => (
            <>
              <Table>
                <THead>
                  <TR>
                    <TH>Título</TH>
                    <TH>Categoria</TH>
                    <TH>Visibilidade</TH>
                    <TH>Tamanho</TH>
                    <TH>Downloads</TH>
                    <TH>Enviado em</TH>
                    <TH className="w-28" />
                  </TR>
                </THead>
                <TBody>
                  {data.data.map((document) => (
                    <TR key={document.id}>
                      <TD className="font-medium">
                        {document.title}
                        {document.tags.length > 0 && (
                          <span className="ml-2 text-xs text-content-muted">
                            {document.tags.join(' · ')}
                          </span>
                        )}
                      </TD>
                      <TD className="text-content-muted">
                        {DOCUMENT_CATEGORY_LABELS[document.category]}
                      </TD>
                      <TD>
                        <Badge tone={DOCUMENT_VISIBILITY_TONES[document.visibility]}>
                          {DOCUMENT_VISIBILITY_LABELS[document.visibility]}
                        </Badge>
                      </TD>
                      <TD className="text-content-muted">{formatFileSize(document.fileSize)}</TD>
                      <TD className="text-content-muted">{document.downloadCount}</TD>
                      <TD className="text-content-muted">
                        {formatDate(document.createdAt.slice(0, 10))}
                      </TD>
                      <TD>
                        <div className="flex items-center justify-end gap-1">
                          {/* `allowDownload` vem calculado do backend: não reimplemente a regra. */}
                          {document.allowDownload && (
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={downloadingId === document.id}
                              onClick={() => void download(document)}
                            >
                              <Download aria-hidden />
                              Baixar
                            </Button>
                          )}
                          {canWrite && (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                aria-label={`Editar ${document.title}`}
                                onClick={() => setEditingId(document.id)}
                              >
                                <Pencil aria-hidden />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                aria-label={`Excluir ${document.title}`}
                                onClick={() => setPendingDelete(document)}
                              >
                                <Trash2 aria-hidden />
                              </Button>
                            </>
                          )}
                        </div>
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

      <DocumentUploadDialog open={uploadOpen} onOpenChange={setUploadOpen} />

      {editing.data && (
        <DocumentEditDialog
          document={editing.data}
          open={Boolean(editingId)}
          onOpenChange={(open) => !open && setEditingId(undefined)}
        />
      )}

      <ConfirmDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title="Excluir documento"
        description={`"${pendingDelete?.title ?? ''}" sai das listagens e deixa de ser baixável. O arquivo permanece no armazenamento até o expurgo.`}
        confirmLabel="Excluir"
        loading={deleteDocument.isPending}
        onConfirm={() => void confirmDelete()}
      />
    </div>
  )
}
