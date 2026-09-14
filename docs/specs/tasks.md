# Tasks — Console Administrativo Web (CMSaaS)

Execução do [plan.md](./plan.md). **Fonte única de status**: marque aqui ao concluir.

> Legenda: ✅ concluído · 🚧 em andamento · ⏳ planejado

---

## ✅ Fase 1 — Fundação

- [x] Vite + React 19 + TypeScript estrito (`erasableSyntaxOnly`, `noUnusedLocals`)
- [x] Tailwind 4 com tokens semânticos em `@theme` (claro e escuro)
- [x] ESLint 9 + `typescript-eslint` + regras de hooks e `import type`
- [x] Vitest + Testing Library + MSW (`onUnhandledRequest: 'error'`)
- [x] Proxy `/api` → `localhost:8080` no servidor de dev
- [x] Cliente HTTP com injeção de token e tradução de erro (`ApiError`)
- [x] Renovação de sessão no 401, com um refresh por vez
- [x] `tokenStore`: access em memória, refresh no `localStorage`
- [x] Store de sessão (login, logout, restauração no boot)
- [x] Bloqueio de `MEMBER`/`GUEST` no login (ADR-005)
- [x] Guardas `RequireAuth` e `RequirePermission`
- [x] `AppShell` com sidebar, gaveta mobile, topbar e "pular para o conteúdo"
- [x] Tipos de domínio dos 11 contratos + envelopes (`PageResponse`, `ApiErrorBody`)
- [x] `permissions.ts` espelhando os `@PreAuthorize`

## ✅ Fase 2 — Design system

- [x] `Button` (5 variantes, `asChild`), `Input`, `Select`, `Textarea`, `Checkbox`
- [x] `Card`, `Badge` (5 tons), `Table`, `Pagination`, `PageHeader`
- [x] `Field` — rótulo, erro e dica amarrados por id
- [x] `Dialog` e `ConfirmDialog` sobre Radix
- [x] `DropdownMenu` + `RowActionsTrigger` para ações de linha
- [x] `Skeleton`, `TableSkeleton`, `CardSkeleton`
- [x] `LoadingState`, `EmptyState`, `ErrorState`, `QueryStates`
- [x] `FilterBar` + `EnumSelect` + `useListFilters` (filtros na URL)
- [x] `FormSection` / `FormRow` / `FormActions` + `useApiForm`
- [x] `StatCard`, `DetailList`, `toast` (sucesso e erro com `traceId`)
- [x] Rótulos em PT-BR de todos os enums da API

## ✅ Fase 3 — Pessoas

- [x] **Membros**: listagem com busca/filtro/paginação, criar, editar, detalhe, excluir
- [x] **Células**: listagem, modal de cadastro/edição, detalhe com participantes
- [x] Participantes: adicionar em lote e remover (invalida cache de membros também)
- [x] **Pastores**: listagem, modal de cadastro/edição, visibilidade de contato, excluir
- [x] **Músicos**: listagem, modal com instrumentos/disponibilidade, remover do ministério

## ✅ Fase 4 — Atividades

- [x] **Agenda**: listagem com filtros, criação e edição em página, cancelamento
- [x] Calendário mensal navegável (com a ressalva de agrupamento em UTC)
- [x] **Presença**: check-in em lote idempotente, desfazer, percentual de capacidade
- [x] **Escala de louvor**: escalar, mudar situação, remover
- [x] **Sermões**: listagem + tendências, formulário com referências bíblicas, detalhe com vídeo e relacionados
- [x] **Documentos**: upload multipart, download por blob, visibilidade e `accessLevel`, exclusão

## ✅ Fase 5 — Administração

- [x] **Financeiro**: listagem de extrato (lançamentos), DRE/relatórios, CRUD de transações
- [x] **Configurações Financeiras**: CRUD de categorias de receitas/despesas
- [x] **Patrimônio**: resumo em cartões, listagem, cadastro/edição, manutenção, baixa
- [x] **Dados da igreja**: identificação, contatos, endereço, pastor presidente
- [x] **Plataforma** (`SUPER_ADMIN`): listar, criar e desativar igrejas
- [x] **Notificações**: inbox com não lidos, marcar como lido, envio por audiência

## ✅ Fase 6 — Painel

- [x] Indicadores reais (membros, células, músicos, sermões, eventos, patrimônio)
- [x] Próximos eventos com atalho para a agenda
- [x] Cartões respeitando permissão (patrimônio só para quem pode ver)

## 🚧 Fase 7 — Conta e preferências

- [x] **Minha conta** (`/minha-conta`), acessível pelo menu do canto superior direito
- [x] Edição de nome e e-mail (`PUT /auth/me`, criado no backend a pedido desta tela)
- [x] Troca de e-mail pede a senha atual e encerra a sessão — é troca de credencial
- [x] Troca de senha, encerrando a sessão em seguida (o backend revoga todas)
- [x] Preferências de notificação por tipo e canal (`notifications/preferences`)
- [ ] Esqueci minha senha e redefinição (`forgot-password` / `reset-password`)
- [ ] Seletor de tema (claro / escuro / sistema) usando os tokens já prontos
- [x] Detalhe do pastor com `GET /pastors/{id}/contacts`
- [x] Detalhe do músico
- [x] Detalhe do item de patrimônio com histórico de manutenção
- [x] Edição de metadados do documento (`PUT /documents/{id}`)
- [x] Nome da igreja do usuário no topo do menu
- [ ] Consumir `GET /documents/categories` em vez dos rótulos locais
- [x] **Home pública** (`/`) com botões para Login e Registro ([ADR-008](../adr/0008-public-home-and-church-onboarding.md))
- [x] **Onboarding self-service de igreja** (`/registro`) via `POST /auth/register-church` ([ADR-008](../adr/0008-public-home-and-church-onboarding.md))
- [x] **Suporte a múltiplas congregações** (`my-churches` e `switch-church`) ([ADR-009](../adr/0009-multi-church-memberships-and-tenant-switcher.md))
- [x] **Seletor de congregação (ChurchSwitcher)** na Topbar com purga de cache (`queryClient.clear()`) ([ADR-009](../adr/0009-multi-church-memberships-and-tenant-switcher.md))
- [x] **Atualizar onboarding (`/registro`)** com seleção de `adminRole` e novos tratamentos de erro ([ADR-009](../adr/0009-multi-church-memberships-and-tenant-switcher.md))
- [x] **Sistema de cores sóbrias eclesiásticas (Sálvia & Terracota)** ([ADR-011](../adr/0011-ecclesiastical-color-system.md))

## ⏳ Fase 8 — Qualidade e operação

- [ ] Cobertura por módulo — subir o piso global a cada módulo testado
      (hoje: 37% global, com 86% em `shared/api` e 97% em `shared/lib`)
- [ ] Teste de cada listagem (dados, erro, vazio) e de cada formulário (validação)
- [ ] E2E do fluxo crítico: login → cadastrar membro → adicionar à célula → check-in
- [x] Divisão do bundle por rota (`lazy` no router) — inicial 562 kB, telas de 3–13 kB
- [x] Desacoplamento estrito de features e extração de options compartilhadas ([ADR-006](../adr/0006-feature-decoupling-and-reference-data.md))
- [x] Mover painel (`DashboardPage`) para `pages/` ([ADR-006](../adr/0006-feature-decoupling-and-reference-data.md))
- [x] Separar o vendor em pedaços para melhorar o cache entre versões ([ADR-007](../adr/0007-vendor-chunking-and-bundle-optimization.md))
- [ ] Pipeline: `npm run check` + build em CI
- [ ] Dockerfile + Nginx com CSP e cabeçalhos de segurança
- [ ] Revisão de acessibilidade com leitor de tela

## 🔭 Depende do backend

- [ ] Refresh token em cookie `httpOnly` (elimina o risco de XSS da ADR-004)
- [ ] Endpoint de dashboard agregado (hoje o painel soma `totalItems`)
- [x] Cadastro/convite de usuários e vínculo usuário↔membro
- [ ] Rotação de refresh no `/refresh` (débito aberto no ROADMAP do backend)
