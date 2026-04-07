import Dexie, { type Table } from 'dexie'
import type {
  Trip,
  Place,
  Accommodation,
  Reservation,
  CustomList,
  PackingItem,
  Note,
  DayNote,
  InlineNote,
  HistoryEntry,
} from '../types'

class TravelPlannerDB extends Dexie {
  trips!: Table<Trip>
  places!: Table<Place>
  accommodations!: Table<Accommodation>
  reservations!: Table<Reservation>
  customLists!: Table<CustomList>
  packingItems!: Table<PackingItem>
  notes!: Table<Note>
  dayNotes!: Table<DayNote>
  inlineNotes!: Table<InlineNote>
  historyEntries!: Table<HistoryEntry>

  constructor() {
    super('TabiDB')

    this.version(1).stores({
      trips: 'id',
      places: 'id, tripId, [tripId+dayIndex], [tripId+category], *listIds',
      accommodations: 'id, tripId',
      reservations: 'id, tripId, [tripId+category]',
      customLists: 'id, tripId',
      packingItems: 'id, tripId, [tripId+category]',
      notes: 'id, tripId',
      dayNotes: 'id, tripId, [tripId+dayIndex]',
      historyEntries: 'id, timestamp',
    })

    this.version(2).stores({
      trips: 'id',
      places: 'id, tripId, [tripId+dayIndex], [tripId+category], *listIds',
      accommodations: 'id, tripId',
      reservations: 'id, tripId, [tripId+category]',
      customLists: 'id, tripId',
      packingItems: 'id, tripId, [tripId+category]',
      notes: 'id, tripId',
      dayNotes: 'id, tripId, [tripId+dayIndex]',
      inlineNotes: 'id, tripId, [tripId+dayIndex]',
      historyEntries: 'id, timestamp',
    })
  }
}

export const db = new TravelPlannerDB()
