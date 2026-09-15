import { Link } from 'react-router'
import {
  ArrowRight,
  Boxes,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Compass,
  HeartHandshake,
  LogIn,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card, CardBody } from '@/shared/ui/card'
import { Logo } from '@/shared/ui/logo'

/**
 * Landing page pública do CMSaaS (ADR-008).
 * Reformulada com a nova identidade visual B2B ministerial (Linear/Stripe style).
 */
export function HomePage() {
  return (
    <div className="flex min-h-full flex-col bg-canvas text-content font-sans antialiased selection:bg-accent/20 selection:text-accent">
      {/* 1. Navbar / Topbar Limpa */}
      <header className="sticky top-0 z-40 w-full border-b border-border-subtle bg-surface/80 backdrop-blur-md transition-all">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2 focus-visible:outline-none">
              <Logo className="h-8 sm:h-9 w-auto" />
            </Link>
            
            {/* Navegação Central */}
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-content-muted">
              <a href="#recursos" className="hover:text-content transition-colors">Recursos</a>
              <a href="#modulos" className="hover:text-content transition-colors">Módulos</a>
              <a href="#diferenciais" className="hover:text-content transition-colors">Diferenciais</a>
              <a href="#seguranca" className="hover:text-content transition-colors">Segurança</a>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <Badge tone="accent" className="hidden lg:inline-flex px-2.5 py-1 text-xs font-semibold">
              Console Administrativo v2.0
            </Badge>

            <Button asChild variant="ghost" size="sm" className="font-medium">
              <Link to="/login" className="gap-1.5">
                <LogIn className="size-4" aria-hidden />
                <span>Entrar</span>
              </Link>
            </Button>
            <Button asChild size="sm" className="bg-primary hover:bg-primary-hover text-primary-foreground font-semibold rounded-lg shadow-sm transition-all hover:scale-[1.02]">
              <Link to="/registro">Cadastrar Igreja</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {/* 2. Hero Section */}
        <section className="relative overflow-hidden px-4 pt-16 pb-20 sm:px-6 sm:pt-24 sm:pb-28 lg:px-8">
          {/* Subtle radial glow overlay */}
          <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 -z-10 h-[500px] w-full max-w-7xl bg-[radial-gradient(ellipse_at_top,_var(--color-accent)_0%,_transparent_60%)] opacity-10 blur-3xl" />

          <div className="mx-auto max-w-4xl text-center space-y-8">
            {/* Pill/Tag */}
            <div className="inline-flex items-center gap-2.5 rounded-full border border-border-subtle bg-surface px-4 py-1.5 text-xs font-medium text-content shadow-xs">
              <span className="flex size-2 rounded-full bg-accent animate-pulse" />
              <ShieldCheck className="size-4 text-accent" aria-hidden />
              <span className="text-content-muted">Plataforma SaaS Multi-tenant</span>
              <span className="h-3 w-px bg-border-subtle" />
              <span className="font-semibold text-primary">Gestão Bíblica & Eficiente</span>
            </div>

            {/* H1 Headline */}
            <h1 className="text-4xl font-extrabold tracking-[-0.02em] sm:text-5xl lg:text-[48px] lg:leading-[1.15] text-primary">
              Gestão completa, moderna e bíblica para sua igreja
            </h1>

            {/* Subtitle */}
            <p className="mx-auto max-w-2xl text-base text-content-muted sm:text-lg leading-relaxed">
              O CMSaaS centraliza a rotina da secretaria, liderança de células, ministério de louvor e
              pastorado. Organize pessoas, cultos, escalas e patrimônio em uma plataforma intuitiva e acolhedora.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <Button
                asChild
                size="lg"
                className="w-full sm:w-auto gap-2.5 bg-primary hover:bg-primary-hover text-primary-foreground font-semibold rounded-lg px-7 py-3.5 shadow-md transition-all hover:scale-[1.02]"
              >
                <Link to="/registro">
                  <span>Cadastrar Igreja</span>
                  <ArrowRight className="size-4 text-accent" aria-hidden />
                </Link>
              </Button>

              <Button
                asChild
                variant="outline"
                size="lg"
                className="w-full sm:w-auto gap-2.5 border-border-subtle bg-surface text-content hover:bg-surface-muted rounded-lg px-7 py-3.5 font-medium shadow-xs transition-all"
              >
                <Link to="/login">
                  <LogIn className="size-4 text-content-muted" aria-hidden />
                  <span>Acessar Console (Login)</span>
                </Link>
              </Button>
            </div>

            {/* Trust Micro-badges */}
            <div className="pt-8 flex flex-wrap items-center justify-center gap-y-2 gap-x-6 text-xs font-medium text-content-muted">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="size-4 text-accent" />
                <span>Isolamento Seguro Multi-tenant</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="size-4 text-accent" />
                <span>Pronto para Celular & App Mobile</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="size-4 text-accent" />
                <span>Painéis em Tempo Real</span>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Metric & Impact Highlights (Stripe/Linear style) */}
        <section className="border-y border-border-subtle bg-surface py-10 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div className="space-y-1">
                <p className="text-3xl font-extrabold text-primary tabular-nums tracking-tight">100%</p>
                <p className="text-xs font-medium text-content-muted uppercase tracking-wider">Isolamento por Igreja</p>
              </div>
              <div className="space-y-1">
                <p className="text-3xl font-extrabold text-accent tabular-nums tracking-tight">Zero</p>
                <p className="text-xs font-medium text-content-muted uppercase tracking-wider">Burocracia em Escalas</p>
              </div>
              <div className="space-y-1">
                <p className="text-3xl font-extrabold text-primary tabular-nums tracking-tight">100k+</p>
                <p className="text-xs font-medium text-content-muted uppercase tracking-wider">Registros Gerenciados</p>
              </div>
              <div className="space-y-1">
                <p className="text-3xl font-extrabold text-accent tabular-nums tracking-tight">24/7</p>
                <p className="text-xs font-medium text-content-muted uppercase tracking-wider">Disponibilidade Cloud</p>
              </div>
            </div>
          </div>
        </section>

        {/* 4. Módulos & Pilares da Plataforma */}
        <section id="modulos" className="px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="text-center mb-16 space-y-3">
              <span className="text-xs font-bold uppercase tracking-widest text-accent">Pilares Estratégicos</span>
              <h2 className="text-2xl font-bold tracking-[-0.015em] sm:text-[28px] text-primary">
                Tudo o que sua liderança precisa
              </h2>
              <p className="text-content-muted text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
                Módulos pensados para a realidade prática de secretarias, pastores, tesouraria e ministérios.
              </p>
            </div>

            {/* Cards Grid: 24px padding (p-6), rounded-xl, background surface, 1px border #E8E4DD */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {/* Pillar 1: Membros & Células */}
              <Card className="rounded-xl border border-border-subtle bg-surface p-6 shadow-xs hover:shadow-md transition-all hover:-translate-y-0.5 group">
                <CardBody className="p-0 space-y-4">
                  <div className="grid size-12 place-items-center rounded-lg bg-accent/10 text-accent group-hover:bg-accent group-hover:text-surface transition-colors">
                    <Users className="size-6" aria-hidden />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-primary">Membros & Células</h3>
                    <p className="text-sm text-content-muted leading-relaxed">
                      Cadastro completo de membros, acompanhamento pastoral e gestão de pequenos grupos em rede.
                    </p>
                  </div>
                  <div className="pt-2 flex items-center gap-1 text-xs font-semibold text-accent group-hover:translate-x-1 transition-transform">
                    <span>Ver funcionalidades</span>
                    <ChevronRight className="size-3.5" />
                  </div>
                </CardBody>
              </Card>

              {/* Pillar 2: Agenda & Louvor */}
              <Card className="rounded-xl border border-border-subtle bg-surface p-6 shadow-xs hover:shadow-md transition-all hover:-translate-y-0.5 group">
                <CardBody className="p-0 space-y-4">
                  <div className="grid size-12 place-items-center rounded-lg bg-accent/10 text-accent group-hover:bg-accent group-hover:text-surface transition-colors">
                    <CalendarDays className="size-6" aria-hidden />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-primary">Agenda & Louvor</h3>
                    <p className="text-sm text-content-muted leading-relaxed">
                      Calendário de cultos e eventos, escala de músicos com disponibilidade e controle de presença.
                    </p>
                  </div>
                  <div className="pt-2 flex items-center gap-1 text-xs font-semibold text-accent group-hover:translate-x-1 transition-transform">
                    <span>Ver funcionalidades</span>
                    <ChevronRight className="size-3.5" />
                  </div>
                </CardBody>
              </Card>

              {/* Pillar 3: Patrimônio & Ativos */}
              <Card className="rounded-xl border border-border-subtle bg-surface p-6 shadow-xs hover:shadow-md transition-all hover:-translate-y-0.5 group">
                <CardBody className="p-0 space-y-4">
                  <div className="grid size-12 place-items-center rounded-lg bg-accent/10 text-accent group-hover:bg-accent group-hover:text-surface transition-colors">
                    <Boxes className="size-6" aria-hidden />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-primary">Patrimônio & Ativos</h3>
                    <p className="text-sm text-content-muted leading-relaxed">
                      Inventário com tombamento, registro de manutenções preventivas e controle de baixas.
                    </p>
                  </div>
                  <div className="pt-2 flex items-center gap-1 text-xs font-semibold text-accent group-hover:translate-x-1 transition-transform">
                    <span>Ver funcionalidades</span>
                    <ChevronRight className="size-3.5" />
                  </div>
                </CardBody>
              </Card>

              {/* Pillar 4: Segurança & Documentos */}
              <Card className="rounded-xl border border-border-subtle bg-surface p-6 shadow-xs hover:shadow-md transition-all hover:-translate-y-0.5 group">
                <CardBody className="p-0 space-y-4">
                  <div className="grid size-12 place-items-center rounded-lg bg-accent/10 text-accent group-hover:bg-accent group-hover:text-surface transition-colors">
                    <ShieldCheck className="size-6" aria-hidden />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-primary">Segurança & Documentos</h3>
                    <p className="text-sm text-content-muted leading-relaxed">
                      Isolamento estrito entre igrejas, perfis de acesso (RBAC) e repositório protegido de arquivos.
                    </p>
                  </div>
                  <div className="pt-2 flex items-center gap-1 text-xs font-semibold text-accent group-hover:translate-x-1 transition-transform">
                    <span>Ver funcionalidades</span>
                    <ChevronRight className="size-3.5" />
                  </div>
                </CardBody>
              </Card>
            </div>
          </div>
        </section>

        {/* 5. Diferenciais de Design e Usabilidade */}
        <section id="diferenciais" className="border-t border-border-subtle bg-surface py-20 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <span className="text-xs font-bold uppercase tracking-widest text-accent">Experiência Ministerial</span>
              <h2 className="text-2xl font-bold tracking-[-0.015em] sm:text-[28px] text-primary">
                Desenvolvido para fluidez e clareza no dia a dia da igreja
              </h2>
              <p className="text-content-muted leading-relaxed">
                Cada funcionalidade foi concebida com base nas necessidades reais de pastores e voluntários, unindo rigor técnico de engenharia a uma experiência acolhedora.
              </p>

              <div className="space-y-4 pt-2">
                <div className="flex gap-3">
                  <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-accent/10 text-accent">
                    <Sparkles className="size-4" />
                  </div>
                  <div>
                    <h4 className="text-base font-semibold text-primary">Design System Coeso</h4>
                    <p className="text-sm text-content-muted">Paleta em tom verde-oliva profundo e ouro queimado com tipografia Plus Jakarta Sans.</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-accent/10 text-accent">
                    <Compass className="size-4" />
                  </div>
                  <div>
                    <h4 className="text-base font-semibold text-primary">Perfis de Acesso Inteligentes</h4>
                    <p className="text-sm text-content-muted">Visibilidade adaptada por papéis: pastores, tesouraria, líderes de células e louvor.</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-accent/10 text-accent">
                    <HeartHandshake className="size-4" />
                  </div>
                  <div>
                    <h4 className="text-base font-semibold text-primary">Foco na Cuidagem Pastoral</h4>
                    <p className="text-sm text-content-muted">Histórico protegido de atendimentos, visitas e integração entre redes ministeriais.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Visual Box Card */}
            <div className="relative rounded-2xl border border-border-subtle bg-canvas p-8 shadow-sm">
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-border-subtle pb-4">
                  <div className="flex items-center gap-3">
                    <div className="size-3 rounded-full bg-accent" />
                    <span className="text-sm font-bold text-primary">Painel de Liderança</span>
                  </div>
                  <Badge tone="accent">Ao Vivo</Badge>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-lg bg-surface p-4 border border-border-subtle">
                    <span className="text-xs text-content-muted block">Membros Ativos</span>
                    <span className="text-2xl font-bold text-primary tabular-nums">1.240</span>
                  </div>
                  <div className="rounded-lg bg-surface p-4 border border-border-subtle">
                    <span className="text-xs text-content-muted block">Células em Rede</span>
                    <span className="text-2xl font-bold text-accent tabular-nums">48</span>
                  </div>
                </div>

                <div className="rounded-lg bg-surface p-4 border border-border-subtle space-y-2">
                  <div className="flex justify-between text-xs text-content-muted">
                    <span>Presença Culto de Domingo</span>
                    <span className="font-semibold text-primary tabular-nums">94%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-surface-muted overflow-hidden">
                    <div className="h-full bg-accent rounded-full w-[94%]" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 6. CTA Finale */}
        <section className="px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl rounded-2xl bg-primary text-primary-foreground p-8 sm:p-12 text-center space-y-6 shadow-xl relative overflow-hidden">
            <div className="pointer-events-none absolute -right-12 -bottom-12 size-64 rounded-full bg-accent/10 blur-2xl" />
            
            <h2 className="text-2xl font-bold sm:text-3xl tracking-tight text-surface">
              Pronto para elevar a gestão da sua igreja?
            </h2>
            <p className="text-sidebar-muted max-w-xl mx-auto text-sm sm:text-base leading-relaxed">
              Crie a conta da sua congregação em poucos minutos e comece a experimentar uma plataforma moderna, integrada e focada no crescimento do reino.
            </p>
            <div className="pt-2">
              <Button
                asChild
                size="lg"
                className="bg-accent hover:bg-accent-hover text-accent-foreground font-semibold rounded-lg px-8 py-3.5 shadow-md transition-all hover:scale-[1.03]"
              >
                <Link to="/registro" className="gap-2">
                  <span>Cadastrar Minha Igreja Agora</span>
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* 7. Rodapé Institucional */}
      <footer className="border-t border-border-subtle bg-surface px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-between gap-6 text-sm text-content-muted">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Logo className="h-7 w-auto" />
            <span className="hidden sm:inline text-border-subtle">|</span>
            <span className="text-xs">Church Management SaaS — Gestão Integrada</span>
          </div>

          <div className="flex items-center gap-6 text-xs font-medium">
            <Link to="/login" className="hover:text-primary transition-colors">Acessar Console</Link>
            <Link to="/registro" className="hover:text-primary transition-colors">Registrar Igreja</Link>
            <a href="#recursos" className="hover:text-primary transition-colors">Termos & Privacidade</a>
          </div>

          <p className="text-xs">
            © {new Date().getFullYear()} CMSaaS. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  )
}
