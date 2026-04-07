import { useState, useRef, useEffect } from 'react'
import { useTripStore } from '../../stores/tripStore'

interface DayLabelEditorProps {
  dayIndex: number
  label: string
}

export function DayLabelEditor({ dayIndex, label }: DayLabelEditorProps) {
  const setDayLabel = useTripStore((s) => s.setDayLabel)
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(label)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [editing])

  useEffect(() => {
    setValue(label)
  }, [label])

  const save = () => {
    setEditing(false)
    const trimmed = value.trim()
    if (trimmed !== label) {
      setDayLabel(dayIndex, trimmed)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    e.stopPropagation()
    if (e.key === 'Enter') save()
    if (e.key === 'Escape') {
      setValue(label)
      setEditing(false)
    }
  }

  if (editing) {
    return (
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={save}
        onKeyDown={handleKeyDown}
        onClick={(e) => e.stopPropagation()}
        placeholder="Day label..."
        className="text-xs px-2 py-0.5 rounded-full bg-primary-light border border-primary/30 text-primary-hover outline-none w-32"
      />
    )
  }

  if (label) {
    return (
      <span
        onClick={(e) => { e.stopPropagation(); setEditing(true) }}
        className="text-xs px-2.5 py-0.5 rounded-full bg-primary-light text-primary-hover font-medium cursor-pointer hover:bg-primary-light/80 transition-colors"
      >
        {label}
      </span>
    )
  }

  return (
    <span
      onClick={(e) => { e.stopPropagation(); setEditing(true) }}
      className="text-xs px-2 py-0.5 rounded-full text-text-placeholder hover:bg-surface-high cursor-pointer transition-colors opacity-0 group-hover:opacity-100"
    >
      + label
    </span>
  )
}
