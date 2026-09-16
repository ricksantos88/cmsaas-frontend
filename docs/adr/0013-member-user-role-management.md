# ADR-0013: Gerenciamento de Papéis (Roles) de Usuário na Tela de Membros

**Data**: 2026-09-16  
**Status**: Accepted  
**Autores**: Antigravity & Equipe CMSaaS  
**Tags**: `members`, `users`, `rbac`, `roles`, `governance`, `ui-ux`

---

## 📋 Contexto

No ecossistema do CMSaaS, a entidade de negócio **Membro** representa a pessoa física cadastrada no rol da igreja. Quando um membro também atua como operador no console web (por exemplo, desempenhando papéis de Tesouraria, Líder de Louvor, Pastor Auxiliar ou Administrador), ele possui uma conta de **Usuário** (`User`) vinculada ao seu cadastro de membro (`member.userId`).

Atualmente:
1. O backend fornece o endpoint `PUT /api/v1/users/{id}/roles` para atualização dos papéis (`roles`) do operador na igreja.
2. Na interface do frontend, o gerenciamento direto desses papéis a partir da visualização detalhada do membro não estava integrado de forma direta, exigindo que gestores operassem fora do fluxo de cadastro do membro.
3. Faz-se necessário permitir que operadores com prerrogativa de gestão de papéis alterem as funções atribuídas ao usuário do membro diretamente na tela de detalhes do membro.

---

## 🎯 Decisão

Permitir que operadores autorizados alterem os papéis (`roles`) do usuário vinculado a um membro diretamente na tela de detalhes do membro (`MemberDetailPage`), respeitando rigorosamente as regras de governança e RBAC.

### R1. Restrição de Autorização (RBAC)
A ação de alterar papéis de usuário é restrita exclusivamente às seguintes funções:
- **Pastor Presidente (`PASTOR_PRESIDENT`)**
- **Administrador da Igreja (`ADMIN_CHURCH`)**
- **Administrador da Plataforma (`SUPER_ADMIN`)**

Outras roles (como `PASTOR_AUXILIARY`, `TREASURER` ou `WORSHIP_LEADER`) **não** podem visualizar ou acionar o botão de alteração de papéis.

### R2. Permissão no Frontend (`PERMISSIONS`)
Criar/Mapear a chave de permissão `user.roles.write` em `src/features/auth/permissions.ts`:
```ts
'user.roles.write': ['SUPER_ADMIN', 'PASTOR_PRESIDENT', 'ADMIN_CHURCH']
```

### R3. Componentização do Diálogo de Papéis
Implementar o componente `UpdateUserRolesDialog` reutilizável em `src/features/users/UpdateUserRolesDialog.tsx`, que aceita o `userId`, nome da pessoa e `currentRoles`.
- Apresenta checkboxes para seleção dos papéis disponíveis no tenant:
  - Pastor Presidente (`PASTOR_PRESIDENT`)
  - Pastor Auxiliar (`PASTOR_AUXILIARY`)
  - Administrador Local (`ADMIN_CHURCH`)
  - Tesoureiro (`TREASURER`)
  - Líder de Louvor (`WORSHIP_LEADER`)
- Valida que ao menos 1 papel permaneça selecionado.
- Exibe avisos normativos (por exemplo, restrição de Pastor Presidente único por igreja).

### R4. Integração na Tela de Edição do Membro (`MemberFormPage`)
- Na tela de edição do membro (`MemberFormPage`), quando o membro possuir usuário vinculado (`member.userId` ou `member.hasUser`):
  - Se o operador logado possuir a permissão `user.roles.write`, exibir a seção **"Permissões de Acesso (Roles do Usuário)"** com o botão **"Alterar Papéis do Usuário"**.
  - O clique no botão abre o diálogo `UpdateUserRolesDialog`.
  - A tela de detalhes do membro (`MemberDetailPage`) exibe os papéis de modo somente leitura.
  - Após a atualização no modal, invalida as queries de membros e usuários (`['members', id]`, `['users']`) e notifica o operador via toast.

---

## 🔀 Alternativas consideradas

| Alternativa | Prós | Contras | Por que não |
|-------------|------|---------|-------------|
| Criar uma página separada exclusiva para gestão de permissões de usuários | Separação total de páginas | Aumenta a navegação e obriga o gestor a procurar o usuário em outra lista | Desalinhado da experiência focada na pessoa/membro |
| Alterar papéis na tela de detalhes (`MemberDetailPage`) | Acesso rápido na leitura | Mistura ações administrativas de permissão com visualização cadastral | O operador espera alterar dados de acesso durante o fluxo de edição |
| Integração na tela de edição do membro (`MemberFormPage`) (Escolhida) | Agrupa alterações administrativas e cadastrais da pessoa no formulário de edição com modal dedicado | Exige verificação de permissão e modal | **Melhor UX**: alinhado ao fluxo de edição da pessoa |

---

## ✅ Consequências

### Positivas
- Melhora a produtividade dos Pastores Presidentes e Administradores na concessão de permissões.
- Manutenção da segurança através do alinhamento exato entre backend `@PreAuthorize` e frontend `PERMISSIONS`.
- Feedback imediato com invalidação do cache do TanStack Query.

### Negativas / Cuidados
- Requer garantir que a inativação ou alteração de papéis da própria conta seja tratada adequadamente (o backend já impede inativação própria).

---

## ✔️ Critérios de aceite

- [ ] ADR-0013 aceita e registrada em `docs/adr/0013-member-user-role-management.md`.
- [ ] Permissão `user.roles.write` configurada em `permissions.ts`.
- [ ] Método `updateRoles` adicionado a `users.api.ts` e hook em `users.queries.ts`.
- [ ] Modal `UpdateUserRolesDialog` criado com seleção de checkboxes e tratamento de erros da API.
- [ ] Botão "Alterar Papéis" condicional por RBAC adicionado à `MemberDetailPage`.
- [ ] Testes unitários para `UpdateUserRolesDialog` e `MemberDetailPage` validados com `npm run check`.

---

## 📚 Referências

- Backend: `project-ccvm/src/main/kotlin/com/cmsaas/api/v1/UserController.kt` (`PUT /api/v1/users/{id}/roles`)
- ADRs anteriores: `ADR-0004` (RBAC), `ADR-0010` (Provisionamento de Pastores).
