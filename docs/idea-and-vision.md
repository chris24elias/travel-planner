# Idea & Vision

## The Problem

Planning a trip — especially to a destination as rich and complex as Japan — involves juggling dozens of tools, tabs, and mental models. You're researching places on YouTube, saving ramen spots from Reddit, bookmarking temples from travel blogs, tracking hotel confirmations in email, building packing lists in Notes, and trying to stitch it all together in your head.

Apps like **Wanderlog** and **TripIt** exist, but they each solve only part of the problem:

- **Wanderlog** is great for visual map-based planning and drag-and-drop itineraries, but it's bloated, buggy, locks key features (like offline access) behind a paywall, aggressively upsells, and tries to be everything for everyone. The UI can feel overwhelming — you're always staring at the map + list simultaneously, even when you just want to organize your days.

- **TripIt** excels at tracking confirmed bookings (flights, hotels, car rentals) via email parsing, but it's terrible for the planning and discovery phase. The UI feels dated. It's a reservation tracker, not a planning tool.

Neither app is designed for the deeply personal, research-heavy, visual planning process that a trip to Japan demands. Neither gives you a space to be messy, creative, and organized at the same time.

## The Idea

Build a **personal travel planning app** that works exactly the way you think. Not a generic SaaS product — a tool crafted for one person's workflow, with the flexibility to be useful for anyone who plans trips the same way.

The core thesis: **Your trip plan is a living document.** It should be as easy to work with as a notebook, but as powerful as a database. Everything about your trip lives in one place — accommodations, reservations, places to visit, packing lists, notes, the day-by-day itinerary — and you navigate between these sections like chapters in a book.

## What Makes This Different

### 1. Section-Based, Not Map-First
Unlike Wanderlog where you're always looking at a sidebar + map, this app gives each aspect of your trip its own dedicated, full-width view. When you're organizing your itinerary, you see just the itinerary. When you want the map, you go to the map. Each section is focused and uncluttered.

### 2. Your Data, Your Way
No account required. No server. Everything is stored locally on your device. Your trip data is a JSON document that you own completely. Export it, back it up, share it, or feed it to an AI — it's yours.

### 3. JSON as a First-Class Format
The entire trip plan is exportable as a single, well-structured JSON file. This isn't just a backup feature — it's a core architectural decision that enables:
- **AI integration**: Hand the JSON to any AI (ChatGPT, Claude, etc.) and it instantly understands your entire trip. Ask it to optimize your itinerary, suggest additions, fill gaps, or reorganize days. Import the modified JSON back and see the changes visually.
- **Portability**: Your trip data is never locked into this app. It's a standard format that any tool can read.
- **Future MCP integration**: An AI assistant could connect directly to the app via MCP protocol, reading and modifying your trip in real-time.

### 4. Built-In History
Every change you make is tracked. Undo mistakes with Ctrl+Z. See a log of everything you've done ("Added Ichiran Ramen to Day 3", "Moved hotel check-in to April 12"). Revert to any previous state. Your trip plan has version history like a Google Doc, but it's all local and instant.

### 5. No Paywalls, No Upsells
Everything works. Offline access isn't a premium feature. There's no "Pro" tier. The app does what it does, fully, for free. Because it's built for you.

### 6. Warm, Inviting Design
Travel planning should feel exciting, not like data entry. The app uses warm tones, friendly typography (DM Sans), and generous spacing to create a calm, inviting environment. It should feel like opening a beautiful travel journal, not a spreadsheet.

## The Inspiration

- **Wanderlog**: The idea of having a visual, organized trip planner with lists and an itinerary. But stripped of the bloat, the paywall, and the "always show the map" constraint.
- **Notion**: The idea of different "pages" or sections for different types of content, all within one workspace. The sidebar navigation model.
- **Apple Notes / Bear**: The simplicity and warmth of a good notes app. Not trying to do everything — just doing its thing well.
- **Git**: The idea that your data has history. Every change is tracked. You can always go back.

## Long-Term Vision

1. **Phase 1 (Now)**: React web app for planning the Japan trip. Local-first, works in the browser, deployable to Vercel.
2. **Phase 2 (Post-Trip)**: Migrate to React Native via Expo for a true cross-platform experience — iOS, Android, web, and potentially macOS.
3. **Phase 3 (Future)**: AI integration — natural language place search, itinerary optimization, research summarization. MCP server for direct AI manipulation of trip data.
4. **Phase 4 (Dream)**: Multi-trip support, collaborative planning, trip templates, community-shared place lists.

## The Name

TBD — but it should feel personal, warm, and travel-oriented. Not corporate. Something you'd name a journal, not a SaaS product.
