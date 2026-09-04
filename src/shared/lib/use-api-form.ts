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
      if (error instanceof ApiError && error.isValidation) {
        for (const { field, message } of error.fieldErrors) {
          form.setError(field as Path<T>, { message })
        }
        // O campo pode não existir no formulário (validação de regra composta):
        // nesse caso o toast é o único lugar onde a mensagem aparece.
        const known = new Set(Object.keys(form.getValues()))
        if (error.fieldErrors.some(({ field }) => !known.has(field))) notifyError(error)
        return
      }
      notifyError(error)
    }
  })

  return Object.assign(form, { submit, submitting: form.formState.isSubmitting })
}
