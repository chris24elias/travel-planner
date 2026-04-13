import { ChevronRight, ChevronDown } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { DayLabelEditor } from './DayLabelEditor'

interface DayHeaderProps {
  dayIndex: number
  date: string
  isExpanded: boolean
  onToggle: () => void
  label: string
  placeCount: number
  noteCount: number
}

export function DayHeader({
  dayIndex, date, isExpanded, onToggle, label, placeCount, noteCount,
}: DayHeaderProps) {
  const parsed = parseISO(date)
  const dayOfWeek = format(parsed, 'EEE')
  const formatted = format(parsed, 'MMM d')

  const parts: string[] = []
  if (placeCount > 0) parts.push(`${placeCount} place${placeCount !== 1 ? 's' : ''}`)
  if (noteCount > 0) parts.push(`${noteCount} note${noteCount !== 1 ? 's' : ''}`)
  const summary = parts.join(' · ') || '0 places'

  return (
    <button
      onClick={onToggle}
      className="group w-full flex items-center gap-3 px-5 py-3.5 text-left hover:bg-surface-high/50 transition-colors cursor-pointer"
    >
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <span className="text-sm font-semibold font-heading text-text-heading whitespace-nowrap">
          Day {dayIndex + 1}
        </span>
        <span className="text-sm text-text-muted whitespace-nowrap">
          · {dayOfWeek}, {formatted}
        </span>
        <DayLabelEditor dayIndex={dayIndex} label={label} />
      </div>

      <span className="text-xs text-text-muted whitespace-nowrap">{summary}</span>

      {isExpanded ? (
        <ChevronDown size={16} className="text-text-muted flex-shrink-0" />
      ) : (
        <ChevronRight size={16} className="text-text-muted flex-shrink-0" />
      )}
    </button>
  )
}
