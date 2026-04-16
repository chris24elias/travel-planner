import {
  LayoutDashboard, CalendarDays, CalendarRange, Columns3, Building2, Ticket, MapPin,
  Map, Luggage, StickyNote, History, Download, Upload,
  ChevronRight, ChevronDown, Plus, ArrowLeft, Pencil, Undo2, X,
} from 'lucide-react'
import { useState, useEffect, useCallback } from 'react'
import { useUIStore } from '../../stores/uiStore'
import { useTripStore } from '../../stores/tripStore'
import { useUndoStore } from '../../stores/undoStore'
import { getDaysUntil, formatDateShort } from '../../utils/dates'
import { EditTripModal } from '../home/EditTripModal'
import type { AppSection } from '../../types'

interface NavItem {
  id: AppSection
  label: string
  icon: React.ElementType
}

const NAV_ITEMS: NavItem[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'itinerary', label: 'Itinerary', icon: CalendarDays },
  { id: 'itinerary2', label: 'Itinerary 2', icon: CalendarRange },
  { id: 'kanban', label: 'Kanban', icon: Columns3 },
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
  const sidebarOpen = useUIStore((s) => s.sidebarOpen)
  const closeSidebar = useUIStore((s) => s.closeSidebar)

  const trip = useTripStore((s) => s.trip)
  const customLists = useTripStore((s) => s.customLists)
  const exportTrip = useTripStore((s) => s.exportTrip)
  const clearActiveTrip = useTripStore((s) => s.clearActiveTrip)
  const canUndo = useUndoStore((s) => s.canUndo)
  const undo = useUndoStore((s) => s.undo)
  const loadTrip = useTripStore((s) => s.loadTrip)
  const showToast = useUIStore((s) => s.showToast)
  const [editingTrip, setEditingTrip] = useState(false)

  const handleUndo = useCallback(async () => {
    const description = await undo()
    if (description) {
      await loadTrip()
      showToast(`↩ Undid: ${description}`)
    }
  }, [undo, loadTrip, showToast])

  // Cmd+Z / Ctrl+Z keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) {
        const tag = (e.target as HTMLElement).tagName
        if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return
        e.preventDefault()
        handleUndo()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleUndo])

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

  const handleNavClick = (sectionId: AppSection) => {
    setSection(sectionId)
    if (sectionId === 'places') setActiveListId(null)
    closeSidebar()
  }

  return (
    <>
      {/* Backdrop overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={closeSidebar}
        />
      )}

      <aside className={`
        w-60 h-screen bg-sidebar-bg border-r border-border-light flex flex-col fixed left-0 top-0 z-50
        transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0
      `}>
        {/* Top row: All Trips + Undo */}
        <div className="flex items-center justify-between px-3 pt-3 pb-1">
          <button
            onClick={() => { clearActiveTrip(); closeSidebar() }}
            className="flex items-center gap-1.5 text-[11px] text-text-muted hover:text-text-body transition-colors cursor-pointer px-2 py-1 rounded-md hover:bg-surface-high"
          >
            <ArrowLeft size={11} />
            All Trips
          </button>
          <div className="flex items-center gap-1">
            <button
              onClick={handleUndo}
              disabled={!canUndo}
              className={`flex items-center gap-1.5 text-[11px] font-medium px-2 py-1 rounded-md transition-all cursor-pointer ${
                canUndo
                  ? 'text-text-muted hover:text-text-body hover:bg-surface-high'
                  : 'text-text-placeholder cursor-not-allowed'
              }`}
              title="Undo (⌘Z)"
            >
              <Undo2 size={12} />
              Undo
            </button>
            {/* Close button for mobile */}
            <button
              onClick={closeSidebar}
              className="md:hidden p-1.5 rounded-md text-text-muted hover:text-text-body hover:bg-surface-high transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Trip Header */}
        {trip && (
          <div className="px-5 pt-3 pb-4 group">
            <div className="flex items-start justify-between gap-1">
              <h1 className="text-lg font-bold font-heading text-text-heading leading-tight">{trip.name}</h1>
              <button
                onClick={() => setEditingTrip(true)}
                className="flex-shrink-0 w-6 h-6 rounded-md flex items-center justify-center text-text-placeholder hover:text-text-muted hover:bg-surface-high transition-all cursor-pointer opacity-0 group-hover:opacity-100 mt-0.5"
                title="Edit trip details"
              >
                <Pencil size={12} />
              </button>
            </div>
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
                  onClick={() => handleNavClick(item.id)}
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
                        onClick={() => { setSection('places'); setActiveListId(list.id); closeSidebar() }}
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
            onClick={() => { setSection('history'); closeSidebar() }}
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

        {editingTrip && trip && (
          <EditTripModal trip={trip} onClose={() => setEditingTrip(false)} />
        )}
      </aside>
    </>
  )
}
