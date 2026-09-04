# ADR-001: Arquitetura do frontend (feature-first sobre Vite + React)

**Data**: 2026-09-04
**Status**: Accepted
**Tags**: `architecture`, `structure`, `vite`, `react`

---

## 📋 Contexto

O backend é uma API REST completa, multi-tenant, com 11 domínios e RBAC de 7
roles (`project-ccvm`). O frontend é um **cliente** dessa API: não tem regra de
negócio própria, não tem persistência própria, não decide autorização.

Clean Architecture pura no frontend (domain/application/infrastructure com
inversão de dependência) pagaria pouco aqui e custaria muito: o "domínio" seria
um espelho de DTOs, e cada tela viraria seis arquivos. A complexidade real deste
projeto está em **quantidade de telas parecidas**, não em profundidade de regra.

---

## 🎯 Decisão

**Organização feature-first, com uma camada compartilhada fina.**

### R1. Estrutura de pastas

```
src/
├── app/            # composição: providers, rotas
├── features/       # uma pasta por domínio da API (auth, members, cells, …)
├── layouts/        # cascas de página (AppShell)
├── pages/          # telas que não pertencem a um domínio (404, 403, painel)
├── shared/
│   ├── api/        # cliente HTTP, tradução de erro, react-query
│   ├── ui/         # primitivos do design system
│   ├── lib/        # utilitários puros (formatação, cn)
│   └── types/      # tipos espelhando os DTOs e os envelopes da API
└── test/           # setup, MSW, helpers de render
```

### R2. Regra de dependência

`features/*` → `shared/*` → nada.
**Uma feature nunca importa de outra feature.** Se duas precisam do mesmo código,
ele sobe para `shared/`. A única exceção é `features/auth`, que é infraestrutura
de sessão consumida por todas.

### R3. Anatomia de uma feature

```
features/<dominio>/
├── <dominio>.api.ts       # chamadas HTTP puras — devolve DTO, não React
├── <dominio>.queries.ts   # hooks TanStack Query + chaves de cache
├── <dominio>.schema.ts    # Zod dos formulários (validação de entrada)
├── <Dominio>Page.tsx      # listagem
├── <Dominio>FormPage.tsx  # criar/editar
└── *.test.tsx
```

A camada `.api.ts` é a **única** que conhece `axios`. Componente nunca chama
`http` direto — a fronteira existe para o dia em que a chamada mudar de forma.

### R4. Sem barrel files (`index.ts` reexportando)

Import direto do arquivo. Barrels arrastam módulo não usado para o bundle e
escondem ciclo de dependência.

### R5. Um domínio da API = uma feature

O mapa 1:1 com `docs/api/contracts/` do backend é intencional: achar o código a
partir do contrato (e vice-versa) não pode exigir conhecimento prévio.

---

## 🔀 Alternativas consideradas

| Alternativa | Por que não |
|-------------|-------------|
| Clean Architecture completa (domain/application/infra) | O domínio vive no backend; replicá-lo aqui seria duplicação sem invariante para proteger — e a ADR de proporcionalidade do time desaconselha |
| Estrutura por tipo (`components/`, `hooks/`, `services/`) | Cresce mal: uma mudança em "membros" toca 5 pastas distantes |
| Next.js (SSR/RSC) | Console autenticado, atrás de login, sem SEO nem primeiro byte crítico. SSR traria servidor Node para operar sem entregar valor |

---

## ✅ Consequências

### Positivas
- Cada domínio é uma pasta fechada: dá para atribuir uma feature a uma pessoa (ou a um agente) sem colisão
- O caminho do contrato ao código é direto
- Deleção é fácil: remover um domínio é remover uma pasta

### Negativas / Cuidados
- Sem barreira física impedindo import cruzado entre features — é convenção verificada em review
- Código realmente compartilhado precisa de disciplina para subir a `shared/` em vez de virar import lateral

---

## ✔️ Critérios de aceite

- [ ] Nenhum arquivo em `features/A` importa de `features/B` (exceto `features/auth`)
- [ ] `axios` só aparece em `shared/api/` e nos `*.api.ts`
- [ ] Toda feature tem `.api.ts` e `.queries.ts` separados

---

## 📚 Referências

- Backend: ADR-002 (Church Management System)
- [Guia de estrutura de código](../guides/code-structure-guide.md)
