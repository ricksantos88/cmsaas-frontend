# ADR-008: Home Pública e Onboarding Self-Service de Igreja

**Data**: 2026-09-13  
**Status**: Accepted  
**Autores**: Antigravity & Equipe CMSaaS  
**Tags**: `landing-page`, `onboarding`, `auth`, `registration`, `public`

---

## 📋 Contexto

Anteriormente, o console web não possuía rota pública inicial além da tela de login (`/login`), redirecionando qualquer acesso não autenticado para `/login`. Além disso, a criação de novas igrejas era restrita a operadores `SUPER_ADMIN` na área da plataforma (ADR-005).

O backend (`project-ccvm`) disponibilizou os novos contratos de **Onboarding Self-Service** ([ADR-006 do backend](file:///Users/wendel.santos/workspace/projects-libs-frameworks/project-ccvm/docs/adr/0006-self-service-onboarding-and-user-invites.md) e [onboarding.md](file:///Users/wendel.santos/workspace/projects-libs-frameworks/project-ccvm/docs/api/contracts/onboarding.md)), expondo o endpoint público:
- `POST /api/v1/auth/register-church`

Surge a necessidade de prover:
1. Uma **Home pública** acolhedora e informativa para visitantes e pastores que acessam a plataforma web.
2. Dois pontos de ação centrais: **Login** (para operadores que já possuem conta) e **Registro** (para novas igrejas ingressarem no sistema).
3. Uma tela e fluxo de cadastro self-service para a congregação (`/registro`), autenticando imediatamente o operador após a criação da igreja.

---

## 🎯 Decisão

Implementar uma experiência de entrada pública no console web através das seguintes regras:

### R1. Home Pública na Raiz (`/`)
A rota raiz `/` passa a resolver condicionalmente com base no estado da sessão:
- Usuário não autenticado (`anonymous`): visualiza a **`HomePage`** (landing page institucional com apresentação dos módulos e botões de Login e Cadastro).
- Usuário autenticado (`authenticated`): direcionado diretamente para o painel de gestão (`DashboardPage`) dentro do `AppShell`.

### R2. Tela de Onboarding de Igreja (`/registro`)
Disponibilizar a rota pública `/registro` com formulário aderente ao contrato `POST /api/v1/auth/register-church`:
- Dados da igreja: `churchName`, `denomination`, `phone`, `address` (opcional).
- Dados do operador: `adminName`, `adminEmail`, `adminPassword`, `isPastor` (padrão: `true`).
- Validação no cliente com Zod e distribuição de erros do backend (`400 VALIDATION_ERROR` ou `409 EMAIL_ALREADY_EXISTS`).

### R3. Login Imediato Pós-Cadastro
Como o backend retorna `LoginResponse` (HTTP 201) com par de tokens JWT (`accessToken` e `refreshToken`), o cliente deve salvar os tokens na `tokenStore`, popular a sessão na `sessionStore` e redirecionar imediatamente o novo pastor para o painel principal, sem exigir login manual subsequente.

### R4. Interconexão entre Login e Registro
A tela de `/login` deve incluir link de acesso para o fluxo de registro ("Ainda não cadastrou sua igreja? Cadastre-se"), e a tela de `/registro` deve incluir link para o login ("Já possui uma conta? Entrar").

---

## 🔀 Alternativas consideradas

| Alternativa | Prós | Contras | Por que não |
|-------------|------|---------|-------------|
| **Manter `/` redirecionando direto para `/login`** | Menor esforço | Usuários novos não conhecem a plataforma nem encontram como criar conta | Experiência de SaaS precária para autoatendimento |
| **Criar landing page em subdomínio ou site separado** | Isolamento total de marketing | Aumenta custos de infraestrutura e complexidade de deploys neste momento | A equipe solicitou a experiência integrada no frontend web |
| **Adotar ADR-008 (Home pública + rota `/registro`)** | Aproveita os tokens de design do CMSaaS, integra 100% com a API de onboarding | Exige tela e rota pública adicional | Entrega exatamente o fluxo de SaaS self-service desenhado no backend |

---

## ✅ Consequências

### Positivas
- Pastores e líderes encontram uma apresentação clara do sistema e podem iniciar o uso da plataforma em minutos.
- Experiência completa e fluida: onboarding atômico com auto-login.
- Aderência estrita aos novos contratos de API do backend.

### Negativas / Cuidados
- As rotas públicas (`/`, `/registro`, `/login`) não devem carregar recursos pesados do painel administrativo antes da autenticação.

---

## ✔️ Critérios de aceite

- [ ] Home pública acessível em `/` quando não logado, contendo botões de login e cadastro.
- [ ] Acessar `/login` a partir da Home direciona para o formulário de login.
- [ ] Acessar `/registro` a partir da Home abre o formulário de cadastro de igreja.
- [ ] Formulário de registro valida os campos e envia payload conforme `onboarding.md`.
- [ ] Cadastro bem-sucedido autentica e direciona o usuário para o painel.
- [ ] `npm run check` passando com 100% de sucesso.

---

## 📚 Referências

- Contrato Backend: `project-ccvm/docs/api/contracts/onboarding.md`
- ADR Backend: `project-ccvm/docs/adr/0006-self-service-onboarding-and-user-invites.md`
- [ADR-005](./0005-admin-only-web-channel.md)
