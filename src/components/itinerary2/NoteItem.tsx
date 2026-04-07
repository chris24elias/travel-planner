import { useState, useRef, useEffect } from 'react'
import { GripVertical, StickyNote, X } from 'lucide-react'
import { useTripStore } from '../../stores/tripStore'
import { useUIStore } from '../../stores/uiStore'
import type { InlineNote } from '../../types'
import type { SyntheticListenerMap } from '@dnd-kit/core/dist/hooks/utilities'

interface NoteItemProps {
  note: InlineNote
  dragListeners?: SyntheticListenerMap
  isOverlay?: boolean
}

export function NoteItem({ note, dragListeners, isOverlay }: NoteItemProps) {
  const updateInlineNote = useTripStore((s) => s.updateInlineNote)
  const deleteInlineNote = useTripStore((s) => s.deleteInlineNote)
  const showToast = useUIStore((s) => s.showToast)
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(note.content)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus()
    }
  }, [editing])

  useEffect(() => {
    setValue(note.content)
  }, [note.content])

  const save = () => {
    setEditing(false)
    const trimmed = value.trim()
    if (trimmed && trimmed !== note.content) {
      updateInlineNote(note.id, { content: trimmed })
    } else if (!trimmed) {
      setValue(note.content)
    }
  }

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation()
    await deleteInlineNote(note.id)
    showToast('Note removed')
  }

  return (
    <div
      onClick={() => !isOverlay && setEditing(true)}
      className="group flex items-center gap-2 px-2 py-2 rounded-[8px] hover:bg-surface-high/50 transition-colors cursor-pointer"
    >
      <div
        {...dragListeners}
        className="flex-shrink-0 cursor-grab active:cursor-grabbing p-0.5 text-text-placeholder hover:text-text-muted transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        <GripVertical size={14} />
      </div>

      <StickyNote size={13} className="text-text-placeholder flex-shrink-0" />

      {editing ? (
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={save}
          onKeyDown={(e) => {
            if (e.key === 'Enter') save()
            if (e.key === 'Escape') { setValue(note.content); setEditing(false) }
          }}
          onClick={(e) => e.stopPropagation()}
          className="flex-1 text-sm italic text-text-muted bg-transparent outline-none border-b border-border-medium focus:border-primary transition-colors"
        />
      ) : (
        <span className="flex-1 text-sm italic text-text-muted truncate">
          {note.content}
        </span>
      )}

      <button
        onClick={handleDelete}
        className="flex-shrink-0 p-1 rounded hover:bg-surface-highest text-text-placeholder hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"
      >
        <X size={12} />
      </button>
    </div>
  )
}
