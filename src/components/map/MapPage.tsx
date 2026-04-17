import { useState, useMemo, useEffect, useRef, useCallback } from 'react'
import { setOptions, importLibrary } from '@googlemaps/js-api-loader'
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  Search, Loader2, MapPin, Plus, Check, GripVertical,
  Star, Globe, Phone, Clock, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, X, Maximize2, Navigation,
} from 'lucide-react'
import { format, addDays, parseISO } from 'date-fns'
import { PlacePhoto } from '../shared/PlacePhoto'
import { CategoryBadge } from '../shared/CategoryBadge'
import { useTripStore } from '../../stores/tripStore'
import { useUIStore } from '../../stores/uiStore'
import { CATEGORY_CONFIG, PLACE_CATEGORIES } from '../../utils/categories'
import {
  searchPlaces, textSearchPlaces, getPlaceDetails,
  getPhotoUrl,
} from '../../services/googlePlaces'
import type { PlaceSuggestion, PlaceDetails, ViewportBounds } from '../../services/googlePlaces'
import type { Place, PlaceCategory } from '../../types'

// ─── Constants ─────────────────────────────────────────────────────────────────

const CATEGORY_HEX: Record<PlaceCategory, string> = {
  food:      '#22c55e',
  temple:    '#3b82f6',
  shopping:  '#a855f7',
  activity:  '#f59e0b',
  nightlife: '#ec4899',
  nature:    '#10b981',
  culture:   '#6366f1',
  other:     '#6b7280',
}

const MAP_STYLES: google.maps.MapTypeStyle[] = [
  { elementType: 'geometry',                stylers: [{ color: '#f8f4ef' }] },
  { elementType: 'labels.text.stroke',      stylers: [{ color: '#f5f1ec' }] },
  { elementType: 'labels.text.fill',        stylers: [{ color: '#7c6e5b' }] },
  { featureType: 'administrative.locality', elementType: 'labels.text.fill',  stylers: [{ color: '#5c4f40' }] },
  { featureType: 'poi',                     stylers: [{ visibility: 'off' }] },
  { featureType: 'poi.park',                elementType: 'geometry',           stylers: [{ color: '#d4ebcc' }] },
  { featureType: 'poi.park',                elementType: 'labels.text.fill',   stylers: [{ color: '#6a9a55' }, { visibility: 'on' }] },
  { featureType: 'road',                    elementType: 'geometry',           stylers: [{ color: '#ffffff' }] },
  { featureType: 'road',                    elementType: 'geometry.stroke',    stylers: [{ color: '#e8e0d5' }] },
  { featureType: 'road',                    elementType: 'labels.text.fill',   stylers: [{ color: '#9c8c7a' }] },
  { featureType: 'road.highway',            elementType: 'geometry',           stylers: [{ color: '#fce8c4' }] },
  { featureType: 'road.highway',            elementType: 'geometry.stroke',    stylers: [{ color: '#f5d49a' }] },
  { featureType: 'road.highway',            elementType: 'labels.text.fill',   stylers: [{ color: '#8a7060' }] },
  { featureType: 'transit.station',         stylers: [{ visibility: 'simplified' }] },
  { featureType: 'water',                   elementType: 'geometry',           stylers: [{ color: '#b8d9ec' }] },
  { featureType: 'water',                   elementType: 'labels.text.fill',   stylers: [{ color: '#4a7a99' }] },
]

setOptions({
  key: import.meta.env.VITE_GOOGLE_PLACES_API_KEY as string,
  version: 'weekly',
} as any)

// ─── Helpers ───────────────────────────────────────────────────────────────────

function makePinSvg(color: string, selected = false, isSearch = false, label?: string): string {
  const size = selected ? 36 : 28
  const r = size / 2 - 3
  const stroke = isSearch ? '#f59e0b' : 'white'
  const sw = selected || isSearch ? 3 : 2.5
  const labelSvg = label
    ? `<text x="${size/2}" y="${size/2}" text-anchor="middle" dominant-baseline="central" fill="white" font-family="Arial,sans-serif" font-weight="700" font-size="${selected ? 14 : 11}">${label}</text>`
    : ''
  return `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
      <circle cx="${size/2}" cy="${size/2}" r="${r}" fill="${color}" stroke="${stroke}" stroke-width="${sw}"
        filter="url(#s)"/>
      ${labelSvg}
      <defs>
        <filter id="s" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="1" stdDeviation="2" flood-opacity="0.3"/>
        </filter>
      </defs>
    </svg>`
  )}`
}

function makeHotelPinSvg(): string {
  const size = 36
  return `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
      <rect x="2" y="2" width="32" height="32" rx="8" fill="#7c3aed" stroke="white" stroke-width="2.5"
        filter="url(#s)"/>
      <path d="M12 22v-4h8v4M10 22h12M11 18v-4h4v4M17 18v-2h3v2M13 14v-2" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
      <defs>
        <filter id="s" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="1" stdDeviation="2" flood-opacity="0.3"/>
        </filter>
      </defs>
    </svg>`
  )}`
}

function inferCategory(types: string[] = []): PlaceCategory {
  const t = types.join(',')
  if (/restaurant|food|cafe|bakery|meal|ramen|sushi/.test(t)) return 'food'
  if (/shrine|temple|place_of_worship|church|mosque|buddhist|shinto/.test(t)) return 'temple'
  if (/store|shop|mall|market|retail|clothing|book/.test(t)) return 'shopping'
  if (/amusement|zoo|aquarium|stadium|sport|entertainment/.test(t)) return 'activity'
  if (/night_club|casino|bar|karaoke/.test(t)) return 'nightlife'
  if (/park|nature|garden|forest|beach|mountain/.test(t)) return 'nature'
  if (/museum|gallery|art|theater|heritage|cultural/.test(t)) return 'culture'
  return 'other'
}

function getCityLabel(dayPlaces: Place[]): string {
  if (!dayPlaces.length) return ''
  const counts = new Map<string, number>()
  dayPlaces.forEach((p) => { if (p.area) counts.set(p.area, (counts.get(p.area) ?? 0) + 1) })
  if (!counts.size) return ''
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0][0]
}

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return debounced
}

// ─── Left Panel — Sortable Place Row ──────────────────────────────────────────

function SortablePlaceRow({
  place, index, isSelected, onClick, onRemove,
}: {
  place: Place
  index: number
  isSelected: boolean
  onClick: (place: Place) => void
  onRemove: (placeId: string) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: place.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-1 rounded-[8px] transition-all group/row ${
        isSelected
          ? 'bg-amber-100 border border-amber-200'
          : 'hover:bg-[#ede8e0]'
      }`}
    >
      {/* Drag handle */}
      <div
        {...attributes}
        {...listeners}
        className="flex-shrink-0 pl-1 py-2 cursor-grab active:cursor-grabbing text-text-placeholder hover:text-text-muted"
      >
        <GripVertical size={12} />
      </div>

      {/* Index number */}
      <span className="flex-shrink-0 w-4 text-center text-[10px] font-bold text-text-muted">{index}</span>

      {/* Clickable content */}
      <button
        onClick={() => onClick(place)}
        className="flex items-center gap-2 flex-1 min-w-0 pr-1 py-2 text-left cursor-pointer"
      >
        <PlacePhoto
          photoName={place.photoName}
          category={place.category}
          className="w-8 h-8 rounded-[6px] flex-shrink-0"
          width={64}
        />
        <div className="min-w-0 flex-1">
          <div className="text-[11px] font-semibold text-text-heading truncate">{place.name}</div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ backgroundColor: CATEGORY_HEX[place.category] }}
            />
            {place.timeSlot && (
              <span className="text-[10px] text-text-muted truncate">{place.timeSlot}</span>
            )}
          </div>
        </div>
      </button>

      {/* Remove button */}
      <button
        onClick={(e) => { e.stopPropagation(); onRemove(place.id) }}
        className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mr-1 text-text-placeholder hover:text-red-500 hover:bg-red-50 opacity-0 group-hover/row:opacity-100 transition-all cursor-pointer"
        title="Remove from day"
      >
        <X size={10} />
      </button>
    </div>
  )
}

// ─── Left Panel — Day Add Input ───────────────────────────────────────────────

function DayAddInput({
  dayIndex, savedPlaceIds, onPlaceAdded, getBounds,
}: {
  dayIndex: number
  savedPlaceIds: Set<string>
  onPlaceAdded: (details: PlaceDetails, dayIndex: number) => void
  getBounds: () => ViewportBounds | null
}) {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [open, setOpen] = useState(false)
  const [activeIdx, setActiveIdx] = useState(-1)
  const containerRef = useRef<HTMLDivElement>(null)
  const debouncedQuery = useDebounce(query, 300)

  useEffect(() => {
    if (debouncedQuery.trim().length < 2) { setSuggestions([]); setOpen(false); return }
    let cancelled = false
    setIsSearching(true)
    searchPlaces(debouncedQuery, getBounds() ?? undefined).then((res) => {
      if (cancelled) return
      setSuggestions(res)
      setOpen(res.length > 0)
      setIsSearching(false)
      setActiveIdx(-1)
    })
    return () => { cancelled = true }
  }, [debouncedQuery])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleSelect = async (s: PlaceSuggestion) => {
    setOpen(false)
    setQuery('')
    setSuggestions([])
    const details = await getPlaceDetails(s.placeId)
    if (details) onPlaceAdded(details, dayIndex)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open) return
    if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIdx((i) => Math.min(i + 1, suggestions.length - 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIdx((i) => Math.max(i - 1, 0)) }
    else if (e.key === 'Enter' && activeIdx >= 0) { e.preventDefault(); handleSelect(suggestions[activeIdx]) }
  }

  return (
    <div ref={containerRef} className="relative mt-1.5">
      <div className="relative">
        {isSearching
          ? <Loader2 size={11} className="absolute left-2 top-1/2 -translate-y-1/2 text-primary animate-spin" />
          : <Search size={11} className="absolute left-2 top-1/2 -translate-y-1/2 text-text-placeholder" />
        }
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
          placeholder="Add a place..."
          className="w-full pl-6 pr-2 py-1.5 text-[11px] bg-white rounded-[8px] text-text-body placeholder:text-text-placeholder focus:outline-none focus:ring-1 focus:ring-primary/30 shadow-sm"
        />
      </div>
      {open && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-[10px] shadow-modal overflow-hidden z-[100]">
          {suggestions.map((s, i) => (
            <button
              key={s.placeId}
              onMouseDown={(e) => { e.preventDefault(); handleSelect(s) }}
              onMouseEnter={() => setActiveIdx(i)}
              className={`w-full flex items-center gap-2 px-2.5 py-2 text-left transition-colors cursor-pointer ${
                i === activeIdx ? 'bg-surface-high' : 'hover:bg-surface-high'
              } ${i > 0 ? 'border-t border-[#f0ebe4]' : ''}`}
            >
              <MapPin size={10} className="text-primary flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="text-[11px] font-medium text-text-heading truncate">{s.mainText}</div>
                {s.secondaryText && (
                  <div className="text-[10px] text-text-muted truncate">{s.secondaryText}</div>
                )}
              </div>
              {savedPlaceIds.has(s.placeId) && (
                <span className="flex-shrink-0 text-[9px] font-semibold text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full">
                  Saved
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Left Panel — Itinerary Days ───────────────────────────────────────────────

function ItineraryPanel({
  trip, places, activeDay, onDayChange, selectedPlaceId, onPlaceSelect, onRemoveFromDay, onReorderDay, onPlaceAdded, savedPlaceIds, getBounds,
}: {
  trip: ReturnType<typeof useTripStore>['trip']
  places: Place[]
  activeDay: number | null
  onDayChange: (day: number | null) => void
  selectedPlaceId: string | null
  onPlaceSelect: (place: Place) => void
  onRemoveFromDay: (placeId: string) => void
  onReorderDay: (dayIndex: number, orderedIds: string[]) => void
  onPlaceAdded: (details: PlaceDetails, dayIndex: number) => void
  savedPlaceIds: Set<string>
  getBounds: () => ViewportBounds | null
}) {
  const [expandedDays, setExpandedDays] = useState<Set<number>>(new Set())
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  if (!trip) return null

  const startDate = parseISO(trip.startDate)
  const duration = Math.ceil(
    (parseISO(trip.endDate).getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
  ) + 1

  const days = Array.from({ length: duration }, (_, i) => {
    const dayPlaces = places
      .filter((p) => p.dayIndex === i)
      .sort((a, b) => (a.orderInDay ?? 0) - (b.orderInDay ?? 0) || (a.timeSlot ?? '').localeCompare(b.timeSlot ?? ''))
    const date = addDays(startDate, i)
    return { dayIndex: i, date, dayPlaces, city: getCityLabel(dayPlaces) }
  })


  const handleDayClick = (dayIndex: number) => {
    const isActive = activeDay === dayIndex
    onDayChange(isActive ? null : dayIndex)
    if (isActive) {
      setExpandedDays((prev) => { const next = new Set(prev); next.delete(dayIndex); return next })
    } else {
      setExpandedDays((prev) => new Set(prev).add(dayIndex))
    }
  }

  return (
    <div className="w-64 flex-shrink-0 flex flex-col bg-[#f7f3ed] border-r border-[#e8e0d5] overflow-hidden">
      {/* Header */}
      <div className="px-4 pt-4 pb-3">
        <p className="text-[10px] uppercase tracking-widest font-semibold text-text-muted">My Itinerary</p>
      </div>

      {/* Day list */}
      <div className="flex-1 overflow-y-auto px-3 pb-4 space-y-0.5">
        {days.map(({ dayIndex, date, dayPlaces, city }) => {
          const isActive = activeDay === dayIndex
          const isExpanded = expandedDays.has(dayIndex)
          const hasPlaces = dayPlaces.length > 0
          return (
            <div key={dayIndex}>
              <button
                onClick={() => handleDayClick(dayIndex)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-[10px] transition-all text-left cursor-pointer ${
                  isActive
                    ? 'bg-amber-50 border border-amber-200'
                    : 'hover:bg-[#ede8e0]'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold ${
                    isActive ? 'bg-primary text-white' : 'bg-[#e8e0d5] text-text-muted'
                  }`}>
                    {dayIndex + 1}
                  </div>
                  <div className="min-w-0">
                    <div className={`text-xs font-semibold truncate ${isActive ? 'text-amber-900' : 'text-text-heading'}`}>
                      {format(date, 'EEE, MMM d')}
                    </div>
                    {city && (
                      <div className="text-[10px] text-text-muted truncate">{city}</div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {hasPlaces && (
                    <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                      isActive ? 'bg-amber-200 text-amber-800' : 'bg-[#e8e0d5] text-text-muted'
                    }`}>
                      {dayPlaces.length}
                    </span>
                  )}
                  {isExpanded
                    ? <ChevronUp size={12} className="text-text-muted" />
                    : <ChevronDown size={12} className="text-text-muted" />
                  }
                </div>
              </button>

              {/* Expanded content */}
              {isExpanded && (
                <div className="ml-5 pl-3 border-l-2 border-[#e8e0d5] mt-1 mb-1.5 space-y-0.5">
                  {hasPlaces && (
                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={(event: DragEndEvent) => {
                        const { active, over } = event
                        if (!over || active.id === over.id) return
                        const ids = dayPlaces.map((p) => p.id)
                        const oldIdx = ids.indexOf(active.id as string)
                        const newIdx = ids.indexOf(over.id as string)
                        if (oldIdx === -1 || newIdx === -1) return
                        const reordered = [...ids]
                        reordered.splice(oldIdx, 1)
                        reordered.splice(newIdx, 0, active.id as string)
                        onReorderDay(dayIndex, reordered)
                      }}
                    >
                      <SortableContext items={dayPlaces.map((p) => p.id)} strategy={verticalListSortingStrategy}>
                        {dayPlaces.map((place, idx) => (
                          <SortablePlaceRow
                            key={place.id}
                            place={place}
                            index={idx + 1}
                            isSelected={selectedPlaceId === place.id}
                            onClick={onPlaceSelect}
                            onRemove={onRemoveFromDay}
                          />
                        ))}
                      </SortableContext>
                    </DndContext>
                  )}
                  <DayAddInput
                    dayIndex={dayIndex}
                    savedPlaceIds={savedPlaceIds}
                    onPlaceAdded={onPlaceAdded}
                    getBounds={getBounds}
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Floating Search Bar ───────────────────────────────────────────────────────

function FloatingSearch({
  onSearchSubmit,
  onSuggestionSelect,
  getBounds,
  isSearching,
  savedPlaceIds,
}: {
  onSearchSubmit: (query: string) => void
  onSuggestionSelect: (s: PlaceSuggestion) => void
  getBounds: () => ViewportBounds | null
  isSearching: boolean
  savedPlaceIds: Set<string>
}) {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([])
  const [suggesting, setSuggesting] = useState(false)
  const [open, setOpen] = useState(false)
  const [activeIdx, setActiveIdx] = useState(-1)
  const containerRef = useRef<HTMLDivElement>(null)
  const debouncedQuery = useDebounce(query, 300)

  useEffect(() => {
    if (debouncedQuery.trim().length < 2) { setSuggestions([]); setOpen(false); return }
    let cancelled = false
    setSuggesting(true)
    searchPlaces(debouncedQuery, getBounds() ?? undefined).then((res) => {
      if (cancelled) return
      setSuggestions(res)
      setOpen(res.length > 0)
      setSuggesting(false)
      setActiveIdx(-1)
    })
    return () => { cancelled = true }
  }, [debouncedQuery])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleSuggestionClick = async (s: PlaceSuggestion) => {
    setOpen(false)
    setQuery('')
    onSuggestionSelect(s)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return
    setOpen(false)
    onSearchSubmit(query.trim())
    setQuery('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open) return
    if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIdx((i) => Math.min(i + 1, suggestions.length - 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIdx((i) => Math.max(i - 1, 0)) }
    else if (e.key === 'Enter' && activeIdx >= 0) { e.preventDefault(); handleSuggestionClick(suggestions[activeIdx]) }
  }

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[10] flex flex-col items-center gap-2 pointer-events-none w-full max-w-md px-4">
      {/* Search input */}
      <div ref={containerRef} className="relative w-full pointer-events-auto">
        <form onSubmit={handleSubmit} className="relative">
          {(isSearching || suggesting)
            ? <Loader2 size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-primary animate-spin z-10" />
            : <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-placeholder z-10" />
          }
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => suggestions.length > 0 && setOpen(true)}
            placeholder="Search places… (Enter for results)"
            className="w-full pl-9 pr-10 py-2.5 text-sm rounded-full bg-white shadow-dropdown text-text-body placeholder:text-text-placeholder focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
          />
          {query && (
            <button
              type="button"
              onClick={() => { setQuery(''); setSuggestions([]); setOpen(false) }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-placeholder hover:text-text-body transition-colors cursor-pointer"
            >
              <X size={13} />
            </button>
          )}
        </form>

        {/* Autocomplete dropdown */}
        {open && suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-[12px] shadow-modal overflow-hidden z-[10000]">
            {suggestions.map((s, i) => (
              <button
                key={s.placeId}
                onMouseDown={(e) => { e.preventDefault(); handleSuggestionClick(s) }}
                onMouseEnter={() => setActiveIdx(i)}
                className={`w-full flex items-start gap-3 px-4 py-2.5 text-left transition-colors cursor-pointer ${
                  i === activeIdx ? 'bg-surface-high' : 'hover:bg-surface-high'
                } ${i > 0 ? 'border-t border-[#f0ebe4]' : ''}`}
              >
                <MapPin size={13} className="text-primary flex-shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium text-text-heading truncate">{s.mainText}</div>
                  {s.secondaryText && (
                    <div className="text-xs text-text-muted truncate">{s.secondaryText}</div>
                  )}
                </div>
                {savedPlaceIds.has(s.placeId) && (
                  <span className="flex-shrink-0 text-[10px] font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full mt-0.5">
                    Saved
                  </span>
                )}
              </button>
            ))}
            <div className="px-4 py-1.5 border-t border-[#f0ebe4] flex justify-end">
              <span className="text-[10px] text-text-placeholder">Powered by Google</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Bottom Carousel — Centered Single Card ──────────────────────────────────

function BottomCarousel({
  results,
  query,
  savedPlaceIds,
  activeSearchPlaceId,
  onSelect,
  onExpand,
  onQuickAdd,
  onClear,
}: {
  results: PlaceDetails[]
  query: string
  savedPlaceIds: Set<string>
  activeSearchPlaceId: string | null
  onSelect: (d: PlaceDetails) => void
  onExpand: (d: PlaceDetails) => void
  onQuickAdd: (d: PlaceDetails) => void
  onClear: () => void
}) {
  const [activeIdx, setActiveIdx] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  // Reset to first card when results change
  useEffect(() => {
    setActiveIdx(0)
  }, [results])

  // Sync carousel index when a marker is clicked externally
  useEffect(() => {
    if (!activeSearchPlaceId || results.length === 0) return
    const idx = results.findIndex((r) => r.placeId === activeSearchPlaceId)
    if (idx !== -1 && idx !== activeIdx) {
      setActiveIdx(idx)
    }
  }, [activeSearchPlaceId, results])

  // Pan map whenever active card changes
  useEffect(() => {
    if (results.length === 0) return
    const current = results[activeIdx]
    if (current) onSelect(current)
  }, [activeIdx, results])

  // Keyboard navigation
  useEffect(() => {
    if (results.length === 0) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') { e.preventDefault(); setActiveIdx((i) => Math.max(0, i - 1)) }
      else if (e.key === 'ArrowRight') { e.preventDefault(); setActiveIdx((i) => Math.min(results.length - 1, i + 1)) }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [results.length])

  if (results.length === 0) {
    return (
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[5] pointer-events-none">
        <div className="bg-white rounded-full px-5 py-2 shadow-card">
          <p className="text-xs text-text-muted">Search to discover places</p>
        </div>
      </div>
    )
  }

  const current = results[activeIdx]
  const inferredCat = inferCategory(current.types)
  const isSaved = savedPlaceIds.has(current.placeId)

  return (
    <div ref={containerRef} className="absolute bottom-5 left-1/2 -translate-x-1/2 z-[5] w-full max-w-[500px] px-4">
      {/* Counter pill — floating above card */}
      <div className="flex items-center justify-center mb-2.5">
        <div className="bg-white rounded-full px-4 py-1.5 shadow-card flex items-center gap-2">
          <span className="text-[11px] text-text-muted">
            <span className="font-semibold text-text-heading">{activeIdx + 1}</span> / {results.length}
            <span className="ml-1.5 text-text-placeholder">"{query}"</span>
          </span>
          <span className="text-[#e8e0d5]">·</span>
          <button
            onClick={onClear}
            className="text-[11px] text-text-muted hover:text-text-body transition-colors cursor-pointer"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Card + arrows row */}
      <div className="flex items-center gap-2">
        {/* Left arrow */}
        {results.length > 1 && (
          <button
            onClick={() => setActiveIdx((i) => Math.max(0, i - 1))}
            disabled={activeIdx === 0}
            className="flex-shrink-0 w-9 h-9 rounded-full bg-white shadow-card hover:shadow-card-hover flex items-center justify-center transition-all cursor-pointer disabled:opacity-30 disabled:cursor-default"
          >
            <ChevronLeft size={18} className="text-text-body" />
          </button>
        )}

        {/* Card */}
        <div className="flex-1 min-w-0 bg-white rounded-[16px] shadow-card-hover overflow-hidden">
          <div className="flex">
            {/* Photo */}
            <div className="w-[140px] flex-shrink-0">
              <PlacePhoto
                photoName={current.photoName}
                category={inferredCat}
                className="w-full h-full"
                width={280}
              />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0 px-4 py-3 flex flex-col justify-center">
              <p className="text-sm font-semibold font-heading text-text-heading leading-snug line-clamp-2 mb-1.5">{current.name}</p>
              <div className="flex items-center gap-2 mb-1.5">
                <CategoryBadge category={inferredCat} size="sm" />
                {current.rating && (
                  <span className="flex items-center gap-0.5 text-xs font-semibold text-amber-500">
                    <Star size={10} fill="currentColor" />
                    {current.rating.toFixed(1)}
                  </span>
                )}
              </div>
              {current.address && (
                <p className="text-[11px] text-text-muted line-clamp-2 leading-relaxed mb-1">{current.address}</p>
              )}
              <div className="flex items-center gap-3 flex-wrap">
                {current.phoneNumber && (
                  <span className="flex items-center gap-1 text-[10px] text-text-muted">
                    <Phone size={10} className="flex-shrink-0" />
                    <span className="truncate max-w-[120px]">{current.phoneNumber}</span>
                  </span>
                )}
                {current.websiteUri && (
                  <span className="flex items-center gap-1 text-[10px] text-primary">
                    <Globe size={10} className="flex-shrink-0" />
                    <span className="truncate max-w-[120px]">{current.websiteUri.replace(/^https?:\/\//, '').replace(/\/.*/, '')}</span>
                  </span>
                )}
              </div>
            </div>

            {/* Right action buttons */}
            <div className="flex flex-col items-center justify-center gap-2 pr-3 flex-shrink-0">
              <button
                onClick={() => onExpand(current)}
                className="w-8 h-8 rounded-[8px] bg-surface-high hover:bg-surface-highest flex items-center justify-center transition-all cursor-pointer"
                title="View details"
              >
                <Maximize2 size={14} className="text-text-body" />
              </button>
              <button
                onClick={() => { if (!isSaved) onQuickAdd(current) }}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                  isSaved
                    ? 'bg-green-100 text-green-600'
                    : 'bg-amber-50 text-primary hover:bg-amber-100'
                }`}
                title={isSaved ? 'Already in trip' : 'Quick add'}
              >
                {isSaved ? <Check size={13} /> : <Plus size={13} />}
              </button>
            </div>
          </div>
        </div>

        {/* Right arrow */}
        {results.length > 1 && (
          <button
            onClick={() => setActiveIdx((i) => Math.min(results.length - 1, i + 1))}
            disabled={activeIdx === results.length - 1}
            className="flex-shrink-0 w-9 h-9 rounded-full bg-white shadow-card hover:shadow-card-hover flex items-center justify-center transition-all cursor-pointer disabled:opacity-30 disabled:cursor-default"
          >
            <ChevronRight size={18} className="text-text-body" />
          </button>
        )}
      </div>
    </div>
  )
}

// ─── Place Detail Modal ───────────────────────────────────────────────────────

function PlaceDetailModal({
  details,
  savedPlaceIds,
  onClose,
  onAdded,
}: {
  details: PlaceDetails | null
  savedPlaceIds: Set<string>
  onClose: () => void
  onAdded: () => void
}) {
  const trip        = useTripStore((s) => s.trip)
  const addPlace    = useTripStore((s) => s.addPlace)
  const customLists = useTripStore((s) => s.customLists)
  const addList     = useTripStore((s) => s.addList)
  const showToast   = useUIStore((s) => s.showToast)

  const overlayRef = useRef<HTMLDivElement>(null)

  const isSaved     = details ? savedPlaceIds.has(details.placeId) : false
  const inferredCat = details ? inferCategory(details.types) : 'other'

  const [category, setCategory]             = useState<PlaceCategory>(inferredCat)
  const [saving, setSaving]                 = useState(false)
  const [saved, setSaved]                   = useState(isSaved)
  const [hoursOpen, setHoursOpen]           = useState(false)
  const [activePhotoIdx, setActivePhotoIdx] = useState(0)
  const [dropdownOpen, setDropdownOpen]     = useState(false)
  const [showNewListInput, setShowNewListInput] = useState(false)
  const [newListName, setNewListName]       = useState('')
  const [creatingList, setCreatingList]     = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Reset state when details change
  useEffect(() => {
    if (details) {
      setCategory(inferCategory(details.types))
      setSaved(savedPlaceIds.has(details.placeId))
      setSaving(false)
      setHoursOpen(false)
      setActivePhotoIdx(0)
      setDropdownOpen(false)
      setShowNewListInput(false)
      setNewListName('')
    }
  }, [details?.placeId])

  // Escape to close
  useEffect(() => {
    if (!details) return
    const handleEscape = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [details, onClose])

  // Close dropdown on outside click
  useEffect(() => {
    if (!dropdownOpen) return
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
        setShowNewListInput(false)
        setNewListName('')
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [dropdownOpen])

  if (!details) return null

  const photos    = details.photoNames ?? (details.photoName ? [details.photoName] : [])
  const heroPhoto = photos[activePhotoIdx]

  const doAdd = async (listId: string | null) => {
    if (!trip) return
    setSaving(true)
    setDropdownOpen(false)
    setShowNewListInput(false)
    await addPlace({
      tripId: trip.id,
      name: details.name,
      category,
      priority: 'want-to',
      notes: '',
      address: details.address,
      area: '',
      lat: details.lat,
      lng: details.lng,
      links: details.websiteUri ? [details.websiteUri] : [],
      listIds: listId ? [listId] : [],
      dayIndex: null,
      orderInDay: 0,
      timeSlot: '',
      googlePlaceId: details.placeId,
      photoName: details.photoName,
      photoNames: details.photoNames,
      rating: details.rating,
      websiteUri: details.websiteUri,
      phoneNumber: details.phoneNumber,
      openingHours: details.openingHours,
      types: details.types,
    })
    setSaving(false)
    setSaved(true)
    const list = listId ? customLists.find((l) => l.id === listId) : null
    showToast(list ? `Added "${details.name}" to ${list.name}` : `Added "${details.name}" to your trip`)
    onAdded()
  }

  const handleCreateAndAdd = async () => {
    if (!trip || !newListName.trim()) return
    setCreatingList(true)
    const list = await addList({ tripId: trip.id, name: newListName.trim(), color: undefined, icon: undefined })
    setCreatingList(false)
    setNewListName('')
    await doAdd(list.id)
  }

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4"
      onClick={(e) => { if (e.target === overlayRef.current) onClose() }}
    >
      <div
        className="max-w-md w-full bg-white rounded-[16px] shadow-modal overflow-hidden max-h-[85vh] flex flex-col"
        style={{ animation: 'modalIn 0.15s ease-out' }}
      >
        {/* Hero photo with X button */}
        <div className="relative flex-shrink-0" style={{ height: '200px' }}>
          {heroPhoto ? (
            <img src={getPhotoUrl(heroPhoto, 800)} alt={details.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-surface-high flex items-center justify-center">
              <MapPin size={32} className="text-text-placeholder" />
            </div>
          )}
          {/* X close button */}
          <button
            onClick={onClose}
            className="absolute top-3 left-3 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center transition-all cursor-pointer"
          >
            <X size={16} className="text-white" />
          </button>
          {/* Photo gallery strip */}
          {photos.length > 1 && (
            <div className="absolute bottom-2 right-2 flex gap-1">
              {photos.map((ph, i) => (
                <button
                  key={ph}
                  onClick={() => setActivePhotoIdx(i)}
                  className={`w-7 h-7 rounded-[6px] overflow-hidden border-2 transition-all cursor-pointer ${
                    i === activePhotoIdx ? 'border-white' : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={getPhotoUrl(ph, 80)} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Scrollable info content */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          <div>
            <h2 className="text-base font-bold font-heading text-text-heading leading-tight mb-1.5">{details.name}</h2>
            <div className="flex items-center gap-2 flex-wrap">
              <CategoryBadge category={category} />
              {details.rating && (
                <span className="flex items-center gap-0.5 text-xs font-semibold text-amber-500">
                  <Star size={11} fill="currentColor" />
                  {details.rating.toFixed(1)}
                </span>
              )}
            </div>
          </div>

          {details.address && (
            <div className="flex items-start gap-2">
              <MapPin size={13} className="text-text-muted flex-shrink-0 mt-0.5" />
              <p className="text-xs text-text-body leading-relaxed">{details.address}</p>
            </div>
          )}

          {details.openingHours && details.openingHours.length > 0 && (
            <div>
              <button
                onClick={() => setHoursOpen((v) => !v)}
                className="flex items-center gap-2 text-xs text-text-body cursor-pointer hover:text-text-heading transition-colors w-full"
              >
                <Clock size={13} className="text-text-muted flex-shrink-0" />
                <span className="flex-1 text-left">Opening hours</span>
                {hoursOpen ? <ChevronUp size={12} className="text-text-muted" /> : <ChevronDown size={12} className="text-text-muted" />}
              </button>
              {hoursOpen && (
                <div className="mt-2 ml-5 space-y-0.5">
                  {details.openingHours.map((h) => (
                    <p key={h} className="text-[11px] text-text-muted">{h}</p>
                  ))}
                </div>
              )}
            </div>
          )}

          {details.websiteUri && (
            <a
              href={details.websiteUri}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-xs text-primary hover:underline"
            >
              <Globe size={13} className="flex-shrink-0" />
              <span className="truncate">{details.websiteUri.replace(/^https?:\/\//, '').replace(/\/$/, '')}</span>
            </a>
          )}

          {details.phoneNumber && (
            <div className="flex items-center gap-2 text-xs text-text-body">
              <Phone size={13} className="text-text-muted flex-shrink-0" />
              <span>{details.phoneNumber}</span>
            </div>
          )}
        </div>

        {/* Bottom actions */}
        <div className="flex-shrink-0 border-t border-[#f0ebe4] px-5 py-3">
          {saved ? (
            <div className="flex items-center gap-2 text-sm text-green-600 font-medium">
              <Check size={15} />
              Added to your trip!
            </div>
          ) : (
            <div className="space-y-2.5">
              {/* Category selector */}
              <div className="flex flex-wrap gap-1">
                {PLACE_CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={`px-2 py-1 rounded-full text-[11px] font-medium transition-all cursor-pointer ${
                      category === cat ? 'text-white' : 'bg-surface-high text-text-muted hover:bg-surface-highest'
                    }`}
                    style={category === cat ? { backgroundColor: CATEGORY_HEX[cat] } : undefined}
                  >
                    {CATEGORY_CONFIG[cat].label}
                  </button>
                ))}
              </div>

              {/* Add to List dropdown button */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => { setDropdownOpen((v) => !v); setShowNewListInput(false); setNewListName('') }}
                  disabled={saving}
                  className="w-full flex items-center justify-between px-4 py-2.5 bg-primary hover:bg-amber-700 text-white text-xs font-semibold rounded-[10px] transition-all cursor-pointer disabled:opacity-60"
                >
                  <div className="flex items-center gap-2">
                    {saving ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />}
                    Add to List
                  </div>
                  <ChevronDown
                    size={13}
                    className={`transition-transform duration-150 ${dropdownOpen ? 'rotate-180' : ''}`}
                  />
                </button>

                {/* Dropdown — opens upward */}
                {dropdownOpen && (
                  <div className="absolute bottom-full left-0 right-0 mb-1.5 bg-white rounded-[12px] shadow-modal border border-[#f0ebe4] overflow-hidden z-50">
                    {/* No-list option */}
                    <button
                      onClick={() => doAdd(null)}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-surface-high transition-colors cursor-pointer"
                    >
                      <MapPin size={13} className="text-text-muted flex-shrink-0" />
                      <span className="text-xs font-medium text-text-heading">Just add to trip</span>
                    </button>

                    {/* List rows */}
                    {customLists.length > 0 && (
                      <>
                        <div className="h-px bg-[#f0ebe4]" />
                        {customLists.map((list) => (
                          <button
                            key={list.id}
                            onClick={() => doAdd(list.id)}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-surface-high transition-colors cursor-pointer"
                          >
                            <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                            <span className="text-xs font-medium text-text-heading">{list.name}</span>
                          </button>
                        ))}
                      </>
                    )}

                    {/* New list row */}
                    <div className="h-px bg-[#f0ebe4]" />
                    {showNewListInput ? (
                      <div className="px-3 py-2 flex gap-1.5">
                        <input
                          type="text"
                          value={newListName}
                          onChange={(e) => setNewListName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleCreateAndAdd()
                            if (e.key === 'Escape') { setShowNewListInput(false); setNewListName('') }
                          }}
                          placeholder="List name…"
                          autoFocus
                          className="flex-1 px-2.5 py-1.5 bg-surface-high rounded-[8px] text-[11px] text-text-body placeholder:text-text-placeholder focus:outline-none focus:ring-2 focus:ring-primary/30"
                        />
                        <button
                          onClick={handleCreateAndAdd}
                          disabled={creatingList || !newListName.trim()}
                          className="px-2.5 py-1.5 bg-primary text-white text-[11px] font-semibold rounded-[8px] hover:bg-amber-700 transition-all cursor-pointer disabled:opacity-60 flex items-center"
                        >
                          {creatingList ? <Loader2 size={11} className="animate-spin" /> : 'Add'}
                        </button>
                        <button
                          onClick={() => { setShowNewListInput(false); setNewListName('') }}
                          className="px-2 text-text-muted hover:text-text-body transition-colors cursor-pointer"
                        >
                          <X size={11} />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setShowNewListInput(true)}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-surface-high transition-colors cursor-pointer"
                      >
                        <Plus size={13} className="text-text-muted flex-shrink-0" />
                        <span className="text-xs text-text-muted">New list…</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  )
}

// ─── Map Page ──────────────────────────────────────────────────────────────────

const DEFAULT_CENTER = { lat: 35.6762, lng: 139.6503 }
const DEFAULT_ZOOM = 12

export function MapPage() {
  const places         = useTripStore((s) => s.places)
  const trip           = useTripStore((s) => s.trip)
  const accommodations = useTripStore((s) => s.accommodations)

  // Left panel
  const [activeDay, setActiveDay] = useState<number | null>(null)
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null)

  // Search state
  const [searchResults, setSearchResults] = useState<PlaceDetails[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [activeSearchPlaceId, setActiveSearchPlaceId] = useState<string | null>(null)

  // Detail modal
  const [detailModalPlace, setDetailModalPlace] = useState<PlaceDetails | null>(null)

  // Map
  const [mapsReady, setMapsReady] = useState(false)
  const mapDivRef      = useRef<HTMLDivElement>(null)
  const mapRef         = useRef<google.maps.Map | null>(null)
  const markersRef     = useRef<Map<string, google.maps.Marker>>(new Map())
  const searchMkrsRef  = useRef<google.maps.Marker[]>([])
  const infoWindowRef  = useRef<google.maps.InfoWindow | null>(null)
  // Store a callback ref so InfoWindow HTML can trigger React state
  const openDetailModalRef = useRef<(details: PlaceDetails) => void>(() => {})
  openDetailModalRef.current = (d: PlaceDetails) => setDetailModalPlace(d)

  // My location
  const [locating, setLocating] = useState(false)
  const [locationActive, setLocationActive] = useState(false)
  const locationMarkerRef = useRef<google.maps.Marker | null>(null)
  const locationWatchRef  = useRef<number | null>(null)

  const handleMyLocation = useCallback(() => {
    if (!mapRef.current || !mapsReady) return
    if (!navigator.geolocation) return

    // Toggle off
    if (locationActive) {
      if (locationWatchRef.current !== null) {
        navigator.geolocation.clearWatch(locationWatchRef.current)
        locationWatchRef.current = null
      }
      if (locationMarkerRef.current) {
        locationMarkerRef.current.setMap(null)
        locationMarkerRef.current = null
      }
      setLocationActive(false)
      return
    }

    setLocating(true)

    const updatePosition = (pos: GeolocationPosition) => {
      const latLng = { lat: pos.coords.latitude, lng: pos.coords.longitude }

      if (!locationMarkerRef.current) {
        const blueDotSvg = `data:image/svg+xml,${encodeURIComponent(
          `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24">
            <circle cx="12" cy="12" r="10" fill="#4285F4" fill-opacity="0.15" stroke="#4285F4" stroke-width="1.5"/>
            <circle cx="12" cy="12" r="5" fill="#4285F4" stroke="white" stroke-width="2"/>
          </svg>`
        )}`
        locationMarkerRef.current = new google.maps.Marker({
          position: latLng,
          map: mapRef.current!,
          icon: { url: blueDotSvg, scaledSize: new google.maps.Size(24, 24), anchor: new google.maps.Point(12, 12) },
          zIndex: 9999,
          title: 'My Location',
        })
      } else {
        locationMarkerRef.current.setPosition(latLng)
      }

      mapRef.current!.panTo(latLng)
      mapRef.current!.setZoom(Math.max(mapRef.current!.getZoom() ?? 15, 15))
      setLocating(false)
      setLocationActive(true)
    }

    const handleError = () => {
      setLocating(false)
    }

    // Get initial position then watch
    navigator.geolocation.getCurrentPosition(updatePosition, handleError, {
      enableHighAccuracy: true,
      timeout: 10000,
    })

    locationWatchRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const latLng = { lat: pos.coords.latitude, lng: pos.coords.longitude }
        if (locationMarkerRef.current) locationMarkerRef.current.setPosition(latLng)
      },
      () => {},
      { enableHighAccuracy: true },
    )
  }, [mapsReady, locationActive])

  // Cleanup watch on unmount
  useEffect(() => {
    return () => {
      if (locationWatchRef.current !== null) {
        navigator.geolocation.clearWatch(locationWatchRef.current)
      }
      if (locationMarkerRef.current) {
        locationMarkerRef.current.setMap(null)
      }
    }
  }, [])

  // Set of saved place google IDs for quick lookup
  const savedPlaceIds = useMemo(
    () => new Set(places.map((p) => p.googlePlaceId).filter(Boolean) as string[]),
    [places],
  )

  // Filtered saved places for markers
  const filteredPlaces = useMemo(() => {
    return places.filter((p) => {
      if (!p.lat || !p.lng) return false
      if (activeDay !== null && p.dayIndex !== activeDay) return false
      return true
    })
  }, [places, activeDay])

  const getBounds = useCallback((): ViewportBounds | null => {
    const bounds = mapRef.current?.getBounds()
    if (!bounds) return null
    const sw = bounds.getSouthWest()
    const ne = bounds.getNorthEast()
    return {
      low:  { latitude: sw.lat(), longitude: sw.lng() },
      high: { latitude: ne.lat(), longitude: ne.lng() },
    }
  }, [])

  // Helper to show an anchored InfoWindow card on a marker
  const showMarkerCard = useCallback((
    marker: google.maps.Marker,
    details: PlaceDetails,
    category: PlaceCategory,
  ) => {
    if (!mapRef.current) return
    if (!infoWindowRef.current) {
      infoWindowRef.current = new google.maps.InfoWindow({ disableAutoPan: false })
    }
    const iw = infoWindowRef.current
    const catColor = CATEGORY_HEX[category]
    const ratingHtml = details.rating
      ? `<span style="display:inline-flex;align-items:center;gap:2px;margin-left:6px"><span style="color:#f59e0b;font-size:11px">★</span><span style="font-size:11px;color:#78716c">${details.rating.toFixed(1)}</span></span>`
      : ''

    const photoSrc = details.photoNames?.[0] || details.photoName
    const photoHtml = photoSrc
      ? `<img src="${getPhotoUrl(photoSrc, 400)}" alt="${details.name}" style="width:100%;height:90px;object-fit:cover;border-radius:8px 8px 0 0;display:block" />`
      : `<div style="width:100%;height:40px;background:${catColor};border-radius:8px 8px 0 0;display:flex;align-items:center;justify-content:center">
          <span style="color:white;font-size:11px;font-weight:600;text-transform:capitalize">${CATEGORY_CONFIG[category].label}</span>
        </div>`

    const cardId = `iw-expand-${details.placeId.replace(/[^a-zA-Z0-9]/g, '')}`
    iw.setContent(
      `<div style="min-width:200px;max-width:260px;overflow:hidden;border-radius:8px;margin:-8px -8px -12px">
        ${photoHtml}
        <div style="padding:8px 10px 10px">
          <div style="font-size:13px;font-weight:700;color:#1c1917;line-height:1.3;margin-bottom:4px">${details.name}</div>
          <div style="display:flex;align-items:center;gap:5px">
            <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${catColor};flex-shrink:0"></span>
            <span style="font-size:11px;color:#78716c;text-transform:capitalize">${CATEGORY_CONFIG[category].label}</span>
            ${ratingHtml}
          </div>
          <button id="${cardId}" style="margin-top:8px;padding:5px 12px;background:#f59e0b;color:white;border:none;border-radius:6px;font-size:11px;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:4px;width:100%;justify-content:center">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h6v6"/><path d="m21 3-7 7"/><path d="m3 21 7-7"/><path d="M9 21H3v-6"/></svg>
            View details
          </button>
        </div>
      </div>`
    )
    iw.open(mapRef.current, marker)

    // Attach click handler to the expand button inside the InfoWindow
    google.maps.event.addListenerOnce(iw, 'domready', () => {
      const btn = document.getElementById(cardId)
      if (btn) {
        btn.addEventListener('click', () => {
          openDetailModalRef.current(details)
          iw.close()
        })
      }
    })
  }, [])

  // Load Maps SDK
  useEffect(() => {
    Promise.all([
      importLibrary('maps'),
      importLibrary('routes'),
      importLibrary('geometry'),
    ]).then(() => setMapsReady(true)).catch(console.error)
  }, [])

  // Init map
  useEffect(() => {
    if (!mapsReady || !mapDivRef.current || mapRef.current) return
    mapRef.current = new google.maps.Map(mapDivRef.current, {
      center: DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM,
      styles: MAP_STYLES,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
      clickableIcons: false,
      zoomControlOptions: { position: google.maps.ControlPosition.RIGHT_BOTTOM },
    })
    mapRef.current.addListener('click', () => {
      // clicking empty map closes InfoWindow and clears selection
      if (infoWindowRef.current) infoWindowRef.current.close()
      setSelectedPlaceId(null)
    })
  }, [mapsReady])

  // Pan map when day changes
  useEffect(() => {
    if (!mapRef.current || !mapsReady) return
    if (activeDay === null) return
    const dayPlaces = places.filter((p) => p.dayIndex === activeDay && p.lat && p.lng)
    if (!dayPlaces.length) return
    const bounds = new google.maps.LatLngBounds()
    dayPlaces.forEach((p) => bounds.extend({ lat: p.lat!, lng: p.lng! }))
    mapRef.current.fitBounds(bounds, 80)
  }, [activeDay, mapsReady])

  // Draw walking route between day's places using Routes API
  const routePolylineRef = useRef<google.maps.Polyline | null>(null)

  useEffect(() => {
    if (!mapRef.current || !mapsReady) return

    // Clear existing route
    if (routePolylineRef.current) {
      routePolylineRef.current.setMap(null)
      routePolylineRef.current = null
    }

    if (activeDay === null) return

    const dayPlaces = places
      .filter((p) => p.dayIndex === activeDay && p.lat && p.lng)
      .sort((a, b) => (a.orderInDay ?? 0) - (b.orderInDay ?? 0) || (a.timeSlot ?? '').localeCompare(b.timeSlot ?? ''))

    if (dayPlaces.length < 2) return

    const origin = new google.maps.LatLng(dayPlaces[0].lat!, dayPlaces[0].lng!)
    const destination = new google.maps.LatLng(dayPlaces[dayPlaces.length - 1].lat!, dayPlaces[dayPlaces.length - 1].lng!)
    const intermediates = dayPlaces.slice(1, -1).map((p) => ({
      location: new google.maps.LatLng(p.lat!, p.lng!),
    }))

    // Use the new Routes API (google.maps.routes.Route.computeRoutes)
    const routesLib = (google.maps as any).routes
    if (!routesLib?.Route?.computeRoutes) return

    routesLib.Route.computeRoutes({
      origin,
      destination,
      intermediates,
      travelMode: 'WALKING',
      fields: ['path'],
    }).then((response: any) => {
      const routePath = response?.routes?.[0]?.path
      if (!routePath?.length) return
      routePolylineRef.current = new google.maps.Polyline({
        path: routePath,
        map: mapRef.current!,
        strokeColor: '#f59e0b',
        strokeOpacity: 0.6,
        strokeWeight: 4,
        zIndex: 1,
      })
    }).catch(() => {/* silently fail if routes unavailable */})
  }, [activeDay, places, mapsReady])

  // Sync saved-place markers
  useEffect(() => {
    if (!mapRef.current || !mapsReady) return
    const visibleIds = new Set(filteredPlaces.map((p) => p.id))
    markersRef.current.forEach((marker, id) => {
      if (!visibleIds.has(id)) { marker.setMap(null); markersRef.current.delete(id) }
    })
    // Build day-order map when a specific day is active
    const dayOrderMap = new Map<string, number>()
    if (activeDay !== null) {
      const dayPlaces = filteredPlaces
        .filter((p) => p.dayIndex === activeDay)
        .sort((a, b) => (a.orderInDay ?? 0) - (b.orderInDay ?? 0) || (a.timeSlot ?? '').localeCompare(b.timeSlot ?? ''))
      dayPlaces.forEach((p, i) => dayOrderMap.set(p.id, i + 1))
    }

    filteredPlaces.forEach((place) => {
      const isSelected = selectedPlaceId === place.id
      const color = CATEGORY_HEX[place.category]
      const dayLabel = dayOrderMap.get(place.id)
      const icon = {
        url: makePinSvg(color, isSelected, false, dayLabel ? String(dayLabel) : undefined),
        scaledSize: new google.maps.Size(isSelected ? 36 : 28, isSelected ? 36 : 28),
        anchor:     new google.maps.Point(isSelected ? 18 : 14, isSelected ? 18 : 14),
      }
      const existing = markersRef.current.get(place.id)
      if (existing) {
        existing.setIcon(icon)
        existing.setZIndex(isSelected ? 99 : 1)
      } else {
        const marker = new google.maps.Marker({
          position: { lat: place.lat!, lng: place.lng! },
          map: mapRef.current!,
          icon,
          title: place.name,
          zIndex: isSelected ? 99 : 1,
        })
        // Click → show anchored card with expand to modal
        marker.addListener('click', () => {
          setSelectedPlaceId(place.id)
          const details: PlaceDetails = {
            placeId: place.googlePlaceId ?? place.id,
            name: place.name,
            address: place.address ?? '',
            lat: place.lat!,
            lng: place.lng!,
            photoNames: place.photoName ? [place.photoName] : [],
            photoName: place.photoName,
            rating: place.rating,
            websiteUri: place.websiteUri,
          }
          // If we have a googlePlaceId, fetch full details for the modal
          if (place.googlePlaceId) {
            getPlaceDetails(place.googlePlaceId).then((full) => {
              showMarkerCard(marker, full ?? details, place.category)
            })
          } else {
            showMarkerCard(marker, details, place.category)
          }
        })
        markersRef.current.set(place.id, marker)
      }
    })
  }, [filteredPlaces, selectedPlaceId, activeDay, mapsReady, showMarkerCard])

  // Search result markers — create once when results change
  useEffect(() => {
    if (!mapsReady) return
    searchMkrsRef.current.forEach((m) => m.setMap(null))
    searchMkrsRef.current = []
    if (searchResults.length === 0) return

    const hoverIw = new google.maps.InfoWindow({ disableAutoPan: true })

    searchResults.forEach((r, idx) => {
      if (!r.lat || !r.lng) return
      const label = String(idx + 1)
      const icon = {
        url: makePinSvg('#f59e0b', false, true, label),
        scaledSize: new google.maps.Size(28, 28),
        anchor:     new google.maps.Point(14, 14),
      }
      const marker = new google.maps.Marker({
        position: { lat: r.lat, lng: r.lng },
        map: mapRef.current!,
        icon,
        title: r.name,
        zIndex: 10,
        animation: google.maps.Animation.DROP,
      })

      // Hover tooltip
      marker.addListener('mouseover', () => {
        hoverIw.setContent(`<div style="font-size:12px;font-weight:600;padding:2px 4px;max-width:180px">${r.name}</div>`)
        hoverIw.open(mapRef.current!, marker)
      })
      marker.addListener('mouseout', () => hoverIw.close())

      // Click → show anchored card with expand to modal + sync carousel
      marker.addListener('click', () => {
        hoverIw.close()
        const cat = inferCategory(r.types)
        showMarkerCard(marker, r, cat)
        setActiveSearchPlaceId(r.placeId)
        mapRef.current?.panTo({ lat: r.lat, lng: r.lng })
      })
      searchMkrsRef.current.push(marker)
    })
  }, [searchResults, mapsReady, showMarkerCard])

  // Update search marker icons when active selection changes (no re-creation)
  useEffect(() => {
    if (!mapsReady || searchResults.length === 0) return
    searchMkrsRef.current.forEach((marker, idx) => {
      const r = searchResults[idx]
      if (!r) return
      const isActive = activeSearchPlaceId === r.placeId
      const label = String(idx + 1)
      marker.setIcon({
        url: makePinSvg('#f59e0b', isActive, true, label),
        scaledSize: new google.maps.Size(isActive ? 36 : 28, isActive ? 36 : 28),
        anchor:     new google.maps.Point(isActive ? 18 : 14, isActive ? 18 : 14),
      })
      marker.setZIndex(isActive ? 100 : 10)
    })
  }, [activeSearchPlaceId, searchResults, mapsReady])

  // Accommodation markers — always visible
  const accomMkrsRef = useRef<google.maps.Marker[]>([])

  useEffect(() => {
    if (!mapRef.current || !mapsReady) return
    accomMkrsRef.current.forEach((m) => m.setMap(null))
    accomMkrsRef.current = []

    const accomIcon = {
      url: makeHotelPinSvg(),
      scaledSize: new google.maps.Size(36, 36),
      anchor: new google.maps.Point(18, 18),
    }

    accommodations.forEach((acc) => {
      if (!acc.lat || !acc.lng) return
      const marker = new google.maps.Marker({
        position: { lat: acc.lat, lng: acc.lng },
        map: mapRef.current!,
        icon: accomIcon,
        title: acc.name,
        zIndex: 50,
      })

      // Click → show InfoWindow with accommodation info
      marker.addListener('click', () => {
        if (!infoWindowRef.current) {
          infoWindowRef.current = new google.maps.InfoWindow({ disableAutoPan: false })
        }
        const iw = infoWindowRef.current
        const dates = acc.checkIn && acc.checkOut
          ? `<div style="font-size:10px;color:#78716c;margin-top:3px">${acc.checkIn} → ${acc.checkOut}</div>`
          : ''
        iw.setContent(
          `<div style="padding:6px 4px;min-width:140px;max-width:220px">
            <div style="display:flex;align-items:center;gap:5px;margin-bottom:3px">
              <span style="display:inline-block;width:8px;height:8px;border-radius:2px;background:#7c3aed;flex-shrink:0"></span>
              <span style="font-size:10px;color:#7c3aed;font-weight:600;text-transform:uppercase;letter-spacing:0.5px">Hotel</span>
            </div>
            <div style="font-size:13px;font-weight:700;color:#1c1917;line-height:1.3">${acc.name}</div>
            ${dates}
            ${acc.address ? `<div style="font-size:10px;color:#a8a29e;margin-top:2px">${acc.address}</div>` : ''}
          </div>`
        )
        iw.open(mapRef.current!, marker)
      })

      accomMkrsRef.current.push(marker)
    })
  }, [accommodations, mapsReady])

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleSearchSubmit = async (query: string) => {
    setIsSearching(true)
    setSearchQuery(query)
    const results = await textSearchPlaces(query, getBounds() ?? undefined)
    setIsSearching(false)
    setSearchResults(results)
    // Fit map to results
    if (results.length && mapRef.current) {
      const bounds = new google.maps.LatLngBounds()
      results.forEach((r) => { if (r.lat && r.lng) bounds.extend({ lat: r.lat, lng: r.lng }) })
      mapRef.current.fitBounds(bounds, { bottom: 140, top: 60, left: 60, right: 60 })
    }
  }

  const handleSuggestionSelect = async (s: PlaceSuggestion) => {
    setIsSearching(true)
    const details = await getPlaceDetails(s.placeId)
    setIsSearching(false)
    if (!details) return
    setDetailModalPlace(details)
    mapRef.current?.panTo({ lat: details.lat, lng: details.lng })
    mapRef.current?.setZoom(16)
  }

  const handleCarouselSelect = (details: PlaceDetails) => {
    setActiveSearchPlaceId(details.placeId)
    if (mapRef.current) {
      mapRef.current.panTo({ lat: details.lat, lng: details.lng })
    }
  }

  const handleQuickAdd = async (details: PlaceDetails) => {
    const trip_ = trip
    if (!trip_) return
    const { addPlace } = useTripStore.getState()
    await addPlace({
      tripId: trip_.id,
      name: details.name,
      category: inferCategory(details.types),
      priority: 'want-to',
      notes: '',
      address: details.address,
      area: '',
      lat: details.lat,
      lng: details.lng,
      links: details.websiteUri ? [details.websiteUri] : [],
      listIds: [],
      dayIndex: null,
      orderInDay: 0,
      timeSlot: '',
      googlePlaceId: details.placeId,
      photoName: details.photoName,
      photoNames: details.photoNames,
      rating: details.rating,
      websiteUri: details.websiteUri,
      phoneNumber: details.phoneNumber,
      openingHours: details.openingHours,
      types: details.types,
    })
    useUIStore.getState().showToast(`Added "${details.name}"`)
  }

  const handleClearResults = () => {
    setSearchResults([])
    setSearchQuery('')
    setActiveSearchPlaceId(null)
    // Clear search markers
    searchMkrsRef.current.forEach((m) => m.setMap(null))
    searchMkrsRef.current = []
    if (infoWindowRef.current) infoWindowRef.current.close()
  }

  // Remove a place from its day (unschedule, don't delete)
  const handleRemoveFromDay = useCallback(async (placeId: string) => {
    const place = places.find((p) => p.id === placeId)
    if (!place) return
    const { updatePlace } = useTripStore.getState()
    await updatePlace(placeId, { dayIndex: null, orderInDay: 0 })
    const dayNum = place.dayIndex != null ? place.dayIndex + 1 : ''
    useUIStore.getState().showToast(`Removed "${place.name}" from Day ${dayNum}`)
  }, [places])

  // Reorder places within a day
  const handleReorderDay = useCallback(async (dayIndex: number, orderedIds: string[]) => {
    const { updatePlace } = useTripStore.getState()
    for (let i = 0; i < orderedIds.length; i++) {
      const place = places.find((p) => p.id === orderedIds[i])
      if (place && place.orderInDay !== i) {
        await updatePlace(orderedIds[i], { orderInDay: i })
      }
    }
  }, [places])

  // Place added from a day's add input
  const handlePlaceAddedFromDay = useCallback(async (details: PlaceDetails, dayIndex: number) => {
    const trip_ = trip
    if (!trip_) return
    const existingDayPlaces = places.filter((p) => p.dayIndex === dayIndex)
    const { addPlace } = useTripStore.getState()
    await addPlace({
      tripId: trip_.id,
      name: details.name,
      category: inferCategory(details.types),
      priority: 'want-to',
      notes: '',
      address: details.address,
      area: '',
      lat: details.lat,
      lng: details.lng,
      links: details.websiteUri ? [details.websiteUri] : [],
      listIds: [],
      dayIndex,
      orderInDay: existingDayPlaces.length,
      timeSlot: '',
      googlePlaceId: details.placeId,
      photoName: details.photoName,
      photoNames: details.photoNames,
      rating: details.rating,
      websiteUri: details.websiteUri,
      phoneNumber: details.phoneNumber,
      openingHours: details.openingHours,
      types: details.types,
    })
    useUIStore.getState().showToast(`Added "${details.name}" to Day ${dayIndex + 1}`)

    // Show in carousel + pan map
    setSearchResults([details])
    setSearchQuery(details.name)
    setActiveSearchPlaceId(details.placeId)
    if (mapRef.current && details.lat && details.lng) {
      mapRef.current.panTo({ lat: details.lat, lng: details.lng })
      mapRef.current.setZoom(Math.max(mapRef.current.getZoom() ?? 15, 15))
    }
  }, [trip, places])

  // Place selected from the left itinerary panel
  const handlePlaceSelect = useCallback((place: Place) => {
    if (!mapRef.current || !place.lat || !place.lng) return

    setSelectedPlaceId(place.id)
    mapRef.current.panTo({ lat: place.lat, lng: place.lng })
    mapRef.current.setZoom(Math.max(mapRef.current.getZoom() ?? 15, 15))

    // Show anchored card on the marker
    const marker = markersRef.current.get(place.id)
    if (marker) {
      const details: PlaceDetails = {
        placeId: place.googlePlaceId ?? place.id,
        name: place.name,
        address: place.address ?? '',
        lat: place.lat,
        lng: place.lng,
        photoNames: place.photoName ? [place.photoName] : [],
        photoName: place.photoName,
        rating: place.rating,
        websiteUri: place.websiteUri,
      }
      if (place.googlePlaceId) {
        getPlaceDetails(place.googlePlaceId).then((full) => {
          showMarkerCard(marker, full ?? details, place.category)
        })
      } else {
        showMarkerCard(marker, details, place.category)
      }
    }
  }, [showMarkerCard])

  return (
    <div className="flex overflow-hidden h-screen">
      {/* ── Left: Itinerary Panel ── */}
      <ItineraryPanel
        trip={trip}
        places={places}
        activeDay={activeDay}
        onDayChange={setActiveDay}
        selectedPlaceId={selectedPlaceId}
        onPlaceSelect={handlePlaceSelect}
        onRemoveFromDay={handleRemoveFromDay}
        onReorderDay={handleReorderDay}
        onPlaceAdded={handlePlaceAddedFromDay}
        savedPlaceIds={savedPlaceIds}
        getBounds={getBounds}
      />

      {/* ── Map (full width) ── */}
      <div className="flex-1 relative overflow-hidden">
        <div ref={mapDivRef} className="h-full w-full" />

        {!mapsReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#f8f4ef]">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm text-text-muted">Loading map…</p>
            </div>
          </div>
        )}

        {mapsReady && (
          <FloatingSearch
            onSearchSubmit={handleSearchSubmit}
            onSuggestionSelect={handleSuggestionSelect}
            getBounds={getBounds}
            isSearching={isSearching}
            savedPlaceIds={savedPlaceIds}
          />
        )}

        {/* My Location button */}
        {mapsReady && (
          <button
            onClick={handleMyLocation}
            className={`absolute right-3 bottom-28 z-10 p-2.5 rounded-full shadow-lg transition-all cursor-pointer ${
              locationActive
                ? 'bg-primary text-white'
                : 'bg-white text-text-body hover:bg-surface-high'
            }`}
            title={locationActive ? 'Hide my location' : 'Show my location'}
          >
            {locating ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Navigation size={18} className={locationActive ? 'fill-current' : ''} />
            )}
          </button>
        )}

        {/* Bottom carousel */}
        {mapsReady && (
          <BottomCarousel
            results={searchResults}
            query={searchQuery}
            savedPlaceIds={savedPlaceIds}
            activeSearchPlaceId={activeSearchPlaceId}
            onSelect={handleCarouselSelect}
            onExpand={setDetailModalPlace}
            onQuickAdd={handleQuickAdd}
            onClear={handleClearResults}
          />
        )}
      </div>

      {/* ── Detail Modal ── */}
      <PlaceDetailModal
        details={detailModalPlace}
        savedPlaceIds={savedPlaceIds}
        onClose={() => setDetailModalPlace(null)}
        onAdded={() => {/* toast already shown inside */}}
      />
    </div>
  )
}
