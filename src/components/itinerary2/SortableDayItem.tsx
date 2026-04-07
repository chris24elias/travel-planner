import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { PlaceItem } from './PlaceItem'
import { NoteItem } from './NoteItem'
import { makeSortableId, type DayItem } from '../../utils/dayItems'

interface SortableDayItemProps {
  item: DayItem
}

export function SortableDayItem({ item }: SortableDayItemProps) {
  const id = makeSortableId(item)
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      {item.type === 'place' ? (
        <PlaceItem place={item.data} dragListeners={listeners} />
      ) : (
        <NoteItem note={item.data} dragListeners={listeners} />
      )}
    </div>
  )
}
