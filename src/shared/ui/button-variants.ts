import { cva } from 'class-variance-authority'

/** Variantes separadas do componente para não quebrar o fast refresh do Vite. */
export const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-lg text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        primary: 'bg-primary text-primary-foreground hover:bg-primary-hover',
        secondary: 'bg-surface-muted text-content hover:bg-border-subtle',
        outline: 'border border-border-subtle bg-surface text-content hover:bg-surface-muted',
        ghost: 'text-content-muted hover:bg-surface-muted hover:text-content',
        danger: 'bg-danger text-danger-foreground hover:opacity-90',
      },
      size: {
        sm: 'h-8 px-3',
        md: 'h-10 px-4',
        lg: 'h-11 px-6',
        icon: 'size-10',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
)

