import { Search } from 'lucide-react'
import { useEffect, useState, type ReactNode } from 'react'
import { Button } from './button'
import { Input, Select } from './input'

interface FilterBarProps {
  searchValue?: string
  searchPlaceholder?: string
  onSearch: (value: string | undefined) => void
  onClear?: () => void
  showClear?: boolean
  children?: ReactNode
}

/**
 * Barra de filtros das listagens. A busca é submetida (Enter ou botão) para não
 * disparar uma requisição por tecla; os selects aplicam na hora.
 */
export function FilterBar({
  searchValue,
  searchPlaceholder = 'Buscar',
  onSearch,
  onClear,
  showClear,
  children,
}: FilterBarProps) {
  const [draft, setDraft] = useState(searchValue ?? '')

  // A busca também muda pela URL (voltar no histórico, link colado).
  useEffect(() => setDraft(searchValue ?? ''), [searchValue])

  return (
    <form
      className="flex flex-wrap items-center gap-3 border-b border-border-subtle p-4"
      onSubmit={(event) => {
        event.preventDefault()
        onSearch(draft.trim() || undefined)
      }}
    >
      <div className="relative min-w-56 flex-1">
        <Search
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-content-muted"
          aria-hidden
        />
        <Input
          className="pl-9"
          placeholder={searchPlaceholder}
          aria-label={searchPlaceholder}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
        />
      </div>

      {children}

      <Button type="submit" variant="outline">
        Filtrar
      </Button>

      {showClear && onClear && (
        <Button type="button" variant="ghost" onClick={onClear}>
          Limpar
        </Button>
      )}
    </form>
  )
}

interface EnumSelectProps<T extends string | number> {
  label: string
  value: T | undefined
  options: Record<T, string>
  placeholder: string
  onChange: (value: T | undefined) => void
  className?: string
}

/** Select de enum da API já traduzido — nunca exiba o valor cru. */
export function EnumSelect<T extends string | number>({
  label,
  value,
  options,
  placeholder,
  onChange,
  className = 'w-48',
}: EnumSelectProps<T>) {
  return (
    <Select
      className={className}
      aria-label={label}
      value={value !== undefined ? String(value) : ''}
      onChange={(event) => {
        const raw = event.target.value
        if (!raw) {
          onChange(undefined)
          return
        }
        const num = Number(raw)
        const parsed = !Number.isNaN(num) && num in options ? num : raw
        onChange(parsed as T)
      }}
    >
      <option value="">{placeholder}</option>
      {Object.entries(options).map(([key, text]) => (
        <option key={key} value={key}>
          {text as string}
        </option>
      ))}
    </Select>
  )
}
