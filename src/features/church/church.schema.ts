import { z } from 'zod'

const optionalText = z.string().trim().optional().or(z.literal(''))

export const churchSchema = z.object({
  name: z.string().trim().min(3, 'Mínimo de 3 caracteres').max(255),
  description: optionalText,
  denomination: optionalText,
  status: z.enum(['ACTIVE', 'INACTIVE']).optional().or(z.literal('')),
  presidentPastorId: optionalText,
  phone: optionalText,
  email: z.string().trim().email('E-mail inválido').optional().or(z.literal('')),
  website: optionalText,
  street: optionalText,
  number: optionalText,
  complement: optionalText,
  neighborhood: optionalText,
  city: optionalText,
  state: optionalText,
  zipCode: optionalText,
})

export type ChurchFormValues = z.infer<typeof churchSchema>
