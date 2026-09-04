import { useEffect, useState, type ReactNode } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import { createQueryClient } from '@/shared/api/query-client'
import { useSessionStore } from '@/features/auth/session.store'

export function AppProviders({ children }: { children: ReactNode }) {
  const [queryClient] = useState(createQueryClient)
  const restore = useSessionStore((s) => s.restore)

  // Boot: decide entre sessão restaurada e login antes de renderizar rota privada.
  useEffect(() => {
    void restore()
  }, [restore])

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster position="top-right" richColors closeButton />
    </QueryClientProvider>
  )
}
