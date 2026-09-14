# ADR-0011: Sistema de Cores Sóbrias Eclesiásticas (Sálvia Nobre & Terracota Cálido)

**Status**: Accepted  
**Data**: 2026-09-13  
**Decisores**: Wendel Santos & IA Pair  
**Consulta**: [ADR-003](./0003-design-system-and-layout.md)

---

## 🎯 Contexto

O console administrativo CMSaaS utilizava inicialmente uma paleta genérica monocromática baseada em azul-índigo frio (`oklch(0.48 0.15 258)`), que carecia de identidade própria e calor humano condizente com a administração pastoral e eclesiástica de comunidades de fé.

Após pesquisa e prototipagem interativa de opções temáticas sóbrias (Vinho Litúrgico, Azul Aliança, Verde Oliveira e Índigo Real), foi aprovada a identidade **Sálvia Nobre & Terracota Cálido** — que combina o frescor sereno, acolhedor e pastoral da sálvia fechada com a nobreza e acolhimento caloroso do terracota litúrgico.

---

## 🏛️ Decisão

Substituir as definições cromáticas do `@theme` em `src/index.css` pela paleta **Sálvia Nobre & Terracota Cálido**, mantendo o uso estrito do espaço de cor perceptualmente uniforme **OKLCH** e compatibilidade com Tailwind CSS v4.

### R1. Cores e Tokens Primários (Modo Claro)
- **Canvas (Fundo Geral)**: `oklch(0.985 0.005 140)` (`#F9FAF7`) — linho neutro e acolhedor, evitando o branco ofuscante.
- **Superfícies (Cards e Modais)**: `oklch(1 0 0)` (`#FFFFFF`) e `oklch(0.965 0.008 140)` (`#F1F3ED`) para contrastes suaves.
- **Bordas Sutis**: `oklch(0.90 0.012 140)` (`#E0E3D8`).
- **Texto Principal (Content)**: `oklch(0.20 0.025 145)` (`#1D2B22`) — grafite florestal profundo com taxa de contraste superior a 14:1 (WCAG AAA).
- **Texto Secundário (Content Muted)**: `oklch(0.48 0.025 145)` (`#5F6E64`).
- **Primária (Ações e Destaques Principais)**: `oklch(0.38 0.085 145)` (`#2A4333`) — Sálvia Nobre Eclesiástica.
- **Hover Primário**: `oklch(0.31 0.085 145)` (`#1C2E23`).
- **Acento (Terracota Cálido)**: `oklch(0.58 0.16 48)` (`#B85D36`) — utilizado para tags litúrgicas, chamadas e calor visual.
- **Alerta / Sucesso / Erro**: Tons calibrados para manter a sobriedade sem cores neon ou gritantes.

### R2. Suporte ao Modo Escuro (`.dark`)
- **Canvas Noturno**: `oklch(0.15 0.015 145)` (`#0F1410`) — grafite musgo escuro, preservando a harmonia botânica.
- **Superfície Noturna**: `oklch(0.20 0.018 145)` (`#171F19`).
- **Borda Noturna**: `oklch(0.31 0.020 145)` (`#2F3D34`).
- **Texto Noturno**: `oklch(0.96 0.006 145)` (`#F6F9F7`).
- **Primária Noturna**: `oklch(0.65 0.11 145)` (`#5A9E72`) — sálvia iluminada de alto contraste.
- **Acento Noturno**: `oklch(0.68 0.16 48)` (`#E07A4E`).

### R3. Adição da Variante `accent` no Componente `Badge`
O componente `src/shared/ui/badge.tsx` foi estendido com o tom `accent` (`bg-accent/15 text-accent`), permitindo destacar situações e tags especiais com a tonalidade terracota.

---

## 🔀 Alternativas consideradas

| Alternativa | Prós | Contras | Por que não |
| :--- | :--- | :--- | :--- |
| **Manter Azul Padrão** | Zero alteração de CSS | Impessoal, visual de ERP corporativo genérico sem conexão com a igreja | Não transmite a serenidade e acolhimento pastoral desejados |
| **Borgonha / Vinho Sacro** | Tradicional e nobre | Mais formal/pesado para telas de trabalho cotidiano e secretaria | O verde sálvia oferece maior leveza e conforto ocular no uso prolongado |
| **Cipreste Quase-Grafite** | Extremamente sóbrio | Pouco acolhimento térmico visual | Faltava o toque caloroso e comunitário do terracota |

---

## ✅ Consequências

### Positivas
- Identidade visual coesa, pastoral, solene e altamente profissional.
- Conforto ocular no uso diário contínuo por secretários, pastores e tesoureiros.
- Manutenção rigorosa das regras da ADR-003 (zero cores literais em telas; tudo deriva dos tokens do design system).
- Acessibilidade visual plena (WCAG 2.1 AAA em textos principais e AA em elementos interativos).

---

## ✔️ Critérios de aceite

- [x] Tokens `@theme` e `.dark` atualizados em `src/index.css`.
- [x] Variante `accent` incorporada ao `Badge` (`src/shared/ui/badge.tsx`).
- [x] `npm run check` (typecheck + lint + testes) passando 100%.
- [x] `npm run build` compilando limpo em produção.
