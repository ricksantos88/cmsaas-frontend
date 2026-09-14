/**
 * Dicionário de rótulos amigáveis para campos de domínio e humanização
 * de mensagens de validação da API para linguagem natural em português.
 */
export const FIELD_LABELS: Record<string, string> = {
  dateOfBirth: 'Data de nascimento',
  ordainmentDate: 'Data de ordenação',
  foundationDate: 'Data de fundação',
  membershipDate: 'Data de membro',
  baptizationDate: 'Data de batismo',
  startDateTime: 'Data e hora de início',
  endDateTime: 'Data e hora de término',
  scheduledFor: 'Data agendada',
  warrantyUntil: 'Data de garantia',
  'acquisition.date': 'Data de aquisição',
  acquisitionDate: 'Data de aquisição',
  zipCode: 'CEP',
  currentPassword: 'Senha atual',
  newPassword: 'Nova senha',
  confirmPassword: 'Confirmação de senha',
  adminEmail: 'E-mail do administrador',
  adminPassword: 'Senha do administrador',
  adminName: 'Nome do administrador',
  churchName: 'Nome da igreja',
  firstName: 'Nome',
  lastName: 'Sobrenome',
  preacherId: 'Pregador',
  responsibleMemberId: 'Membro responsável',
  visitedMemberId: 'Membro visitado',
  musicianId: 'Músico',
  leaderId: 'Líder',
  coLeaderId: 'Vice-líder',
  supervisorPastorId: 'Pastor supervisor',
  youtubeLink: 'Link do YouTube',
  birthMonth: 'Mês de aniversário',
}

export interface HumanizedValidation {
  message: string
  field?: string
}

/**
 * Traduz mensagens técnicas que mencionam identificadores de campos camelCase
 * para mensagens em linguagem natural com o nome correto do campo em português.
 */
export function humanizeValidationMessage(
  rawMessage: string,
  explicitField?: string,
): HumanizedValidation {
  if (!rawMessage || typeof rawMessage !== 'string') {
    return { message: rawMessage ?? '' }
  }

  let message = rawMessage.trim()
  let detectedField = explicitField

  // Se nenhum campo foi passado explicitamente, tenta detectar se a mensagem menciona um campo conhecido
  if (!detectedField) {
    for (const field of Object.keys(FIELD_LABELS)) {
      const regex = new RegExp(`\\b${field}\\b`, 'i')
      if (regex.test(message)) {
        detectedField = field
        break
      }
    }
  }

  // Se ainda não detectou campo, tenta capturar padrão "campo deve/não pode/é..."
  if (!detectedField) {
    const match = message.match(/^([a-zA-Z0-9_.]+)\s+(deve|não|é|foi|fora)\b/i)
    if (match) {
      detectedField = match[1]
    }
  }

  // Substitui identificadores de campos conhecidos pelos seus rótulos em português
  for (const [field, label] of Object.entries(FIELD_LABELS)) {
    const regex = new RegExp(`\\b${field}\\b`, 'g')
    if (regex.test(message)) {
      message = message.replace(regex, label)
    }
  }

  // Ajustes de concordância e linguagem natural para mensagens comuns
  message = message
    .replace(/^Data de nascimento deve estar no passado/i, 'Data de nascimento deve ser uma data no passado')
    .replace(/^Data de ordenação não pode ser futura/i, 'Data de ordenação não pode ser uma data futura')
    .replace(/^Data de fundação não pode ser futura/i, 'Data de fundação não pode ser uma data futura')
    .replace(/não pode ser anterior ao nascimento/i, 'não pode ser anterior à data de nascimento')
    .replace(/não pode ser vazio/i, 'não pode estar em branco')
    .replace(/não é um membro desta igreja/i, 'selecionado não é um membro desta congregação')
    .replace(/não é um pastor desta igreja/i, 'selecionado não é um pastor desta congregação')
    .replace(/não é um músico desta igreja/i, 'selecionado não é um músico desta congregação')

  return { message, field: detectedField }
}
