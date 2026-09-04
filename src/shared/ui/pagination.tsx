import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from './button'
import type { PaginationMeta } from '@/shared/types/api'

interface PaginationProps {
  meta: PaginationMeta
  onPageChange: (page: number) => void
}

/** Controle único para o envelope de paginação da API (ADR-004 C1). */
export function Pagination({ meta, onPageChange }: PaginationProps) {
  const first = meta.totalItems === 0 ? 0 : (meta.page - 1) * meta.pageSize + 1
  const last = Math.min(meta.page * meta.pageSize, meta.totalItems)

  return (
    <nav
      aria-label="Paginação"
      className="flex items-center justify-between gap-4 border-t border-border-subtle px-4 py-3"
    >
      <p className="text-xs text-content-muted">
        {first}–{last} de {meta.totalItems}
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={!meta.hasPrev}
          onClick={() => onPageChange(meta.page - 1)}
        >
          <ChevronLeft aria-hidden />
          Anterior
        </Button>
        <span className="text-xs text-content-muted">
          Página {meta.page} de {Math.max(meta.totalPages, 1)}
        </span>
        <Button
          variant="outline"
          size="sm"
          disabled={!meta.hasNext}
          onClick={() => onPageChange(meta.page + 1)}
        >
          Próxima
          <ChevronRight aria-hidden />
        </Button>
      </div>
    </nav>
  )
}
