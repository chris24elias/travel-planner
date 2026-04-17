import type { ReactNode } from 'react'
import { Menu } from 'lucide-react'
import { Sidebar } from './Sidebar'
import { Toast } from '../shared/Toast'
import { useUIStore } from '../../stores/uiStore'
import { useTripStore } from '../../stores/tripStore'

// Sections that need full-bleed layout (no max-width / padding wrapper)
const FULL_BLEED_SECTIONS = new Set(['map', 'places', 'kanban', 'itinerary2'])

interface AppShellProps {
  children: ReactNode
}

export function AppShell({ children }: AppShellProps) {
  const activeSection = useUIStore((s) => s.activeSection)
  const toggleSidebar = useUIStore((s) => s.toggleSidebar)
  const trip = useTripStore((s) => s.trip)
  const fullBleed = FULL_BLEED_SECTIONS.has(activeSection)

  return (
    <div className="flex min-h-screen bg-page-bg">
      <Sidebar />

      {/* Main content area */}
      <main className={`flex-1 md:ml-60 min-w-0 ${fullBleed ? 'overflow-hidden' : ''}`}>
        {/* Mobile top bar with hamburger */}
        <div className="md:hidden flex items-center gap-3 px-4 py-3 bg-sidebar-bg border-b border-border-light sticky top-0 z-30">
          <button
            onClick={toggleSidebar}
            className="p-1.5 rounded-[8px] text-text-body hover:bg-surface-high transition-colors cursor-pointer"
          >
            <Menu size={20} />
          </button>
          {trip && (
            <h1 className="text-sm font-bold font-heading text-text-heading truncate">
              {trip.name}
            </h1>
          )}
        </div>

        {fullBleed ? (
          children
        ) : (
          <div className="px-4 py-6 md:px-8 md:py-10 max-w-[960px] mx-auto">
            {children}
          </div>
        )}
      </main>
      <Toast />
    </div>
  )
}
