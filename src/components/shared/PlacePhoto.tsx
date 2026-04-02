import { useState } from 'react'
import { getPhotoUrl } from '../../services/googlePlaces'
import { CATEGORY_CONFIG } from '../../utils/categories'
import type { PlaceCategory } from '../../types'

const CATEGORY_EMOJI: Record<PlaceCategory, string> = {
  food: '🍜',
  temple: '⛩️',
  shopping: '🛍️',
  activity: '🎌',
  nightlife: '🍶',
  nature: '🌿',
  culture: '🎭',
  other: '📍',
}

interface PlacePhotoProps {
  photoName?: string
  category: PlaceCategory
  className?: string
  width?: number
}

export function PlacePhoto({ photoName, category, className = '', width = 600 }: PlacePhotoProps) {
  const [failed, setFailed] = useState(false)
  const catConfig = CATEGORY_CONFIG[category]

  if (!photoName || failed) {
    return (
      <div
        className={`flex items-center justify-center ${className}`}
        style={{ backgroundColor: catConfig.color + '22' }}
      >
        <span style={{ fontSize: '1.25rem' }}>
          {CATEGORY_EMOJI[category]}
        </span>
      </div>
    )
  }

  return (
    <img
      src={getPhotoUrl(photoName, width)}
      alt=""
      onError={() => setFailed(true)}
      className={`object-cover ${className}`}
    />
  )
}
