import type { ReactNode } from 'react'

interface SectionHeaderProps {
  title: string
  action?: ReactNode
  subtitle?: string
}

export function SectionHeader({ title, action, subtitle }: SectionHeaderProps) {
  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-6 md:mb-8">
      <div>
        <h1 className="text-xl md:text-2xl font-bold font-heading tracking-tight">{title}</h1>
        {subtitle && <p className="text-sm text-text-muted mt-1">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}
