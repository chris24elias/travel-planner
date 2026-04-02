export type PlaceCategory =
  | 'food'
  | 'temple'
  | 'shopping'
  | 'activity'
  | 'nightlife'
  | 'nature'
  | 'culture'
  | 'other'

export type PlacePriority = 'must-see' | 'want-to' | 'if-time'

export type ReservationCategory = 'dining' | 'transport' | 'activity'

export type AppSection =
  | 'overview'
  | 'itinerary'
  | 'kanban'
  | 'accommodations'
  | 'reservations'
  | 'places'
  | 'map'
  | 'packing'
  | 'notes'
  | 'history'

export interface Trip {
  id: string
  name: string
  destination: string
  startDate: string
  endDate: string
  createdAt: string
  updatedAt: string
}

export interface Place {
  id: string
  tripId: string
  name: string
  category: PlaceCategory
  notes: string
  address?: string
  area?: string
  lat?: number
  lng?: number
  links: string[]
  priority: PlacePriority
  dayIndex?: number | null
  orderInDay?: number
  timeSlot?: string
  listIds: string[]
  // Google Places data
  googlePlaceId?: string
  photoName?: string   // resource name: "places/{id}/photos/{ref}"
  rating?: number
  websiteUri?: string
  createdAt: string
  updatedAt: string
}

export interface Accommodation {
  id: string
  tripId: string
  name: string
  checkIn: string
  checkOut: string
  address?: string
  lat?: number
  lng?: number
  confirmationNumber?: string
  notes: string
  link?: string
  createdAt: string
  updatedAt: string
}

export interface Reservation {
  id: string
  tripId: string
  name: string
  category: ReservationCategory
  dateTime: string
  confirmationNumber?: string
  notes: string
  link?: string
  createdAt: string
  updatedAt: string
}

export interface CustomList {
  id: string
  tripId: string
  name: string
  icon?: string
  color?: string
  orderIndex: number
  createdAt: string
  updatedAt: string
}

export interface PackingItem {
  id: string
  tripId: string
  name: string
  category: string
  packed: boolean
  orderIndex: number
  createdAt: string
  updatedAt: string
}

export interface Note {
  id: string
  tripId: string
  title: string
  content: string
  orderIndex: number
  createdAt: string
  updatedAt: string
}

export interface DayNote {
  id: string
  tripId: string
  dayIndex: number
  content: string
  updatedAt: string
}

export interface TripDocument {
  version: string
  exportedAt: string
  appVersion: string
  trip: Trip
  places: Place[]
  accommodations: Accommodation[]
  reservations: Reservation[]
  customLists: CustomList[]
  packingItems: PackingItem[]
  notes: Note[]
  dayNotes: DayNote[]
}

export interface HistoryEntry {
  id: string
  timestamp: string
  description: string
}
