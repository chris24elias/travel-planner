import {
  LayoutDashboard, CalendarDays, Building2, Ticket, MapPin,
  Map, Luggage, StickyNote, History, Download, Upload,
  ChevronRight, ChevronDown, Plus,
} from 'lucide-react'
import { useUIStore } from '../../stores/uiStore'
import { useTripStore } from '../../stores/tripStore'
import { getDaysUntil, formatDateShort } from '../../utils/dates'
import type { AppSection } from '../../types'

interface NavItem {
  id: AppSection
  label: string
  icon: React.ElementType
}

const NAV_ITEMS: NavItem[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'itinerary', label: 'Itinerary', icon: CalendarDays },
  { id: 'accommodations', label: 'Accommodations', icon: Building2 },
  { id: 'reservations', label: 'Reservations', icon: Ticket },
  { id: 'places', label: 'Places', icon: MapPin },
  { id: 'map', label: 'Map', icon: Map },
  { id: 'packing', label: 'Packing List', icon: Luggage },
  { id: 'notes', label: 'Notes', icon: StickyNote },
]

export function Sidebar() {
  const activeSection = useUIStore((s) => s.activeSection)
  const setSection = useUIStore((s) => s.setSection)
  const sidebarPlacesExpanded = useUIStore((s) => s.sidebarPlacesExpanded)
  const toggleSidebarPlaces = useUIStore((s) => s.toggleSidebarPlaces)
  const setActiveListId = useUIStore((s) => s.setActiveListId)
  const openModal = useUIStore((s) => s.openModal)

  const trip = useTripStore((s) => s.trip)
  const customLists = useTripStore((s) => s.customLists)
  const exportTrip = useTripStore((s) => s.exportTrip)

  const daysUntil = trip ? getDaysUntil(trip.startDate) : 0

  const handleExport = () => {
    const doc = exportTrip()
    if (!doc) return
    const blob = new Blob([JSON.stringify(doc, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${trip?.name?.toLowerCase().replace(/\s+/g, '-') || 'trip'}-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return
      const text = await file.text()
      try {
        const doc = JSON.parse(text)
        if (confirm('This will replace your current trip data. Continue?')) {
          await useTripStore.getState().importTrip(doc)
        }
      } catch {
        alert('Invalid JSON file')
      }
    }
    input.click()
  }

  return (
    <aside className="w-60 h-screen bg-sidebar-bg border-r border-border-light flex flex-col fixed left-0 top-0 z-40">
      {/* Trip Header */}
      {trip && (
        <div className="px-5 pt-6 pb-4">
          <h1 className="text-lg font-bold font-heading text-text-heading">{trip.name}</h1>
          <p className="text-xs text-text-muted mt-0.5">
            {formatDateShort(trip.startDate)} — {formatDateShort(trip.endDate)}
          </p>
          {daysUntil > 0 && (
            <span className="inline-flex items-center mt-2 px-2.5 py-1 bg-primary-light text-primary-hover text-xs font-semibold rounded-full">
              {daysUntil} days to go!
            </span>
          )}
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = activeSection === item.id
          const isPlaces = item.id === 'places'

          return (
            <div key={item.id}>
              <button
                onClick={() => {
                  setSection(item.id)
                  if (isPlaces) setActiveListId(null)
                }}
                className={`
                  w-full flex items-center gap-3 px-3 py-2 rounded-[8px] text-sm font-medium
                  transition-all cursor-pointer mb-0.5
                  ${isActive
                    ? 'bg-primary-light text-primary-hover'
                    : 'text-text-body hover:bg-surface-high'
                  }
                `}
              >
                <item.icon size={18} strokeWidth={1.75} />
                <span className="flex-1 text-left">{item.label}</span>
                {isPlaces && (
                  <span
                    onClick={(e) => { e.stopPropagation(); toggleSidebarPlaces() }}
                    className="p-0.5 rounded hover:bg-surface-highest transition-colors"
                  >
                    {sidebarPlacesExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  </span>
                )}
              </button>

              {/* Places sub-items */}
              {isPlaces && sidebarPlacesExpanded && (
                <div className="ml-6 pl-3 border-l border-border-light">
                  {customLists.sort((a, b) => a.orderIndex - b.orderIndex).map((list) => (
                    <button
                      key={list.id}
                      onClick={() => { setSection('places'); setActiveListId(list.id) }}
                      className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-xs text-text-muted hover:text-text-body hover:bg-surface-high transition-all cursor-pointer"
                    >
                      <span
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: list.color || 'var(--color-text-muted)' }}
                      />
                      {list.name}
                    </button>
                  ))}
                  <button
                    onClick={() => openModal('list')}
                    className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-xs text-text-placeholder hover:text-text-muted transition-all cursor-pointer"
                  >
                    <Plus size={12} />
                    New List
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </nav>

      {/* Utility Section */}
      <div className="px-3 py-3 border-t border-border-light">
        <button
          onClick={() => setSection('history')}
          className={`
            w-full flex items-center gap-3 px-3 py-2 rounded-[8px] text-sm font-medium
            transition-all cursor-pointer mb-0.5
            ${activeSection === 'history' ? 'bg-primary-light text-primary-hover' : 'text-text-muted hover:text-text-body hover:bg-surface-high'}
          `}
        >
          <History size={18} strokeWidth={1.75} />
          History
        </button>
        <button
          onClick={handleExport}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-[8px] text-sm font-medium text-text-muted hover:text-text-body hover:bg-surface-high transition-all cursor-pointer mb-0.5"
        >
          <Download size={18} strokeWidth={1.75} />
          Export JSON
        </button>
        <button
          onClick={handleImport}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-[8px] text-sm font-medium text-text-muted hover:text-text-body hover:bg-surface-high transition-all cursor-pointer"
        >
          <Upload size={18} strokeWidth={1.75} />
          Import JSON
        </button>
      </div>
    </aside>
  )
}
