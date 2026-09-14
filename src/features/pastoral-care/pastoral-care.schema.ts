import { z } from 'zod'

export const pastoralRecordSchema = z.object({
  type: z.enum([
    'VISIT',
    'COUNSELING',
    'HOSPITAL_VISIT',
    'PHONE_CALL',
    'PRAYER_REQUEST',
    'DISCIPLINE',
    'OTHER',
  ] as const),
  date: z.string().min(1, 'Informe a data do atendimento'),
  subject: z.string().trim().min(3, 'Mínimo de 3 caracteres').max(255, 'Máximo de 255 caracteres'),
  notes: z.string().trim().min(3, 'Informe as notas ou relatório do atendimento'),
  confidential: z.boolean(),
})

export type PastoralRecordFormValues = z.infer<typeof pastoralRecordSchema>

export const emptyPastoralRecordForm: PastoralRecordFormValues = {
  type: 'COUNSELING',
  date: new Date().toISOString().slice(0, 10),
  subject: '',
  notes: '',
  confidential: false,
}
