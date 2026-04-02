import { create } from 'zustand'
import { db } from '../db/database'
import type {
  Place, Accommodation, Reservation, CustomList,
  PackingItem, Note, DayNote, Trip,
} from '../types'

interface Snapshot {
  description: string
  timestamp: string
  trip: Trip | null
  places: Place[]
  accommodations: Accommodation[]
  reservations: Reservation[]
  customLists: CustomList[]
  packingItems: PackingItem[]
  notes: Note[]
  dayNotes: DayNote[]
}

interface UndoState {
  undoStack: Snapshot[]
  canUndo: boolean
  lastUndoDescription: string | null

  pushSnapshot: (description: string) => Promise<void>
  undo: () => Promise<string | null>
  clearStack: () => void
}

// Helper to take a full snapshot from the current DB state
async function takeSnapshot(): Promise<Omit<Snapshot, 'description' | 'timestamp'>> {
  const trips = await db.trips.toArray()
  const trip = trips[0] || null
  const tripId = trip?.id || ''

  const [places, accommodations, reservations, customLists, packingItems, notes, dayNotes] =
    await Promise.all([
      tripId ? db.places.where('tripId').equals(tripId).toArray() : Promise.resolve([]),
      tripId ? db.accommodations.where('tripId').equals(tripId).toArray() : Promise.resolve([]),
      tripId ? db.reservations.where('tripId').equals(tripId).toArray() : Promise.resolve([]),
      tripId ? db.customLists.where('tripId').equals(tripId).toArray() : Promise.resolve([]),
      tripId ? db.packingItems.where('tripId').equals(tripId).toArray() : Promise.resolve([]),
      tripId ? db.notes.where('tripId').equals(tripId).toArray() : Promise.resolve([]),
      tripId ? db.dayNotes.where('tripId').equals(tripId).toArray() : Promise.resolve([]),
    ])

  return { trip, places, accommodations, reservations, customLists, packingItems, notes, dayNotes }
}

// Restore DB + Zustand from a snapshot
async function restoreSnapshot(snapshot: Snapshot) {
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
      if (snapshot.trip) await db.trips.add(snapshot.trip)
      if (snapshot.places.length) await db.places.bulkAdd(snapshot.places)
      if (snapshot.accommodations.length) await db.accommodations.bulkAdd(snapshot.accommodations)
      if (snapshot.reservations.length) await db.reservations.bulkAdd(snapshot.reservations)
      if (snapshot.customLists.length) await db.customLists.bulkAdd(snapshot.customLists)
      if (snapshot.packingItems.length) await db.packingItems.bulkAdd(snapshot.packingItems)
      if (snapshot.notes.length) await db.notes.bulkAdd(snapshot.notes)
      if (snapshot.dayNotes.length) await db.dayNotes.bulkAdd(snapshot.dayNotes)
    }
  )
}

const MAX_UNDO_STACK = 50

export const useUndoStore = create<UndoState>((set, get) => ({
  undoStack: [],
  canUndo: false,
  lastUndoDescription: null,

  pushSnapshot: async (description) => {
    const data = await takeSnapshot()
    const snapshot: Snapshot = {
      ...data,
      description,
      timestamp: new Date().toISOString(),
    }

    set((s) => {
      const stack = [...s.undoStack, snapshot]
      if (stack.length > MAX_UNDO_STACK) stack.shift()
      return { undoStack: stack, canUndo: true }
    })
  },

  undo: async () => {
    const { undoStack } = get()
    if (undoStack.length === 0) return null

    const snapshot = undoStack[undoStack.length - 1]
    const newStack = undoStack.slice(0, -1)

    await restoreSnapshot(snapshot)

    set({
      undoStack: newStack,
      canUndo: newStack.length > 0,
      lastUndoDescription: snapshot.description,
    })

    return snapshot.description
  },

  clearStack: () => set({ undoStack: [], canUndo: false }),
}))
