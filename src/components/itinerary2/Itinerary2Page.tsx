import { useState, useMemo, useCallback } from 'react'
import { ChevronDown, ChevronUp, PanelRightOpen, PanelRightClose } from 'lucide-react'
import { SectionHeader } from '../layout/SectionHeader'
import { Button } from '../shared/Button'
import { useTripStore } from '../../stores/tripStore'
import { getDayDates } from '../../utils/dates'
import { getDayItems } from '../../utils/dayItems'
import { DaySection } from './DaySection'
import { PlacesSidebar } from './PlacesSidebar'
import type { Accommodation } from '../../types'

export type AccommodationBanner = {
  accommodation: Accommodation
  status: 'check-in' | 'check-out' | 'staying'
}

export function Itinerary2Page() {
  const trip = useTripStore((s) => s.trip)
  const places = useTripStore((s) => s.places)
  const inlineNotes = useTripStore((s) => s.inlineNotes)
  const accommodations = useTripStore((s) => s.accommodations)
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const dayDates = useMemo(() => {
    if (!trip) return []
    return getDayDates(trip.startDate, trip.endDate)
  }, [trip])

  const [expandedDays, setExpandedDays] = useState<Set<number>>(() => new Set([0]))

  const toggleDay = useCallback((dayIndex: number) => {
    setExpandedDays((prev) => {
      const next = new Set(prev)
      if (next.has(dayIndex)) next.delete(dayIndex)
      else next.add(dayIndex)
      return next
    })
  }, [])

  const allExpanded = expandedDays.size === dayDates.length
  const toggleAll = useCallback(() => {
    if (allExpanded) {
      setExpandedDays(new Set())
    } else {
      setExpandedDays(new Set(dayDates.map((_, i) => i)))
    }
  }, [allExpanded, dayDates])

  const accommodationsByDay = useMemo(() => {
    const map = new Map<number, AccommodationBanner[]>()
    dayDates.forEach((date, dayIndex) => {
      const banners: AccommodationBanner[] = []
      for (const acc of accommodations) {
        if (acc.checkIn === date) banners.push({ accommodation: acc, status: 'check-in' })
        else if (acc.checkOut === date) banners.push({ accommodation: acc, status: 'check-out' })
        else if (date > acc.checkIn && date < acc.checkOut) banners.push({ accommodation: acc, status: 'staying' })
      }
      if (banners.length > 0) map.set(dayIndex, banners)
    })
    return map
  }, [dayDates, accommodations])

  if (!trip) return null

  return (
    <div className="flex h-full">
      <div className="flex-1 overflow-y-auto px-8 py-10">
        <div className="max-w-[960px] mx-auto">
          <SectionHeader
            title="Itinerary"
            action={
              <div className="flex items-center gap-3">
                <span className="text-xs text-text-muted">
                  {dayDates.length} days
                </span>
                <Button
                  variant="ghost"
                  icon={allExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  onClick={toggleAll}
                >
                  {allExpanded ? 'Collapse All' : 'Expand All'}
                </Button>
                <Button
                  variant="ghost"
                  icon={sidebarOpen ? <PanelRightClose size={14} /> : <PanelRightOpen size={14} />}
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                >
                  Places
                </Button>
              </div>
            }
          />

          <div className="space-y-3 mt-2">
            {dayDates.map((date, dayIndex) => {
              const items = getDayItems(dayIndex, places, inlineNotes)
              const banners = accommodationsByDay.get(dayIndex) || []
              const label = trip.dayLabels?.[dayIndex] || ''

              return (
                <DaySection
                  key={dayIndex}
                  dayIndex={dayIndex}
                  date={date}
                  isExpanded={expandedDays.has(dayIndex)}
                  onToggle={() => toggleDay(dayIndex)}
                  label={label}
                  accommodationBanners={banners}
                  items={items}
                />
              )
            })}
          </div>
        </div>
      </div>

      {sidebarOpen && (
        <div className="w-72 flex-shrink-0 border-l border-border-light bg-card-bg overflow-hidden">
          <PlacesSidebar />
        </div>
      )}
    </div>
  )
}
