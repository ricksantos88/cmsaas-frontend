import { Link } from 'react-router'
import { ArrowRight, Boxes, CalendarDays, Church, LogIn, ShieldCheck, Users } from 'lucide-react'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card, CardBody } from '@/shared/ui/card'

/**
 * Landing page pública do CMSaaS (ADR-008).
 * Acessível na rota raiz para visitantes e novos operadores.
 */
export function HomePage() {
  return (
    <div className="flex min-h-full flex-col bg-canvas text-content">
      {/* Topbar pública */}
      <header className="sticky top-0 z-30 border-b border-border-subtle bg-surface/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-card bg-primary text-primary-foreground shadow-sm">
              <Church className="size-5" aria-hidden />
            </div>
            <div>
              <span className="text-base font-bold tracking-tight text-content">CMSaaS</span>
              <Badge tone="info" className="ml-2 hidden sm:inline-flex">
                Console Administrativo
              </Badge>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button asChild variant="ghost" size="sm">
              <Link to="/login">Entrar</Link>
            </Button>
            <Button asChild size="sm">
              <Link to="/registro">Cadastrar Igreja</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="relative overflow-hidden px-4 pt-16 pb-20 sm:px-6 sm:pt-24 sm:pb-28 lg:px-8">
          <div className="mx-auto max-w-3xl text-center space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-border-subtle bg-surface px-3 py-1 text-xs font-medium text-content-muted">
              <ShieldCheck className="size-4 text-primary" aria-hidden />
              <span>SaaS multi-tenant seguro para igrejas</span>
            </div>

            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-content">
              Gestão completa, moderna e bíblica para sua igreja
            </h1>

            <p className="text-lg text-content-muted sm:text-xl leading-relaxed">
              O CMSaaS centraliza a rotina da secretaria, liderança de células, ministério de louvor e
              pastorado. Organize pessoas, cultos, escalas e patrimônio em uma plataforma intuitiva.
            </p>

            {/* Os dois botões principais exigidos */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Button asChild size="lg" className="w-full sm:w-auto gap-2 text-base px-6 py-3 shadow-md">
                <Link to="/registro">
                  <span>Cadastrar Igreja</span>
                  <ArrowRight className="size-4" aria-hidden />
                </Link>
              </Button>

              <Button asChild variant="outline" size="lg" className="w-full sm:w-auto gap-2 text-base px-6 py-3">
                <Link to="/login">
                  <LogIn className="size-4" aria-hidden />
                  <span>Acessar Console (Login)</span>
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Pilares da Plataforma */}
        <section className="border-t border-border-subtle bg-surface-muted/40 px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="text-center mb-12 space-y-2">
              <h2 className="text-2xl font-bold tracking-tight text-content sm:text-3xl">
                Tudo o que sua liderança precisa
              </h2>
              <p className="text-content-muted text-sm sm:text-base">
                Módulos pensados para a realidade prática de igrejas e congregações.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <Card className="hover:border-border transition-colors">
                <CardBody className="p-6 space-y-3">
                  <div className="grid size-11 place-items-center rounded-lg bg-primary/10 text-primary">
                    <Users className="size-5" aria-hidden />
                  </div>
                  <h3 className="text-base font-semibold text-content">Membros & Células</h3>
                  <p className="text-sm text-content-muted">
                    Cadastro completo de membros, acompanhamento pastoral e gestão de pequenos grupos em rede.
                  </p>
                </CardBody>
              </Card>

              <Card className="hover:border-border transition-colors">
                <CardBody className="p-6 space-y-3">
                  <div className="grid size-11 place-items-center rounded-lg bg-primary/10 text-primary">
                    <CalendarDays className="size-5" aria-hidden />
                  </div>
                  <h3 className="text-base font-semibold text-content">Agenda & Louvor</h3>
                  <p className="text-sm text-content-muted">
                    Calendário de cultos e eventos, escala de músicos com disponibilidade e controle de presença.
                  </p>
                </CardBody>
              </Card>

              <Card className="hover:border-border transition-colors">
                <CardBody className="p-6 space-y-3">
                  <div className="grid size-11 place-items-center rounded-lg bg-primary/10 text-primary">
                    <Boxes className="size-5" aria-hidden />
                  </div>
                  <h3 className="text-base font-semibold text-content">Patrimônio & Ativos</h3>
                  <p className="text-sm text-content-muted">
                    Inventário com tombamento, registro de manutenções preventivas e controle de baixas.
                  </p>
                </CardBody>
              </Card>

              <Card className="hover:border-border transition-colors">
                <CardBody className="p-6 space-y-3">
                  <div className="grid size-11 place-items-center rounded-lg bg-primary/10 text-primary">
                    <ShieldCheck className="size-5" aria-hidden />
                  </div>
                  <h3 className="text-base font-semibold text-content">Segurança & Documentos</h3>
                  <p className="text-sm text-content-muted">
                    Isolamento estrito entre igrejas, perfis de acesso (RBAC) e repositório protegido de arquivos.
                  </p>
                </CardBody>
              </Card>
            </div>
          </div>
        </section>
      </main>

      {/* Rodapé */}
      <footer className="border-t border-border-subtle bg-surface px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col sm:flex-row items-center justify-between gap-4 text-xs text-content-muted">
          <div className="flex items-center gap-2">
            <Church className="size-4 text-primary" aria-hidden />
            <span>CMSaaS — Church Management SaaS</span>
          </div>
          <p>© {new Date().getFullYear()} CMSaaS. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  )
}
