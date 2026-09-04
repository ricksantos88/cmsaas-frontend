import { http, omitUndefined, toQuery } from '@/shared/api/http'
import type { IsoDate, PageParams, PageResponse } from '@/shared/types/api'
import type {
  DocumentCategory,
  DocumentDetail,
  DocumentSummary,
  DocumentVisibility,
} from '@/shared/types/domain'
import type { Role } from '@/shared/types/roles'

const BASE = '/api/v1/documents'

export interface DocumentFilters extends PageParams {
  search?: string
  category?: DocumentCategory
  visibility?: DocumentVisibility
  fromDate?: IsoDate
  toDate?: IsoDate
}

export interface UploadDocumentInput {
  file: File
  title: string
  description?: string
  category: DocumentCategory
  visibility: DocumentVisibility
  accessLevel?: Role[]
  tags?: string[]
}

export interface UpdateDocumentInput {
  title?: string
  description?: string
  category?: DocumentCategory
  visibility?: DocumentVisibility
  accessLevel?: Role[]
  tags?: string[]
}

export const documentsApi = {
  list: (filters: DocumentFilters) =>
    http
      .get<PageResponse<DocumentSummary>>(BASE, { params: toQuery({ ...filters }) })
      .then((r) => r.data),

  getById: (id: string) => http.get<DocumentDetail>(`${BASE}/${id}`).then((r) => r.data),

  /**
   * `multipart/form-data`: arquivo em `file`, metadados como campos.
   * O `Content-Type` **não** é definido à mão — o navegador precisa gerar o boundary.
   */
  upload: (input: UploadDocumentInput) => {
    const form = new FormData()
    form.append('file', input.file)
    form.append('title', input.title)
    form.append('category', input.category)
    form.append('visibility', input.visibility)
    if (input.description) form.append('description', input.description)
    input.accessLevel?.forEach((role) => form.append('accessLevel', role))
    input.tags?.forEach((tag) => form.append('tags', tag))

    return http.post<DocumentDetail>(BASE, form).then((r) => r.data)
  },

  update: (id: string, payload: UpdateDocumentInput) =>
    http.put<DocumentDetail>(`${BASE}/${id}`, omitUndefined({ ...payload })).then((r) => r.data),

  remove: (id: string) => http.delete<void>(`${BASE}/${id}`).then(() => undefined),

  /**
   * O binário exige `Authorization`, então `<a href>` direto não funciona:
   * baixa como blob e dispara o download pelo próprio navegador.
   */
  download: async (id: string, fileName: string) => {
    const response = await http.get<Blob>(`${BASE}/${id}/download`, { responseType: 'blob' })
    const url = URL.createObjectURL(response.data)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = fileName
    document.body.append(anchor)
    anchor.click()
    anchor.remove()
    URL.revokeObjectURL(url)
  },
}
