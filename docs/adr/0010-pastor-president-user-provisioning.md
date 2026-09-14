# ADR-0010: Atribuição de Pastor Presidente no Provisionamento de Usuário

**Data**: 2026-09-13  
**Status**: Accepted  
**Autores**: Antigravity & Equipe CMSaaS  
**Tags**: `pastor`, `roles`, `rbac`, `invites`, `user-provisioning`, `governance`

---

## 📋 Contexto

No modelo de governança eclesiástica do CMSaaS (ADR-002 do backend):
1. Cada igreja possui no máximo **um** Pastor Presidente ativo (`church.presidentPastorId` e `pastor.role = PASTOR_PRESIDENT`).
2. O onboarding self-service de uma nova congregação (ADR-008 do frontend / ADR-006 do backend) permite que a igreja seja registrada tanto por um Pastor Presidente quanto por um Administrador Local (`ADMIN_CHURCH`).
3. Quando a igreja é criada por um operador com papel `ADMIN_CHURCH`, a congregação pode inicialmente não possuir um Pastor Presidente cadastrado e vinculado.
4. Posteriormente, a secretaria ou a liderança cadastra os pastores na listagem de pastores (`/pastores`).
5. Ao transformar o cadastro de um pastor em usuário do sistema com acesso e senha (recurso de "Tornar Usuário"), surge a necessidade de permitir que esse pastor seja formalmente designado como **Pastor Presidente**, caso a congregação ainda não possua um titular.

---

## 🎯 Decisão

Adotar as seguintes regras normativas para atribuição do papel `PASTOR_PRESIDENT` no provisionamento de usuários de pastores:

### R1. Quem pode atribuir o papel de Pastor Presidente
A concessão da role `PASTOR_PRESIDENT` na criação de credenciais de acesso pode ser realizada exclusivamente por:
- **Administrador da Igreja (`ADMIN_CHURCH`)**: Responsável pela governança do tenant da igreja.
- **Administrador da Plataforma (`SUPER_ADMIN`)**: Operador global do sistema.
- *(O próprio Pastor Presidente existente, caso convide um substituto ou co-gestor autorizado).*

### R2. Regra de Disponibilidade Condicional da Opção `PASTOR_PRESIDENT`
No diálogo modal de provisionamento de usuário (`InviteUserDialog`):
1. **Igreja sem Pastor Presidente cadastrado**:
   - O papel **Pastor Presidente** (`PASTOR_PRESIDENT`) fica **disponível e habilitado** para seleção.
   - O administrador pode selecioná-lo para atribuir a presidência da congregação a este pastor.
2. **Pastor já cadastrado com `role = PASTOR_PRESIDENT` no domínio**:
   - O papel `PASTOR_PRESIDENT` vem automaticamente marcado e associado ao convite de acesso.
3. **Igreja já possui outro Pastor Presidente**:
   - A opção `PASTOR_PRESIDENT` fica **bloqueada/desabilitada** na interface, com aviso explícito: *"A igreja já possui um Pastor Presidente definido"*.
   - Apenas os papéis de `PASTOR_AUXILIARY`, `ADMIN_CHURCH` ou outros papéis administrativos podem ser selecionados, impedindo conflito de liderança ou duplicidade de titular.

### R3. Reconciliação Automática no Aceite do Convite
No backend, ao aceitar o convite com código de 4 dígitos (`POST /api/v1/auth/accept-invite`):
- Se o convite aceito contiver a role `PASTOR_PRESIDENT`:
  - A entidade de domínio `Pastor` correspondente ao e-mail do convite tem sua role atualizada para `PastorRole.PASTOR_PRESIDENT`.
  - A entidade raiz `Church` tem o campo `presidentPastorId` atualizado com o ID deste pastor (caso estivesse nulo ou associado a ele).
  - A conta `User` recebe a role `PASTOR_PRESIDENT`.

### R4. Proteção de Concorrência e Integridade no Backend
No endpoint `POST /api/v1/users/invites`:
- Se a requisição solicitar a role `PASTOR_PRESIDENT` e a igreja já possuir um pastor presidente com e-mail distinto, o backend rejeita com `409 Conflict (PRESIDENT_ALREADY_EXISTS)`.

---

## 🔀 Alternativas consideradas

| Alternativa | Prós | Contras | Decisão |
|---|---|---|---|
| **Permitir múltiplos pastores presidentes** | Nenhuma restrição no frontend | Fere a estrutura jurídica e o organograma eclesiástico do SaaS | **Rejeitada**: Regra inviolável de titular único |
| **Exigir troca de presidente apenas na tela de Configurações da Igreja** | Centraliza a troca em um único lugar | Fricção operacional: o admin teria que cadastrar o pastor, ir nas configurações para ligá-lo e depois voltar para torná-lo usuário | **Rejeitada**: Fluxo desconexo |
| **Habilitar `PASTOR_PRESIDENT` no modal de Tornar Usuário se a igreja não tiver presidente (ADR-0010)** | Fluxo natural, direto na listagem de pastores, com trava visual se já existir presidente | Exige verificação do estado da liderança da igreja no diálogo | **Aprovada**: Melhor UX e integridade garantida |

---

## ✅ Consequências

### Positivas
- Permite que congregações registradas por administradores locais estabeleçam seu Pastor Presidente diretamente no fluxo de ativação de equipe.
- Previne visualmente e contratualmente a criação de dois pastores presidentes na mesma congregação.
- Sincroniza em uma única operação o usuário (`User`), o pastor de domínio (`Pastor`) e o tenant raiz (`Church.presidentPastorId`).

---

## ✔️ Critérios de aceite

- [ ] `InviteUserDialog` exibe `PASTOR_PRESIDENT` para pastores quando a igreja não tiver presidente ou se o pastor já for o titular.
- [ ] Bloqueio com hint visual caso outro pastor já seja o presidente da congregação.
- [ ] Backend valida no `POST /users/invites` se a congregação já tem presidente.
- [ ] Backend atualiza `Pastor.role = PASTOR_PRESIDENT` e `Church.presidentPastorId` no `acceptInvite`.
- [ ] Testes unitários do frontend e backend cobrindo os cenários de sucesso e bloqueio.
