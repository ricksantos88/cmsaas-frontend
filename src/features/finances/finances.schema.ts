import { z } from 'zod'

export const financeEntrySchema = z.object({
  type: z.enum(['INCOME', 'EXPENSE'], { required_error: 'Campo obrigatório.' }),
  categoryId: z.string().min(1, 'Campo obrigatório.'),
  amount: z.number({ invalid_type_error: 'Campo obrigatório.' }).min(0.01, 'O valor deve ser maior que zero.'),
  date: z.string().min(1, 'Campo obrigatório.'),
  paymentMethod: z.enum(['CASH', 'PIX', 'CREDIT_CARD', 'DEBIT_CARD', 'BANK_TRANSFER', 'OTHER'], {
    required_error: 'Campo obrigatório.',
  }),
  memberId: z.string().optional(),
  description: z.string().optional(),
  status: z.enum(['PENDING', 'PAID', 'CANCELLED'], { required_error: 'Campo obrigatório.' }),
})

export type FinanceEntryFormValues = z.infer<typeof financeEntrySchema>

export const emptyFinanceEntryForm: FinanceEntryFormValues = {
  type: 'INCOME',
  categoryId: '',
  amount: 0,
  date: new Date().toISOString().split('T')[0],
  paymentMethod: 'PIX',
  description: '',
  status: 'PAID',
  memberId: '',
}
