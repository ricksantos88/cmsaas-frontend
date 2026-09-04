# Guia de Padrões de Componente

Ref.: [ADR-003](../adr/0003-design-system-and-layout.md) ·
[Modelo de layout](./layout-model.md)

## Composição antes de configuração

Prefira um componente que aceita filhos a um que aceita quinze props.

```tsx
// ✅
<Card>
  <CardHeader><CardTitle>Dados gerais</CardTitle></CardHeader>
  <CardBody>…</CardBody>
</Card>

// ❌
<Card title="Dados gerais" showHeader headerBordered bodyPadding="lg" />
```

## Variantes com `cva`

Variante nova de um primitivo entra no `cva` dele (arquivo `*-variants.ts`),
não num `className` condicional espalhado pelo JSX.

## `asChild` para elemento semântico

Botão que navega é um link. `<Button asChild><Link to="/">…</Link></Button>`
mantém a aparência de botão com a semântica certa.

## Contêiner e apresentação

Página busca dados (`useQuery`) e decide estado. Componente de apresentação
recebe dados por prop e não conhece a API — é o que o torna testável sem MSW.

## Formulário

- `react-hook-form` para estado, `zod` para regra
- `<Field>` amarra rótulo, controle, dica e erro por id
- Botão de submit ocupado durante `isSubmitting`
- Nunca desabilite o submit por "formulário inválido": deixe submeter e mostre
  onde está o problema

## Listagem

Copie o esqueleto de `features/members/MembersPage.tsx`. Ele já resolve filtro na
URL, quatro estados, paginação e recorte por permissão.

## Acessibilidade — o mínimo que não se negocia

| Situação | O que fazer |
|----------|-------------|
| Input | rótulo associado (`<Field>`) ou `aria-label` |
| Botão só com ícone | `aria-label` descrevendo a ação |
| Ícone decorativo | `aria-hidden` |
| Diálogo, menu, select rico | Radix (foco e teclado prontos) |
| Erro de campo | `aria-describedby` apontando a mensagem |
| Estado de erro na tela | `role="alert"` |
| Carregando | `role="status"` |

## Performance — na ordem certa

1. Não busque o que não vai mostrar (`enabled`, paginação)
2. Não re-renderize a árvore inteira: selecione fatia do store
   (`useSessionStore((s) => s.user)`), não o store inteiro
3. Só então pense em `memo`/`useMemo` — e com medição, não por hábito

Lista grande (>200 linhas visíveis) pede virtualização; até lá, é paginação.

## Antipadrões

- Prop `data` genérica com `any`
- Componente que faz fetch **e** desenha **e** decide permissão
- `useEffect` para derivar estado que dá para calcular na renderização
- Estado duplicado entre React Query e `useState`
