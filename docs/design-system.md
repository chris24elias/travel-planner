# Design System

## Design Philosophy

Warm, inviting, and travel-inspired. The app should feel like opening a beautiful travel journal — not a corporate tool or a spreadsheet. Every visual choice supports this: warm color tones, friendly typography, generous spacing, and subtle shadows that give cards a tactile quality.

---

## Colors

### Base Palette

```
Background
  page-bg:       #FFFBF5    (warm white — the base of everything)
  card-bg:       #FFFFFF    (pure white — cards sit on the warm background)
  sidebar-bg:    #FAF5EE    (slightly warmer than page-bg)
  modal-backdrop: rgba(0, 0, 0, 0.4)

Text
  heading:       #1C1917    (stone-900 — near black, warm tint)
  body:          #44403C    (stone-700 — readable, warm gray)
  muted:         #A8A29E    (stone-400 — secondary info, timestamps)
  placeholder:   #D6D3D1    (stone-300)

Accent (Primary)
  amber-400:     #FBBF24    (highlights, active states)
  amber-500:     #F59E0B    (primary accent — buttons, active nav)
  amber-600:     #D97706    (hover states)
  orange-500:    #F97316    (secondary accent — used sparingly)

Borders & Dividers
  border-light:  #F5F0EB    (barely visible, card borders)
  border-medium: #E7E0D8    (section dividers)
  border-focus:  #F59E0B    (input focus ring — amber-500)

Status
  success:       #22C55E    (green-500 — packed items, confirmations)
  warning:       #F59E0B    (amber-500 — alerts)
  error:         #EF4444    (red-500 — delete actions, errors)
  info:          #3B82F6    (blue-500 — informational)
```

### Category Colors

Used for map markers, category badges, and itinerary card accents.

```
food:        #22C55E    (green-500)
temple:      #3B82F6    (blue-500)
shopping:    #A855F7    (purple-500)
activity:    #F59E0B    (amber-500)
nightlife:   #EC4899    (pink-500)
nature:      #10B981    (emerald-500)
culture:     #6366F1    (indigo-500)
other:       #6B7280    (gray-500)
```

### Reservation Category Colors

```
dining:      #22C55E    (green-500 — same as food)
transport:   #3B82F6    (blue-500)
activity:    #F59E0B    (amber-500)
```

### Priority Colors

```
must-see:    #F59E0B    (amber-500 — with star icon)
want-to:     #6B7280    (gray-500 — neutral)
if-time:     #D6D3D1    (stone-300 — muted)
```

---

## Typography

### Font Family

**DM Sans** — a geometric sans-serif with slightly rounded terminals. Warm, friendly, and highly readable.

```css
font-family: 'DM Sans', system-ui, -apple-system, sans-serif;
```

Load via `@fontsource/dm-sans` (self-hosted, no external requests).

### Type Scale

```
Display:     32px / 40px line-height / 700 weight    (trip name on overview)
Heading 1:   24px / 32px line-height / 700 weight    (section titles)
Heading 2:   20px / 28px line-height / 600 weight    (day headers, card titles)
Heading 3:   16px / 24px line-height / 600 weight    (sub-headers, stat labels)
Body:        14px / 20px line-height / 400 weight    (default text)
Body Small:  13px / 18px line-height / 400 weight    (secondary info)
Caption:     12px / 16px line-height / 500 weight    (badges, timestamps, labels)
```

### Font Weights

```
Regular:     400    (body text, notes)
Medium:      500    (labels, captions, interactive elements)
Semibold:    600    (sub-headers, card titles, buttons)
Bold:        700    (section titles, trip name)
```

---

## Spacing

Using a 4px base unit. The app uses generous spacing to feel calm and unhurried.

```
Space 1:     4px     (tight — icon-to-text gap)
Space 2:     8px     (compact — between badge elements)
Space 3:     12px    (standard — padding inside badges/chips)
Space 4:     16px    (comfortable — card content padding)
Space 5:     20px    (breathing room — between card fields)
Space 6:     24px    (section spacing — between cards)
Space 8:     32px    (major spacing — between day sections)
Space 10:    40px    (generous — page top padding)
Space 12:    48px    (layout — sidebar section gaps)
```

### Layout Spacing

```
Sidebar width:           240px
Sidebar padding:         16px horizontal, 24px vertical
Content area padding:    32px horizontal, 40px vertical
Card padding:            20px
Card gap (between cards): 16px
Section gap:             32px
Modal width:             480px (max)
Modal padding:           24px
```

---

## Shadows

Warm-toned shadows that give cards a soft, tactile quality. Not harsh or corporate.

```css
shadow-card:     0 1px 3px rgba(120, 100, 80, 0.08), 0 1px 2px rgba(120, 100, 80, 0.06);
shadow-card-hover: 0 4px 12px rgba(120, 100, 80, 0.12), 0 2px 4px rgba(120, 100, 80, 0.08);
shadow-modal:    0 20px 60px rgba(0, 0, 0, 0.15), 0 4px 16px rgba(0, 0, 0, 0.08);
shadow-dropdown: 0 4px 16px rgba(120, 100, 80, 0.12);
```

---

## Border Radius

Consistently rounded — everything feels soft and approachable.

```
radius-sm:    6px     (badges, chips, small elements)
radius-md:    8px     (inputs, buttons)
radius-lg:    12px    (cards)
radius-xl:    16px    (modal, large panels)
radius-full:  9999px  (pills, avatars, circular buttons)
```

---

## Components

### Card

The primary content container. Used for places, accommodations, reservations, notes.

```
Background:     white (#FFFFFF)
Border:         1px solid #F5F0EB (barely visible)
Border radius:  12px
Padding:        20px
Shadow:         shadow-card
Hover shadow:   shadow-card-hover (subtle lift effect)
Transition:     shadow 0.2s ease, transform 0.1s ease
Cursor:         pointer (cards are clickable)
```

### Button

#### Primary Button
```
Background:     amber-500 (#F59E0B)
Text:           white
Font:           14px / 600 weight
Padding:        10px 20px
Border radius:  8px
Hover:          amber-600 (#D97706)
Active:         scale(0.98)
```

#### Secondary Button
```
Background:     transparent
Border:         1px solid #E7E0D8
Text:           stone-700 (#44403C)
Hover bg:       #FAF5EE
```

#### Ghost Button
```
Background:     transparent
Text:           stone-600
Hover bg:       #F5F0EB
```

#### Danger Button
```
Background:     transparent
Text:           red-500 (#EF4444)
Hover bg:       red-50 (#FEF2F2)
```

### Input

```
Background:     white
Border:         1px solid #E7E0D8
Border radius:  8px
Padding:        10px 14px
Font:           14px / 400 weight
Focus ring:     2px solid amber-500 (#F59E0B)
Placeholder:    stone-300 (#D6D3D1)
```

### Badge / Chip

Small label used for categories, priorities, tags.

```
Background:     category color at 10% opacity
Text:           category color at full
Font:           12px / 500 weight
Padding:        4px 10px
Border radius:  6px
```

Example: food badge = green-50 bg, green-600 text.

### Modal

```
Overlay:        rgba(0, 0, 0, 0.4) with backdrop blur (2px)
Container:      white, 480px max-width, rounded-xl (16px)
Shadow:         shadow-modal
Padding:        24px
Header:         20px font, 600 weight, bottom border
Footer:         top border, right-aligned buttons
Close button:   top-right, ghost button with X icon
Animation:      fade in overlay + scale up modal (0.95 → 1.0)
```

### Sidebar Navigation Item

```
Default:
  Background:   transparent
  Text:         stone-600
  Padding:      8px 12px
  Border radius: 8px
  Icon:         20px, stone-400

Active:
  Background:   amber-50 (#FFFBEB)
  Text:         amber-700 (#B45309)
  Icon:         amber-500
  Font weight:  600

Hover (not active):
  Background:   #F5F0EB
```

### Category Icon

Each category has a Lucide icon:

```
food:        UtensilsCrossed
temple:      Landmark (or Torii if custom)
shopping:    ShoppingBag
activity:    Ticket
nightlife:   Wine (or Moon)
nature:      Trees
culture:     Palette
other:       MapPin
dining:      UtensilsCrossed
transport:   Train
```

### Priority Indicator

```
must-see:    Star icon (filled, amber-500) + "Must See" text
want-to:     no icon, just text "Want To"
if-time:     Clock icon (stone-300) + "If Time" text (muted)
```

### Stat Card (Overview)

```
Background:     white
Border:         1px solid #F5F0EB
Border radius:  12px
Padding:        20px
Number:         32px / 700 weight / stone-900
Label:          13px / 500 weight / stone-500
Hover:          shadow-card-hover + cursor pointer
```

### Checklist Item (Packing)

```
Unchecked:
  Checkbox:     20px, rounded-md, border stone-300
  Text:         14px, stone-700

Checked:
  Checkbox:     amber-500 bg, white check
  Text:         14px, stone-400, line-through
```

### Toast Notification

```
Background:     stone-900 (#1C1917)
Text:           white
Border radius:  8px
Padding:        12px 16px
Shadow:         shadow-dropdown
Position:       bottom-center, 24px from bottom
Animation:      slide up + fade in, auto-dismiss after 3s
```

---

## Iconography

### Library: Lucide React

Lucide icons are used throughout. Style rules:
- **Size**: 18px for inline icons, 20px for navigation, 24px for section headers
- **Stroke width**: 1.75 (slightly lighter than default 2, feels warmer)
- **Color**: Inherits from text color or uses category color

### Key icons by section

```
Overview:      LayoutDashboard
Itinerary:     CalendarDays
Accommodations: Building2
Reservations:  Ticket
Places:        MapPin
Map:           Map
Packing:       Luggage
Notes:         StickyNote
History:       History
Export:        Download
Import:        Upload
Add:           Plus
Edit:          Pencil
Delete:        Trash2
Close:         X
Search:        Search
Drag handle:   GripVertical
Expand:        ChevronRight
Collapse:      ChevronDown
Check:         Check
```

---

## Animations & Transitions

Keep animations subtle and purposeful. Nothing flashy.

```css
/* Default transition for interactive elements */
transition: all 0.15s ease;

/* Card hover */
transition: box-shadow 0.2s ease, transform 0.1s ease;

/* Modal open */
overlay: opacity 0 → 1, 0.15s ease
modal: scale(0.95) → scale(1), opacity 0 → 1, 0.15s ease

/* Sidebar section switch */
content area: opacity crossfade, 0.1s ease

/* Toast */
enter: translateY(20px) → translateY(0), opacity 0 → 1, 0.2s ease
exit: opacity 1 → 0, 0.15s ease

/* Drag & drop */
dragging item: scale(1.02), shadow-card-hover, slight rotation (1deg)
drop zones: amber-50 background highlight
```

---

## Responsive Breakpoints

```
Mobile:      < 768px    (sidebar collapses to hamburger)
Tablet:      768-1024px (sidebar shows icons only)
Desktop:     > 1024px   (full sidebar + content)
Wide:        > 1440px   (content area gets max-width constraint)
```

### Content max-width

On very wide screens (> 1440px), the content area centers with a max-width of 960px to keep readability optimal. The map section ignores this and always goes full-width.

---

## Dark Mode (Future)

Not in MVP, but the design system is structured to support it:
- All colors are defined as CSS variables
- Swap the palette:
  - page-bg → stone-950
  - card-bg → stone-900
  - text → stone-100 / stone-300
  - borders → stone-700 / stone-800
  - accent stays amber-500
- Tailwind's `dark:` prefix handles the toggle
