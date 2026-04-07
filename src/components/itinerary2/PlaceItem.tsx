import { GripVertical, X } from 'lucide-react'
import { useUIStore } from '../../stores/uiStore'
import { useTripStore } from '../../stores/tripStore'
import { CATEGORY_CONFIG } from '../../utils/categories'
import type { Place } from '../../types'
import type { SyntheticListenerMap } from '@dnd-kit/core/dist/hooks/utilities'

interface PlaceItemProps {
  place: Place
  dragListeners?: SyntheticListenerMap
  isOverlay?: boolean
}

const PRIORITY_STYLES: Record<string, string> = {
  'must-see': 'bg-primary-light text-primary-hover',
  'want-to': 'bg-blue-50 text-blue-600',
  'if-time': 'bg-gray-100 text-gray-500',
}

const PRIORITY_LABELS: Record<string, string> = {
  'must-see': 'Must See',
  'want-to': 'Want To',
  'if-time': 'If Time',
}

export function PlaceItem({ place, dragListeners, isOverlay }: PlaceItemProps) {
  const openModal = useUIStore((s) => s.openModal)
  const deletePlace = useTripStore((s) => s.deletePlace)
  const showToast = useUIStore((s) => s.showToast)
  const catConfig = CATEGORY_CONFIG[place.category]

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation()
    await deletePlace(place.id)
    showToast(`Removed "${place.name}"`)
  }

  return (
    <div
      onClick={() => !isOverlay && openModal('place', place.id)}
      className="group flex items-center gap-2 px-2 py-2 rounded-[8px] hover:bg-surface-high/50 transition-colors cursor-pointer"
    >
      <div
        {...dragListeners}
        className="flex-shrink-0 cursor-grab active:cursor-grabbing p-0.5 text-text-placeholder hover:text-text-muted transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        <GripVertical size={14} />
      </div>

      <span
        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
        style={{ backgroundColor: catConfig.color }}
      />

      <span className="text-sm font-medium text-text-heading truncate">
        {place.name}
      </span>

      {place.address && (
        <span className="text-xs text-text-muted truncate hidden sm:inline">
          {place.address}
        </span>
      )}

      <div className="ml-auto flex items-center gap-1.5 flex-shrink-0">
        {place.priority && (
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${PRIORITY_STYLES[place.priority]}`}>
            {PRIORITY_LABELS[place.priority]}
          </span>
        )}

        <button
          onClick={handleDelete}
          className="p-1 rounded hover:bg-surface-highest text-text-placeholder hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"
        >
          <X size={12} />
        </button>
      </div>
    </div>
  )
}
