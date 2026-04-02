import { useState } from 'react'
import { MapPin, Plane, Sparkles } from 'lucide-react'
import { Button } from '../shared/Button'
import { Input } from '../shared/Input'
import { useTripStore } from '../../stores/tripStore'
import { prepareSeedData } from '../../data/seed'

export function WelcomeScreen() {
  const createTrip = useTripStore((s) => s.createTrip)
  const importTrip = useTripStore((s) => s.importTrip)
  const loadTrip = useTripStore((s) => s.loadTrip)

  const [name, setName] = useState('')
  const [destination, setDestination] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [isCreating, setIsCreating] = useState(false)

  const canCreate = name.trim() && destination.trim() && startDate && endDate && endDate >= startDate

  const handleCreate = async () => {
    if (!canCreate) return
    setIsCreating(true)
    await createTrip({ name: name.trim(), destination: destination.trim(), startDate, endDate })
    setIsCreating(false)
  }

  return (
    <div className="min-h-screen bg-page-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo / Brand */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-amber-400 mb-4">
            <Plane size={28} className="text-white" />
          </div>
          <h1 className="text-4xl font-extrabold font-heading tracking-tight text-text-heading">
            Tabi
          </h1>
          <p className="text-text-muted mt-2 text-sm">
            Your personal travel planner
          </p>
        </div>

        {/* Create Trip Card */}
        <div className="bg-card-bg rounded-[16px] shadow-ambient p-8">
          <div className="flex items-center gap-2 mb-6">
            <MapPin size={20} className="text-primary" />
            <h2 className="text-lg font-semibold font-heading">Plan a new trip</h2>
          </div>

          <div className="space-y-4">
            <Input
              label="Trip Name"
              placeholder="e.g., Japan 2026"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <Input
              label="Destination"
              placeholder="e.g., Japan"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
            />

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Start Date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
              <Input
                label="End Date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          <Button
            className="w-full mt-6"
            onClick={handleCreate}
            disabled={!canCreate || isCreating}
          >
            {isCreating ? 'Creating...' : 'Start Planning'}
          </Button>
        </div>

        <div className="text-center mt-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex-1 h-px bg-border-light" />
            <span className="text-xs text-text-placeholder">or</span>
            <div className="flex-1 h-px bg-border-light" />
          </div>
          <Button
            variant="secondary"
            icon={<Sparkles size={16} />}
            className="w-full"
            onClick={async () => {
              const data = prepareSeedData()
              await importTrip(data)
              await loadTrip()
            }}
          >
            Load Japan 2026 Trip
          </Button>
          <p className="text-xs text-text-placeholder mt-3">
            Pre-loaded with 50+ places, itinerary, notes, and packing list
          </p>
        </div>

        <p className="text-center text-xs text-text-placeholder mt-4">
          All data is stored locally on your device. No account needed.
        </p>
      </div>
    </div>
  )
}
