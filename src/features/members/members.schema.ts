import { z } from 'zod'

/**
 * Espelha as validações do `CreateMemberRequest` (Bean Validation no backend).
 * Serve para retorno rápido — a validação que vale continua sendo a da API.
 */
const optionalText = z.string().trim().optional().or(z.literal(''))

export const memberSchema = z.object({
  firstName: z.string().trim().min(2, 'Mínimo de 2 caracteres').max(255),
  lastName: z.string().trim().min(2, 'Mínimo de 2 caracteres').max(255),
  email: z.string().trim().min(1, 'Informe o e-mail').email('E-mail inválido'),
  phone: optionalText,
  whatsapp: optionalText,
  dateOfBirth: optionalText,
  gender: z.enum(['M', 'F']).optional().or(z.literal('')),
  maritalStatus: z
    .enum(['SINGLE', 'MARRIED', 'DIVORCED', 'WIDOWED', 'OTHER'])
    .optional()
    .or(z.literal('')),
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED', 'EXCLUDED']).optional().or(z.literal('')),
  membershipDate: optionalText,
  baptizationDate: optionalText,
  profession: optionalText,
  company: optionalText,
  notes: optionalText,
  street: optionalText,
  number: optionalText,
  complement: optionalText,
  neighborhood: optionalText,
  city: optionalText,
  state: optionalText,
  zipCode: optionalText,
})

export type MemberFormValues = z.infer<typeof memberSchema>

export const emptyMemberForm: MemberFormValues = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  whatsapp: '',
  dateOfBirth: '',
  gender: '',
  maritalStatus: '',
  status: '',
  membershipDate: '',
  baptizationDate: '',
  profession: '',
  company: '',
  notes: '',
  street: '',
  number: '',
  complement: '',
  neighborhood: '',
  city: '',
  state: '',
  zipCode: '',
}
