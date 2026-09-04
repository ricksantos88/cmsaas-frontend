import { z } from 'zod'

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Informe a senha atual'),
    newPassword: z.string().min(8, 'A nova senha precisa de ao menos 8 caracteres'),
    confirmPassword: z.string().min(1, 'Repita a nova senha'),
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    path: ['confirmPassword'],
    message: 'As senhas não conferem',
  })
  .refine((values) => values.newPassword !== values.currentPassword, {
    path: ['newPassword'],
    message: 'A nova senha precisa ser diferente da atual',
  })

export type ChangePasswordValues = z.infer<typeof changePasswordSchema>

/**
 * Dados do perfil. A senha atual só é exigida quando o e-mail muda — a
 * validação cruzada precisa do e-mail original, injetado por `profileSchema`.
 */
export function profileSchema(currentEmail: string) {
  return z
    .object({
      name: z.string().trim().min(3, 'Mínimo de 3 caracteres').max(255),
      email: z.string().trim().min(1, 'Informe o e-mail').email('E-mail inválido'),
      currentPassword: z.string().optional().or(z.literal('')),
    })
    .refine(
      (values) =>
        values.email.trim().toLowerCase() === currentEmail.toLowerCase() ||
        Boolean(values.currentPassword),
      {
        path: ['currentPassword'],
        message: 'Confirme sua senha para alterar o e-mail',
      },
    )
}

export type ProfileValues = z.infer<ReturnType<typeof profileSchema>>
