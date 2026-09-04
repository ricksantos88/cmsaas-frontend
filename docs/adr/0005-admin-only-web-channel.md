# ADR-005: Web é canal exclusivamente administrativo

**Data**: 2026-09-04
**Status**: Accepted
**Tags**: `product`, `scope`, `channels`

---

## 📋 Contexto

A ADR-002 do backend define dois canais sobre a mesma API: **administração** via
web + app, e **experiência do membro somente pelo app** (iOS/Android). A API,
porém, não impede um `MEMBER` de autenticar: `POST /auth/login` responde 200 para
qualquer usuário ativo, e vários endpoints de leitura aceitam `isAuthenticated()`.

Ou seja: sem uma decisão explícita, um membro logaria no console administrativo
e veria um menu quase todo em 403.

---

## 🎯 Decisão

**O console web aceita apenas as roles administrativas.**

### R1. Roles aceitas

`SUPER_ADMIN`, `PASTOR_PRESIDENT`, `PASTOR_AUXILIARY`, `ADMIN_CHURCH`,
`TREASURER`, `WORSHIP_LEADER` (`ADMIN_ROLES` em `shared/types/roles.ts`).

### R2. `MEMBER` e `GUEST` são barrados no login

O login autentica normalmente, mas se o usuário não tem nenhuma role
administrativa a sessão **não** é estabelecida: os tokens são descartados e a
tela explica que membros acessam pelo aplicativo.

> É barreira de produto, não de segurança — a API continua respondendo a esse
> usuário pelos canais dela. O objetivo é não entregar uma interface que não
> serve para ele.

### R3. O menu se recorta por permissão

Item de menu com `permission` some para quem não tem a role (ex.: Patrimônio só
aparece para o administrativo e a tesouraria). Rota correspondente é protegida
por `RequirePermission` e cai em `/sem-permissao`.

### R4. `SUPER_ADMIN` usa o mesmo console

Ele ganha os itens de plataforma (CRUD de igrejas, `POST /churches`,
`GET /churches`) dentro do mesmo shell. Um console separado só se justifica
quando houver operação cross-tenant de verdade — reavaliar então.

---

## 🔀 Alternativas consideradas

| Alternativa | Por que não |
|-------------|-------------|
| Deixar `MEMBER` entrar em modo leitura | Contraria a ADR-002 do backend e cria um segundo produto para manter |
| Console separado para `SUPER_ADMIN` | Duplica shell, build e deploy para 4 telas |

---

## ✅ Consequências

### Positivas
- Nenhum usuário chega a uma tela que ele não pode usar
- Escopo do produto fica igual ao da ADR-002 do backend

### Negativas / Cuidados
- Um usuário que perde a role administrativa perde o acesso na próxima sessão — precisa de mensagem clara (R2 cobre)
- Se o produto decidir abrir a web ao membro, esta ADR precisa ser **substituída**, não contornada em código

---

## ✔️ Critérios de aceite

- [ ] Teste: usuário só com `MEMBER` não autentica no console
- [ ] Teste: item de menu com permissão some para quem não tem a role
- [ ] Rota protegida redireciona para `/sem-permissao`

---

## 📚 Referências

- Backend: ADR-002 → Canais de acesso; `contracts/auth.md` → Roles
