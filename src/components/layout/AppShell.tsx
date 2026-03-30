import type { ReactNode } from 'react'
import { Sidebar } from './Sidebar'
import { Toast } from '../shared/Toast'

interface AppShellProps {
  children: ReactNode
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="flex min-h-screen bg-page-bg">
      <Sidebar />
      <main className="flex-1 ml-60">
        <div className="px-8 py-10 max-w-[960px] mx-auto">
          {children}
        </div>
      </main>
      <Toast />
    </div>
  )
}
