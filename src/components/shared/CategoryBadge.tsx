import {
  UtensilsCrossed, Landmark, ShoppingBag, Ticket, Wine,
  Trees, Palette, MapPin, Train, Star, Clock
} from 'lucide-react'
import type { PlaceCategory, PlacePriority, ReservationCategory } from '../../types'
import { CATEGORY_CONFIG, RESERVATION_CATEGORY_CONFIG, PRIORITY_CONFIG } from '../../utils/categories'

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  UtensilsCrossed, Landmark, ShoppingBag, Ticket, Wine,
  Trees, Palette, MapPin, Train, Star, Clock,
}

interface CategoryBadgeProps {
  category: PlaceCategory | ReservationCategory
  type?: 'place' | 'reservation'
  size?: 'sm' | 'md'
}

export function CategoryBadge({ category, type = 'place', size = 'sm' }: CategoryBadgeProps) {
  const config = type === 'reservation'
    ? RESERVATION_CATEGORY_CONFIG[category as ReservationCategory]
    : CATEGORY_CONFIG[category as PlaceCategory]
  if (!config) return null

  const IconComponent = CATEGORY_ICONS[config.icon]
  const iconSize = size === 'sm' ? 12 : 14
  const padding = size === 'sm' ? 'px-2 py-0.5' : 'px-2.5 py-1'

  return (
    <span
      className={`inline-flex items-center gap-1 ${padding} rounded-[6px] text-xs font-medium`}
      style={{
        backgroundColor: `color-mix(in srgb, ${config.color} 12%, transparent)`,
        color: config.color,
      }}
    >
      {IconComponent && <IconComponent size={iconSize} />}
      {config.label}
    </span>
  )
}

interface PriorityBadgeProps {
  priority: PlacePriority
}

export function PriorityBadge({ priority }: PriorityBadgeProps) {
  const config = PRIORITY_CONFIG[priority]
  if (priority === 'want-to') return null

  const isMustSee = priority === 'must-see'

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-[6px] text-xs font-medium ${
        isMustSee ? 'bg-primary-light text-primary-hover' : 'bg-surface-high text-text-muted'
      }`}
    >
      {isMustSee ? <Star size={12} fill="currentColor" /> : <Clock size={12} />}
      {config.label}
    </span>
  )
}
