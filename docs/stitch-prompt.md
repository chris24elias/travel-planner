# Google Stitch Prompt

## Instructions

Use this prompt in Google Stitch (stitch.withgoogle.com) to generate the full app design and DESIGN.md.

**Strategy:**
1. Paste the main prompt below to generate the full app design (up to 5 screens)
2. Ask Stitch to generate the DESIGN.md from the result
3. Iterate 2-3 times on specific screens
4. Export: DESIGN.md + Figma + React/Tailwind code

---

## Main Prompt

```
Design a personal travel planning desktop web app called "Tabi" (Japanese for "journey"). This is a section-based planning tool with a fixed sidebar and full-width content area — NOT a map-first app. Think of it as a beautiful, warm travel journal meets Notion-style workspace.

DESIGN INSPIRATION:
Inspired by Arc browser's design language — warm, soft, macOS-native feel with personality. Use these Arc-inspired principles:
- Soft, muted-but-rich colors with warm undertones (not flat corporate blues/grays)
- Generous negative space and minimal visual chrome — let content breathe
- Frosted glass / vibrancy effects on the sidebar (subtle background blur)
- Soft, generous border radius on everything (cards, buttons, inputs, modals)
- Subtle warm shadows that feel tactile, not harsh
- Smooth, purposeful micro-animations (hover lifts, transitions between views)
- macOS-native feel: think SF-like system integration, spotlight-style interactions

But give it its OWN identity — this is a travel app, so it should feel:
- Warm and inviting, like a beautifully crafted travel journal
- Earthy warm tones: warm whites, ambers, soft oranges, stone grays
- Typography: DM Sans for a friendly, geometric warmth (not cold/techie)
- Playful but organized — you're planning an adventure, it should feel exciting

COLOR DIRECTION:
- Page background: warm off-white (like #FFFBF5 or similar)
- Sidebar: slightly warmer tint with subtle frosted glass/blur effect
- Primary accent: amber/warm orange range
- Cards: pure white with warm-toned soft shadows
- Text: warm stone/brown-gray tones (not pure black or cool gray)
- Category colors for organizing: soft green (food), blue (temples), purple (shopping), amber (activities), pink (nightlife), emerald (nature), indigo (culture)

APP LAYOUT:
Fixed left sidebar (240px) + full-width scrollable content area on the right.

SIDEBAR CONTAINS:
- Trip header at top: "Japan 2026" with dates "Apr 12 — Apr 22" and a warm countdown badge "13 days to go!"
- Navigation links with icons (use rounded/friendly icon style):
  • Overview (dashboard icon)
  • Itinerary (calendar icon)
  • Accommodations (building icon)
  • Reservations (ticket icon)
  • Places (map pin icon) — with expandable sub-items: "Ramen Spots", "Coffee Shops", "Temples", "Shopping"
  • Map (map icon)
  • Packing List (luggage icon)
  • Notes (sticky note icon)
- Bottom utility section with divider:
  • History (undo icon)
  • Export JSON (download icon)
  • Import JSON (upload icon)
- Active nav item has a warm amber/orange highlight with subtle background fill

GENERATE THESE 5 SCREENS:

SCREEN 1 — OVERVIEW (the landing dashboard):
- Large trip title "Japan 2026" with destination and date range
- Warm, friendly countdown: "13 days to go!" (maybe with a small plane or sun icon)
- 4 stat cards in a row: "24 places saved", "8 reservations", "6/11 days planned", "4 lists"
- "Upcoming" section below with a timeline-style list:
  - Apr 12: Hotel Gracery Shinjuku (check-in) with building icon
  - Apr 12: Sushi Dai 7:00 PM (dining) with utensils icon
  - Apr 14: Shinkansen Tokyo→Kyoto 10:15 AM (transport) with train icon
- Quick action buttons at bottom: "+ Add Place", "+ Add Reservation", "+ Note"

SCREEN 2 — ITINERARY (card-based day planner):
- A collapsible "Unassigned Ideas (3)" section at top with small chips
- Day sections with headers: "Day 1 — Saturday, April 12 · Tokyo"
- Activity cards within each day showing:
  - Time (9:00 AM), place name (Tsukiji Outer Market)
  - Category badge (food, with green tint), area label (Chuo)
  - One-line note preview in lighter text
  - Subtle drag handle on the left edge
- Each card has warm rounded corners, slight shadow, hover lift effect
- Day notes section at bottom of each day (collapsible, lighter styling)
- "+ Add to this day" button after the last card

SCREEN 3 — PLACES (custom lists with place cards):
- Horizontal tab bar at top: "All Places", "Ramen Spots", "Coffee Shops", "Temples", "Shopping", "+ New List"
- Active tab has amber underline/highlight
- Grid or list of place cards showing:
  - Place name prominently: "Ichiran Ramen"
  - Category badge (green "food"), area ("Shibuya"), priority star badge ("Must See" in amber)
  - 2-line note preview
  - Small link icon and "Day 2" assignment badge
- Cards should feel like beautiful index cards — warm white, soft shadow, generous padding

SCREEN 4 — RESERVATIONS (categorized list):
- Filter bar at top: "All", "Dining", "Transport", "Activity" with pill-style toggle buttons
- Reservations grouped under date headers: "APRIL 12", "APRIL 14"
- Reservation cards with:
  - Category icon (fork/knife, train, ticket) with subtle color coding
  - Name, time, confirmation number
  - Brief note line
- Clean, scannable layout — this is reference information you check quickly

SCREEN 5 — EDIT MODAL (centered dialog for editing a place):
- Centered modal with subtle backdrop blur
- Warm white background, generous padding, soft rounded corners (16px)
- Title: "Edit Place"
- Form fields with warm-styled inputs (amber focus rings):
  - Name input
  - Category dropdown
  - Priority dropdown
  - Area/neighborhood text input
  - Address input
  - Notes textarea (taller)
  - Links section (with + button to add more)
  - Lists multi-select (showing current lists as removable tags)
  - Day assignment dropdown
  - Time slot input
- Footer: red "Delete" text button on left, amber "Save" button on right
- Close X button in top-right corner

OVERALL FEEL:
The app should feel like something a design-conscious traveler would love to use — warm, calming, organized, and beautiful. Not clinical. Not corporate. It should make planning a trip to Japan feel like part of the adventure. Think: the care of a handwritten travel journal, the organization of Notion, the visual warmth of Arc browser, the polish of a great macOS app.
```

---

## Follow-Up Prompts

After the initial generation, use these follow-up prompts to refine:

### Generate DESIGN.md
```
Generate a DESIGN.md file from this design. Include: complete color system (with hex values for all colors including category colors), typography scale (using DM Sans), spacing system (4px base), border radius values, shadow definitions, and component styles for cards, buttons, inputs, badges, modals, sidebar nav items, and toast notifications.
```

### Refine the sidebar
```
Make the sidebar feel more Arc-like: add a subtle frosted glass / background blur effect. The nav items should have more generous padding and rounder hover states. The trip header at top should feel special — maybe slightly larger text with a warm gradient accent on the countdown badge.
```

### Refine the cards
```
The place cards and activity cards should feel more tactile — like beautiful paper cards. Increase the shadow warmth (use warm-toned shadows, not gray). Add a very subtle hover lift animation (translateY -1px + deeper shadow). The category badges should use the category color at low opacity for the background.
```

### Generate Map screen
```
Design the Map screen: a full-width Leaflet-style map taking the entire content area. Add a floating filter bar at the top of the map area with pill buttons: "All", "By Category ▾", "By List ▾", "By Day ▾". When a marker is clicked, show a floating card at the bottom of the map with place name, category, area, and two buttons: "View Details" and "Add to Day ▾". Markers should be colored circles matching the category colors.
```

### Generate Packing List screen
```
Design the Packing List screen: a progress bar at top showing "14/22 packed" with an amber fill. Below, categorized groups (Clothes, Electronics, Documents, Toiletries) with collapsible headers. Each item has a checkbox — checked items show strikethrough and muted styling. The checked checkbox should be amber-filled with a white check. Include an inline text input at the bottom of each category for quick-adding items.
```

### Generate Notes screen
```
Design the Notes screen: a grid of note cards, each with a title ("General Tips", "Apps to Download", "Useful Phrases") and content preview. Cards should feel like warm paper notes. A "+ New Note" card with dashed border at the end. When clicked, a note opens in the modal for editing with a title field and a tall content textarea.
```
