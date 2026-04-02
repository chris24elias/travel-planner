import { useState } from 'react'
import { useTripStore } from '../../stores/tripStore'
import { useUIStore } from '../../stores/uiStore'
import { getDayDates, formatDayOfWeek, formatDateShort } from '../../utils/dates'
import { CATEGORY_CONFIG } from '../../utils/categories'
import type { Place } from '../../types'
import { TripOverviewGrid } from './TripOverviewGrid'
import { DayPlannerView } from './DayPlannerView'

export function ItineraryPage() {
  const trip = useTripStore((s) => s.trip)
  const places = useTripStore((s) => s.places)
  const dayNotes = useTripStore((s) => s.dayNotes)

  const [selectedDay, setSelectedDay] = useState<number | null>(null)

  if (!trip) return null

  const dayDates = getDayDates(trip.startDate, trip.endDate)

  if (selectedDay !== null) {
    return (
      <DayPlannerView
        trip={trip}
        dayDates={dayDates}
        selectedDay={selectedDay}
        onSelectDay={setSelectedDay}
        onBack={() => setSelectedDay(null)}
      />
    )
  }

  return (
    <TripOverviewGrid
      trip={trip}
      dayDates={dayDates}
      onSelectDay={setSelectedDay}
    />
  )
}
