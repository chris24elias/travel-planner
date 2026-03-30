import { useEffect } from 'react'
import { useTripStore } from './stores/tripStore'
import { useUIStore } from './stores/uiStore'
import { AppShell } from './components/layout/AppShell'
import { WelcomeScreen } from './components/welcome/WelcomeScreen'
import { OverviewPage } from './components/overview/OverviewPage'
import { ItineraryPage } from './components/itinerary/ItineraryPage'
import { AccommodationsPage } from './components/accommodations/AccommodationsPage'
import { ReservationsPage } from './components/reservations/ReservationsPage'
import { PlacesPage } from './components/places/PlacesPage'
import { MapPage } from './components/map/MapPage'
import { PackingPage } from './components/packing/PackingPage'
import { NotesPage } from './components/notes/NotesPage'
import { HistoryPage } from './components/history/HistoryPage'
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
  const loadTrip = useTripStore((s) => s.loadTrip)
  const isLoaded = useTripStore((s) => s.isLoaded)
  const trip = useTripStore((s) => s.trip)

  useEffect(() => {
    loadTrip()
  }, [loadTrip])

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-page-bg flex items-center justify-center">
        <div className="text-text-muted text-sm">Loading...</div>
      </div>
    )
  }

  if (!trip) {
    return <WelcomeScreen />
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
