# ADR-004: Sessão, RBAC no cliente e confiança no tenant

**Data**: 2026-09-04
**Status**: Accepted
**Tags**: `security`, `auth`, `rbac`, `multi-tenancy`

---

## 📋 Contexto

O backend emite `accessToken` (1h) e `refreshToken` (7d) **no corpo** do login —
não há cookie httpOnly. O `churchId` é claim do access token e o backend filtra
**toda** consulta por ele (ADR-004 do backend, R1–R8). Acesso cross-tenant volta
404.

Isso define o que o frontend pode e não pode fazer: ele guarda credencial, mas
não decide nada sobre autorização nem sobre tenant.

---

## 🎯 Decisão

### R1. O cliente **nunca** envia `churchId`

Nem em body, nem em query, nem em path. Não existe seletor de igreja na
interface, nem `churchId` em nenhum tipo de request. Ele aparece só em
**respostas** — e serve no máximo para exibição.

> Consequência prática: se um endpoint parece precisar de `churchId`, a leitura
> do contrato está errada. Confira antes de inventar o parâmetro.

### R2. Access token em memória, refresh token em `localStorage`

O access token vive numa variável de módulo (`shared/api/token-store.ts`):
morre ao fechar a aba e não está num lugar previsível para um XSS varrer.

O refresh token vai para `localStorage` porque o backend o entrega no corpo e
sem persistência um F5 derrubaria a sessão. **É um trade-off consciente**: com
XSS, o refresh token é roubável. As mitigações que sobram são as de sempre —
nada de `dangerouslySetInnerHTML`, dependência auditada, CSP no servidor de
estáticos. Trocar por cookie httpOnly + `SameSite` exige mudança no backend
(emitir o refresh como cookie); é a melhoria recomendada.

### R3. O boot renova antes de perguntar

Depois de um F5 não existe access token em memória, só o refresh token no
storage. O boot (`session.store.restore`) **renova primeiro** e só então chama
`GET /auth/me` — em vez de perguntar, tomar 401 e depender do interceptor.

Corolário que já custou um bug: o guard do interceptor não pode tratar todo
`/auth/` como rota pública. Só `login`, `refresh`, `logout`, `forgot-password` e
`reset-password` ficam fora da renovação; `GET /auth/me`, `PUT /auth/me` e
`change-password` são rotas protegidas como quaisquer outras.

### R4. Um refresh por vez

Cinco requisições que tomam 401 juntas compartilham a mesma promessa de refresh.
Refreshes concorrentes se invalidariam e derrubariam a sessão do usuário sem
motivo. Implementado no interceptor de `shared/api/http.ts`.

### R5. RBAC no cliente é UX, não segurança

`features/auth/permissions.ts` espelha os `@PreAuthorize` dos controllers. Serve
para **não mostrar um botão que vai tomar 403**. A autorização de verdade é do
backend e continua sendo a única que vale.

Regra de manutenção: mudou role no backend, muda aqui **no mesmo PR**. O arquivo
cita o controller de origem justamente para isso.

### R6. Falha de refresh derruba a sessão

Refresh que falha limpa os tokens, zera o store e manda para `/login`,
preservando a rota de origem para voltar depois do login.

### R7. Rota privada espera o boot

Enquanto `status === 'loading'` (restaurando sessão), o guard **não** redireciona
— mostra carregando. Redirecionar cedo faria o login piscar em todo F5.

---

## 🔀 Alternativas consideradas

| Alternativa | Por que não (por ora) |
|-------------|----------------------|
| Refresh token em cookie httpOnly | Melhor opção de segurança, mas depende de mudança no backend + CSRF + CORS com credenciais |
| Tudo em `localStorage` (inclusive access) | Amplia a janela de roubo sem ganhar nada de UX |
| Tudo em memória (sem persistir) | F5 desloga; inaceitável num console de trabalho diário |

---

## ✅ Consequências

### Positivas
- Sessão sobrevive a F5 sem manter o access token em disco
- Uma única porta de renovação, testável
- A UI não oferece ação que a API vai negar

### Negativas / Cuidados
- Refresh token vulnerável a XSS enquanto não houver cookie httpOnly
- `permissions.ts` pode divergir do backend — divergência = botão que dá 403 (falha visível, não silenciosa)

---

## ✔️ Critérios de aceite

- [ ] Nenhum tipo de request contém `churchId`
- [ ] Access token não aparece em `localStorage`/`sessionStorage`
- [x] Teste cobrindo: 401 → refresh → repete a requisição original
- [x] Teste cobrindo: refresh falhou → sessão anônima
- [x] Teste cobrindo: **F5 mantém a sessão** (sem access token, renova e segue)
- [x] O backend falso dos testes exige o header `Authorization` — sem isso, um
      `/auth/me` que sempre responde 200 esconde exatamente este bug

---

## 📚 Referências

- Backend: ADR-003, ADR-004, `contracts/auth.md`
- [Guia de tratamento de erro](../guides/error-handling.md)
