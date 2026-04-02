import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd'
import { GripVertical, X } from 'lucide-react'
import { format, addDays, parseISO } from 'date-fns'
import { useTripStore } from '../../stores/tripStore'
import { useUIStore } from '../../stores/uiStore'
import { db } from '../../db/database'
import { now } from '../../utils/ids'
import { CategoryBadge } from '../shared/CategoryBadge'
import type { Place } from '../../types'

// ─── Constants ────────────────────────────────────────────────────────────────

const IDEAS_COLUMN_ID = 'ideas'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getCityLabel(dayPlaces: Place[]): string {
  if (!dayPlaces.length) return ''
  const counts = new Map<string, number>()
  dayPlaces.forEach((p) => { if (p.area) counts.set(p.area, (counts.get(p.area) ?? 0) + 1) })
  if (!counts.size) return ''
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0][0]
}

// ─── Kanban Card ──────────────────────────────────────────────────────────────

function KanbanCard({
  place, index, onRemoveFromDay,
}: {
  place: Place
  index: number
  onRemoveFromDay: (id: string) => void
}) {
  return (
    <Draggable draggableId={place.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={`bg-white rounded-[10px] p-3 mb-2 group/card transition-shadow ${
            snapshot.isDragging ? 'shadow-modal' : 'shadow-card hover:shadow-card-hover'
          }`}
        >
          <div className="flex items-start gap-2">
            {/* Drag handle */}
            <div
              {...provided.dragHandleProps}
              className="flex-shrink-0 mt-0.5 text-text-placeholder hover:text-text-muted cursor-grab active:cursor-grabbing"
            >
              <GripVertical size={14} />
            </div>

            <div className="flex-1 min-w-0">
              {/* Time + Category */}
              <div className="flex items-center gap-2 mb-1">
                {place.timeSlot && (
                  <span className="text-[10px] font-semibold text-text-muted">{place.timeSlot}</span>
                )}
                <CategoryBadge category={place.category} size="sm" />
              </div>

              {/* Name */}
              <p className="text-xs font-semibold text-text-heading leading-snug truncate">{place.name}</p>

              {/* Area */}
              {place.area && (
                <p className="text-[10px] text-text-placeholder truncate mt-0.5">{place.area}</p>
              )}
            </div>

            {/* Remove button — only for assigned places */}
            {place.dayIndex != null && (
              <button
                onClick={(e) => { e.stopPropagation(); onRemoveFromDay(place.id) }}
                className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-text-placeholder hover:text-red-500 hover:bg-red-50 opacity-0 group-hover/card:opacity-100 transition-all cursor-pointer"
                title="Move to Ideas"
              >
                <X size={10} />
              </button>
            )}
          </div>
        </div>
      )}
    </Draggable>
  )
}

// ─── Kanban Column ────────────────────────────────────────────────────────────

function KanbanColumn({
  columnId, title, subtitle, count, places, onRemoveFromDay, accentColor,
}: {
  columnId: string
  title: string
  subtitle?: string
  count: number
  places: Place[]
  onRemoveFromDay: (id: string) => void
  accentColor?: string
}) {
  return (
    <div className="flex-shrink-0 w-[260px] flex flex-col bg-[#f7f3ed] rounded-[14px] overflow-hidden">
      {/* Column header */}
      <div className="px-3.5 pt-3.5 pb-2.5">
        <div className="flex items-center justify-between mb-0.5">
          <div className="flex items-center gap-2">
            {accentColor && (
              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: accentColor }} />
            )}
            <h3 className="text-xs font-bold font-heading text-text-heading uppercase tracking-wide">{title}</h3>
          </div>
          <span className="text-[10px] font-semibold text-text-muted bg-[#e8e2d9] px-2 py-0.5 rounded-full">
            {count}
          </span>
        </div>
        {subtitle && (
          <p className="text-[10px] text-text-muted truncate">{subtitle}</p>
        )}
      </div>

      {/* Droppable area */}
      <Droppable droppableId={columnId}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 overflow-y-auto px-2.5 pb-2.5 min-h-[80px] transition-colors rounded-b-[14px] ${
              snapshot.isDraggingOver ? 'bg-primary/5' : ''
            }`}
          >
            {places.map((place, index) => (
              <KanbanCard
                key={place.id}
                place={place}
                index={index}
                onRemoveFromDay={onRemoveFromDay}
              />
            ))}
            {provided.placeholder}

            {places.length === 0 && !snapshot.isDraggingOver && (
              <div className="flex items-center justify-center h-16 border-2 border-dashed border-[#e8e2d9] rounded-[10px] text-[10px] text-text-placeholder">
                Drop here
              </div>
            )}
          </div>
        )}
      </Droppable>
    </div>
  )
}

// ─── Kanban Page ──────────────────────────────────────────────────────────────

export function KanbanPage() {
  const trip = useTripStore((s) => s.trip)
  const places = useTripStore((s) => s.places)
  const updatePlace = useTripStore((s) => s.updatePlace)
  const showToast = useUIStore((s) => s.showToast)

  if (!trip) return null

  const startDate = parseISO(trip.startDate)
  const duration = Math.ceil(
    (parseISO(trip.endDate).getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
  ) + 1

  // Ideas (unassigned) places — sorted by orderInDay so drop position is stable
  const ideasPlaces = places
    .filter((p) => p.dayIndex == null)
    .sort((a, b) => (a.orderInDay ?? 0) - (b.orderInDay ?? 0))

  // Day columns
  const days = Array.from({ length: duration }, (_, i) => {
    const dayPlaces = places
      .filter((p) => p.dayIndex === i)
      .sort((a, b) => (a.orderInDay ?? 0) - (b.orderInDay ?? 0))
    const date = addDays(startDate, i)
    return {
      dayIndex: i,
      columnId: `day-${i}`,
      date,
      dayPlaces,
      city: getCityLabel(dayPlaces),
    }
  })

  const getDayIndexFromColumnId = (columnId: string): number | null => {
    if (columnId === IDEAS_COLUMN_ID) return null
    const match = columnId.match(/^day-(\d+)$/)
    return match ? parseInt(match[1], 10) : null
  }

  const handleDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result
    if (!destination) return
    if (source.droppableId === destination.droppableId && source.index === destination.index) return

    const movedPlace = places.find((p) => p.id === draggableId)
    if (!movedPlace) return

    const toDayIndex = getDayIndexFromColumnId(destination.droppableId)
    const fromDayIndex = getDayIndexFromColumnId(source.droppableId)

    // Build the optimistic update: compute all place changes in one pass
    const updates: { id: string; dayIndex: number | null; orderInDay: number }[] = []

    if (source.droppableId === destination.droppableId) {
      // Reorder within same column
      const columnPlaces = toDayIndex != null
        ? places.filter((p) => p.dayIndex === toDayIndex).sort((a, b) => (a.orderInDay ?? 0) - (b.orderInDay ?? 0))
        : places.filter((p) => p.dayIndex == null).sort((a, b) => (a.orderInDay ?? 0) - (b.orderInDay ?? 0))

      const [removed] = columnPlaces.splice(source.index, 1)
      columnPlaces.splice(destination.index, 0, removed)

      columnPlaces.forEach((p, i) => {
        if (p.orderInDay !== i || p.id === movedPlace.id) {
          updates.push({ id: p.id, dayIndex: toDayIndex, orderInDay: i })
        }
      })
    } else {
      // Cross-column move

      // Build the target column's new order
      const targetPlaces = toDayIndex != null
        ? places.filter((p) => p.dayIndex === toDayIndex && p.id !== movedPlace.id).sort((a, b) => (a.orderInDay ?? 0) - (b.orderInDay ?? 0))
        : places.filter((p) => p.dayIndex == null && p.id !== movedPlace.id).sort((a, b) => (a.orderInDay ?? 0) - (b.orderInDay ?? 0))

      targetPlaces.splice(destination.index, 0, movedPlace)

      // Update all items in target column with correct dayIndex + orderInDay
      targetPlaces.forEach((p, i) => {
        updates.push({ id: p.id, dayIndex: toDayIndex, orderInDay: i })
      })

      // Re-index source column
      const sourcePlaces = fromDayIndex != null
        ? places.filter((p) => p.dayIndex === fromDayIndex && p.id !== movedPlace.id).sort((a, b) => (a.orderInDay ?? 0) - (b.orderInDay ?? 0))
        : places.filter((p) => p.dayIndex == null && p.id !== movedPlace.id).sort((a, b) => (a.orderInDay ?? 0) - (b.orderInDay ?? 0))

      sourcePlaces.forEach((p, i) => {
        if (p.orderInDay !== i) {
          updates.push({ id: p.id, dayIndex: fromDayIndex, orderInDay: i })
        }
      })
    }

    if (updates.length === 0) return

    // Optimistic UI update: apply all changes to Zustand state in one batch
    const updateMap = new Map(updates.map((u) => [u.id, u]))
    useTripStore.setState((s) => ({
      places: s.places.map((p) => {
        const upd = updateMap.get(p.id)
        if (!upd) return p
        return { ...p, dayIndex: upd.dayIndex, orderInDay: upd.orderInDay, updatedAt: now() }
      }),
    }))

    // Persist to DB in background (no await, no flash)
    Promise.all(
      updates.map((u) => {
        const place = places.find((p) => p.id === u.id)
        if (!place) return Promise.resolve()
        return db.places.put({ ...place, dayIndex: u.dayIndex, orderInDay: u.orderInDay, updatedAt: now() })
      })
    ).catch(console.error)
  }

  const handleRemoveFromDay = async (placeId: string) => {
    const place = places.find((p) => p.id === placeId)
    if (!place) return
    await updatePlace(placeId, { dayIndex: null, orderInDay: 0 })
    showToast(`Moved "${place.name}" to Ideas`)
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 px-6 pt-5 pb-4">
        <h1 className="text-xl font-bold font-heading text-text-heading">Itinerary</h1>
        <p className="text-xs text-text-muted mt-0.5">
          Kanban · {format(startDate, 'MMM d')} — {format(addDays(startDate, duration - 1), 'MMM d, yyyy')} · {duration} days
        </p>
      </div>

      {/* Board */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden px-4 pb-4">
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="flex gap-3 h-full">
            {/* Ideas column */}
            <KanbanColumn
              columnId={IDEAS_COLUMN_ID}
              title="Ideas"
              subtitle={`Unassigned (${ideasPlaces.length})`}
              count={ideasPlaces.length}
              places={ideasPlaces}
              onRemoveFromDay={handleRemoveFromDay}
              accentColor="#f59e0b"
            />

            {/* Day columns */}
            {days.map(({ dayIndex, columnId, date, dayPlaces, city }) => (
              <KanbanColumn
                key={columnId}
                columnId={columnId}
                title={`Day ${dayIndex + 1}`}
                subtitle={`${format(date, 'EEE, MMM d')}${city ? ` · ${city}` : ''}`}
                count={dayPlaces.length}
                places={dayPlaces}
                onRemoveFromDay={handleRemoveFromDay}
              />
            ))}
          </div>
        </DragDropContext>
      </div>
    </div>
  )
}
