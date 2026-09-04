import type { ReactNode } from 'react'
import { ErrorState } from './states'

interface QueryLike<T> {
  data: T | undefined
  isPending: boolean
  isError: boolean
  error: unknown
  refetch: () => unknown
}

interface QueryStatesProps<T> {
  query: QueryLike<T>
  /** Esqueleto com a forma do conteúdo — `TableSkeleton` na maioria das listas. */
  skeleton: ReactNode
  /** Renderizado quando a resposta vem vazia. */
  empty?: ReactNode
  isEmpty?: (data: T) => boolean
  children: (data: T) => ReactNode
}

/**
 * Resolve os quatro estados obrigatórios de toda leitura (layout-model.md § 3)
 * num lugar só — a página fica com as colunas e as ações, não com `if` de estado.
 */
export function QueryStates<T>({
  query,
  skeleton,
  empty,
  isEmpty,
  children,
}: QueryStatesProps<T>) {
  if (query.isPending) return <>{skeleton}</>
  if (query.isError) return <ErrorState error={query.error} onRetry={() => query.refetch()} />
  if (!query.data) return null
  if (empty && isEmpty?.(query.data)) return <>{empty}</>
  return <>{children(query.data)}</>
}
