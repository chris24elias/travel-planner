import { useState, useRef, useEffect, useCallback } from 'react'
import { Search, Loader2, MapPin } from 'lucide-react'
import { searchPlaces, getPlaceDetails } from '../../services/googlePlaces'
import type { PlaceSuggestion, PlaceDetails } from '../../services/googlePlaces'

interface PlaceSearchProps {
  onSelect: (details: PlaceDetails) => void
  placeholder?: string
}

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debounced
}

export function PlaceSearch({ onSelect, placeholder = 'Search Google Places…' }: PlaceSearchProps) {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [isFetching, setIsFetching] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const debouncedQuery = useDebounce(query, 300)

  // Fetch suggestions when debounced query changes
  useEffect(() => {
    if (debouncedQuery.trim().length < 2) {
      setSuggestions([])
      setIsOpen(false)
      return
    }

    let cancelled = false
    setIsSearching(true)

    searchPlaces(debouncedQuery).then((results) => {
      if (cancelled) return
      setSuggestions(results)
      setIsOpen(results.length > 0)
      setIsSearching(false)
      setActiveIndex(-1)
    })

    return () => { cancelled = true }
  }, [debouncedQuery])

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleSelect = useCallback(async (suggestion: PlaceSuggestion) => {
    setIsOpen(false)
    setQuery(suggestion.mainText)
    setIsFetching(true)

    const details = await getPlaceDetails(suggestion.placeId)
    setIsFetching(false)

    if (details) {
      onSelect(details)
      setQuery('')
    }
  }, [onSelect])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault()
      handleSelect(suggestions[activeIndex])
    } else if (e.key === 'Escape') {
      setIsOpen(false)
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        {isFetching ? (
          <Loader2 size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-primary animate-spin" />
        ) : isSearching ? (
          <Loader2 size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-placeholder animate-spin" />
        ) : (
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-placeholder" />
        )}
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => suggestions.length > 0 && setIsOpen(true)}
          placeholder={placeholder}
          className="w-full pl-9 pr-3 py-2.5 text-sm rounded-[10px] bg-surface-high border border-border-medium text-text-body placeholder:text-text-placeholder focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
        />
      </div>

      {isOpen && suggestions.length > 0 && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1.5 bg-card-bg rounded-[12px] shadow-modal border border-border-light overflow-hidden">
          {suggestions.map((s, i) => (
            <button
              key={s.placeId}
              onMouseDown={(e) => { e.preventDefault(); handleSelect(s) }}
              onMouseEnter={() => setActiveIndex(i)}
              className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-colors cursor-pointer ${
                i === activeIndex ? 'bg-surface-high' : 'hover:bg-surface-high'
              } ${i > 0 ? 'border-t border-border-light' : ''}`}
            >
              <MapPin size={14} className="text-primary flex-shrink-0 mt-0.5" />
              <div className="min-w-0">
                <div className="text-sm font-medium text-text-heading truncate">{s.mainText}</div>
                {s.secondaryText && (
                  <div className="text-xs text-text-muted truncate mt-0.5">{s.secondaryText}</div>
                )}
              </div>
            </button>
          ))}
          <div className="px-4 py-2 border-t border-border-light flex justify-end">
            <span className="text-[10px] text-text-placeholder">Powered by Google</span>
          </div>
        </div>
      )}
    </div>
  )
}
