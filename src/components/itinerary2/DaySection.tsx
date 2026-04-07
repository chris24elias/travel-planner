import { useState, useCallback, useMemo } from 'react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useTripStore } from '../../stores/tripStore'
import { DayHeader } from './DayHeader'
import { AccommodationBanner } from './AccommodationBanner'
import { SortableDayItem } from './SortableDayItem'
import { PlaceItem } from './PlaceItem'
import { NoteItem } from './NoteItem'
import { InlineAddBar } from './InlineAddBar'
import { makeSortableId, parseSortableId } from '../../utils/dayItems'
import type { DayItem } from '../../utils/dayItems'
import type { AccommodationBanner as AccBanner } from './Itinerary2Page'

interface DaySectionProps {
  dayIndex: number
  date: string
  isExpanded: boolean
  onToggle: () => void
  label: string
  accommodationBanners: AccBanner[]
  items: DayItem[]
}

export function DaySection({
  dayIndex, date, isExpanded, onToggle, label, accommodationBanners, items,
}: DaySectionProps) {
  const updatePlace = useTripStore((s) => s.updatePlace)
  const updateInlineNote = useTripStore((s) => s.updateInlineNote)
  const [activeId, setActiveId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )

  const sortableIds = useMemo(() => items.map(makeSortableId), [items])

  const activeItem = useMemo(() => {
    if (!activeId) return null
    const parsed = parseSortableId(activeId)
    return items.find((item) =>
      item.type === parsed.type && item.data.id === parsed.id
    ) || null
  }, [activeId, items])

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }, [])

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    setActiveId(null)
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = sortableIds.indexOf(active.id as string)
    const newIndex = sortableIds.indexOf(over.id as string)
    if (oldIndex === -1 || newIndex === -1) return

    const reordered = [...items]
    const [moved] = reordered.splice(oldIndex, 1)
    reordered.splice(newIndex, 0, moved)

    for (let i = 0; i < reordered.length; i++) {
      const item = reordered[i]
      if (item.orderInDay !== i) {
        if (item.type === 'place') {
          await updatePlace(item.data.id, { orderInDay: i })
        } else {
          await updateInlineNote(item.data.id, { orderInDay: i })
        }
      }
    }
  }, [items, sortableIds, updatePlace, updateInlineNote])

  const placeCount = items.filter((i) => i.type === 'place').length
  const noteCount = items.filter((i) => i.type === 'note').length

  return (
    <div className="bg-card-bg rounded-[12px] shadow-card overflow-hidden">
      <DayHeader
        dayIndex={dayIndex}
        date={date}
        isExpanded={isExpanded}
        onToggle={onToggle}
        label={label}
        placeCount={placeCount}
        noteCount={noteCount}
      />

      <div
        className="grid transition-[grid-template-rows] duration-200 ease-in-out"
        style={{ gridTemplateRows: isExpanded ? '1fr' : '0fr' }}
      >
        <div className="overflow-hidden">
          {isExpanded && (
            <div className="px-5 pb-4">
              {accommodationBanners.map((banner) => (
                <AccommodationBanner
                  key={banner.accommodation.id}
                  accommodation={banner.accommodation}
                  status={banner.status}
                />
              ))}

              {items.length > 0 && (
                <DndContext
                  sensors={sensors}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext items={sortableIds} strategy={verticalListSortingStrategy}>
                    <div className="space-y-1 mt-2">
                      {items.map((item) => (
                        <SortableDayItem key={makeSortableId(item)} item={item} />
                      ))}
                    </div>
                  </SortableContext>

                  <DragOverlay>
                    {activeItem && (
                      <div className="bg-card-bg rounded-[8px] shadow-card-hover ring-2 ring-primary/30 scale-[1.02]">
                        {activeItem.type === 'place' ? (
                          <PlaceItem place={activeItem.data} isOverlay />
                        ) : (
                          <NoteItem note={activeItem.data} isOverlay />
                        )}
                      </div>
                    )}
                  </DragOverlay>
                </DndContext>
              )}

              <InlineAddBar dayIndex={dayIndex} isEmpty={items.length === 0} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
