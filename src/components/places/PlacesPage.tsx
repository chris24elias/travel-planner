import { Plus } from 'lucide-react'
import { SectionHeader } from '../layout/SectionHeader'
import { Button } from '../shared/Button'
import { CategoryBadge, PriorityBadge } from '../shared/CategoryBadge'
import { useTripStore } from '../../stores/tripStore'
import { useUIStore } from '../../stores/uiStore'

export function PlacesPage() {
  const places = useTripStore((s) => s.places)
  const customLists = useTripStore((s) => s.customLists)
  const openModal = useUIStore((s) => s.openModal)
  const activeListId = useUIStore((s) => s.activeListId)
  const setActiveListId = useUIStore((s) => s.setActiveListId)

  const filtered = activeListId
    ? places.filter((p) => p.listIds.includes(activeListId))
    : places

  const activeList = customLists.find((l) => l.id === activeListId)

  return (
    <div>
      <SectionHeader
        title="Places"
        action={
          <Button icon={<Plus size={16} />} onClick={() => openModal('place')}>
            Add Place
          </Button>
        }
      />

      {/* List Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        <button
          onClick={() => setActiveListId(null)}
          className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
            !activeListId ? 'bg-primary text-white' : 'bg-surface-high text-text-body hover:bg-surface-highest'
          }`}
        >
          All Places
        </button>
        {customLists.sort((a, b) => a.orderIndex - b.orderIndex).map((list) => (
          <button
            key={list.id}
            onClick={() => setActiveListId(list.id)}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
              activeListId === list.id ? 'bg-primary text-white' : 'bg-surface-high text-text-body hover:bg-surface-highest'
            }`}
          >
            {list.name}
          </button>
        ))}
        <button
          onClick={() => openModal('list')}
          className="px-4 py-1.5 rounded-full text-xs font-medium text-text-placeholder hover:text-text-muted border border-dashed border-border-medium hover:border-text-placeholder transition-all cursor-pointer"
        >
          + New List
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-4xl mb-4">📍</div>
          <h3 className="text-lg font-semibold font-heading text-text-heading mb-2">
            {activeList ? `No places in "${activeList.name}" yet` : 'Start building your collection'}
          </h3>
          <p className="text-sm text-text-muted mb-6">
            Save places you want to visit and organize them into lists.
          </p>
          <Button icon={<Plus size={16} />} onClick={() => openModal('place')}>
            Add Your First Place
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((place) => (
            <div
              key={place.id}
              onClick={() => openModal('place', place.id)}
              className="bg-card-bg rounded-[12px] shadow-card hover:shadow-card-hover p-5 transition-all cursor-pointer hover:scale-[1.005]"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-text-heading">{place.name}</h3>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <CategoryBadge category={place.category} />
                    {place.area && <span className="text-xs text-text-muted">{place.area}</span>}
                    <PriorityBadge priority={place.priority} />
                    {place.dayIndex != null && (
                      <span className="text-xs font-medium text-primary bg-primary-light px-2 py-0.5 rounded">
                        Day {place.dayIndex + 1}
                      </span>
                    )}
                  </div>
                  {place.notes && (
                    <p className="text-xs text-text-muted mt-2 line-clamp-2">{place.notes}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
