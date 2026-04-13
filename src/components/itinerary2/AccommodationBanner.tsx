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
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs transition-colors cursor-pointer mt-2 first:mt-0 ${STATUS_STYLES[status]}`}
    >
      <Building2 size={11} className="flex-shrink-0" />
      <span className="font-medium truncate max-w-[180px]">{accommodation.name}</span>
      <span className="opacity-60">·</span>
      <span className="font-semibold whitespace-nowrap">{STATUS_LABELS[status]}</span>
    </button>
  )
}
