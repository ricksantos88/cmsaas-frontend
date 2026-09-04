# ADR-002: Estado do servidor vs. estado do cliente

**Data**: 2026-09-04
**Status**: Accepted
**Tags**: `state`, `data-fetching`, `react-query`

---

## 📋 Contexto

Quase todo dado desta aplicação é **cópia temporária de algo que vive no MySQL do
backend**: lista de membros, evento, patrimônio. Guardar isso num store global
(Redux/Zustand) transforma cache de servidor em estado de aplicação — e obriga a
escrever à mão invalidação, deduplicação, loading, erro e refetch.

O que sobra de estado genuinamente do cliente é pouco: sessão, filtro de tela,
modal aberto.

---

## 🎯 Decisão

**Separar as duas naturezas de estado e usar a ferramenta certa para cada uma.**

### R1. Estado do servidor → TanStack Query

Toda leitura da API passa por `useQuery`; toda escrita por `useMutation`.
Proibido copiar resposta de API para `useState` "para poder editar" — isso cria
duas fontes de verdade que divergem em silêncio.

### R2. Chaves de cache hierárquicas

```ts
export const memberKeys = {
  all: ['members'] as const,
  list: (filters) => [...memberKeys.all, 'list', filters] as const,
  detail: (id) => [...memberKeys.all, 'detail', id] as const,
}
```

Depois de uma mutação, invalide `memberKeys.all`: lista e detalhe se realinham
juntos. Chave solta espalhada pelo componente é o começo de cache incoerente.

### R3. Estado do cliente → Zustand, só para sessão

Hoje existe **um** store: `features/auth/session.store.ts`. Novo store global
precisa justificar por que não é `useState` local nem cache de query.

### R4. Filtros de listagem moram na URL

`useSearchParams`, não `useState`. Recarregar a página, voltar no histórico ou
mandar o link para um colega tem que preservar a busca. A URL é a interface.

### R5. Retry só onde faz sentido

4xx não melhora com insistência: `401` precisa de sessão nova, `403` de outra
role, `404` do registro que não existe. Só erro de rede e 5xx são retentados
(2 tentativas). Configurado uma vez em `shared/api/query-client.ts`.

### R6. Formulários → React Hook Form + Zod

O schema Zod é a tradução das validações do contrato (`@field:NotBlank`,
`@Size`, `@Email`). Valida no cliente para dar retorno rápido — mas a validação
que vale é a do backend, e o `400 VALIDATION_ERROR` sempre é exibido nos campos.

---

## 🔀 Alternativas consideradas

| Alternativa | Por que não |
|-------------|-------------|
| Redux Toolkit + RTK Query | Camada de store que este app não usa; boilerplate por endpoint sem ganho sobre Query |
| SWR | Equivalente em leitura, mais fraco em mutação/invalidação, que é metade do console |
| `fetch` + `useEffect` à mão | Reescrever deduplicação, cache e race condition em cada tela é onde bug mora |

---

## ✅ Consequências

### Positivas
- Loading, erro, refetch e cache resolvidos uma vez
- Duas requisições simultâneas para a mesma chave viram uma
- Tela troca de página sem piscar (`placeholderData`)

### Negativas / Cuidados
- É preciso disciplina com chaves: chave errada = cache que não invalida
- `staleTime` global de 30s pode mostrar dado levemente velho — aceitável num console administrativo, mas revise por tela quando importar

---

## ✔️ Critérios de aceite

- [ ] Nenhum `useState` guardando resposta de API
- [ ] Toda feature exporta suas `*Keys`
- [ ] Filtro de listagem reflete na query string

---

## 📚 Referências

- [Guia de integração com a API](../guides/api-integration-guide.md)
- Backend ADR-004 (paginação, erro, datas)
