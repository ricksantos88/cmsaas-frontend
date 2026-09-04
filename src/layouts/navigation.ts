import {
  Bell,
  Boxes,
  Building2,
  CalendarDays,
  FileText,
  Globe,
  Home,
  Music,
  Settings,
  Users,
  UsersRound,
  Video,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { Permission } from '@/features/auth/permissions'

export interface NavItem {
  to: string
  label: string
  icon: LucideIcon
  /** Ausente = visível para qualquer usuário administrativo autenticado. */
  permission?: Permission
}

export interface NavGroup {
  title: string
  items: NavItem[]
}

/** Ordem e agrupamento do menu — ver docs/guides/layout-model.md → Navegação. */
export const NAVIGATION: NavGroup[] = [
  {
    title: 'Visão geral',
    items: [{ to: '/', label: 'Painel', icon: Home }],
  },
  {
    title: 'Pessoas',
    items: [
      { to: '/membros', label: 'Membros', icon: Users },
      { to: '/celulas', label: 'Células', icon: UsersRound },
      { to: '/pastores', label: 'Pastores', icon: Building2 },
      { to: '/musicos', label: 'Músicos', icon: Music },
    ],
  },
  {
    title: 'Atividades',
    items: [
      { to: '/agenda', label: 'Agenda', icon: CalendarDays },
      { to: '/sermoes', label: 'Sermões', icon: Video },
      { to: '/documentos', label: 'Documentos', icon: FileText },
      { to: '/notificacoes', label: 'Notificações', icon: Bell },
    ],
  },
  {
    title: 'Administração',
    items: [
      { to: '/patrimonio', label: 'Patrimônio', icon: Boxes, permission: 'asset.read' },
      { to: '/igreja', label: 'Dados da igreja', icon: Settings, permission: 'church.write' },
      {
        to: '/plataforma/igrejas',
        label: 'Igrejas da plataforma',
        icon: Globe,
        permission: 'church.platform',
      },
    ],
  },
]
