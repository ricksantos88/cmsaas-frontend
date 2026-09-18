# Mapa de Endpoints — o que o console consome

Fonte de verdade: os controllers em `project-ccvm/src/main/kotlin/com/cmsaas/api/v1/`
e o Swagger em `/swagger-ui.html`. Esta tabela é o **mapa de consumo**: o que a web
usa, com que role, e onde está o código do cliente.

> `churchId` **nunca** vai na requisição (ADR-004 do backend). Ele só aparece em resposta.

## Auth — `features/auth/auth.api.ts`

| Método | Rota | Uso na web |
|--------|------|-----------|
| POST | `/api/v1/auth/login` | Tela de login; barra MEMBER/GUEST (ADR-005) |
| POST | `/api/v1/auth/refresh` | Interceptor, no 401 |
| POST | `/api/v1/auth/logout` | Botão sair |
| GET | `/api/v1/auth/me` | Boot da aplicação (restaurar sessão) |
| PUT | `/api/v1/auth/me` | Minha conta → nome e e-mail (e-mail exige `currentPassword` e encerra a sessão) |
| POST | `/api/v1/auth/change-password` | Minha conta → Segurança (encerra a sessão depois) |
| POST | `/api/v1/auth/forgot-password` | ⏳ recuperação de senha (Fase 7) |
| POST | `/api/v1/auth/reset-password` | ⏳ recuperação de senha (Fase 7) |
| POST | `/api/v1/auth/register-church` | Onboarding self-service de igreja e pastor presidente (ADR-008, ADR-009) |
| POST | `/api/v1/auth/accept-invite` | Aceite de convite de operador com definição de senha |
| GET | `/api/v1/auth/my-churches` | Listar congregações vinculadas ao usuário logado (ADR-009) |
| POST | `/api/v1/auth/switch-church` | Alternar congregação ativa e emitir novos tokens (ADR-009) |

## Church — `features/church/church.api.ts`

| Método | Rota | Roles | Tela |
|--------|------|-------|------|
| GET | `/churches/{id}` | SUPER_ADMIN, PASTOR_PRESIDENT, ADMIN_CHURCH | Dados da igreja |
| PUT | `/churches/{id}` | idem | Dados da igreja |
| POST | `/churches` | SUPER_ADMIN | Igrejas da plataforma |
| GET | `/churches` | SUPER_ADMIN | Igrejas da plataforma |
| DELETE | `/churches/{id}` | SUPER_ADMIN | Igrejas da plataforma |

## Pastor — `features/pastors/pastors.api.ts`

| Método | Rota | Roles de escrita | Tela |
|--------|------|------------------|------|
| GET | `/pastors` · `/pastors/{id}` | leitura: autenticado | Pastores |
| POST/PUT/DELETE | `/pastors` | PASTOR_PRESIDENT, ADMIN_CHURCH | Pastores |
| GET | `/pastors/{id}/contacts` | autenticado (filtra por visibilidade) | Detalhe do pastor |

## Member — `features/members/members.api.ts`

| Método | Rota | Roles de escrita |
|--------|------|------------------|
| GET | `/members` · `/members/{id}` | leitura: autenticado |
| POST/PUT/DELETE | `/members` | PASTOR_PRESIDENT, PASTOR_AUXILIARY, ADMIN_CHURCH |

Filtros: `search`, `status`, `baptized`, `city`, `fromDate`, `toDate`, `sortBy`, `sortOrder`.

> `GET /members/{id}/family` e `POST /members/{id}/connect-pastor` estão no contrato,
> mas **não existem** no controller. Não chame.

## Cell — `features/cells/cells.api.ts`

| Método | Rota | Observação |
|--------|------|-----------|
| GET/POST/PUT/DELETE | `/cells` | escrita administrativa |
| POST | `/cells/{id}/members` | adiciona participantes em lote |
| DELETE | `/cells/{id}/members/{memberId}` | remove um participante |

## Musician — `features/musicians/musicians.api.ts`

CRUD em `/musicians`; escrita inclui `WORSHIP_LEADER`.
Recadastrar um músico removido **reativa** o registro (o POST devolve 200/201, não 409).

## Asset — `features/assets/assets.api.ts`

| Método | Rota | Observação |
|--------|------|-----------|
| GET | `/assets` · `/assets/{id}` | restrito a PASTOR_*, ADMIN_CHURCH, TREASURER |
| GET | `/assets/summary` | cartões do painel e da tela de patrimônio |
| POST/PUT | `/assets` | `assetTag` único por igreja → 409 |
| DELETE | `/assets/{id}` | **baixa**: status `DISPOSED` + soft delete |
| POST | `/assets/{id}/maintenance` | registra manutenção e a próxima prevista |

## Document — `features/documents/documents.api.ts`

| Método | Rota | Observação |
|--------|------|-----------|
| POST | `/documents` | `multipart/form-data`; 413 se exceder o teto |
| GET | `/documents` | a listagem já esconde privados sem acesso |
| GET | `/documents/{id}/download` | via blob (precisa do header de autorização) |
| GET | `/documents/categories` | ⏳ ainda não consumido (usamos os rótulos locais) |
| PUT | `/documents/{id}` | Editar metadados (o arquivo não é substituível) |
| DELETE | `/documents/{id}` | administrativo |

`allowDownload` da resposta decide se o botão aparece — não reimplemente a regra.

## Schedule — `features/schedules/schedules.api.ts`

| Método | Rota | Observação |
|--------|------|-----------|
| GET | `/schedules` · `/schedules/{id}` | GUEST só vê `PUBLIC` |
| GET | `/schedules/calendar?year&month` | dias agrupados **em UTC** |
| POST/PUT | `/schedules` | administrativo |
| DELETE | `/schedules/{id}` | cancela (não apaga) |
| GET/POST | `/schedules/{id}/attendance` | check-in individual ou em lote, idempotente |
| DELETE | `/schedules/{id}/attendance/{memberId}` | desfaz o check-in |
| GET/POST | `/schedules/{id}/musicians` | escala; escrita inclui `WORSHIP_LEADER` |
| PUT/DELETE | `/schedules/{id}/musicians/{musicianId}` | confirma/remove |

## Sermon — `features/sermons/sermons.api.ts`

| Método | Rota | Observação |
|--------|------|-----------|
| GET | `/sermons` · `/sermons/{id}` | visibilidade por role |
| GET | `/sermons/trending?period&limit` | painel lateral da lista |
| GET | `/sermons/{id}/recommendations` | mesma temática |
| POST/PUT/DELETE | `/sermons` | administrativo |
| POST | `/sermons/{id}/like` | exige `memberId` no corpo — **não** consumido na web |

> O like pede `memberId` porque ainda não existe vínculo usuário↔membro no backend.
> É funcionalidade do app do membro, não do console.

## Finance — `features/finances/finances.api.ts`

| Método | Rota | Observação |
|--------|------|-----------|
| GET | `/finances/entries` | Listagem de extrato com filtros, restrito a PASTOR_PRESIDENT, ADMIN_CHURCH, TREASURER |
| POST/PATCH/DELETE | `/finances/entries` · `/finances/entries/{id}` | CRUD de transações |
| GET | `/finances/report` | Relatório DRE agrupado por categorias |
| GET | `/finances/categories` | Lista de categorias financeiras |
| POST/PUT/DELETE | `/finances/categories` · `/finances/categories/{id}` | Manutenção de categorias |

> Categorias com `isSystemDefault: true` não exibem botão de excluir (regra de UI).

## Notification — `features/notifications/notifications.api.ts`

| Método | Rota | Observação |
|--------|------|-----------|
| GET | `/notifications` | inbox do próprio usuário (traz `unreadCount`) |
| PATCH | `/notifications/{id}/read` · `/read-all` | marcar como lido |
| POST | `/notifications` | envio; audiência resolvida no disparo |
| GET/PUT | `/notifications/preferences` | Minha conta → Preferências |
| POST/DELETE | `/notifications/devices` | só faz sentido no app mobile |

## Users & Invites — `features/users/users.api.ts`

| Método | Rota | Observação |
|--------|------|-----------|
| POST | `/api/v1/users/invites` | Gerar convite com código numérico de 4 dígitos (expira em 48h) |
| POST | `/api/v1/users/invites/accept` | Primeiro acesso / ativação de convite com definição de senha e login imediato |
| GET | `/api/v1/users/invites/pending` | Listagem de convites pendentes e válidos da igreja |
| DELETE | `/api/v1/users/invites/{id}` | Cancelar convite pendente |
| GET | `/api/v1/users` | Listar operadores/usuários da igreja |
| PATCH | `/api/v1/users/{id}/roles` | Atualizar papéis/permissões do usuário |
| PATCH | `/api/v1/users/{id}/status` | Ativar ou inativar usuário (revoga sessões) |

## O que o backend não oferece

- Alterar `roles`, `churchId` ou `status` do próprio usuário pelo `PUT /auth/me` —
  ignora esses campos de propósito; quem define é a administração via `/api/v1/users/{id}`
- Endpoint de dashboard agregado (o painel soma `totalItems` de listagens)
- Push real (a porta existe; o envio atual é em log/simulado)
