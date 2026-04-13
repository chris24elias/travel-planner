import { useState } from 'react'
import { useTripStore } from '../../stores/tripStore'
import { getDayDates } from '../../utils/dates'
import { TripOverviewGrid } from './TripOverviewGrid'
import { DayPlannerView } from './DayPlannerView'

export function ItineraryPage() {
  const trip = useTripStore((s) => s.trip)

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
