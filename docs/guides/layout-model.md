# Modelo de Layout — Console CMSaaS

**Status**: Normativo · Ref.: [ADR-003](../adr/0003-design-system-and-layout.md)

Toda tela nova segue este documento. Ele existe para que onze módulos feitos em
momentos diferentes (e por pessoas ou agentes diferentes) pareçam **o mesmo
produto**.

---

## 1. Grade da aplicação

```
┌───────────────┬──────────────────────────────────────────────────┐
│               │  Topbar  h-topbar (3.5rem) · sticky · z-20       │
│  Sidebar      ├──────────────────────────────────────────────────┤
│  w-sidebar    │                                                  │
│  (16rem)      │   Conteúdo                                       │
│  fixa em lg+  │   mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8     │
│  gaveta <lg   │                                                  │
│               │                                                  │
└───────────────┴──────────────────────────────────────────────────┘
```

- **Sidebar**: `AppShell.tsx`. Em `lg+` é fixa; abaixo vira gaveta com overlay.
  Itens agrupados por seção (`navigation.ts`), item ativo em `bg-primary/10 text-primary`.
- **Topbar**: botão de menu (só em mobile), espaço livre, identidade do usuário
  (nome + roles), avatar de iniciais e sair.
- **Conteúdo**: largura máxima `max-w-7xl`. Nunca largura total — linha longa
  demais cansa a leitura de tabela.

Breakpoints usados: `sm` 640 · `lg` 1024. Abaixo de `lg`, a sidebar some.

---

## 2. Anatomia de uma página

Toda página é uma pilha vertical com `space-y-6`:

```tsx
<div className="space-y-6">
  <PageHeader title="…" description="…" actions={…} />   {/* 1 */}
  <Card>                                                  {/* 2 */}
    <form>…filtros…</form>
    …tabela…
    <Pagination … />
  </Card>
</div>
```

1. **PageHeader** — título (`text-xl font-semibold`), descrição opcional em
   `text-content-muted`, ações primárias à direita. Só uma ação primária por
   página; as demais são `outline` ou `ghost`.
2. **Card** — cada bloco funcional em seu cartão (`rounded-card border
   border-border-subtle bg-surface`).

### Página de listagem (padrão dominante)

Referência viva: `src/features/members/MembersPage.tsx`.

```
PageHeader (título + "Novo X" se can('x.write'))
Card
├── barra de filtros  (form, border-b, p-4, flex-wrap gap-3)
│     busca com ícone · selects de enum · botão Filtrar
├── um dos quatro estados:
│     LoadingState  |  ErrorState  |  EmptyState  |  <Table/>
└── Pagination (border-t)
```

Regras:
- Filtro vai para a **query string** (ADR-002 R4), não para `useState`.
- Busca textual é submetida em `form` (Enter funciona); selects aplicam na hora.
- `limit` padrão 20 (o backend recusa acima de 100).

### Página de detalhe

```
PageHeader (nome do registro + ações: Editar, Excluir)
Card "Dados gerais"      → grid de definição rótulo/valor
Card "Endereço"
Card "Relacionamentos"   → listas curtas com link
```

Grid de definição: `grid gap-4 sm:grid-cols-2 lg:grid-cols-3`, cada item com
rótulo em `text-xs uppercase text-content-muted` e valor em `text-sm text-content`.
Valor ausente é `—`, nunca vazio.

### Modal ou página? (regra)

| Situação | Forma | Exemplo no código |
|----------|-------|-------------------|
| Até ~12 campos, a pessoa volta para a lista | **Modal** (`Dialog`, `size="lg"`) | `PastorFormDialog`, `CellFormDialog`, `MusicianFormDialog`, `AssetFormDialog` |
| Muitos campos, várias seções | **Página** | `MemberFormPage`, `ScheduleFormPage`, `SermonFormPage` |
| Ação pontual sobre um registro | **Modal** | `MaintenanceDialog`, upload de documento, escalar músico |
| Seleção múltipla | **Modal** com filtro + checkboxes | participantes da célula, check-in em lote |
| Confirmar ação destrutiva | **`ConfirmDialog`** | excluir membro, cancelar evento, dar baixa |

Modal usa Radix por baixo: foco preso, Esc e leitura por leitor de tela vêm prontos.
Nunca construa um modal com `div` posicionada à mão.

### Página de formulário

```
PageHeader (Novo X / Editar X)
Card
├── seções com <fieldset> e legenda
├── grid gap-4 sm:grid-cols-2  (campo curto = 1 coluna, textarea = 2)
└── rodapé: [Cancelar (outline)] [Salvar (primary)] alinhados à direita
```

- Um campo por conceito, na ordem em que a pessoa pensa (identificação →
  contato → endereço → dados eclesiásticos).
- Campo obrigatório marcado com `*` no rótulo.
- Erro de campo vem por baixo, em `text-danger text-xs`, ligado por
  `aria-describedby` (use `<Field>`).
- Erro de validação da API (`400 VALIDATION_ERROR` com `details[]`) é
  distribuído nos campos correspondentes — não vira só um toast.

---

## 3. Os quatro estados obrigatórios

Use `<QueryStates>` — ele resolve os quatro de uma vez, e a página fica só com
as colunas e as ações:

```tsx
<QueryStates
  query={query}
  skeleton={<TableSkeleton columns={6} />}
  isEmpty={(data) => data.data.length === 0}
  empty={<EmptyState title="Nenhum membro encontrado" action={…} />}
>
  {(data) => <Table>…</Table>}
</QueryStates>
```

| Estado | Componente | Quando |
|--------|-----------|--------|
| Carregando | `TableSkeleton` / `CardSkeleton` (esqueleto, não spinner) | `isPending` da query |
| Erro | `ErrorState` | `isError`; mostra a mensagem traduzida + `traceId` + "Tentar de novo" |
| Vazio | `EmptyState` | resposta com `data.length === 0`; sempre com uma saída (criar, limpar filtro) |
| Vazio **por filtro** | `EmptyState` com "Limpar filtros" | `hasFilters` verdadeiro — não ofereça "cadastrar" nesse caso |
| Com dados | tabela/cards | resto |

Nunca renderize tabela vazia com cabeçalho e nada embaixo: isso parece defeito.
E prefira **esqueleto** ao spinner nas listas: mantém a altura da página e põe o
olho onde o dado vai aparecer.

---

## 4. Tabelas

- Cabeçalho em `bg-surface-muted`, rótulo `uppercase text-xs text-content-muted`
- Linhas separadas por `divide-y divide-border-subtle`, hover discreto
- **Primeira coluna** é o identificador humano (nome/título) em `font-medium`
- Colunas de apoio em `text-content-muted`
- Datas: `formatDate` (LocalDate) ou `formatDateTime` (instante UTC → fuso local)
- Dinheiro: `formatCurrency`, sempre alinhado à direita
- Status: `<Badge>` com o tom da tabela do domínio (ver `member-status.ts`)
- O scroll horizontal fica **dentro** do wrapper da tabela; a página nunca rola no eixo X

Máximo de 7 colunas. Acima disso, mova o excedente para o detalhe.

---

## 5. Cores de estado

| Situação | Tom do Badge |
|----------|--------------|
| Ativo, confirmado, concluído | `success` |
| Neutro, inativo, rascunho | `neutral` |
| Suspenso, pendente, atenção (manutenção vencendo) | `warning` |
| Excluído, cancelado, quebrado, falha | `danger` |
| Informativo, em andamento | `info` |

Cor **nunca** é o único portador de informação: o texto do badge diz o mesmo.

---

## 6. Feedback de ação

| Evento | Feedback |
|--------|----------|
| Mutação com sucesso | `toast.success` curto ("Membro salvo.") |
| Mutação com erro | `toast.error` com a mensagem da `ApiError` |
| Erro de validação (400) | erro **nos campos**, e um toast genérico só se houver erro sem campo |
| Ação destrutiva | diálogo de confirmação nomeando o registro |
| Operação longa | botão em estado ocupado com spinner, nunca a tela inteira travada |

Confirmação de exclusão diz o que acontece de verdade: no backend `DELETE` é
**soft delete** (ADR-004 C6) — "o registro sai das listagens", não "será apagado
permanentemente".

---

## 7. Espaçamento e tipografia

| Uso | Classe |
|-----|--------|
| Entre blocos da página | `space-y-6` |
| Dentro de um cartão | `p-5` (cabeçalho `px-5 py-4`) |
| Entre campos de formulário | `gap-4` |
| Título de página | `text-xl font-semibold tracking-tight` |
| Título de cartão | `text-base font-semibold` |
| Texto de dados | `text-sm` |
| Rótulo/metadado | `text-xs text-content-muted` |

Escala restrita de propósito: `text-xs`, `text-sm`, `text-base`, `text-xl`.

---

## 8. Responsivo

- Mobile primeiro: grids começam em 1 coluna e crescem em `sm:` / `lg:`
- Tabela em telas estreitas: rolagem horizontal no wrapper (o padrão) ou
  lista de cartões, quando forem poucos campos
- Barra de filtros usa `flex-wrap`; nenhum controle abaixo de `min-w-56`
- Alvo de toque mínimo de 40px (`size-10` nos botões de ícone)

---

## 9. Modo escuro

Uma classe `dark` no `<html>` troca os tokens. Componente **não** escreve
`dark:` — se precisou, o token está faltando. A preferência do sistema é o
padrão; a escolha explícita do usuário (quando existir o seletor) fica no
`localStorage`.

---

## 10. Checklist da tela nova

- [ ] Segue o esqueleto da seção 2
- [ ] Nenhuma cor literal do Tailwind — só tokens
- [ ] Quatro estados resolvidos
- [ ] Filtros na URL
- [ ] Ações escondidas por `can(...)` quando a API exige role
- [ ] Rótulos, rota e enums em português
- [ ] Todo input com rótulo; foco visível preservado
- [ ] Testada em 375px de largura
- [ ] Cadastro/edição na forma certa (modal × página, tabela da seção 2)
- [ ] Ação destrutiva passa por `ConfirmDialog` dizendo o efeito real
