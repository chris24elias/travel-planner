import { useState, useEffect, useCallback } from 'react'
import { Star, Phone } from 'lucide-react'
import { Modal } from '../shared/Modal'
import { Button } from '../shared/Button'
import { Input, TextArea } from '../shared/Input'
import { PlaceSearch } from '../shared/PlaceSearch'
import type { PlaceDetails } from '../../services/googlePlaces'
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
  const [googlePlaceId, setGooglePlaceId] = useState<string | undefined>()
  const [lat, setLat] = useState<number | undefined>()
  const [lng, setLng] = useState<number | undefined>()
  const [photoName, setPhotoName] = useState<string | undefined>()
  const [rating, setRating] = useState<number | undefined>()
  const [websiteUri, setWebsiteUri] = useState<string | undefined>()
  const [phoneNumber, setPhoneNumber] = useState<string | undefined>()
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
      setGooglePlaceId(existing.googlePlaceId)
      setLat(existing.lat)
      setLng(existing.lng)
      setPhotoName(existing.photoName)
      setRating(existing.rating)
      setWebsiteUri(existing.websiteUri)
      setPhoneNumber(existing.phoneNumber)
    } else if (isOpen) {
      setName('')
      setCheckIn(trip?.startDate || '')
      setCheckOut('')
      setAddress('')
      setConfirmationNumber('')
      setNotes('')
      setLink('')
      setGooglePlaceId(undefined)
      setLat(undefined)
      setLng(undefined)
      setPhotoName(undefined)
      setRating(undefined)
      setWebsiteUri(undefined)
      setPhoneNumber(undefined)
    }
    setShowDelete(false)
  }, [isOpen, existing, trip])

  const nights = checkIn && checkOut && checkOut > checkIn ? getNights(checkIn, checkOut) : 0

  const handlePlaceSelect = useCallback((details: PlaceDetails) => {
    setName(details.name)
    setAddress(details.address)
    setGooglePlaceId(details.placeId)
    setLat(details.lat)
    setLng(details.lng)
    setPhotoName(details.photoNames?.[0])
    setRating(details.rating)
    setWebsiteUri(details.websiteUri)
    setPhoneNumber(details.phoneNumber)
    if (details.websiteUri && !link) {
      setLink(details.websiteUri)
    }
  }, [link])

  const handleSave = async () => {
    if (!name.trim() || !checkIn || !checkOut || !trip) return
    const googleFields = { googlePlaceId, lat, lng, photoName, rating, websiteUri, phoneNumber }
    if (isEdit && existing) {
      await updateAccommodation(existing.id, {
        name: name.trim(), checkIn, checkOut, address: address.trim(),
        confirmationNumber: confirmationNumber.trim(), notes, link: link.trim(),
        ...googleFields,
      })
      showToast(`Updated "${name.trim()}"`)
    } else {
      await addAccommodation({
        tripId: trip.id, name: name.trim(), checkIn, checkOut, address: address.trim(),
        confirmationNumber: confirmationNumber.trim(), notes, link: link.trim(),
        ...googleFields,
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
        <div>
          <label className="block text-sm font-medium text-text-body mb-1.5">Search Google Places</label>
          <PlaceSearch
            onSelect={handlePlaceSelect}
            placeholder="Search for a hotel or accommodation…"
          />
        </div>

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

        {(rating || phoneNumber) && (
          <div className="flex items-center gap-4 px-3 py-2 bg-primary-light/50 rounded-[10px] text-sm text-text-body">
            {rating && (
              <span className="flex items-center gap-1">
                <Star size={13} className="text-primary fill-primary" />
                <span className="font-medium">{rating}</span>
              </span>
            )}
            {phoneNumber && (
              <span className="flex items-center gap-1.5">
                <Phone size={13} className="text-text-muted" />
                <span>{phoneNumber}</span>
              </span>
            )}
            <span className="text-[11px] text-text-muted ml-auto">from Google</span>
          </div>
        )}

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
