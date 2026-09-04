# Spec — Console Administrativo Web (CMSaaS)

**Status**: Aprovada · **Versão**: 1.0 · **Atualizada**: 2026-09-04

O **quê** e o **porquê**. O como está em [plan.md](./plan.md); os passos, em
[tasks.md](./tasks.md).

---

## 1. Problema

O backend `project-ccvm` está completo (Fases 1–6, 11 domínios, 172 testes) e não
tem nenhum cliente. Hoje, gerir a igreja exige chamadas HTTP na mão ou o Swagger —
inviável para secretaria, tesouraria e pastores.

## 2. Objetivo

Entregar o **canal web administrativo** previsto na ADR-002 do backend: uma
aplicação onde a equipe da igreja faz o trabalho diário — cadastrar membros,
organizar células, montar a agenda e a escala de louvor, publicar sermões e
documentos, controlar patrimônio e avisar a comunidade.

**Não é objetivo**: a experiência do membro (é do app mobile, ADR-002 do backend e
[ADR-005](../adr/0005-admin-only-web-channel.md) deste projeto), nem qualquer
regra de negócio que já viva no backend.

## 3. Usuários

| Perfil | Rotina que precisa resolver |
|--------|----------------------------|
| `PASTOR_PRESIDENT` | Visão completa; pastores, documentos restritos, decisões |
| `PASTOR_AUXILIARY` | Membros, células, agenda, sermões |
| `ADMIN_CHURCH` | Secretaria: cadastro, agenda, documentos, patrimônio |
| `TREASURER` | Patrimônio e valores |
| `WORSHIP_LEADER` | Músicos e escala de louvor |
| `SUPER_ADMIN` | Operação da plataforma: criar e listar igrejas |

`MEMBER` e `GUEST` **não entram** no console.

## 4. Escopo funcional

| # | Capacidade | Endpoints | Critério de aceite |
|---|-----------|-----------|--------------------|
| F1 | Entrar e sair, com sessão que sobrevive a F5 | `auth/*` | Login válido entra; F5 mantém; refresh expirado volta ao login |
| F2 | Ver o panorama da igreja | listagens + `assets/summary` | Painel mostra membros, células, músicos, sermões, eventos e patrimônio |
| F3 | Gerir membros | `members/*` | Listar com busca e filtro, criar, editar, ver detalhe, excluir com confirmação |
| F4 | Gerir células e participantes | `cells/*` | CRUD + adicionar/remover participantes em lote |
| F5 | Gerir pastores | `pastors/*` | CRUD com visibilidade de contato |
| F6 | Gerir o ministério de música | `musicians/*` | CRUD com instrumentos e disponibilidade |
| F7 | Gerir a agenda | `schedules/*` | Lista e calendário, CRUD, cancelamento |
| F8 | Registrar presença | `schedules/{id}/attendance` | Check-in em lote idempotente e desfazer |
| F9 | Montar a escala de louvor | `schedules/{id}/musicians` | Escalar, confirmar, remover |
| F10 | Publicar sermões | `sermons/*` | CRUD, referências bíblicas, vídeo, tendências |
| F11 | Gerir documentos | `documents/*` | Upload, download autorizado, exclusão |
| F12 | Controlar patrimônio | `assets/*` | CRUD, resumo, manutenção, baixa |
| F13 | Comunicar a igreja | `notifications/*` | Inbox e envio por audiência |
| F14 | Configurar a igreja | `churches/{id}` | Editar identificação, contatos, endereço, presidente |
| F15 | Operar a plataforma | `churches` | `SUPER_ADMIN` cria, lista e desativa igrejas |

## 5. Requisitos não funcionais

| # | Requisito | Como se verifica |
|---|-----------|------------------|
| NF1 | `churchId` nunca sai do cliente | Nenhum tipo de request tem o campo; teste da tela da igreja |
| NF2 | A UI não oferece ação que a API nega | `permissions.ts` espelha os `@PreAuthorize`; testes por role |
| NF3 | Erro sempre legível, em português, com `traceId` no inesperado | `api-error.ts` + testes |
| NF4 | Toda leitura resolve carregando / erro / vazio / dados | `QueryStates` + revisão de tela |
| NF5 | Acessibilidade: rótulo, foco visível, teclado | Consultas por `role`/`label` nos testes |
| NF6 | Responsivo de 375px a desktop | Revisão manual da tela nova |
| NF7 | Todo texto de usuário em PT-BR, enums traduzidos | `shared/types/labels.ts` |
| NF8 | Lógica coberta por teste; cobertura verificada no `check` | Metas por camada no `vite.config.ts` |

## 6. Fora de escopo

- Área do membro (app mobile)
- Finanças (dízimos/ofertas) — fora de escopo também no backend
- Cadastro de usuários e convites — a API não expõe
- Push real, offline, multi-idioma

## 7. Riscos

| Risco | Mitigação |
|-------|-----------|
| Refresh token em `localStorage` é roubável por XSS | Sem HTML injetado, dependências pinadas; migrar para cookie httpOnly exige mudança no backend ([ADR-004](../adr/0004-session-rbac-and-tenant.md)) |
| `permissions.ts` divergir do backend | Falha visível (403), não silenciosa; item no checklist de feature |
| Calendário agrupa por dia em UTC | Documentado na tela; a lista é a visão exata |
| Contrato e controller divergem | [endpoints.md](../api/endpoints.md) registra o que existe de fato |
