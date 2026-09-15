import type { ComponentProps } from 'react'

interface LogoProps extends ComponentProps<'svg'> {
  variant?: 'light' | 'dark'
}

/**
 * Logotipo oficial do CMSaaS.
 * Ícone de arquitetura sacra integrada a métricas/crescimento + tipografia com peso dual.
 */
export function Logo({ className = 'h-9 w-auto', variant = 'light', ...props }: LogoProps) {
  const primaryColor = variant === 'dark' ? '#FAF8F5' : '#17231E'
  const accentColor = '#C59B27'

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 280 60"
      fill="none"
      className={className}
      aria-label="CMSaaS — Gestão completa para sua igreja"
      {...props}
    >
      <g transform="translate(10, 8)">
        <path
          d="M4 36V18L22 4L40 18V36"
          stroke={primaryColor}
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M14 36V22L22 15L30 22V36"
          stroke={accentColor}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M22 36V27"
          stroke={primaryColor}
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d="M34 10L44 2M44 2H35M44 2V11"
          stroke={accentColor}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <text
        x="68"
        y="38"
        fontFamily="'Plus Jakarta Sans', sans-serif"
        fontSize="28"
        fontWeight="800"
        fill={primaryColor}
        letterSpacing="-0.5"
      >
        CM
        <tspan fontWeight="500" fill={accentColor}>
          SaaS
        </tspan>
      </text>
    </svg>
  )
}
