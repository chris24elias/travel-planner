import { useState, useRef, useEffect } from 'react'
import {
  DndContext, closestCenter, DragOverlay, PointerSensor, useSensor, useSensors,
  type DragStartEvent, type DragEndEvent,
} from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { ArrowLeft, GripVertical, X, Plus, Search, ChevronDown, ChevronRight, Plane, Briefcase, Star } from 'lucide-react'
import { CategoryBadge } from '../shared/CategoryBadge'
import { PlacePhoto } from '../shared/PlacePhoto'
import { useTripStore } from '../../stores/tripStore'
import { useUIStore } from '../../stores/uiStore'
import { formatDayOfWeek, formatDateShort } from '../../utils/dates'
import { CATEGORY_CONFIG } from '../../utils/categories'
import type { Trip, Place } from '../../types'

// ─── Timeline Place Card ─────────────────────────────
function TimelinePlaceCard({ place, isOverlay }: { place: Place; isOverlay?: boolean }) {
  return (
    <div
      className={`bg-card-bg rounded-[12px] shadow-card transition-all overflow-hidden ${
        isOverlay ? 'shadow-card-hover scale-[1.02] ring-2 ring-primary' : ''
      }`}
    >
      <div className="flex items-stretch">
        {/* Photo thumbnail */}
        <PlacePhoto
          photoName={place.photoName}
          category={place.category}
          className="w-20 h-full min-h-[80px] flex-shrink-0"
          width={160}
        />

        {/* Content */}
        <div className="flex-1 min-w-0 p-3 flex flex-col justify-center">
          <div className="flex items-start gap-2">
            <div className="flex-shrink-0 mt-0.5 cursor-grab active:cursor-grabbing text-text-placeholder hover:text-text-muted transition-colors">
              <GripVertical size={14} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-text-heading leading-tight">{place.name}</div>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <CategoryBadge category={place.category} />
                {place.area && <span className="text-xs text-text-muted">{place.area}</span>}
                {place.rating && (
                  <span className="flex items-center gap-0.5 text-[11px] font-medium text-amber-500">
                    <Star size={10} fill="currentColor" />
                    {place.rating.toFixed(1)}
                  </span>
                )}
              </div>
              {place.notes && (
                <p className="text-xs text-text-muted mt-1.5 line-clamp-2">{place.notes}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function SortableTimelineCard({ place }: { place: Place }) {
  const openModal = useUIStore((s) => s.openModal)
  const updatePlace = useTripStore((s) => s.updatePlace)
  const [editingTime, setEditingTime] = useState(false)
  const [timeText, setTimeText] = useState(place.timeSlot || '')

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: place.id,
    data: { type: 'place', place },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  }

  const saveTime = async () => {
    await updatePlace(place.id, { timeSlot: timeText })
    setEditingTime(false)
  }

  return (
    <div ref={setNodeRef} style={style} className="flex gap-3 group">
      {/* Timeline dot + line */}
      <div className="flex flex-col items-center w-12 flex-shrink-0">
        {/* Time label */}
        {editingTime ? (
          <input
            type="text"
            value={timeText}
            onChange={(e) => setTimeText(e.target.value)}
            onBlur={saveTime}
            onKeyDown={(e) => { if (e.key === 'Enter') saveTime(); if (e.key === 'Escape') setEditingTime(false) }}
            autoFocus
            className="w-full text-[10px] text-center px-1 py-0.5 rounded border border-border-medium bg-card-bg text-text-body focus:outline-none focus:ring-1 focus:ring-primary mb-1"
            placeholder="Time"
          />
        ) : (
          <button
            onClick={() => { setTimeText(place.timeSlot || ''); setEditingTime(true) }}
            className="text-[10px] font-medium text-text-muted hover:text-text-body cursor-pointer mb-1 min-h-[16px]"
          >
            {place.timeSlot || '+ time'}
          </button>
        )}
        <div className="w-3 h-3 rounded-full border-2 border-primary bg-card-bg flex-shrink-0 z-10" />
        <div className="w-0.5 flex-1 bg-border-light" />
      </div>

      {/* Card */}
      <div className="flex-1 pb-4 relative">
        <div {...attributes} {...listeners}>
          <TimelinePlaceCard place={place} />
        </div>
        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => openModal('place', place.id)}
            className="p-1.5 rounded-md bg-card-bg shadow-card text-text-muted hover:text-text-body transition-colors cursor-pointer text-xs"
          >
            Edit
          </button>
          <button
            onClick={() => updatePlace(place.id, { dayIndex: null, orderInDay: 0 })}
            className="p-1.5 rounded-md bg-card-bg shadow-card text-text-muted hover:text-error transition-colors cursor-pointer"
          >
            <X size={12} />
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Day Navigation Strip ─────────────────────────────
function DayStrip({
  dayDates,
  selectedDay,
  onSelectDay,
  places,
  dayNotes,
}: {
  dayDates: string[]
  selectedDay: number
  onSelectDay: (day: number) => void
  places: Place[]
  dayNotes: { dayIndex: number; content: string }[]
}) {
  const stripRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (stripRef.current) {
      const selectedEl = stripRef.current.children[selectedDay] as HTMLElement
      if (selectedEl) {
        selectedEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
      }
    }
  }, [selectedDay])

  return (
    <div className="relative mb-6">
      <div
        ref={stripRef}
        className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {dayDates.map((date, idx) => {
          const dayPlaces = places.filter((p) => p.dayIndex === idx)
          const isSelected = idx === selectedDay
          const note = dayNotes.find((dn) => dn.dayIndex === idx)?.content?.toLowerCase() || ''
          const isWork = note.includes('work')
          const isFirst = idx === 0
          const isLast = idx === dayDates.length - 1

          return (
            <button
              key={idx}
              onClick={() => onSelectDay(idx)}
              className={`
                flex-shrink-0 flex flex-col items-center px-3 py-2.5 rounded-[10px] transition-all cursor-pointer min-w-[60px]
                ${isSelected
                  ? 'bg-primary text-white shadow-card scale-105'
                  : 'bg-card-bg text-text-body hover:bg-surface-high shadow-card'
                }
              `}
            >
              <span className={`text-lg font-bold font-heading leading-none ${isSelected ? 'text-white' : 'text-text-heading'}`}>
                {idx + 1}
              </span>
              <span className={`text-[10px] mt-0.5 ${isSelected ? 'text-white/80' : 'text-text-muted'}`}>
                {formatDayOfWeek(date).slice(0, 3)}
              </span>
              <span className={`text-[10px] ${isSelected ? 'text-white/70' : 'text-text-placeholder'}`}>
                {formatDateShort(date).replace(', ', ' ')}
              </span>
              {/* Indicator dots */}
              <div className="flex gap-0.5 mt-1.5">
                {(isFirst || isLast) && (
                  <Plane size={8} className={isSelected ? 'text-white/70' : 'text-text-placeholder'} />
                )}
                {isWork && !isFirst && !isLast && (
                  <Briefcase size={8} className={isSelected ? 'text-white/70' : 'text-purple-400'} />
                )}
                {dayPlaces.length > 0 && !isFirst && !isLast && !isWork && (
                  <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white/70' : 'bg-primary'}`} />
                )}
                {dayPlaces.length === 0 && !isFirst && !isLast && !isWork && (
                  <span className="w-1.5 h-1.5 rounded-full bg-border-medium" />
                )}
              </div>
            </button>
          )
        })}
      </div>
      {/* Fade edges */}
      <div className="absolute right-0 top-0 bottom-2 w-12 bg-gradient-to-l from-page-bg to-transparent pointer-events-none" />
    </div>
  )
}

// ─── Add to Day Panel ─────────────────────────────
function AddToDayPanel({ dayIndex }: { dayIndex: number }) {
  const places = useTripStore((s) => s.places)
  const customLists = useTripStore((s) => s.customLists)
  const updatePlace = useTripStore((s) => s.updatePlace)
  const openModal = useUIStore((s) => s.openModal)

  const [search, setSearch] = useState('')
  const [expandedLists, setExpandedLists] = useState<Record<string, boolean>>({})

  const unassigned = places.filter((p) => p.dayIndex == null)

  const toggleList = (listId: string) => {
    setExpandedLists((prev) => ({ ...prev, [listId]: !prev[listId] }))
  }

  const addToDay = async (placeId: string) => {
    const dayPlaces = places.filter((p) => p.dayIndex === dayIndex)
    await updatePlace(placeId, { dayIndex, orderInDay: dayPlaces.length })
  }

  // Group unassigned by list
  const listGroups = customLists
    .map((list) => {
      const listPlaces = unassigned.filter((p) => p.listIds.includes(list.id))
      return { list, places: listPlaces }
    })
    .filter((g) => g.places.length > 0)

  // Places not in any list
  const noListPlaces = unassigned.filter((p) => p.listIds.length === 0)

  // Search filter
  const searchLower = search.toLowerCase()
  const filteredUnassigned = search
    ? unassigned.filter((p) => p.name.toLowerCase().includes(searchLower) || p.area?.toLowerCase().includes(searchLower))
    : null

  return (
    <div className="bg-surface-high rounded-[12px] p-4 h-fit sticky top-4">
      <h3 className="text-xs font-semibold uppercase tracking-widest text-text-muted mb-3">
        Add to Day {dayIndex + 1}
      </h3>

      {/* Search */}
      <div className="relative mb-4">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-placeholder" />
        <input
          type="text"
          placeholder="Search your places..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-8 pr-3 py-2 text-xs rounded-[8px] bg-card-bg border border-border-medium text-text-body placeholder:text-text-placeholder focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      {/* Search results mode */}
      {filteredUnassigned ? (
        <div className="space-y-1 max-h-[50vh] overflow-y-auto">
          {filteredUnassigned.length === 0 ? (
            <p className="text-xs text-text-muted py-4 text-center">No matching unassigned places</p>
          ) : (
            filteredUnassigned.map((place) => (
              <PlaceRow key={place.id} place={place} onAdd={() => addToDay(place.id)} />
            ))
          )}
        </div>
      ) : (
        /* List groups mode */
        <div className="space-y-3 max-h-[50vh] overflow-y-auto">
          {unassigned.length === 0 ? (
            <p className="text-xs text-text-muted py-4 text-center">All places are assigned!</p>
          ) : (
            <>
              {listGroups.map(({ list, places: listPlaces }) => {
                const isExpanded = expandedLists[list.id] !== false
                return (
                  <div key={list.id}>
                    <button
                      onClick={() => toggleList(list.id)}
                      className="flex items-center gap-2 w-full text-left cursor-pointer mb-1"
                    >
                      {isExpanded ? <ChevronDown size={12} className="text-text-muted" /> : <ChevronRight size={12} className="text-text-muted" />}
                      <span
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: list.color || '#6b7280' }}
                      />
                      <span className="text-[11px] font-medium text-text-body flex-1">{list.name}</span>
                      <span className="text-[10px] text-text-placeholder">{listPlaces.length}</span>
                    </button>
                    {isExpanded && (
                      <div className="space-y-0.5 ml-4">
                        {listPlaces.map((place) => (
                          <PlaceRow key={place.id} place={place} onAdd={() => addToDay(place.id)} />
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
              {noListPlaces.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[11px] font-medium text-text-muted">Other</span>
                    <span className="text-[10px] text-text-placeholder">{noListPlaces.length}</span>
                  </div>
                  <div className="space-y-0.5">
                    {noListPlaces.map((place) => (
                      <PlaceRow key={place.id} place={place} onAdd={() => addToDay(place.id)} />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Add new place */}
      <button
        onClick={() => openModal('place')}
        className="flex items-center gap-2 w-full mt-3 px-3 py-2 rounded-[8px] border border-dashed border-border-medium text-xs text-text-placeholder hover:text-text-muted hover:border-text-placeholder transition-all cursor-pointer"
      >
        <Plus size={12} />
        Add new place
      </button>
    </div>
  )
}

function PlaceRow({ place, onAdd }: { place: Place; onAdd: () => void }) {
  const catConfig = CATEGORY_CONFIG[place.category]
  return (
    <div className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-card-bg transition-colors group">
      <span
        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
        style={{ backgroundColor: catConfig.color }}
      />
      <span className="text-xs text-text-body flex-1 truncate">{place.name}</span>
      {place.area && <span className="text-[10px] text-text-placeholder truncate max-w-[60px]">{place.area}</span>}
      <button
        onClick={onAdd}
        className="p-1 rounded text-text-placeholder hover:text-primary opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
      >
        <Plus size={14} />
      </button>
    </div>
  )
}

// ─── Day Planner View ─────────────────────────────
interface DayPlannerViewProps {
  trip: Trip
  dayDates: string[]
  selectedDay: number
  onSelectDay: (day: number) => void
  onBack: () => void
}

export function DayPlannerView({ trip, dayDates, selectedDay, onSelectDay, onBack }: DayPlannerViewProps) {
  const places = useTripStore((s) => s.places)
  const dayNotes = useTripStore((s) => s.dayNotes)
  const updatePlace = useTripStore((s) => s.updatePlace)
  const setDayNote = useTripStore((s) => s.setDayNote)
  const openModal = useUIStore((s) => s.openModal)

  const [activeId, setActiveId] = useState<string | null>(null)
  const [editingNote, setEditingNote] = useState(false)
  const [noteText, setNoteText] = useState('')

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )

  const date = dayDates[selectedDay]
  const dayPlaces = places
    .filter((p) => p.dayIndex === selectedDay)
    .sort((a, b) => (a.orderInDay ?? 0) - (b.orderInDay ?? 0))
  const dayNote = dayNotes.find((dn) => dn.dayIndex === selectedDay)
  const activePlace = activeId ? places.find((p) => p.id === activeId) : null

  const startEditNote = () => {
    setNoteText(dayNote?.content || '')
    setEditingNote(true)
  }

  const saveNote = async () => {
    await setDayNote(trip.id, selectedDay, noteText)
    setEditingNote(false)
  }

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)
    if (!over || active.id === over.id) return

    const activePlace = places.find((p) => p.id === active.id)
    const overPlace = places.find((p) => p.id === over.id)
    if (!activePlace || !overPlace) return

    const dayItems = places
      .filter((p) => p.dayIndex === selectedDay && p.id !== activePlace.id)
      .sort((a, b) => (a.orderInDay ?? 0) - (b.orderInDay ?? 0))

    const overIndex = dayItems.findIndex((p) => p.id === over.id)
    dayItems.splice(overIndex, 0, activePlace)

    for (let i = 0; i < dayItems.length; i++) {
      if (dayItems[i].orderInDay !== i) {
        await updatePlace(dayItems[i].id, { dayIndex: selectedDay, orderInDay: i })
      }
    }
  }

  const sortableIds = dayPlaces.map((p) => p.id)

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div>
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={onBack}
            className="p-2 rounded-[8px] text-text-muted hover:text-text-body hover:bg-surface-high transition-all cursor-pointer"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold font-heading tracking-tight">Day {selectedDay + 1}</h1>
              <span className="text-sm text-text-muted">
                — {formatDayOfWeek(date)}, {formatDateShort(date)}
              </span>
            </div>
          </div>
        </div>

        {/* Day Navigation Strip */}
        <DayStrip
          dayDates={dayDates}
          selectedDay={selectedDay}
          onSelectDay={onSelectDay}
          places={places}
          dayNotes={dayNotes.map((dn) => ({ dayIndex: dn.dayIndex, content: dn.content }))}
        />

        {/* Two Column Layout */}
        <div className="flex gap-6">
          {/* Left: Day Schedule */}
          <div className="flex-1 min-w-0">
            {/* Day Note */}
            {editingNote ? (
              <div className="mb-6">
                <textarea
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  onBlur={saveNote}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); saveNote() }
                    if (e.key === 'Escape') setEditingNote(false)
                  }}
                  placeholder="Add a note for this day..."
                  autoFocus
                  rows={2}
                  className="w-full px-4 py-3 text-sm rounded-[10px] bg-primary-light border border-primary/20 text-text-body placeholder:text-text-placeholder focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                />
              </div>
            ) : dayNote?.content ? (
              <button
                onClick={startEditNote}
                className="w-full text-left mb-6 px-4 py-3 bg-primary-light rounded-[10px] cursor-pointer hover:bg-primary-light/70 transition-colors"
              >
                <p className="text-sm text-text-body">{dayNote.content}</p>
              </button>
            ) : (
              <button
                onClick={startEditNote}
                className="w-full text-left mb-6 px-4 py-3 border border-dashed border-border-medium rounded-[10px] cursor-pointer hover:border-text-placeholder transition-colors"
              >
                <p className="text-xs text-text-placeholder">+ Add a note for this day</p>
              </button>
            )}

            {/* Timeline */}
            <SortableContext items={sortableIds} strategy={verticalListSortingStrategy}>
              {dayPlaces.length === 0 ? (
                <div className="border-2 border-dashed border-border-medium rounded-[12px] p-12 text-center">
                  <p className="text-sm text-text-muted mb-1">No activities planned</p>
                  <p className="text-xs text-text-placeholder">Add places from the panel on the right, or create a new one.</p>
                </div>
              ) : (
                <div>
                  {dayPlaces.map((place) => (
                    <SortableTimelineCard key={place.id} place={place} />
                  ))}
                  {/* End of timeline */}
                  <div className="flex gap-3">
                    <div className="flex flex-col items-center w-12 flex-shrink-0">
                      <div className="w-3 h-3 rounded-full bg-border-medium flex-shrink-0" />
                    </div>
                    <button
                      onClick={() => openModal('place')}
                      className="flex-1 flex items-center gap-2 px-4 py-3 rounded-[12px] border border-dashed border-border-medium text-xs text-text-placeholder hover:text-text-muted hover:border-text-placeholder transition-all cursor-pointer"
                    >
                      <Plus size={14} />
                      Add activity
                    </button>
                  </div>
                </div>
              )}
            </SortableContext>
          </div>

          {/* Right: Add to Day Panel */}
          <div className="w-72 flex-shrink-0">
            <AddToDayPanel dayIndex={selectedDay} />
          </div>
        </div>
      </div>

      <DragOverlay>
        {activePlace ? <TimelinePlaceCard place={activePlace} isOverlay /> : null}
      </DragOverlay>
    </DndContext>
  )
}
