# React Native Migration Plan

## Overview

After the Japan trip, the goal is to migrate the web app to **React Native via Expo** to create a true cross-platform experience: iOS, Android, web, and potentially macOS — all from one codebase.

This document outlines what transfers, what needs rewriting, the migration strategy, and key decisions.

---

## Why React Native + Expo

- **One codebase, multiple platforms**: iOS, Android, web (via Expo Web), and macOS (via Expo + react-native-macos)
- **React knowledge transfers**: Same component model, same hooks, same state management patterns
- **Expo simplifies everything**: No Xcode/Android Studio setup for basic development. OTA updates. Managed build pipeline.
- **Native performance**: React Native renders native UI components, not webviews
- **The React web app proves the concept**: By the time we migrate, we know exactly what the app needs to do and how users interact with it

---

## What Transfers Directly (~40% of code)

These files/modules require **zero or minimal changes**:

### 1. TypeScript Types & Interfaces
```
src/types/index.ts → transfers as-is
```
All entity interfaces (Trip, Place, Accommodation, etc.) are pure TypeScript — no UI dependency.

### 2. Zustand Stores
```
src/stores/tripStore.ts   → transfers as-is
src/stores/uiStore.ts     → transfers as-is
src/stores/historyStore.ts → transfers as-is
```
Zustand works identically in React Native. The stores, actions, and Immer patches don't reference any DOM or web APIs.

### 3. Business Logic & Utilities
```
src/utils/categories.ts   → transfers as-is
src/utils/dates.ts         → transfers as-is (date-fns works in RN)
src/utils/ids.ts           → transfers as-is (nanoid works in RN)
src/utils/validation.ts   → transfers as-is
```

### 4. JSON Export/Import Logic
```
src/utils/exportImport.ts → transfers as-is
```
The serialization/deserialization logic is pure TypeScript.

### 5. Constants & Configuration
```
src/constants/           → transfers as-is
```

---

## What Needs Rewriting (~60% of code)

### 1. All UI Components (JSX)

React web uses HTML elements (`div`, `span`, `input`, `button`). React Native uses its own primitives (`View`, `Text`, `TextInput`, `Pressable`).

```tsx
// Web (React)
<div className="p-4 bg-white rounded-xl shadow">
  <h2 className="text-xl font-semibold">Ichiran Ramen</h2>
  <span className="text-sm text-stone-500">Shibuya</span>
</div>

// React Native
<View style={styles.card}>
  <Text style={styles.heading}>Ichiran Ramen</Text>
  <Text style={styles.subtext}>Shibuya</Text>
</View>
```

**Strategy**: Rebuild each component using React Native primitives. The component structure and logic stay the same — only the JSX and styling change.

### 2. Styling

Tailwind CSS → React Native StyleSheet (or NativeWind).

**Option A: NativeWind (recommended)**
- NativeWind is Tailwind CSS for React Native
- Same class names: `className="p-4 bg-white rounded-xl"`
- Reduces the rewrite effort significantly
- Active project, good Expo support

**Option B: React Native StyleSheet**
- Native approach, no extra dependencies
- More verbose but more control
- Better for complex animations

**Recommendation**: Start with NativeWind for maximum code reuse from the web version.

### 3. Navigation

Web: State-based section switching (simple, works for SPA).
React Native: Proper navigation stack is needed for mobile UX (back gestures, tab bars, etc.).

**Library**: `@react-navigation/native` (the standard for RN)

```
Tab Navigator (bottom tabs)
  ├── Overview
  ├── Itinerary
  ├── Places
  ├── Map
  └── More (menu for Accommodations, Reservations, Packing, Notes, History)
```

### 4. Map

React Leaflet → `react-native-maps`

- `react-native-maps` uses MapKit on iOS and Google Maps on Android
- Marker API is similar but not identical
- Popups → custom callouts
- Filter logic stays the same (only the rendering changes)

### 5. Drag & Drop

dnd-kit (web) → `react-native-reanimated` + `react-native-gesture-handler`

- Touch-based drag & drop has different UX expectations than mouse-based
- Long-press to start drag (not click-and-drag)
- Haptic feedback on drag
- Libraries like `react-native-draggable-flatlist` handle sortable lists

### 6. Database

Dexie.js (IndexedDB) → one of:

**Option A: Expo SQLite (recommended)**
- Built into Expo, no extra setup
- SQLite is battle-tested
- Good for structured data
- Similar query patterns to Dexie

**Option B: WatermelonDB**
- Built on SQLite but with a reactive, observable API
- Better for complex apps with many related entities
- Overkill for this app's data model, but scales well

**Option C: MMKV + JSON**
- Ultra-fast key-value storage
- Store the entire trip as one JSON blob
- Simplest approach, works for our data size
- Loses the ability to query individual entities efficiently

**Recommendation**: Expo SQLite for the right balance of simplicity and capability.

### 7. File System Operations

Web: `URL.createObjectURL()` + `<a download>` for export, `<input type="file">` for import.
React Native: `expo-file-system` + `expo-sharing` for export, `expo-document-picker` for import.

### 8. Fonts

Web: `@fontsource/dm-sans` (npm package).
React Native: `expo-font` + download DM Sans font files.

---

## Migration Strategy

### Approach: Parallel Rewrite (Not Gradual)

Given the relatively small codebase, a parallel rewrite is more efficient than a gradual migration:

1. Create a new Expo project
2. Copy over all transferable code (types, stores, utils)
3. Rebuild UI components one section at a time
4. Test each section before moving to the next

### Phase 1: Foundation (Expo Setup)
- Initialize Expo project with TypeScript
- Install dependencies (Zustand, Immer, date-fns, nanoid, NativeWind)
- Copy types, stores, utils
- Set up navigation structure
- Set up Expo SQLite database
- Wire up stores to new database
- Verify data model works end-to-end

### Phase 2: Core UI
- Build shared components (cards, buttons, inputs, modals)
- Implement Sidebar / Tab navigation
- Build Places section
- Build Itinerary section (without drag & drop initially)
- Build Accommodations section
- Build Reservations section

### Phase 3: Advanced Features
- Add drag & drop to Itinerary (react-native-reanimated)
- Build Map section (react-native-maps)
- Build Overview dashboard
- Build Packing List
- Build Notes

### Phase 4: Platform Features
- JSON export via expo-sharing
- JSON import via expo-document-picker
- Push notifications for trip countdown / upcoming reservations
- Offline-first (already local, but ensure maps cache tiles)
- Dark mode (system setting detection)

### Phase 5: Polish & Release
- iOS: TestFlight build
- Android: Play Store internal testing
- Web: Expo Web deployment
- macOS: Evaluate react-native-macos or Expo macOS support

---

## Architecture Diagram

```
Shared Layer (transfers directly)
┌─────────────────────────────────────┐
│  Types     │  Stores    │  Utils    │
│  ─────     │  ──────    │  ─────    │
│  Trip      │  tripStore │  dates    │
│  Place     │  uiStore   │  ids      │
│  Accomm.   │  history   │  categories│
│  Reserv.   │  Store     │  validation│
│  etc.      │            │  export   │
└─────────────────────────────────────┘
              │
    ┌─────────┴─────────┐
    │                   │
┌───┴───┐         ┌─────┴─────┐
│  Web  │         │React Native│
│───────│         │────────────│
│ Vite  │         │ Expo       │
│ HTML  │         │ View/Text  │
│ CSS   │         │ StyleSheet │
│Tailwind│        │ NativeWind │
│Leaflet│         │ RN Maps    │
│dnd-kit│         │ Reanimated │
│Dexie  │         │ Expo SQLite│
└───────┘         └────────────┘
```

---

## Key Decisions for Later

These don't need to be decided now but should be considered during migration:

1. **Monorepo vs separate repos?**
   - Monorepo (e.g., Turborepo) keeps shared code in a single place
   - Separate repos are simpler but risk code drift
   - Recommendation: Monorepo with `packages/shared`, `apps/web`, `apps/mobile`

2. **Keep the web version alive?**
   - Option A: Expo Web replaces the Vite web app
   - Option B: Keep both (Vite for web, Expo for mobile)
   - Recommendation: Try Expo Web first. If it's good enough, deprecate the Vite app.

3. **Sync between devices?**
   - Not needed for MVP (single device, local storage)
   - Future: could add a simple sync layer (JSON file via iCloud/Google Drive, or a lightweight backend)
   - Most complex option: CRDTs for offline-first sync (Yjs, Automerge)

4. **App Store distribution?**
   - Expo EAS Build handles iOS/Android builds
   - Apple requires a developer account ($99/year)
   - Google Play requires a developer account ($25 one-time)
   - Alternative: distribute via TestFlight (iOS) or APK sideload (Android) for personal use

---

## Timeline Estimate

The migration is not urgent — the web app works for the Japan trip. Rough estimate:

| Phase | Duration | Notes |
|-------|----------|-------|
| Foundation | 2-3 days | Expo setup, shared code, database |
| Core UI | 4-5 days | Main sections rebuilt |
| Advanced Features | 3-4 days | Drag & drop, map, overview |
| Platform Features | 2-3 days | Export/import, notifications |
| Polish & Release | 2-3 days | Testing, builds, deployment |
| **Total** | **~2-3 weeks** | Part-time, at a comfortable pace |

---

## Risks & Mitigations

| Risk | Mitigation |
|------|-----------|
| NativeWind doesn't support all Tailwind features | Fall back to StyleSheet for unsupported styles |
| react-native-maps performance with many markers | Implement marker clustering, limit visible markers |
| Drag & drop UX feels wrong on touch | Extensive user testing, consider simpler "move to" menus for mobile |
| Expo Web quality isn't production-ready | Keep the Vite web app as a fallback |
| Database migration from Dexie to SQLite | Write a migration script that exports Dexie → JSON → imports to SQLite |
| macOS support is limited | macOS can use the web version; native macOS is a stretch goal |
