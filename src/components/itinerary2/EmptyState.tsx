import { MapPin, StickyNote } from 'lucide-react'

interface EmptyStateProps {
  dayIndex: number
  onAddPlace?: () => void
  onAddNote?: () => void
}

export function EmptyState({ onAddPlace, onAddNote }: EmptyStateProps) {
  return (
    <div className="border-2 border-dashed border-border-medium rounded-[12px] py-8 px-4 flex flex-col items-center gap-3 mt-2">
      <p className="text-sm text-text-muted text-center">
        No plans yet — add a place or note to get started
      </p>
      <div className="flex gap-2">
        <button
          onClick={onAddPlace}
          className="flex items-center gap-1.5 text-xs font-medium text-text-muted hover:text-primary px-3 py-1.5 rounded-[8px] hover:bg-primary-light transition-colors cursor-pointer"
        >
          <MapPin size={12} />
          Add Place
        </button>
        <button
          onClick={onAddNote}
          className="flex items-center gap-1.5 text-xs font-medium text-text-muted hover:text-primary px-3 py-1.5 rounded-[8px] hover:bg-primary-light transition-colors cursor-pointer"
        >
          <StickyNote size={12} />
          Add Note
        </button>
      </div>
    </div>
  )
}
