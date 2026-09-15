/**
 * Tipos de domínio espelhando os DTOs do backend (pacotes `application.<dominio>.dto`)
 * e os contratos em `project-ccvm/docs/api/contracts/`.
 *
 * Regra: `churchId` NUNCA sai daqui num request — é derivado do token (ADR-004 R1).
 * Ele aparece apenas em respostas.
 */
import type { DayOfWeek, IsoDate, IsoInstant, IsoTime, Uuid } from './api'
import type { Role } from './roles'

// ── comuns ───────────────────────────────────────────────────────────────────

export interface Address {
  street?: string | null
  number?: string | null
  complement?: string | null
  neighborhood?: string | null
  city?: string | null
  state?: string | null
  zipCode?: string | null
  country?: string | null
}

// ── auth ─────────────────────────────────────────────────────────────────────

export interface UserInfo {
  id: Uuid
  name: string
  email: string
  roles: Role[]
  churchId: Uuid | null
  lastLoginAt: IsoInstant | null
}

/** `PUT /auth/me`. Campo ausente não altera; trocar o e-mail exige a senha atual. */
export interface UpdateMeRequest {
  name?: string
  email?: string
  currentPassword?: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  accessToken: string
  refreshToken: string
  tokenType: string
  /** Segundos até expirar o access token. */
  expiresIn: number
  user: UserInfo
}

/** `POST /auth/register-church` — Onboarding self-service (ADR-008, ADR-009). */
export interface RegisterChurchRequest {
  churchName: string
  denomination?: Denomination | null
  adminName: string
  adminEmail: string
  adminPassword: string
  adminRole?: 'PASTOR_PRESIDENT' | 'PASTOR_AUXILIARY' | 'ADMIN_CHURCH'
  phone?: string | null
  address?: Address | null
  isPastor?: boolean
}

/** `GET /auth/my-churches` — Congregações vinculadas ao usuário logado (ADR-009). */
export interface MyChurchResponse {
  churchId: string
  churchName: string
  roles: Role[]
  isCurrent: boolean
}

/** `POST /auth/switch-church` — Alternar congregação ativa (ADR-009). */
export interface SwitchChurchRequest {
  churchId: string
}

export interface TokenResponse {
  accessToken: string
  tokenType: string
  expiresIn: number
}

/** `POST /users/invites` — Convidar operador para a igreja (ADR-006). */
export interface InviteUserRequest {
  email: string
  name: string
  roles: Role[]
}

export interface UserInviteResponse {
  id: string
  churchId: string
  email: string
  name: string
  roles: Role[]
  token: string
  expiresAt: IsoInstant
  createdAt: IsoInstant
}

/** `POST /auth/accept-invite` — Ativação por código de 4 dígitos (ADR-006). */
export interface AcceptInviteRequest {
  email: string
  token: string
  password: string
}

// ── church ───────────────────────────────────────────────────────────────────

export type ChurchStatus = 'ACTIVE' | 'INACTIVE'

export type Denomination =
  | 'ASSEMBLEIA_DE_DEUS'
  | 'BATISTA'
  | 'PRESBITERIANA'
  | 'METODISTA'
  | 'CATOLICA'
  | 'UNIVERSAL'
  | 'QUADRANGULAR'
  | 'OUTRA'

export interface ChurchContact {
  phone?: string | null
  email?: string | null
  website?: string | null
}

export interface Church {
  id: Uuid
  name: string
  status: ChurchStatus
  foundationDate: IsoDate | null
  denomination: Denomination | null
  description: string | null
  address: Address
  contact: ChurchContact
  presidentPastorId: Uuid | null
  adminUserId: Uuid | null
  statistics: { pastorCount: number }
  createdAt: IsoInstant
  updatedAt: IsoInstant
}

export interface ChurchSummary {
  id: Uuid
  name: string
  denomination: Denomination | null
  city: string | null
  status: ChurchStatus
  createdAt: IsoInstant
}

// ── pastor ───────────────────────────────────────────────────────────────────

export type PastorRole = 'PASTOR_PRESIDENT' | 'PASTOR_AUXILIARY'
export type PastorStatus = 'ACTIVE' | 'INACTIVE'
export type ContactVisibility = 'MEMBERS_ONLY' | 'PASTORS_ONLY' | 'PUBLIC'

export interface WorkSchedule {
  daysAvailable: DayOfWeek[]
  startTime?: IsoTime | null
  endTime?: IsoTime | null
}

export interface Pastor {
  id: Uuid
  churchId: Uuid | null
  name: string
  email: string
  phone: string | null
  dateOfBirth: IsoDate | null
  role: PastorRole
  position: string | null
  biography: string | null
  ordainmentDate: IsoDate | null
  profileImage: string | null
  status: PastorStatus
  contactVisibility: ContactVisibility
  specializations: string[]
  workSchedule: WorkSchedule | null
  hasUser?: boolean
  userId?: Uuid | null
  createdAt: IsoInstant
  updatedAt: IsoInstant
}

export interface PastorSummary {
  id: Uuid
  name: string
  email: string
  role: PastorRole
  position: string | null
  status: PastorStatus
  profileImage: string | null
  hasUser?: boolean
  userId?: Uuid | null
}

// ── member ───────────────────────────────────────────────────────────────────

export type Gender = 'M' | 'F'
export type MaritalStatus = 'SINGLE' | 'MARRIED' | 'DIVORCED' | 'WIDOWED' | 'OTHER'
export type MemberStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'EXCLUDED'

export interface Member {
  id: Uuid
  churchId: Uuid | null
  firstName: string
  lastName: string
  fullName: string
  email: string | null
  phone: string | null
  whatsapp: string | null
  dateOfBirth: IsoDate | null
  gender: Gender | null
  maritalStatus: MaritalStatus | null
  profileImage: string | null
  address: Address
  membershipDate: IsoDate | null
  status: MemberStatus
  baptizationDate: IsoDate | null
  baptized: boolean
  cellId: Uuid | null
  referredBy: Uuid | null
  profession: string | null
  company: string | null
  notes: string | null
  hasUser?: boolean
  userId?: Uuid | null
  createdAt: IsoInstant
  updatedAt: IsoInstant
}

export interface MemberSummary {
  id: Uuid
  fullName: string
  email: string | null
  phone: string | null
  whatsapp?: string | null
  city: string | null
  status: MemberStatus
  baptized: boolean
  membershipDate: IsoDate | null
  dateOfBirth?: IsoDate | null
  birthMonth?: number | null
  profileImage: string | null
  hasUser?: boolean
  userId?: Uuid | null
}

/** Filtros de listagem de membros. */
export interface MemberFilters {
  page?: number
  limit?: number
  search?: string
  status?: MemberStatus
  baptized?: boolean
  city?: string
  fromDate?: IsoDate
  toDate?: IsoDate
  birthMonth?: number
  sortBy?: string
  sortOrder?: 'ASC' | 'DESC'
}

export interface CreateMemberRequest {
  firstName: string
  lastName: string
  email: string
  phone?: string | null
  whatsapp?: string | null
  dateOfBirth?: IsoDate | null
  gender?: Gender | null
  maritalStatus?: MaritalStatus | null
  address?: Address | null
  membershipDate?: IsoDate | null
  baptizationDate?: IsoDate | null
  cellId?: Uuid | null
  referredBy?: Uuid | null
  profession?: string | null
  company?: string | null
  notes?: string | null
}

/**
 * Update parcial. Nos campos limpáveis (`cellId`, `referredBy`) a semântica é
 * ausente = não altera · `null` = limpa · valor = define (contracts/README).
 * Por isso o payload precisa ser montado com `omitUndefined`, nunca com spread cru.
 */
export type UpdateMemberRequest = Partial<
  Omit<CreateMemberRequest, 'email'> & { status: MemberStatus }
>

// ── cell ─────────────────────────────────────────────────────────────────────

export type CellStatus = 'ACTIVE' | 'INACTIVE' | 'MULTIPLYING'
export type MeetingFrequency = 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY'

export interface Meeting {
  dayOfWeek?: DayOfWeek | null
  time?: IsoTime | null
  frequency?: MeetingFrequency | null
}

export interface Cell {
  id: Uuid
  churchId: Uuid | null
  name: string
  description: string | null
  leaderId: Uuid | null
  coLeaderId: Uuid | null
  supervisorPastorId: Uuid | null
  meeting: Meeting | null
  address: Address
  status: CellStatus
  memberCount: number
  members: { id: Uuid; fullName: string; status: string }[]
  createdAt: IsoInstant
  updatedAt: IsoInstant
}

export interface CellSummary {
  id: Uuid
  name: string
  leaderId: Uuid | null
  supervisorPastorId: Uuid | null
  meeting: Meeting | null
  neighborhood: string | null
  status: CellStatus
  memberCount: number
}

// ── musician ─────────────────────────────────────────────────────────────────

export type Instrument =
  | 'GUITAR' | 'ACOUSTIC_GUITAR' | 'BASS' | 'DRUMS' | 'KEYBOARD' | 'PIANO'
  | 'VIOLIN' | 'CELLO' | 'FLUTE' | 'SAXOPHONE' | 'TRUMPET' | 'TROMBONE'
  | 'ACCORDION' | 'PERCUSSION' | 'VOCAL' | 'OTHER'

export type SkillLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'PROFESSIONAL'
export type MinistryRole = 'INSTRUMENTALIST' | 'VOCALIST' | 'WORSHIP_LEADER' | 'SOUND_TECHNICIAN' | 'MEDIA'
export type VoiceType = 'SOPRANO' | 'MEZZO_SOPRANO' | 'ALTO' | 'TENOR' | 'BARITONE' | 'BASS' | 'NONE'
export type MusicianStatus = 'ACTIVE' | 'INACTIVE' | 'ON_LEAVE'

export interface MusicianInstrument {
  instrument: Instrument
  skillLevel?: SkillLevel | null
  primary: boolean
}

export interface Musician {
  id: Uuid
  churchId: Uuid | null
  member: { id: Uuid; fullName: string; phone: string | null } | null
  ministryRole: MinistryRole
  instruments: MusicianInstrument[]
  voiceType: VoiceType | null
  canSing: boolean
  isWorshipLeader: boolean
  availability: { daysAvailable: DayOfWeek[]; notes?: string | null } | null
  status: MusicianStatus
  createdAt: IsoInstant
  updatedAt: IsoInstant
}

export interface MusicianSummary {
  id: Uuid
  memberName: string | null
  ministryRole: MinistryRole
  primaryInstrument: Instrument | null
  instruments: Instrument[]
  canSing: boolean
  isWorshipLeader: boolean
  status: MusicianStatus
}

// ── asset ────────────────────────────────────────────────────────────────────

export type AssetCategory =
  | 'MUSICAL_INSTRUMENT' | 'SOUND_EQUIPMENT' | 'FURNITURE' | 'ELECTRONICS'
  | 'VEHICLE' | 'REAL_ESTATE' | 'KITCHEN' | 'OFFICE' | 'LIGHTING' | 'MEDIA'
  | 'APPLIANCE' | 'OTHER'

export type AcquisitionType = 'PURCHASE' | 'DONATION' | 'TRANSFER' | 'MANUFACTURED'
export type AssetCondition = 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR' | 'BROKEN'
export type AssetStatus = 'IN_USE' | 'IN_STORAGE' | 'MAINTENANCE' | 'DISPOSED' | 'LOST'
export type MaintenanceType = 'PREVENTIVE' | 'CORRECTIVE' | 'INSPECTION'

export interface Acquisition {
  type?: AcquisitionType | null
  date?: IsoDate | null
  /** BigDecimal no backend: chega como número JSON — nunca faça aritmética de moeda em float. */
  value?: number | null
  currency?: string | null
  supplier?: string | null
  invoiceNumber?: string | null
}

export interface AssetSummary {
  id: Uuid
  name: string
  category: AssetCategory
  assetTag: string | null
  condition: AssetCondition
  location: string | null
  responsibleName: string | null
  currentValue: number | null
  status: AssetStatus
}

export interface AssetsSummary {
  churchId: Uuid
  totalItems: number
  totalValue: number
  currency: string
  byCategory: { category: AssetCategory; count: number; value: number }[]
  byCondition: { condition: AssetCondition; count: number }[]
  byStatus: { status: AssetStatus; count: number }[]
  maintenanceDueSoon: number
}

// ── document ─────────────────────────────────────────────────────────────────

export type DocumentCategory = 'SERMON_SUMMARY' | 'APOSTLE_NOTES' | 'DOCUMENTS' | 'REPORTS' | 'OTHER'
export type DocumentVisibility = 'PUBLIC' | 'MEMBERS_ONLY' | 'PRIVATE'

export interface DocumentSummary {
  id: Uuid
  title: string
  category: DocumentCategory
  visibility: DocumentVisibility
  fileType: string
  fileSize: number
  uploadedBy: string | null
  downloadCount: number
  tags: string[]
  /** O backend já diz se ESTE usuário pode baixar — não reimplemente a regra na UI. */
  allowDownload: boolean
  createdAt: IsoInstant
}

export interface DocumentDetail extends Omit<DocumentSummary, 'uploadedBy'> {
  churchId: Uuid | null
  description: string | null
  accessLevel: Role[]
  fileName: string
  uploadedBy: { id: Uuid | null; name: string | null }
  updatedAt: IsoInstant
}

// ── schedule ─────────────────────────────────────────────────────────────────

export type ScheduleType = 'CHURCH_EVENT' | 'STUDY' | 'CELL_GROUP' | 'PRAYER_MEETING' | 'TRAINING'

// ── pastoral visits ──────────────────────────────────────────────────────────

export type PastoralVisitStatus = 'REQUESTED' | 'SCHEDULED' | 'COMPLETED' | 'CANCELLED'

export interface MemberSummaryDto {
  id: Uuid
  name: string
}

export interface PastoralVisit {
  id: Uuid
  pastorId: Uuid | null
  pastorName: string | null
  requestedByMemberId: Uuid | null
  requestedByMemberName: string | null
  status: PastoralVisitStatus
  scheduledAt: IsoInstant | null
  location: string | null
  reason: string
  summary: string | null
  requiresReturn: boolean
  returnDate: IsoDate | null
  members: MemberSummaryDto[]
  createdAt: IsoInstant
}

export interface RequestPastoralVisitPayload {
  reason: string
  preferredDate?: IsoInstant | null
  notes?: string | null
}

export interface SchedulePastoralVisitRequest {
  pastorId?: Uuid | null
  memberIds: Uuid[]
  scheduledAt: IsoInstant
  location?: string | null
  reason: string
}

export interface CompletePastoralVisitRequest {
  summary: string
  requiresReturn?: boolean
  returnDate?: IsoDate | null
}
export type ScheduleStatus = 'SCHEDULED' | 'COMPLETED' | 'CANCELLED'
export type ScheduleVisibility = 'PUBLIC' | 'MEMBERS_ONLY'
export type ScaleStatus = 'INVITED' | 'CONFIRMED' | 'DECLINED'

export interface Preacher {
  pastorId?: Uuid | null
  pastorName?: string | null
  topic?: string | null
}

export interface EventDetails {
  minAge?: number | null
  capacity?: number | null
  ticketRequired?: boolean | null
  visibility?: ScheduleVisibility | null
  attendanceCount?: number | null
}

export interface Schedule {
  id: Uuid
  churchId: Uuid | null
  type: ScheduleType
  title: string
  description: string | null
  startDateTime: IsoInstant
  endDateTime: IsoInstant | null
  location: string | null
  address: string | null
  city: string | null
  preacher: Preacher | null
  eventDetails: EventDetails
  notifications: { sendReminder?: boolean | null; reminderDays?: number | null }
  status: ScheduleStatus
  createdBy: Uuid | null
  createdAt: IsoInstant
  updatedAt: IsoInstant
}

export interface ScheduleSummary {
  id: Uuid
  type: ScheduleType
  title: string
  startDateTime: IsoInstant
  endDateTime: IsoInstant | null
  location: string | null
  preacher: string | null
  topic: string | null
  attendanceCount: number
  visibility: ScheduleVisibility
  status: ScheduleStatus
}

export interface CalendarResponse {
  year: number
  month: number
  days: {
    day: number
    events: {
      id: Uuid
      type: ScheduleType
      title: string
      time: string
      location: string | null
      preacher: string | null
      status: ScheduleStatus
    }[]
  }[]
}

export interface ScheduleMusician {
  id: Uuid
  scheduleId: Uuid
  musicianId: Uuid
  musicianName: string | null
  instrument: Instrument | null
  status: ScaleStatus
  notes: string | null
}

// ── sermon ───────────────────────────────────────────────────────────────────

export type SermonTopic =
  | 'THEOLOGY' | 'SALVATION' | 'SANCTIFICATION' | 'DISCIPLESHIP' | 'LEADERSHIP'
  | 'FAMILY' | 'FINANCES' | 'HEALTH' | 'MISSIONS' | 'EVANGELISM' | 'OTHER'

export type SermonType =
  | 'SUNDAY_PREACHING' | 'MIDWEEK_STUDY' | 'SPECIAL_EVENT'
  | 'BAPTISM_SERMON' | 'MARRIAGE_SERMON' | 'FUNERAL_SERMON'

export type SermonVisibility = 'PUBLIC' | 'MEMBERS_ONLY' | 'PRIVATE'
export type SermonStatus = 'ACTIVE' | 'ARCHIVED'
export type TrendingPeriod = 'WEEK' | 'MONTH' | 'ALL_TIME'

export interface BibleReference {
  book: string
  chapter: number
  verses?: string | null
  translation?: string | null
}

export interface SermonSummary {
  id: Uuid
  title: string
  preacher: string | null
  sermonDate: IsoDate
  topic: SermonTopic
  duration: number | null
  youtubeLink: string | null
  viewCount: number
  likes: number
  keywords: string[]
  visibility: SermonVisibility
}

export interface Sermon {
  id: Uuid
  churchId: Uuid | null
  title: string
  description: string | null
  preacher: { id: Uuid | null; name: string | null } | null
  bibleReferences: BibleReference[]
  sermonDate: IsoDate
  sermonTime: IsoTime | null
  duration: number | null
  topic: SermonTopic
  sermonType: SermonType
  youtubeLink: string | null
  /** Derivado no backend a partir do id do vídeo — nunca renderize HTML vindo do cliente. */
  youtubeEmbedUrl: string | null
  visibility: SermonVisibility
  keywords: string[]
  statistics: { viewCount: number; likes: number }
  status: SermonStatus
  createdAt: IsoInstant
  updatedAt: IsoInstant
}

// ── notification ─────────────────────────────────────────────────────────────

export type NotificationType =
  | 'EVENT_REMINDER' | 'PASTOR_VISIT' | 'NEW_DOCUMENT' | 'WORSHIP_SCHEDULE'
  | 'NEW_SERMON' | 'CELL_MEETING' | 'GENERAL_ANNOUNCEMENT'

export type NotificationChannel = 'PUSH' | 'EMAIL'
export type AudienceTarget = 'ALL_MEMBERS' | 'SPECIFIC_MEMBERS' | 'BY_ROLE' | 'BY_CELL'
export type NotificationStatus = 'SCHEDULED' | 'SENDING' | 'SENT' | 'FAILED'

export interface Audience {
  target: AudienceTarget
  memberIds?: Uuid[]
  roles?: Role[]
  cellId?: Uuid | null
}

export interface InboxItem {
  id: Uuid
  type: NotificationType
  title: string
  body: string
  data: { resourceType?: string | null; resourceId?: string | null } | null
  read: boolean
  sentAt: IsoInstant | null
  createdAt: IsoInstant
}

export interface InboxResponse {
  data: InboxItem[]
  pagination: {
    page: number
    pageSize: number
    totalItems: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
    unreadCount: number
  }
}

// ── pastoral care ────────────────────────────────────────────────────────────

export type PastoralRecordType =
  | 'VISIT'
  | 'COUNSELING'
  | 'HOSPITAL_VISIT'
  | 'PHONE_CALL'
  | 'PRAYER_REQUEST'
  | 'DISCIPLINE'
  | 'OTHER'

export interface PastoralCareRecord {
  id: Uuid
  churchId?: Uuid | null
  memberId: Uuid
  pastorId: Uuid
  pastorName?: string | null
  type: PastoralRecordType
  date: IsoDate
  subject: string
  notes: string
  confidential: boolean
  createdAt: IsoInstant
  updatedAt: IsoInstant
}

export interface CreatePastoralRecordRequest {
  type: PastoralRecordType
  date: IsoDate
  subject: string
  notes: string
  confidential?: boolean
}

// ── absentees ────────────────────────────────────────────────────────────────

export interface AbsenteeMember {
  id?: string
  memberId: string
  fullName?: string
  memberName?: string
  phone?: string | null
  whatsapp?: string | null
  cellId?: string | null
  cellName?: string | null
  lastAttendanceDate?: IsoInstant | IsoDate | null
}

export interface AbsenteeListResponse {
  data: AbsenteeMember[]
  pagination: {
    page: number
    pageSize: number
    totalItems: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
  summary?: { totalAbsentees?: number }
}

// ── finance ──────────────────────────────────────────────────────────────────

export type FinancialType = 'INCOME' | 'EXPENSE'
export type PaymentMethod = 'CASH' | 'PIX' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'BANK_TRANSFER' | 'OTHER'
export type EntryStatus = 'PENDING' | 'PAID' | 'CANCELLED'

export interface Category {
  id: Uuid
  name: string
  type: FinancialType
  isSystemDefault?: boolean
}

export interface CreateCategoryRequest {
  name: string
  type: FinancialType
}

export type UpdateCategoryRequest = Partial<CreateCategoryRequest>

export interface FinancialEntry {
  id: Uuid
  churchId: Uuid | null
  description: string | null
  type: FinancialType
  amount: number
  date: IsoDate
  categoryId: Uuid
  categoryName: string
  paymentMethod: PaymentMethod
  status: EntryStatus
  memberId: Uuid | null
  memberName: string | null
  createdAt: IsoInstant
  updatedAt: IsoInstant
}

export interface FinancialReport {
  year: number
  month: number
  totalIncome: number
  totalExpense: number
  balance: number
  incomesByCategory: { categoryId: Uuid; categoryName: string; amount: number }[]
  expensesByCategory: { categoryId: Uuid; categoryName: string; amount: number }[]
}

export interface FinancialFilters {
  page?: number
  limit?: number
  search?: string
  type?: FinancialType
  categoryId?: Uuid
  status?: EntryStatus
  year?: number
  month?: number
  sortBy?: string
  sortOrder?: 'ASC' | 'DESC'
}

export interface CreateFinancialEntryRequest {
  description?: string | null
  type: FinancialType
  amount: number
  date: IsoDate
  categoryId: Uuid
  paymentMethod: PaymentMethod
  status: EntryStatus
  memberId?: Uuid | null
}

export type UpdateFinancialEntryRequest = Partial<CreateFinancialEntryRequest>

