import { Plus } from 'lucide-react'
import { SectionHeader } from '../layout/SectionHeader'
import { Button } from '../shared/Button'
import { CategoryBadge } from '../shared/CategoryBadge'
import { useTripStore } from '../../stores/tripStore'
import { useUIStore } from '../../stores/uiStore'
import { formatDateShort, formatTime } from '../../utils/dates'

export function ReservationsPage() {
  const reservations = useTripStore((s) => s.reservations)
  const openModal = useUIStore((s) => s.openModal)
  const reservationFilter = useUIStore((s) => s.reservationFilter)
  const setReservationFilter = useUIStore((s) => s.setReservationFilter)

  const filters = [
    { value: 'all' as const, label: 'All' },
    { value: 'dining' as const, label: 'Dining' },
    { value: 'transport' as const, label: 'Transport' },
    { value: 'activity' as const, label: 'Activity' },
  ]

  const filtered = reservationFilter === 'all'
    ? reservations
    : reservations.filter((r) => r.category === reservationFilter)

  const sorted = [...filtered].sort((a, b) => a.dateTime.localeCompare(b.dateTime))

  // Group by date
  const grouped: Record<string, typeof sorted> = {}
  for (const res of sorted) {
    const dateKey = res.dateTime.split('T')[0]
    if (!grouped[dateKey]) grouped[dateKey] = []
    grouped[dateKey].push(res)
  }

  return (
    <div>
      <SectionHeader
        title="Reservations"
        action={
          <Button icon={<Plus size={16} />} onClick={() => openModal('reservation')}>
            Add Reservation
          </Button>
        }
      />

      {/* Filter Bar */}
      <div className="flex flex-wrap gap-2 mb-6">
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => setReservationFilter(f.value)}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
              reservationFilter === f.value
                ? 'bg-primary text-white'
                : 'bg-surface-high text-text-body hover:bg-surface-highest'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {sorted.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-4xl mb-4">🎫</div>
          <h3 className="text-lg font-semibold font-heading text-text-heading mb-2">No reservations yet</h3>
          <p className="text-sm text-text-muted mb-6">Track your restaurant bookings, train tickets, and activity reservations.</p>
          <Button icon={<Plus size={16} />} onClick={() => openModal('reservation')}>
            Add Your First Reservation
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([dateKey, items]) => (
            <div key={dateKey}>
              <h3 className="text-xs font-semibold uppercase tracking-widest text-text-muted mb-3">
                {formatDateShort(dateKey)}
              </h3>
              <div className="space-y-2">
                {items.map((res) => (
                  <div
                    key={res.id}
                    onClick={() => openModal('reservation', res.id)}
                    className="bg-card-bg rounded-[12px] shadow-card hover:shadow-card-hover p-4 transition-all cursor-pointer flex items-center gap-4"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-text-heading">{res.name}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <CategoryBadge category={res.category} type="reservation" />
                        {res.confirmationNumber && (
                          <code className="text-xs font-mono text-text-muted">{res.confirmationNumber}</code>
                        )}
                      </div>
                      {res.notes && (
                        <p className="text-xs text-text-muted mt-1.5 line-clamp-1">{res.notes}</p>
                      )}
                    </div>
                    <div className="text-xs font-medium text-text-muted whitespace-nowrap">
                      {res.dateTime.includes('T') ? formatTime(res.dateTime) : ''}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
