import { useState, useMemo } from 'react'
import { ChevronDown, ChevronRight, MapPin, Star, Clock } from 'lucide-react'
import { useTripStore } from '../../stores/tripStore'
import { useUIStore } from '../../stores/uiStore'
import { CATEGORY_CONFIG, PLACE_CATEGORIES } from '../../utils/categories'
import type { Place, PlaceCategory } from '../../types'

const PRIORITY_ICONS: Record<string, typeof Star | null> = {
  'must-see': Star,
  'want-to': null,
  'if-time': Clock,
}

const PRIORITY_COLORS: Record<string, string> = {
  'must-see': 'text-primary',
  'want-to': 'text-blue-400',
  'if-time': 'text-gray-400',
}

function PlaceRow({ place }: { place: Place }) {
  const openModal = useUIStore((s) => s.openModal)
  const catConfig = CATEGORY_CONFIG[place.category]
  const PriorityIcon = PRIORITY_ICONS[place.priority]

  return (
    <button
      onClick={() => openModal('place', place.id)}
      className="w-full flex items-center gap-2 px-3 py-1.5 text-left hover:bg-surface-high/50 transition-colors cursor-pointer rounded-[6px] group"
    >
      <span
        className="w-2 h-2 rounded-full flex-shrink-0"
        style={{ backgroundColor: catConfig.color }}
      />
      <span className="text-[13px] text-text-body truncate flex-1">{place.name}</span>
      {place.dayIndex != null && (
        <span className="text-[10px] text-text-placeholder font-medium whitespace-nowrap">
          D{place.dayIndex + 1}
        </span>
      )}
      {PriorityIcon && (
        <PriorityIcon size={10} className={`flex-shrink-0 ${PRIORITY_COLORS[place.priority]}`} />
      )}
    </button>
  )
}

function CategoryGroup({ category, places }: { category: PlaceCategory; places: Place[] }) {
  const [expanded, setExpanded] = useState(true)
  const config = CATEGORY_CONFIG[category]

  return (
    <div>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-2 px-3 py-1.5 text-left hover:bg-surface-high/30 transition-colors cursor-pointer"
      >
        {expanded ? <ChevronDown size={12} className="text-text-placeholder" /> : <ChevronRight size={12} className="text-text-placeholder" />}
        <span
          className="w-2 h-2 rounded-full flex-shrink-0"
          style={{ backgroundColor: config.color }}
        />
        <span className="text-xs font-semibold text-text-muted uppercase tracking-wide flex-1">{config.label}</span>
        <span className="text-[10px] text-text-placeholder">{places.length}</span>
      </button>
      {expanded && (
        <div className="ml-1">
          {places.map((place) => (
            <PlaceRow key={place.id} place={place} />
          ))}
        </div>
      )}
    </div>
  )
}

type FilterMode = 'all' | 'unassigned' | 'assigned'

export function PlacesSidebar() {
  const places = useTripStore((s) => s.places)
  const [filter, setFilter] = useState<FilterMode>('all')
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    let result = places
    if (filter === 'unassigned') result = result.filter((p) => p.dayIndex == null)
    else if (filter === 'assigned') result = result.filter((p) => p.dayIndex != null)
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter((p) => p.name.toLowerCase().includes(q) || p.address?.toLowerCase().includes(q))
    }
    return result
  }, [places, filter, search])

  const grouped = useMemo(() => {
    const map = new Map<PlaceCategory, Place[]>()
    for (const place of filtered) {
      const arr = map.get(place.category) || []
      arr.push(place)
      map.set(place.category, arr)
    }
    return PLACE_CATEGORIES.filter((c) => map.has(c)).map((c) => ({
      category: c,
      places: map.get(c)!,
    }))
  }, [filtered])

  const unassignedCount = places.filter((p) => p.dayIndex == null).length

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-border-light">
        <div className="flex items-center gap-2 mb-2.5">
          <MapPin size={14} className="text-primary" />
          <span className="text-sm font-semibold text-text-heading">Saved Places</span>
          <span className="text-[10px] text-text-placeholder ml-auto">{places.length}</span>
        </div>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search places..."
          className="w-full text-xs px-2.5 py-1.5 rounded-[8px] bg-surface-high border border-border-light text-text-body placeholder:text-text-placeholder focus:outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary transition-all"
        />
        <div className="flex gap-1 mt-2">
          {([
            ['all', `All (${places.length})`],
            ['unassigned', `Free (${unassignedCount})`],
            ['assigned', `Planned (${places.length - unassignedCount})`],
          ] as const).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`text-[10px] font-medium px-2 py-0.5 rounded-full transition-colors cursor-pointer ${
                filter === key
                  ? 'bg-primary-light text-primary-hover'
                  : 'text-text-placeholder hover:bg-surface-high'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-2 space-y-1">
        {grouped.length === 0 && (
          <div className="px-4 py-6 text-center text-xs text-text-placeholder">
            {search ? 'No places match your search' : 'No places saved yet'}
          </div>
        )}
        {grouped.map(({ category, places: catPlaces }) => (
          <CategoryGroup key={category} category={category} places={catPlaces} />
        ))}
      </div>
    </div>
  )
}
