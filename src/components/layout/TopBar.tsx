import { useEffect } from 'react'
import { Undo2 } from 'lucide-react'
import { useUndoStore } from '../../stores/undoStore'
import { useTripStore } from '../../stores/tripStore'
import { useUIStore } from '../../stores/uiStore'

export function TopBar() {
  const canUndo = useUndoStore((s) => s.canUndo)
  const undo = useUndoStore((s) => s.undo)
  const loadTrip = useTripStore((s) => s.loadTrip)
  const showToast = useUIStore((s) => s.showToast)

  const handleUndo = async () => {
    const description = await undo()
    if (description) {
      await loadTrip()
      showToast(`↩ Undid: ${description}`)
    }
  }

  // Cmd+Z / Ctrl+Z keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) {
        // Don't intercept if user is in an input/textarea
        const tag = (e.target as HTMLElement).tagName
        if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return

        e.preventDefault()
        handleUndo()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [canUndo])

  return (
    <div className="fixed top-4 right-6 z-50">
      <button
        onClick={handleUndo}
        disabled={!canUndo}
        className={`
          inline-flex items-center gap-2 px-3 py-2 rounded-[8px] text-xs font-medium
          transition-all cursor-pointer shadow-card
          ${canUndo
            ? 'bg-card-bg text-text-body hover:shadow-card-hover hover:scale-[1.02] active:scale-[0.98]'
            : 'bg-card-bg/60 text-text-placeholder cursor-not-allowed'
          }
        `}
        title="Undo (⌘Z)"
      >
        <Undo2 size={14} strokeWidth={2} />
        Undo
      </button>
    </div>
  )
}
