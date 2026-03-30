import { useState } from 'react'
import {
  DndContext, closestCenter, DragOverlay, PointerSensor, useSensor, useSensors,
  type DragStartEvent, type DragEndEvent, type DragOverEvent,
} from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Plus, Clock, X } from 'lucide-react'
import { SectionHeader } from '../layout/SectionHeader'
import { Button } from '../shared/Button'
import { useTripStore } from '../../stores/tripStore'
import { useUIStore } from '../../stores/uiStore'
import { getDayDates, formatDayOfWeek, formatDateShort } from '../../utils/dates'
import { CategoryBadge } from '../shared/CategoryBadge'
import { CATEGORY_CONFIG } from '../../utils/categories'
import type { Place } from '../../types'

const UNASSIGNED_ID = 'unassigned'

function PlaceCard({ place, isOverlay }: { place: Place; isOverlay?: boolean }) {
  const catConfig = CATEGORY_CONFIG[place.category]

  return (
    <div
      className={`bg-card-bg rounded-[12px] shadow-card p-4 transition-all ${
        isOverlay ? 'shadow-card-hover scale-[1.02] opacity-90 ring-2 ring-primary' : ''
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className="flex-shrink-0 mt-1 cursor-grab active:cursor-grabbing text-text-placeholder hover:text-text-muted transition-colors"
        >
          <GripVertical size={16} />
        </div>
        <div className="flex-1 min-w-0">
          {place.timeSlot && (
            <div className="text-xs font-medium text-text-muted mb-1 flex items-center gap-1">
              <Clock size={10} />
              {place.timeSlot}
            </div>
          )}
          <div className="text-sm font-semibold text-text-heading">{place.name}</div>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <CategoryBadge category={place.category} />
            {place.area && <span className="text-xs text-text-muted">{place.area}</span>}
          </div>
          {place.notes && (
            <p className="text-xs text-text-muted mt-2 line-clamp-1">{place.notes}</p>
          )}
        </div>
      </div>
    </div>
  )
}

function SortablePlaceCard({ place }: { place: Place }) {
  const openModal = useUIStore((s) => s.openModal)
  const updatePlace = useTripStore((s) => s.updatePlace)

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: place.id,
    data: { type: 'place', place },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} className="relative group">
      <div {...attributes} {...listeners}>
        <PlaceCard place={place} />
      </div>
      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => openModal('place', place.id)}
          className="p-1.5 rounded-md bg-card-bg shadow-card text-text-muted hover:text-text-body transition-colors cursor-pointer text-xs"
        >
          Edit
        </button>
        {place.dayIndex != null && (
          <button
            onClick={() => updatePlace(place.id, { dayIndex: null, orderInDay: 0 })}
            className="p-1.5 rounded-md bg-card-bg shadow-card text-text-muted hover:text-error transition-colors cursor-pointer"
          >
            <X size={12} />
          </button>
        )}
      </div>
    </div>
  )
}

function UnassignedChip({ place }: { place: Place }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: place.id,
    data: { type: 'place', place },
  })

  const catConfig = CATEGORY_CONFIG[place.category]

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  }

  return (
    <span
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-card-bg rounded-full text-xs font-medium text-text-body shadow-card cursor-grab active:cursor-grabbing hover:shadow-card-hover transition-all"
    >
      <span
        className="w-2 h-2 rounded-full flex-shrink-0"
        style={{ backgroundColor: catConfig.color }}
      />
      {place.name}
    </span>
  )
}

function DroppableDay({ dayIndex, children, isEmpty }: { dayIndex: number; children: React.ReactNode; isEmpty: boolean }) {
  const { setNodeRef, isOver } = useSortable({
    id: `day-${dayIndex}`,
    data: { type: 'day', dayIndex },
    disabled: true,
  })

  return (
    <div
      ref={setNodeRef}
      className={`min-h-[60px] rounded-[12px] transition-colors ${
        isOver ? 'bg-primary-light/40 ring-2 ring-primary/30 ring-dashed' : ''
      } ${isEmpty ? 'border-2 border-dashed border-border-medium' : ''}`}
    >
      {children}
    </div>
  )
}

export function ItineraryPage() {
  const trip = useTripStore((s) => s.trip)
  const places = useTripStore((s) => s.places)
  const dayNotes = useTripStore((s) => s.dayNotes)
  const updatePlace = useTripStore((s) => s.updatePlace)
  const setDayNote = useTripStore((s) => s.setDayNote)
  const openModal = useUIStore((s) => s.openModal)

  const [activeId, setActiveId] = useState<string | null>(null)
  const [editingNote, setEditingNote] = useState<number | null>(null)
  const [noteText, setNoteText] = useState('')
  const [editingTime, setEditingTime] = useState<string | null>(null)
  const [timeText, setTimeText] = useState('')

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )

  if (!trip) return null

  const dayDates = getDayDates(trip.startDate, trip.endDate)
  const unassigned = places.filter((p) => p.dayIndex == null)
  const activePlace = activeId ? places.find((p) => p.id === activeId) : null

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)

    if (!over) return

    const activePlace = places.find((p) => p.id === active.id)
    if (!activePlace) return

    const overId = over.id as string

    // Dropped on a day container
    if (overId.startsWith('day-')) {
      const dayIndex = parseInt(overId.replace('day-', ''))
      const dayPlaces = places.filter((p) => p.dayIndex === dayIndex)
      await updatePlace(activePlace.id, {
        dayIndex,
        orderInDay: dayPlaces.length,
      })
      return
    }

    // Dropped on the unassigned container
    if (overId === UNASSIGNED_ID) {
      if (activePlace.dayIndex != null) {
        await updatePlace(activePlace.id, { dayIndex: null, orderInDay: 0 })
      }
      return
    }

    // Dropped on another place card — put it in the same day, reorder
    const overPlace = places.find((p) => p.id === overId)
    if (!overPlace) return

    const targetDay = overPlace.dayIndex
    const dayPlaces = places
      .filter((p) => p.dayIndex === targetDay && p.id !== activePlace.id)
      .sort((a, b) => (a.orderInDay ?? 0) - (b.orderInDay ?? 0))

    const overIndex = dayPlaces.findIndex((p) => p.id === overId)
    dayPlaces.splice(overIndex, 0, activePlace)

    // Update all order indices
    for (let i = 0; i < dayPlaces.length; i++) {
      if (dayPlaces[i].id === activePlace.id) {
        await updatePlace(activePlace.id, { dayIndex: targetDay, orderInDay: i })
      } else if (dayPlaces[i].orderInDay !== i) {
        await updatePlace(dayPlaces[i].id, { orderInDay: i })
      }
    }
  }

  const startEditNote = (dayIndex: number) => {
    const existing = dayNotes.find((dn) => dn.dayIndex === dayIndex)
    setNoteText(existing?.content || '')
    setEditingNote(dayIndex)
  }

  const saveNote = async () => {
    if (editingNote === null) return
    await setDayNote(trip.id, editingNote, noteText)
    setEditingNote(null)
  }

  const startEditTime = (placeId: string, currentTime: string) => {
    setTimeText(currentTime)
    setEditingTime(placeId)
  }

  const saveTime = async () => {
    if (!editingTime) return
    await updatePlace(editingTime, { timeSlot: timeText })
    setEditingTime(null)
  }

  // Collect all sortable IDs
  const allSortableIds = [
    UNASSIGNED_ID,
    ...places.map((p) => p.id),
    ...dayDates.map((_, i) => `day-${i}`),
  ]

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div>
        <SectionHeader
          title="Itinerary"
          action={
            <Button icon={<Plus size={16} />} onClick={() => openModal('place')}>
              Add Place
            </Button>
          }
        />

        {/* Unassigned Ideas */}
        <SortableContext items={allSortableIds} strategy={verticalListSortingStrategy}>
          {unassigned.length > 0 && (
            <div className="mb-8 p-4 bg-surface-high rounded-[12px]" id={UNASSIGNED_ID}>
              <h3 className="text-xs font-semibold uppercase tracking-widest text-text-muted mb-3">
                Unassigned Ideas ({unassigned.length})
              </h3>
              <div className="flex flex-wrap gap-2">
                {unassigned.map((place) => (
                  <UnassignedChip key={place.id} place={place} />
                ))}
              </div>
            </div>
          )}

          {/* Day Sections */}
          <div className="space-y-8">
            {dayDates.map((date, dayIndex) => {
              const dayPlaces = places
                .filter((p) => p.dayIndex === dayIndex)
                .sort((a, b) => (a.orderInDay ?? 0) - (b.orderInDay ?? 0))
              const dayNote = dayNotes.find((dn) => dn.dayIndex === dayIndex)

              return (
                <div key={dayIndex}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-baseline gap-2">
                      <h2 className="text-lg font-bold font-heading">Day {dayIndex + 1}</h2>
                      <span className="text-sm text-text-muted">
                        — {formatDayOfWeek(date)}, {formatDateShort(date)}
                      </span>
                    </div>
                    <button
                      onClick={() => startEditNote(dayIndex)}
                      className="text-xs text-text-placeholder hover:text-text-muted transition-colors cursor-pointer"
                    >
                      {dayNote?.content ? 'Edit note' : '+ Add note'}
                    </button>
                  </div>

                  <DroppableDay dayIndex={dayIndex} isEmpty={dayPlaces.length === 0}>
                    {dayPlaces.length === 0 ? (
                      <div className="p-8 text-center">
                        <p className="text-sm text-text-muted">
                          Nothing planned yet — drag ideas here or click + to add
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {dayPlaces.map((place) => (
                          <div key={place.id}>
                            <SortablePlaceCard place={place} />
                            {/* Inline time edit */}
                            {editingTime === place.id ? (
                              <div className="flex items-center gap-2 mt-1 ml-9">
                                <input
                                  type="text"
                                  placeholder="e.g., 10:00 AM or Morning"
                                  value={timeText}
                                  onChange={(e) => setTimeText(e.target.value)}
                                  onKeyDown={(e) => { if (e.key === 'Enter') saveTime(); if (e.key === 'Escape') setEditingTime(null) }}
                                  onBlur={saveTime}
                                  autoFocus
                                  className="text-xs px-2 py-1 rounded-md border border-border-medium bg-card-bg text-text-body focus:outline-none focus:ring-1 focus:ring-primary"
                                />
                              </div>
                            ) : !place.timeSlot ? (
                              <button
                                onClick={() => startEditTime(place.id, '')}
                                className="flex items-center gap-1 mt-1 ml-9 text-xs text-text-placeholder hover:text-text-muted cursor-pointer transition-colors"
                              >
                                <Clock size={10} />
                                Add time
                              </button>
                            ) : (
                              <button
                                onClick={() => startEditTime(place.id, place.timeSlot || '')}
                                className="flex items-center gap-1 mt-1 ml-9 text-xs text-text-muted hover:text-text-body cursor-pointer transition-colors"
                              >
                                <Clock size={10} />
                                {place.timeSlot}
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </DroppableDay>

                  {/* Day Note */}
                  {editingNote === dayIndex ? (
                    <div className="mt-3">
                      <textarea
                        value={noteText}
                        onChange={(e) => setNoteText(e.target.value)}
                        onBlur={saveNote}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); saveNote() }
                          if (e.key === 'Escape') setEditingNote(null)
                        }}
                        placeholder="Add a note for this day..."
                        autoFocus
                        rows={2}
                        className="w-full px-4 py-2 text-xs rounded-[8px] bg-primary-light/30 border border-primary/20 text-text-body placeholder:text-text-placeholder focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                      />
                    </div>
                  ) : dayNote?.content ? (
                    <button
                      onClick={() => startEditNote(dayIndex)}
                      className="mt-3 w-full text-left px-4 py-2 bg-primary-light/30 rounded-[8px] cursor-pointer hover:bg-primary-light/50 transition-colors"
                    >
                      <p className="text-xs text-text-muted">{dayNote.content}</p>
                    </button>
                  ) : null}
                </div>
              )
            })}
          </div>
        </SortableContext>
      </div>

      <DragOverlay>
        {activePlace ? <PlaceCard place={activePlace} isOverlay /> : null}
      </DragOverlay>
    </DndContext>
  )
}
