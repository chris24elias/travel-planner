import type { ReactNode } from 'react'
import { Sidebar } from './Sidebar'
import { Toast } from '../shared/Toast'
import { useUIStore } from '../../stores/uiStore'

// Sections that need full-bleed layout (no max-width / padding wrapper)
const FULL_BLEED_SECTIONS = new Set(['map', 'places', 'kanban'])

interface AppShellProps {
  children: ReactNode
}

export function AppShell({ children }: AppShellProps) {
  const activeSection = useUIStore((s) => s.activeSection)
  const fullBleed = FULL_BLEED_SECTIONS.has(activeSection)

  return (
    <div className="flex min-h-screen bg-page-bg">
      <Sidebar />
      <main className={`flex-1 ml-60 ${fullBleed ? 'overflow-hidden' : ''}`}>
        {fullBleed ? (
          children
        ) : (
          <div className="px-8 py-10 max-w-[960px] mx-auto">
            {children}
          </div>
        )}
      </main>
      <Toast />
    </div>
  )
}
