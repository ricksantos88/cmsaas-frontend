# Setup do Ambiente de Desenvolvimento

## Pré-requisitos

- Node 20+ (o projeto foi validado no 24)
- npm 10+
- O backend rodando localmente (`project-ccvm`)

## 1. Subir o backend

```bash
cd ../project-ccvm
cp .env.example .env
docker compose up -d          # MySQL + Adminer + MailHog
export JWT_SECRET="…mínimo 256 bits…"   # sem isso a app não sobe (proposital)
export SEED_ENABLED=true                # cria SUPER_ADMIN + igreja demo
./gradlew bootRun
```

Confira: <http://localhost:8080/swagger-ui.html>

> O seed é **opt-in**. Sem `SEED_ENABLED=true` não existe usuário para logar.
> Credenciais de dev: ver `project-ccvm/docs/guides/dev-environment-setup.md`.

## 2. Subir o frontend

```bash
npm install
cp .env.example .env
npm run dev     # http://localhost:5173
```

## 3. Como o frontend fala com o backend

Em dev, `VITE_API_BASE_URL` fica **vazio** e o Vite faz proxy de `/api` para
`http://localhost:8080`. O navegador só conversa com o próprio Vite, então CORS
não entra na história.

Para apontar para outro backend sem tocar no código:

```bash
VITE_PROXY_TARGET=http://192.168.0.10:8080 npm run dev
```

Em produção, `VITE_API_BASE_URL` recebe a URL da API e o backend precisa liberar
a origem do frontend em `cmsaas.cors.allowed-origins`.

## Comandos

| Comando | O que faz |
|---------|-----------|
| `npm run dev` | servidor de desenvolvimento |
| `npm run build` | typecheck + build de produção em `dist/` |
| `npm run preview` | serve o build |
| `npm run test` | testes uma vez |
| `npm run test:watch` | testes em watch |
| `npm run test:coverage` | cobertura (meta 80%) |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript sem emitir |
| `npm run check` | tipos + lint + testes (rode antes de abrir PR) |

## Problemas comuns

| Sintoma | Causa provável |
|---------|----------------|
| Login responde 401 com credencial certa | seed não rodou (`SEED_ENABLED`) |
| Toda chamada dá 404 | backend não está em `:8080` ou o proxy aponta para outro lugar |
| Login OK, mas a tela diz que é console administrativo | usuário só tem `MEMBER`/`GUEST` (ADR-005) |
| 401 em tudo depois de uma hora | refresh falhando — veja o console e `contracts/auth.md` |
| Erro de CORS | você tirou o proxy e o backend não libera a origem |
