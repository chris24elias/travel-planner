import { useState, useEffect } from 'react'
import { Button } from '../shared/Button'
import { Input } from '../shared/Input'
import { useTripStore } from '../../stores/tripStore'
import { useUIStore } from '../../stores/uiStore'

const LIST_COLORS = [
  '#22c55e', '#3b82f6', '#a855f7', '#f59e0b',
  '#ec4899', '#10b981', '#6366f1', '#6b7280',
]

export function ListModal() {
  const modal = useUIStore((s) => s.modal)
  const closeModal = useUIStore((s) => s.closeModal)
  const showToast = useUIStore((s) => s.showToast)

  const trip = useTripStore((s) => s.trip)
  const addList = useTripStore((s) => s.addList)

  const isOpen = modal.type === 'list'

  const [name, setName] = useState('')
  const [color, setColor] = useState(LIST_COLORS[0])

  useEffect(() => {
    if (isOpen) {
      setName('')
      setColor(LIST_COLORS[0])
    }
  }, [isOpen])

  const handleCreate = async () => {
    if (!name.trim() || !trip) return
    await addList({ tripId: trip.id, name: name.trim(), color, icon: '' })
    showToast(`Created list "${name.trim()}"`)
    closeModal()
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={closeModal}
    >
      <div
        className="w-full max-w-[360px] bg-card-bg rounded-[16px] shadow-modal p-6"
        onClick={(e) => e.stopPropagation()}
        style={{ animation: 'modalIn 0.15s ease-out' }}
      >
        <h3 className="text-base font-semibold font-heading text-text-heading mb-4">New List</h3>

        <div className="space-y-4">
          <Input
            placeholder="e.g., Ramen Spots, Coffee Shops..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleCreate() }}
            autoFocus
          />

          <div>
            <label className="text-xs font-medium uppercase tracking-widest text-text-muted block mb-2">
              Color
            </label>
            <div className="flex gap-2">
              {LIST_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-full transition-all cursor-pointer ${
                    color === c ? 'ring-2 ring-offset-2 ring-text-heading scale-110' : 'hover:scale-110'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-3 justify-end mt-6">
          <Button variant="ghost" onClick={closeModal}>Cancel</Button>
          <Button onClick={handleCreate} disabled={!name.trim()}>Create List</Button>
        </div>
      </div>

      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  )
}
