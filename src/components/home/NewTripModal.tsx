import { useState } from 'react'
import { X, Loader2 } from 'lucide-react'
import { useTripStore } from '../../stores/tripStore'
import { prepareSeedData } from '../../data/seed'

interface NewTripModalProps {
  onClose: () => void
}

export function NewTripModal({ onClose }: NewTripModalProps) {
  const createTrip = useTripStore((s) => s.createTrip)
  const importTrip = useTripStore((s) => s.importTrip)
  const [name, setName] = useState('')
  const [destination, setDestination] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [saving, setSaving] = useState(false)
  const [loadingDemo, setLoadingDemo] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !startDate || !endDate) return
    setSaving(true)
    await createTrip({ name: name.trim(), destination: destination.trim() || name.trim(), startDate, endDate })
    setSaving(false)
    onClose()
  }

  const handleLoadDemo = async () => {
    setLoadingDemo(true)
    const doc = prepareSeedData()
    await importTrip(doc)
    setLoadingDemo(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-[20px] shadow-[0_8px_40px_rgba(0,0,0,0.15)] w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <h2 className="font-heading font-bold text-[20px] text-[#1c1c18]">Plan a New Trip</h2>
          <button onClick={onClose} className="text-[#534434] hover:text-[#1c1c18] transition-colors cursor-pointer">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-4">
          {/* Trip Name */}
          <div>
            <label className="block text-[11px] uppercase tracking-widest font-semibold text-[#534434] mb-1.5">Trip Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Japan 2026"
              required
              className="w-full px-4 py-2.5 bg-[#f7f3ed] rounded-[10px] text-sm text-[#1c1c18] placeholder:text-[#867461] focus:outline-none focus:ring-2 focus:ring-[#f59e0b]/40"
            />
          </div>

          {/* Destination */}
          <div>
            <label className="block text-[11px] uppercase tracking-widest font-semibold text-[#534434] mb-1.5">Destination <span className="text-[#867461] normal-case tracking-normal font-normal">(optional)</span></label>
            <input
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="Tokyo, Japan"
              className="w-full px-4 py-2.5 bg-[#f7f3ed] rounded-[10px] text-sm text-[#1c1c18] placeholder:text-[#867461] focus:outline-none focus:ring-2 focus:ring-[#f59e0b]/40"
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] uppercase tracking-widest font-semibold text-[#534434] mb-1.5">Start Date</label>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required
                className="w-full px-4 py-2.5 bg-[#f7f3ed] rounded-[10px] text-sm text-[#1c1c18] focus:outline-none focus:ring-2 focus:ring-[#f59e0b]/40" />
            </div>
            <div>
              <label className="block text-[11px] uppercase tracking-widest font-semibold text-[#534434] mb-1.5">End Date</label>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required min={startDate}
                className="w-full px-4 py-2.5 bg-[#f7f3ed] rounded-[10px] text-sm text-[#1c1c18] focus:outline-none focus:ring-2 focus:ring-[#f59e0b]/40" />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 border border-[#e8e0d5] text-[#534434] text-sm font-medium rounded-[10px] hover:bg-[#f7f3ed] transition-all cursor-pointer">
              Cancel
            </button>
            <button type="submit" disabled={saving || !name || !startDate || !endDate}
              className="flex-1 py-2.5 bg-[#f59e0b] hover:bg-[#d97706] text-white text-sm font-semibold rounded-[10px] transition-all cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2">
              {saving ? <Loader2 size={14} className="animate-spin" /> : null}
              Create Trip
            </button>
          </div>

          {/* Demo data link */}
          <div className="pt-1 text-center border-t border-[#f0ebe4]">
            <button type="button" onClick={handleLoadDemo} disabled={loadingDemo}
              className="text-xs text-[#867461] hover:text-[#534434] transition-colors cursor-pointer disabled:opacity-60 mt-3">
              {loadingDemo ? 'Loading…' : 'Load Japan 2026 demo trip'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
