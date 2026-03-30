import { useState, useEffect } from 'react'
import { Modal } from '../shared/Modal'
import { Button } from '../shared/Button'
import { Input, TextArea } from '../shared/Input'
import { useTripStore } from '../../stores/tripStore'
import { useUIStore } from '../../stores/uiStore'
import { RESERVATION_CATEGORIES, RESERVATION_CATEGORY_CONFIG } from '../../utils/categories'
import type { ReservationCategory } from '../../types'

export function ReservationModal() {
  const modal = useUIStore((s) => s.modal)
  const closeModal = useUIStore((s) => s.closeModal)
  const showToast = useUIStore((s) => s.showToast)

  const trip = useTripStore((s) => s.trip)
  const reservations = useTripStore((s) => s.reservations)
  const addReservation = useTripStore((s) => s.addReservation)
  const updateReservation = useTripStore((s) => s.updateReservation)
  const deleteReservation = useTripStore((s) => s.deleteReservation)

  const isOpen = modal.type === 'reservation'
  const existing = modal.itemId ? reservations.find((r) => r.id === modal.itemId) : null
  const isEdit = !!existing

  const [name, setName] = useState('')
  const [category, setCategory] = useState<ReservationCategory>('dining')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [confirmationNumber, setConfirmationNumber] = useState('')
  const [notes, setNotes] = useState('')
  const [link, setLink] = useState('')
  const [showDelete, setShowDelete] = useState(false)

  useEffect(() => {
    if (isOpen && existing) {
      setName(existing.name)
      setCategory(existing.category)
      const [d, t] = existing.dateTime.split('T')
      setDate(d)
      setTime(t?.slice(0, 5) || '')
      setConfirmationNumber(existing.confirmationNumber || '')
      setNotes(existing.notes)
      setLink(existing.link || '')
    } else if (isOpen) {
      setName('')
      setCategory('dining')
      setDate(trip?.startDate || '')
      setTime('')
      setConfirmationNumber('')
      setNotes('')
      setLink('')
    }
    setShowDelete(false)
  }, [isOpen, existing, trip])

  const handleSave = async () => {
    if (!name.trim() || !date || !trip) return
    const dateTime = time ? `${date}T${time}:00` : date

    if (isEdit && existing) {
      await updateReservation(existing.id, {
        name: name.trim(), category, dateTime,
        confirmationNumber: confirmationNumber.trim(), notes, link: link.trim(),
      })
      showToast(`Updated "${name.trim()}"`)
    } else {
      await addReservation({
        tripId: trip.id, name: name.trim(), category, dateTime,
        confirmationNumber: confirmationNumber.trim(), notes, link: link.trim(),
      })
      showToast(`Added "${name.trim()}"`)
    }
    closeModal()
  }

  const handleDelete = async () => {
    if (!existing) return
    await deleteReservation(existing.id)
    showToast(`Removed "${existing.name}"`)
    closeModal()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={closeModal}
      title={isEdit ? 'Edit Reservation' : 'Add Reservation'}
      footer={
        <>
          <div>
            {isEdit && (
              <Button variant="danger" onClick={() => setShowDelete(true)}>Delete</Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={closeModal}>Cancel</Button>
            <Button onClick={handleSave} disabled={!name.trim() || !date}>Save</Button>
          </div>
        </>
      }
    >
      <div className="space-y-4">
        <Input
          label="Name"
          placeholder="e.g., Sushi Dai"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
        />

        {/* Category Pill Selector */}
        <div>
          <label className="text-xs font-medium uppercase tracking-widest text-text-muted block mb-2">
            Category
          </label>
          <div className="flex gap-2">
            {RESERVATION_CATEGORIES.map((cat) => {
              const config = RESERVATION_CATEGORY_CONFIG[cat]
              const isSelected = category === cat
              return (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`flex-1 px-3 py-2 rounded-[8px] text-xs font-medium transition-all cursor-pointer ${
                    isSelected
                      ? 'text-white shadow-card'
                      : 'bg-surface-high text-text-body hover:bg-surface-highest'
                  }`}
                  style={isSelected ? { backgroundColor: config.color } : undefined}
                >
                  {config.label}
                </button>
              )
            })}
          </div>
        </div>

        <div className="flex gap-3">
          <div className="flex-1">
            <Input label="Date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div className="flex-1">
            <Input label="Time" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
          </div>
        </div>

        <Input
          label="Confirmation #"
          placeholder="e.g., RES-12345"
          value={confirmationNumber}
          onChange={(e) => setConfirmationNumber(e.target.value)}
          className="font-mono"
        />

        <TextArea
          label="Notes"
          placeholder="Any details..."
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />

        <Input
          label="Link"
          placeholder="https://..."
          value={link}
          onChange={(e) => setLink(e.target.value)}
        />
      </div>

      {showDelete && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4" onClick={() => setShowDelete(false)}>
          <div className="w-full max-w-[360px] bg-card-bg rounded-[16px] shadow-modal p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-base font-semibold font-heading text-text-heading mb-2">Delete reservation?</h3>
            <p className="text-sm text-text-muted mb-6">Remove "{existing?.name}"?</p>
            <div className="flex gap-3 justify-end">
              <Button variant="ghost" onClick={() => setShowDelete(false)}>Cancel</Button>
              <Button variant="danger" onClick={handleDelete} className="bg-error hover:bg-red-600 text-white">Delete</Button>
            </div>
          </div>
        </div>
      )}
    </Modal>
  )
}
