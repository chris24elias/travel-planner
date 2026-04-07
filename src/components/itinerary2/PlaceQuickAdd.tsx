import { useState, useRef, useEffect, useCallback } from 'react'
import { Search, Loader2, MapPin, Check, X } from 'lucide-react'
import { useTripStore } from '../../stores/tripStore'
import { useUIStore } from '../../stores/uiStore'
import { searchPlaces, getPlaceDetails } from '../../services/googlePlaces'
import { getNextOrderInDay } from '../../utils/dayItems'
import { CATEGORY_CONFIG } from '../../utils/categories'
import type { PlaceSuggestion } from '../../services/googlePlaces'

interface PlaceQuickAddProps {
  dayIndex: number
  onClose: () => void
}

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debounced
}

export function PlaceQuickAdd({ dayIndex, onClose }: PlaceQuickAddProps) {
  const [query, setQuery] = useState('')
  const [googleResults, setGoogleResults] = useState<PlaceSuggestion[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [isFetching, setIsFetching] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const trip = useTripStore((s) => s.trip)
  const places = useTripStore((s) => s.places)
  const inlineNotes = useTripStore((s) => s.inlineNotes)
  const updatePlace = useTripStore((s) => s.updatePlace)
  const addPlace = useTripStore((s) => s.addPlace)
  const showToast = useUIStore((s) => s.showToast)

  const debouncedQuery = useDebounce(query, 300)

  const unassignedPlaces = places.filter((p) => p.dayIndex == null || p.dayIndex === undefined)
  const filteredSaved = query.trim().length > 0
    ? unassignedPlaces.filter((p) =>
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        (p.address && p.address.toLowerCase().includes(query.toLowerCase()))
      )
    : unassignedPlaces

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    if (debouncedQuery.trim().length < 2) {
      setGoogleResults([])
      return
    }
    let cancelled = false
    setIsSearching(true)
    searchPlaces(debouncedQuery).then((results) => {
      if (cancelled) return
      setGoogleResults(results)
      setIsSearching(false)
    })
    return () => { cancelled = true }
  }, [debouncedQuery])

  const handleSelectSaved = useCallback(async (placeId: string) => {
    const orderInDay = getNextOrderInDay(dayIndex, places, inlineNotes)
    await updatePlace(placeId, { dayIndex, orderInDay })
    const place = places.find((p) => p.id === placeId)
    showToast(`Added "${place?.name}" to Day ${dayIndex + 1}`)
    onClose()
  }, [dayIndex, places, inlineNotes, updatePlace, showToast, onClose])

  const handleSelectGoogle = useCallback(async (suggestion: PlaceSuggestion) => {
    if (!trip) return
    setIsFetching(true)
    const details = await getPlaceDetails(suggestion.placeId)
    if (!details) {
      setIsFetching(false)
      return
    }
    const orderInDay = getNextOrderInDay(dayIndex, places, inlineNotes)
    await addPlace({
      tripId: trip.id,
      name: details.name,
      category: 'other',
      notes: '',
      address: details.address,
      lat: details.lat,
      lng: details.lng,
      links: [],
      priority: 'want-to',
      dayIndex,
      orderInDay,
      listIds: [],
      googlePlaceId: details.placeId,
      photoName: details.photoNames?.[0],
      photoNames: details.photoNames,
      rating: details.rating,
      websiteUri: details.websiteUri,
      phoneNumber: details.phoneNumber,
      openingHours: details.openingHours,
      types: details.types,
    })
    showToast(`Added "${details.name}" to Day ${dayIndex + 1}`)
    setIsFetching(false)
    onClose()
  }, [trip, dayIndex, places, inlineNotes, addPlace, showToast, onClose])

  const savedPlaceIds = new Set(places.map((p) => p.googlePlaceId).filter(Boolean))
  const hasResults = filteredSaved.length > 0 || googleResults.length > 0
  const showDropdown = query.trim().length > 0 || unassignedPlaces.length > 0

  return (
    <div className="relative">
      <div className="relative">
        {isFetching ? (
          <Loader2 size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-primary animate-spin" />
        ) : (
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-placeholder" />
        )}
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Escape') onClose() }}
          placeholder="Search saved places or Google..."
          className="w-full pl-9 pr-9 py-2.5 text-sm rounded-[10px] bg-surface-high border border-border-medium text-text-body placeholder:text-text-placeholder focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
        />
        <button
          onClick={onClose}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-surface-highest text-text-placeholder hover:text-text-muted transition-colors cursor-pointer"
        >
          <X size={14} />
        </button>
      </div>

      {showDropdown && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1.5 bg-card-bg rounded-[12px] shadow-modal border border-border-light overflow-hidden max-h-[300px] overflow-y-auto">
          {filteredSaved.length > 0 && (
            <>
              <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-text-placeholder bg-surface-high/50">
                Your saved places
              </div>
              {filteredSaved.slice(0, 8).map((place) => (
                <button
                  key={place.id}
                  onClick={() => handleSelectSaved(place.id)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-surface-high transition-colors cursor-pointer border-t border-border-light first:border-t-0"
                >
                  <span
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: CATEGORY_CONFIG[place.category].color }}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium text-text-heading truncate">{place.name}</div>
                    {place.address && (
                      <div className="text-xs text-text-muted truncate">{place.address}</div>
                    )}
                  </div>
                </button>
              ))}
            </>
          )}

          {isSearching && (
            <div className="flex items-center gap-2 px-4 py-3 text-xs text-text-muted">
              <Loader2 size={12} className="animate-spin" />
              Searching Google Places...
            </div>
          )}

          {googleResults.length > 0 && (
            <>
              <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-text-placeholder bg-surface-high/50">
                Google Places
              </div>
              {googleResults.map((s) => (
                <button
                  key={s.placeId}
                  onClick={() => handleSelectGoogle(s)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-surface-high transition-colors cursor-pointer border-t border-border-light"
                >
                  <MapPin size={13} className="text-primary flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium text-text-heading truncate">{s.mainText}</div>
                    {s.secondaryText && (
                      <div className="text-xs text-text-muted truncate">{s.secondaryText}</div>
                    )}
                  </div>
                  {savedPlaceIds.has(s.placeId) && (
                    <span className="flex items-center gap-0.5 text-[10px] font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                      <Check size={10} />
                      Saved
                    </span>
                  )}
                </button>
              ))}
            </>
          )}

          {!isSearching && query.trim().length >= 2 && !hasResults && (
            <div className="px-4 py-3 text-xs text-text-muted text-center">
              No results found
            </div>
          )}

          {googleResults.length > 0 && (
            <div className="px-4 py-2 border-t border-border-light flex justify-end">
              <span className="text-[10px] text-text-placeholder">Powered by Google</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
