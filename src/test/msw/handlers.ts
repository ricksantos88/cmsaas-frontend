import { http, HttpResponse } from 'msw'
import type { PageResponse } from '@/shared/types/api'
import type {
  AbsenteeListResponse,
  Church,
  CreatePastoralRecordRequest,
  LoginResponse,
  Member,
  MemberSummary,
  MyChurchResponse,
  PastoralCareRecord,
  PastorSummary,
  RequestPastoralVisitPayload,
  SchedulePastoralVisitRequest,
  CompletePastoralVisitRequest,
  Schedule,
  ScheduleSummary,
} from '@/shared/types/domain'

export const fakeSession: LoginResponse = {
  accessToken: 'access-token',
  refreshToken: 'refresh-token',
  tokenType: 'Bearer',
  expiresIn: 3600,
  user: {
    id: 'user-1',
    name: 'Pastor João Silva',
    email: 'joao@igreja.com',
    roles: ['PASTOR_PRESIDENT'],
    churchId: 'church-1',
    lastLoginAt: '2026-08-31T09:00:00Z',
  },
}

export const fakeMyChurches: MyChurchResponse[] = [
  {
    churchId: 'church-1',
    churchName: 'Igreja Central',
    roles: ['PASTOR_PRESIDENT'],
    isCurrent: true,
  },
]

export const fakeMember: Member = {
  id: 'member-1',
  churchId: 'church-1',
  firstName: 'Maria',
  lastName: 'Souza',
  fullName: 'Maria Souza',
  email: 'maria@exemplo.com',
  phone: '(11) 99999-0000',
  whatsapp: '(11) 99999-0000',
  dateOfBirth: '1990-05-20',
  gender: 'F',
  maritalStatus: 'MARRIED',
  profileImage: null,
  address: { city: 'São Paulo', state: 'SP' },
  membershipDate: '2024-03-10',
  status: 'ACTIVE',
  baptizationDate: '2024-06-01',
  baptized: true,
  cellId: null,
  referredBy: null,
  profession: 'Professora',
  company: null,
  notes: null,
  hasUser: true,
  userId: 'user-maria',
  userRoles: ['MEMBER'],
  createdAt: '2024-03-10T12:00:00Z',
  updatedAt: '2026-01-10T12:00:00Z',
}

export const fakeMembers: PageResponse<MemberSummary> = {
  data: [
    {
      id: 'member-1',
      fullName: 'Maria Souza',
      email: 'maria@exemplo.com',
      phone: '(11) 99999-0000',
      whatsapp: '(11) 99999-0000',
      city: 'São Paulo',
      status: 'ACTIVE',
      baptized: true,
      membershipDate: '2024-03-10',
      dateOfBirth: '1990-05-20',
      birthMonth: 5,
      profileImage: null,
    },
  ],
  pagination: { page: 1, pageSize: 20, totalItems: 1, totalPages: 1, hasNext: false, hasPrev: false },
}

export const fakePastoralCareRecords: PastoralCareRecord[] = [
  {
    id: 'pastoral-1',
    churchId: 'church-1',
    memberId: 'member-1',
    pastorId: 'pastor-1',
    pastorName: 'Pastor João Silva',
    type: 'COUNSELING',
    date: '2026-08-15',
    subject: 'Aconselhamento familiar',
    notes: 'Conversa sobre direcionamento espiritual e família.',
    confidential: false,
    createdAt: '2026-08-15T14:00:00Z',
    updatedAt: '2026-08-15T14:00:00Z',
  },
  {
    id: 'pastoral-2',
    churchId: 'church-1',
    memberId: 'member-1',
    pastorId: 'pastor-1',
    pastorName: 'Pastor João Silva',
    type: 'VISIT',
    date: '2026-09-01',
    subject: 'Visita pastoral',
    notes: 'Visita domiciliar com oração pelo lar.',
    confidential: true,
    createdAt: '2026-09-01T15:00:00Z',
    updatedAt: '2026-09-01T15:00:00Z',
  },
]

export const fakeAbsentees: AbsenteeListResponse = {
  data: [
    {
      id: 'absentee-1',
      memberId: 'member-2',
      memberName: 'Carlos Eduardo',
      phone: '(11) 98888-2222',
      whatsapp: '(11) 98888-2222',
      cellName: 'Célula Betel',
      lastAttendanceDate: '2026-08-20',
    },
  ],
  pagination: {
    page: 1,
    pageSize: 20,
    totalItems: 1,
    totalPages: 1,
    hasNext: false,
    hasPrev: false,
  },
  summary: { totalAbsentees: 1 },
}

export const fakeAttendance = {
  data: [
    {
      id: 'att-1',
      memberId: 'member-1',
      memberName: 'Maria Souza',
      checkInTime: '2026-09-06T21:45:00Z',
      checkOutTime: null,
      present: true,
    },
  ],
  pagination: { page: 1, pageSize: 20, totalItems: 1, totalPages: 1, hasNext: false, hasPrev: false },
  summary: { totalAttended: 1, totalExpected: 50, attendancePercentage: 2 },
}

export const fakeChurch: Church = {
  id: 'church-1',
  name: 'Igreja Central',
  status: 'ACTIVE',
  foundationDate: '1998-04-12',
  denomination: 'BATISTA',
  description: null,
  address: { city: 'São Paulo', state: 'SP' },
  contact: { phone: '(11) 3333-0000', email: 'contato@igreja.com', website: null },
  presidentPastorId: 'pastor-1',
  adminUserId: null,
  statistics: { pastorCount: 3 },
  createdAt: '2024-01-01T12:00:00Z',
  updatedAt: '2026-01-01T12:00:00Z',
}

const emptyPage = { data: [], pagination: { page: 1, pageSize: 20, totalItems: 0, totalPages: 0, hasNext: false, hasPrev: false } }

const fakePastors: PageResponse<PastorSummary> = {
  data: [
    {
      id: 'pastor-1',
      name: 'Pastor João Silva',
      email: 'joao@igreja.com',
      role: 'PASTOR_PRESIDENT',
      position: 'Presidente',
      status: 'ACTIVE',
      profileImage: null,
    },
  ],
  pagination: { page: 1, pageSize: 20, totalItems: 1, totalPages: 1, hasNext: false, hasPrev: false },
}

const fakeSchedules: PageResponse<ScheduleSummary> = {
  data: [
    {
      id: 'schedule-1',
      type: 'CHURCH_EVENT',
      title: 'Culto de domingo',
      startDateTime: '2026-09-06T22:00:00Z',
      endDateTime: null,
      location: 'Templo principal',
      preacher: 'Pastor João Silva',
      topic: 'Fé',
      attendanceCount: 42,
      visibility: 'PUBLIC',
      status: 'SCHEDULED',
    },
  ],
  pagination: { page: 1, pageSize: 20, totalItems: 1, totalPages: 1, hasNext: false, hasPrev: false },
}

export const fakeScheduleDetail: Schedule = {
  id: 'schedule-1',
  churchId: 'church-1',
  type: 'CHURCH_EVENT',
  title: 'Culto de Domingo',
  description: 'Culto de celebração',
  startDateTime: '2026-09-06T19:00:00Z',
  endDateTime: '2026-09-06T21:00:00Z',
  location: 'Templo principal',
  address: 'Rua Principal, 100',
  city: 'São Paulo',
  preacher: {
    pastorId: 'pastor-1',
    pastorName: 'Pastor João Silva',
    topic: 'Fé e Esperança',
  },
  eventDetails: {
    capacity: 200,
    visibility: 'PUBLIC',
  },
  notifications: {
    sendReminder: true,
    reminderDays: 1,
  },
  status: 'SCHEDULED',
  createdBy: 'user-1',
  createdAt: '2026-09-01T12:00:00Z',
  updatedAt: '2026-09-01T12:00:00Z',
}

export const handlers = [
  http.post('*/api/v1/auth/login', () => HttpResponse.json(fakeSession)),
  http.post('*/api/v1/auth/register-church', () => HttpResponse.json(fakeSession, { status: 201 })),
  http.get('*/api/v1/auth/me', () => HttpResponse.json(fakeSession.user)),
  http.get('*/api/v1/auth/my-churches', () => HttpResponse.json(fakeMyChurches)),
  http.post('*/api/v1/auth/switch-church', () => HttpResponse.json(fakeSession)),
  http.post('*/api/v1/auth/refresh', () =>
    HttpResponse.json({ accessToken: 'access-token', tokenType: 'Bearer', expiresIn: 3600 }),
  ),

  http.get('*/api/v1/members', ({ request }) => {
    const url = new URL(request.url)
    const birthMonth = url.searchParams.get('birthMonth')
    if (birthMonth) {
      const monthNum = Number(birthMonth)
      const filtered = fakeMembers.data.filter((m) => m.birthMonth === monthNum)
      return HttpResponse.json({
        data: filtered,
        pagination: { ...fakeMembers.pagination, totalItems: filtered.length },
      })
    }
    return HttpResponse.json(fakeMembers)
  }),
  http.get('*/api/v1/members/:id/pastoral-care', () => HttpResponse.json(fakePastoralCareRecords)),
  http.post('*/api/v1/members/:id/pastoral-care', async ({ request, params }) => {
    const body = (await request.json()) as CreatePastoralRecordRequest
    const newRecord: PastoralCareRecord = {
      id: `pastoral-${Date.now()}`,
      churchId: 'church-1',
      memberId: params.id as string,
      pastorId: 'pastor-1',
      pastorName: 'Pastor João Silva',
      type: body.type,
      date: body.date,
      subject: body.subject,
      notes: body.notes,
      confidential: Boolean(body.confidential),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    return HttpResponse.json(newRecord, { status: 201 })
  }),
  http.get('*/api/v1/members/:id', () => HttpResponse.json(fakeMember)),
  http.post('*/api/v1/members', () => HttpResponse.json(fakeMember, { status: 201 })),
  http.put('*/api/v1/members/:id', () => HttpResponse.json(fakeMember)),
  http.delete('*/api/v1/members/:id', () => new HttpResponse(null, { status: 204 })),

  http.get('*/api/v1/pastors', () => HttpResponse.json(fakePastors)),
  http.get('*/api/v1/cells', () => HttpResponse.json(emptyPage)),
  http.get('*/api/v1/pastors/:id/contacts', () =>
    HttpResponse.json({
      id: 'pastor-1',
      name: 'Pastor João Silva',
      role: 'PASTOR_PRESIDENT',
      visibilityLevel: 'MEMBERS_ONLY',
      email: 'joao@igreja.com',
      phone: '(11) 98888-1000',
      workSchedule: { daysAvailable: ['TUESDAY'], startTime: '14:00', endTime: '18:00' },
    }),
  ),
  http.get('*/api/v1/pastors/:id', () =>
    HttpResponse.json({
      id: 'pastor-1',
      churchId: 'church-1',
      name: 'Pastor João Silva',
      email: 'joao@igreja.com',
      phone: '(11) 98888-1000',
      dateOfBirth: '1975-04-02',
      role: 'PASTOR_PRESIDENT',
      position: 'Presidente',
      biography: 'Serve a igreja desde 2005.',
      ordainmentDate: '2005-09-18',
      profileImage: null,
      status: 'ACTIVE',
      contactVisibility: 'MEMBERS_ONLY',
      specializations: ['Aconselhamento'],
      workSchedule: { daysAvailable: ['TUESDAY'], startTime: '14:00', endTime: '18:00' },
      createdAt: '2024-01-01T12:00:00Z',
      updatedAt: '2026-01-01T12:00:00Z',
    }),
  ),
  http.get('*/api/v1/assets/:id', () =>
    HttpResponse.json({
      id: 'asset-1',
      churchId: 'church-1',
      name: 'Teclado Yamaha PSR',
      description: 'Item do patrimônio',
      category: 'MUSICAL_INSTRUMENT',
      assetTag: 'PAT-0001',
      serialNumber: 'SN-123',
      acquisition: { type: 'PURCHASE', date: '2024-05-10', value: 4800, currency: 'BRL', supplier: 'Fornecedor Demo', invoiceNumber: null },
      currentValue: 4800,
      condition: 'EXCELLENT',
      location: 'Templo principal',
      responsible: { id: 'member-1', fullName: 'Maria Souza' },
      warrantyUntil: null,
      nextMaintenanceDate: '2026-10-01',
      notes: null,
      maintenanceHistory: [
        {
          id: 'maint-1',
          assetId: 'asset-1',
          date: '2026-08-05',
          type: 'PREVENTIVE',
          description: 'Limpeza e revisão geral',
          cost: 180,
          performedBy: 'Assistência Musical',
          conditionAfter: 'EXCELLENT',
          createdAt: '2026-08-05T12:00:00Z',
        },
      ],
      status: 'IN_USE',
      createdAt: '2024-05-10T12:00:00Z',
      updatedAt: '2026-08-05T12:00:00Z',
    }),
  ),
  http.get('*/api/v1/musicians', () => HttpResponse.json(emptyPage)),
  http.get('*/api/v1/sermons', () => HttpResponse.json(emptyPage)),
  http.get('*/api/v1/schedules', () => HttpResponse.json(fakeSchedules)),
  http.get('*/api/v1/schedules/:id', () => HttpResponse.json(fakeScheduleDetail)),
  http.get('*/api/v1/schedules/:id/attendance', () => HttpResponse.json(fakeAttendance)),
  http.post('*/api/v1/schedules/:id/attendance', () =>
    HttpResponse.json({ registered: 1, alreadyRegistered: 0, totalAttended: 2 }, { status: 201 }),
  ),
  http.delete('*/api/v1/schedules/:id/attendance/:memberId', () => new HttpResponse(null, { status: 204 })),
  http.get('*/api/v1/schedules/:id/absentees', () => HttpResponse.json(fakeAbsentees)),
  http.get('*/api/v1/schedules/:id/musicians', () => HttpResponse.json([])),
  http.get('*/api/v1/assets/summary', () =>
    HttpResponse.json({
      churchId: 'church-1',
      totalItems: 12,
      totalValue: 45000,
      currency: 'BRL',
      byCategory: [],
      byCondition: [],
      byStatus: [],
      maintenanceDueSoon: 2,
    }),
  ),

  http.put('*/api/v1/auth/me', async ({ request }) => {
    const body = (await request.json()) as { name?: string; email?: string }
    return HttpResponse.json({
      ...fakeSession.user,
      name: body.name ?? fakeSession.user.name,
      email: body.email ?? fakeSession.user.email,
    })
  }),
  http.post('*/api/v1/auth/change-password', () => new HttpResponse(null, { status: 204 })),
  http.post('*/api/v1/auth/logout', () => new HttpResponse(null, { status: 204 })),

  http.get('*/api/v1/notifications/preferences', () =>
    HttpResponse.json({
      channels: { push: true, email: true },
      types: {
        EVENT_REMINDER: { push: true, email: false },
        PASTOR_VISIT: { push: true, email: true },
        NEW_DOCUMENT: { push: false, email: false },
        WORSHIP_SCHEDULE: { push: true, email: false },
        NEW_SERMON: { push: true, email: false },
        CELL_MEETING: { push: true, email: false },
        GENERAL_ANNOUNCEMENT: { push: true, email: true },
      },
    }),
  ),
  http.put('*/api/v1/notifications/preferences', () => new HttpResponse(null, { status: 204 })),

  http.get('*/api/v1/pastoral-visits', () =>
    HttpResponse.json([
      {
        id: 'visit-1',
        pastorId: 'pastor-1',
        pastorName: 'Pastor João Silva',
        requestedByMemberId: null,
        requestedByMemberName: null,
        status: 'SCHEDULED',
        scheduledAt: '2026-09-20T15:00:00Z',
        location: 'Residência do Membro',
        reason: 'Acompanhamento da família',
        summary: null,
        requiresReturn: false,
        returnDate: null,
        members: [{ id: 'member-1', name: 'Maria Souza' }],
        createdAt: '2026-09-15T10:00:00Z',
      },
    ]),
  ),
  http.get('*/api/v1/pastoral-visits/requests/my', () => HttpResponse.json([])),
  http.post('*/api/v1/pastoral-visits/requests', async ({ request }) => {
    const body = (await request.json()) as RequestPastoralVisitPayload
    return HttpResponse.json(
      {
        id: `visit-${Date.now()}`,
        pastorId: null,
        pastorName: null,
        requestedByMemberId: 'member-1',
        requestedByMemberName: 'Maria Souza',
        status: 'REQUESTED',
        scheduledAt: body.preferredDate ?? null,
        location: null,
        reason: body.reason,
        summary: null,
        requiresReturn: false,
        returnDate: null,
        members: [{ id: 'member-1', name: 'Maria Souza' }],
        createdAt: new Date().toISOString(),
      },
      { status: 201 },
    )
  }),
  http.post('*/api/v1/pastoral-visits', async ({ request }) => {
    const body = (await request.json()) as SchedulePastoralVisitRequest
    return HttpResponse.json(
      {
        id: `visit-${Date.now()}`,
        pastorId: body.pastorId ?? 'pastor-1',
        pastorName: 'Pastor João Silva',
        requestedByMemberId: null,
        requestedByMemberName: null,
        status: 'SCHEDULED',
        scheduledAt: body.scheduledAt,
        location: body.location ?? null,
        reason: body.reason,
        summary: null,
        requiresReturn: false,
        returnDate: null,
        members: [{ id: 'member-1', name: 'Maria Souza' }],
        createdAt: new Date().toISOString(),
      },
      { status: 201 },
    )
  }),
  http.post('*/api/v1/pastoral-visits/:id/complete', async ({ request, params }) => {
    const body = (await request.json()) as CompletePastoralVisitRequest
    return HttpResponse.json({
      id: params.id as string,
      pastorId: 'pastor-1',
      pastorName: 'Pastor João Silva',
      requestedByMemberId: null,
      requestedByMemberName: null,
      status: 'COMPLETED',
      scheduledAt: '2026-09-20T15:00:00Z',
      location: 'Residência do Membro',
      reason: 'Acompanhamento da família',
      summary: body.summary,
      requiresReturn: Boolean(body.requiresReturn),
      returnDate: body.returnDate ?? null,
      members: [{ id: 'member-1', name: 'Maria Souza' }],
      createdAt: '2026-09-15T10:00:00Z',
    })
  }),
  http.post('*/api/v1/pastoral-visits/:id/cancel', ({ params }) =>
    HttpResponse.json({
      id: params.id as string,
      pastorId: 'pastor-1',
      pastorName: 'Pastor João Silva',
      requestedByMemberId: null,
      requestedByMemberName: null,
      status: 'CANCELLED',
      scheduledAt: '2026-09-20T15:00:00Z',
      location: 'Residência do Membro',
      reason: 'Acompanhamento da família',
      summary: null,
      requiresReturn: false,
      returnDate: null,
      members: [{ id: 'member-1', name: 'Maria Souza' }],
      createdAt: '2026-09-15T10:00:00Z',
    }),
  ),

  http.get('*/api/v1/users', () =>
    HttpResponse.json([
      {
        id: 'user-maria',
        name: 'Maria Souza',
        email: 'maria@exemplo.com',
        roles: ['MEMBER'],
        status: 'ACTIVE',
        churchId: 'church-1',
        lastLoginAt: '2026-08-31T09:00:00Z',
        createdAt: '2024-03-10T12:00:00Z',
      },
      {
        id: 'member-1',
        name: 'Maria Souza',
        email: 'maria@exemplo.com',
        roles: ['MEMBER'],
        status: 'ACTIVE',
        churchId: 'church-1',
        lastLoginAt: '2026-08-31T09:00:00Z',
        createdAt: '2024-03-10T12:00:00Z',
      },
    ]),
  ),

  http.put('*/api/v1/users/:id/roles', async ({ request, params }) => {
    const body = (await request.json()) as { roles: string[] }
    return HttpResponse.json({
      id: params.id as string,
      name: 'Maria Souza',
      email: 'maria@exemplo.com',
      roles: body.roles,
      status: 'ACTIVE',
      churchId: 'church-1',
      lastLoginAt: '2026-08-31T09:00:00Z',
      createdAt: '2024-03-10T12:00:00Z',
    })
  }),

  http.get('*/api/v1/churches/:id', () => HttpResponse.json(fakeChurch)),
  http.put('*/api/v1/churches/:id', () => HttpResponse.json(fakeChurch)),
]

/** Resposta de erro no formato da ADR-004 C3 — para testar o caminho triste. */
export function errorResponse(status: number, code: string, message: string, details?: unknown) {
  return HttpResponse.json(
    { error: { code, message, details }, traceId: 'trace-1', timestamp: '2026-08-31T09:00:00Z' },
    { status },
  )
}
