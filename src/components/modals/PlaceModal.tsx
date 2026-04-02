import { useState, useEffect } from 'react'
import { Star } from 'lucide-react'
import { Modal } from '../shared/Modal'
import { Button } from '../shared/Button'
import { Input, TextArea, Select } from '../shared/Input'
import { PlaceSearch } from '../shared/PlaceSearch'
import { PlacePhoto } from '../shared/PlacePhoto'
import { useTripStore } from '../../stores/tripStore'
import { useUIStore } from '../../stores/uiStore'
import { PLACE_CATEGORIES, PRIORITIES } from '../../utils/categories'
import { CATEGORY_CONFIG, PRIORITY_CONFIG } from '../../utils/categories'
import type { PlaceDetails } from '../../services/googlePlaces'
import type { PlaceCategory, PlacePriority } from '../../types'

export function PlaceModal() {
  const modal = useUIStore((s) => s.modal)
  const closeModal = useUIStore((s) => s.closeModal)
  const showToast = useUIStore((s) => s.showToast)

  const trip = useTripStore((s) => s.trip)
  const places = useTripStore((s) => s.places)
  const customLists = useTripStore((s) => s.customLists)
  const addPlace = useTripStore((s) => s.addPlace)
  const updatePlace = useTripStore((s) => s.updatePlace)
  const deletePlace = useTripStore((s) => s.deletePlace)

  const isOpen = modal.type === 'place'
  const existing = modal.itemId ? places.find((p) => p.id === modal.itemId) : null
  const isEdit = !!existing

  const [name, setName] = useState('')
  const [category, setCategory] = useState<PlaceCategory>('food')
  const [area, setArea] = useState('')
  const [address, setAddress] = useState('')
  const [notes, setNotes] = useState('')
  const [priority, setPriority] = useState<PlacePriority>('want-to')
  const [link, setLink] = useState('')
  const [lat, setLat] = useState('')
  const [lng, setLng] = useState('')
  const [listIds, setListIds] = useState<string[]>([])
  const [showDelete, setShowDelete] = useState(false)

  // Google Places fields
  const [googlePlaceId, setGooglePlaceId] = useState<string | undefined>()
  const [photoName, setPhotoName] = useState<string | undefined>()
  const [rating, setRating] = useState<number | undefined>()
  const [websiteUri, setWebsiteUri] = useState<string | undefined>()

  useEffect(() => {
    if (isOpen && existing) {
      setName(existing.name)
      setCategory(existing.category)
      setArea(existing.area || '')
      setAddress(existing.address || '')
      setNotes(existing.notes)
      setPriority(existing.priority)
      setLink(existing.links[0] || '')
      setLat(existing.lat != null ? String(existing.lat) : '')
      setLng(existing.lng != null ? String(existing.lng) : '')
      setListIds(existing.listIds)
      setGooglePlaceId(existing.googlePlaceId)
      setPhotoName(existing.photoName)
      setRating(existing.rating)
      setWebsiteUri(existing.websiteUri)
    } else if (isOpen) {
      setName('')
      setCategory('food')
      setArea('')
      setAddress('')
      setNotes('')
      setPriority('want-to')
      setLink('')
      setLat('')
      setLng('')
      setListIds([])
      setGooglePlaceId(undefined)
      setPhotoName(undefined)
      setRating(undefined)
      setWebsiteUri(undefined)
    }
    setShowDelete(false)
  }, [isOpen, existing])

  const handlePlaceSelected = (details: PlaceDetails) => {
    setName(details.name)
    setAddress(details.address)
    setLat(details.lat ? String(details.lat) : '')
    setLng(details.lng ? String(details.lng) : '')
    setGooglePlaceId(details.placeId)
    setPhotoName(details.photoName)
    setRating(details.rating)
    setWebsiteUri(details.websiteUri)
    if (details.websiteUri && !link) setLink(details.websiteUri)
  }

  const handleSave = async () => {
    if (!name.trim() || !trip) return
    const links = link.trim() ? [link.trim()] : []
    const parsedLat = lat.trim() ? parseFloat(lat) : undefined
    const parsedLng = lng.trim() ? parseFloat(lng) : undefined

    const placeData = {
      name: name.trim(),
      category,
      area: area.trim(),
      address: address.trim(),
      notes,
      priority,
      links,
      listIds,
      lat: parsedLat,
      lng: parsedLng,
      googlePlaceId,
      photoName,
      rating,
      websiteUri,
    }

    if (isEdit && existing) {
      await updatePlace(existing.id, placeData)
      showToast(`Updated "${name.trim()}"`)
    } else {
      await addPlace({
        tripId: trip.id,
        ...placeData,
        dayIndex: null,
        orderInDay: 0,
        timeSlot: '',
      })
      showToast(`Added "${name.trim()}"`)
    }
    closeModal()
  }

  const handleDelete = async () => {
    if (!existing) return
    await deletePlace(existing.id)
    showToast(`Removed "${existing.name}"`)
    closeModal()
  }

  const toggleList = (listId: string) => {
    setListIds((prev) =>
      prev.includes(listId) ? prev.filter((id) => id !== listId) : [...prev, listId]
    )
  }

  const hasGoogleData = !!googlePlaceId

  return (
    <Modal
      isOpen={isOpen}
      onClose={closeModal}
      title={isEdit ? 'Edit Place' : 'Add Place'}
      footer={
        <>
          <div>
            {isEdit && (
              <Button variant="danger" onClick={() => setShowDelete(true)}>
                Delete
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={closeModal}>Cancel</Button>
            <Button onClick={handleSave} disabled={!name.trim()}>Save</Button>
          </div>
        </>
      }
    >
      <div className="space-y-4">
        {/* Google Places Search */}
        <div>
          <label className="text-xs font-medium uppercase tracking-widest text-text-muted block mb-1.5">
            Search Google Places
          </label>
          <PlaceSearch onSelect={handlePlaceSelected} />
        </div>

        {/* Photo preview + Google badge when linked */}
        {hasGoogleData && (
          <div className="flex items-center gap-3 p-3 bg-surface-high rounded-[10px]">
            <PlacePhoto
              photoName={photoName}
              category={category}
              className="w-14 h-14 rounded-[8px] flex-shrink-0"
              width={120}
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="text-[10px] font-semibold text-primary uppercase tracking-wide">Google Places</span>
                {rating && (
                  <span className="flex items-center gap-0.5 text-[11px] font-medium text-amber-500">
                    <Star size={10} fill="currentColor" />
                    {rating.toFixed(1)}
                  </span>
                )}
              </div>
              {address && <p className="text-xs text-text-muted truncate">{address}</p>}
              {websiteUri && (
                <a
                  href={websiteUri}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-primary hover:underline truncate block"
                  onClick={(e) => e.stopPropagation()}
                >
                  {websiteUri.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                </a>
              )}
            </div>
            <button
              onClick={() => {
                setGooglePlaceId(undefined)
                setPhotoName(undefined)
                setRating(undefined)
                setWebsiteUri(undefined)
                setAddress('')
              }}
              className="text-[10px] text-text-placeholder hover:text-text-muted transition-colors cursor-pointer flex-shrink-0"
            >
              Unlink
            </button>
          </div>
        )}

        <div className="border-t border-border-light pt-4">
          <Input
            label="Name"
            placeholder="e.g., Senso-ji Temple"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus={!hasGoogleData}
          />
        </div>

        <div className="flex gap-3">
          <div className="flex-1">
            <Select
              label="Category"
              value={category}
              onChange={(e) => setCategory(e.target.value as PlaceCategory)}
              options={PLACE_CATEGORIES.map((c) => ({ value: c, label: CATEGORY_CONFIG[c].label }))}
            />
          </div>
          <div className="flex-1">
            <Select
              label="Priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value as PlacePriority)}
              options={PRIORITIES.map((p) => ({ value: p, label: PRIORITY_CONFIG[p].label }))}
            />
          </div>
        </div>

        <Input
          label="Area / Neighborhood"
          placeholder="e.g., Asakusa"
          value={area}
          onChange={(e) => setArea(e.target.value)}
        />

        <TextArea
          label="Notes"
          placeholder="Any details, tips, or things to remember..."
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

        <div className="flex gap-3">
          <div className="flex-1">
            <Input
              label="Latitude"
              placeholder="e.g., 35.7148"
              value={lat}
              onChange={(e) => setLat(e.target.value)}
              type="number"
            />
          </div>
          <div className="flex-1">
            <Input
              label="Longitude"
              placeholder="e.g., 139.7967"
              value={lng}
              onChange={(e) => setLng(e.target.value)}
              type="number"
            />
          </div>
        </div>

        {customLists.length > 0 && (
          <div>
            <label className="text-xs font-medium uppercase tracking-widest text-text-muted block mb-2">
              Lists
            </label>
            <div className="flex flex-wrap gap-2">
              {customLists.map((list) => (
                <button
                  key={list.id}
                  onClick={() => toggleList(list.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                    listIds.includes(list.id)
                      ? 'bg-primary text-white'
                      : 'bg-surface-high text-text-body hover:bg-surface-highest'
                  }`}
                >
                  {list.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {showDelete && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4" onClick={() => setShowDelete(false)}>
          <div className="w-full max-w-[360px] bg-card-bg rounded-[16px] shadow-modal p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-base font-semibold font-heading text-text-heading mb-2">Delete place?</h3>
            <p className="text-sm text-text-muted mb-6">
              Are you sure you want to remove "{existing?.name}"? This can be undone from History.
            </p>
            <div className="flex gap-3 justify-end">
              <Button variant="ghost" onClick={() => setShowDelete(false)}>Cancel</Button>
              <Button variant="danger" onClick={handleDelete} className="bg-error hover:bg-red-600 text-white">
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </Modal>
  )
}
