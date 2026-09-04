import { Link } from 'react-router'
import { Button } from '@/shared/ui/button'

export function NotFoundPage() {
  return (
    <div className="flex flex-col items-center gap-3 py-24 text-center">
      <p className="text-4xl font-semibold text-content-muted">404</p>
      <h1 className="text-lg font-semibold text-content">Página não encontrada</h1>
      <Button asChild variant="outline" className="mt-2">
        <Link to="/">Voltar ao painel</Link>
      </Button>
    </div>
  )
}
