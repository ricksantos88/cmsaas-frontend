# Guia de Tratamento de Erro

Ref.: backend `docs/guides/error-handling.md` · [ADR-002 R5](../adr/0002-state-and-data-fetching.md)

## Contrato de erro do backend

```json
{
  "error": { "code": "MEMBER_IS_CELL_LEADER", "message": "…", "details": [] },
  "traceId": "9f1c…",
  "timestamp": "2026-08-31T09:00:00Z"
}
```

## A fronteira

`AxiosError` **não** atravessa `shared/api/`. O interceptor converte tudo em
`ApiError` (`shared/api/api-error.ts`), que carrega `status`, `code`, mensagem já
em português, `traceId` e `fieldErrors[]`.

Componente trata `ApiError`. Nunca `error.response.data.error.code`.

## Quem trata o quê

| Status | Onde é tratado | O usuário vê |
|--------|----------------|--------------|
| **401** | interceptor: renova e repete (menos em login/refresh/logout/reset); se falhar, derruba a sessão | volta ao login |
| **403** | tela/ação | mensagem de permissão; a ação já deveria estar escondida por `can()` |
| **404** | tela de detalhe | "Registro não encontrado" — pode ser cross-tenant (ADR-004 R4 do backend) |
| **400 VALIDATION_ERROR** | formulário | erro por campo, via `details[]` |
| **409** | ação | mensagem de negócio (`RESOURCE_CONFLICT`, `ASSET_TAG_ALREADY_EXISTS`, …) |
| **413** | upload | "Arquivo acima do tamanho permitido" |
| **429** | login/ação | "Muitas tentativas. Aguarde alguns minutos" |
| **5xx** | `ErrorState` | mensagem genérica + `traceId` visível |
| rede | `ErrorState` | "Não foi possível falar com o servidor" + tentar de novo |

## Distribuindo erro de validação no formulário

```ts
try {
  await createMember.mutateAsync(values)
} catch (error) {
  if (error instanceof ApiError && error.isValidation) {
    error.fieldErrors.forEach(({ field, message }) =>
      setError(field as keyof FormValues, { message }),
    )
    return
  }
  toast.error(error instanceof ApiError ? error.message : 'Não foi possível salvar.')
}
```

## Mensagens

`api-error.ts` mantém um mapa `código → mensagem em PT-BR`. Código sem tradução
usa a `message` que a API mandou — **nunca** uma string genérica, que apagaria a
informação. Ao aprender um código novo no backend, adicione no mapa.

## `traceId` sempre visível no erro inesperado

Em 5xx e erro desconhecido, mostre o `traceId`: é o que liga o print do usuário
ao log do backend. `ErrorState` já faz isso.

## O que não fazer

- `catch {}` vazio — erro engolido some do radar
- `alert()` / `console.error` como tratamento
- Reimplementar regra do backend no cliente para "adiantar" o erro (ex.: decidir
  se o documento é baixável; use `allowDownload`)
- Traduzir `403` em "erro inesperado": o usuário precisa saber que é permissão
