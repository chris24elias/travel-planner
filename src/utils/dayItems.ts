import type { Place, InlineNote } from '../types'

export type DayItem =
  | { type: 'place'; data: Place; orderInDay: number }
  | { type: 'note'; data: InlineNote; orderInDay: number }

export function getDayItems(dayIndex: number, places: Place[], inlineNotes: InlineNote[]): DayItem[] {
  const placeItems: DayItem[] = places
    .filter((p) => p.dayIndex === dayIndex)
    .map((p) => ({ type: 'place' as const, data: p, orderInDay: p.orderInDay ?? 0 }))

  const noteItems: DayItem[] = inlineNotes
    .filter((n) => n.dayIndex === dayIndex)
    .map((n) => ({ type: 'note' as const, data: n, orderInDay: n.orderInDay }))

  return [...placeItems, ...noteItems].sort((a, b) => a.orderInDay - b.orderInDay)
}

export function getNextOrderInDay(dayIndex: number, places: Place[], inlineNotes: InlineNote[]): number {
  return getDayItems(dayIndex, places, inlineNotes).length
}

export function parseSortableId(id: string): { type: 'place' | 'note'; id: string } {
  if (id.startsWith('place-')) return { type: 'place', id: id.slice(6) }
  if (id.startsWith('note-')) return { type: 'note', id: id.slice(5) }
  return { type: 'place', id }
}

export function makeSortableId(item: DayItem): string {
  return item.type === 'place' ? `place-${item.data.id}` : `note-${item.data.id}`
}
