import { useForm, type DefaultValues, type FieldValues, type Path, type UseFormReturn } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { ZodType } from 'zod'
import { ApiError } from '@/shared/api/api-error'
import { notifyError } from '@/shared/ui/toast'

interface ApiFormOptions<T extends FieldValues> {
  schema: ZodType<T>
  defaultValues: DefaultValues<T>
  onSubmit: (values: T) => Promise<unknown>
  onSuccess?: () => void
}

export interface ApiForm<T extends FieldValues> extends UseFormReturn<T> {
  submit: (event?: React.BaseSyntheticEvent) => Promise<void>
  submitting: boolean
}

/**
 * Formulário ligado à API: valida com Zod antes de sair e, quando o backend
 * devolve `400 VALIDATION_ERROR`, joga cada erro **no campo correspondente**
 * em vez de num toast genérico (error-handling.md).
 */
export function useApiForm<T extends FieldValues>({
  schema,
  defaultValues,
  onSubmit,
  onSuccess,
}: ApiFormOptions<T>): ApiForm<T> {
  const form = useForm<T>({ resolver: zodResolver(schema), defaultValues })

  const submit = form.handleSubmit(async (values) => {
    try {
      await onSubmit(values)
      onSuccess?.()
    } catch (error) {
      if (error instanceof ApiError && error.fieldErrors.length > 0) {
        const currentValues = form.getValues()
        const knownKeys = new Set(Object.keys(currentValues))
        const unmappedErrors: string[] = []

        for (const { field, message } of error.fieldErrors) {
          if (knownKeys.has(field) || field in currentValues) {
            form.setError(field as Path<T>, { message })
          } else if (field.includes('.')) {
            // Tenta a chave folha caso o formulário seja plano (ex.: 'address.zipCode' -> 'zipCode')
            const leaf = field.split('.').pop()
            if (leaf && (knownKeys.has(leaf) || leaf in currentValues)) {
              form.setError(leaf as Path<T>, { message })
            } else {
              unmappedErrors.push(`${field}: ${message}`)
            }
          } else {
            unmappedErrors.push(`${field}: ${message}`)
          }
        }

        if (unmappedErrors.length > 0) {
          notifyError(
            unmappedErrors.length === 1
              ? unmappedErrors[0]
              : `Erros de validação: ${unmappedErrors.join(', ')}`,
          )
        } else {
          const friendlyMessage =
            error.message && error.message !== 'A requisição contém dados inválidos'
              ? error.message
              : 'Confira os campos destacados.'
          notifyError(friendlyMessage)
        }
        return
      }

      notifyError(error)
    }
  })

  return Object.assign(form, { submit, submitting: form.formState.isSubmitting })
}
