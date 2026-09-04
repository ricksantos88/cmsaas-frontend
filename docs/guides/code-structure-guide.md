# Guia de Estrutura de Código

Ref.: [ADR-001](../adr/0001-frontend-architecture.md)

## Onde mora cada coisa

| Preciso de… | Vai em… |
|-------------|---------|
| Chamada HTTP de um domínio | `features/<dominio>/<dominio>.api.ts` |
| Hook de leitura/escrita com cache | `features/<dominio>/<dominio>.queries.ts` |
| Schema Zod de formulário | `features/<dominio>/<dominio>.schema.ts` |
| Tradução de enum da API para PT-BR | `features/<dominio>/<algo>-labels.ts` |
| Tela | `features/<dominio>/<Nome>Page.tsx` |
| Componente usado por 2+ features | `shared/ui/` |
| Utilitário puro (data, moeda, string) | `shared/lib/` |
| Tipo que espelha DTO do backend | `shared/types/domain.ts` |
| Envelope da API (página, erro) | `shared/types/api.ts` |
| Provider, rota | `app/` |
| Casca de página | `layouts/` |
| Tela sem dono de domínio (404, 403, painel) | `pages/` |

## Regra de dependência

```
features/*  →  shared/*  →  (nada)
     ↑
  app/, layouts/, pages/ compõem features
```

- Feature **não** importa de outra feature. Exceção única: `features/auth`
  (sessão e permissão são infraestrutura de todas).
- `shared/` **não** importa de `features/`. Se um utilitário precisa de tipo de
  feature, ele não é compartilhado — ainda.
- Nada importa de `app/`.

## Anatomia de uma feature

```
features/members/
├── members.api.ts        # HTTP puro; único lugar que conhece o cliente axios
├── members.queries.ts    # useQuery/useMutation + memberKeys
├── members.schema.ts     # Zod do formulário
├── member-status.ts      # rótulos e tons de badge
├── MembersPage.tsx       # listagem
├── MemberFormPage.tsx    # criar/editar
├── MemberDetailPage.tsx  # detalhe
└── MembersPage.test.tsx
```

## Convenções de nome

| Item | Convenção | Exemplo |
|------|-----------|---------|
| Componente | `PascalCase.tsx` | `MembersPage.tsx` |
| Hook | `useAlgo.ts` | `useSession.ts` |
| Módulo não-componente | `kebab-case.ts` | `member-status.ts` |
| Camada de API | `<dominio>.api.ts` | `members.api.ts` |
| Tipo/interface | `PascalCase` | `MemberSummary` |
| Constante | `SCREAMING_SNAKE` | `DEFAULT_PAGE_SIZE` |
| Rota | português, kebab | `/membros`, `/sem-permissao` |

## Imports

- Sempre alias `@/` — nunca `../../../shared`
- `import type` para tipos (obrigatório pelo lint)
- Sem barrel files: importe o arquivo

Ordem: pacotes externos → `@/features` → `@/shared` → relativos.

## Componentes

- Função nomeada exportada (`export function MembersPage()`), sem `default`
- Um componente por arquivo; auxiliar pequeno pode ficar junto se **não** for
  usado fora
- Props tipadas por interface local
- Sem argumento booleano que muda o comportamento em dois modos — dois
  componentes são mais honestos que `<X compact />` que muda tudo

## Comentário

Comentário explica **por quê**. O quê está no código.

```ts
// ✅ o motivo não está no código
// Um refresh por vez: refreshes concorrentes se invalidariam.

// ❌ narra o óbvio
// incrementa a página
```
