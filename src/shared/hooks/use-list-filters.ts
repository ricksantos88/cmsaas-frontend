import { useCallback } from 'react'
import { useSearchParams } from 'react-router'

/**
 * Filtros de listagem na query string (ADR-002 R4): recarregar, voltar no
 * histórico ou compartilhar o link preserva a busca.
 */
export function useListFilters() {
  const [searchParams, setSearchParams] = useSearchParams()

  const get = useCallback(
    (key: string): string | undefined => searchParams.get(key) ?? undefined,
    [searchParams],
  )

  /** Muda filtros e volta para a página 1 — filtrar na página 7 traria vazio. */
  const setFilters = useCallback(
    (changes: Record<string, string | undefined>) => {
      setSearchParams((current) => {
        const next = new URLSearchParams(current)
        for (const [key, value] of Object.entries(changes)) {
          if (value) next.set(key, value)
          else next.delete(key)
        }
        next.delete('page')
        return next
      })
    },
    [setSearchParams],
  )

  const setPage = useCallback(
    (page: number) => {
      setSearchParams((current) => {
        const next = new URLSearchParams(current)
        if (page > 1) next.set('page', String(page))
        else next.delete('page')
        return next
      })
    },
    [setSearchParams],
  )

  const clear = useCallback(() => setSearchParams(new URLSearchParams()), [setSearchParams])

  return {
    get,
    page: Number(searchParams.get('page') ?? 1),
    setFilters,
    setPage,
    clear,
    hasFilters: [...searchParams.keys()].some((key) => key !== 'page'),
  }
}
