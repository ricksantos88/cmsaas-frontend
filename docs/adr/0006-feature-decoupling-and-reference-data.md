# ADR-006: Desacoplamento entre Features, Dados de Referência e Telas Compostas

**Data**: 2026-09-13  
**Status**: Accepted  
**Autores**: Antigravity & Equipe CMSaaS  
**Tags**: `architecture`, `features`, `boundaries`, `shared`, `code-structure`

---

## 📋 Contexto

O console web do CMSaaS foi concebido com uma arquitetura *feature-first* (ADR-001). A Regra 8 do `AGENTS.md` e o `code-structure-guide.md` estabelecem formalmente:
> *"Feature não importa de outra feature — exceto `features/auth`. Código comum sobe para `shared/`."*
> *"Tela sem dono de domínio (404, 403, painel) | `pages/`"*

À medida que os domínios foram sendo construídos, identificou-se acoplamento cruzado entre features:
1. Vários formulários precisam de seletores de outros domínios (ex.: cadastro de célula precisa de membros e pastores; cadastro de evento precisa de pastores e músicos; formulário de patrimônio precisa de membros).
2. Hooks como `useMemberOptions`, `usePastorOptions`, `useCellOptions` e `useMusicianOptions` foram declarados dentro de suas respectivas features em `features/<dominio>/<dominio>.queries.ts`, e outras features passaram a importá-los diretamente.
3. Invalidação de cache cruzada: `cells.queries.ts` importa chaves de consulta (`memberKeys`) diretamente de `features/members/`.
4. Páginas como a `DashboardPage`, que não pertencem a um domínio único mas sim compõem dados de seis domínios diferentes, foram alocadas dentro de `features/dashboard/` em vez de `pages/`.

Isso enfraquece os limites arquiteturais, gera acoplamento espaguete entre módulos e dificulta a evolução independente das features.

---

## 🎯 Decisão

Reforçar a fronteira estrita entre features através das seguintes regras normativas:

### R1. Isolamento Estrito de Features
Nenhum arquivo em `src/features/<A>/` pode importar de `src/features/<B>/`, onde `<A> ≠ <B>`, exceto de `src/features/auth/` (que é infraestrutura de identidade e controle de acesso transversal).

### R2. Centralização de Dados de Referência e Seletores em `shared/`
Consultas leves destinadas a popular seletores (`combobox`/`select`), como listas simplificadas de membros ativos, pastores, células e músicos, são classificadas como **dados de referência compartilhados**. Elas devem residir em `src/shared/queries/options.queries.ts`, consumindo os endpoints padrão sem acoplar os componentes a módulos específicos.

### R3. Telas Compostas e Agregadoras Residem em `pages/`
Telas que compõem múltiplos domínios e não possuem dono funcional único (como o Painel / Dashboard principal, páginas de erro 403, 404) residem em `src/pages/`, importando os blocos ou queries necessárias das features como compositoras de mais alto nível.

### R4. Invalidação Transversal de Cache
Quando uma mutação em um domínio precisa invalidar consultas de outro domínio (ex.: atualizar membros de uma célula altera o status ou contagem de membros), deve-se invalidar pela chave canônica da query em formato de array de strings literais (ex.: `queryClient.invalidateQueries({ queryKey: ['members'] })`), eliminando a dependência direta do objeto de chaves exportado pela outra feature.

---

## 🔀 Alternativas consideradas

| Alternativa | Prós | Contras | Por que não |
|-------------|------|---------|-------------|
| **Permitir imports cruzados apenas de `.queries.ts`** | Menor esforço imediato de refatoração | Cria dependências circulares e acoplamento descontrolado com o crescimento do projeto | Viola a regra fundamental de modularidade e torna testes isolados complexos |
| **Criar uma feature agregadora `features/common`** | Agrupa utilitários | Vira um "lixão" genérico sem semântica clara | O projeto já tem convenção estrita de que código compartilhado sobe para `shared/` |
| **Adotar ADR-006 (Centralização em `shared/` e `pages/`)** | Código aderente ao `code-structure-guide.md` e `AGENTS.md`, modularidade garantida | Exige mover os hooks de options e ajustar imports | É a solução limpa, escalável e alinhada com as diretrizes do projeto |

---

## ✅ Consequências

### Positivas
- Respeito integral à Regra 8 do `AGENTS.md`.
- Features verdadeiramente desacopladas: uma feature pode ser alterada, movida ou testada sem efeito cascata em outras.
- Clareza sobre onde colocar novas telas agregadoras e seletores.

### Negativas / Cuidados
- Necessidade de manter as chaves de query sincronizadas ao usar invalidação transversal por chave literal.

---

## ✔️ Critérios de aceite

- [ ] Zero ocorrências de `import ... from '@/features/<A>'` dentro de `src/features/<B>` (onde `A ≠ B` e `A ≠ auth`).
- [ ] `DashboardPage` localizada em `src/pages/DashboardPage.tsx`.
- [ ] Hooks de options centralizados em `src/shared/queries/options.queries.ts`.
- [ ] `npm run check` (typecheck, lint e testes) passando com 100% de sucesso.

---

## 📚 Referências

- Guia de Estrutura de Código: `docs/guides/code-structure-guide.md`
- Regras de Desenvolvimento: `AGENTS.md`
- [ADR-001](./0001-frontend-architecture.md)
