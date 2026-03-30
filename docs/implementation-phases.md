# Implementation Phases

## Timeline

**Total time**: 13 days (March 29 → April 10, 2026)
**Trip starts**: April 11-12, 2026
**Goal**: A fully functional web app deployed to Vercel, loaded with real Japan trip data.

---

## Phase 0: Documentation (Day 0 — March 29)

**Status: Current phase**

Create all project documentation before writing any code:
- Idea & Vision
- UI/UX
- Tech Stack
- Features
- Design System
- Data Model
- History System
- Implementation Phases
- React Native Migration

**Deliverable**: Complete `docs/` folder checked into git.

---

## Phase 1: Foundation (Days 1-2 — March 30-31)

**Goal**: App skeleton with navigation, database, and state management wired up.

### Tasks

1. **Project initialization**
   - `npm create vite@latest . -- --template react-ts`
   - Install all dependencies (see tech-stack.md)
   - Configure TypeScript (strict mode)
   - Configure Tailwind CSS v4
   - Import DM Sans via @fontsource
   - Set up base CSS variables for design system colors

2. **Database setup**
   - Create Dexie database class with full schema
   - Define all TypeScript interfaces in `types/index.ts`
   - Create seed data function (one Japan trip with a few sample places)
   - Test that data persists across page refreshes

3. **State management**
   - Create `tripStore` with Zustand + Immer
     - Trip CRUD
     - Place CRUD
     - Accommodation CRUD
     - Reservation CRUD
     - List CRUD
     - Packing item CRUD
     - Note CRUD
     - Day note CRUD
     - JSON export/import functions
   - Create `uiStore` for UI state
     - Active section
     - Modal state (open/closed, item being edited)
     - Filters
   - Create `historyStore` for undo/redo
     - `withHistory()` wrapper function
     - Undo/redo actions
     - Change log

4. **App shell**
   - `AppShell` component (sidebar + content area)
   - `Sidebar` component with all navigation items
   - Section routing (state-based, not URL-based for MVP)
   - Active section highlighting
   - Trip header in sidebar (name, dates, countdown)

5. **Shared components**
   - `Modal` component (centered dialog with backdrop)
   - `Button` component (primary, secondary, ghost, danger variants)
   - `Input` component (styled text input)
   - `TextArea` component
   - `Select` component
   - `CategoryBadge` component
   - `PriorityBadge` component

### Deliverable
- App loads with sidebar navigation
- Clicking sidebar items switches the content area (placeholder content per section)
- Seed data loads on first visit
- Zustand stores work with Immer patches
- Undo/redo keyboard shortcuts wired up (even if there's nothing to undo yet)
- Design system colors, fonts, and spacing visible

---

## Phase 2: Core Sections (Days 3-6 — April 1-4)

**Goal**: The four most important sections are fully functional.

### Day 3-4: Places + Itinerary

1. **Places section**
   - `PlacesPage` with list tabs (All Places + custom lists)
   - `PlaceCard` displaying all fields
   - Add place modal (all fields from data model)
   - Edit place modal (pre-filled)
   - Delete place (with confirmation)
   - Create new list dialog
   - Filter places by active list
   - Priority badges (must-see, want-to, if-time)
   - Category icons and color badges

2. **Itinerary section**
   - `ItineraryPage` with day sections generated from trip dates
   - `DaySection` with header (day number, date, day of week)
   - `ActivityCard` for each place assigned to a day
   - `UnassignedBucket` showing places with no day assignment
   - Drag & drop with dnd-kit:
     - Reorder within a day
     - Move between days
     - Move to/from unassigned
   - Day notes (collapsible, inline edit)
   - "+ Add to this day" button → place picker

### Day 5-6: Accommodations + Reservations

3. **Accommodations section**
   - `AccommodationsPage` with cards sorted by check-in date
   - `AccommodationCard` showing all fields
   - Add/edit modal
   - Auto-calculated duration ("2 nights")
   - Copy confirmation number to clipboard

4. **Reservations section**
   - `ReservationsPage` with category filter bar
   - Filter buttons: All, Dining, Transport, Activity
   - Date-grouped reservation list
   - `ReservationCard` with category icon and color
   - Add/edit modal with category dropdown

### Deliverable
- Can add, edit, delete, and view places organized in custom lists
- Can build a day-by-day itinerary with drag & drop
- Can track accommodations and reservations
- All changes tracked in history (undo works)
- Data persists in IndexedDB

---

## Phase 3: Map + Overview (Days 7-9 — April 5-7)

**Goal**: The map and overview dashboard are functional.

### Day 7-8: Map

1. **Map section**
   - Full-screen Leaflet map in the content area
   - Load all places with coordinates as markers
   - Color-coded markers by category
   - Click marker → popup card with place summary
   - Filter bar: by category, by list, by day
   - Auto-fit bounds to visible markers
   - "View Details" button in popup → opens edit modal
   - "Add to Day" dropdown in popup

2. **Geocoding** (stretch)
   - When adding a place, auto-geocode the address using Nominatim (free, OSM-based)
   - Or let the user click on the map to set coordinates
   - Fallback: manual lat/lng input in the edit modal

### Day 9: Overview

3. **Overview section**
   - Trip header (name, destination, dates, countdown)
   - Stat cards:
     - Places count (click → Places section)
     - Reservations count (click → Reservations section)
     - Days planned / total days (click → Itinerary section)
     - Lists count (click → Places section)
   - Upcoming items list:
     - Merge accommodations (check-in events) and reservations
     - Sort by date
     - Show next 5-10 items
     - Click → edit modal
   - Quick action buttons (+ Place, + Reservation, + Note)

4. **Cross-references**
   - Places assigned to a day show "Day X" badge in Places section
   - Places with matching reservations show "RESERVED" badge in Itinerary
   - Upcoming items in Overview pull from Accommodations and Reservations stores

### Deliverable
- Map shows all places with colored markers
- Can filter map by category/list/day
- Overview dashboard shows trip summary and upcoming items
- Cross-references between sections work

---

## Phase 4: Extras + Polish (Days 10-12 — April 8-10)

**Goal**: Packing list, notes, history UI, JSON export/import, and overall polish.

### Day 10: Packing + Notes

1. **Packing List section**
   - Progress bar at top (X/Y packed)
   - Categorized groups (collapsible)
   - Checkbox items with strikethrough on packed
   - Inline add (text input at bottom of each category)
   - Default categories: Clothes, Electronics, Documents, Toiletries
   - Custom category creation

2. **Notes section**
   - Multiple named notes
   - Note cards with title and content preview
   - Create new note (title prompt)
   - Click to edit (inline or modal)
   - Delete note

### Day 11: History + JSON

3. **History section UI**
   - Change log display (grouped by day)
   - Each entry: timestamp, description, revert button
   - Visual separator for current position
   - Undone entries shown muted
   - Revert confirmation dialog
   - Toast notifications for undo/redo

4. **JSON Export/Import**
   - Export button in sidebar → generates and downloads .json file
   - Import button in sidebar → file picker → validation → confirmation → hydrate
   - Validation error display if JSON is malformed
   - Success toast after import

### Day 12: Polish

5. **UI polish**
   - Smooth transitions between sections
   - Card hover effects
   - Modal open/close animations
   - Empty states for all sections (encouraging messages)
   - Loading state on initial DB hydration (should be instant, but just in case)
   - Error boundaries (graceful error display)

6. **Responsive basics**
   - Sidebar collapses to hamburger on mobile (<768px)
   - Content area takes full width on mobile
   - Map works on mobile (Leaflet is responsive)
   - Modals are full-screen on mobile

7. **Keyboard shortcuts**
   - Ctrl+Z / Cmd+Z for undo
   - Ctrl+Shift+Z / Cmd+Shift+Z for redo
   - Escape to close modals
   - Ctrl+N / Cmd+N for new item (contextual)

### Deliverable
- All 9 sections fully functional
- History section shows change log with revert capability
- JSON export/import works end-to-end
- App feels polished with animations and empty states
- Basic responsive support for mobile viewing

---

## Phase 5: Deploy + QA (Day 13 — April 11)

**Goal**: App is deployed, tested with real data, and ready for the trip.

### Tasks

1. **Deploy to Vercel**
   - Connect GitHub repo to Vercel
   - Deploy as static site (no server needed)
   - Verify HTTPS works
   - Test on actual phone browser

2. **Real data entry**
   - Enter actual Japan trip accommodations
   - Enter all confirmed reservations
   - Add real places from research
   - Create actual custom lists
   - Build the real itinerary
   - Start the packing list
   - Add useful notes

3. **QA**
   - Test all CRUD operations
   - Test drag & drop in itinerary
   - Test map markers and popups
   - Test JSON export → import roundtrip
   - Test undo/redo across all sections
   - Test in Chrome + Safari
   - Test on iPhone browser (basic responsiveness)
   - Verify data persists after page refresh
   - Verify data persists after closing and reopening browser

4. **PWA setup** (stretch)
   - Add manifest.json for "Add to Home Screen"
   - Basic service worker for offline caching of app shell
   - App icon

### Deliverable
- App deployed and accessible via URL
- Real Japan trip data entered and organized
- All features tested and working
- Accessible on phone browser for on-trip reference

---

## Risk Mitigation

### "What if I fall behind?"

Phases are ordered by priority. If time runs short:

1. **Cut Phase 4 scope**: Skip History UI (undo still works via keyboard), skip packing list, skip JSON import (keep export). Notes can be a single textarea instead of multiple cards.

2. **Cut Phase 3 map features**: Map can be a simple static view without filters. Skip geocoding.

3. **Simplify Phase 2**: Skip drag & drop in itinerary (use manual day assignment via edit modal instead). Simpler but still functional.

4. **Absolute minimum viable product** (if really pressed):
   - Sidebar + Places section + Itinerary section
   - Add/edit places with day assignment
   - Day-by-day view (without drag & drop)
   - JSON export
   - That's it — everything else is nice to have

### "What if something is harder than expected?"

- **dnd-kit integration**: If drag & drop is too complex, fall back to "Move to Day X" dropdown on each card. Functional, just less elegant.
- **Leaflet setup**: If map causes issues, defer to Phase 4 or make it a stretch goal. The app works fine without a map.
- **Immer patches for history**: If the patch system is buggy, fall back to simple state snapshots (store full state copies). Less efficient but simpler.

---

## Definition of Done

The app is "done enough" when:

- [ ] Can create and manage places organized in custom lists
- [ ] Can build a day-by-day itinerary
- [ ] Can track accommodations and reservations
- [ ] All data persists locally
- [ ] Can export trip as JSON
- [ ] Undo works (at minimum via keyboard)
- [ ] Deployed and accessible via URL
- [ ] Real Japan trip data is entered
- [ ] Works in Chrome
- [ ] Looks good (matches design system)
