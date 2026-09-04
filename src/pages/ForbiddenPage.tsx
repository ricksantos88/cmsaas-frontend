import { Link } from 'react-router'
import { ShieldOff } from 'lucide-react'
import { Button } from '@/shared/ui/button'

export function ForbiddenPage() {
  return (
    <div className="flex flex-col items-center gap-3 py-24 text-center">
      <ShieldOff className="size-10 text-content-muted" aria-hidden />
      <h1 className="text-lg font-semibold text-content">Sem permissão</h1>
      <p className="max-w-md text-sm text-content-muted">
        Seu perfil não tem acesso a esta área. Fale com o pastor presidente ou com a administração
        da igreja.
      </p>
      <Button asChild variant="outline" className="mt-2">
        <Link to="/">Voltar ao painel</Link>
      </Button>
    </div>
  )
}
