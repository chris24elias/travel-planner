import { useEffect } from 'react'
import { useTripStore } from './stores/tripStore'
import { useUIStore } from './stores/uiStore'
import { AppShell } from './components/layout/AppShell'
import { TripsHome } from './components/home/TripsHome'
import { OverviewPage } from './components/overview/OverviewPage'
import { ItineraryPage } from './components/itinerary/ItineraryPage'
import { AccommodationsPage } from './components/accommodations/AccommodationsPage'
import { ReservationsPage } from './components/reservations/ReservationsPage'
import { PlacesPage } from './components/places/PlacesPage'
import { MapPage } from './components/map/MapPage'
import { PackingPage } from './components/packing/PackingPage'
import { NotesPage } from './components/notes/NotesPage'
import { HistoryPage } from './components/history/HistoryPage'
import { KanbanPage } from './components/kanban/KanbanPage'
import { PlaceModal } from './components/modals/PlaceModal'
import { AccommodationModal } from './components/modals/AccommodationModal'
import { ReservationModal } from './components/modals/ReservationModal'
import { NoteModal } from './components/modals/NoteModal'
import { ListModal } from './components/modals/ListModal'

function SectionRouter() {
  const activeSection = useUIStore((s) => s.activeSection)

  switch (activeSection) {
    case 'overview': return <OverviewPage />
    case 'itinerary': return <ItineraryPage />
    case 'kanban': return <KanbanPage />
    case 'accommodations': return <AccommodationsPage />
    case 'reservations': return <ReservationsPage />
    case 'places': return <PlacesPage />
    case 'map': return <MapPage />
    case 'packing': return <PackingPage />
    case 'notes': return <NotesPage />
    case 'history': return <HistoryPage />
    default: return <OverviewPage />
  }
}

function App() {
  const loadAllTrips = useTripStore((s) => s.loadAllTrips)
  const isLoaded = useTripStore((s) => s.isLoaded)
  const activeTripId = useTripStore((s) => s.activeTripId)
  const trip = useTripStore((s) => s.trip)

  useEffect(() => {
    loadAllTrips()
  }, [loadAllTrips])

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#fdf9f3] flex items-center justify-center">
        <div className="text-[#534434] text-sm">Loading...</div>
      </div>
    )
  }

  // No active trip selected → show home
  if (!activeTripId || !trip) {
    return <TripsHome />
  }

  return (
    <AppShell>
      <SectionRouter />
      <PlaceModal />
      <AccommodationModal />
      <ReservationModal />
      <NoteModal />
      <ListModal />
    </AppShell>
  )
}

export default App
