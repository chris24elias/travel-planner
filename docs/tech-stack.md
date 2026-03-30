# Tech Stack

## Overview

Every technology choice is made with three priorities:
1. **Speed of development** — we have 13 days to ship something usable
2. **React Native migration path** — patterns and libraries that transfer to RN
3. **Simplicity** — fewer dependencies, fewer moving parts, fewer things to break

---

## Core Framework

### React 19 + Vite

**What**: React for the UI library, Vite for the build tool.

**Why React (not Next.js, not Svelte, not Vue)**:
- Direct migration path to React Native — same component model, same hooks, same mental model
- Largest ecosystem of compatible libraries
- Chris has frontend experience and React knowledge transfers broadly

**Why Vite (not Create React App, not Next.js, not Webpack)**:
- Fastest dev server startup and HMR (Hot Module Replacement)
- Zero-config for a React + TypeScript project
- No server-side rendering complexity — this is a purely client-side app
- Simpler than Next.js — no routing framework, no API routes, no server components
- The app has no SEO needs (it's a personal tool), so SSR is unnecessary

**Why not Next.js**:
- Adds SSR/SSG complexity we don't need
- Opinionated routing that doesn't map to React Native
- Server components are not relevant for a local-first app
- Would make migration to React Native harder, not easier

**Why plain React (not Expo for web from day 1)**:
- Expo for web is viable but adds overhead and constraints
- Plain React + Vite is the fastest path to a working web app
- Can always wrap the React Native version for web later via Expo
- Better dev tooling and Tailwind support in plain React

---

## Language

### TypeScript

**Why**: Type safety for the data model is critical. The app has complex nested data structures (trips containing places, lists, reservations, etc.) and TypeScript catches shape mismatches at compile time. Also makes the JSON export/import schema self-documenting.

**Config**: Strict mode enabled. No `any` types allowed in the data layer.

---

## Styling

### Tailwind CSS v4

**Why Tailwind (not CSS Modules, not styled-components, not Emotion)**:
- Fastest way to build UIs — no context switching between files
- Utility-first approach is perfect for rapid prototyping
- Easy to customize with the design system (colors, fonts, spacing)
- Dark mode support built-in (`dark:` prefix)
- No runtime CSS-in-JS overhead

**Migration note**: Tailwind doesn't transfer to React Native directly, but:
- The design system values (colors, spacing, fonts) transfer as design tokens
- NativeWind exists as a Tailwind-for-RN solution
- StyleSheet.create in RN uses the same property names as CSS in most cases

**Custom configuration**:
- Extend the default theme with the warm color palette
- Add DM Sans as the default font family
- Custom shadow values for the warm card style

---

## State Management

### Zustand + Immer

**Why Zustand (not Redux, not Context API, not Jotai, not MobX)**:
- Minimal boilerplate — a store is just a function
- No providers needed (unlike Context or Redux)
- Works identically in React Native — zero changes needed
- Built-in Immer middleware for immutable updates with mutable syntax
- Built-in persist middleware for automatic storage sync
- Tiny bundle size (~1KB)

**Why Immer**:
- Enables the **history/undo system** — Immer produces patches on every state change
- Patches are invertible — can undo by applying inverse patches
- Makes complex nested state updates readable (mutative syntax, immutable under the hood)

**Store structure**:
```
tripStore     — Trip CRUD, the main data store
  ├── trip data (places, accommodations, reservations, lists, notes, packing)
  ├── CRUD actions for each entity type
  └── JSON export/import functions

historyStore  — Undo/redo and change log
  ├── patch stack (for undo/redo)
  ├── change log entries (human-readable)
  └── undo(), redo(), revertTo() actions

uiStore       — UI-only state
  ├── active section (overview, itinerary, etc.)
  ├── selected item IDs
  ├── modal state (open/closed, which item)
  ├── active filters
  └── sidebar state
```

---

## Data Storage

### Dexie.js (IndexedDB wrapper)

**Why Dexie (not localStorage, not raw IndexedDB, not SQLite/WASM)**:
- IndexedDB handles large datasets and blobs (future photo storage)
- Dexie provides a clean Promise-based API over the ugly IndexedDB API
- Schema versioning and migrations built-in
- Supports compound indexes for efficient queries
- Works offline by default — it's a browser-native database
- ~15KB gzipped

**Why not localStorage**:
- 5MB limit — too small for a trip with photos
- Synchronous API — blocks the main thread
- No indexing or querying capability

**Why not SQLite/WASM (sql.js, wa-sqlite)**:
- Heavier setup (~500KB WASM binary)
- Overkill for this data model — we don't need relational queries
- IndexedDB is native to the browser, no WASM overhead

**Why not just Zustand persist to localStorage**:
- Fine for small data, but we want to support photos/attachments eventually
- IndexedDB is more robust for data integrity
- Can handle larger datasets without hitting limits

**Migration note**: In React Native, swap Dexie for WatermelonDB or Expo SQLite. The store layer abstracts the database, so the swap is contained to one file.

---

## Maps

### Leaflet + React Leaflet

**Why Leaflet (not Google Maps, not Mapbox, not MapLibre)**:
- **Completely free** — no API key, no billing, no usage limits
- Uses OpenStreetMap tiles (free, open data)
- React Leaflet provides clean React components
- Lightweight (~40KB gzipped)
- Good enough for plotting markers and popups — we don't need 3D terrain or advanced routing

**Why not Google Maps**:
- Requires API key and billing account
- Can get expensive at scale (not relevant for personal use, but adds friction)
- Heavier JavaScript bundle

**Why not Mapbox**:
- Free tier is generous but still requires account and API key
- More complex setup
- Better for custom map styles, which we don't need for MVP

**Migration note**: In React Native, swap React Leaflet for `react-native-maps` (uses native MapKit/Google Maps). The marker data model stays the same.

---

## Drag & Drop

### dnd-kit

**Why dnd-kit (not react-beautiful-dnd, not react-dnd)**:
- `react-beautiful-dnd` is deprecated (maintenance mode since 2022, Atlassian moved on)
- `dnd-kit` is actively maintained, modern, and performant
- Built for accessibility (keyboard drag & drop works out of the box)
- Supports sortable lists and transfer between containers (exactly what the itinerary needs)
- ~12KB gzipped

**Migration note**: In React Native, use `react-native-reanimated` + `react-native-gesture-handler` for drag & drop. The interaction model is different (touch vs mouse), so this component will need rewriting.

---

## Icons

### Lucide React

**Why Lucide (not Heroicons, not FontAwesome, not Material Icons)**:
- Clean, consistent, slightly rounded style that matches the warm design aesthetic
- Tree-shakeable — only bundle the icons you use
- Active open-source project with 1500+ icons
- Each icon is a standalone React component — no font loading

---

## Typography

### DM Sans (Google Fonts)

**Why DM Sans (not Inter, not System UI, not SF Pro)**:
- Warm, friendly, slightly geometric — matches the travel journal vibe
- Excellent readability at all sizes
- Free via Google Fonts
- Has all the weights we need (400 regular, 500 medium, 600 semibold, 700 bold)

**Loading strategy**: Import via `@fontsource/dm-sans` npm package (self-hosted, no external requests).

---

## Date Handling

### date-fns

**Why date-fns (not Moment.js, not Day.js, not Luxon)**:
- Tree-shakeable — import only the functions you use
- Functional API (no mutable date objects like Moment)
- ~2KB per function imported (vs Moment's 70KB)
- Widely used, well-documented

**Key functions we'll use**: `format`, `differenceInDays`, `addDays`, `isWithinInterval`, `parseISO`

---

## ID Generation

### nanoid

**Why nanoid (not UUID, not cuid, not auto-increment)**:
- Shorter IDs than UUID (21 chars vs 36)
- URL-safe characters
- Cryptographically secure
- ~130 bytes — tiny
- No need for sequential IDs since we're not doing server-side DB operations

---

## Build & Deploy

### Vite build → Vercel

**Build**: Vite produces a static bundle (HTML + JS + CSS). No server required.

**Deploy**: Vercel's free tier handles static sites perfectly:
- Push to GitHub → auto-deploy
- HTTPS included
- Global CDN
- Zero configuration for Vite projects

**Alternative**: Netlify, Cloudflare Pages, or even GitHub Pages would work equally well. Any static hosting works.

---

## Development Tools

### ESLint + Prettier

- ESLint for code quality rules
- Prettier for consistent formatting
- Standard React + TypeScript configs

### Package Manager: npm

- Default, no extra setup
- Lock file for reproducible builds
- No need for pnpm/yarn for a project this size

---

## What We're NOT Using (and Why)

| Technology | Why Not |
|-----------|---------|
| Next.js | SSR/SSG overkill, complicates RN migration |
| Redux | Too much boilerplate for this app size |
| GraphQL | No backend/API to query |
| Prisma/Drizzle | No server database |
| Auth (Auth0, Clerk) | No accounts needed — local-first |
| Supabase/Firebase | No backend needed — everything is local |
| React Query/SWR | No server data fetching |
| Framer Motion | Nice but not essential for MVP (CSS transitions suffice) |
| Storybook | Overkill for a solo developer on a 13-day timeline |
| Testing framework | Will add after MVP when patterns stabilize |

---

## Dependency Summary

```json
{
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "zustand": "^5.0.0",
    "immer": "^10.0.0",
    "dexie": "^4.0.0",
    "dexie-react-hooks": "^1.1.0",
    "leaflet": "^1.9.0",
    "react-leaflet": "^5.0.0",
    "@dnd-kit/core": "^6.0.0",
    "@dnd-kit/sortable": "^9.0.0",
    "@dnd-kit/utilities": "^3.0.0",
    "lucide-react": "^0.400.0",
    "@fontsource/dm-sans": "^5.0.0",
    "date-fns": "^4.0.0",
    "nanoid": "^5.0.0"
  },
  "devDependencies": {
    "typescript": "^5.7.0",
    "vite": "^6.0.0",
    "@vitejs/plugin-react": "^4.0.0",
    "tailwindcss": "^4.0.0",
    "@tailwindcss/vite": "^4.0.0",
    "eslint": "^9.0.0",
    "prettier": "^3.0.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "@types/leaflet": "^1.9.0"
  }
}
```

Total production dependency size estimate: ~150KB gzipped (excluding map tiles which load on demand).
