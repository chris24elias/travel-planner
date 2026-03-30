import { useState, useEffect } from 'react'
import { Modal } from '../shared/Modal'
import { Button } from '../shared/Button'
import { Input, TextArea } from '../shared/Input'
import { useTripStore } from '../../stores/tripStore'
import { useUIStore } from '../../stores/uiStore'
import { getNights } from '../../utils/dates'

export function AccommodationModal() {
  const modal = useUIStore((s) => s.modal)
  const closeModal = useUIStore((s) => s.closeModal)
  const showToast = useUIStore((s) => s.showToast)

  const trip = useTripStore((s) => s.trip)
  const accommodations = useTripStore((s) => s.accommodations)
  const addAccommodation = useTripStore((s) => s.addAccommodation)
  const updateAccommodation = useTripStore((s) => s.updateAccommodation)
  const deleteAccommodation = useTripStore((s) => s.deleteAccommodation)

  const isOpen = modal.type === 'accommodation'
  const existing = modal.itemId ? accommodations.find((a) => a.id === modal.itemId) : null
  const isEdit = !!existing

  const [name, setName] = useState('')
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [address, setAddress] = useState('')
  const [confirmationNumber, setConfirmationNumber] = useState('')
  const [notes, setNotes] = useState('')
  const [link, setLink] = useState('')
  const [showDelete, setShowDelete] = useState(false)

  useEffect(() => {
    if (isOpen && existing) {
      setName(existing.name)
      setCheckIn(existing.checkIn)
      setCheckOut(existing.checkOut)
      setAddress(existing.address || '')
      setConfirmationNumber(existing.confirmationNumber || '')
      setNotes(existing.notes)
      setLink(existing.link || '')
    } else if (isOpen) {
      setName('')
      setCheckIn(trip?.startDate || '')
      setCheckOut('')
      setAddress('')
      setConfirmationNumber('')
      setNotes('')
      setLink('')
    }
    setShowDelete(false)
  }, [isOpen, existing, trip])

  const nights = checkIn && checkOut && checkOut > checkIn ? getNights(checkIn, checkOut) : 0

  const handleSave = async () => {
    if (!name.trim() || !checkIn || !checkOut || !trip) return
    if (isEdit && existing) {
      await updateAccommodation(existing.id, {
        name: name.trim(), checkIn, checkOut, address: address.trim(),
        confirmationNumber: confirmationNumber.trim(), notes, link: link.trim(),
      })
      showToast(`Updated "${name.trim()}"`)
    } else {
      await addAccommodation({
        tripId: trip.id, name: name.trim(), checkIn, checkOut, address: address.trim(),
        confirmationNumber: confirmationNumber.trim(), notes, link: link.trim(),
      })
      showToast(`Added "${name.trim()}"`)
    }
    closeModal()
  }

  const handleDelete = async () => {
    if (!existing) return
    await deleteAccommodation(existing.id)
    showToast(`Removed "${existing.name}"`)
    closeModal()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={closeModal}
      title={isEdit ? 'Edit Accommodation' : 'Add Accommodation'}
      footer={
        <>
          <div>
            {isEdit && (
              <Button variant="danger" onClick={() => setShowDelete(true)}>Delete</Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={closeModal}>Cancel</Button>
            <Button onClick={handleSave} disabled={!name.trim() || !checkIn || !checkOut}>Save</Button>
          </div>
        </>
      }
    >
      <div className="space-y-4">
        <Input
          label="Name"
          placeholder="e.g., Hotel Gracery Shinjuku"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
        />

        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <Input
              label="Check-in"
              type="date"
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
            />
          </div>
          <div className="flex-1">
            <Input
              label="Check-out"
              type="date"
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
            />
          </div>
          {nights > 0 && (
            <span className="px-2.5 py-2.5 text-xs font-semibold text-primary bg-primary-light rounded-[8px] whitespace-nowrap">
              {nights} night{nights > 1 ? 's' : ''}
            </span>
          )}
        </div>

        <Input
          label="Address"
          placeholder="Full address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />

        <Input
          label="Confirmation #"
          placeholder="e.g., HG-28419"
          value={confirmationNumber}
          onChange={(e) => setConfirmationNumber(e.target.value)}
          className="font-mono"
        />

        <TextArea
          label="Notes"
          placeholder="Check-in instructions, nearby landmarks..."
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />

        <Input
          label="Link"
          placeholder="https://booking.com/..."
          value={link}
          onChange={(e) => setLink(e.target.value)}
        />
      </div>

      {showDelete && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4" onClick={() => setShowDelete(false)}>
          <div className="w-full max-w-[360px] bg-card-bg rounded-[16px] shadow-modal p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-base font-semibold font-heading text-text-heading mb-2">Delete accommodation?</h3>
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
