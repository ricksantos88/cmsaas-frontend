import type { ApiErrorBody, FieldValidationError } from '@/shared/types/api'

/**
 * Erro de API já traduzido. Todo componente trata ESTE tipo — `AxiosError` não
 * atravessa a fronteira da camada de API (docs/guides/error-handling.md).
 */
export class ApiError extends Error {
  readonly status: number
  readonly code: string
  readonly traceId: string | null
  readonly fieldErrors: FieldValidationError[]

  constructor(
    status: number,
    code: string,
    message: string,
    traceId: string | null = null,
    fieldErrors: FieldValidationError[] = [],
  ) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.traceId = traceId
    this.fieldErrors = fieldErrors
  }

  /** Erro de rede/timeout: não houve resposta HTTP. */
  static offline(): ApiError {
    return new ApiError(0, 'NETWORK_ERROR', 'Não foi possível falar com o servidor.')
  }

  get isValidation(): boolean {
    return this.status === 400 && this.fieldErrors.length > 0
  }

  get isUnauthorized(): boolean {
    return this.status === 401
  }

  get isForbidden(): boolean {
    return this.status === 403
  }

  get isNotFound(): boolean {
    return this.status === 404
  }
}

function isFieldErrors(details: unknown): details is FieldValidationError[] {
  return (
    Array.isArray(details) &&
    details.every((d) => typeof d === 'object' && d !== null && 'field' in d && 'message' in d)
  )
}

function isApiErrorBody(body: unknown): body is ApiErrorBody {
  return (
    typeof body === 'object' &&
    body !== null &&
    'error' in body &&
    typeof (body as ApiErrorBody).error?.code === 'string'
  )
}

/** Converte a resposta de erro do backend (ADR-004 C3) em `ApiError`. */
export function toApiError(status: number, body: unknown): ApiError {
  if (!isApiErrorBody(body)) {
    return new ApiError(status, 'UNEXPECTED_ERROR', FALLBACK_MESSAGES[status] ?? 'Erro inesperado.')
  }

  const { error, traceId } = body
  return new ApiError(
    status,
    error.code,
    MESSAGES[error.code] ?? error.message,
    traceId ?? null,
    isFieldErrors(error.details) ? error.details : [],
  )
}

const FALLBACK_MESSAGES: Record<number, string> = {
  401: 'Sessão expirada. Entre novamente.',
  403: 'Você não tem permissão para esta ação.',
  404: 'Registro não encontrado.',
  500: 'Erro interno do servidor.',
}

/**
 * Mensagens de negócio em português para os códigos do backend. Códigos sem
 * tradução caem na `message` que a API mandou — nunca numa string genérica.
 */
const MESSAGES: Record<string, string> = {
  VALIDATION_ERROR: 'Confira os campos destacados.',
  INVALID_TOKEN: 'Sessão expirada. Entre novamente.',
  INSUFFICIENT_PERMISSIONS: 'Você não tem permissão para esta ação.',
  RESOURCE_NOT_FOUND: 'Registro não encontrado.',
  RESOURCE_ALREADY_EXISTS: 'Já existe um registro com estes dados.',
  EMAIL_ALREADY_EXISTS: 'Este e-mail já está em uso por outra conta.',
  RESOURCE_CONFLICT: 'A operação conflita com o estado atual do registro.',
  TOO_MANY_REQUESTS: 'Muitas tentativas. Aguarde alguns minutos.',
  FILE_TOO_LARGE: 'Arquivo acima do tamanho permitido.',
  DOCUMENT_ACCESS_DENIED: 'Você não tem acesso a este documento.',
  ASSET_TAG_ALREADY_EXISTS: 'Já existe um item com esta etiqueta.',
  PRESIDENT_ALREADY_EXISTS: 'Esta igreja já tem um pastor presidente.',
  MEMBER_IS_CELL_LEADER: 'O membro lidera uma célula — troque a liderança antes de excluir.',
  MEMBER_IN_ANOTHER_CELL: 'O membro já participa de outra célula.',
  MEMBER_ALREADY_MUSICIAN: 'Este membro já está cadastrado no ministério de música.',
  MUSICIAN_ALREADY_SCALED: 'Este músico já está na escala do evento.',
  NOT_CELL_LEADER: 'Apenas o líder da célula pode registrar esta presença.',
  MEMBER_NOT_IN_LED_CELL: 'O membro não participa da célula que você lidera.',
  SCHEDULE_CANCELLED: 'O evento foi cancelado.',
  SCHEDULE_CAPACITY_EXCEEDED: 'A capacidade do evento foi atingida.',
  SCHEDULE_ACCESS_DENIED: 'Você não tem acesso a este evento.',
  SERMON_ACCESS_DENIED: 'Você não tem acesso a este sermão.',
  NOTIFICATION_SEND_DENIED: 'Você não pode enviar notificações.',
  USER_NOT_ELIGIBLE_FOR_MULTI_CHURCH:
    'Usuário já cadastrado com perfil local não elegível para gerenciar múltiplas igrejas.',
  INVALID_CREDENTIALS: 'A senha informada não confere com a conta existente.',
  NOT_MEMBER_OF_CHURCH: 'Você não possui vínculo com a congregação selecionada.',
  NETWORK_ERROR: 'Não foi possível falar com o servidor.',
}
