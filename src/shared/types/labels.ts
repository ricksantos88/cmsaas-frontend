/**
 * Tradução dos enums da API. Enum nunca é exibido cru (ADR-003 R7).
 * Mantenha na mesma ordem do enum Kotlin — facilita conferir o que falta.
 */
import type { BadgeTone } from '@/shared/ui/badge'
import type {
  AcquisitionType,
  AssetCategory,
  AssetCondition,
  AssetStatus,
  CellStatus,
  ContactVisibility,
  Denomination,
  DocumentCategory,
  DocumentVisibility,
  Gender,
  Instrument,
  MaintenanceType,
  MaritalStatus,
  MeetingFrequency,
  MemberStatus,
  MinistryRole,
  MusicianStatus,
  NotificationChannel,
  NotificationType,
  PastorRole,
  PastorStatus,
  ScaleStatus,
  ScheduleStatus,
  PastoralRecordType,
  ScheduleType,
  ScheduleVisibility,
  SermonTopic,
  SermonType,
  SermonVisibility,
  SkillLevel,
  VoiceType,
  FinancialType,
  PaymentMethod,
  EntryStatus,
  PastoralVisitStatus,
} from './domain'
import type { DayOfWeek } from './api'

export const MONTH_LABELS: Record<number, string> = {
  1: 'Janeiro',
  2: 'Fevereiro',
  3: 'Março',
  4: 'Abril',
  5: 'Maio',
  6: 'Junho',
  7: 'Julho',
  8: 'Agosto',
  9: 'Setembro',
  10: 'Outubro',
  11: 'Novembro',
  12: 'Dezembro',
}

export const DAY_LABELS: Record<DayOfWeek, string> = {
  MONDAY: 'Segunda-feira',
  TUESDAY: 'Terça-feira',
  WEDNESDAY: 'Quarta-feira',
  THURSDAY: 'Quinta-feira',
  FRIDAY: 'Sexta-feira',
  SATURDAY: 'Sábado',
  SUNDAY: 'Domingo',
}

// ── membro ───────────────────────────────────────────────────────────────────

export const MEMBER_STATUS_LABELS: Record<MemberStatus, string> = {
  ACTIVE: 'Ativo',
  INACTIVE: 'Inativo',
  SUSPENDED: 'Suspenso',
  EXCLUDED: 'Excluído',
}

export const MEMBER_STATUS_TONES: Record<MemberStatus, BadgeTone> = {
  ACTIVE: 'success',
  INACTIVE: 'neutral',
  SUSPENDED: 'warning',
  EXCLUDED: 'danger',
}

export const GENDER_LABELS: Record<Gender, string> = { M: 'Masculino', F: 'Feminino' }

export const MARITAL_STATUS_LABELS: Record<MaritalStatus, string> = {
  SINGLE: 'Solteiro(a)',
  MARRIED: 'Casado(a)',
  DIVORCED: 'Divorciado(a)',
  WIDOWED: 'Viúvo(a)',
  OTHER: 'Outro',
}

// ── pastor ───────────────────────────────────────────────────────────────────

export const PASTOR_ROLE_LABELS: Record<PastorRole, string> = {
  PASTOR_PRESIDENT: 'Pastor presidente',
  PASTOR_AUXILIARY: 'Pastor auxiliar',
}

export const PASTOR_STATUS_LABELS: Record<PastorStatus, string> = {
  ACTIVE: 'Ativo',
  INACTIVE: 'Inativo',
}

export const PASTOR_STATUS_TONES: Record<PastorStatus, BadgeTone> = {
  ACTIVE: 'success',
  INACTIVE: 'neutral',
}

export const CONTACT_VISIBILITY_LABELS: Record<ContactVisibility, string> = {
  MEMBERS_ONLY: 'Somente membros',
  PASTORS_ONLY: 'Somente pastores',
  PUBLIC: 'Público',
}

// ── igreja ───────────────────────────────────────────────────────────────────

export const DENOMINATION_LABELS: Record<Denomination, string> = {
  ASSEMBLEIA_DE_DEUS: 'Assembleia de Deus',
  BATISTA: 'Batista',
  PRESBITERIANA: 'Presbiteriana',
  METODISTA: 'Metodista',
  CATOLICA: 'Católica',
  UNIVERSAL: 'Universal',
  QUADRANGULAR: 'Quadrangular',
  OUTRA: 'Outra',
}

// ── célula ───────────────────────────────────────────────────────────────────

export const CELL_STATUS_LABELS: Record<CellStatus, string> = {
  ACTIVE: 'Ativa',
  INACTIVE: 'Inativa',
  MULTIPLYING: 'Multiplicando',
}

export const CELL_STATUS_TONES: Record<CellStatus, BadgeTone> = {
  ACTIVE: 'success',
  INACTIVE: 'neutral',
  MULTIPLYING: 'info',
}

export const MEETING_FREQUENCY_LABELS: Record<MeetingFrequency, string> = {
  WEEKLY: 'Semanal',
  BIWEEKLY: 'Quinzenal',
  MONTHLY: 'Mensal',
}

// ── músico ───────────────────────────────────────────────────────────────────

export const INSTRUMENT_LABELS: Record<Instrument, string> = {
  GUITAR: 'Guitarra',
  ACOUSTIC_GUITAR: 'Violão',
  BASS: 'Baixo',
  DRUMS: 'Bateria',
  KEYBOARD: 'Teclado',
  PIANO: 'Piano',
  VIOLIN: 'Violino',
  CELLO: 'Violoncelo',
  FLUTE: 'Flauta',
  SAXOPHONE: 'Saxofone',
  TRUMPET: 'Trompete',
  TROMBONE: 'Trombone',
  ACCORDION: 'Acordeão',
  PERCUSSION: 'Percussão',
  VOCAL: 'Vocal',
  OTHER: 'Outro',
}

export const SKILL_LEVEL_LABELS: Record<SkillLevel, string> = {
  BEGINNER: 'Iniciante',
  INTERMEDIATE: 'Intermediário',
  ADVANCED: 'Avançado',
  PROFESSIONAL: 'Profissional',
}

export const MINISTRY_ROLE_LABELS: Record<MinistryRole, string> = {
  INSTRUMENTALIST: 'Instrumentista',
  VOCALIST: 'Vocalista',
  WORSHIP_LEADER: 'Líder de louvor',
  SOUND_TECHNICIAN: 'Técnico de som',
  MEDIA: 'Mídia',
}

export const VOICE_TYPE_LABELS: Record<VoiceType, string> = {
  SOPRANO: 'Soprano',
  MEZZO_SOPRANO: 'Mezzo-soprano',
  ALTO: 'Contralto',
  TENOR: 'Tenor',
  BARITONE: 'Barítono',
  BASS: 'Baixo',
  NONE: 'Não canta',
}

export const MUSICIAN_STATUS_LABELS: Record<MusicianStatus, string> = {
  ACTIVE: 'Ativo',
  INACTIVE: 'Inativo',
  ON_LEAVE: 'Afastado',
}

export const MUSICIAN_STATUS_TONES: Record<MusicianStatus, BadgeTone> = {
  ACTIVE: 'success',
  INACTIVE: 'neutral',
  ON_LEAVE: 'warning',
}

// ── patrimônio ───────────────────────────────────────────────────────────────

export const ASSET_CATEGORY_LABELS: Record<AssetCategory, string> = {
  MUSICAL_INSTRUMENT: 'Instrumento musical',
  SOUND_EQUIPMENT: 'Equipamento de som',
  FURNITURE: 'Mobiliário',
  ELECTRONICS: 'Eletrônicos',
  VEHICLE: 'Veículo',
  REAL_ESTATE: 'Imóvel',
  KITCHEN: 'Cozinha',
  OFFICE: 'Escritório',
  LIGHTING: 'Iluminação',
  MEDIA: 'Mídia',
  APPLIANCE: 'Eletrodoméstico',
  OTHER: 'Outros',
}

export const ACQUISITION_TYPE_LABELS: Record<AcquisitionType, string> = {
  PURCHASE: 'Compra',
  DONATION: 'Doação',
  TRANSFER: 'Transferência',
  MANUFACTURED: 'Fabricação própria',
}

export const ASSET_CONDITION_LABELS: Record<AssetCondition, string> = {
  EXCELLENT: 'Excelente',
  GOOD: 'Bom',
  FAIR: 'Regular',
  POOR: 'Ruim',
  BROKEN: 'Quebrado',
}

export const ASSET_CONDITION_TONES: Record<AssetCondition, BadgeTone> = {
  EXCELLENT: 'success',
  GOOD: 'success',
  FAIR: 'warning',
  POOR: 'warning',
  BROKEN: 'danger',
}

export const ASSET_STATUS_LABELS: Record<AssetStatus, string> = {
  IN_USE: 'Em uso',
  IN_STORAGE: 'Estocado',
  MAINTENANCE: 'Em manutenção',
  DISPOSED: 'Baixado',
  LOST: 'Extraviado',
}

export const ASSET_STATUS_TONES: Record<AssetStatus, BadgeTone> = {
  IN_USE: 'success',
  IN_STORAGE: 'neutral',
  MAINTENANCE: 'warning',
  DISPOSED: 'danger',
  LOST: 'danger',
}

export const MAINTENANCE_TYPE_LABELS: Record<MaintenanceType, string> = {
  PREVENTIVE: 'Preventiva',
  CORRECTIVE: 'Corretiva',
  INSPECTION: 'Inspeção',
}

// ── documentos ───────────────────────────────────────────────────────────────

export const DOCUMENT_CATEGORY_LABELS: Record<DocumentCategory, string> = {
  SERMON_SUMMARY: 'Resumo de sermões',
  APOSTLE_NOTES: 'Apostilas',
  DOCUMENTS: 'Documentos da igreja',
  REPORTS: 'Relatórios',
  OTHER: 'Outros',
}

export const DOCUMENT_VISIBILITY_LABELS: Record<DocumentVisibility, string> = {
  PUBLIC: 'Público',
  MEMBERS_ONLY: 'Somente membros',
  PRIVATE: 'Restrito',
}

export const DOCUMENT_VISIBILITY_TONES: Record<DocumentVisibility, BadgeTone> = {
  PUBLIC: 'info',
  MEMBERS_ONLY: 'neutral',
  PRIVATE: 'warning',
}

// ── agenda ───────────────────────────────────────────────────────────────────

export const SCHEDULE_TYPE_LABELS: Record<ScheduleType, string> = {
  CHURCH_EVENT: 'Culto / evento',
  STUDY: 'Estudo bíblico',
  CELL_GROUP: 'Reunião de célula',
  PRAYER_MEETING: 'Reunião de oração',
  TRAINING: 'Treinamento',
}

// ── visitas pastorais ────────────────────────────────────────────────────────

export const PASTORAL_VISIT_STATUS_LABELS: Record<PastoralVisitStatus, string> = {
  REQUESTED: 'Solicitada pelo membro',
  SCHEDULED: 'Agendada',
  COMPLETED: 'Realizada',
  CANCELLED: 'Cancelada',
}

export const PASTORAL_VISIT_STATUS_TONES: Record<PastoralVisitStatus, BadgeTone> = {
  REQUESTED: 'warning',
  SCHEDULED: 'info',
  COMPLETED: 'success',
  CANCELLED: 'danger',
}

export const SCHEDULE_STATUS_LABELS: Record<ScheduleStatus, string> = {
  SCHEDULED: 'Agendado',
  COMPLETED: 'Realizado',
  CANCELLED: 'Cancelado',
}

export const SCHEDULE_STATUS_TONES: Record<ScheduleStatus, BadgeTone> = {
  SCHEDULED: 'info',
  COMPLETED: 'success',
  CANCELLED: 'danger',
}

export const SCHEDULE_VISIBILITY_LABELS: Record<ScheduleVisibility, string> = {
  PUBLIC: 'Público',
  MEMBERS_ONLY: 'Somente membros',
}

export const SCALE_STATUS_LABELS: Record<ScaleStatus, string> = {
  INVITED: 'Convidado',
  CONFIRMED: 'Confirmado',
  DECLINED: 'Recusou',
}

export const SCALE_STATUS_TONES: Record<ScaleStatus, BadgeTone> = {
  INVITED: 'warning',
  CONFIRMED: 'success',
  DECLINED: 'danger',
}

// ── sermões ──────────────────────────────────────────────────────────────────

export const SERMON_TOPIC_LABELS: Record<SermonTopic, string> = {
  THEOLOGY: 'Teologia',
  SALVATION: 'Salvação',
  SANCTIFICATION: 'Santificação',
  DISCIPLESHIP: 'Discipulado',
  LEADERSHIP: 'Liderança',
  FAMILY: 'Família',
  FINANCES: 'Finanças',
  HEALTH: 'Saúde',
  MISSIONS: 'Missões',
  EVANGELISM: 'Evangelismo',
  OTHER: 'Outros',
}

export const SERMON_TYPE_LABELS: Record<SermonType, string> = {
  SUNDAY_PREACHING: 'Pregação de domingo',
  MIDWEEK_STUDY: 'Estudo no meio de semana',
  SPECIAL_EVENT: 'Evento especial',
  BAPTISM_SERMON: 'Batismo',
  MARRIAGE_SERMON: 'Casamento',
  FUNERAL_SERMON: 'Funeral',
}

export const SERMON_VISIBILITY_LABELS: Record<SermonVisibility, string> = {
  PUBLIC: 'Público',
  MEMBERS_ONLY: 'Somente membros',
  PRIVATE: 'Restrito',
}

// ── notificações ─────────────────────────────────────────────────────────────

export const NOTIFICATION_TYPE_LABELS: Record<NotificationType, string> = {
  EVENT_REMINDER: 'Lembrete de evento',
  PASTOR_VISIT: 'Visita pastoral',
  NEW_DOCUMENT: 'Novo documento',
  WORSHIP_SCHEDULE: 'Escala de louvor',
  NEW_SERMON: 'Novo sermão',
  CELL_MEETING: 'Reunião de célula',
  GENERAL_ANNOUNCEMENT: 'Aviso geral',
}

export const NOTIFICATION_CHANNEL_LABELS: Record<NotificationChannel, string> = {
  PUSH: 'Push (app)',
  EMAIL: 'E-mail',
}

// ── cuidado pastoral ──────────────────────────────────────────────────────────

export const PASTORAL_RECORD_TYPE_LABELS: Record<PastoralRecordType, string> = {
  VISIT: 'Visita pastoral',
  COUNSELING: 'Aconselhamento',
  HOSPITAL_VISIT: 'Visita hospitalar',
  PHONE_CALL: 'Contato telefônico',
  PRAYER_REQUEST: 'Pedido de oração',
  DISCIPLINE: 'Disciplina',
  OTHER: 'Outro',
}

export const PASTORAL_RECORD_TYPE_TONES: Record<PastoralRecordType, BadgeTone> = {
  VISIT: 'info',
  COUNSELING: 'accent',
  HOSPITAL_VISIT: 'warning',
  PHONE_CALL: 'neutral',
  PRAYER_REQUEST: 'success',
  DISCIPLINE: 'danger',
  OTHER: 'neutral',
}

// ── finanças ─────────────────────────────────────────────────────────────────

export const FINANCIAL_TYPE_LABELS: Record<FinancialType, string> = {
  INCOME: 'Entrada',
  EXPENSE: 'Saída',
}

export const FINANCIAL_TYPE_TONES: Record<FinancialType, BadgeTone> = {
  INCOME: 'success',
  EXPENSE: 'danger',
}

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  CASH: 'Dinheiro',
  PIX: 'PIX',
  CREDIT_CARD: 'Cartão de Crédito',
  DEBIT_CARD: 'Cartão de Débito',
  BANK_TRANSFER: 'Transferência Bancária',
  OTHER: 'Outro',
}

export const ENTRY_STATUS_LABELS: Record<EntryStatus, string> = {
  PENDING: 'Pendente',
  PAID: 'Pago',
  CANCELLED: 'Cancelado',
}

export const ENTRY_STATUS_TONES: Record<EntryStatus, BadgeTone> = {
  PENDING: 'warning',
  PAID: 'success',
  CANCELLED: 'danger',
}

