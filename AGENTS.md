# AGENTS.md — Console Administrativo CMSaaS (frontend web)

Instruções para agentes de IA que forem trabalhar neste repositório.
Leia isto **antes** de escrever qualquer linha. Regras aqui têm precedência sobre
convenção genérica de React/TypeScript.

---

## 1. O que é este projeto

Console **web administrativo** do CMSaaS — SaaS multi-tenant de gestão de igrejas.
É um **cliente** da API REST em `../project-ccvm` (Kotlin + Spring Boot). Não há
regra de negócio, persistência nem autorização aqui: tudo isso vive no backend.

- Idioma de tudo que o usuário lê: **português do Brasil**
- Público: pastores, secretaria, tesouraria e liderança de louvor
- O **membro** não usa esta aplicação — a experiência dele é o app mobile
  (ADR-002 do backend · [ADR-005](./docs/adr/0005-admin-only-web-channel.md) daqui)

## 2. Leitura obrigatória antes de codar

| Vai fazer | Leia primeiro |
|-----------|---------------|
| Qualquer coisa | [docs/README.md](./docs/README.md) e as 5 ADRs |
| Tela nova | [docs/guides/layout-model.md](./docs/guides/layout-model.md) — **normativo** |
| Chamar a API | [docs/guides/api-integration-guide.md](./docs/guides/api-integration-guide.md) e [docs/api/endpoints.md](./docs/api/endpoints.md) |
| Decidir onde o arquivo mora | [docs/guides/code-structure-guide.md](./docs/guides/code-structure-guide.md) |
| Tratar erro | [docs/guides/error-handling.md](./docs/guides/error-handling.md) |
| Escrever teste | [docs/guides/testing-guide.md](./docs/guides/testing-guide.md) |
| Implementar um módulo | [docs/guides/feature-implementation-checklist.md](./docs/guides/feature-implementation-checklist.md) |
| Saber o que falta | [docs/specs/tasks.md](./docs/specs/tasks.md) |

Contratos da API: `../project-ccvm/docs/api/contracts/*.md`.
Fonte viva: Swagger em `http://localhost:8080/swagger-ui.html`.

## 3. Regras invioláveis

1. **`churchId` nunca vai numa requisição.** Nem body, nem query, nem path. O
   backend deriva o tenant do token (ADR-004 do backend). Se você acha que precisa
   mandar, releu errado o contrato.
2. **Não reimplemente regra do backend.** Se a API já responde `allowDownload`,
   use o campo. Autorização de verdade é do servidor; `can()` só esconde botão.
3. **`omitUndefined` em todo payload.** Nos updates, campo **ausente** não altera
   e **`null`** limpa. Serializar `undefined` como `null` apaga dado do usuário.
4. **Componente nunca chama `http` direto.** Só `features/<dominio>/<dominio>.api.ts`.
5. **`AxiosError` não sai de `shared/api`.** A UI só conhece `ApiError`.
6. **Nenhuma cor literal do Tailwind** (`bg-slate-800`, `text-gray-500`) em
   `features/` ou `layouts/`. Só tokens: `bg-surface`, `text-content-muted`, `bg-primary`.
7. **Enum da API nunca aparece cru.** Traduza em `shared/types/labels.ts`.
8. **Feature não importa de outra feature** — exceto `features/auth`. Código
   comum sobe para `shared/`.
9. **Toda leitura resolve quatro estados**: carregando (esqueleto), erro, vazio, dados.
10. **Não invente endpoint.** O que existe está em `docs/api/endpoints.md`; o que
    não existe está listado lá também. Faltou algo? É conversa de backend.

## 4. Como implementar um módulo novo

Siga a ordem — cada passo tem um arquivo de referência real no repositório:

```
1. Ler o contrato do domínio em ../project-ccvm/docs/api/contracts/<dominio>.md
2. Conferir o controller (roles reais) em ../project-ccvm/src/main/kotlin/com/cmsaas/api/v1/
3. Tipos       → shared/types/domain.ts        (espelha o DTO; sem churchId em request)
4. Rótulos     → shared/types/labels.ts        (enums em PT-BR + tom de badge)
5. Permissões  → features/auth/permissions.ts  (espelha o @PreAuthorize)
6. API         → features/<dominio>/<dominio>.api.ts     ex.: members.api.ts
7. Cache       → features/<dominio>/<dominio>.queries.ts ex.: members.queries.ts
8. Listagem    → <Dominio>Page.tsx             copie a forma de MembersPage.tsx
9. Formulário  → modal até ~12 campos (PastorFormDialog.tsx)
                 página acima disso (MemberFormPage.tsx)
10. Rota       → app/router/routes.tsx (em português)
11. Menu       → layouts/navigation.ts (com `permission` se restrito)
12. Testes     → handler no MSW + teste da lista, da permissão e da validação
13. Marcar a tarefa em docs/specs/tasks.md
```

## 5. Arquivos de referência (copie a forma daqui)

| Preciso de um exemplo de… | Olhe |
|---------------------------|------|
| Listagem completa | `src/features/members/MembersPage.tsx` |
| Formulário em página | `src/features/members/MemberFormPage.tsx` |
| Formulário em modal | `src/features/pastors/PastorFormDialog.tsx` |
| Página de detalhe | `src/features/members/MemberDetailPage.tsx` |
| Camada de API | `src/features/members/members.api.ts` |
| Cache e mutações | `src/features/members/members.queries.ts` |
| Upload multipart | `src/features/documents/documents.api.ts` |
| Download autorizado | `documentsApi.download` |
| Seleção múltipla em modal | `src/features/cells/CellDetailPage.tsx` |
| Sub-recursos (presença, escala) | `src/features/schedules/ScheduleDetailPage.tsx` |
| Formulário fora de CRUD (senha, preferências) | `src/features/account/AccountPage.tsx` |
| Teste de página com MSW | `src/features/members/MembersPage.test.tsx` |
| Teste de interceptor | `src/shared/api/http.test.ts` |

## 6. Comandos

```bash
npm run dev            # servidor de desenvolvimento (precisa do backend em :8080)
npm run check          # tipos + lint + testes — RODE ANTES DE ENTREGAR
npm run test:coverage  # cobertura (metas por camada no vite.config.ts)
npm run build          # build de produção
```

**Nunca diga que está pronto sem ter rodado `npm run check` e mostrado a saída.**

## 7. Estilo de código

- Função nomeada exportada; sem `export default`
- `import type` para tipos (o lint exige)
- Alias `@/` sempre; nunca `../../..`
- Sem barrel files (`index.ts` reexportando)
- Comentário explica **por quê**, nunca **o quê**; código comentado se apaga
- Guard clause no topo; no máximo 2 níveis de aninhamento
- Sem argumento booleano que muda o comportamento da função
- Sem `catch` vazio; erro sempre vira `ApiError` tratado ou toast

## 8. Ambiente e limitações conhecidas

- O backend precisa estar rodando com `JWT_SECRET` e `SEED_ENABLED=true`
  (ver [docs/guides/dev-environment-setup.md](./docs/guides/dev-environment-setup.md))
- Em teste, componentes do Radix exigem `userEvent.setup({ pointerEventsCheck: 0 })`;
  os stubs de Pointer Events e `ResizeObserver` estão em `src/test/setup.ts`
- Abrir menu do Radix dentro do jsdom trava: teste o efeito (o diálogo, a mutação),
  não o gesto de abrir o menu
- O calendário agrupa eventos por dia **em UTC** (é assim que a API entrega)

## 9. Quando parar e perguntar

Pergunte em vez de decidir sozinho se:

- Falta endpoint no backend para o que foi pedido
- A mudança contraria uma ADR (então é substituir a ADR, não contornar em código)
- O pedido implica trazer regra de negócio para o cliente
- Envolve segurança de sessão (tokens, storage, CORS)
- O layout pedido não cabe no `layout-model.md`

Decisão arquitetural relevante vira **ADR** em `docs/adr/`, referenciada no código
por `@see ADR-00X`.
