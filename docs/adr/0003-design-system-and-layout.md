# ADR-003: Design system, tokens e modelo de layout

**Data**: 2026-09-04
**Status**: Accepted
**Tags**: `ui`, `design-system`, `tailwind`, `accessibility`

---

## 📋 Contexto

O console tem ~11 módulos com a mesma forma: listar com filtro, ver detalhe,
criar/editar em formulário. Sem um padrão escrito, cada módulo inventa o seu
espaçamento, o seu jeito de mostrar "vazio" e a sua paleta — e o resultado
parece três produtos diferentes.

O público é administrativo, usa o sistema em jornada de trabalho, muitas vezes
em telas pequenas de secretaria e em celular durante o culto.

---

## 🎯 Decisão

**Tailwind v4 com tokens semânticos + primitivos próprios no estilo shadcn/ui
(Radix por baixo onde há comportamento).**

### R1. Cor sempre por token semântico

Componente escreve `bg-surface`, `text-content-muted`, `bg-primary` —
**nunca** `bg-slate-800`, `text-gray-500`. Os tokens são definidos uma vez em
`src/index.css` no bloco `@theme`.

Motivo: trocar a identidade visual de uma igreja passa a ser trocar um bloco de
CSS, e o modo escuro é uma redefinição de tokens em vez de uma varredura por
`dark:` em cada arquivo.

| Token | Uso |
|-------|-----|
| `canvas` | fundo da aplicação |
| `surface` / `surface-muted` | cartão, tabela, cabeçalho de tabela |
| `border-subtle` | divisórias |
| `content` / `content-muted` | texto principal / secundário |
| `primary` / `primary-hover` / `primary-foreground` | ação principal |
| `success` / `warning` / `danger` | estado e feedback |

### R2. Primitivos no repositório, não pacote

Os componentes de `shared/ui/` são **nossos** (padrão shadcn/ui: código copiado,
não dependência). Comportamento acessível complexo — diálogo, select, menu —
vem do Radix. Assim o design system evolui com o produto sem esperar release de
terceiro, e sem reescrever gestão de foco.

### R3. `cva` para variantes

Variante de componente é declarada com `class-variance-authority` e mesclada com
`cn()` (clsx + tailwind-merge). Sem `if` de string de classe espalhado no JSX.

### R4. Todo estado de lista é explícito

Nenhuma listagem vai para produção sem resolver os quatro estados:
**carregando**, **erro** (com mensagem da API e `traceId`), **vazio** (com ação
de saída) e **com dados**. Os três primeiros já existem em `shared/ui/states.tsx`.

### R5. Acessibilidade é requisito, não polimento

- Todo controle tem rótulo (`<label>` amarrado por id, ou `aria-label`)
- Foco visível nunca é removido (`:focus-visible` global)
- Erro de campo ligado ao input por `aria-describedby`
- Ícone decorativo leva `aria-hidden`
- Existe "pular para o conteúdo" no shell

### R6. Layout: shell fixo, conteúdo respirando

Sidebar de 16rem fixa em `lg+`, gaveta em telas menores; topbar de 3.5rem
grudada; conteúdo em `max-w-7xl` centralizado. Detalhamento e exemplos em
[guides/layout-model.md](../guides/layout-model.md) — **documento normativo**
para qualquer tela nova.

### R7. Português em tudo que o usuário lê

Rótulo, mensagem, rota (`/membros`, não `/members`). Enum da API é traduzido na
feature (ex.: `member-status.ts`), nunca exibido cru.

---

## 🔀 Alternativas consideradas

| Alternativa | Por que não |
|-------------|-------------|
| Material UI / Ant Design | Traz identidade visual pronta e difícil de dobrar; peso alto; a igreja quer a cara dela |
| Tailwind puro sem primitivos | Duplicação de classe e acessibilidade reinventada em cada diálogo |
| shadcn/ui via CLI | O CLI é bem-vindo, mas o compromisso é com o código no repositório; a versão instalada não pode virar dependência oculta |

---

## ✅ Consequências

### Positivas
- Uma mudança de token repinta o produto inteiro
- Telas novas nascem parecidas com as antigas sem esforço
- Modo escuro sai quase de graça

### Negativas / Cuidados
- Manter primitivos é trabalho nosso (inclusive acessibilidade dos que não usam Radix)
- Tokens exigem revisão: a primeira vez que alguém escrever `bg-blue-600`, a regra começou a morrer

---

## ✔️ Critérios de aceite

- [ ] Nenhuma cor literal do Tailwind (`slate-*`, `gray-*`, `blue-*`) em `features/` e `layouts/`
- [ ] Toda listagem trata os 4 estados de R4
- [ ] Todo input tem rótulo associado
- [ ] Tela nova segue o esqueleto de `layout-model.md`

---

## 📚 Referências

- [Modelo de layout](../guides/layout-model.md)
- [Guia de padrões de componente](../guides/component-patterns-guide.md)
