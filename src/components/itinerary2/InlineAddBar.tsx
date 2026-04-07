import { useState, useRef, useEffect } from 'react'
import { MapPin, StickyNote } from 'lucide-react'
import { useTripStore } from '../../stores/tripStore'
import { useUIStore } from '../../stores/uiStore'
import { PlaceQuickAdd } from './PlaceQuickAdd'

interface InlineAddBarProps {
  dayIndex: number
  isEmpty?: boolean
}

type Mode = 'default' | 'place' | 'note'

export function InlineAddBar({ dayIndex, isEmpty }: InlineAddBarProps) {
  const [mode, setMode] = useState<Mode>('default')
  const [noteValue, setNoteValue] = useState('')
  const noteInputRef = useRef<HTMLInputElement>(null)
  const trip = useTripStore((s) => s.trip)
  const addInlineNote = useTripStore((s) => s.addInlineNote)
  const showToast = useUIStore((s) => s.showToast)

  useEffect(() => {
    if (mode === 'note' && noteInputRef.current) {
      noteInputRef.current.focus()
    }
  }, [mode])

  const saveNote = async () => {
    const trimmed = noteValue.trim()
    if (trimmed && trip) {
      await addInlineNote(trip.id, dayIndex, trimmed)
      showToast('Note added')
    }
    setNoteValue('')
    setMode('default')
  }

  if (mode === 'place') {
    return (
      <div className="mt-3">
        <PlaceQuickAdd
          dayIndex={dayIndex}
          onClose={() => setMode('default')}
        />
      </div>
    )
  }

  if (mode === 'note') {
    return (
      <div className="mt-3">
        <input
          ref={noteInputRef}
          type="text"
          value={noteValue}
          onChange={(e) => setNoteValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') saveNote()
            if (e.key === 'Escape') { setNoteValue(''); setMode('default') }
          }}
          onBlur={saveNote}
          placeholder="Type a note and press Enter..."
          className="w-full text-sm px-3 py-2.5 rounded-[10px] bg-surface-high border border-border-medium text-text-body placeholder:text-text-placeholder focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all italic"
        />
      </div>
    )
  }

  if (isEmpty) {
    return (
      <div className="border-2 border-dashed border-border-medium rounded-[12px] py-8 px-4 flex flex-col items-center gap-3 mt-2">
        <p className="text-sm text-text-muted text-center">
          No plans yet — add a place or note to get started
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => setMode('place')}
            className="flex items-center gap-1.5 text-xs font-medium text-text-muted hover:text-primary px-3 py-1.5 rounded-[8px] hover:bg-primary-light transition-colors cursor-pointer"
          >
            <MapPin size={12} />
            Add Place
          </button>
          <button
            onClick={() => setMode('note')}
            className="flex items-center gap-1.5 text-xs font-medium text-text-muted hover:text-primary px-3 py-1.5 rounded-[8px] hover:bg-primary-light transition-colors cursor-pointer"
          >
            <StickyNote size={12} />
            Add Note
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2 mt-3">
      <button
        onClick={() => setMode('place')}
        className="flex items-center gap-1.5 text-xs font-medium text-text-muted hover:text-primary px-3 py-2 rounded-[8px] hover:bg-primary-light transition-colors cursor-pointer"
      >
        <MapPin size={13} />
        Add Place
      </button>
      <button
        onClick={() => setMode('note')}
        className="flex items-center gap-1.5 text-xs font-medium text-text-muted hover:text-primary px-3 py-2 rounded-[8px] hover:bg-primary-light transition-colors cursor-pointer"
      >
        <StickyNote size={13} />
        Add Note
      </button>
    </div>
  )
}
