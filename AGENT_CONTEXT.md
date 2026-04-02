# Tabi — Agent Onboarding & Context Document

> Read this entire document before writing any code. It covers the project, tech stack, design system, data model, state management, component architecture, active work, and all the rules you must follow.

---

## 1. Project Overview

**Tabi** is a personal Japan trip planning web app built by Chris. It's a local-first single-page app — everything lives in IndexedDB in the browser, no backend. Chris is using it to plan a Japan trip starting ~April 12, 2026 (trip is imminent).

Think of it as a personal version of Wanderlog: itinerary planning, place saving, accommodations, reservations, packing list, notes, and a live map search powered by Google Places.

### What exists today
- Multi-trip home screen (create/edit/select trips)
- Full dashboard with sidebar navigation after selecting a trip
- **Overview** — stats, upcoming reservations, countdown
- **Itinerary** — drag-to-reorder daily plan, day planner modal
- **Accommodations** — lodging CRUD
- **Reservations** — dining/transport/activity bookings
- **Places** — recently redesigned two-column sidebar + grid layout (see §7)
- **Map** — triple-pane layout: itinerary panel left, Google Maps center, search/detail panel right
- **Packing List**
- **Notes**
- **History** — undo log
- JSON export/import

---

## 2. Working Directory & Dev Setup

```
/Users/chris/Desktop/dev/travel-planner
```

```bash
npm run dev   # starts Vite dev server on port 5173
npx tsc --noEmit  # type check (must pass before finishing any task)
```

**Environment variables** (in `.env` at project root):
```
VITE_GOOGLE_PLACES_API_KEY=<key for Maps JavaScript API + New Places API>
```

---

## 3. Tech Stack

| Layer | Library |
|---|---|
| Framework | React 19 + TypeScript |
| Build | Vite 8 |
| Styling | Tailwind CSS v4 with `@theme` design tokens |
| State | Zustand 5 |
| Persistence | Dexie.js (IndexedDB wrapper) |
| Maps | `@googlemaps/js-api-loader` + Google Maps JS SDK |
| Places | Google Places API (New) — v1 REST endpoints |
| Drag-and-drop | `@dnd-kit/core`, `@dnd-kit/sortable` (installed but not used everywhere yet) |
| Date utils | `date-fns` |
| Icons | `lucide-react` |
| Fonts | Plus Jakarta Sans (headings), Be Vietnam Pro (body) |

---

## 4. CLAUDE.md Rules — Read Before Every Task

These are mandatory. Violations will be rejected.

### Git
- **NEVER** auto-stage or commit. All git operations must be explicitly requested.

### UI / Components
- **NEVER** create private helper methods for rendering UI (no `_buildHeader()`, `buildContent()` inside a component)
- Extract sub-UI to separate named `function` components in the same file OR a new file
- This applies without exception

### Riverpod/State (adapted for Zustand)
- **NEVER** call `store.getState()` or modify state in lifecycle effects without wrapping in a post-frame callback equivalent

### Code Preservation
- **NEVER** delete or relocate comments unless the code they reference no longer exists
- Preserve all TODO/FIXME comments

### Workflow — MANDATORY
- **ALWAYS discuss the approach before writing any code, modifying files, or creating files**
- Present a plan, get approval, then execute
- If uncertain about any decision, ask first

### Journal — REQUIRED after every task
- Create entry at `/Users/chris/Desktop/dev/claude_journal/`
- Filename: `YYYY-MM-DD_HH-MM_<brief-task-name>.md`
- Template:
  ```
  # Task Journal Entry
  **Date:** YYYY-MM-DD
  **Time:** HH:MM
  **Project:** Tabi
  **Repository:** travel-planner
  **Working Directory:** /Users/chris/Desktop/dev/travel-planner

  ## Task Summary
  ## Changes Made
  ## Notes
  ```

---

## 5. Design System

### Color Tokens (`src/index.css`)
```css
--color-page-bg: #fdf9f3        /* warm off-white canvas */
--color-sidebar-bg: #f7f2ea
--color-card-bg: #ffffff
--color-surface-high: #f0ebe3
--color-surface-highest: #e8e2d9

--color-text-heading: #1c1917
--color-text-body: #44403c
--color-text-muted: #a8a29e
--color-text-placeholder: #d6d3d1

--color-primary: #f59e0b        /* amber — main accent */
--color-primary-hover: #d97706
--color-primary-light: #fef3c7

--color-border-light: #f0ebe3
--color-border-medium: #e8e2d9
--color-border-focus: #f59e0b

/* Category colors */
--color-cat-food: #22c55e
--color-cat-temple: #3b82f6
--color-cat-shopping: #a855f7
--color-cat-activity: #f59e0b
--color-cat-nightlife: #ec4899
--color-cat-nature: #10b981
--color-cat-culture: #6366f1
--color-cat-other: #6b7280

/* Shadows */
--shadow-card: 0 1px 3px rgba(68,64,60,0.06), 0 1px 2px rgba(68,64,60,0.04)
--shadow-card-hover: 0 4px 12px rgba(68,64,60,0.1), 0 2px 4px rgba(68,64,60,0.06)
--shadow-modal: 0 20px 60px rgba(0,0,0,0.12), 0 4px 16px rgba(0,0,0,0.06)
```

### Typography
- Headings: **Plus Jakarta Sans** (`font-heading`)
- Body: **Be Vietnam Pro** (`font-body`)
- All `h1-h6` automatically use heading font

### Tailwind usage
- Use design tokens as Tailwind classes: `bg-page-bg`, `text-text-muted`, `shadow-card`, etc.
- Arbitrary values for one-off colors: `bg-[#f7f3ed]`
- Rounded corners: typically `rounded-[10px]`, `rounded-[12px]`, `rounded-[14px]`

---

## 6. Data Model (`src/types/index.ts`)

```typescript
type PlaceCategory = 'food' | 'temple' | 'shopping' | 'activity' | 'nightlife' | 'nature' | 'culture' | 'other'
type PlacePriority = 'must-see' | 'want-to' | 'if-time'
type ReservationCategory = 'dining' | 'transport' | 'activity'
type AppSection = 'overview' | 'itinerary' | 'accommodations' | 'reservations' | 'places' | 'map' | 'packing' | 'notes' | 'history'

interface Trip {
  id: string; name: string; destination: string
  startDate: string; endDate: string  // ISO date strings
  createdAt: string; updatedAt: string
}

interface Place {
  id: string; tripId: string; name: string
  category: PlaceCategory; priority: PlacePriority
  notes: string; address?: string; area?: string
  lat?: number; lng?: number; links: string[]
  dayIndex?: number | null   // null = not scheduled
  orderInDay?: number; timeSlot?: string
  listIds: string[]            // which CustomLists this belongs to
  googlePlaceId?: string       // Google Places ID
  photoName?: string           // Google Places photo resource name
  rating?: number; websiteUri?: string
  createdAt: string; updatedAt: string
}

interface CustomList {
  id: string; tripId: string; name: string
  icon?: string; color?: string
  orderIndex: number           // determines sidebar sort order
  createdAt: string; updatedAt: string
}

interface Accommodation { id, tripId, name, checkIn, checkOut, address?, confirmationNumber?, notes, link? }
interface Reservation { id, tripId, name, category, dateTime, confirmationNumber?, notes, link? }
interface PackingItem { id, tripId, name, category, packed: boolean, orderIndex }
interface Note { id, tripId, title, content, orderIndex }
interface DayNote { id, tripId, dayIndex, content, updatedAt }
interface HistoryEntry { id, timestamp, description }
```

---

## 7. Database (`src/db/database.ts`)

Dexie.js wrapping IndexedDB, database name `TabiDB`:

```typescript
// Key indexes:
trips: 'id'
places: 'id, tripId, [tripId+dayIndex], [tripId+category], *listIds'
customLists: 'id, tripId'
// ... others indexed by id + tripId
```

---

## 8. State Management

### `useTripStore` (`src/stores/tripStore.ts`) — Zustand

Holds all trip data in memory, synced to Dexie. Key actions:

```typescript
// Initialization
loadAllTrips()           // loads all trips + restores active from localStorage
selectTrip(id)           // loads full trip data into state
clearActiveTrip()        // goes back to home screen

// Trip
createTrip(data)
updateTrip(data)         // updates current active trip
updateTripById(id, data) // updates any trip by id (used in home/edit)

// Places
addPlace(data)
updatePlace(id, data)
deletePlace(id)

// Lists
addList(data)
updateList(id, data)     // rename, color, etc.
deleteList(id)           // also clears listIds references from all places
reorderLists(orderedIds) // updates orderIndex for all lists atomically

// All other CRUD: accommodations, reservations, packingItems, notes, dayNotes
```

Active trip is persisted in `localStorage` under key `tabi_active_trip_id`.

### `useUIStore` (`src/stores/uiStore.ts`) — Zustand

UI-only ephemeral state:

```typescript
activeSection: AppSection    // current page
modal: { type, itemId, extra }
activeListId: string | null  // which list is selected in Places page
reservationFilter: 'all' | 'dining' | 'transport' | 'activity'
sidebarPlacesExpanded: boolean
toastMessage: string | null

setSection(section)
openModal(type, itemId?, extra?)
closeModal()
setActiveListId(id)
showToast(message)
```

### `useUndoStore` (`src/stores/undoStore.ts`)

Snapshots entire Dexie state before each mutation for Cmd+Z support.

---

## 9. Component Architecture

### Layout (`src/components/layout/`)

- **`AppShell`** — wraps the dashboard. Has `FULL_BLEED_SECTIONS = ['map', 'places']` — these sections bypass the `px-8 py-10 max-w-[960px]` padding wrapper and receive children directly in a full `h-screen` context. All other sections get the padded wrapper.
- **`Sidebar`** — fixed 240px left column. Trip header with pencil edit button (hover-reveal), nav items, Places accordion showing list names. Export/Import JSON at bottom.
- **`TopBar`** — fixed top-right, just the Undo button. Listens for Cmd+Z globally.

### Home (`src/components/home/`)
- **`TripsHome`** — landing screen when no trip is active. Shows trip cards (2-col grid), "+ New Trip" button. Each card has a hover-reveal pencil to open `EditTripModal`.
- **`NewTripModal`** — creates a trip. Has a "Load Japan 2026 demo trip" link that seeds test data from `src/data/seed.ts`.
- **`EditTripModal`** — edits name, destination, startDate, endDate of any trip. Reused in both `TripsHome` and `Sidebar`.

### Places (`src/components/places/PlacesPage.tsx`) — recently rebuilt

Full-bleed `h-screen` two-column layout:

**Left: `ListSidebar` (224px, `bg-[#f7f3ed]`)**
- "My Lists" header + "+ New" amber button
- "All Places" pinned row with amber left-border accent when active
- Scrollable `ListRow` components — one per `CustomList`
  - Native HTML5 drag-to-reorder (calls `reorderLists`)
  - Inline rename (pencil → input replaces text, blur/Enter commits, Escape cancels)
  - Inline delete confirmation row ("Delete 'name'? / Delete / Cancel")
  - Edit/Delete icons appear on `group-hover`
- Inline new list input or dashed "+ New List" button

**Right: main content**
- Heading = active list name or "All Places"
- Toolbar: sort dropdown (Added/Name/Rating/Category), grid/list view toggle
- **Grid view**: 2-col (xl: 3-col) `PlaceCardGrid` components — photo top 160px, category badge, rating, area, `•••` hover menu
- **List view**: `PlaceCardList` — horizontal photo-left layout with priority badge + notes
- **`CardMenu`** — floating dropdown from `•••`:
  - Edit place → opens `PlaceModal`
  - Move to list → hover submenu with all OTHER lists (not current)
  - Remove from list → only when a specific list is active
  - Delete place → calls `deletePlace`
- Empty state with CTA

### Map (`src/components/map/MapPage.tsx`) — large file (~650+ lines)

Full-bleed `h-screen flex overflow-hidden` triple-pane layout:

**Left `ItineraryPanel` (256px)**
- "All Places" toggle + day rows (day number, date, city from most-common `area`, place count)
- Clicking a day calls `map.fitBounds` to pan to that day's places
- Uses `markersRef` (Map<string, Marker>) to manage trip place markers

**Center: Google Map**
- Loaded via `@googlemaps/js-api-loader` + `importLibrary('maps', 'marker')`
- Custom warm map styles (MAP_STYLES array)
- Colored SVG circle markers per category (CATEGORY_HEX)
- `searchMkrsRef` (Marker[]) for search result markers (amber-ringed)

**Right `RightPanel`**
- Switches between `explore` | `results` | `detail` modes
- `ExploreState`: default compass + inspiration chips
- `ResultsList`: result count + query header + `PlaceResultCard` list (thumbnail, name, badge, rating, address, quick-add `+` button)
- `PlaceDetailPanel`: back button, hero photo + gallery strip (up to 5 photos), hours accordion, website/phone, **Add to List section** (currently showing old inline category + list selector UI — see §11 for pending work)

**Key callbacks:**
- `getBounds()` → returns `ViewportBounds` from `map.getBounds()`
- `handleSearchSubmit` → calls `textSearchPlaces(query, getBounds())`, fits map to results
- `handleSuggestionSelect` → calls `getPlaceDetails` → goes straight to detail view
- `inferCategory(types[])` → maps Google types to `PlaceCategory`

### Modals (`src/components/modals/`)
- **`PlaceModal`** — full CRUD for a Place. Opens from Places page or sidebar.
- **`ListModal`** — creates a new CustomList (name, color, icon). Also accessible from sidebar.
- `AccommodationModal`, `ReservationModal`, `NoteModal` — standard CRUD modals.

### Shared (`src/components/shared/`)
- **`PlacePhoto`** — renders Google photo via `getPhotoUrl()` or a colored emoji fallback per category
- **`CategoryBadge`** — colored pill badge for `PlaceCategory`
- **`PriorityBadge`** — small badge for `PlacePriority`
- **`PlaceSearch`** — autocomplete search input using `searchPlaces()`
- **`Toast`** — ephemeral toast driven by `uiStore.toastMessage`

---

## 10. Google Places API (`src/services/googlePlaces.ts`)

Uses the **New Places API v1 REST** (not the legacy JS SDK Places library).

```typescript
// Autocomplete — used in search bar dropdown
searchPlaces(input, bounds?) → PlaceSuggestion[]
// Uses: POST /places:autocomplete
// locationBias: rectangle (bounds or JAPAN_RECT fallback)

// Text search — used when user presses Enter, returns up to 10 results
textSearchPlaces(query, bounds?) → PlaceDetails[]
// Uses: POST /places:searchText
// With bounds: locationRestriction (strict) — limits to viewport
// Without bounds: locationBias: JAPAN_RECT (fallback)

// Single place details — used when tapping an autocomplete suggestion
getPlaceDetails(placeId) → PlaceDetails | null
// Uses: GET /places/{placeId}
// Results cached in-memory (detailsCache Map)

// Photo URL — safe to use as <img src> directly
getPhotoUrl(photoName, maxWidth?) → string
// Returns: /v1/{photoName}/media?maxWidthPx=...&key=...
// NOTE: do NOT add skipHttpRedirect=true — it returns JSON instead of image bytes
```

**JAPAN_RECT** bounding box (used when no viewport available):
```typescript
{ low: { latitude: 24.0, longitude: 122.0 }, high: { latitude: 46.0, longitude: 154.0 } }
```

**API key**: stored in `VITE_GOOGLE_PLACES_API_KEY` env var. Enabled APIs: Maps JavaScript API, Places API (New).

**Known limitation**: Google Places `locationBias.circle` caps at 50km radius — always use `rectangle` instead.

---

## 11. Pending Work & Active Tasks

These are the things Chris wants done. Discuss before implementing each one.

### Priority 1 — Map page fixes (4 bugs reported)

**A. Search viewport bias not working**
- `textSearchPlaces` is called with `getBounds()` but user says results aren't limiting to viewport
- Need to verify `getBounds()` is actually returning correct bounds when called and being passed through
- `getBounds()` extracts from `mapRef.current.getBounds()` → `getSouthWest()`/`getNorthEast()` → `ViewportBounds`
- Currently uses `locationRestriction` (strict) when bounds are present — this should work
- Debug by logging what `getBounds()` returns before passing to `textSearchPlaces`

**B. "Add to List" button in PlaceDetailPanel — needs dropdown redesign**
- Currently: inline section with category pills + list toggle pills + confirm button (cluttered)
- Agreed design: **Option A — dropdown button**
  - Single amber button "Add to List ▾"
  - Click → dropdown appears anchored below
  - Dropdown shows each `CustomList` as a row; clicking one immediately calls `addPlace` with `listIds: [selectedListId]` and closes dropdown
  - Last row: "New list…" — expands inline input inside the dropdown (name → Enter/check → creates list + adds place to it)
  - Once added: button changes to green "Added ✓" state
  - Keep category picker above the button (it's useful for organization)
  - Close dropdown on outside click or Escape

**C. Search result marker hover tooltips**
- Hovering over an amber search result marker on the map should show the place name
- Google Maps native `title` property on a `Marker` shows a tooltip — just ensure `title: place.name` is set when creating `searchMkrsRef` markers

**D. Clicking a search result marker shouldn't hide other markers**
- Currently clicking a marker opens the detail view, but other search markers disappear
- Root cause: the `useEffect` for `searchMkrsRef` likely clears and re-adds markers when `detailPlace` state changes (because marker icon changes to indicate the selected one)
- Fix: instead of clearing all markers and re-adding, just update the icon of the specific markers that changed (selected → highlighted, others → normal)

### Priority 2 — Already discussed/decided, not yet built

**Add to List dropdown in Map detail panel** (same as 11-B above, that's the main pending map work)

### Notes on future work Chris has mentioned
- The Itinerary page / day planner may need work
- Cross-platform (React Native/Expo) is a long-term interest but not current priority

---

## 12. Key Patterns & Conventions

### Component patterns
```tsx
// ✅ Good — separate named component
function PlaceCardGrid({ place, ... }: Props) { ... }
function PlaceCardList({ place, ... }: Props) { ... }

// ❌ Bad — private render helper
function PlacesPage() {
  const _renderCard = () => <div>...</div>  // NEVER DO THIS
}
```

### Negative margin escape hatch
For `map` and `places` sections, `AppShell` skips the padding wrapper entirely. These pages render directly in `<main>` and set their own `h-screen` layout.

### Toast pattern
```typescript
const showToast = useUIStore((s) => s.showToast)
showToast('Place added!')
```

### Opening a modal
```typescript
const openModal = useUIStore((s) => s.openModal)
openModal('place', placeId)     // edit existing
openModal('place')              // create new
openModal('list')               // create new list
```

### Accessing categories
```typescript
import { CATEGORY_CONFIG, PLACE_CATEGORIES, PRIORITIES, PRIORITY_CONFIG } from '../../utils/categories'
// CATEGORY_CONFIG[cat].label / .color / .icon
// PLACE_CATEGORIES = ['food', 'temple', ...] (all 8)
```

### Tailwind v4 note
No `tailwind.config.js` — all theme tokens defined in `src/index.css` under `@theme { }`. Use them as standard Tailwind class names.

---

## 13. File Structure Quick Reference

```
src/
├── App.tsx                      # root, section router, modal renders
├── index.css                    # Tailwind v4 @theme tokens
├── main.tsx
├── types/index.ts               # all TypeScript types
├── db/database.ts               # Dexie DB definition
├── stores/
│   ├── tripStore.ts             # all trip data + CRUD actions
│   ├── uiStore.ts               # UI state (section, modal, list filter, toast)
│   └── undoStore.ts             # snapshot-based undo
├── services/
│   └── googlePlaces.ts          # Places API v1 REST wrapper
├── utils/
│   ├── categories.ts            # CATEGORY_CONFIG, PRIORITIES etc.
│   ├── dates.ts                 # date helpers
│   └── ids.ts                   # generateId(), now()
├── data/seed.ts                 # Japan 2026 demo trip data
└── components/
    ├── layout/
    │   ├── AppShell.tsx         # main shell, full-bleed logic
    │   ├── Sidebar.tsx          # fixed left nav, list accordion
    │   └── TopBar.tsx           # fixed top-right undo button
    ├── home/
    │   ├── TripsHome.tsx        # trip cards landing page
    │   ├── NewTripModal.tsx     # create trip modal
    │   └── EditTripModal.tsx    # edit trip name/dates modal
    ├── places/
    │   └── PlacesPage.tsx       # two-column sidebar + grid (recently rebuilt)
    ├── map/
    │   └── MapPage.tsx          # triple-pane map page (large, ~650+ lines)
    ├── itinerary/
    │   ├── ItineraryPage.tsx
    │   ├── DayPlannerView.tsx
    │   └── TripOverviewGrid.tsx
    ├── modals/
    │   ├── PlaceModal.tsx       # place CRUD modal
    │   ├── ListModal.tsx        # new list modal
    │   ├── AccommodationModal.tsx
    │   ├── ReservationModal.tsx
    │   └── NoteModal.tsx
    ├── shared/
    │   ├── PlacePhoto.tsx       # Google photo or category emoji fallback
    │   ├── PlaceSearch.tsx      # autocomplete search input
    │   ├── CategoryBadge.tsx    # CategoryBadge + PriorityBadge components
    │   ├── Button.tsx
    │   ├── Input.tsx
    │   ├── Modal.tsx
    │   ├── Toast.tsx
    │   └── ConfirmDialog.tsx
    ├── overview/OverviewPage.tsx
    ├── accommodations/AccommodationsPage.tsx
    ├── reservations/ReservationsPage.tsx
    ├── packing/PackingPage.tsx
    ├── notes/NotesPage.tsx
    └── history/HistoryPage.tsx
```

---

## 14. Chris's Preferences

- Prefers visual, intuitive UI design
- Likes warm cream/amber aesthetic (the "Tabi" design language)
- Discusses design decisions before implementation — use Google Stitch for mockups on bigger UI changes
- TypeScript must be clean (`npx tsc --noEmit` = no output)
- No unnecessary abstractions — solve the actual problem
- Does not want code committed without explicit request
- Respond concisely — no preamble, no trailing summaries of what you just did
