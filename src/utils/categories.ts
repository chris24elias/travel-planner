import type { PlaceCategory, PlacePriority, ReservationCategory } from '../types'

export const CATEGORY_CONFIG: Record<PlaceCategory, { label: string; color: string; icon: string }> = {
  food: { label: 'Food', color: 'var(--color-cat-food)', icon: 'UtensilsCrossed' },
  temple: { label: 'Temple', color: 'var(--color-cat-temple)', icon: 'Landmark' },
  shopping: { label: 'Shopping', color: 'var(--color-cat-shopping)', icon: 'ShoppingBag' },
  activity: { label: 'Activity', color: 'var(--color-cat-activity)', icon: 'Ticket' },
  nightlife: { label: 'Nightlife', color: 'var(--color-cat-nightlife)', icon: 'Wine' },
  nature: { label: 'Nature', color: 'var(--color-cat-nature)', icon: 'Trees' },
  culture: { label: 'Culture', color: 'var(--color-cat-culture)', icon: 'Palette' },
  other: { label: 'Other', color: 'var(--color-cat-other)', icon: 'MapPin' },
}

export const RESERVATION_CATEGORY_CONFIG: Record<ReservationCategory, { label: string; color: string; icon: string }> = {
  dining: { label: 'Dining', color: 'var(--color-res-dining)', icon: 'UtensilsCrossed' },
  transport: { label: 'Transport', color: 'var(--color-res-transport)', icon: 'Train' },
  activity: { label: 'Activity', color: 'var(--color-res-activity)', icon: 'Ticket' },
}

export const PRIORITY_CONFIG: Record<PlacePriority, { label: string; icon: string }> = {
  'must-see': { label: 'Must See', icon: 'Star' },
  'want-to': { label: 'Want To', icon: '' },
  'if-time': { label: 'If Time', icon: 'Clock' },
}

export const PLACE_CATEGORIES: PlaceCategory[] = ['food', 'temple', 'shopping', 'activity', 'nightlife', 'nature', 'culture', 'other']
export const RESERVATION_CATEGORIES: ReservationCategory[] = ['dining', 'transport', 'activity']
export const PRIORITIES: PlacePriority[] = ['must-see', 'want-to', 'if-time']

export const DEFAULT_PACKING_CATEGORIES = ['Clothes', 'Electronics', 'Documents', 'Toiletries', 'Other']
