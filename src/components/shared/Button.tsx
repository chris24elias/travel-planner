import type { ButtonHTMLAttributes, ReactNode } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  children: ReactNode
  icon?: ReactNode
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-gradient-to-br from-primary to-amber-400 text-white font-semibold hover:from-primary-hover hover:to-amber-500 active:scale-[0.98]',
  secondary:
    'bg-surface-high text-text-body font-medium hover:bg-surface-highest',
  ghost:
    'bg-transparent text-text-body font-medium hover:bg-surface-high',
  danger:
    'bg-transparent text-error font-medium hover:bg-red-50',
}

export function Button({ variant = 'primary', children, icon, className = '', ...props }: ButtonProps) {
  return (
    <button
      className={`
        inline-flex items-center justify-center gap-2 px-4 py-2.5
        rounded-[8px] text-sm transition-all cursor-pointer
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variantStyles[variant]}
        ${className}
      `}
      {...props}
    >
      {icon}
      {children}
    </button>
  )
}
