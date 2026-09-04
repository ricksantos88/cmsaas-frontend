# Guia de Integração com a API

Ref.: [ADR-002](../adr/0002-state-and-data-fetching.md) ·
[ADR-004](../adr/0004-session-rbac-and-tenant.md) ·
Backend: `project-ccvm/docs/adr/0004-api-conventions-and-tenant-isolation.md`

## As cinco regras que valem para toda chamada

1. **`churchId` nunca sai do cliente.** Nem body, nem query, nem path. Vem do token.
2. **Paginação é sempre `{ data, pagination }`.** Use `PageResponse<T>`.
3. **Erro é sempre `{ error: { code, message, details }, traceId, timestamp }`.**
   Traduza com `toApiError` — o componente só vê `ApiError`.
4. **Datas em UTC ISO-8601**; `LocalDate` (`2026-07-29`) não tem fuso e não pode
   passar por `new Date()` na exibição (use `formatDate`).
5. **Ausente ≠ `null` nos updates.** Ausente não altera, `null` limpa. Por isso
   `omitUndefined` antes de enviar — nunca serialize `undefined`.

## Escrevendo a camada `.api.ts`

```ts
const BASE = '/api/v1/cells'

export const cellsApi = {
  list: (filters: CellFilters) =>
    http.get<PageResponse<CellSummary>>(BASE, { params: toQuery({ ...filters }) })
      .then((r) => r.data),

  getById: (id: string) => http.get<Cell>(`${BASE}/${id}`).then((r) => r.data),

  create: (payload: CreateCellRequest) =>
    http.post<Cell>(BASE, omitUndefined({ ...payload })).then((r) => r.data),

  update: (id: string, payload: UpdateCellRequest) =>
    http.put<Cell>(`${BASE}/${id}`, omitUndefined({ ...payload })).then((r) => r.data),

  remove: (id: string) => http.delete<void>(`${BASE}/${id}`).then(() => undefined),
}
```

- Devolve o DTO, não a resposta do axios
- `toQuery` remove filtro vazio (senão vira `?search=`)
- Nada de React aqui: nem hook, nem toast

## Escrevendo a camada `.queries.ts`

```ts
export const cellKeys = {
  all: ['cells'] as const,
  list: (f: CellFilters) => [...cellKeys.all, 'list', f] as const,
  detail: (id: string) => [...cellKeys.all, 'detail', id] as const,
}

export function useCells(filters: CellFilters) {
  return useQuery({
    queryKey: cellKeys.list(filters),
    queryFn: () => cellsApi.list(filters),
    placeholderData: (previous) => previous,
  })
}

export function useCreateCell() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: cellsApi.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: cellKeys.all }),
  })
}
```

## Paginação

O backend é **1-based** (`page=1`) e limita `limit` a 100. O envelope já traz
`hasNext`/`hasPrev` — use-os no `<Pagination>` em vez de calcular.

## Upload de arquivo (documentos)

`POST /api/v1/documents` é `multipart/form-data`: o arquivo em `file` e os
metadados como **campos de formulário** (não JSON).

```ts
const form = new FormData()
form.append('file', file)
form.append('title', title)
form.append('category', category)
form.append('visibility', visibility)
tags.forEach((tag) => form.append('tags', tag))

await http.post('/api/v1/documents', form)
```

Não defina `Content-Type` à mão: o navegador precisa gerar o `boundary`.
Acima do teto o backend responde `413 FILE_TOO_LARGE`.

## Download com autorização

O binário exige `Authorization`, então `<a href>` direto não serve. Baixe como
blob e dispare o download:

```ts
const { data } = await http.get(`/api/v1/documents/${id}/download`, { responseType: 'blob' })
```

Antes de oferecer o botão, respeite `allowDownload` da resposta — o backend já
calculou se **este** usuário pode.

## O que o backend NÃO tem

Não invente endpoint. Hoje não existem:

- Endpoint de dashboard agregado (só `GET /assets/summary`)
- Cadastro de usuário/convite (`User` só nasce por seed ou fora da API)
- `GET /members/:id/family` e `POST /members/:id/connect-pastor` — estão no
  contrato, **não** no controller implementado
- Vínculo usuário↔membro (por isso `POST /sermons/:id/like` pede `memberId` no corpo)
- Push real (a porta existe, o envio é log)

Se uma tela precisar de algo assim, é conversa de backend — abra a pendência,
não contorne com N chamadas.

## Verificando o contrato

A fonte viva é o Swagger do backend rodando:
`http://localhost:8080/swagger-ui.html` · JSON em `/v3/api-docs`.
Divergiu do que está em `shared/types/domain.ts`? O Swagger ganha — corrija o tipo.
