import type { ReactElement } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render as rtlRender } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { Toaster } from 'sonner'
import { useSessionStore } from '@/features/auth/session.store'
import type { Role } from '@/shared/types/roles'
import { fakeSession } from './msw/handlers'

interface Options {
  route?: string
  /** Padrão da rota, quando a tela lê parâmetros (`/membros/:id`). */
  path?: string
  roles?: Role[]
  /** `null` simula uma conta de plataforma, sem igreja vinculada. */
  churchId?: string | null
}

/** Renderiza uma tela com router e react-query — sem retry, para o teste falhar rápido. */
export function renderWithProviders(
  ui: ReactElement,
  { route = '/', path = '*', roles, churchId }: Options = {},
) {
  if (roles) {
    useSessionStore.setState({
      status: 'authenticated',
      user: {
        ...fakeSession.user,
        roles,
        churchId: churchId === undefined ? fakeSession.user.churchId : churchId,
      },
    })
  }

  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })

  const router = createMemoryRouter([{ path, element: ui }], { initialEntries: [route] })

  return rtlRender(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      {/* Os toasts das mutações precisam existir para serem asseridos nos testes. */}
      <Toaster />
    </QueryClientProvider>,
  )
}
