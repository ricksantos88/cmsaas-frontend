# Documentação — Console Administrativo CMSaaS

Console web da administração da igreja, cliente da API `project-ccvm`.

## Por onde começar

| Situação | Leia |
|----------|------|
| Primeiro dia no projeto | Este arquivo → [ADR-001](./adr/0001-frontend-architecture.md) → [layout-model](./guides/layout-model.md) |
| Vai subir o ambiente | [Setup de desenvolvimento](./guides/dev-environment-setup.md) |
| Vai criar uma tela | [Modelo de layout](./guides/layout-model.md) + [checklist de feature](./guides/feature-implementation-checklist.md) |
| Vai integrar com a API | [Guia de integração](./guides/api-integration-guide.md) + [mapa de endpoints](./api/endpoints.md) |
| É um agente de IA | [../AGENTS.md](../AGENTS.md) |

## Índice

### Decisões
- [ADR-001 — Arquitetura do frontend](./adr/0001-frontend-architecture.md)
- [ADR-002 — Estado do servidor vs. do cliente](./adr/0002-state-and-data-fetching.md)
- [ADR-003 — Design system, tokens e layout](./adr/0003-design-system-and-layout.md)
- [ADR-004 — Sessão, RBAC e tenant](./adr/0004-session-rbac-and-tenant.md)
- [ADR-005 — Web é canal administrativo](./adr/0005-admin-only-web-channel.md)
- [Como criar uma ADR](./adr/README.md)

### Especificação (SDD)
- [spec.md](./specs/spec.md) — o quê e por quê
- [plan.md](./specs/plan.md) — como
- [tasks.md](./specs/tasks.md) — passos e status

### Guias
- [Estrutura de código](./guides/code-structure-guide.md)
- [Modelo de layout](./guides/layout-model.md) *(normativo)*
- [Padrões de componente](./guides/component-patterns-guide.md)
- [Integração com a API](./guides/api-integration-guide.md)
- [Tratamento de erro](./guides/error-handling.md)
- [Testes](./guides/testing-guide.md)
- [Checklist de feature](./guides/feature-implementation-checklist.md)
- [Setup de desenvolvimento](./guides/dev-environment-setup.md)

### API
- [Mapa de endpoints consumidos](./api/endpoints.md)
- Contratos: `../../project-ccvm/docs/api/contracts/`
- Swagger: `http://localhost:8080/swagger-ui.html`

### Estado
- [ROADMAP](./ROADMAP.md)

## As cinco coisas que mais causam retrabalho aqui

1. Mandar `churchId` na requisição — o tenant vem do token, sempre
2. Serializar `undefined` como `null` num update — apaga dado do usuário
3. Reimplementar no cliente uma regra que a API já respondeu
4. Cor literal do Tailwind em vez de token
5. Enum da API exibido cru para o usuário
