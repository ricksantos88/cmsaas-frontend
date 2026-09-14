import * as Menu from '@radix-ui/react-dropdown-menu'
import { MoreHorizontal } from 'lucide-react'
import type { ComponentProps } from 'react'
import { cn } from '@/shared/lib/cn'

export const DropdownMenu = Menu.Root
export const DropdownMenuTrigger = Menu.Trigger

export function DropdownMenuContent({ className, ...props }: ComponentProps<typeof Menu.Content>) {
  return (
    <Menu.Portal>
      <Menu.Content
        align="end"
        sideOffset={4}
        className={cn(
          'z-50 min-w-44 overflow-hidden rounded-lg border border-border-subtle bg-surface p-1 shadow-lg',
          className,
        )}
        {...props}
      />
    </Menu.Portal>
  )
}

export function DropdownMenuItem({
  className,
  destructive,
  ...props
}: ComponentProps<typeof Menu.Item> & { destructive?: boolean }) {
  return (
    <Menu.Item
      className={cn(
        'flex cursor-pointer items-center gap-2 rounded-md px-2.5 py-2 text-sm outline-none',
        'data-[highlighted]:bg-surface-muted data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        destructive ? 'text-danger' : 'text-content',
        '[&_svg]:size-4',
        className,
      )}
      {...props}
    />
  )
}

export function DropdownMenuSeparator() {
  return <Menu.Separator className="my-1 h-px bg-border-subtle" />
}

export function DropdownMenuLabel({ className, ...props }: ComponentProps<typeof Menu.Label>) {
  return (
    <Menu.Label
      className={cn('px-2.5 py-1.5 text-xs font-semibold text-content-muted', className)}
      {...props}
    />
  )
}

/** Botão "⋯" das linhas de tabela. */
export function RowActionsTrigger({ label = 'Ações' }: { label?: string }) {
  return (
    <Menu.Trigger
      aria-label={label}
      className="grid size-8 place-items-center rounded-lg text-content-muted hover:bg-surface-muted hover:text-content"
    >
      <MoreHorizontal className="size-4" aria-hidden />
    </Menu.Trigger>
  )
}
