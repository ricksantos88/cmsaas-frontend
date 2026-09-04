# Guia de Testes

Stack: **Vitest** + **Testing Library** + **MSW**. Meta de cobertura: **80%** de
linhas (mesma do backend), verificada em `npm run test:coverage`.

## O que testar

| Camada | Vale a pena? | Como |
|--------|--------------|------|
| `shared/lib` (formatação, `cn`) | ✅ sempre | teste unitário puro |
| `shared/api` (tradução de erro, interceptor) | ✅ sempre | unitário + MSW |
| `permissions.ts` | ✅ sempre | tabela de casos por role |
| Página (listagem, formulário) | ✅ os caminhos que importam | render + MSW |
| Primitivo de UI (`Button`, `Card`) | ⚠️ só o comportamento | não teste classe CSS |
| Tipos | ❌ | o compilador já faz |

## Regra de ouro

Teste **comportamento pela interface pública**. Se o teste quebra ao renomear uma
função interna ou uma classe do Tailwind, o teste estava errado.

```tsx
// ✅ o usuário vê isso
expect(await screen.findByText('Maria Souza')).toBeInTheDocument()

// ❌ detalhe de implementação
expect(wrapper.find('.member-row-name')).toHaveLength(1)
```

## Consultas, em ordem de preferência

`getByRole` → `getByLabelText` → `getByText` → `getByTestId` (último recurso).
Se só o `data-testid` funciona, provavelmente falta acessibilidade no componente.

## MSW

O backend falso vive em `src/test/msw/`. `onUnhandledRequest: 'error'`:
requisição sem handler **quebra o teste** — chamada inesperada é bug, não ruído.

Para o caminho triste, sobrescreva no próprio teste:

```ts
server.use(
  http.get('*/api/v1/members', () =>
    errorResponse(403, 'INSUFFICIENT_PERMISSIONS', 'sem permissão'),
  ),
)
```

## Renderizando com providers

`renderWithProviders(ui, { roles, route })` monta router e React Query (com
`retry: false`) e injeta a sessão. Use `roles` para testar recorte por permissão.

## TDD onde paga

Regra de verdade — permissão, tradução de erro, formatação, montagem de payload
com campo limpável — nasce do teste. Layout puro não: escrever asserção sobre
espaçamento antes do componente não guia design nenhum.

## Componentes do Radix no jsdom

O jsdom não implementa Pointer Events nem `ResizeObserver`, e o Radix usa os dois.
`src/test/setup.ts` já injeta os stubs; além disso:

- crie o usuário com `userEvent.setup({ pointerEventsCheck: 0 })`
- **não** teste o gesto de abrir um menu suspenso: isso trava no jsdom. Teste o
  efeito — o diálogo aberto, a mutação disparada, a linha sumindo. `ConfirmDialog`
  tem teste próprio (`src/shared/ui/confirm-dialog.test.tsx`) exatamente por isso

## Navegação em tela que redireciona

Uma tela que chama `navigate()` depois de uma mutação (trocar senha, trocar
e-mail) quebra o runner: o React Router constrói um `Request` com o
`AbortSignal` do jsdom e o `Request` do MSW (undici) rejeita sinal de outro
realm — vira *unhandled rejection* e derruba a suíte inteira.

Espione o `navigate` em vez de executá-lo, e afirme **para onde** a tela manda:

```ts
const navigate = vi.fn()
vi.mock('react-router', async (importOriginal) => ({
  ...(await importOriginal<Record<string, unknown>>()),
  useNavigate: () => navigate,
}))
// …
expect(navigate).toHaveBeenCalledWith('/login', { replace: true })
```

## Cobertura

`npm run test:coverage`. As metas são **por camada**, no `vite.config.ts`:

| Alvo | Meta de linhas | Por quê |
|------|:--------------:|---------|
| `src/shared/api/**` | 85% | Onde mora o refresh de sessão e a tradução de erro |
| `src/shared/lib/**` | 85% | Formatação e montagem de payload — erro aqui apaga dado |
| `src/features/auth/permissions.ts` | 100% | Espelha o RBAC do backend |
| Global | 25% (piso) | As telas entram módulo a módulo (tasks.md → Fase 8) |

O piso global **sobe** a cada módulo coberto — ele existe para pegar regressão,
não para dar a impressão de que o projeto está testado. Cobertura é sintoma, não
meta: não escreva teste de prop de componente para bater número.
