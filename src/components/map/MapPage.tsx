import { useState, useMemo } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import { SectionHeader } from '../layout/SectionHeader'
import { CategoryBadge, PriorityBadge } from '../shared/CategoryBadge'
import { Button } from '../shared/Button'
import { useTripStore } from '../../stores/tripStore'
import { useUIStore } from '../../stores/uiStore'
import { CATEGORY_CONFIG } from '../../utils/categories'
import type { Place, PlaceCategory } from '../../types'
import 'leaflet/dist/leaflet.css'

// Fix Leaflet default icon issue
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

function createCategoryIcon(category: PlaceCategory): L.DivIcon {
  const config = CATEGORY_CONFIG[category]
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      width: 28px; height: 28px; border-radius: 50%;
      background: ${config.color}; border: 3px solid white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
      display: flex; align-items: center; justify-content: center;
    "></div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14],
  })
}

type MapFilter = 'all' | PlaceCategory | 'by-day'
type DayFilter = number | null

function MapFilters({
  filter, setFilter, dayFilter, setDayFilter, dayCount,
}: {
  filter: MapFilter; setFilter: (f: MapFilter) => void
  dayFilter: DayFilter; setDayFilter: (d: DayFilter) => void
  dayCount: number
}) {
  const categories = Object.entries(CATEGORY_CONFIG)

  return (
    <div className="absolute top-4 left-4 right-4 z-[1000] flex flex-wrap gap-2">
      <div className="bg-card-bg rounded-full shadow-dropdown px-1 py-1 flex gap-1">
        <button
          onClick={() => { setFilter('all'); setDayFilter(null) }}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
            filter === 'all' ? 'bg-primary text-white' : 'text-text-body hover:bg-surface-high'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setFilter(filter === 'by-day' ? 'all' : 'by-day')}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
            filter === 'by-day' ? 'bg-primary text-white' : 'text-text-body hover:bg-surface-high'
          }`}
        >
          By Day ▾
        </button>
      </div>

      {/* Category pills */}
      {filter !== 'by-day' && (
        <div className="bg-card-bg rounded-full shadow-dropdown px-1 py-1 flex gap-1 flex-wrap">
          {categories.map(([key, config]) => (
            <button
              key={key}
              onClick={() => setFilter(filter === key ? 'all' : key as PlaceCategory)}
              className={`px-2.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                filter === key ? 'text-white' : 'text-text-body hover:bg-surface-high'
              }`}
              style={filter === key ? { backgroundColor: config.color } : undefined}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: config.color }}
              />
              {config.label}
            </button>
          ))}
        </div>
      )}

      {/* Day picker */}
      {filter === 'by-day' && (
        <div className="bg-card-bg rounded-[12px] shadow-dropdown px-2 py-1.5 flex gap-1 flex-wrap">
          {Array.from({ length: dayCount }, (_, i) => (
            <button
              key={i}
              onClick={() => setDayFilter(dayFilter === i ? null : i)}
              className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
                dayFilter === i ? 'bg-primary text-white' : 'text-text-body hover:bg-surface-high'
              }`}
            >
              Day {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function SelectedPlaceCard({ place, onClose }: { place: Place; onClose: () => void }) {
  const openModal = useUIStore((s) => s.openModal)

  return (
    <div className="absolute bottom-4 left-4 right-4 z-[1000]">
      <div className="bg-card-bg rounded-[12px] shadow-dropdown p-4 max-w-md mx-auto">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-text-heading">{place.name}</h3>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <CategoryBadge category={place.category} />
              {place.area && <span className="text-xs text-text-muted">{place.area}</span>}
              <PriorityBadge priority={place.priority} />
            </div>
            {place.notes && (
              <p className="text-xs text-text-muted mt-2 line-clamp-2">{place.notes}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1 text-text-muted hover:text-text-body cursor-pointer"
          >
            ×
          </button>
        </div>
        <div className="flex gap-2 mt-3">
          <Button variant="ghost" className="text-xs" onClick={() => openModal('place', place.id)}>
            View Details
          </Button>
          <Button className="text-xs">
            Add to Day ▾
          </Button>
        </div>
      </div>
    </div>
  )
}

// Default center: Tokyo
const DEFAULT_CENTER: [number, number] = [35.6762, 139.6503]
const DEFAULT_ZOOM = 12

export function MapPage() {
  const places = useTripStore((s) => s.places)
  const trip = useTripStore((s) => s.trip)

  const [filter, setFilter] = useState<MapFilter>('all')
  const [dayFilter, setDayFilter] = useState<DayFilter>(null)
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null)

  const dayCount = trip
    ? Math.ceil((new Date(trip.endDate).getTime() - new Date(trip.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1
    : 0

  const filteredPlaces = useMemo(() => {
    let result = places.filter((p) => p.lat != null && p.lng != null)

    if (filter === 'by-day') {
      if (dayFilter !== null) {
        result = result.filter((p) => p.dayIndex === dayFilter)
      }
    } else if (filter !== 'all') {
      result = result.filter((p) => p.category === filter)
    }

    return result
  }, [places, filter, dayFilter])

  // If no places have coordinates, show a friendly message
  const hasGeoPlaces = places.some((p) => p.lat != null && p.lng != null)

  return (
    <div className="relative" style={{ marginLeft: '-2rem', marginRight: '-2rem', marginTop: '-2.5rem' }}>
      {/* Full-width map */}
      <div className="h-[calc(100vh-0px)] relative">
        <MapFilters
          filter={filter}
          setFilter={setFilter}
          dayFilter={dayFilter}
          setDayFilter={setDayFilter}
          dayCount={dayCount}
        />

        <MapContainer
          center={DEFAULT_CENTER}
          zoom={DEFAULT_ZOOM}
          className="h-full w-full"
          style={{ background: '#fdf9f3' }}
          zoomControl={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {filteredPlaces.map((place) => (
            <Marker
              key={place.id}
              position={[place.lat!, place.lng!]}
              icon={createCategoryIcon(place.category)}
              eventHandlers={{
                click: () => setSelectedPlace(place),
              }}
            />
          ))}
        </MapContainer>

        {/* No geo places hint */}
        {!hasGeoPlaces && (
          <div className="absolute inset-0 z-[500] flex items-center justify-center pointer-events-none">
            <div className="bg-card-bg/95 rounded-[16px] shadow-modal p-8 text-center max-w-sm pointer-events-auto">
              <div className="text-3xl mb-3">🗺</div>
              <h3 className="text-base font-semibold font-heading text-text-heading mb-2">
                No places on the map yet
              </h3>
              <p className="text-sm text-text-muted">
                Add coordinates (lat/lng) to your saved places to see them here. Map integration with search coming soon!
              </p>
            </div>
          </div>
        )}

        {/* Selected place card */}
        {selectedPlace && (
          <SelectedPlaceCard
            place={selectedPlace}
            onClose={() => setSelectedPlace(null)}
          />
        )}
      </div>
    </div>
  )
}
