import { useState } from 'react'
import { Plus, MapPin, Calendar, Plane, Clock, ChevronRight, Pencil } from 'lucide-react'
import { differenceInDays, parseISO } from 'date-fns'
import { formatDateShort } from '../../utils/dates'
import { getTripDuration } from '../../utils/dates'
import { useTripStore } from '../../stores/tripStore'
import { NewTripModal } from './NewTripModal'
import { EditTripModal } from './EditTripModal'
import type { Trip } from '../../types'

const COVER_GRADIENTS = [
  { from: '#f59e0b', to: '#d97706', text: '#7c2d12' },   // Amber
  { from: '#3b82f6', to: '#1d4ed8', text: '#1e3a8a' },   // Blue
  { from: '#ec4899', to: '#db2777', text: '#831843' },   // Pink
  { from: '#10b981', to: '#059669', text: '#064e3b' },   // Emerald
  { from: '#8b5cf6', to: '#7c3aed', text: '#4c1d95' },   // Violet
  { from: '#f97316', to: '#ea580c', text: '#7c2d12' },   // Orange
]

function hashTrip(id: string): number {
  return id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
}

function getTripStatus(trip: Trip) {
  const today = new Date()
  const start = parseISO(trip.startDate)
  const end = parseISO(trip.endDate)
  if (today < start) {
    const days = differenceInDays(start, today)
    return { label: days === 0 ? 'Tomorrow' : `In ${days} days`, color: 'amber' as const }
  }
  if (today >= start && today <= end) {
    return { label: 'Happening now 🎉', color: 'green' as const }
  }
  return { label: 'Completed', color: 'stone' as const }
}

interface TripCardProps {
  trip: Trip
  stats: { placeCount: number; reservationCount: number }
  onOpen: () => void
  onEdit: () => void
}

export function TripCard({ trip, stats, onOpen, onEdit }: TripCardProps) {
  const gradient = COVER_GRADIENTS[hashTrip(trip.id) % COVER_GRADIENTS.length]
  const status = getTripStatus(trip)
  const duration = getTripDuration(trip.startDate, trip.endDate)

  const initials = trip.destination
    .split(/[\s,]+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')

  const statusPillClass =
    status.color === 'amber'
      ? 'bg-amber-100 text-amber-800'
      : status.color === 'green'
        ? 'bg-emerald-100 text-emerald-800'
        : 'bg-stone-100 text-stone-600'

  const openButtonClass =
    status.color === 'stone'
      ? 'w-full h-10 border border-[#e8e0d5] text-[#534434] hover:bg-[#f7f3ed] font-semibold text-[14px] rounded-[12px] transition-all cursor-pointer'
      : 'w-full h-10 bg-[#f59e0b] hover:bg-[#d97706] text-white font-semibold text-[14px] rounded-[12px] transition-all cursor-pointer'

  return (
    <div className="bg-white rounded-[20px] shadow-[0_4px_24px_-4px_rgba(68,64,60,0.10)] overflow-hidden group">
      {/* Cover area */}
      <div
        className="relative flex flex-col items-center justify-center"
        style={{ height: 200, background: `linear-gradient(135deg, ${gradient.from}, ${gradient.to})` }}
      >
        <span className="text-white/20 font-bold select-none" style={{ fontSize: 80, lineHeight: 1 }}>
          {initials}
        </span>
        <Plane size={20} className="text-white/40 absolute bottom-5 right-5" />

        {/* Edit button — appears on card hover */}
        <button
          onClick={(e) => { e.stopPropagation(); onEdit() }}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/20 hover:bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
          title="Edit trip details"
        >
          <Pencil size={13} className="text-white" />
        </button>

        {/* Status badge */}
        <span
          className={`absolute bottom-4 left-4 px-2.5 py-1 rounded-full text-[11px] font-semibold ${statusPillClass}`}
        >
          {status.label}
        </span>
      </div>

      {/* Card body */}
      <div className="p-5">
        <h3 className="font-heading font-bold text-[20px] text-[#1c1c18] mb-2 leading-tight">{trip.name}</h3>

        {/* Date row */}
        <div className="flex items-center gap-1.5 mb-3">
          <Calendar size={13} className="text-[#867461]" />
          <span className="text-[13px] text-[#534434]">
            {formatDateShort(trip.startDate)} — {formatDateShort(trip.endDate)}
          </span>
        </div>

        {/* Stats row */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          <span className="px-2.5 py-1 bg-[#f7f3ed] text-[#534434] text-[12px] rounded-full flex items-center gap-1">
            <MapPin size={10} />
            {stats.placeCount} places
          </span>
          <span className="px-2.5 py-1 bg-[#f7f3ed] text-[#534434] text-[12px] rounded-full flex items-center gap-1">
            <Clock size={10} />
            {duration} days
          </span>
          <span className="px-2.5 py-1 bg-[#f7f3ed] text-[#534434] text-[12px] rounded-full flex items-center gap-1">
            <ChevronRight size={10} />
            {stats.reservationCount} reservations
          </span>
        </div>

        {/* Open button */}
        <button onClick={onOpen} className={openButtonClass}>
          Open Trip →
        </button>
      </div>
    </div>
  )
}

interface NewTripCardProps {
  onClick: () => void
}

export function NewTripCard({ onClick }: NewTripCardProps) {
  return (
    <button
      onClick={onClick}
      className="border-2 border-dashed border-[#d8c3ad] bg-[#fdf9f3] rounded-[20px] flex flex-col items-center justify-center min-h-[320px] hover:border-[#f59e0b] hover:bg-amber-50/30 transition-all cursor-pointer w-full"
    >
      <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mb-3">
        <Plus size={22} className="text-amber-600" />
      </div>
      <p className="font-heading font-semibold text-[16px] text-[#1c1c18] mb-1">Plan a New Trip</p>
      <p className="text-[13px] text-[#867461]">Create your next adventure</p>
    </button>
  )
}

export function TripsHome() {
  const allTrips = useTripStore((s) => s.allTrips)
  const tripStats = useTripStore((s) => s.tripStats)
  const selectTrip = useTripStore((s) => s.selectTrip)
  const [showNewModal, setShowNewModal] = useState(false)
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null)

  const upcomingCount = allTrips.filter((t) => parseISO(t.startDate) > new Date()).length

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#fdf9f3' }}>
      {/* Nav */}
      <header className="h-14 md:h-16 bg-white border-b border-[#f0ebe4] px-4 md:px-16 flex items-center justify-between">
        <span className="font-heading font-bold text-xl text-[#855300] italic tracking-tight">tabi</span>
        <button
          onClick={() => setShowNewModal(true)}
          className="flex items-center gap-2 px-3 md:px-4 py-2 bg-[#f59e0b] hover:bg-[#d97706] text-white text-sm font-semibold rounded-[10px] transition-all cursor-pointer"
        >
          <Plus size={14} />
          New Trip
        </button>
      </header>

      {/* Content */}
      <div className="max-w-[1100px] mx-auto px-4 md:px-16 py-6 md:py-12">
        <h1 className="font-heading font-bold text-2xl md:text-[32px] text-[#1c1c18] mb-1">Your Trips</h1>
        <p className="text-sm text-[#534434] mb-6 md:mb-8">
          {allTrips.length} trip{allTrips.length !== 1 ? 's' : ''} · {upcomingCount} upcoming
        </p>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {allTrips.map((trip) => (
            <TripCard
              key={trip.id}
              trip={trip}
              stats={tripStats[trip.id] ?? { placeCount: 0, reservationCount: 0 }}
              onOpen={() => selectTrip(trip.id)}
              onEdit={() => setEditingTrip(trip)}
            />
          ))}
          <NewTripCard onClick={() => setShowNewModal(true)} />
        </div>
      </div>

      {showNewModal && <NewTripModal onClose={() => setShowNewModal(false)} />}
      {editingTrip && (
        <EditTripModal
          trip={editingTrip}
          onClose={() => setEditingTrip(null)}
        />
      )}
    </div>
  )
}
