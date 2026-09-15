import { createBrowserRouter } from 'react-router'
import { RequireAuth, RequirePermission } from '@/features/auth/guards'
import { LoginPage } from '@/features/auth/LoginPage'
import { AppShell } from '@/layouts/AppShell'
import { ForbiddenPage } from '@/pages/ForbiddenPage'
import { NotFoundPage } from '@/pages/NotFoundPage'

/**
 * Rotas em português — a URL faz parte da interface (ADR-003 R7).
 *
 * Cada módulo entra por `lazy`: o navegador baixa a tela de patrimônio quando
 * alguém abre patrimônio, não no primeiro acesso. Login e shell continuam
 * síncronos porque são o caminho de todo mundo.
 */
export const router = createBrowserRouter([
  {
    path: '/',
    lazy: async () => ({
      Component: (await import('@/pages/RootRoute')).RootRoute,
    }),
  },
  {
    path: '/home',
    lazy: async () => ({
      Component: (await import('@/pages/HomePage')).HomePage,
    }),
  },
  { path: '/login', element: <LoginPage /> },
  {
    path: '/primeiro-acesso',
    lazy: async () => ({
      Component: (await import('@/features/auth/FirstAccessPage')).FirstAccessPage,
    }),
  },
  {
    path: '/aceitar-convite',
    lazy: async () => ({
      Component: (await import('@/features/auth/FirstAccessPage')).FirstAccessPage,
    }),
  },
  {
    path: '/registro',
    lazy: async () => ({
      Component: (await import('@/features/auth/RegisterChurchPage')).RegisterChurchPage,
    }),
  },
  {
    element: <RequireAuth />,
    children: [
      {
        element: <AppShell />,
        children: [
          {
            path: 'painel',
            lazy: async () => ({
              Component: (await import('@/pages/DashboardPage')).DashboardPage,
            }),
          },

          {
            path: 'membros',
            lazy: async () => ({
              Component: (await import('@/features/members/MembersPage')).MembersPage,
            }),
          },
          {
            path: 'membros/novo',
            lazy: async () => ({
              Component: (await import('@/features/members/MemberFormPage')).MemberFormPage,
            }),
          },
          {
            path: 'membros/:id',
            lazy: async () => ({
              Component: (await import('@/features/members/MemberDetailPage')).MemberDetailPage,
            }),
          },
          {
            path: 'membros/:id/editar',
            lazy: async () => ({
              Component: (await import('@/features/members/MemberFormPage')).MemberFormPage,
            }),
          },

          {
            path: 'celulas',
            lazy: async () => ({
              Component: (await import('@/features/cells/CellsPage')).CellsPage,
            }),
          },
          {
            path: 'celulas/:id',
            lazy: async () => ({
              Component: (await import('@/features/cells/CellDetailPage')).CellDetailPage,
            }),
          },

          {
            path: 'pastores/:id',
            lazy: async () => ({
              Component: (await import('@/features/pastors/PastorDetailPage')).PastorDetailPage,
            }),
          },
          {
            path: 'pastores',
            lazy: async () => ({
              Component: (await import('@/features/pastors/PastorsPage')).PastorsPage,
            }),
          },
          {
            path: 'musicos/:id',
            lazy: async () => ({
              Component: (await import('@/features/musicians/MusicianDetailPage')).MusicianDetailPage,
            }),
          },
          {
            path: 'musicos',
            lazy: async () => ({
              Component: (await import('@/features/musicians/MusiciansPage')).MusiciansPage,
            }),
          },

          {
            path: 'agenda',
            lazy: async () => ({
              Component: (await import('@/features/schedules/SchedulesPage')).SchedulesPage,
            }),
          },
          {
            path: 'agenda/novo',
            lazy: async () => ({
              Component: (await import('@/features/schedules/ScheduleFormPage')).ScheduleFormPage,
            }),
          },
          {
            path: 'agenda/:id',
            lazy: async () => ({
              Component: (await import('@/features/schedules/ScheduleDetailPage')).ScheduleDetailPage,
            }),
          },
          {
            path: 'agenda/:id/editar',
            lazy: async () => ({
              Component: (await import('@/features/schedules/ScheduleFormPage')).ScheduleFormPage,
            }),
          },
          {
            path: 'visitas-pastorais',
            lazy: async () => ({
              Component: (await import('@/features/pastoral-visits/PastoralVisitsPage')).PastoralVisitsPage,
            }),
          },

          {
            path: 'sermoes',
            lazy: async () => ({
              Component: (await import('@/features/sermons/SermonsPage')).SermonsPage,
            }),
          },
          {
            path: 'sermoes/novo',
            lazy: async () => ({
              Component: (await import('@/features/sermons/SermonFormPage')).SermonFormPage,
            }),
          },
          {
            path: 'sermoes/:id',
            lazy: async () => ({
              Component: (await import('@/features/sermons/SermonDetailPage')).SermonDetailPage,
            }),
          },
          {
            path: 'sermoes/:id/editar',
            lazy: async () => ({
              Component: (await import('@/features/sermons/SermonFormPage')).SermonFormPage,
            }),
          },

          {
            path: 'documentos',
            lazy: async () => ({
              Component: (await import('@/features/documents/DocumentsPage')).DocumentsPage,
            }),
          },
          {
            path: 'notificacoes',
            lazy: async () => ({
              Component: (await import('@/features/notifications/NotificationsPage'))
                .NotificationsPage,
            }),
          },

          {
            element: <RequirePermission permission="finance.read" />,
            children: [
              {
                path: 'financeiro',
                lazy: async () => ({
                  Component: (await import('@/features/finances/FinancesPage')).FinancesPage,
                }),
              },
              {
                path: 'configuracoes',
                lazy: async () => ({
                  Component: (await import('@/features/finances/FinancialCategoriesPage')).FinancialCategoriesPage,
                }),
              },
            ],
          },

          // Patrimônio expõe valores financeiros: rota inteira restrita (ADR-005 R3).
          {
            element: <RequirePermission permission="asset.read" />,
            children: [
              {
                path: 'patrimonio',
                lazy: async () => ({
                  Component: (await import('@/features/assets/AssetsPage')).AssetsPage,
                }),
              },
              {
                path: 'patrimonio/:id',
                lazy: async () => ({
                  Component: (await import('@/features/assets/AssetDetailPage')).AssetDetailPage,
                }),
              },
            ],
          },

          {
            element: <RequirePermission permission="church.write" />,
            children: [
              {
                path: 'igreja',
                lazy: async () => ({
                  Component: (await import('@/features/church/ChurchSettingsPage'))
                    .ChurchSettingsPage,
                }),
              },
            ],
          },

          // Única área cross-tenant do console (ADR-005 R4).
          {
            element: <RequirePermission permission="church.platform" />,
            children: [
              {
                path: 'plataforma/igrejas',
                lazy: async () => ({
                  Component: (await import('@/features/church/ChurchesPlatformPage'))
                    .ChurchesPlatformPage,
                }),
              },
            ],
          },

          {
            path: 'minha-conta',
            lazy: async () => ({
              Component: (await import('@/features/account/AccountPage')).AccountPage,
            }),
          },

          { path: 'sem-permissao', element: <ForbiddenPage /> },
          { path: '*', element: <NotFoundPage /> },
        ],
      },
    ],
  },
])
