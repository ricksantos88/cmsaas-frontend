import '@testing-library/jest-dom/vitest'
import { afterAll, afterEach, beforeAll, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import { server } from './msw/server'
import { tokenStore } from '@/shared/api/token-store'

/**
 * O jsdom não implementa a Pointer Events API nem o ResizeObserver, e os
 * componentes do Radix (menu, diálogo) chamam os dois. Sem estes stubs, abrir
 * um menu no teste trava em vez de falhar com uma mensagem.
 */
Element.prototype.hasPointerCapture ??= () => false
Element.prototype.setPointerCapture ??= () => {}
Element.prototype.releasePointerCapture ??= () => {}
Element.prototype.scrollIntoView ??= () => {}

globalThis.ResizeObserver ??= class {
  observe() {}
  unobserve() {}
  disconnect() {}
}

globalThis.matchMedia ??= ((query: string) => ({
  matches: false,
  media: query,
  onchange: null,
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  addListener: vi.fn(),
  removeListener: vi.fn(),
  dispatchEvent: vi.fn(),
})) as typeof globalThis.matchMedia

// `onUnhandledRequest: 'error'` — chamada sem handler é bug de teste, não silêncio.
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))

afterEach(() => {
  server.resetHandlers()
  cleanup()
  tokenStore.clear()
})

afterAll(() => server.close())
