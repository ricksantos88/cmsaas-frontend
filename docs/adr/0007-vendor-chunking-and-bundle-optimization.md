# ADR-007: Estratégia de Chunking de Vendor e Otimização de Performance de Bundle

**Data**: 2026-09-13  
**Status**: Accepted  
**Autores**: Antigravity & Equipe CMSaaS  
**Tags**: `performance`, `vite`, `rollup`, `bundle`, `code-splitting`

---

## 📋 Contexto

O console web já utiliza divisão de código por rotas via `React.lazy` (ADR-001 e `routes.tsx`), mantendo as telas individuais leves (3 a 13 kB).

No entanto, as dependências externas foram compiladas em um único chunk monolithic inicial `index-[hash].js` de 661 kB minificado (ultrapassando o threshold de 500 kB do Vite/Rollup). Esse chunk concentra bibliotecas de propósitos e frequências de atualização distintos:
- React e React DOM (`react`, `react-dom`)
- Roteador (`react-router`)
- Gerenciador de estado e cache de servidor (`@tanstack/react-query`)
- Biblioteca de componentes primitivos Radix UI (`@radix-ui/*`)
- Biblioteca de ícones (`lucide-react`)
- Utilitários de validação e formulário (`zod`, `react-hook-form`, `@hookform/resolvers`)

Qualquer alteração na aplicação ou em uma dependência pontual invalida o cache de navegador de todo o bloco de 661 kB, degradando o tempo de carregamento inicial (LCP) dos operadores da plataforma.

---

## 🎯 Decisão

Configurar a divisão explícita de dependências terceiras (*vendor chunking*) no `vite.config.ts` através de `build.rollupOptions.output.manualChunks`, adotando as seguintes regras:

### R1. Separação Semântica de Vendors
O código de terceiros em `node_modules` deve ser dividido em chunks bem delimitados por domínio técnico:
1. `vendor-react`: `react`, `react-dom` (fundação imutável com cache de longa duração).
2. `vendor-router`: `react-router` (navegação).
3. `vendor-query`: `@tanstack/react-query` (camada de dados e cache).
4. `vendor-ui`: `@radix-ui/*`, `class-variance-authority`, `clsx`, `tailwind-merge` (primitivos visuais).
5. `vendor-icons`: `lucide-react` (ícones SVG tree-shaken).
6. `vendor-forms`: `react-hook-form`, `@hookform/resolvers`, `zod` (validação e formulários).

### R2. Teto de Tamanho por Chunk
Nenhum chunk de produção gerado pelo build deve ultrapassar o limite padrão de aviso de 500 kB minificado.

---

## 🔀 Alternativas consideradas

| Alternativa | Prós | Contras | Por que não |
|-------------|------|---------|-------------|
| **Manter chunk único de vendor** | Zero configuração adicional | Pior aproveitamento do cache HTTP do navegador; bundle inicial > 500 kB dispara avisos no build | Prejudica a performance de rede em conexões instáveis |
| **Separar cada dependência em um chunk (`node_modules/<pkg>`)** | Chunks minúsculos | Overhead de requisições HTTP (mesmo com HTTP/2) e grafo de módulos fragmentado | Causa degradação de performance por excesso de requisições paralelas |
| **Adotar ADR-007 (Grupos semânticos de vendor)** | Chunks equilibrados (< 200 kB cada), cache de longa duração eficiente | Exige configuração no `rollupOptions` | É a prática padrão recomendada para SPAs modernas |

---

## ✅ Consequências

### Positivas
- Eliminação do warning do Rollup de chunks acima de 500 kB.
- Melhor aproveitamento de cache de longo prazo pelo navegador: atualizar formulários ou queries não invalida o chunk de UI ou de React.
- Melhora expressiva nas métricas de Core Web Vitals (LCP / FCP).

### Negativas / Cuidados
- Monitorar a integridade das referências circulares entre chunks de vendor ao atualizar bibliotecas principais.

---

## ✔️ Critérios de aceite

- [ ] `npm run build` conclui sem alertas de chunk superior a 500 kB.
- [ ] Chunks `vendor-react`, `vendor-router`, `vendor-query`, `vendor-ui` gerados separadamente no diretório `dist/assets/`.
- [ ] Aplicação continua carregando e funcionando perfeitamente sem erros de importação assíncrona.

---

## 📚 Referências

- Rollup `output.manualChunks`: https://rollupjs.org/configuration-options/#output-manualchunks
- [ADR-001](./0001-frontend-architecture.md)
