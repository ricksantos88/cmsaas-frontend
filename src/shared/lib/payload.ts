/**
 * Conversões entre o formulário (que só conhece string) e o payload da API.
 *
 * O backend distingue **ausente** (não altera) de **`null`** (limpa o campo) nos
 * updates — contracts/README. Por isso existem duas funções, e não uma.
 */

/** Campo em branco → ausente do payload (criação, ou campo que não se limpa). */
export function blankToUndefined(value: string | undefined | null): string | undefined {
  const trimmed = value?.trim()
  return trimmed ? trimmed : undefined
}

/** Campo em branco → `null` explícito (update de campo limpável). */
export function blankToNull(value: string | undefined | null): string | null {
  const trimmed = value?.trim()
  return trimmed ? trimmed : null
}

/** Enum vindo de `<select>` vazio → ausente. */
export function selectToUndefined<T extends string>(value: string | undefined): T | undefined {
  return value ? (value as T) : undefined
}

/** Número em campo de texto → ausente quando vazio, para não mandar `NaN`. */
export function numberOrUndefined(value: string | number | undefined | null): number | undefined {
  if (value === '' || value === undefined || value === null) return undefined
  const parsed = Number(value)
  return Number.isNaN(parsed) ? undefined : parsed
}

/**
 * Objeto de endereço a partir dos campos planos do formulário. Devolve
 * `undefined` quando nada foi preenchido — endereço vazio não vai no payload.
 */
export function toAddress(values: Record<string, string | undefined>) {
  const address = {
    street: blankToUndefined(values.street),
    number: blankToUndefined(values.number),
    complement: blankToUndefined(values.complement),
    neighborhood: blankToUndefined(values.neighborhood),
    city: blankToUndefined(values.city),
    state: blankToUndefined(values.state),
    zipCode: blankToUndefined(values.zipCode),
  }
  return Object.values(address).some(Boolean) ? address : undefined
}
