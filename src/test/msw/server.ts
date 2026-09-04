import { setupServer } from 'msw/node'
import { handlers } from './handlers'

/** Backend falso dos testes. A API real nunca é chamada em teste. */
export const server = setupServer(...handlers)
