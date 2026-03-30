# UI/UX Design Document

## Design Philosophy

The app follows a **section-based navigation** model, not a "everything on one screen" approach. Each aspect of the trip gets its own focused, full-width view. The user navigates between sections via a persistent sidebar — similar to how Notion or Linear organize workspaces.

**Core principles:**
- **One thing at a time**: When you're working on the itinerary, you see only the itinerary. No distractions.
- **Full-width content**: Every section uses the entire content area. No cramped split views.
- **Modal editing**: Click any card to open a centered modal dialog for editing. Focused, clear open/close.
- **Instant feel**: Everything is local. No loading spinners, no skeleton screens, no "syncing..." indicators.
- **Warm and inviting**: The app should feel like a travel journal, not enterprise software.

---

## Global Layout

```
+------------------+--------------------------------------------------+
|                  |                                                  |
|    SIDEBAR       |              CONTENT AREA                        |
|    (fixed,       |              (full width, scrollable)            |
|     240px)       |                                                  |
|                  |    Changes based on active sidebar section       |
|                  |                                                  |
|                  |                                                  |
|                  |                                                  |
|                  |                                                  |
|                  |                                                  |
|                  |                                                  |
|                  |                                                  |
+------------------+--------------------------------------------------+
```

- **Sidebar**: Fixed on the left, always visible. 240px wide. Contains trip info header and navigation links.
- **Content area**: Takes remaining width. Scrollable. Displays the active section.
- **Modal overlay**: Centered dialog that appears over the content area when editing an item.

---

## Sidebar

The sidebar is the primary navigation element. It stays fixed and visible at all times.

```
+------------------+
|                  |
|   JAPAN 2026     |
|   Apr 12 - 22   |
|   13 days to go  |
|                  |
|   ─────────────  |
|                  |
|  ☀ Overview      |
|  📅 Itinerary    |
|  🏨 Accommodations|
|  🎫 Reservations |
|  📍 Places       |
|     > Ramen      |
|     > Coffee     |
|     > Temples    |
|     > Shopping   |
|     + New List   |
|  🗺 Map          |
|  🧳 Packing List |
|  📝 Notes        |
|                  |
|   ─────────────  |
|                  |
|  ⏪ History      |
|  📤 Export JSON  |
|  📥 Import JSON  |
|                  |
+------------------+
```

**Behavior:**
- Active section is highlighted with accent color background
- Places section is expandable — shows user-created lists as sub-items
- "+ New List" link at bottom of Places sub-menu to create a new collection
- Bottom section has utility actions: History, Export, Import
- Trip header shows name, dates, and countdown
- Sidebar is not collapsible in MVP (always visible)

**Icons**: Lucide icons, slightly rounded style, matching the warm aesthetic.

---

## Section Views

### 1. Overview

The landing page. A glanceable dashboard of the entire trip.

```
+--------------------------------------------------+
|                                                  |
|   JAPAN 2026                                     |
|   April 12 - April 22, 2026                     |
|   ✈ 13 days to go!                              |
|                                                  |
|   +--------+  +--------+  +--------+  +--------+|
|   | 24     |  | 8      |  | 6/11   |  | 4      ||
|   | places |  | reserv.|  | days   |  | lists  ||
|   | saved  |  | booked |  | planned|  | created||
|   +--------+  +--------+  +--------+  +--------+|
|                                                  |
|   UPCOMING                                       |
|   ─────────────────────────────────────────────  |
|                                                  |
|   Apr 12  🏨  Check-in: Hotel Gracery Shinjuku   |
|   Apr 12  🍽  Sushi Dai                7:00 PM   |
|   Apr 14  🚄  Shinkansen Tokyo→Kyoto   10:15 AM  |
|   Apr 14  🏨  Check-in: Kyoto Granbell           |
|   Apr 15  🎫  Fushimi Inari tour       9:00 AM   |
|                                                  |
|   QUICK ACTIONS                                  |
|   ─────────────────────────────────────────────  |
|                                                  |
|   [+ Add Place]  [+ Add Reservation]  [+ Note]  |
|                                                  |
+--------------------------------------------------+
```

**Details:**
- **Stat cards**: 4 cards showing key counts. Click any card to navigate to that section.
- **Upcoming**: Chronological list of the next 5-10 upcoming items across accommodations and reservations. Shows icon by type, name, date, and time if applicable.
- **Quick actions**: Buttons to quickly add common items without navigating away.
- **Countdown**: Dynamic "X days to go!" based on trip start date.

---

### 2. Itinerary

Card-based day-by-day planner. The heart of the app.

```
+--------------------------------------------------+
|   ITINERARY                          [+ Add Day] |
|                                                  |
|   ┌─ UNASSIGNED IDEAS (3) ──────────────────┐   |
|   │                                          │   |
|   │  [Akihabara] [Don Quijote] [Meiji Shrine]│  |
|   │  (small chips, draggable)                │   |
|   └──────────────────────────────────────────┘   |
|                                                  |
|   DAY 1 — Saturday, April 12                     |
|   Tokyo                                          |
|   ┌──────────────────────────────────────────┐   |
|   │  ☀ 9:00 AM                               │   |
|   │  Tsukiji Outer Market                    │   |
|   │  🍽 food  ·  Chuo                        │   |
|   │  "Get there early, best before 10am"     │   |
|   └──────────────────────────────────────────┘   |
|   ┌──────────────────────────────────────────┐   |
|   │  ☀ 10:30 AM                              │   |
|   │  Senso-ji Temple                         │   |
|   │  ⛩ temple  ·  Asakusa                   │   |
|   │  "Don't miss the side streets"           │   |
|   └──────────────────────────────────────────┘   |
|   ┌──────────────────────────────────────────┐   |
|   │  🌙 7:00 PM                              │   |
|   │  Sushi Dai                               │   |
|   │  🍽 food  ·  Tsukiji  ·  RESERVED       │   |
|   └──────────────────────────────────────────┘   |
|                                                  |
|   📝 Day note: "First full day. Take it easy,    |
|   recover from jet lag. Stay near Asakusa area." |
|                                                  |
|   [+ Add to this day]                            |
|                                                  |
|   ─────────────────────────────────────────────  |
|                                                  |
|   DAY 2 — Sunday, April 13                       |
|   Tokyo                                          |
|   ...                                            |
+--------------------------------------------------+
```

**Details:**
- **Unassigned Ideas**: Collapsible section at the top showing places not yet assigned to a day. Displayed as small chips. Draggable into day sections.
- **Day sections**: Each day gets a header with day number, date, and day of week. Optional city/area label.
- **Activity cards**: Show time (optional), place name, category with icon, area/neighborhood, short note preview. Draggable to reorder or move between days.
- **Day notes**: Collapsible text area at the bottom of each day for general notes about that day.
- **Add button**: "+ Add to this day" at the bottom of each day section.
- **Drag & drop**: Cards are draggable within a day (reorder), between days (reschedule), or back to unassigned.
- **Reserved indicator**: If a place has a matching reservation, show "RESERVED" badge.
- **Time-of-day icons**: Morning sun, afternoon, evening moon icons based on time slot.

**Interactions:**
- Click a card → opens edit modal with full place details
- Drag a card → reorder or move between days
- Click "+ Add to this day" → opens a picker to select from existing places or create new
- Click day note area → inline edit

---

### 3. Accommodations

Simple chronological list of stays.

```
+--------------------------------------------------+
|   ACCOMMODATIONS                   [+ Add Stay]  |
|                                                  |
|   ┌──────────────────────────────────────────┐   |
|   │  🏨 Hotel Gracery Shinjuku               │   |
|   │                                          │   |
|   │  Check-in:   Apr 12, 2026               │   |
|   │  Check-out:  Apr 14, 2026  (2 nights)   │   |
|   │  Address:    1-17-1 Kabukicho, Shinjuku  │   |
|   │  Conf #:     HG-28419                    │   |
|   │                                          │   |
|   │  📝 "Right next to Godzilla head.        │   |
|   │  Walking distance to Golden Gai."        │   |
|   │                                          │   |
|   │  🔗 booking.com/...                      │   |
|   └──────────────────────────────────────────┘   |
|                                                  |
|   ┌──────────────────────────────────────────┐   |
|   │  🏨 Kyoto Granbell Hotel                 │   |
|   │                                          │   |
|   │  Check-in:   Apr 14, 2026               │   |
|   │  Check-out:  Apr 17, 2026  (3 nights)   │   |
|   │  Address:    ...                         │   |
|   │  Conf #:     KG-55102                    │   |
|   └──────────────────────────────────────────┘   |
|                                                  |
+--------------------------------------------------+
```

**Details:**
- Cards sorted by check-in date
- Duration calculated automatically ("2 nights")
- Confirmation number prominently displayed
- Notes for personal tips/directions
- Link to booking page
- Click card → edit modal

---

### 4. Reservations

Categorized, filterable list.

```
+--------------------------------------------------+
|   RESERVATIONS                [+ Add Reservation] |
|                                                  |
|   Filter: [All] [🍽 Dining] [🚄 Transport] [🎫 Activity]|
|                                                  |
|   APRIL 12                                       |
|   ┌──────────────────────────────────────────┐   |
|   │  🍽  Sushi Dai                            │   |
|   │  7:00 PM  ·  Conf: #SD-2841             │   |
|   │  📝 "Ask for the omakase set"            │   |
|   └──────────────────────────────────────────┘   |
|                                                  |
|   APRIL 14                                       |
|   ┌──────────────────────────────────────────┐   |
|   │  🚄  Shinkansen Tokyo → Kyoto            │   |
|   │  10:15 AM  ·  Car 7, Seat 14A           │   |
|   │  Conf: #JR-E28419                        │   |
|   └──────────────────────────────────────────┘   |
|                                                  |
|   APRIL 15                                       |
|   ┌──────────────────────────────────────────┐   |
|   │  🎫  Fushimi Inari Guided Tour           │   |
|   │  9:00 AM  ·  Conf: #FI-1120             │   |
|   │  📝 "Meet at main torii gate"            │   |
|   └──────────────────────────────────────────┘   |
|                                                  |
+--------------------------------------------------+
```

**Details:**
- **Filter bar**: Toggle between All, Dining, Transport, Activity. Active filter highlighted.
- **Grouped by date**: Reservations grouped under date headers.
- **Category icons**: Each reservation type has its own icon and subtle color coding.
- **Compact cards**: Name, time, confirmation number, and brief note.
- Click card → edit modal with all details.

---

### 5. Places

Custom collection/list system. This is where all "places to visit" live, organized into user-created lists.

```
+--------------------------------------------------+
|   PLACES                          [+ New List]   |
|                                                  |
|   Showing: Ramen Spots (6 places)                |
|   [All Places ▾]  [Ramen Spots] [Coffee] [Temples]|
|                                                  |
|   ┌──────────────────────────────────────────┐   |
|   │  ⭐ Ichiran Ramen                        │   |
|   │  🍽 food  ·  Shibuya  ·  must-see       │   |
|   │                                          │   |
|   │  "Famous for solo dining booths.         │   |
|   │  Try the extra-rich broth option."       │   |
|   │                                          │   |
|   │  🔗 ichiran.com  ·  📅 Day 2            │   |
|   └──────────────────────────────────────────┘   |
|                                                  |
|   ┌──────────────────────────────────────────┐   |
|   │  Fuunji                                  │   |
|   │  🍽 food  ·  Shinjuku  ·  want-to       │   |
|   │                                          │   |
|   │  "Tsukemen specialist. Long lines but    │   |
|   │  worth it. Near south exit."             │   |
|   └──────────────────────────────────────────┘   |
|                                                  |
|   [+ Add Place to "Ramen Spots"]                 |
|                                                  |
+--------------------------------------------------+
```

**Details:**
- **List tabs**: Horizontal tabs to switch between lists. "All Places" shows everything.
- **Place cards**: Name, category, area, priority badge (must-see = star), notes preview, links, day assignment if any.
- **Priority badges**: "must-see" gets a star and accent color. "want-to" is neutral. "if-time" is muted.
- **Day reference**: If a place is assigned to a day, show "Day 2" badge.
- **Add button**: Contextual to the current list.
- Click card → edit modal.

---

### 6. Map

Full-screen interactive map with all saved places.

```
+--------------------------------------------------+
|   MAP                                            |
|                                                  |
|   Filter: [All ▾]  [By List ▾]  [By Day ▾]      |
|                                                  |
|   +----------------------------------------------+
|   |                                              |
|   |          🔴 Fushimi Inari                    |
|   |                                              |
|   |    KYOTO                                     |
|   |          🟠 Kinkaku-ji                       |
|   |                                              |
|   |                                              |
|   |                              TOKYO           |
|   |                        🔵 Senso-ji           |
|   |                    🟢 Ichiran  🔵 Akihabara  |
|   |                        🟢 Tsukiji            |
|   |                    🟡 Shibuya Sky             |
|   |                                              |
|   +----------------------------------------------+
|                                                  |
|   ┌─ Selected: Ichiran Ramen ──────────────┐     |
|   │  🍽 food  ·  Shibuya  ·  must-see     │     |
|   │  "Famous for solo dining booths."      │     |
|   │  [View Details]  [Add to Day ▾]        │     |
|   └────────────────────────────────────────┘     |
|                                                  |
+--------------------------------------------------+
```

**Details:**
- **Filter bar**: Filter markers by category, by custom list, or by day.
- **Color-coded markers**: Each category gets a color (food = green, temple = blue, shopping = purple, activity = yellow, etc.).
- **Click marker**: Shows a popup card at the bottom with place summary and quick actions.
- **Quick actions in popup**: "View Details" opens the full edit modal. "Add to Day" dropdown to assign to a specific day.
- **Zoom**: Map shows all markers with auto-fit bounds. User can zoom/pan freely.

---

### 7. Packing List

Simple categorized checklist.

```
+--------------------------------------------------+
|   PACKING LIST                    [+ Add Item]   |
|                                                  |
|   Progress: ████████░░░░ 14/22 packed            |
|                                                  |
|   CLOTHES                                        |
|   ☑ T-shirts (5)                                 |
|   ☑ Jeans (2)                                    |
|   ☐ Rain jacket                                  |
|   ☐ Comfortable walking shoes                    |
|                                                  |
|   ELECTRONICS                                    |
|   ☑ Phone charger                                |
|   ☑ Power adapter (Japan Type A)                 |
|   ☐ Portable battery                             |
|   ☐ Camera                                       |
|                                                  |
|   DOCUMENTS                                      |
|   ☑ Passport                                     |
|   ☐ Travel insurance printout                    |
|   ☐ Hotel confirmations                          |
|                                                  |
|   TOILETRIES                                     |
|   ☐ Sunscreen                                    |
|   ☐ Medications                                  |
|                                                  |
+--------------------------------------------------+
```

**Details:**
- **Progress bar**: Visual indicator of how many items are packed.
- **Categories**: User-defined groups (clothes, electronics, documents, toiletries, etc.).
- **Checkboxes**: Click to toggle packed/unpacked. Checked items get muted styling.
- **Inline add**: Quick add within a category.
- **Reorder**: Drag items between categories or reorder within.

---

### 8. Notes

Freeform trip notes area.

```
+--------------------------------------------------+
|   NOTES                           [+ New Note]   |
|                                                  |
|   ┌──────────────────────────────────────────┐   |
|   │  📝 General Tips                         │   |
|   │                                          │   |
|   │  - Cash is still king in many places     │   |
|   │  - 7-Eleven ATMs accept foreign cards    │   |
|   │  - Download Google Translate offline     │   |
|   │  - Get a Suica card at the airport       │   |
|   │  - Trash cans are rare, carry a bag      │   |
|   │  - Shoes off when entering homes/temples │   |
|   └──────────────────────────────────────────┘   |
|                                                  |
|   ┌──────────────────────────────────────────┐   |
|   │  📝 Apps to Download                     │   |
|   │                                          │   |
|   │  - Google Maps (offline maps for Tokyo)  │   |
|   │  - Navitime for Japan transit            │   |
|   │  - Tabelog for restaurant reviews        │   |
|   │  - PayPay (mobile payments)              │   |
|   └──────────────────────────────────────────┘   |
|                                                  |
|   ┌──────────────────────────────────────────┐   |
|   │  📝 Useful Phrases                       │   |
|   │                                          │   |
|   │  - Sumimasen (excuse me / sorry)         │   |
|   │  - Arigatou gozaimasu (thank you)        │   |
|   │  - Ikura desu ka? (how much?)            │   |
|   └──────────────────────────────────────────┘   |
|                                                  |
+--------------------------------------------------+
```

**Details:**
- **Multiple notes**: Support multiple named notes, not just one text area.
- **Note cards**: Each note has a title and content area.
- **Simple text editing**: Plain text with line breaks for MVP. Rich text can come later.
- **Click to edit**: Click a note card to edit inline or in modal.
- **Add button**: Creates a new note with a title prompt.

---

### 9. History

Change log with undo/revert capability.

```
+--------------------------------------------------+
|   HISTORY                          [Undo (⌘Z)]   |
|                                                  |
|   TODAY                                          |
|   ┌──────────────────────────────────────────┐   |
|   │  2:45 PM  Added "Ichiran Ramen" to       │   |
|   │           Ramen Spots                     │   |
|   │                                  [Revert] │   |
|   └──────────────────────────────────────────┘   |
|   ┌──────────────────────────────────────────┐   |
|   │  2:42 PM  Moved "Senso-ji" from Day 1    │   |
|   │           to Day 3                        │   |
|   │                                  [Revert] │   |
|   └──────────────────────────────────────────┘   |
|   ┌──────────────────────────────────────────┐   |
|   │  2:38 PM  Created list "Coffee Shops"    │   |
|   │                                  [Revert] │   |
|   └──────────────────────────────────────────┘   |
|   ┌──────────────────────────────────────────┐   |
|   │  2:30 PM  Added accommodation            │   |
|   │           "Hotel Gracery Shinjuku"        │   |
|   │                                  [Revert] │   |
|   └──────────────────────────────────────────┘   |
|                                                  |
|   YESTERDAY                                      |
|   ...                                            |
|                                                  |
+--------------------------------------------------+
```

**Details:**
- **Chronological log**: Most recent changes at the top, grouped by day.
- **Human-readable descriptions**: Each entry describes what changed in plain English.
- **Revert button**: Click to undo everything up to and including that change.
- **Undo shortcut**: Ctrl+Z / Cmd+Z works globally to undo the last change.
- **Redo**: Ctrl+Shift+Z / Cmd+Shift+Z to redo.

---

## Modal Dialog

Used for editing any item (place, accommodation, reservation, packing item, note).

```
+--------------------------------------------------+
|                                                  |
|       ┌────────────────────────────────┐         |
|       │  Edit Place                 ✕  │         |
|       │                                │         |
|       │  Name: [Ichiran Ramen        ] │         |
|       │                                │         |
|       │  Category: [🍽 Food    ▾]      │         |
|       │  Priority: [⭐ Must-see ▾]     │         |
|       │  Area:     [Shibuya          ] │         |
|       │                                │         |
|       │  Address:                      │         |
|       │  [1-22-7 Jinnan, Shibuya     ] │         |
|       │                                │         |
|       │  Notes:                        │         |
|       │  ┌────────────────────────┐    │         |
|       │  │ Famous for solo dining │    │         |
|       │  │ booths. Try the extra  │    │         |
|       │  │ rich broth option.     │    │         |
|       │  └────────────────────────┘    │         |
|       │                                │         |
|       │  Links:                        │         |
|       │  [https://ichiran.com    ] [+] │         |
|       │                                │         |
|       │  Lists: [Ramen Spots ✕] [+]   │         |
|       │  Day:   [Day 2 ▾]             │         |
|       │  Time:  [1:00 PM             ] │         |
|       │                                │         |
|       │  [Delete]          [Save]      │         |
|       └────────────────────────────────┘         |
|                                                  |
+--------------------------------------------------+
```

**Details:**
- **Centered overlay**: Dark backdrop, white modal, rounded corners.
- **Close button**: X in top-right corner. Also closes on Escape key or backdrop click.
- **Form fields**: Clean, labeled inputs. Dropdowns for category, priority, day assignment.
- **Multi-value fields**: Links and lists support multiple values with add/remove.
- **Delete button**: Bottom-left, styled as destructive (red text, not prominent).
- **Save button**: Bottom-right, accent-colored, prominent.
- **Auto-save consideration**: For MVP, explicit Save button. Could add auto-save later.

---

## Interaction Patterns

### Adding Items
1. Click "+ Add" button in any section → opens empty modal
2. Fill in details → click Save
3. Item appears in the list immediately

### Editing Items
1. Click any card → opens pre-filled modal
2. Make changes → click Save
3. Card updates immediately

### Drag & Drop (Itinerary)
1. Grab a card by its drag handle
2. Drag to new position within day, to another day, or to/from unassigned
3. Drop → card moves, order updates, change logged in history

### Filtering (Map, Reservations, Places)
1. Click filter button/tab
2. Content updates immediately
3. Active filter visually highlighted

### Undo
1. Ctrl/Cmd + Z anywhere → last change undone
2. Or navigate to History section → click Revert on any entry
3. Visual feedback: brief toast notification "Undid: Added Ichiran Ramen"

---

## Responsive Behavior (MVP)

The app is primarily designed for desktop/laptop screens (1024px+). For MVP:
- **< 768px**: Sidebar collapses to a hamburger menu icon. Content takes full width.
- **768-1024px**: Sidebar narrows to icons only (no labels). Content takes remaining width.
- **1024px+**: Full sidebar with labels + full content area.

The map section should work well on any screen size since Leaflet is responsive by default.

---

## Navigation Flow

```
App opens
  └─→ Overview (default landing page)
       ├─→ Click stat card → navigates to that section
       ├─→ Click upcoming item → opens edit modal for that item
       └─→ Click quick action → opens add modal for that type

Sidebar navigation
  ├─→ Overview
  ├─→ Itinerary
  │    ├─→ Click card → edit modal
  │    ├─→ Drag card → reorder/reschedule
  │    └─→ Click "+ Add" → add modal
  ├─→ Accommodations
  │    ├─→ Click card → edit modal
  │    └─→ Click "+ Add" → add modal
  ├─→ Reservations
  │    ├─→ Click filter tab → filter list
  │    ├─→ Click card → edit modal
  │    └─→ Click "+ Add" → add modal
  ├─→ Places
  │    ├─→ Click list tab → show that list
  │    ├─→ Click card → edit modal
  │    ├─→ Click "+ Add" → add modal
  │    └─→ Click "+ New List" → create list dialog
  ├─→ Map
  │    ├─→ Click marker → show popup card
  │    ├─→ Click filter → filter markers
  │    └─→ Click "View Details" in popup → edit modal
  ├─→ Packing List
  │    ├─→ Click checkbox → toggle packed
  │    └─→ Click "+ Add" → inline add
  ├─→ Notes
  │    ├─→ Click note → edit inline/modal
  │    └─→ Click "+ New Note" → create note
  └─→ History
       ├─→ Click "Revert" → revert to that point
       └─→ Scroll to see full change log
```
