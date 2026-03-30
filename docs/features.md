# Features & App Structure

## App Structure

The app is organized into **9 sections**, each accessible via the sidebar. Each section is a self-contained view with its own layout and functionality. The sidebar is always visible and serves as the primary navigation.

---

## Section 1: Overview

**Purpose**: Trip dashboard. The first thing you see when you open the app. A glanceable summary of everything.

### Features
- **Trip header**: Trip name, destination, date range, duration
- **Countdown**: "X days to go!" dynamically calculated from the trip start date
- **Stat cards**: Four cards showing key metrics
  - Total places saved (links to Places section)
  - Total reservations (links to Reservations section)
  - Days planned vs total days (links to Itinerary section)
  - Custom lists created (links to Places section)
  - Clicking any stat card navigates to that section
- **Upcoming items**: Chronological list of the next 5-10 upcoming events across accommodations (check-ins) and reservations. Each item shows:
  - Date
  - Type icon (accommodation, dining, transport, activity)
  - Name
  - Time (if applicable)
  - Click to open edit modal
- **Quick action buttons**: Shortcuts to add a place, add a reservation, or create a note without navigating away

### Data sources
- Aggregates from all other sections
- No unique data — everything displayed comes from accommodations, reservations, places, and lists stores

---

## Section 2: Itinerary

**Purpose**: The day-by-day trip plan. The heart of the app where you organize what you're doing each day.

### Features
- **Day sections**: One section per trip day, generated from the trip start/end dates
  - Header: "Day 1 — Saturday, April 12"
  - Optional city/area label (manually set per day)
  - Contains activity cards in order
- **Activity cards**: Each card represents something you're doing that day
  - Place name
  - Category icon + label
  - Time slot (optional, e.g. "9:00 AM")
  - Area/neighborhood
  - Short note preview (first line of notes)
  - "RESERVED" badge if the place has a matching reservation
  - Drag handle for reordering
- **Drag & drop**:
  - Reorder cards within a day
  - Move cards between days
  - Move cards to/from the unassigned bucket
  - Visual drop indicators show where the card will land
- **Unassigned ideas**: Collapsible section (top or bottom) showing places not yet assigned to a day
  - Displayed as compact chips (smaller than full cards)
  - Draggable into day sections
  - Shows count: "Unassigned Ideas (3)"
- **Day notes**: Collapsible text area at the bottom of each day
  - For general notes about the day ("Take it easy, recovering from jet lag")
  - Click to edit inline
- **Add to day**: "+ Add to this day" button at the bottom of each day
  - Opens a picker showing all saved places not yet assigned
  - Or option to create a new place on the spot
- **Empty state**: Days with no activities show an encouraging message ("Nothing planned yet — drag ideas here or click + to add")

### Interactions
- Click any activity card → edit modal with full place details
- Drag card → reorder within day, move between days, or move to/from unassigned
- Click day note → inline edit
- Click "+ Add to this day" → place picker or new place modal

---

## Section 3: Accommodations

**Purpose**: Track where you're staying. Simple reference cards for each hotel/hostel/Airbnb.

### Features
- **Accommodation cards**: One card per stay, sorted by check-in date
  - Hotel/accommodation name
  - Check-in date
  - Check-out date
  - Duration (auto-calculated, e.g. "2 nights")
  - Address
  - Confirmation number (prominently displayed, easy to copy)
  - Notes (personal directions, tips)
  - Link (to booking page)
- **Add button**: "+ Add Stay" in the header
- **Copy confirmation**: Click the confirmation number to copy to clipboard
- **Empty state**: "No accommodations added yet. Click + to add your first stay."

### Card behavior
- Click card → edit modal
- Cards are not draggable (order is determined by check-in date)
- Delete available via edit modal

---

## Section 4: Reservations

**Purpose**: Track all confirmed bookings — restaurants, trains, museum tickets, events.

### Features
- **Category filter bar**: Toggle buttons to filter by type
  - All (default)
  - Dining (restaurants, cafes)
  - Transport (trains, buses, flights)
  - Activity (museums, tours, events, tickets)
  - Active filter is visually highlighted
- **Date-grouped list**: Reservations grouped under date headers
  - "APRIL 12"
  - "APRIL 14"
  - etc.
- **Reservation cards**: Compact cards within each date group
  - Category icon (fork/knife for dining, train for transport, ticket for activity)
  - Reservation name
  - Time
  - Confirmation number
  - Brief note preview
  - Subtle color accent by category
- **Add button**: "+ Add Reservation" in the header
- **Empty state**: Per-filter empty states ("No dining reservations yet")

### Card behavior
- Click card → edit modal with full details
- Cards are not draggable (order is by date/time)

### Reservation fields (modal)
- Name (required)
- Category: dining / transport / activity (required)
- Date and time (required)
- Confirmation number (optional)
- Notes (optional, free text)
- Link (optional, URL to booking)

---

## Section 5: Places

**Purpose**: Your curated collection of places to visit, organized into custom lists. This is where all "ideas" and "things to see" live.

### Features
- **List tabs**: Horizontal tab bar to switch between lists
  - "All Places" (default, shows everything across all lists)
  - User-created lists: "Ramen Spots", "Coffee Shops", "Temples", etc.
  - Active tab highlighted
  - "+ New List" tab at the end
- **Place cards**: Rich cards for each saved place
  - Name (e.g., "Ichiran Ramen")
  - Category icon + label (food, temple, shopping, etc.)
  - Area/neighborhood (e.g., "Shibuya")
  - Priority badge:
    - Must-see: star icon, accent color
    - Want-to: neutral styling
    - If-time: muted styling
  - Notes preview (first 1-2 lines)
  - Links (clickable, shown as domain names)
  - Day assignment badge (if assigned to a day: "Day 2")
  - List membership (shown as small tags if viewing "All Places")
- **Add button**: "+ Add Place" or contextually "+ Add Place to Ramen Spots"
- **Create list**: "+ New List" opens a small dialog to name the list and optionally pick a color/icon
- **List management**: Edit or delete lists via their tab context menu (right-click or kebab menu)

### Place fields (modal)
- Name (required)
- Category: food / temple / shopping / activity / nightlife / nature / culture / other (required)
- Priority: must-see / want-to / if-time (default: want-to)
- Area/neighborhood (optional, free text)
- Address (optional)
- Latitude/longitude (optional, for map pin — could be auto-filled via address geocoding)
- Notes (optional, free text, multi-line)
- Links (optional, multiple URLs)
- Lists (multi-select from existing lists)
- Day assignment (optional, dropdown of trip days)
- Time slot (optional, e.g. "2:00 PM")

### Cross-references
- Places assigned to a day also appear in the Itinerary
- Places with coordinates appear on the Map
- A place can belong to multiple lists

---

## Section 6: Map

**Purpose**: Geographic overview of all your saved places. Useful for big-picture planning, seeing which places are near each other, and planning efficient days.

### Features
- **Full-screen Leaflet map**: Takes the entire content area
- **Markers**: Each saved place with coordinates gets a marker
  - Color-coded by category (food = green, temple = blue, etc.)
  - Custom marker icons per category
- **Filter bar**: Top of the map area
  - Filter by category (food, temple, shopping, etc.)
  - Filter by custom list (Ramen Spots, Coffee Shops, etc.)
  - Filter by day (Day 1, Day 2, ..., Unassigned)
  - Multiple filters can be combined
- **Marker popup**: Click a marker to see a summary card
  - Place name
  - Category + area
  - Priority badge
  - Notes preview
  - "View Details" button → opens edit modal
  - "Add to Day" dropdown → assign to a day
- **Auto-fit**: Map auto-zooms to fit all visible markers when filters change
- **Marker clustering**: If many markers are close together, cluster them with a count badge (stretch goal)
- **No editing on map**: The map is read-only (view and select). All editing happens in modals.

### Data source
- Reads from the Places store
- Only shows places that have lat/lng coordinates

---

## Section 7: Packing List

**Purpose**: Track what you need to pack before the trip.

### Features
- **Progress bar**: Visual indicator at the top: "14/22 packed" with a filled bar
- **Categorized groups**: Items grouped by category
  - Default categories: Clothes, Electronics, Documents, Toiletries
  - User can create custom categories
  - Each category is collapsible
- **Checklist items**: Each item has:
  - Checkbox (toggle packed/unpacked)
  - Item name
  - Packed items get strikethrough text and muted styling
- **Inline add**: Text input at the bottom of each category to quickly add items
- **Add item button**: "+ Add Item" opens a small form with name + category
- **Reorder**: Drag items to reorder within a category or move between categories (stretch goal)
- **Category management**: Add, rename, or delete categories

### Packing item fields
- Name (required)
- Category (required, from predefined or custom)
- Packed status (boolean, default: false)

---

## Section 8: Notes

**Purpose**: Freeform space for trip notes, tips, reminders, and general information.

### Features
- **Multiple notes**: Support for multiple named notes (not just one text area)
  - "General Tips"
  - "Apps to Download"
  - "Useful Phrases"
  - "Emergency Contacts"
  - etc.
- **Note cards**: Each note displayed as a card with title and content preview
- **Create note**: "+ New Note" button, prompts for a title
- **Edit note**: Click a note card to edit
  - Title field
  - Content area (plain text with line breaks for MVP)
  - Delete button
- **Note ordering**: Notes displayed in creation order. Drag to reorder (stretch goal).

### Note fields
- Title (required)
- Content (free text, multi-line)
- Created timestamp

---

## Section 9: History

**Purpose**: See every change you've made to the trip plan. Undo mistakes. Revert to previous states.

### Features
- **Change log**: Chronological list of all changes, most recent first
  - Grouped by day ("TODAY", "YESTERDAY", "March 28")
  - Each entry shows:
    - Timestamp (e.g., "2:45 PM")
    - Human-readable description (e.g., "Added Ichiran Ramen to Ramen Spots")
    - Revert button
- **Undo/redo**:
  - Ctrl/Cmd + Z: undo last change (works globally, from any section)
  - Ctrl/Cmd + Shift + Z: redo
  - Also available as a button in the History header
- **Revert to point**: Click "Revert" on any entry to undo all changes up to and including that entry
  - Confirmation dialog before reverting: "This will undo X changes. Continue?"
- **Change descriptions**: Auto-generated from the action performed:
  - "Added [item name] to [section/list]"
  - "Removed [item name] from [section/list]"
  - "Updated [field] of [item name]"
  - "Moved [item name] from Day X to Day Y"
  - "Reordered items in Day X"
  - "Created list [list name]"
  - "Checked [item name] in Packing List"
- **Toast notifications**: When undo/redo happens from keyboard shortcut, show a brief toast: "Undid: Added Ichiran Ramen"

---

## Global Features

### JSON Export
- Available from sidebar utility section
- Exports the entire trip as a single `.json` file
- Includes: trip metadata, all places, accommodations, reservations, custom lists, packing items, notes, day notes, itinerary assignments
- File named: `{trip-name}-{date}.json` (e.g., "japan-2026-2026-03-29.json")
- Clean, well-structured, human-readable JSON with comments/descriptions for each field type

### JSON Import
- Available from sidebar utility section
- File picker to select a `.json` file
- Validates the JSON structure before importing
- Confirmation dialog: "This will replace your current trip data. Continue?"
- On success, hydrates the entire app state from the JSON
- On validation failure, shows what's wrong

### Keyboard Shortcuts
- `Ctrl/Cmd + Z`: Undo
- `Ctrl/Cmd + Shift + Z`: Redo
- `Ctrl/Cmd + N`: Add new item (contextual to current section)
- `Escape`: Close modal
- Future: More shortcuts as the app matures

### Search (Stretch Goal)
- Global search bar (in sidebar or header)
- Searches across all places, accommodations, reservations, notes by name and content
- Results grouped by section
- Click result → navigates to that section and opens the item

---

## Feature Priority Matrix

### Must Have (MVP)
| Feature | Section |
|---------|---------|
| Sidebar navigation | Global |
| Trip creation with dates | Setup |
| Day-by-day itinerary view | Itinerary |
| Activity cards with drag & drop | Itinerary |
| Unassigned ideas bucket | Itinerary |
| Add/edit/delete places | Places |
| Custom lists | Places |
| Place cards with all fields | Places |
| Add/edit/delete accommodations | Accommodations |
| Add/edit/delete reservations | Reservations |
| Reservation category filters | Reservations |
| Interactive map with markers | Map |
| Map filter by category/list/day | Map |
| Packing list with categories | Packing |
| Checklist functionality | Packing |
| Multiple named notes | Notes |
| JSON export | Global |
| JSON import | Global |
| Undo/redo (Ctrl+Z) | Global |
| Change log | History |
| Modal editing for all items | Global |
| Overview dashboard | Overview |

### Should Have (Post-MVP Polish)
| Feature | Section |
|---------|---------|
| Revert to any point in history | History |
| Toast notifications for undo | History |
| Copy confirmation number | Accommodations |
| Geocoding (address → coordinates) | Places |
| Marker clustering on map | Map |
| Drag to reorder packing items | Packing |
| Global search | Global |
| Keyboard shortcuts beyond undo | Global |
| Responsive mobile layout | Global |
| PWA for offline mobile access | Global |

### Nice to Have (Future)
| Feature | Section |
|---------|---------|
| Photo attachments on places | Places |
| Rich text notes | Notes |
| Tags/custom fields on places | Places |
| Weather forecast per day | Itinerary |
| Transit time between places | Itinerary |
| Budget/expense tracking | New section |
| Collaborative editing | Global |
| AI itinerary suggestions | Global |
| MCP server for AI integration | Global |
| Multi-trip support | Global |
