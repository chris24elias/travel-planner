import { Plane, Briefcase, Mountain } from 'lucide-react'
import { useTripStore } from '../../stores/tripStore'
import { formatDayOfWeek, formatDateShort } from '../../utils/dates'
import { CATEGORY_CONFIG } from '../../utils/categories'
import type { Trip, Place, PlaceCategory } from '../../types'

interface TripOverviewGridProps {
  trip: Trip
  dayDates: string[]
  onSelectDay: (dayIndex: number) => void
}

// Day theme badges
function getDayBadge(dayIndex: number, totalDays: number, dayNote?: string) {
  if (dayIndex === 0) return { icon: Plane, label: 'ARRIVE', color: '#f59e0b' }
  if (dayIndex === totalDays - 1) return { icon: Plane, label: 'DEPART', color: '#f59e0b' }

  const note = dayNote?.toLowerCase() || ''
  if (note.includes('day trip') || note.includes('kawaguchiko') || note.includes('yokohama') || note.includes('kamakura'))
    return { icon: Mountain, label: 'DAY TRIP', color: '#0d9488' }
  if (note.includes('work'))
    return { icon: Briefcase, label: 'WORK', color: '#7c3aed' }

  return null
}

function CategoryBar({ places }: { places: Place[] }) {
  if (places.length === 0) {
    return <div className="h-1 rounded-full border border-dashed border-border-medium mt-auto" />
  }

  const counts: Partial<Record<PlaceCategory, number>> = {}
  for (const p of places) {
    counts[p.category] = (counts[p.category] || 0) + 1
  }
  const total = places.length

  return (
    <div className="h-1.5 rounded-full overflow-hidden flex mt-auto">
      {Object.entries(counts).map(([cat, count]) => (
        <div
          key={cat}
          style={{
            width: `${(count / total) * 100}%`,
            backgroundColor: CATEGORY_CONFIG[cat as PlaceCategory]?.color || '#6b7280',
          }}
        />
      ))}
    </div>
  )
}

function DayCard({
  dayIndex,
  date,
  places,
  dayNote,
  totalDays,
  onClick,
}: {
  dayIndex: number
  date: string
  places: Place[]
  dayNote?: string
  totalDays: number
  onClick: () => void
}) {
  const badge = getDayBadge(dayIndex, totalDays, dayNote)
  const topPlaces = places.slice(0, 3)
  const remaining = places.length - 3
  const isEmpty = places.length === 0

  // Extract short day title from note
  const dayTitle = dayNote
    ? dayNote.length > 60
      ? dayNote.slice(0, 57) + '...'
      : dayNote
    : null

  return (
    <button
      onClick={onClick}
      className={`
        w-full text-left flex flex-col p-4 rounded-[12px] transition-all cursor-pointer
        min-h-[160px] group
        ${isEmpty
          ? 'border-2 border-dashed border-border-medium hover:border-text-placeholder bg-transparent'
          : 'bg-card-bg shadow-card hover:shadow-card-hover hover:scale-[1.02]'
        }
      `}
    >
      {/* Top row: day label + badge */}
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-text-muted">
          Day {dayIndex + 1}
        </span>
        {badge && (
          <span
            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider text-white"
            style={{ backgroundColor: badge.color }}
          >
            <badge.icon size={9} />
            {badge.label}
          </span>
        )}
      </div>

      {/* Date */}
      <div className="text-sm font-semibold text-text-heading mb-1">
        {formatDayOfWeek(date).slice(0, 3)}, {formatDateShort(date)}
      </div>

      {/* Day note / title */}
      {dayTitle && (
        <p className="text-[11px] text-text-muted italic mb-2 line-clamp-1">{dayTitle}</p>
      )}

      {/* Activities preview */}
      <div className="flex-1 space-y-1 mb-3">
        {isEmpty && (
          <p className="text-xs text-text-placeholder mt-2">No plans yet</p>
        )}
        {topPlaces.map((place) => {
          const catConfig = CATEGORY_CONFIG[place.category]
          return (
            <div key={place.id} className="flex items-center gap-1.5 min-w-0">
              <span
                className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: catConfig.color }}
              />
              <span className="text-xs text-text-body truncate">{place.name}</span>
            </div>
          )
        })}
        {remaining > 0 && (
          <span className="text-[11px] text-text-muted ml-3">+{remaining} more</span>
        )}
      </div>

      {/* Category distribution bar */}
      <CategoryBar places={places} />

      {/* Item count */}
      {places.length > 0 && (
        <div className="text-[10px] text-text-placeholder mt-1.5 text-right">
          {places.length} item{places.length !== 1 ? 's' : ''}
        </div>
      )}
    </button>
  )
}

export function TripOverviewGrid({ trip, dayDates, onSelectDay }: TripOverviewGridProps) {
  const places = useTripStore((s) => s.places)
  const dayNotes = useTripStore((s) => s.dayNotes)

  const assignedCount = places.filter((p) => p.dayIndex != null).length

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-bold font-heading tracking-tight">Itinerary</h1>
      </div>
      <p className="text-sm text-text-muted mb-8">
        {formatDateShort(trip.startDate)} — {formatDateShort(trip.endDate)} · {dayDates.length} days · {assignedCount} places assigned
      </p>

      {/* Day Grid */}
      <div className="grid grid-cols-4 gap-4">
        {dayDates.map((date, dayIndex) => {
          const dayPlaces = places
            .filter((p) => p.dayIndex === dayIndex)
            .sort((a, b) => (a.orderInDay ?? 0) - (b.orderInDay ?? 0))
          const dayNote = dayNotes.find((dn) => dn.dayIndex === dayIndex)

          return (
            <DayCard
              key={dayIndex}
              dayIndex={dayIndex}
              date={date}
              places={dayPlaces}
              dayNote={dayNote?.content}
              totalDays={dayDates.length}
              onClick={() => onSelectDay(dayIndex)}
            />
          )
        })}
      </div>
    </div>
  )
}
