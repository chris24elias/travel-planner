import { create } from 'zustand'
import { db } from '../db/database'
import { generateId, now } from '../utils/ids'
import { useUndoStore } from './undoStore'
import type {
  Trip,
  Place,
  Accommodation,
  Reservation,
  CustomList,
  PackingItem,
  Note,
  DayNote,
  HistoryEntry,
  TripDocument,
} from '../types'

const APP_VERSION = '0.1.0'

const ACTIVE_TRIP_KEY = 'tabi_active_trip_id'

async function loadTripData(tripId: string) {
  const [trip, places, accommodations, reservations, customLists, packingItems, notes, dayNotes, historyEntries] =
    await Promise.all([
      db.trips.get(tripId),
      db.places.where('tripId').equals(tripId).toArray(),
      db.accommodations.where('tripId').equals(tripId).toArray(),
      db.reservations.where('tripId').equals(tripId).toArray(),
      db.customLists.where('tripId').equals(tripId).toArray(),
      db.packingItems.where('tripId').equals(tripId).toArray(),
      db.notes.where('tripId').equals(tripId).toArray(),
      db.dayNotes.where('tripId').equals(tripId).toArray(),
      db.historyEntries.toArray(),
    ])
  return {
    trip: trip ?? null, places, accommodations, reservations,
    customLists, packingItems, notes, dayNotes, historyEntries,
  }
}

interface TripState {
  trip: Trip | null
  places: Place[]
  accommodations: Accommodation[]
  reservations: Reservation[]
  customLists: CustomList[]
  packingItems: PackingItem[]
  notes: Note[]
  dayNotes: DayNote[]
  historyEntries: HistoryEntry[]
  isLoaded: boolean
  allTrips: Trip[]
  tripStats: Record<string, { placeCount: number; reservationCount: number }>
  activeTripId: string | null

  // Initialization
  loadTrip: () => Promise<void>
  loadAllTrips: () => Promise<void>
  selectTrip: (id: string) => Promise<void>
  clearActiveTrip: () => void
  hasTrip: () => boolean

  // Trip CRUD
  createTrip: (data: Pick<Trip, 'name' | 'destination' | 'startDate' | 'endDate'>) => Promise<Trip>
  updateTrip: (data: Partial<Trip>) => Promise<void>
  updateTripById: (id: string, data: Partial<Pick<Trip, 'name' | 'destination' | 'startDate' | 'endDate'>>) => Promise<void>

  // Place CRUD
  addPlace: (data: Omit<Place, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Place>
  updatePlace: (id: string, data: Partial<Place>) => Promise<void>
  deletePlace: (id: string) => Promise<void>

  // Accommodation CRUD
  addAccommodation: (data: Omit<Accommodation, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Accommodation>
  updateAccommodation: (id: string, data: Partial<Accommodation>) => Promise<void>
  deleteAccommodation: (id: string) => Promise<void>

  // Reservation CRUD
  addReservation: (data: Omit<Reservation, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Reservation>
  updateReservation: (id: string, data: Partial<Reservation>) => Promise<void>
  deleteReservation: (id: string) => Promise<void>

  // CustomList CRUD
  addList: (data: Pick<CustomList, 'tripId' | 'name' | 'color' | 'icon'>) => Promise<CustomList>
  updateList: (id: string, data: Partial<CustomList>) => Promise<void>
  deleteList: (id: string) => Promise<void>
  reorderLists: (orderedIds: string[]) => Promise<void>

  // PackingItem CRUD
  addPackingItem: (data: Pick<PackingItem, 'tripId' | 'name' | 'category'>) => Promise<PackingItem>
  updatePackingItem: (id: string, data: Partial<PackingItem>) => Promise<void>
  deletePackingItem: (id: string) => Promise<void>
  togglePacked: (id: string) => Promise<void>

  // Note CRUD
  addNote: (data: Pick<Note, 'tripId' | 'title' | 'content'>) => Promise<Note>
  updateNote: (id: string, data: Partial<Note>) => Promise<void>
  deleteNote: (id: string) => Promise<void>

  // DayNote CRUD
  setDayNote: (tripId: string, dayIndex: number, content: string) => Promise<void>

  // History
  addHistoryEntry: (description: string) => Promise<void>
  clearHistory: () => Promise<void>

  // JSON Export/Import
  exportTrip: () => TripDocument | null
  importTrip: (doc: TripDocument) => Promise<void>
}

export const useTripStore = create<TripState>((set, get) => ({
  trip: null,
  places: [],
  accommodations: [],
  reservations: [],
  customLists: [],
  packingItems: [],
  notes: [],
  dayNotes: [],
  historyEntries: [],
  isLoaded: false,
  allTrips: [],
  tripStats: {},
  activeTripId: null,

  loadAllTrips: async () => {
    const trips = await db.trips.toArray()
    // Load place + reservation counts for each trip in parallel
    const statsEntries = await Promise.all(
      trips.map(async (t) => {
        const [placeCount, reservationCount] = await Promise.all([
          db.places.where('tripId').equals(t.id).count(),
          db.reservations.where('tripId').equals(t.id).count(),
        ])
        return [t.id, { placeCount, reservationCount }] as const
      })
    )
    const tripStats = Object.fromEntries(statsEntries)

    // Restore active trip from localStorage
    const storedId = localStorage.getItem(ACTIVE_TRIP_KEY)
    const storedTrip = storedId ? trips.find((t) => t.id === storedId) : null

    if (storedTrip) {
      const data = await loadTripData(storedTrip.id)
      set({ allTrips: trips, tripStats, activeTripId: storedTrip.id, isLoaded: true, ...data })
    } else {
      set({ allTrips: trips, tripStats, activeTripId: null, isLoaded: true })
    }
  },

  loadTrip: async () => {
    await get().loadAllTrips()
  },

  selectTrip: async (id) => {
    localStorage.setItem(ACTIVE_TRIP_KEY, id)
    const data = await loadTripData(id)
    if (!data.trip) return
    set({ activeTripId: id, ...data })
  },

  clearActiveTrip: () => {
    localStorage.removeItem(ACTIVE_TRIP_KEY)
    set({
      activeTripId: null,
      trip: null,
      places: [],
      accommodations: [],
      reservations: [],
      customLists: [],
      packingItems: [],
      notes: [],
      dayNotes: [],
      historyEntries: [],
    })
  },

  hasTrip: () => get().trip !== null,

  // Trip
  createTrip: async (data) => {
    const trip: Trip = { ...data, id: generateId(), createdAt: now(), updatedAt: now() }
    await db.trips.add(trip)
    localStorage.setItem(ACTIVE_TRIP_KEY, trip.id)
    set((s) => ({
      trip,
      activeTripId: trip.id,
      allTrips: [...s.allTrips, trip],
      tripStats: { ...s.tripStats, [trip.id]: { placeCount: 0, reservationCount: 0 } },
    }))
    await get().addHistoryEntry(`Created trip "${trip.name}"`)
    return trip
  },

  updateTrip: async (data) => {
    const trip = get().trip
    if (!trip) return
    const updated = { ...trip, ...data, updatedAt: now() }
    await db.trips.put(updated)
    set({ trip: updated })
    await get().addHistoryEntry(`Updated trip details`)
  },

  updateTripById: async (id, data) => {
    const existing = await db.trips.get(id)
    if (!existing) return
    const updated: Trip = { ...existing, ...data, updatedAt: now() }
    await db.trips.put(updated)
    set((s) => ({
      allTrips: s.allTrips.map((t) => (t.id === id ? updated : t)),
      // Also update active trip state if this is the currently loaded trip
      trip: s.activeTripId === id ? updated : s.trip,
    }))
  },

  // Places
  addPlace: async (data) => {
    await useUndoStore.getState().pushSnapshot(`Add "${data.name}"`)
    const place: Place = { ...data, id: generateId(), createdAt: now(), updatedAt: now() }
    await db.places.add(place)
    set((s) => ({ places: [...s.places, place] }))
    await get().addHistoryEntry(`Added "${place.name}"`)
    return place
  },

  updatePlace: async (id, data) => {
    const place = get().places.find((p) => p.id === id)
    if (!place) return
    await useUndoStore.getState().pushSnapshot(`Update "${place.name}"`)

    const updated = { ...place, ...data, updatedAt: now() }
    await db.places.put(updated)
    set((s) => ({ places: s.places.map((p) => (p.id === id ? updated : p)) }))
    await get().addHistoryEntry(`Updated "${updated.name}"`)
  },

  deletePlace: async (id) => {
    const place = get().places.find((p) => p.id === id)
    await useUndoStore.getState().pushSnapshot(`Remove "${place?.name}"`)
    await db.places.delete(id)
    set((s) => ({ places: s.places.filter((p) => p.id !== id) }))
    if (place) await get().addHistoryEntry(`Removed "${place.name}"`)
  },

  // Accommodations
  addAccommodation: async (data) => {
    await useUndoStore.getState().pushSnapshot(`Add "${data.name}"`)
    const acc: Accommodation = { ...data, id: generateId(), createdAt: now(), updatedAt: now() }
    await db.accommodations.add(acc)
    set((s) => ({ accommodations: [...s.accommodations, acc] }))
    await get().addHistoryEntry(`Added accommodation "${acc.name}"`)
    return acc
  },

  updateAccommodation: async (id, data) => {
    const acc = get().accommodations.find((a) => a.id === id)
    if (!acc) return
    await useUndoStore.getState().pushSnapshot(`Update "${acc.name}"`)

    const updated = { ...acc, ...data, updatedAt: now() }
    await db.accommodations.put(updated)
    set((s) => ({ accommodations: s.accommodations.map((a) => (a.id === id ? updated : a)) }))
    await get().addHistoryEntry(`Updated accommodation "${updated.name}"`)
  },

  deleteAccommodation: async (id) => {
    const acc = get().accommodations.find((a) => a.id === id)
    await useUndoStore.getState().pushSnapshot(`Remove "${acc?.name}"`)
    await db.accommodations.delete(id)
    set((s) => ({ accommodations: s.accommodations.filter((a) => a.id !== id) }))
    if (acc) await get().addHistoryEntry(`Removed accommodation "${acc.name}"`)
  },

  // Reservations
  addReservation: async (data) => {
    await useUndoStore.getState().pushSnapshot(`Add "${data.name}"`)
    const res: Reservation = { ...data, id: generateId(), createdAt: now(), updatedAt: now() }
    await db.reservations.add(res)
    set((s) => ({ reservations: [...s.reservations, res] }))
    await get().addHistoryEntry(`Added reservation "${res.name}"`)
    return res
  },

  updateReservation: async (id, data) => {
    const res = get().reservations.find((r) => r.id === id)
    if (!res) return
    const updated = { ...res, ...data, updatedAt: now() }
    await db.reservations.put(updated)
    set((s) => ({ reservations: s.reservations.map((r) => (r.id === id ? updated : r)) }))
    await get().addHistoryEntry(`Updated reservation "${updated.name}"`)
  },

  deleteReservation: async (id) => {
    const res = get().reservations.find((r) => r.id === id)
    await useUndoStore.getState().pushSnapshot(`Remove "${res?.name}"`)
    await db.reservations.delete(id)
    set((s) => ({ reservations: s.reservations.filter((r) => r.id !== id) }))
    if (res) await get().addHistoryEntry(`Removed reservation "${res.name}"`)
  },

  // Custom Lists
  addList: async (data) => {
    const lists = get().customLists
    const list: CustomList = {
      ...data,
      id: generateId(),
      orderIndex: lists.length,
      createdAt: now(),
      updatedAt: now(),
    }
    await db.customLists.add(list)
    set((s) => ({ customLists: [...s.customLists, list] }))
    await get().addHistoryEntry(`Created list "${list.name}"`)
    return list
  },

  updateList: async (id, data) => {
    const list = get().customLists.find((l) => l.id === id)
    if (!list) return
    const updated = { ...list, ...data, updatedAt: now() }
    await db.customLists.put(updated)
    set((s) => ({ customLists: s.customLists.map((l) => (l.id === id ? updated : l)) }))
    await get().addHistoryEntry(`Updated list "${updated.name}"`)
  },

  reorderLists: async (orderedIds) => {
    const lists = get().customLists
    const updated = orderedIds.map((id, index) => {
      const list = lists.find((l) => l.id === id)!
      return { ...list, orderIndex: index, updatedAt: now() }
    })
    await Promise.all(updated.map((l) => db.customLists.put(l)))
    set({ customLists: updated })
  },

  deleteList: async (id) => {
    const list = get().customLists.find((l) => l.id === id)
    await useUndoStore.getState().pushSnapshot(`Delete list "${list?.name}"`)
    await db.customLists.delete(id)
    set((s) => ({ customLists: s.customLists.filter((l) => l.id !== id) }))
    // Remove list references from places
    const places = get().places.filter((p) => p.listIds.includes(id))
    for (const place of places) {
      const updated = { ...place, listIds: place.listIds.filter((lid) => lid !== id), updatedAt: now() }
      await db.places.put(updated)
      set((s) => ({ places: s.places.map((p) => (p.id === updated.id ? updated : p)) }))
    }
    if (list) await get().addHistoryEntry(`Deleted list "${list.name}"`)
  },

  // Packing Items
  addPackingItem: async (data) => {
    const items = get().packingItems.filter((i) => i.category === data.category)
    const item: PackingItem = {
      ...data,
      id: generateId(),
      packed: false,
      orderIndex: items.length,
      createdAt: now(),
      updatedAt: now(),
    }
    await db.packingItems.add(item)
    set((s) => ({ packingItems: [...s.packingItems, item] }))
    await get().addHistoryEntry(`Added "${item.name}" to packing list`)
    return item
  },

  updatePackingItem: async (id, data) => {
    const item = get().packingItems.find((i) => i.id === id)
    if (!item) return
    const updated = { ...item, ...data, updatedAt: now() }
    await db.packingItems.put(updated)
    set((s) => ({ packingItems: s.packingItems.map((i) => (i.id === id ? updated : i)) }))
  },

  deletePackingItem: async (id) => {
    const item = get().packingItems.find((i) => i.id === id)
    await useUndoStore.getState().pushSnapshot(`Remove "${item?.name}"`)
    await db.packingItems.delete(id)
    set((s) => ({ packingItems: s.packingItems.filter((i) => i.id !== id) }))
    if (item) await get().addHistoryEntry(`Removed "${item.name}" from packing list`)
  },

  togglePacked: async (id) => {
    const item = get().packingItems.find((i) => i.id === id)
    if (!item) return
    const updated = { ...item, packed: !item.packed, updatedAt: now() }
    await db.packingItems.put(updated)
    set((s) => ({ packingItems: s.packingItems.map((i) => (i.id === id ? updated : i)) }))
    await get().addHistoryEntry(updated.packed ? `Packed "${item.name}"` : `Unpacked "${item.name}"`)
  },

  // Notes
  addNote: async (data) => {
    const notesArr = get().notes
    const note: Note = {
      ...data,
      id: generateId(),
      orderIndex: notesArr.length,
      createdAt: now(),
      updatedAt: now(),
    }
    await db.notes.add(note)
    set((s) => ({ notes: [...s.notes, note] }))
    await get().addHistoryEntry(`Created note "${note.title}"`)
    return note
  },

  updateNote: async (id, data) => {
    const note = get().notes.find((n) => n.id === id)
    if (!note) return
    const updated = { ...note, ...data, updatedAt: now() }
    await db.notes.put(updated)
    set((s) => ({ notes: s.notes.map((n) => (n.id === id ? updated : n)) }))
    await get().addHistoryEntry(`Updated note "${updated.title}"`)
  },

  deleteNote: async (id) => {
    const note = get().notes.find((n) => n.id === id)
    await useUndoStore.getState().pushSnapshot(`Delete note "${note?.title}"`)
    await db.notes.delete(id)
    set((s) => ({ notes: s.notes.filter((n) => n.id !== id) }))
    if (note) await get().addHistoryEntry(`Deleted note "${note.title}"`)
  },

  // Day Notes
  setDayNote: async (tripId, dayIndex, content) => {
    const existing = get().dayNotes.find((dn) => dn.tripId === tripId && dn.dayIndex === dayIndex)
    if (existing) {
      const updated = { ...existing, content, updatedAt: now() }
      await db.dayNotes.put(updated)
      set((s) => ({ dayNotes: s.dayNotes.map((dn) => (dn.id === existing.id ? updated : dn)) }))
    } else {
      const dayNote: DayNote = { id: generateId(), tripId, dayIndex, content, updatedAt: now() }
      await db.dayNotes.add(dayNote)
      set((s) => ({ dayNotes: [...s.dayNotes, dayNote] }))
    }
    await get().addHistoryEntry(`Updated Day ${dayIndex + 1} note`)
  },

  // History
  addHistoryEntry: async (description) => {
    const entry: HistoryEntry = { id: generateId(), timestamp: now(), description }
    await db.historyEntries.add(entry)
    set((s) => {
      const entries = [...s.historyEntries, entry]
      // Keep last 500
      if (entries.length > 500) entries.splice(0, entries.length - 500)
      return { historyEntries: entries }
    })
  },

  clearHistory: async () => {
    await db.historyEntries.clear()
    set({ historyEntries: [] })
  },

  // JSON Export
  exportTrip: () => {
    const { trip, places, accommodations, reservations, customLists, packingItems, notes, dayNotes } = get()
    if (!trip) return null
    return {
      version: '1.0.0',
      exportedAt: now(),
      appVersion: APP_VERSION,
      trip,
      places,
      accommodations,
      reservations,
      customLists,
      packingItems,
      notes,
      dayNotes,
    }
  },

  // JSON Import
  importTrip: async (doc) => {
    await db.transaction(
      'rw',
      db.trips, db.places, db.accommodations, db.reservations,
      db.customLists, db.packingItems, db.notes, db.dayNotes,
      async () => {
        await Promise.all([
          db.trips.clear(), db.places.clear(), db.accommodations.clear(),
          db.reservations.clear(), db.customLists.clear(), db.packingItems.clear(),
          db.notes.clear(), db.dayNotes.clear(),
        ])
        await db.trips.add(doc.trip)
        if (doc.places.length) await db.places.bulkAdd(doc.places)
        if (doc.accommodations.length) await db.accommodations.bulkAdd(doc.accommodations)
        if (doc.reservations.length) await db.reservations.bulkAdd(doc.reservations)
        if (doc.customLists.length) await db.customLists.bulkAdd(doc.customLists)
        if (doc.packingItems.length) await db.packingItems.bulkAdd(doc.packingItems)
        if (doc.notes.length) await db.notes.bulkAdd(doc.notes)
        if (doc.dayNotes.length) await db.dayNotes.bulkAdd(doc.dayNotes)
      }
    )
    set({
      trip: doc.trip,
      places: doc.places,
      accommodations: doc.accommodations,
      reservations: doc.reservations,
      customLists: doc.customLists,
      packingItems: doc.packingItems,
      notes: doc.notes,
      dayNotes: doc.dayNotes,
    })
    localStorage.setItem(ACTIVE_TRIP_KEY, doc.trip.id)
    set((s) => ({
      activeTripId: doc.trip.id,
      allTrips: [...s.allTrips.filter((t) => t.id !== doc.trip.id), doc.trip],
      tripStats: {
        ...s.tripStats,
        [doc.trip.id]: { placeCount: doc.places.length, reservationCount: doc.reservations.length },
      },
    }))
    await get().addHistoryEntry('Imported trip from JSON')
  },
}))
