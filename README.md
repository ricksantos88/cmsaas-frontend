# ⛪ CMSaaS Web — Console Administrativo

Console web da administração da igreja: membros, células, pastores, músicos,
agenda, sermões, documentos, patrimônio e comunicados.

Cliente da API **[project-ccvm](../project-ccvm)** (Kotlin + Spring Boot, multi-tenant).

> **React 19** · **Vite 6** · **TypeScript** · **Tailwind 4** · **TanStack Query 5** · **React Router 7**

---

## Começar

```bash
# 1. Backend rodando (noutro terminal)
cd ../project-ccvm
docker compose up -d
export JWT_SECRET="…mínimo 256 bits…" SEED_ENABLED=true
./gradlew bootRun

# 2. Frontend
npm install
cp .env.example .env
npm run dev            # http://localhost:5173
```

Em dev, o Vite faz proxy de `/api` para `localhost:8080` — sem CORS no caminho.
Detalhes e solução de problemas: [docs/guides/dev-environment-setup.md](./docs/guides/dev-environment-setup.md).

## Comandos

| Comando | O que faz |
|---------|-----------|
| `npm run dev` | desenvolvimento |
| `npm run check` | tipos + lint + testes (rode antes de abrir PR) |
| `npm run test` / `test:watch` / `test:coverage` | testes |
| `npm run build` | build de produção em `dist/` |

## Estrutura

```
src/
├── app/            providers e rotas
├── features/       um diretório por domínio da API
│   ├── auth/       sessão, permissões, guardas
│   ├── members/    referência de listagem, formulário e detalhe
│   ├── cells/  pastors/  musicians/
│   ├── schedules/  sermons/  documents/  assets/  notifications/
│   ├── church/     configurações da igreja + console de plataforma
│   └── dashboard/
├── layouts/        AppShell (sidebar, topbar) e navegação
├── pages/          403 e 404
├── shared/
│   ├── api/        HTTP, refresh de sessão, tradução de erro
│   ├── ui/         primitivos do design system
│   ├── lib/        formatação, payload, formulário
│   ├── hooks/      filtros na URL
│   └── types/      espelho dos DTOs e rótulos em PT-BR
└── test/           setup, MSW, helper de render
```

## O que é bom saber antes de mexer

- **`churchId` nunca sai do cliente** — o tenant vem do token JWT (ADR-004 do backend)
- **A web é canal administrativo**; membro usa o app ([ADR-005](./docs/adr/0005-admin-only-web-channel.md))
- **RBAC no cliente é UX**, não segurança: a autorização é do backend
- **Cor só por token** (`bg-surface`, `text-content`) — nunca `bg-slate-800`
- Nos updates, campo ausente não altera e `null` limpa — use `omitUndefined`

## Documentação

| | |
|---|---|
| 📚 [Documentação central](./docs/README.md) | índice de tudo |
| 🤖 [AGENTS.md](./AGENTS.md) | instruções para agentes de IA |
| 🏛️ [ADRs](./docs/adr/README.md) | decisões e o porquê delas |
| 🎨 [Modelo de layout](./docs/guides/layout-model.md) | normativo para toda tela nova |
| 📡 [Mapa de endpoints](./docs/api/endpoints.md) | o que a web consome, e o que a API não tem |
| 📋 [Spec · Plan · Tasks](./docs/specs/spec.md) | o SDD do projeto |
| 🗺️ [Roadmap](./docs/ROADMAP.md) | fases e débitos |

## Estado

Fases 1–6 concluídas: todos os 11 domínios da API têm tela.
Faltam conta do usuário, preferências, cobertura por módulo e pipeline
([tasks.md](./docs/specs/tasks.md)).
