import type { TripDocument } from '../types'

// Generate deterministic IDs for seed data
let idCounter = 0
const id = (prefix: string) => `${prefix}_${String(++idCounter).padStart(4, '0')}`
const now = new Date().toISOString()

// List IDs
const LIST_COFFEE = id('list')
const LIST_MATCHA = id('list')
const LIST_RAMEN = id('list')
const LIST_SUSHI = id('list')
const LIST_YAKITORI = id('list')
const LIST_BARS = id('list')
const LIST_GRAND_SEIKO = id('list')
const LIST_DAY_TRIPS = id('list')
const LIST_WELLNESS = id('list')
const LIST_ATTRACTIONS = id('list')
const LIST_BREAKFAST = id('list')
const LIST_IZAKAYA = id('list')

export const seedData: TripDocument = {
  version: '1.0.0',
  exportedAt: now,
  appVersion: '0.1.0',
  trip: {
    id: id('trip'),
    name: 'Japan 2026',
    destination: 'Japan',
    startDate: '2026-04-12',
    endDate: '2026-04-27',
    createdAt: now,
    updatedAt: now,
  },

  customLists: [
    { id: LIST_COFFEE, tripId: '', name: 'Coffee Shops', color: '#92400e', icon: '☕', orderIndex: 0, createdAt: now, updatedAt: now },
    { id: LIST_MATCHA, tripId: '', name: 'Matcha', color: '#16a34a', icon: '🍵', orderIndex: 1, createdAt: now, updatedAt: now },
    { id: LIST_RAMEN, tripId: '', name: 'Ramen & Tsukemen', color: '#dc2626', icon: '🍜', orderIndex: 2, createdAt: now, updatedAt: now },
    { id: LIST_SUSHI, tripId: '', name: 'Sushi & Omakase', color: '#2563eb', icon: '🍣', orderIndex: 3, createdAt: now, updatedAt: now },
    { id: LIST_YAKITORI, tripId: '', name: 'Yakitori', color: '#d97706', icon: '🍢', orderIndex: 4, createdAt: now, updatedAt: now },
    { id: LIST_IZAKAYA, tripId: '', name: 'Izakaya & Evening', color: '#ea580c', icon: '🏮', orderIndex: 5, createdAt: now, updatedAt: now },
    { id: LIST_BARS, tripId: '', name: 'Bars & Nightlife', color: '#7c3aed', icon: '🍺', orderIndex: 6, createdAt: now, updatedAt: now },
    { id: LIST_BREAKFAST, tripId: '', name: 'Breakfast Spots', color: '#f59e0b', icon: '🌅', orderIndex: 7, createdAt: now, updatedAt: now },
    { id: LIST_GRAND_SEIKO, tripId: '', name: 'Grand Seiko', color: '#1e3a5f', icon: '⌚', orderIndex: 8, createdAt: now, updatedAt: now },
    { id: LIST_DAY_TRIPS, tripId: '', name: 'Day Trips', color: '#0d9488', icon: '🗺', orderIndex: 9, createdAt: now, updatedAt: now },
    { id: LIST_WELLNESS, tripId: '', name: 'Wellness', color: '#ec4899', icon: '💆', orderIndex: 10, createdAt: now, updatedAt: now },
    { id: LIST_ATTRACTIONS, tripId: '', name: 'Attractions', color: '#6366f1', icon: '🎟', orderIndex: 11, createdAt: now, updatedAt: now },
  ],

  places: [
    // ===== COFFEE SHOPS =====
    { id: id('place'), tripId: '', name: 'Onibus Coffee', category: 'food', priority: 'must-see', area: 'Nakameguro', notes: 'Specialty coffee in a restored old Japanese house; two floors, roastery downstairs, cozy seating upstairs. Walk here during the Nakameguro canal stroll.', address: '', lat: 35.6440, lng: 139.6983, links: [], listIds: [LIST_COFFEE], dayIndex: 5, orderInDay: 1, timeSlot: 'Morning', createdAt: now, updatedAt: now },
    { id: id('place'), tripId: '', name: 'Sarutahiko Coffee', category: 'food', priority: 'want-to', area: 'Harajuku', notes: 'Inside the new Harajuku Station building; lots of greenery, wood beams, concrete. Great stop before or after Harajuku wandering.', address: '', lat: 35.6702, lng: 139.7026, links: [], listIds: [LIST_COFFEE], dayIndex: 6, orderInDay: 0, timeSlot: 'Morning', createdAt: now, updatedAt: now },
    { id: id('place'), tripId: '', name: 'Koffee Mameya Kakeru', category: 'food', priority: 'must-see', area: 'Kiyosumi-Shirakawa', notes: 'Counter seats facing the baristas, coffee lab vibes, omakase-style coffee tasting courses. Book ahead via website.', address: '', lat: 35.6811, lng: 139.8006, links: [], listIds: [LIST_COFFEE], dayIndex: 7, orderInDay: 1, timeSlot: 'Midday', createdAt: now, updatedAt: now },
    { id: id('place'), tripId: '', name: 'Kuro Mame', category: 'food', priority: 'must-see', area: 'Ginza', notes: 'World Brewers Cup-winning barista; black burnt cedar interiors inspired by Noh theatre. Near the Grand Seiko boutiques — combine both.', address: '', lat: 35.6717, lng: 139.7649, links: [], listIds: [LIST_COFFEE], dayIndex: 4, orderInDay: 0, timeSlot: '10:00 AM', createdAt: now, updatedAt: now },
    { id: id('place'), tripId: '', name: 'Blue Bottle Coffee', category: 'food', priority: 'if-time', area: 'Shinjuku', notes: 'Japanese Blue Bottle locations have a different feel from US. Try the lavender yuzu latte.', address: '', lat: 35.6896, lng: 139.6990, links: [], listIds: [LIST_COFFEE], dayIndex: 14, orderInDay: 0, timeSlot: 'Morning', createdAt: now, updatedAt: now },

    // ===== MATCHA =====
    { id: id('place'), tripId: '', name: 'Satén Japanese Tea', category: 'food', priority: 'must-see', area: 'Shibuya/Daikanyama', notes: 'Run by a former Blue Bottle barista; matcha served like espresso, cappuccinos with latte art. Best matcha cafe for a coffee person.', address: '', lat: 35.6500, lng: 139.7000, links: [], listIds: [LIST_MATCHA], dayIndex: 10, orderInDay: 0, timeSlot: 'Afternoon', createdAt: now, updatedAt: now },
    { id: id('place'), tripId: '', name: 'Suzukien', category: 'food', priority: 'must-see', area: 'Asakusa', notes: 'Level 1-7 matcha ice cream intensity scale. Level 7 is internationally famous. Quick stop.', address: '', lat: 35.7148, lng: 139.7967, links: [], listIds: [LIST_MATCHA], dayIndex: 9, orderInDay: 0, timeSlot: 'Afternoon', createdAt: now, updatedAt: now },
    { id: id('place'), tripId: '', name: 'Ippuku & Matcha', category: 'food', priority: 'want-to', area: 'Nihonbashi', notes: 'Single-origin Uji matcha cafe; secret 4-seat tea room with reservation (matcha tasting course from ¥3,500). Worth booking.', address: '', lat: 35.6838, lng: 139.7744, links: [], listIds: [LIST_MATCHA], dayIndex: null, orderInDay: 0, timeSlot: '', createdAt: now, updatedAt: now },
    { id: id('place'), tripId: '', name: 'Jugetsudo', category: 'food', priority: 'want-to', area: 'Ginza', notes: 'Designed by architect Kengo Kuma; beautiful bamboo lattice interior. Owned by 160+ year old tea merchant.', address: '', lat: 35.6705, lng: 139.7638, links: [], listIds: [LIST_MATCHA], dayIndex: 4, orderInDay: 5, timeSlot: 'Afternoon', createdAt: now, updatedAt: now },
    { id: id('place'), tripId: '', name: 'Ippodo Tea', category: 'shopping', priority: 'must-see', area: 'Shinjuku', notes: 'Classic, the real deal. Buy ceremonial grade loose leaf matcha to bring home. Great gifts.', address: '', lat: 35.6917, lng: 139.7037, links: [], listIds: [LIST_MATCHA], dayIndex: 12, orderInDay: 2, timeSlot: 'Afternoon', createdAt: now, updatedAt: now },

    // ===== RAMEN & TSUKEMEN =====
    { id: id('place'), tripId: '', name: 'Menya Sankai', category: 'food', priority: 'must-see', area: 'Okubo', notes: 'Voted best tsukemen of 2025. Gyokai-tonkotsu (seafood + pork), thick flat noodles. Next neighborhood over from hotel. Arrive 11:15am.', address: '', lat: 35.7010, lng: 139.6979, links: [], listIds: [LIST_RAMEN], dayIndex: 1, orderInDay: 1, timeSlot: '11:15 AM', createdAt: now, updatedAt: now },
    { id: id('place'), tripId: '', name: 'Fuunji', category: 'food', priority: 'must-see', area: 'Nishi-Shinjuku', notes: 'One of the best tsukemen in Tokyo. Chicken broth, smoky bonito powder. Fast turnover despite the line. Walking distance from hotel.', address: '', lat: 35.6900, lng: 139.6946, links: [], listIds: [LIST_RAMEN], dayIndex: 2, orderInDay: 5, timeSlot: 'Dinner', createdAt: now, updatedAt: now },
    { id: id('place'), tripId: '', name: 'Ichiran', category: 'food', priority: 'want-to', area: 'Shibuya', notes: 'Solo booth ramen. Customize everything on a paper form. Cheesy but fun to do once.', address: '', lat: 35.6595, lng: 139.7005, links: [], listIds: [LIST_RAMEN], dayIndex: null, orderInDay: 0, timeSlot: '', createdAt: now, updatedAt: now },
    { id: id('place'), tripId: '', name: 'Tanaka Shoten', category: 'food', priority: 'want-to', area: 'Tokyo', notes: 'Gold standard for Hakata-style tonkotsu in all of Tokyo. Rich Nagahama-style broth. Less touristy than Ichiran/Ippudo.', address: '', lat: 35.6900, lng: 139.7100, links: [], listIds: [LIST_RAMEN], dayIndex: null, orderInDay: 0, timeSlot: '', createdAt: now, updatedAt: now },
    { id: id('place'), tripId: '', name: 'Tsukemen Gonokami Seisakusho', category: 'food', priority: 'want-to', area: 'Shinjuku', notes: 'Shrimp tsukemen — unusual and delicious. Near Takashimaya. Long lines but worth it.', address: '', lat: 35.6870, lng: 139.7020, links: [], listIds: [LIST_RAMEN], dayIndex: 3, orderInDay: 4, timeSlot: 'Dinner', createdAt: now, updatedAt: now },
    { id: id('place'), tripId: '', name: 'Rokurinsha', category: 'food', priority: 'must-see', area: 'Tokyo Station', notes: 'Legendary tsukemen at Tokyo Station Ramen Street. Worth the detour.', address: '', lat: 35.6812, lng: 139.7671, links: [], listIds: [LIST_RAMEN], dayIndex: 11, orderInDay: 3, timeSlot: 'Dinner', createdAt: now, updatedAt: now },

    // ===== SUSHI & OMAKASE =====
    { id: id('place'), tripId: '', name: 'Kyubey', category: 'food', priority: 'must-see', area: 'Ginza', notes: 'One of Tokyo\'s most storied sushi counters, Edomae style since 1936. Oribe set ~¥5,500 (10 courses) for best value. Reserve 2-3 weeks ahead.', address: '', lat: 35.6714, lng: 139.7632, links: [], listIds: [LIST_SUSHI], dayIndex: 4, orderInDay: 3, timeSlot: 'Lunch', createdAt: now, updatedAt: now },
    { id: id('place'), tripId: '', name: 'Sushi Issekisancho', category: 'food', priority: 'want-to', area: 'Shinbashi', notes: '¥8,800 full omakase. Connected to Yamayuki, Toyosu Market\'s biggest tuna broker — exceptional tuna. 5-min walk from Ginza.', address: '', lat: 35.6662, lng: 139.7580, links: [], listIds: [LIST_SUSHI], dayIndex: null, orderInDay: 0, timeSlot: '', createdAt: now, updatedAt: now },
    { id: id('place'), tripId: '', name: 'Udatsu Sushi', category: 'food', priority: 'want-to', area: 'Nakameguro', notes: 'Michelin-recognized. Creative Edomae with fresh herbs and artistic plating. Herb maki with edible flowers.', address: '', lat: 35.6440, lng: 139.6990, links: [], listIds: [LIST_SUSHI], dayIndex: null, orderInDay: 0, timeSlot: '', createdAt: now, updatedAt: now },
    { id: id('place'), tripId: '', name: 'Sushi Rinda', category: 'food', priority: 'must-see', area: 'Meguro', notes: 'Chef is English-fluent. Warm, accessible atmosphere. Exceptional maguro otoro. Lunch ~¥29,000. Reserve 4-6 weeks ahead.', address: '', lat: 35.6340, lng: 139.7156, links: [], listIds: [LIST_SUSHI], dayIndex: 13, orderInDay: 2, timeSlot: 'Dinner', createdAt: now, updatedAt: now },

    // ===== YAKITORI =====
    { id: id('place'), tripId: '', name: 'Bird Land', category: 'food', priority: 'must-see', area: 'Ginza', notes: 'Pioneer of course-style yakitori dining. English-friendly, wine list. Book 1-2 weeks ahead.', address: '', lat: 35.6710, lng: 139.7640, links: [], listIds: [LIST_YAKITORI], dayIndex: 6, orderInDay: 3, timeSlot: 'Dinner', createdAt: now, updatedAt: now },
    { id: id('place'), tripId: '', name: 'Toriyoshi', category: 'food', priority: 'must-see', area: 'Nakameguro', notes: 'Walk-in only; started Tokyo\'s high-end yakitori boom. Order soboro donburi + chochin (egg yolk globes). Arrive before opening.', address: '', lat: 35.6445, lng: 139.6980, links: [], listIds: [LIST_YAKITORI], dayIndex: 5, orderInDay: 3, timeSlot: 'Lunch', createdAt: now, updatedAt: now },
    { id: id('place'), tripId: '', name: 'Yakitori Ruike', category: 'food', priority: 'must-see', area: 'Nishi-Shinjuku', notes: 'Opened 2022, already top-rated. Neck-to-tail approach, Daisen chicken from Tottori. Walking distance from hotel.', address: '', lat: 35.6920, lng: 139.6940, links: [], listIds: [LIST_YAKITORI], dayIndex: 12, orderInDay: 3, timeSlot: 'Dinner', createdAt: now, updatedAt: now },
    { id: id('place'), tripId: '', name: 'Torishiki', category: 'food', priority: 'want-to', area: 'Meguro', notes: 'Widely considered Tokyo\'s best (Michelin-starred, 12 seats). Omakase-only. Very hard to book — call on first day of month.', address: '', lat: 35.6330, lng: 139.7150, links: [], listIds: [LIST_YAKITORI], dayIndex: null, orderInDay: 0, timeSlot: '', createdAt: now, updatedAt: now },

    // ===== BARS & NIGHTLIFE =====
    { id: id('place'), tripId: '', name: 'Golden Gai', category: 'nightlife', priority: 'must-see', area: 'Shinjuku', notes: 'Tiny 6-8 seat bars, perfect for solo socializing. Go Saturday night. Arrive 10pm or later. Pick a bar that speaks to you.', address: '', lat: 35.6944, lng: 139.7036, links: [], listIds: [LIST_BARS], dayIndex: 6, orderInDay: 4, timeSlot: '10:00 PM', createdAt: now, updatedAt: now },
    { id: id('place'), tripId: '', name: 'Omoide Yokocho', category: 'nightlife', priority: 'must-see', area: 'Shinjuku', notes: 'Narrow alley, yakitori smoke, retro atmosphere. Best for early evening drinks with food before a longer night out.', address: '', lat: 35.6937, lng: 139.6996, links: [], listIds: [LIST_BARS], dayIndex: 1, orderInDay: 3, timeSlot: 'Evening', createdAt: now, updatedAt: now },
    { id: id('place'), tripId: '', name: 'Zoetrope', category: 'nightlife', priority: 'must-see', area: 'Nishi-Shinjuku', notes: '300+ Japanese whiskies. Owner Horigami has encyclopedic knowledge — will give you a full education. Walking distance from hotel.', address: '', lat: 35.6930, lng: 139.6950, links: [], listIds: [LIST_BARS], dayIndex: 1, orderInDay: 4, timeSlot: 'Night', createdAt: now, updatedAt: now },
    { id: id('place'), tripId: '', name: 'Aloha Whisky', category: 'nightlife', priority: 'must-see', area: 'Ikebukuro', notes: 'Bar of the Year 2020 (Whisky Magazine). World-class Chichibu selection, vintage Suntory. English-speaking staff. 1 stop from Takadanobaba.', address: '', lat: 35.7295, lng: 139.7109, links: [], listIds: [LIST_BARS], dayIndex: 7, orderInDay: 3, timeSlot: 'Evening', createdAt: now, updatedAt: now },
    { id: id('place'), tripId: '', name: 'Apollo Bar', category: 'nightlife', priority: 'want-to', area: 'Ginza', notes: 'Quiet jazz bar, strong Suntory collection including vintage. Great combo with Ginza dinner.', address: '', lat: 35.6715, lng: 139.7645, links: [], listIds: [LIST_BARS], dayIndex: 4, orderInDay: 6, timeSlot: 'Evening', createdAt: now, updatedAt: now },
    { id: id('place'), tripId: '', name: 'Bar Plat', category: 'nightlife', priority: 'want-to', area: 'Jinbocho', notes: 'Hidden gem, excellent Ichiro\'s Malt selection from Chichibu Distillery. Quiet book-district neighborhood.', address: '', lat: 35.6960, lng: 139.7570, links: [], listIds: [LIST_BARS], dayIndex: 11, orderInDay: 4, timeSlot: 'Evening', createdAt: now, updatedAt: now },
    { id: id('place'), tripId: '', name: 'TAP & GROWLER', category: 'nightlife', priority: 'must-see', area: 'Shimokitazawa', notes: '18 taps, Japanese craft including UCHU Brewing; 80+ bottles. Great stop while wandering Shimokitazawa.', address: '', lat: 35.6613, lng: 139.6680, links: [], listIds: [LIST_BARS], dayIndex: 5, orderInDay: 5, timeSlot: 'Afternoon', createdAt: now, updatedAt: now },
    { id: id('place'), tripId: '', name: 'Beer Club Popeye', category: 'nightlife', priority: 'want-to', area: 'Ryogoku', notes: '70+ beers on tap, legendary status in Tokyo. Worth a dedicated trip.', address: '', lat: 35.6960, lng: 139.7943, links: [], listIds: [LIST_BARS], dayIndex: 7, orderInDay: 2, timeSlot: 'Afternoon', createdAt: now, updatedAt: now },

    // ===== GRAND SEIKO =====
    { id: id('place'), tripId: '', name: 'Grand Seiko Flagship (Wako Building)', category: 'shopping', priority: 'must-see', area: 'Ginza', notes: 'THE place. World\'s largest GS lineup, second-floor lounge, boutique-only models. BRING YOUR PASSPORT for tax-free.', address: '', lat: 35.6717, lng: 139.7642, links: [], listIds: [LIST_GRAND_SEIKO], dayIndex: 4, orderInDay: 1, timeSlot: '11:00 AM', createdAt: now, updatedAt: now },
    { id: id('place'), tripId: '', name: 'Grand Seiko Boutique Namiki-dori', category: 'shopping', priority: 'must-see', area: 'Ginza', notes: 'Opened 2023; newer, sleeker space. Always has boutique-exclusive models in stock. 2 min walk from Ginza Station.', address: '', lat: 35.6710, lng: 139.7635, links: [], listIds: [LIST_GRAND_SEIKO], dayIndex: 4, orderInDay: 2, timeSlot: '1:00 PM', createdAt: now, updatedAt: now },
    { id: id('place'), tripId: '', name: 'Isetan Shinjuku (GS Floor)', category: 'shopping', priority: 'want-to', area: 'Shinjuku', notes: 'Store-specific annual exclusives. Also incredible depachika (basement food halls). 5-7 min from hotel.', address: '', lat: 35.6917, lng: 139.7044, links: [LIST_GRAND_SEIKO], listIds: [LIST_GRAND_SEIKO], dayIndex: 12, orderInDay: 0, timeSlot: 'Afternoon', createdAt: now, updatedAt: now },

    // ===== BREAKFAST SPOTS =====
    { id: id('place'), tripId: '', name: 'Tsukiji Outer Market', category: 'food', priority: 'must-see', area: 'Tsukiji', notes: 'Fresh seafood breakfast stalls — tuna sashimi, tamagoyaki, fresh uni, clam soup. Arrive 7am. Combine with Kamakura same day.', address: '', lat: 35.6654, lng: 139.7707, links: [], listIds: [LIST_BREAKFAST], dayIndex: 3, orderInDay: 0, timeSlot: '7:00 AM', createdAt: now, updatedAt: now },
    { id: id('place'), tripId: '', name: 'flour+water', category: 'food', priority: 'must-see', area: 'Nakameguro', notes: 'California-style cafe, opens 8am. Egg dishes + excellent coffee, airy corner spot. Great start before the canal walk.', address: '', lat: 35.6445, lng: 139.6975, links: [], listIds: [LIST_BREAKFAST, LIST_COFFEE], dayIndex: 5, orderInDay: 0, timeSlot: '8:00 AM', createdAt: now, updatedAt: now },
    { id: id('place'), tripId: '', name: 'Streamer Coffee Company', category: 'food', priority: 'want-to', area: 'Shinjuku', notes: 'Opens ~8am (rare for Tokyo). Egg breakfast sandwich + top-tier latte art. Reliable early option any day.', address: '', lat: 35.6900, lng: 139.6950, links: [], listIds: [LIST_BREAKFAST, LIST_COFFEE], dayIndex: 1, orderInDay: 0, timeSlot: 'Morning', createdAt: now, updatedAt: now },
    { id: id('place'), tripId: '', name: 'Shinpachi Shokudo', category: 'food', priority: 'want-to', area: 'Shinjuku', notes: 'Traditional Japanese breakfast sets (rice, miso soup, grilled fish, pickles). Fair prices, local crowd.', address: '', lat: 35.6910, lng: 139.7000, links: [], listIds: [LIST_BREAKFAST], dayIndex: 0, orderInDay: 1, timeSlot: 'Dinner', createdAt: now, updatedAt: now },

    // ===== ATTRACTIONS =====
    { id: id('place'), tripId: '', name: 'teamLab Borderless', category: 'activity', priority: 'must-see', area: 'Azabudai Hills', notes: 'Immersive digital art museum at Azabudai Hills. BOOK TICKETS IN ADVANCE (sells out). Best in evening. ~1.5-2 hrs. ~¥3,200.', address: '', lat: 35.6593, lng: 139.7380, links: [], listIds: [LIST_ATTRACTIONS], dayIndex: 10, orderInDay: 2, timeSlot: 'Evening', createdAt: now, updatedAt: now },
    { id: id('place'), tripId: '', name: 'Meiji Shrine', category: 'temple', priority: 'must-see', area: 'Harajuku', notes: 'Major Shinto shrine in a forested area. No booking needed. Great start to a Harajuku day.', address: '', lat: 35.6764, lng: 139.6993, links: [], listIds: [LIST_ATTRACTIONS], dayIndex: null, orderInDay: 0, timeSlot: '', createdAt: now, updatedAt: now },
    { id: id('place'), tripId: '', name: 'Senso-ji Temple', category: 'temple', priority: 'must-see', area: 'Asakusa', notes: 'Even if you skip the shrine vibe, Nakamise shopping street + surrounding area is worth it. Combine with Suzukien matcha.', address: '', lat: 35.7148, lng: 139.7967, links: [], listIds: [LIST_ATTRACTIONS], dayIndex: 9, orderInDay: 1, timeSlot: 'Afternoon', createdAt: now, updatedAt: now },
    { id: id('place'), tripId: '', name: 'Shibuya Sky', category: 'activity', priority: 'must-see', area: 'Shibuya', notes: 'Observation deck. Book sunset slot 2-3 weeks ahead for best views. ~¥2,000.', address: '', lat: 35.6580, lng: 139.7016, links: [], listIds: [LIST_ATTRACTIONS], dayIndex: 6, orderInDay: 2, timeSlot: 'Sunset', createdAt: now, updatedAt: now },
    { id: id('place'), tripId: '', name: 'Shinjuku Gyoen', category: 'nature', priority: 'want-to', area: 'Shinjuku', notes: 'Japanese garden. Peaceful, ¥500 entry. Easy walk from Shinjuku Station.', address: '', lat: 35.6852, lng: 139.7100, links: [], listIds: [LIST_ATTRACTIONS], dayIndex: 1, orderInDay: 2, timeSlot: 'Afternoon', createdAt: now, updatedAt: now },
    { id: id('place'), tripId: '', name: 'Shibuya Crossing', category: 'activity', priority: 'want-to', area: 'Shibuya', notes: 'See it at dusk when it\'s busiest and most cinematic.', address: '', lat: 35.6595, lng: 139.7004, links: [], listIds: [LIST_ATTRACTIONS], dayIndex: 6, orderInDay: 1, timeSlot: 'Late Afternoon', createdAt: now, updatedAt: now },
    { id: id('place'), tripId: '', name: 'Nakameguro Canal Walk', category: 'nature', priority: 'must-see', area: 'Nakameguro', notes: 'Iconic Meguro River canal. Beautiful in late April with late-blooming cherry trees and lush greenery.', address: '', lat: 35.6440, lng: 139.6985, links: [], listIds: [LIST_ATTRACTIONS], dayIndex: 5, orderInDay: 2, timeSlot: 'Late Morning', createdAt: now, updatedAt: now },
    { id: id('place'), tripId: '', name: 'Shimokitazawa', category: 'activity', priority: 'must-see', area: 'Shimokitazawa', notes: 'Wander — record shops, vintage clothing stores. No plan needed, just explore.', address: '', lat: 35.6613, lng: 139.6680, links: [], listIds: [LIST_ATTRACTIONS], dayIndex: 5, orderInDay: 4, timeSlot: 'Afternoon', createdAt: now, updatedAt: now },
    { id: id('place'), tripId: '', name: 'Akihabara', category: 'shopping', priority: 'want-to', area: 'Akihabara', notes: 'Electronics, anime merch. Also Bic Camera / Yodobashi Camera for Seiko browsing.', address: '', lat: 35.7023, lng: 139.7745, links: [], listIds: [LIST_ATTRACTIONS], dayIndex: 11, orderInDay: 0, timeSlot: 'Afternoon', createdAt: now, updatedAt: now },
    { id: id('place'), tripId: '', name: 'Harajuku / Takeshita Street', category: 'activity', priority: 'want-to', area: 'Harajuku', notes: 'Wander, people-watch, crepe stand.', address: '', lat: 35.6702, lng: 139.7026, links: [], listIds: [LIST_ATTRACTIONS], dayIndex: 6, orderInDay: 0, timeSlot: 'Morning/Midday', createdAt: now, updatedAt: now },

    // ===== DAY TRIPS =====
    { id: id('place'), tripId: '', name: 'Kawaguchiko + Shiraito Falls', category: 'nature', priority: 'must-see', area: 'Yamanashi', notes: 'Mt. Fuji views from Lake Kawaguchi + Shiraito waterfall nearby. Full day. Book highway bus in advance. Check Fuji visibility morning-of.', address: '', lat: 35.5139, lng: 138.7558, links: [], listIds: [LIST_DAY_TRIPS], dayIndex: 2, orderInDay: 0, timeSlot: '7:15 AM departure', createdAt: now, updatedAt: now },
    { id: id('place'), tripId: '', name: 'Kamakura', category: 'temple', priority: 'must-see', area: 'Kanagawa', notes: 'Great Buddha (Kotoku-in), Hase-dera temple, Komachi-dori shopping street. ~1 hr from Tokyo.', address: '', lat: 35.3192, lng: 139.5467, links: [], listIds: [LIST_DAY_TRIPS], dayIndex: 3, orderInDay: 2, timeSlot: '10:30 AM', createdAt: now, updatedAt: now },
    { id: id('place'), tripId: '', name: 'Yokohama', category: 'activity', priority: 'want-to', area: 'Yokohama', notes: 'Chinatown (dim sum, soup dumplings), Minato Mirai waterfront, Sankeien Garden, Cup Noodles Museum. ~30 min from Shinjuku.', address: '', lat: 35.4437, lng: 139.6380, links: [], listIds: [LIST_DAY_TRIPS], dayIndex: 8, orderInDay: 0, timeSlot: '10:00 AM', createdAt: now, updatedAt: now },

    // ===== WELLNESS =====
    { id: id('place'), tripId: '', name: 'Thermae-Yu', category: 'activity', priority: 'must-see', area: 'Kabukicho, Shinjuku', notes: 'Natural hot spring spa right in Shinjuku (10 min from hotel). Multiple baths, sauna, massage rooms. Open until 2am. ¥2,800 entry.', address: '', lat: 35.6951, lng: 139.7028, links: [], listIds: [LIST_WELLNESS], dayIndex: null, orderInDay: 0, timeSlot: '', createdAt: now, updatedAt: now },
    { id: id('place'), tripId: '', name: 'Shiseido The Store Beauty Salon', category: 'activity', priority: 'want-to', area: 'Ginza', notes: 'Flagship experience; Shiseido was literally born in Ginza in 1872. Upper-floor salon, English assistance, premium treatments.', address: '', lat: 35.6717, lng: 139.7650, links: [], listIds: [LIST_WELLNESS], dayIndex: null, orderInDay: 0, timeSlot: '', createdAt: now, updatedAt: now },

    // ===== IZAKAYA =====
    { id: id('place'), tripId: '', name: 'Isetan Shinjuku Depachika', category: 'food', priority: 'must-see', area: 'Shinjuku', notes: 'Japan\'s best department store basement food halls. Buy omiyage (gifts), try samples. Stunning.', address: '', lat: 35.6917, lng: 139.7044, links: [], listIds: [LIST_IZAKAYA], dayIndex: 12, orderInDay: 1, timeSlot: 'Afternoon', createdAt: now, updatedAt: now },
    { id: id('place'), tripId: '', name: 'Kappabashi (Kitchen Town)', category: 'shopping', priority: 'if-time', area: 'Asakusa', notes: 'Tokyo\'s restaurant supply district. Plastic food displays, knives, ceramics. 10-min walk from Senso-ji.', address: '', lat: 35.7120, lng: 139.7880, links: [], listIds: [LIST_ATTRACTIONS], dayIndex: 9, orderInDay: 2, timeSlot: 'Afternoon', createdAt: now, updatedAt: now },
    { id: id('place'), tripId: '', name: 'Daikanyama / Tsutaya Books', category: 'culture', priority: 'want-to', area: 'Daikanyama', notes: 'Upscale neighborhood, beautiful bookstore, boutiques. Completely different vibe from regular Shibuya.', address: '', lat: 35.6498, lng: 139.7032, links: [], listIds: [LIST_ATTRACTIONS], dayIndex: 10, orderInDay: 1, timeSlot: 'Afternoon', createdAt: now, updatedAt: now },
  ],

  accommodations: [
    {
      id: id('acc'),
      tripId: '',
      name: 'Sotetsu Grand Fresa Takadanobaba',
      checkIn: '2026-04-12',
      checkOut: '2026-04-27',
      address: 'Takadanobaba 1-27-7, Shinjuku-ku, Tokyo',
      lat: 35.7128,
      lng: 139.7038,
      confirmationNumber: 'SGF-2026-0412',
      notes: 'Superior Queen, high floor. Right next to Takadanobaba Station — 5-7 min on Yamanote Line to Shinjuku. Total paid: $2,890.33 via Capital One Travel. Fully refundable until April 10. Rating: 9.5/10.',
      link: '',
      createdAt: now,
      updatedAt: now,
    },
  ],

  reservations: [
    { id: id('res'), tripId: '', name: 'Kyubey Omakase', category: 'dining', dateTime: '2026-04-16T12:00:00', confirmationNumber: '', notes: 'Oribe set ~¥5,500, 10 courses. Reserve via phone/email, TableCheck, or Tableall.', link: '', createdAt: now, updatedAt: now },
    { id: id('res'), tripId: '', name: 'Sushi Rinda', category: 'dining', dateTime: '2026-04-25T18:00:00', confirmationNumber: '', notes: 'English-speaking chef, ~¥29,000 omakase. Use Pocket Concierge or Tableall. Reserve 4-6 weeks ahead.', link: '', createdAt: now, updatedAt: now },
    { id: id('res'), tripId: '', name: 'Bird Land', category: 'dining', dateTime: '2026-04-18T18:30:00', confirmationNumber: '', notes: 'Course-style yakitori in Ginza. English-friendly. Reserve 1-2 weeks out.', link: '', createdAt: now, updatedAt: now },
    { id: id('res'), tripId: '', name: 'teamLab Borderless', category: 'activity', dateTime: '2026-04-22T17:00:00', confirmationNumber: '', notes: 'Azabudai Hills. ~¥3,200. Book at teamlab.art. Evening slot for best light.', link: 'https://www.teamlab.art', createdAt: now, updatedAt: now },
    { id: id('res'), tripId: '', name: 'Shibuya Sky Sunset', category: 'activity', dateTime: '2026-04-18T18:00:00', confirmationNumber: '', notes: 'Sunset slot ~6:30-7pm. ~¥2,000. Book at shibuya-sky.com.', link: 'https://shibuya-sky.com/en/', createdAt: now, updatedAt: now },
    { id: id('res'), tripId: '', name: 'Koffee Mameya Kakeru Tasting', category: 'dining', dateTime: '2026-04-19T12:00:00', confirmationNumber: '', notes: 'Coffee omakase tasting. Reserve via website.', link: '', createdAt: now, updatedAt: now },
    { id: id('res'), tripId: '', name: 'Kawaguchiko Highway Bus', category: 'transport', dateTime: '2026-04-14T07:15:00', confirmationNumber: '', notes: 'Busta Shinjuku 4F → Kawaguchiko. ~¥2,000. Book at willerexpress.com or highwaybus.com.', link: '', createdAt: now, updatedAt: now },
    { id: id('res'), tripId: '', name: 'Delta DL 275 — DTW→HND', category: 'transport', dateTime: '2026-04-11T14:05:00', confirmationNumber: '', notes: 'Depart Detroit 2:05pm → Arrive Tokyo Haneda 4:15pm Apr 12. Total flight cost: $1,694.73.', link: '', createdAt: now, updatedAt: now },
    { id: id('res'), tripId: '', name: 'Delta DL 274 — HND→DTW', category: 'transport', dateTime: '2026-04-27T18:25:00', confirmationNumber: '', notes: 'Depart Haneda 6:25pm → Detroit → FLL 11:15pm. Leave hotel by 4pm.', link: '', createdAt: now, updatedAt: now },
  ],

  packingItems: [
    // Clothes
    { id: id('pack'), tripId: '', name: 'T-shirts (5-6)', category: 'Clothes', packed: false, orderIndex: 0, createdAt: now, updatedAt: now },
    { id: id('pack'), tripId: '', name: 'Jeans (2)', category: 'Clothes', packed: false, orderIndex: 1, createdAt: now, updatedAt: now },
    { id: id('pack'), tripId: '', name: 'Light jacket / layers', category: 'Clothes', packed: false, orderIndex: 2, createdAt: now, updatedAt: now },
    { id: id('pack'), tripId: '', name: 'Packable down jacket', category: 'Clothes', packed: false, orderIndex: 3, createdAt: now, updatedAt: now },
    { id: id('pack'), tripId: '', name: 'Packable rain jacket', category: 'Clothes', packed: false, orderIndex: 4, createdAt: now, updatedAt: now },
    { id: id('pack'), tripId: '', name: 'Comfortable walking shoes', category: 'Clothes', packed: false, orderIndex: 5, createdAt: now, updatedAt: now },
    { id: id('pack'), tripId: '', name: 'Underwear (8)', category: 'Clothes', packed: false, orderIndex: 6, createdAt: now, updatedAt: now },
    { id: id('pack'), tripId: '', name: 'Socks (8)', category: 'Clothes', packed: false, orderIndex: 7, createdAt: now, updatedAt: now },
    { id: id('pack'), tripId: '', name: 'Compact umbrella', category: 'Clothes', packed: false, orderIndex: 8, createdAt: now, updatedAt: now },

    // Electronics
    { id: id('pack'), tripId: '', name: 'Phone charger + cable', category: 'Electronics', packed: false, orderIndex: 0, createdAt: now, updatedAt: now },
    { id: id('pack'), tripId: '', name: 'Power bank (large)', category: 'Electronics', packed: false, orderIndex: 1, createdAt: now, updatedAt: now },
    { id: id('pack'), tripId: '', name: 'Laptop + charger', category: 'Electronics', packed: false, orderIndex: 2, createdAt: now, updatedAt: now },
    { id: id('pack'), tripId: '', name: 'AirPods / headphones', category: 'Electronics', packed: false, orderIndex: 3, createdAt: now, updatedAt: now },
    { id: id('pack'), tripId: '', name: 'Camera (optional)', category: 'Electronics', packed: false, orderIndex: 4, createdAt: now, updatedAt: now },

    // Documents
    { id: id('pack'), tripId: '', name: 'Passport (valid 6+ months past Apr 27)', category: 'Documents', packed: false, orderIndex: 0, createdAt: now, updatedAt: now },
    { id: id('pack'), tripId: '', name: 'Flight confirmation printout', category: 'Documents', packed: false, orderIndex: 1, createdAt: now, updatedAt: now },
    { id: id('pack'), tripId: '', name: 'Hotel booking confirmation', category: 'Documents', packed: false, orderIndex: 2, createdAt: now, updatedAt: now },
    { id: id('pack'), tripId: '', name: 'Travel insurance docs', category: 'Documents', packed: false, orderIndex: 3, createdAt: now, updatedAt: now },
    { id: id('pack'), tripId: '', name: 'Credit cards (notify bank)', category: 'Documents', packed: false, orderIndex: 4, createdAt: now, updatedAt: now },

    // Health & Toiletries
    { id: id('pack'), tripId: '', name: 'Magnesium citrate (400mg)', category: 'Health & Gut', packed: false, orderIndex: 0, createdAt: now, updatedAt: now },
    { id: id('pack'), tripId: '', name: 'MiraLax packets', category: 'Health & Gut', packed: false, orderIndex: 1, createdAt: now, updatedAt: now },
    { id: id('pack'), tripId: '', name: 'Colace (docusate sodium)', category: 'Health & Gut', packed: false, orderIndex: 2, createdAt: now, updatedAt: now },
    { id: id('pack'), tripId: '', name: 'Fiber supplement (Metamucil)', category: 'Health & Gut', packed: false, orderIndex: 3, createdAt: now, updatedAt: now },
    { id: id('pack'), tripId: '', name: 'Probiotics (start 5 days before)', category: 'Health & Gut', packed: false, orderIndex: 4, createdAt: now, updatedAt: now },
    { id: id('pack'), tripId: '', name: 'Toiletries (travel size)', category: 'Toiletries', packed: false, orderIndex: 0, createdAt: now, updatedAt: now },
    { id: id('pack'), tripId: '', name: 'Sunscreen', category: 'Toiletries', packed: false, orderIndex: 1, createdAt: now, updatedAt: now },

    // Before You Leave
    { id: id('pack'), tripId: '', name: 'Install eSIM (Airalo)', category: 'Pre-Departure', packed: false, orderIndex: 0, createdAt: now, updatedAt: now },
    { id: id('pack'), tripId: '', name: 'Download offline Tokyo maps', category: 'Pre-Departure', packed: false, orderIndex: 1, createdAt: now, updatedAt: now },
    { id: id('pack'), tripId: '', name: 'Download Google Translate Japanese pack', category: 'Pre-Departure', packed: false, orderIndex: 2, createdAt: now, updatedAt: now },
    { id: id('pack'), tripId: '', name: 'Test VPN from outside home network', category: 'Pre-Departure', packed: false, orderIndex: 3, createdAt: now, updatedAt: now },
    { id: id('pack'), tripId: '', name: 'Notify bank about Japan travel', category: 'Pre-Departure', packed: false, orderIndex: 4, createdAt: now, updatedAt: now },
  ],

  notes: [
    {
      id: id('note'), tripId: '', title: 'Jet Lag Strategy', orderIndex: 0,
      content: `Day 1 (Sun Apr 12): Land 4:15pm. Stay awake until 10pm Japan time. No napping. Get outside, walk, get sunlight.

Days 2-3: Wake with natural light. Do not sleep past 8am even if you feel terrible.

First-morning anchor: Set alarm for 7:30am on Day 2 (Mon Apr 13) even if you slept poorly.

Bonus: The remote work schedule (1am-10am) is easier if you naturally run night-owl — sleep rhythm shifts naturally by Week 2.`,
      createdAt: now, updatedAt: now,
    },
    {
      id: id('note'), tripId: '', title: 'Work Schedule (Week 2)', orderIndex: 1,
      content: `California PDT → Japan JST: 16 hrs ahead
CA 9am-6pm = Japan 1am-10am NEXT day

Work nights: Mon→Tue through Fri→Sat (1am-10am)
Work-free nights: Saturday & Sunday
All Japan daytime hours always free

Pattern: work through night → sleep until ~2pm → explore mid-afternoon onwards`,
      createdAt: now, updatedAt: now,
    },
    {
      id: id('note'), tripId: '', title: 'Apps to Download', orderIndex: 2,
      content: `Google Maps (offline Tokyo + Kanagawa + Yamanashi maps)
Google Translate (offline Japanese pack + camera feature)
Tableall / Pocket Concierge (restaurant reservations)
Meetup, Bumble BFF, Tandem (social)
Suica on iPhone (Wallet → Add Card → Transit Card → Suica)`,
      createdAt: now, updatedAt: now,
    },
    {
      id: id('note'), tripId: '', title: 'Useful Food Tips', orderIndex: 3,
      content: `For tsukemen: ask for "supuwari" at the end — additional dashi stock poured into leftover broth to drink as soup.

Whisky bars often have table charges (cover charge) — normal in Japan, usually includes snacks. One pour = 30ml.

Konbini strategy (7-Eleven/FamilyMart/Lawson): Japanese convenience store food is genuinely excellent — onigiri, tamago sandwiches, hot coffee, steamed buns. Best for very early day-trip departure mornings.

Depachika (dept store basement food halls): Isetan Shinjuku + Takashimaya are both near the hotel.`,
      createdAt: now, updatedAt: now,
    },
    {
      id: id('note'), tripId: '', title: 'Grand Seiko Notes', orderIndex: 4,
      content: `BRING YOUR PASSPORT — tax-free refund applies to tourist purchases; savings of 25-35% vs US pricing.

Yen weakness further boosts the discount right now.

Japan-exclusive models (JDM) only sold at boutiques — not available abroad.

Know your target model range before you go.

Tax refund desk at HND airport — present passport + tax-free receipts.

Boutiques accept credit cards.`,
      createdAt: now, updatedAt: now,
    },
    {
      id: id('note'), tripId: '', title: 'Money & Cash Strategy', orderIndex: 5,
      content: `Get yen from 7-Eleven ATMs in Japan — most reliable for foreign cards.
Also: Post office ATMs (Japan Post Bank) work well.
Avoid airport currency exchange booths — rates are poor.

Target: ¥50,000-80,000 cash (~$330-530). Replenish from 7-Eleven ATMs as needed.

Japan uses Type A outlets (flat 2-pin) — same as US. No adapter needed.
Voltage is 100V vs US 120V — check devices (most say 100-240V, which is fine).`,
      createdAt: now, updatedAt: now,
    },
    {
      id: id('note'), tripId: '', title: 'Booking Platforms', orderIndex: 6,
      content: `Sushi/restaurants: Tableall (English-friendly), Pocket Concierge, OMAKASE app, TableCheck

Cancellations within 48-72 hrs often charged 100% — chef sources fresh for you specifically.

teamLab: teamlab.art
Shibuya Sky: shibuya-sky.com/en/
Kawaguchiko bus: willerexpress.com or highwaybus.com`,
      createdAt: now, updatedAt: now,
    },
    {
      id: id('note'), tripId: '', title: 'Trip Cost Summary', orderIndex: 7,
      content: `Flight (Delta, round trip FLL↔HND): $1,694.73
Hotel (Sotetsu Grand Fresa, 15 nights): $2,890.33
Total booked: $4,585.06

Miles earned: ~$300-500 value
Effective cost after miles: ~$4,085-4,285

Daily spending budget: ~$80-120/day for food, transport, activities`,
      createdAt: now, updatedAt: now,
    },
  ],

  dayNotes: [
    { id: id('dn'), tripId: '', dayIndex: 0, content: 'ARRIVE. Land HND ~4:15pm. Clear customs, pick up Suica. Keikyu → Yamanote to Takadanobaba. Stay awake until 10pm!', updatedAt: now },
    { id: id('dn'), tripId: '', dayIndex: 1, content: 'Jet lag day — keep it close to Shinjuku. No early departures. Slow morning, Shinjuku area exploring.', updatedAt: now },
    { id: id('dn'), tripId: '', dayIndex: 2, content: 'FULL DAY TRIP: Kawaguchiko + Shiraito Falls. Depart Busta Shinjuku 7:15am. Check Fuji visibility morning-of.', updatedAt: now },
    { id: id('dn'), tripId: '', dayIndex: 3, content: 'Long day — Tsukiji breakfast 7am → Kamakura afternoon. Both cluster south of Tokyo.', updatedAt: now },
    { id: id('dn'), tripId: '', dayIndex: 4, content: 'THE WATCH DAY. Ginza all day: Grand Seiko → Sushi → Matcha → Whisky. Bring passport for tax-free.', updatedAt: now },
    { id: id('dn'), tripId: '', dayIndex: 5, content: 'Nakameguro + Shimokitazawa. Two of Tokyo\'s most interesting neighborhoods — natural day combo.', updatedAt: now },
    { id: id('dn'), tripId: '', dayIndex: 6, content: 'THE Saturday night — no alarm tomorrow! Harajuku/Shibuya daytime → Golden Gai night.', updatedAt: now },
    { id: id('dn'), tripId: '', dayIndex: 7, content: 'Last free Sunday before work starts. Coffee town (Kiyosumi-Shirakawa) → Aloha Whisky (Ikebukuro).', updatedAt: now },
    { id: id('dn'), tripId: '', dayIndex: 8, content: 'Last full-energy day before work rhythm. Yokohama day trip — Chinatown, waterfront, easy 30 min.', updatedAt: now },
    { id: id('dn'), tripId: '', dayIndex: 9, content: 'Work 1am-10am · Sleep until 2pm. First work recovery day. Asakusa afternoon.', updatedAt: now },
    { id: id('dn'), tripId: '', dayIndex: 10, content: 'Work 1am-10am · Sleep until 2pm. Shibuya/Daikanyama afternoon → teamLab Borderless evening.', updatedAt: now },
    { id: id('dn'), tripId: '', dayIndex: 11, content: 'Work 1am-10am · Sleep until 2pm. Akihabara afternoon + Rokurinsha ramen → Bar Plat evening.', updatedAt: now },
    { id: id('dn'), tripId: '', dayIndex: 12, content: 'Work 1am-10am · Sleep until 2pm. Close to home: Isetan Shinjuku + Ippodo Tea + Yakitori Ruike dinner.', updatedAt: now },
    { id: id('dn'), tripId: '', dayIndex: 13, content: 'Last work shift Sat 1am-10am. Sleep until 2pm. Final Ginza sweep → Sushi Rinda splurge dinner → Golden Gai Round 2.', updatedAt: now },
    { id: id('dn'), tripId: '', dayIndex: 14, content: 'LAST FULL DAY. Slow Sunday. Blue Bottle → final wandering → Takashimaya depachika → pack bags.', updatedAt: now },
    { id: id('dn'), tripId: '', dayIndex: 15, content: 'DEPART. Check out by 12pm. Leave for HND by 4pm. Tax refund desk at airport. DL 274 departs 6:25pm.', updatedAt: now },
  ],
}

// Fix: set tripId on all items to match the trip
export function prepareSeedData(): TripDocument {
  const data = JSON.parse(JSON.stringify(seedData)) as TripDocument
  const tripId = data.trip.id

  data.customLists.forEach(l => l.tripId = tripId)
  data.places.forEach(p => p.tripId = tripId)
  data.accommodations.forEach(a => a.tripId = tripId)
  data.reservations.forEach(r => r.tripId = tripId)
  data.packingItems.forEach(i => i.tripId = tripId)
  data.notes.forEach(n => n.tripId = tripId)
  data.dayNotes.forEach(dn => dn.tripId = tripId)

  return data
}
