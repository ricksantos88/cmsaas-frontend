# ADR-0012: Módulo Web Dedicado para Visitas Pastorais e Gestão de Agendamento

**Data**: 2026-09-15  
**Status**: Accepted  
**Autores**: Equipe Frontend CMSaaS  
**Revisores**: Tech Lead / Pastor Presidente  
**Tags**: `pastoral-visits`, `web-console`, `rbac`, `group-scheduling`

---

## 📋 Contexto

No console administrativo web do CMSaaS, os agendamentos de visita pastoral eram acessados e criados no formulário de Eventos da Agenda (`ScheduleFormPage.tsx` com `type = PASTOR_VISIT`).

Esta abordagem trazia incongruências para a experiência do usuário (UX) pastoral:
1. Misturava eventos públicos/cultos com visitas pastorais sigilosas no calendário da igreja.
2. Não suportava a seleção de múltiplos membros para uma mesma visita (ex: visita a um casal ou família).
3. Não permitia ao pastor registrar o parecer/resumo pós-visita nem indicar necessidade e data de retorno.
4. Não exibia solicitações de visita realizadas por membros.

---

## 🎯 Decisão

Criar uma funcionalidade isolada em `src/features/pastoral-visits` para gerenciamento exclusivo de visitas pastorais pelo console web administrativo, removendo a opção de visita pastoral da tela de eventos.

### Solução Proposta

1. **Isolamento de Feature (`src/features/pastoral-visits/`)**:
   - `pastoral-visits.api.ts`: Comunicação exclusiva com os novos endpoints `/api/v1/pastoral-visits`.
   - `pastoral-visits.queries.ts`: Hooks TanStack Query (`usePastoralVisits`, `useCreatePastoralVisit`, `useCompletePastoralVisit`, etc.).
   - `PastoralVisitsPage.tsx`: Visão principal dividida por abas:
     - **Solicitações de Membros** (Visitas solicitadas aguardando agendamento pelo pastor).
     - **Minhas Visitas Agendadas** (Visitas agendadas atribuídas ao pastor logado).
     - **Todas as Visitas** (Disponível apenas para `PASTOR_PRESIDENT` / `ADMIN`).
     - **Histórico de Realizadas** (Filtro por concluídas/canceladas).

2. **Agendamento Flexível em Grupo (`PastoralVisitFormDialog.tsx`)**:
   - Permitir selecionar 1 ou múltiplos membros vinculados à mesma visita.
   - Seleção de pastor responsável, data, horário, localização (residência, hospital, igreja, online) e motivo.

3. **Conclusão & Retorno Pastoral (`CompleteVisitModal.tsx`)**:
   - Modal acionado na ação de "Concluir Visita".
   - Campo obrigatorio de resumo do atendimento (`summary`).
   - Switch "Requer Retorno" (`requiresReturn`) com seletor de data prevista de retorno (`returnDate`).

4. **Navegação & RBAC (`navigation.ts` / `routes.tsx`)**:
   - Menu "Visitas Pastorais" em `navigation.ts`, restrito às permissões pastorais (`PASTOR`, `PASTOR_PRESIDENT`).

5. **Ajustes no Módulo de Agendamentos (`features/schedules`)**:
   - Remoção da opção `PASTOR_VISIT` no select de tipos de evento e ajuste dos botões de atalho.

---

## ✅ Consequências

### Positivas
- Experiência fluida e totalmente dedicada para a gestão pastoral.
- Suporte a visitas familiares (múltiplos membros).
- Registro facilitado de resumo e controle de retornos pastorais pendentes.
- Separação clara entre agenda de eventos públicos e agenda pastoral sigilosa.

### Negativas
- Necessidade de atualizar os manipuladores MSW nos testes de integração do frontend.
