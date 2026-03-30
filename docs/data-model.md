# Data Model

## Architecture: JSON as Single Source of Truth

The entire trip plan is represented as a single, well-structured JSON document. This is a core architectural decision, not just a feature:

1. **The Zustand store IS the JSON** — the in-memory state is the canonical representation of the trip
2. **Dexie (IndexedDB) persists the JSON** — the database is just a durability layer
3. **Export = serialize the store** — exporting produces a complete, portable JSON file
4. **Import = hydrate the store** — importing replaces the entire state from a JSON file
5. **AI can read/modify the JSON** — hand it to any AI, get back modified JSON, import it

This means the data model is both the application state AND the file format.

---

## Complete JSON Schema

The exported JSON file has this top-level structure:

```typescript
interface TripDocument {
  // Metadata
  version: string                    // Schema version for forward compatibility (e.g., "1.0.0")
  exportedAt: string                 // ISO timestamp of export
  appVersion: string                 // App version that created this export

  // The trip
  trip: Trip

  // All entities
  places: Place[]
  accommodations: Accommodation[]
  reservations: Reservation[]
  customLists: CustomList[]
  packingItems: PackingItem[]
  notes: Note[]
  dayNotes: DayNote[]
}
```

---

## Entity Definitions

### Trip

The root container. One trip per app instance (in MVP).

```typescript
interface Trip {
  id: string                         // nanoid, e.g., "V1StGXR8_Z5jdHi6B-myT"
  name: string                       // "Japan 2026"
  destination: string                // "Japan"
  startDate: string                  // ISO date: "2026-04-12"
  endDate: string                    // ISO date: "2026-04-22"
  coverImage?: string                // URL or base64 (future)
  createdAt: string                  // ISO timestamp
  updatedAt: string                  // ISO timestamp
}
```

**Computed properties** (not stored, derived):
- `duration`: `differenceInDays(endDate, startDate) + 1` (inclusive)
- `daysUntil`: `differenceInDays(startDate, today)`
- `dayDates`: Array of dates from startDate to endDate

---

### Place

A location the user wants to visit or has visited. The most complex entity — it connects to lists, days, and the map.

```typescript
interface Place {
  id: string                         // nanoid
  tripId: string                     // FK to Trip.id
  name: string                       // "Ichiran Ramen"
  category: PlaceCategory            // enum, see below
  notes: string                      // Free text, multi-line
  address?: string                   // "1-22-7 Jinnan, Shibuya-ku, Tokyo"
  area?: string                      // "Shibuya" (neighborhood/district)
  lat?: number                       // 35.6612
  lng?: number                       // 139.7004
  links: string[]                    // ["https://ichiran.com", "https://..."]
  priority: PlacePriority            // enum, see below
  dayIndex?: number | null           // 0-based day index, null = unassigned
  orderInDay?: number                // Sort order within assigned day (0, 1, 2...)
  timeSlot?: string                  // "9:00 AM" — optional display time
  listIds: string[]                  // FK array to CustomList.id
  createdAt: string                  // ISO timestamp
  updatedAt: string                  // ISO timestamp
}

type PlaceCategory =
  | 'food'
  | 'temple'
  | 'shopping'
  | 'activity'
  | 'nightlife'
  | 'nature'
  | 'culture'
  | 'other'

type PlacePriority =
  | 'must-see'
  | 'want-to'
  | 'if-time'
```

**Relationships:**
- `tripId` → belongs to one Trip
- `listIds[]` → belongs to zero or more CustomLists (many-to-many)
- `dayIndex` → assigned to one day of the trip (or null/unassigned)

**Indexes** (Dexie):
- `[tripId]` — find all places for a trip
- `[tripId+dayIndex]` — find all places for a specific day
- `[tripId+category]` — filter by category

---

### Accommodation

A place where the user is staying.

```typescript
interface Accommodation {
  id: string                         // nanoid
  tripId: string                     // FK to Trip.id
  name: string                       // "Hotel Gracery Shinjuku"
  checkIn: string                    // ISO date: "2026-04-12"
  checkOut: string                   // ISO date: "2026-04-14"
  address?: string                   // "1-17-1 Kabukicho, Shinjuku-ku, Tokyo"
  confirmationNumber?: string        // "HG-28419"
  notes: string                      // "Right next to Godzilla head"
  link?: string                      // "https://booking.com/..."
  lat?: number                       // For potential future map integration
  lng?: number
  createdAt: string
  updatedAt: string
}
```

**Computed properties:**
- `nights`: `differenceInDays(checkOut, checkIn)`

**Indexes:**
- `[tripId]` — find all accommodations for a trip
- Sort by `checkIn` date for display

---

### Reservation

A confirmed booking — restaurant, train, museum, event.

```typescript
interface Reservation {
  id: string                         // nanoid
  tripId: string                     // FK to Trip.id
  name: string                       // "Sushi Dai"
  category: ReservationCategory      // enum, see below
  dateTime: string                   // ISO datetime: "2026-04-12T19:00:00"
  confirmationNumber?: string        // "#SD-2841"
  notes: string                      // "Ask for the omakase set"
  link?: string                      // booking URL
  createdAt: string
  updatedAt: string
}

type ReservationCategory =
  | 'dining'
  | 'transport'
  | 'activity'
```

**Indexes:**
- `[tripId]` — find all reservations for a trip
- `[tripId+category]` — filter by category
- Sort by `dateTime` for display

---

### CustomList

A user-created collection of places.

```typescript
interface CustomList {
  id: string                         // nanoid
  tripId: string                     // FK to Trip.id
  name: string                       // "Ramen Spots"
  icon?: string                      // Lucide icon name, e.g., "soup" (optional)
  color?: string                     // Hex color for the list accent (optional)
  orderIndex: number                 // Display order in sidebar (0, 1, 2...)
  createdAt: string
  updatedAt: string
}
```

**Relationships:**
- Places reference lists via `Place.listIds[]` (many-to-many)

**Indexes:**
- `[tripId]` — find all lists for a trip
- Sort by `orderIndex` for sidebar display

---

### PackingItem

A single item in the packing checklist.

```typescript
interface PackingItem {
  id: string                         // nanoid
  tripId: string                     // FK to Trip.id
  name: string                       // "Rain jacket"
  category: string                   // "Clothes", "Electronics", etc. (free text)
  packed: boolean                    // false = not packed, true = packed
  orderIndex: number                 // Sort order within category
  createdAt: string
  updatedAt: string
}
```

**Default categories** (suggested, not enforced):
- Clothes
- Electronics
- Documents
- Toiletries
- Other

**Indexes:**
- `[tripId]` — find all packing items
- `[tripId+category]` — group by category

---

### Note

A freeform note card.

```typescript
interface Note {
  id: string                         // nanoid
  tripId: string                     // FK to Trip.id
  title: string                      // "General Tips"
  content: string                    // Free text, multi-line
  orderIndex: number                 // Display order
  createdAt: string
  updatedAt: string
}
```

**Indexes:**
- `[tripId]` — find all notes for a trip

---

### DayNote

A note attached to a specific day in the itinerary.

```typescript
interface DayNote {
  id: string                         // nanoid
  tripId: string                     // FK to Trip.id
  dayIndex: number                   // 0-based day index (0 = first day of trip)
  content: string                    // Free text
  updatedAt: string
}
```

**Indexes:**
- `[tripId+dayIndex]` — find note for a specific day (unique per day)

---

## Dexie Database Schema

```typescript
import Dexie, { type Table } from 'dexie'

class TravelPlannerDB extends Dexie {
  trips!: Table<Trip>
  places!: Table<Place>
  accommodations!: Table<Accommodation>
  reservations!: Table<Reservation>
  customLists!: Table<CustomList>
  packingItems!: Table<PackingItem>
  notes!: Table<Note>
  dayNotes!: Table<DayNote>

  constructor() {
    super('TravelPlannerDB')

    this.version(1).stores({
      trips: 'id',
      places: 'id, tripId, [tripId+dayIndex], [tripId+category], *listIds',
      accommodations: 'id, tripId',
      reservations: 'id, tripId, [tripId+category]',
      customLists: 'id, tripId',
      packingItems: 'id, tripId, [tripId+category]',
      notes: 'id, tripId',
      dayNotes: 'id, tripId, [tripId+dayIndex]'
    })
  }
}

export const db = new TravelPlannerDB()
```

**Notes on Dexie indexing:**
- Only indexed fields are listed in `.stores()` — all other fields are still stored
- `*listIds` creates a multi-entry index (can query "find all places in list X")
- Compound indexes like `[tripId+dayIndex]` enable efficient queries for "all places on day 3 of trip X"

---

## JSON Export Format

When the user exports their trip, the output looks like this:

```json
{
  "version": "1.0.0",
  "exportedAt": "2026-03-29T14:30:00.000Z",
  "appVersion": "0.1.0",
  "trip": {
    "id": "V1StGXR8_Z5jdHi6B-myT",
    "name": "Japan 2026",
    "destination": "Japan",
    "startDate": "2026-04-12",
    "endDate": "2026-04-22",
    "createdAt": "2026-03-29T10:00:00.000Z",
    "updatedAt": "2026-03-29T14:25:00.000Z"
  },
  "places": [
    {
      "id": "abc123",
      "tripId": "V1StGXR8_Z5jdHi6B-myT",
      "name": "Ichiran Ramen",
      "category": "food",
      "notes": "Famous for solo dining booths. Try the extra-rich broth option.",
      "area": "Shibuya",
      "lat": 35.6612,
      "lng": 139.7004,
      "links": ["https://ichiran.com"],
      "priority": "must-see",
      "dayIndex": 1,
      "orderInDay": 2,
      "timeSlot": "1:00 PM",
      "listIds": ["list_ramen"],
      "createdAt": "2026-03-29T11:00:00.000Z",
      "updatedAt": "2026-03-29T14:00:00.000Z"
    }
  ],
  "accommodations": [...],
  "reservations": [...],
  "customLists": [...],
  "packingItems": [...],
  "notes": [...],
  "dayNotes": [...]
}
```

### Export Implementation

```typescript
async function exportTrip(tripId: string): Promise<TripDocument> {
  const trip = await db.trips.get(tripId)
  const places = await db.places.where('tripId').equals(tripId).toArray()
  const accommodations = await db.accommodations.where('tripId').equals(tripId).toArray()
  const reservations = await db.reservations.where('tripId').equals(tripId).toArray()
  const customLists = await db.customLists.where('tripId').equals(tripId).toArray()
  const packingItems = await db.packingItems.where('tripId').equals(tripId).toArray()
  const notes = await db.notes.where('tripId').equals(tripId).toArray()
  const dayNotes = await db.dayNotes.where('tripId').equals(tripId).toArray()

  return {
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    appVersion: APP_VERSION,
    trip,
    places,
    accommodations,
    reservations,
    customLists,
    packingItems,
    notes,
    dayNotes
  }
}
```

### Import Implementation

```typescript
async function importTrip(document: TripDocument): Promise<void> {
  // Validate structure
  validateTripDocument(document)

  // Clear existing data for this trip (or all data in MVP)
  await db.transaction('rw',
    db.trips, db.places, db.accommodations, db.reservations,
    db.customLists, db.packingItems, db.notes, db.dayNotes,
    async () => {
      // Clear all tables
      await Promise.all([
        db.trips.clear(),
        db.places.clear(),
        db.accommodations.clear(),
        db.reservations.clear(),
        db.customLists.clear(),
        db.packingItems.clear(),
        db.notes.clear(),
        db.dayNotes.clear()
      ])

      // Bulk insert all data
      await db.trips.add(document.trip)
      await db.places.bulkAdd(document.places)
      await db.accommodations.bulkAdd(document.accommodations)
      await db.reservations.bulkAdd(document.reservations)
      await db.customLists.bulkAdd(document.customLists)
      await db.packingItems.bulkAdd(document.packingItems)
      await db.notes.bulkAdd(document.notes)
      await db.dayNotes.bulkAdd(document.dayNotes)
    }
  )

  // Hydrate Zustand stores from DB
  await hydrateStores()
}
```

---

## AI Integration via JSON

The JSON export format is designed to be AI-readable. An AI can:

1. **Read the full trip**: Understand every place, accommodation, reservation, and how days are organized
2. **Suggest changes**: "Day 3 has too many activities. I'd move Meiji Shrine to Day 4 which has more free time"
3. **Add places**: "Based on your ramen list, you should also try Fuunji in Shinjuku"
4. **Optimize routing**: "Your Day 1 activities are spread across Tokyo. Here's a more geographically efficient order"
5. **Output modified JSON**: The AI returns a modified version of the JSON, user imports it

### AI Prompt Template

When exporting for AI, the app could include a prompt header:

```
This is my travel plan in JSON format. Please help me by:
- Reviewing my itinerary for each day
- Suggesting improvements or additions
- Identifying any scheduling conflicts
- Optimizing the order of activities within each day for geographic efficiency

When making changes, output the complete modified JSON in the same format.
Here is my trip data:

{...json...}
```

### Future: MCP Integration

An MCP server could expose tools like:
- `get_trip()` → returns the full JSON
- `add_place(place)` → adds a place
- `move_place(placeId, fromDay, toDay)` → reschedules
- `suggest_improvements()` → AI analyzes and returns suggestions

This would allow an AI assistant to modify the trip in real-time without manual export/import.

---

## Entity Relationships Diagram

```
Trip (1)
  ├── has many → Place (N)
  │                ├── belongs to many → CustomList (M:N via listIds)
  │                └── optionally assigned to → Day (via dayIndex)
  ├── has many → Accommodation (N)
  ├── has many → Reservation (N)
  ├── has many → CustomList (N)
  ├── has many → PackingItem (N)
  ├── has many → Note (N)
  └── has many → DayNote (N, max 1 per day)
```

---

## Data Validation Rules

### Required Fields
| Entity | Required Fields |
|--------|----------------|
| Trip | id, name, destination, startDate, endDate |
| Place | id, tripId, name, category, priority |
| Accommodation | id, tripId, name, checkIn, checkOut |
| Reservation | id, tripId, name, category, dateTime |
| CustomList | id, tripId, name, orderIndex |
| PackingItem | id, tripId, name, category, packed |
| Note | id, tripId, title, content |
| DayNote | id, tripId, dayIndex, content |

### Constraints
- `Trip.startDate` must be before `Trip.endDate`
- `Place.dayIndex` must be between 0 and `trip.duration - 1` (or null)
- `Place.listIds` must reference existing `CustomList.id` values
- `Accommodation.checkIn` must be before `Accommodation.checkOut`
- `Reservation.dateTime` should fall within the trip date range (warning, not enforced)
- `PackingItem.packed` must be boolean
- `DayNote.dayIndex` must be unique per trip (one note per day)

---

## ID Strategy

All entities use **nanoid** for ID generation:
- 21 characters, URL-safe alphabet
- Example: `V1StGXR8_Z5jdHi6B-myT`
- Generated client-side, no server needed
- Collision probability is negligible for personal use

IDs are stable — they don't change when data is exported and re-imported. This enables:
- Cross-references between entities (listIds, tripId)
- Consistent history tracking
- Future merge/sync capabilities
