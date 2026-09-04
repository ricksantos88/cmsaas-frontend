import { z } from 'zod'

const optionalText = z.string().trim().optional().or(z.literal(''))

export const pastorSchema = z.object({
  name: z.string().trim().min(3, 'Mínimo de 3 caracteres').max(255),
  email: z.string().trim().min(1, 'Informe o e-mail').email('E-mail inválido'),
  phone: optionalText,
  dateOfBirth: optionalText,
  role: z.enum(['PASTOR_PRESIDENT', 'PASTOR_AUXILIARY']),
  position: optionalText,
  biography: optionalText,
  ordainmentDate: optionalText,
  contactVisibility: z.enum(['MEMBERS_ONLY', 'PASTORS_ONLY', 'PUBLIC']),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional().or(z.literal('')),
  specializations: optionalText,
})

export type PastorFormValues = z.infer<typeof pastorSchema>

export const emptyPastorForm: PastorFormValues = {
  name: '',
  email: '',
  phone: '',
  dateOfBirth: '',
  role: 'PASTOR_AUXILIARY',
  position: '',
  biography: '',
  ordainmentDate: '',
  contactVisibility: 'MEMBERS_ONLY',
  status: '',
  specializations: '',
}
