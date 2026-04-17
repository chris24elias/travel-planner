import { LayoutDashboard, MapPin, Ticket, CalendarDays, List, Plus } from 'lucide-react'
import { useTripStore } from '../../stores/tripStore'
import { useUIStore } from '../../stores/uiStore'
import { getDaysUntil, getTripDuration, formatDateShort, formatDate } from '../../utils/dates'
import { SectionHeader } from '../layout/SectionHeader'
import { Button } from '../shared/Button'
import { RESERVATION_CATEGORY_CONFIG } from '../../utils/categories'
import type { ReservationCategory } from '../../types'

export function OverviewPage() {
  const trip = useTripStore((s) => s.trip)
  const places = useTripStore((s) => s.places)
  const reservations = useTripStore((s) => s.reservations)
  const accommodations = useTripStore((s) => s.accommodations)
  const customLists = useTripStore((s) => s.customLists)
  const setSection = useUIStore((s) => s.setSection)
  const openModal = useUIStore((s) => s.openModal)

  if (!trip) return null

  const daysUntil = getDaysUntil(trip.startDate)
  const duration = getTripDuration(trip.startDate, trip.endDate)
  const plannedDays = new Set(places.filter((p) => p.dayIndex != null).map((p) => p.dayIndex)).size

  // Upcoming items: merge accommodations (check-in) + reservations, sort by date
  const upcoming = [
    ...accommodations.map((a) => ({
      id: a.id,
      date: a.checkIn,
      name: a.name,
      type: 'accommodation' as const,
      icon: '🏨',
      time: 'Check-in',
    })),
    ...reservations.map((r) => ({
      id: r.id,
      date: r.dateTime.split('T')[0],
      name: r.name,
      type: 'reservation' as const,
      icon: r.category === 'dining' ? '🍽' : r.category === 'transport' ? '🚄' : '🎫',
      time: r.dateTime.includes('T')
        ? new Date(r.dateTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
        : '',
    })),
  ]
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 8)

  const stats = [
    { label: 'places saved', value: places.length, icon: MapPin, section: 'places' as const },
    { label: 'reservations', value: reservations.length, icon: Ticket, section: 'reservations' as const },
    { label: 'days planned', value: `${plannedDays}/${duration}`, icon: CalendarDays, section: 'itinerary' as const },
    { label: 'lists', value: customLists.length, icon: List, section: 'places' as const },
  ]

  return (
    <div>
      {/* Trip Header */}
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-4xl font-extrabold font-heading tracking-tight text-text-heading">
          {trip.name}
        </h1>
        <p className="text-xs md:text-sm text-text-muted mt-1">
          {formatDate(trip.startDate)} — {formatDate(trip.endDate)} · {duration} days
        </p>
        {daysUntil > 0 && (
          <span className="inline-flex items-center mt-3 px-3 py-1.5 bg-primary-light text-primary-hover text-xs md:text-sm font-bold rounded-full">
            ✈ {daysUntil} days to go!
          </span>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-8 md:mb-10">
        {stats.map((stat) => (
          <button
            key={stat.label}
            onClick={() => setSection(stat.section)}
            className="bg-card-bg rounded-[12px] shadow-card hover:shadow-card-hover p-4 md:p-5 text-left transition-all cursor-pointer hover:scale-[1.02]"
          >
            <div className="text-2xl md:text-3xl font-extrabold font-heading text-text-heading">{stat.value}</div>
            <div className="text-[10px] md:text-xs font-medium uppercase tracking-widest text-text-muted mt-1">{stat.label}</div>
          </button>
        ))}
      </div>

      {/* Upcoming */}
      {upcoming.length > 0 && (
        <div className="mb-10">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-text-muted mb-4">Upcoming</h2>
          <div className="space-y-2">
            {upcoming.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-4 bg-card-bg rounded-[12px] shadow-card px-4 py-3 hover:shadow-card-hover transition-all cursor-pointer"
              >
                <span className="text-lg">{item.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-text-heading truncate">{item.name}</div>
                </div>
                <div className="text-xs text-text-muted whitespace-nowrap">
                  {formatDateShort(item.date)}
                  {item.time && item.time !== 'Check-in' && ` · ${item.time}`}
                  {item.time === 'Check-in' && ` · Check-in`}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div>
        <h2 className="text-xs font-semibold uppercase tracking-widest text-text-muted mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Button variant="secondary" icon={<Plus size={16} />} onClick={() => openModal('place')}>
            Add Place
          </Button>
          <Button variant="secondary" icon={<Plus size={16} />} onClick={() => openModal('reservation')}>
            Add Reservation
          </Button>
          <Button variant="secondary" icon={<Plus size={16} />} onClick={() => openModal('note')}>
            Add Note
          </Button>
        </div>
      </div>
    </div>
  )
}
