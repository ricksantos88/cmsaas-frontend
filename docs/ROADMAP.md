# 🗺️ Roadmap — Console Administrativo CMSaaS

Mapa **vivo** do frontend. Status detalhado por tarefa em
[specs/tasks.md](./specs/tasks.md); o roadmap do backend está em
`../../project-ccvm/docs/ROADMAP.md`.

> ✅ concluído · 🚧 em andamento · ⏳ planejado · 🔭 depende do backend

## Visão geral

| Fase | Escopo | Status |
|------|--------|--------|
| **Fase 1** | Fundação (build, HTTP, sessão, shell, guardas) | ✅ |
| **Fase 2** | Design system (primitivos, modal, esqueleto, formulário) | ✅ |
| **Fase 3** | Pessoas (membros, células, pastores, músicos) | ✅ |
| **Fase 4** | Atividades (agenda, presença, escala, sermões, documentos) | ✅ |
| **Fase 5** | Administração (patrimônio, igreja, plataforma, notificações) | ✅ |
| **Fase 6** | Painel com indicadores reais | ✅ |
| **Fase 7** | Conta, senha, preferências, tema | 🚧 |
| **Fase 8** | Cobertura por módulo, E2E, pipeline, deploy | ⏳ |

## Cobertura funcional da API

| Domínio | Listar | Criar | Editar | Excluir | Extras |
|---------|:------:|:-----:|:------:|:-------:|--------|
| Auth | — | — | — | — | login, refresh, logout, me |
| Church | ✅ (plataforma) | ✅ | ✅ | ✅ | configurações da própria igreja |
| Pastor | ✅ | ✅ | ✅ | ✅ | detalhe + contatos por visibilidade |
| Member | ✅ | ✅ | ✅ | ✅ | detalhe |
| Cell | ✅ | ✅ | ✅ | ✅ | participantes em lote |
| Musician | ✅ | ✅ | ✅ | ✅ | detalhe, instrumentos, disponibilidade |
| Schedule | ✅ | ✅ | ✅ | ✅ | calendário, presença, escala |
| Sermon | ✅ | ✅ | ✅ | ✅ | tendências, relacionados, vídeo |
| Document | ✅ | ✅ | ✅ | ✅ | upload, download autorizado |
| Asset | ✅ | ✅ | ✅ | ✅ | detalhe com histórico, resumo, manutenção, baixa |
| Finance | ✅ | ✅ | ✅ | ✅ | extrato, DRE, CRUD de categorias |
| Notification | ✅ (inbox) | ✅ (envio) | — | — | preferências por tipo |

## Débitos conhecidos

- Cobertura global em 37% — as telas entram módulo a módulo (Fase 8)
- Bundle inicial de 562 kB (176 kB gzip) — é o framework; cada tela virou um pedaço de 3–13 kB carregado sob demanda
- Sem E2E: o fluxo crítico ainda não tem teste de ponta a ponta
- Sem pipeline de CI nem imagem de produção

## 🔭 Dependem do backend

- Refresh token em cookie `httpOnly` (hoje o refresh vive no `localStorage`)
- Endpoint de dashboard agregado
- Cadastro/convite de usuário e vínculo usuário↔membro
- `GET /members/{id}/family` e `POST /members/{id}/connect-pastor` (no contrato, ausentes no controller)

**Última atualização**: 2026-09-18
