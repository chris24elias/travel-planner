import { Building2 } from 'lucide-react'
import { useUIStore } from '../../stores/uiStore'
import type { Accommodation } from '../../types'

interface AccommodationBannerProps {
  accommodation: Accommodation
  status: 'check-in' | 'check-out' | 'staying'
}

const STATUS_STYLES = {
  'check-in': 'bg-green-50 text-green-700',
  'check-out': 'bg-amber-50 text-amber-700',
  staying: 'bg-surface-high text-text-muted',
} as const

const STATUS_LABELS = {
  'check-in': 'Check-in',
  'check-out': 'Check-out',
  staying: 'Staying',
} as const

export function AccommodationBanner({ accommodation, status }: AccommodationBannerProps) {
  const openModal = useUIStore((s) => s.openModal)

  return (
    <button
      onClick={() => openModal('accommodation', accommodation.id)}
      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-[8px] bg-surface-high/60 hover:bg-surface-high transition-colors cursor-pointer mt-2 first:mt-0"
    >
      <Building2 size={14} className="text-text-muted flex-shrink-0" />
      <span className="text-sm text-text-body truncate flex-1 text-left">{accommodation.name}</span>
      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${STATUS_STYLES[status]}`}>
        {STATUS_LABELS[status]}
      </span>
    </button>
  )
}
