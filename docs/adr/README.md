# ADRs — Frontend Web (CMSaaS)

Decisões arquiteturais do console web. Mesmo formato do backend
(`project-ccvm/docs/adr/`), para quem trabalha nos dois lados não trocar de idioma.

## Índice

| ADR | Título | Status |
|-----|--------|--------|
| [0001](./0001-frontend-architecture.md) | Arquitetura do frontend (feature-first sobre Vite + React) | Accepted |
| [0002](./0002-state-and-data-fetching.md) | Estado do servidor vs. estado do cliente | Accepted |
| [0003](./0003-design-system-and-layout.md) | Design system, tokens e modelo de layout | Accepted |
| [0004](./0004-session-rbac-and-tenant.md) | Sessão, RBAC no cliente e confiança no tenant | Accepted |
| [0005](./0005-admin-only-web-channel.md) | Web é canal exclusivamente administrativo | Accepted |
| [0006](./0006-feature-decoupling-and-reference-data.md) | Desacoplamento entre features e dados de referência | Accepted |
| [0007](./0007-vendor-chunking-and-bundle-optimization.md) | Estratégia de chunking de vendor e otimização de bundle | Accepted |
| [0008](./0008-public-home-and-church-onboarding.md) | Home pública e onboarding self-service de igreja | Accepted |
| [0009](./0009-multi-church-memberships-and-tenant-switcher.md) | Suporte a múltiplas congregações e seletor de tenant | Accepted |
| [0010](./0010-pastor-president-user-provisioning.md) | Atribuição de Pastor Presidente no provisionamento de usuário | Accepted |
| [0011](./0011-ecclesiastical-color-system.md) | Sistema de cores sóbrias eclesiásticas (Sálvia & Terracota) | Accepted |

## Quando criar uma ADR

Crie quando a decisão **custa caro para reverter** e alguém, daqui a seis meses,
vai perguntar "por que assim?". Exemplos: trocar biblioteca de dados, mudar a
estratégia de sessão, adotar SSR, mudar a forma de tratar erro.

Não crie ADR para: escolher o nome de um componente, adicionar uma página que
segue o padrão existente, refatoração local.

## Como criar

1. Copie [template.md](./template.md) para `000X-titulo.md`
2. Preencha (contexto → decisão → alternativas → consequências → critérios)
3. Referencie no código com `@see ADR-00X` onde a regra é aplicada
4. Atualize o índice acima

## ADRs do backend que **vinculam** este frontend

| ADR do backend | O que impõe aqui |
|----------------|------------------|
| ADR-002 | A web é canal administrativo; o membro usa o app |
| ADR-003 | Multi-tenant: o usuário pertence a uma igreja |
| ADR-004 | `churchId` nunca sai do cliente; paginação, erro e datas padronizados |
