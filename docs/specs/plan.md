# Plan — Console Administrativo Web (CMSaaS)

O **como**. Requisitos em [spec.md](./spec.md); execução em [tasks.md](./tasks.md).

---

## 1. Decisões que sustentam o plano

| Decisão | ADR |
|---------|-----|
| Feature-first sobre Vite + React, sem Clean Architecture | [ADR-001](../adr/0001-frontend-architecture.md) |
| Estado do servidor no TanStack Query; cliente só a sessão | [ADR-002](../adr/0002-state-and-data-fetching.md) |
| Tokens semânticos + primitivos próprios (Radix por baixo) | [ADR-003](../adr/0003-design-system-and-layout.md) |
| Access em memória, refresh no storage, RBAC como UX | [ADR-004](../adr/0004-session-rbac-and-tenant.md) |
| Web é canal exclusivamente administrativo | [ADR-005](../adr/0005-admin-only-web-channel.md) |

## 2. Stack

| Camada | Escolha | Por quê |
|--------|---------|---------|
| Build | Vite 6 + TypeScript estrito | Sem SSR: console autenticado, sem SEO |
| UI | React 19 + Tailwind 4 (tokens `@theme`) | Identidade trocável em um bloco de CSS |
| Componentes | Primitivos próprios + Radix | Acessibilidade pronta, código no repositório |
| Rotas | React Router 7 (data router) | Rotas aninhadas + guardas |
| Dados | TanStack Query 5 | Cache, invalidação e estados resolvidos |
| Sessão | Zustand 5 (um store) | O único estado global real |
| Formulários | React Hook Form + Zod | Validação declarativa, erro por campo |
| HTTP | Axios com interceptores | Um lugar para token, refresh e tradução de erro |
| Testes | Vitest + Testing Library + MSW | Roda o app contra um backend falso |

## 3. Arquitetura em uma tela

```
main.tsx
└── AppProviders            QueryClient · Toaster · restauração de sessão
    └── RouterProvider
        ├── /login          LoginPage
        └── RequireAuth     espera o boot; anônimo → /login
            └── AppShell    sidebar + topbar (menu recortado por permissão)
                ├── /                 painel
                ├── /membros …        feature members
                ├── /celulas …        feature cells
                ├── …
                └── RequirePermission rotas restritas (patrimônio, igreja, plataforma)
```

Cada feature: `*.api.ts` (HTTP puro) → `*.queries.ts` (cache) → páginas.
A dependência anda em um sentido só: `features → shared`.

## 4. Padrões que se repetem

| Padrão | Onde vive | Regra |
|--------|-----------|-------|
| Listagem | `MembersPage.tsx` é a referência | PageHeader → FilterBar → QueryStates → tabela → Pagination |
| Filtro | `useListFilters` | Sempre na query string; mudar filtro volta à página 1 |
| Estados | `QueryStates` + `TableSkeleton` | Esqueleto, não spinner, nas listas |
| Formulário | `useApiForm` | Zod na entrada, `400 VALIDATION_ERROR` distribuído nos campos |
| Cadastro/edição | Modal até ~12 campos; página acima disso | Membro, evento e sermão são páginas |
| Ação destrutiva | `ConfirmDialog` | A descrição diz o efeito real (soft delete) |
| Feedback | `notifySuccess` / `notifyError` | Erro mostra a mensagem traduzida + `traceId` |
| Permissão | `can('recurso.acao')` | Esconde a ação que a API negaria |
| Enum | `shared/types/labels.ts` | Nunca exibido cru |

## 5. Integração com a API

- Proxy do Vite em dev (`/api` → `:8080`): CORS não entra na história
- Interceptor de request injeta o access token; o de response renova no 401
  (um refresh por vez) e repete a requisição original
- `toQuery` remove filtro vazio; `omitUndefined` preserva a diferença entre
  ausente e `null` nos updates
- Erro vira `ApiError` na fronteira: componente não conhece `AxiosError`

## 6. Sequência de entrega

| Fase | Entrega | Estado |
|------|---------|--------|
| 1 | Fundação: build, tokens, HTTP, sessão, shell, guardas | ✅ |
| 2 | Design system: primitivos, modal, esqueleto, estados, formulário | ✅ |
| 3 | Pessoas: membros, células, pastores, músicos | ✅ |
| 4 | Atividades: agenda (+ presença e escala), sermões, documentos | ✅ |
| 5 | Administração: patrimônio, dados da igreja, plataforma, notificações, financeiro | ✅ |
| 6 | Painel com indicadores reais | ✅ |
| 7 | Conta do usuário, recuperação de senha, preferências, modo escuro | ⏳ |
| 8 | Cobertura por módulo, E2E do fluxo crítico, pipeline | ⏳ |

## 7. Riscos de execução

| Risco | Mitigação |
|-------|-----------|
| Onze módulos parecidos divergirem no visual | `layout-model.md` normativo + listagem de referência |
| Cache incoerente após mutação | Chaves hierárquicas; mutação invalida `keys.all` |
| Menu crescer e virar lista sem hierarquia | Grupos fixos em `navigation.ts` |
| Bundle crescer | Já dividido por rota (`lazy` no router): cada tela é um pedaço de 3–13 kB |
