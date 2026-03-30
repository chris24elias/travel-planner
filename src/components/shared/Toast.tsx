import { useEffect } from 'react'
import { useUIStore } from '../../stores/uiStore'

export function Toast() {
  const message = useUIStore((s) => s.toastMessage)
  const clearToast = useUIStore((s) => s.clearToast)

  useEffect(() => {
    if (!message) return
    const timer = setTimeout(clearToast, 3000)
    return () => clearTimeout(timer)
  }, [message, clearToast])

  if (!message) return null

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60]">
      <div
        className="bg-text-heading text-white text-sm font-medium px-4 py-2.5 rounded-[8px] shadow-dropdown"
        style={{ animation: 'toastIn 0.2s ease-out' }}
      >
        {message}
      </div>

      <style>{`
        @keyframes toastIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
