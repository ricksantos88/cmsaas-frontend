# ADR-009: Suporte a Múltiplas Congregações por Usuário e Seletor de Tenant

**Data**: 2026-09-13  
**Status**: Accepted  
**Autores**: Antigravity & Equipe CMSaaS  
**Tags**: `multi-church`, `tenant`, `auth`, `switcher`, `onboarding`

---

## 📋 Contexto

Originalmente no CMSaaS (ADR-003 e ADR-004), cada usuário (`User`) pertencia a uma única igreja (`churchId`). O isolamento por congregação dependia da claim gravada no token JWT no momento do login.

Com a evolução da plataforma e a aprovação da **ADR-007 do backend** (`project-ccvm/docs/adr/0007-multi-church-user-memberships.md`), líderes eclesiásticos (especialmente pastores presidentes, pastores auxiliares e administradores com atuação regional ou em igrejas filiais/sedes) passaram a ter permissão para gerenciar mais de uma congregação com as mesmas credenciais de acesso.

O backend introduziu:
1. `GET /api/v1/auth/my-churches`: listagem das congregações onde o usuário possui vínculo ativo e seus respectivos papéis.
2. `POST /api/v1/auth/switch-church`: alternância de contexto ativo, emitindo um novo par de tokens JWT contendo o novo `churchId` ativo.
3. Novo campo `adminRole` em `POST /api/v1/auth/register-church`, permitindo que um usuário existente vincule uma nova igreja à sua conta (com verificação de elegibilidade e senha).

O frontend precisa se adaptar para permitir alternância fluida entre congregações, sem ferir a regra fundamental de isolamento de tenant nem misturar dados em cache entre igrejas.

---

## 🎯 Decisão

Adotar o suporte a múltiplas congregações no console administrativo com base nas seguintes regras normativas:

### R1. Preservação Estrita do Isolamento de Tenant (ADR-004 R1)
O frontend **nunca** envia `churchId` em requisições de negócio (membros, células, cultos, finanças, relatórios, etc.). O único endpoint onde `churchId` é enviado explicitamente no corpo da requisição é `POST /api/v1/auth/switch-church`.

### R2. Seletor de Congregação Condicional no Topbar
A topbar da casca da aplicação (`AppShell`) deve consultar `GET /api/v1/auth/my-churches`:
- Se o usuário possuir **apenas 1 igreja**: exibe o nome da igreja como identificador fixo (sem abrir menu de seleção).
- Se o usuário possuir **2 ou mais igrejas**: renderiza um dropdown interativo (`ChurchSwitcher`) permitindo alternar de congregação. A congregação ativa é indicada visualmente (`isCurrent: true`).

### R3. Purga Obrigatória de Cache e Recarregamento de Página na Troca de Tenant
Ao disparar `POST /api/v1/auth/switch-church`, após atualizar os tokens no `tokenStore` e o usuário no `sessionStore`:
1. O cliente **obrigatoriamente limpa todo o cache do TanStack Query** (`queryClient.clear()`).
2. A aplicação armazena a mensagem de sucesso em `sessionStorage` e **recarrega a página** (`window.location.reload()`, ou redireciona para a listagem base caso esteja em rota de detalhe com ID específico).
3. Ao recarregar a página, a aplicação inicializa o estado limpo sob o novo tenant, monta as telas e queries do zero e exibe o toast de confirmação.
- **Motivo**: Evita qualquer vazamento de dados visuais ou componentes mantendo estado da igreja anterior na interface do usuário (cross-tenant cache leakage).

### R4. Seleção Explícita de Papel no Onboarding (`adminRole`)
O formulário de registro de igreja (`/registro`) passa a permitir a escolha explícita do papel de liderança do usuário na congregação (`adminRole`):
- `PASTOR_PRESIDENT` — Pastor Presidente (padrão)
- `PASTOR_AUXILIARY` — Pastor Auxiliar
- `ADMIN_CHURCH` — Administrador Local
O campo legado `isPastor` é mantido internamente como fallback para retrocompatibilidade.

### R5. Tratamento de Erros de Multi-Tenant no Onboarding
Tratar os novos erros específicos retornados pela API ao cadastrar uma igreja com e-mail existente:
- `403 USER_NOT_ELIGIBLE_FOR_MULTI_CHURCH`: O usuário já existe mas possui perfil não elegível (ex.: `MEMBER`). Mensagem: *"Este e-mail possui um perfil local que não tem permissão para gerenciar múltiplas congregações."*
- `401 INVALID_CREDENTIALS`: O usuário já existe mas a senha digitada não confere com a conta existente. Mensagem: *"A senha informada não confere com a sua conta já existente."*

---

## 🔀 Alternativas consideradas

| Alternativa | Prós | Contras | Por que não |
|-------------|------|---------|-------------|
| **Troca de igreja via re-login completo** | Zero código de troca no frontend | Experiência de usuário péssima: ter que digitar senha toda vez para alternar filial/sede | Inviável para pastores com congregações múltiplas |
| **Invalidar apenas algumas queries no switch** | Mais rápido teoricamente | Risco crítico de vazar dados da congregação anterior em queries esquecidas | Risco de segurança e integridade inaceitável |
| **Adotar ADR-009 (Switch atômico com `queryClient.clear()`)** | Segurança total, zero vazamento de cache, UX fluida de SaaS moderno | Exige componente no Topbar e ação no store | Alinhamento perfeito com a ADR-007 do backend |

---

## ✅ Consequências

### Positivas
- Pastores e líderes com congregações múltiplas alternam de contexto com 1 clique diretamente no topo da tela.
- Garantia de que nenhum dado da congregação anterior permanece em tela após a troca (`queryClient.clear()`).
- Suporte a onboarding de novas igrejas vinculadas a contas de liderança já existentes.

### Negativas / Cuidados
- A purga do cache (`queryClient.clear()`) faz com que a primeira carga da nova igreja refaça as requisições iniciais (comportamento desejado e seguro).

---

## ✔️ Critérios de aceite

- [ ] `GET /api/v1/auth/my-churches` e `POST /api/v1/auth/switch-church` integrados em `auth.api.ts`.
- [ ] Topbar exibe seletor de igreja quando o usuário tem mais de 1 congregação.
- [ ] Alternar congregação atualiza tokens, sessão, purga cache com `queryClient.clear()` e exibe toast de confirmação.
- [ ] Formulário de onboarding (`/registro`) envia `adminRole` e trata erros `USER_NOT_ELIGIBLE_FOR_MULTI_CHURCH` e `INVALID_CREDENTIALS`.
- [ ] `npm run check` passando com 100% de sucesso.

---

## 📚 Referências

- Guia de Integração: `docs/guides/frontend-multi-church-integration.md`
- Backend ADR: `project-ccvm/docs/adr/0007-multi-church-user-memberships.md`
- [ADR-004](./0004-session-rbac-and-tenant.md)
- [ADR-008](./0008-public-home-and-church-onboarding.md)
