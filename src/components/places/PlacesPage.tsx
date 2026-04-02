import { useState, useRef, useEffect, useCallback } from 'react'
import {
  GripVertical, Plus, Pencil, Trash2, Check, X,
  MoreHorizontal, Star, LayoutGrid, List, ChevronRight,
  MapPin, Globe, ExternalLink,
} from 'lucide-react'
import { PlacePhoto } from '../shared/PlacePhoto'
import { CategoryBadge, PriorityBadge } from '../shared/CategoryBadge'
import { getPhotoUrl } from '../../services/googlePlaces'
import { useTripStore } from '../../stores/tripStore'
import { useUIStore } from '../../stores/uiStore'
import { CATEGORY_CONFIG } from '../../utils/categories'
import type { Place, CustomList } from '../../types'

// ─── Types ──────────────────────────────────────────────────────────────────────

type SortKey = 'manual' | 'name' | 'rating' | 'category'
type ViewMode = 'grid' | 'list'

// ─── ListRow ────────────────────────────────────────────────────────────────────

function ListRow({
  list,
  isActive,
  placeCount,
  onSelect,
  onRename,
  onDelete,
  isDragging,
  isDragOver,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
}: {
  list: CustomList
  isActive: boolean
  placeCount: number
  onSelect: () => void
  onRename: (name: string) => void
  onDelete: () => void
  isDragging: boolean
  isDragOver: boolean
  onDragStart: (e: React.DragEvent) => void
  onDragOver: (e: React.DragEvent) => void
  onDragLeave: () => void
  onDrop: (e: React.DragEvent) => void
}) {
  const [editing, setEditing] = useState(false)
  const [editName, setEditName] = useState(list.name)
  const [confirming, setConfirming] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { if (editing) inputRef.current?.focus() }, [editing])

  const commitRename = () => {
    if (editName.trim() && editName.trim() !== list.name) onRename(editName.trim())
    else setEditName(list.name)
    setEditing(false)
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-1.5 px-3 py-2 rounded-[8px] bg-red-50">
        <span className="flex-1 text-[11px] text-red-600">Delete "{list.name}"?</span>
        <button
          onClick={() => { onDelete(); setConfirming(false) }}
          className="text-[10px] font-semibold text-white bg-red-500 hover:bg-red-600 px-2 py-0.5 rounded cursor-pointer transition-colors"
        >
          Delete
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="text-[10px] text-text-muted hover:text-text-body px-1.5 py-0.5 rounded hover:bg-[#e8e0d5] cursor-pointer transition-colors"
        >
          Cancel
        </button>
      </div>
    )
  }

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onClick={editing ? undefined : onSelect}
      className={`group relative flex items-center gap-2 px-3 py-2 rounded-[8px] transition-all select-none cursor-pointer ${
        isDragOver ? 'bg-amber-50 ring-1 ring-amber-200' : ''
      } ${isDragging ? 'opacity-40' : ''} ${
        isActive ? 'bg-amber-50' : 'hover:bg-[#ede8e0]'
      }`}
    >
      {isActive && (
        <div className="absolute left-0 top-1.5 bottom-1.5 w-[3px] bg-primary rounded-full" />
      )}

      <GripVertical
        size={13}
        className="text-[#d8c3ad] flex-shrink-0 cursor-grab active:cursor-grabbing"
        onClick={(e) => e.stopPropagation()}
      />

      {editing ? (
        <input
          ref={inputRef}
          value={editName}
          onChange={(e) => setEditName(e.target.value)}
          onBlur={commitRename}
          onKeyDown={(e) => {
            if (e.key === 'Enter') commitRename()
            if (e.key === 'Escape') { setEditName(list.name); setEditing(false) }
          }}
          onClick={(e) => e.stopPropagation()}
          className="flex-1 min-w-0 text-xs font-medium bg-white border border-amber-300 rounded px-1.5 py-0.5 outline-none"
        />
      ) : (
        <span className={`flex-1 min-w-0 text-xs font-medium truncate ${isActive ? 'text-amber-900' : 'text-text-body'}`}>
          {list.name}
        </span>
      )}

      {!editing && (
        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full flex-shrink-0 transition-all ${
          isActive ? 'bg-amber-200 text-amber-800' : 'bg-[#e8e0d5] text-text-muted'
        }`}>
          {placeCount}
        </span>
      )}

      {!editing && (
        <div className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 flex-shrink-0">
          <button
            onClick={(e) => { e.stopPropagation(); setEditing(true); setEditName(list.name) }}
            className="p-1 rounded hover:bg-[#d8c3ad]/40 text-text-muted hover:text-text-body transition-colors cursor-pointer"
          >
            <Pencil size={11} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setConfirming(true) }}
            className="p-1 rounded hover:bg-red-100 text-text-muted hover:text-red-500 transition-colors cursor-pointer"
          >
            <Trash2 size={11} />
          </button>
        </div>
      )}
    </div>
  )
}

// ─── ListSidebar ─────────────────────────────────────────────────────────────────

function ListSidebar({
  lists,
  places,
  activeListId,
  onSelectList,
}: {
  lists: CustomList[]
  places: Place[]
  activeListId: string | null
  onSelectList: (id: string | null) => void
}) {
  const trip = useTripStore((s) => s.trip)
  const addList = useTripStore((s) => s.addList)
  const updateList = useTripStore((s) => s.updateList)
  const deleteList = useTripStore((s) => s.deleteList)
  const reorderLists = useTripStore((s) => s.reorderLists)

  const [showNewInput, setShowNewInput] = useState(false)
  const [newListName, setNewListName] = useState('')
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [dragOverId, setDragOverId] = useState<string | null>(null)
  const newInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { if (showNewInput) newInputRef.current?.focus() }, [showNewInput])

  const sorted = [...lists].sort((a, b) => a.orderIndex - b.orderIndex)

  const handleCreateList = async () => {
    if (!trip || !newListName.trim()) return
    await addList({ tripId: trip.id, name: newListName.trim(), color: undefined, icon: undefined })
    setNewListName('')
    setShowNewInput(false)
  }

  const handleDrop = useCallback((targetId: string) => {
    if (!draggingId || draggingId === targetId) return
    const ids = sorted.map((l) => l.id)
    const fromIdx = ids.indexOf(draggingId)
    const toIdx = ids.indexOf(targetId)
    ids.splice(fromIdx, 1)
    ids.splice(toIdx, 0, draggingId)
    reorderLists(ids)
    setDraggingId(null)
    setDragOverId(null)
  }, [draggingId, sorted, reorderLists])

  return (
    <div className="w-56 flex-shrink-0 flex flex-col bg-[#f7f3ed] border-r border-[#ede8e0] overflow-hidden">
      <div className="flex items-center justify-between px-4 pt-4 pb-2 flex-shrink-0">
        <span className="text-xs font-bold text-text-heading">My Lists</span>
        <button
          onClick={() => setShowNewInput(true)}
          className="text-[10px] font-semibold text-primary border border-primary/30 rounded-full px-2 py-0.5 hover:bg-primary/10 transition-colors cursor-pointer"
        >
          + New
        </button>
      </div>

      {/* All Places */}
      <div
        onClick={() => onSelectList(null)}
        className={`relative mx-2 flex items-center gap-2 px-3 py-2 rounded-[8px] cursor-pointer transition-all flex-shrink-0 ${
          activeListId === null ? 'bg-amber-50' : 'hover:bg-[#ede8e0]'
        }`}
      >
        {activeListId === null && (
          <div className="absolute left-0 top-1.5 bottom-1.5 w-[3px] bg-primary rounded-full" />
        )}
        <span className={`flex-1 text-xs font-medium ${activeListId === null ? 'text-amber-900' : 'text-text-body'}`}>
          All Places
        </span>
        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
          activeListId === null ? 'bg-amber-200 text-amber-800' : 'bg-[#e8e0d5] text-text-muted'
        }`}>
          {places.length}
        </span>
      </div>

      {/* Scrollable list rows */}
      <div className="flex-1 overflow-y-auto px-2 py-1 space-y-0.5">
        {sorted.map((list) => (
          <ListRow
            key={list.id}
            list={list}
            isActive={activeListId === list.id}
            placeCount={places.filter((p) => p.listIds.includes(list.id)).length}
            onSelect={() => onSelectList(list.id)}
            onRename={(name) => updateList(list.id, { name })}
            onDelete={() => {
              if (activeListId === list.id) onSelectList(null)
              deleteList(list.id)
            }}
            isDragging={draggingId === list.id}
            isDragOver={dragOverId === list.id}
            onDragStart={(e) => { e.stopPropagation(); setDraggingId(list.id) }}
            onDragOver={(e) => { e.preventDefault(); setDragOverId(list.id) }}
            onDragLeave={() => setDragOverId(null)}
            onDrop={(e) => { e.preventDefault(); handleDrop(list.id) }}
          />
        ))}

        {showNewInput ? (
          <div className="flex items-center gap-1.5 px-3 py-2">
            <input
              ref={newInputRef}
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreateList()
                if (e.key === 'Escape') { setNewListName(''); setShowNewInput(false) }
              }}
              placeholder="List name…"
              className="flex-1 min-w-0 text-xs bg-white border border-amber-300 rounded px-2 py-1 outline-none"
            />
            <button onClick={handleCreateList} className="p-1 rounded bg-primary text-white hover:bg-amber-700 cursor-pointer">
              <Check size={10} />
            </button>
            <button onClick={() => { setNewListName(''); setShowNewInput(false) }} className="p-1 rounded hover:bg-[#d8c3ad]/40 text-text-muted cursor-pointer">
              <X size={10} />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowNewInput(true)}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-[8px] text-[11px] text-text-placeholder hover:text-text-muted border border-dashed border-[#d8c3ad] hover:border-text-placeholder transition-all cursor-pointer mt-1"
          >
            <Plus size={11} />
            New List
          </button>
        )}
      </div>
    </div>
  )
}

// ─── CardMenu ─────────────────────────────────────────────────────────────────────

function CardMenu({
  place,
  lists,
  activeListId,
  onEdit,
  onMoveToList,
  onRemoveFromList,
  onDelete,
  onClose,
}: {
  place: Place
  lists: CustomList[]
  activeListId: string | null
  onEdit: () => void
  onMoveToList: (listId: string) => void
  onRemoveFromList: () => void
  onDelete: () => void
  onClose: () => void
}) {
  const [showMoveSubmenu, setShowMoveSubmenu] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) onClose()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose])

  const targetLists = lists.filter((l) => !place.listIds.includes(l.id))
  const canRemove = activeListId !== null && place.listIds.includes(activeListId)

  return (
    <div
      ref={ref}
      className="absolute top-8 right-2 z-30 bg-white rounded-[10px] shadow-[0_8px_32px_rgba(133,83,0,0.12)] border border-[#f0ebe4] py-1 min-w-[160px]"
    >
      <button
        onClick={() => { onEdit(); onClose() }}
        className="w-full text-left px-3 py-2 text-xs text-text-body hover:bg-[#f7f3ed] transition-colors cursor-pointer"
      >
        Edit place
      </button>

      <div
        className="relative"
        onMouseEnter={() => setShowMoveSubmenu(true)}
        onMouseLeave={() => setShowMoveSubmenu(false)}
      >
        <button className="w-full flex items-center justify-between px-3 py-2 text-xs text-text-body hover:bg-[#f7f3ed] transition-colors cursor-pointer">
          Move to list
          <ChevronRight size={11} className="text-text-muted" />
        </button>
        {showMoveSubmenu && (
          <div className="absolute left-full top-0 -ml-1 pl-2 pt-0">
          <div className="bg-white rounded-[10px] shadow-[0_8px_32px_rgba(133,83,0,0.12)] border border-[#f0ebe4] py-1 min-w-[144px]">
            {targetLists.length === 0 ? (
              <p className="px-3 py-2 text-[11px] text-text-muted italic">No other lists</p>
            ) : (
              targetLists.map((l) => (
                <button
                  key={l.id}
                  onClick={() => { onMoveToList(l.id); onClose() }}
                  className="w-full text-left px-3 py-2 text-xs text-text-body hover:bg-[#f7f3ed] transition-colors cursor-pointer"
                >
                  {l.name}
                </button>
              ))
            )}
          </div>
          </div>
        )}
      </div>

      {canRemove && (
        <button
          onClick={() => { onRemoveFromList(); onClose() }}
          className="w-full text-left px-3 py-2 text-xs text-orange-600 hover:bg-orange-50 transition-colors cursor-pointer"
        >
          Remove from list
        </button>
      )}

      <div className="h-px bg-[#f0ebe4] my-1" />
      <button
        onClick={() => { onDelete(); onClose() }}
        className="w-full text-left px-3 py-2 text-xs text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
      >
        Delete place
      </button>
    </div>
  )
}

// ─── PlaceCard (grid) ──────────────────────────────────────────────────────────

function PlaceCardGrid({
  place,
  lists,
  activeListId,
  onSelect,
  onEdit,
  onMoveToList,
  onRemoveFromList,
  onDelete,
}: {
  place: Place
  lists: CustomList[]
  activeListId: string | null
  onSelect: () => void
  onEdit: () => void
  onMoveToList: (listId: string) => void
  onRemoveFromList: () => void
  onDelete: () => void
}) {
  const [menuOpen, setMenuOpen] = useState(false)
  const closeMenu = useCallback(() => setMenuOpen(false), [])

  return (
    <div
      className="relative bg-white rounded-[14px] shadow-card hover:shadow-card-hover transition-all group cursor-pointer"
      onClick={onSelect}
    >
      <PlacePhoto
        photoName={place.photoName}
        category={place.category}
        className="w-full h-[160px] flex-shrink-0 rounded-t-[14px]"
        width={400}
      />

      <div className="p-3 space-y-1.5">
        <h3 className="text-sm font-semibold text-text-heading leading-snug line-clamp-1">{place.name}</h3>
        <div className="flex items-center gap-1.5 flex-wrap">
          <CategoryBadge category={place.category} />
          {place.rating && (
            <span className="flex items-center gap-0.5 text-[11px] font-medium text-amber-500">
              <Star size={10} fill="currentColor" />
              {place.rating.toFixed(1)}
            </span>
          )}
          {place.area && <span className="text-[11px] text-text-muted truncate">{place.area}</span>}
        </div>
        {place.dayIndex != null && (
          <span className="inline-block text-[11px] font-medium text-primary bg-primary/10 px-2 py-0.5 rounded">
            Day {place.dayIndex + 1}
          </span>
        )}
      </div>

      {/* ••• button */}
      <div className="absolute top-2 right-2">
        <button
          onClick={(e) => { e.stopPropagation(); setMenuOpen((v) => !v) }}
          className="opacity-0 group-hover:opacity-100 p-1.5 bg-white/90 backdrop-blur-sm rounded-full shadow-sm hover:bg-white transition-all cursor-pointer"
        >
          <MoreHorizontal size={13} className="text-text-muted" />
        </button>
        {menuOpen && (
          <CardMenu
            place={place}
            lists={lists}
            activeListId={activeListId}
            onEdit={onEdit}
            onMoveToList={onMoveToList}
            onRemoveFromList={onRemoveFromList}
            onDelete={onDelete}
            onClose={closeMenu}
          />
        )}
      </div>
    </div>
  )
}

// ─── PlaceCard (list) ──────────────────────────────────────────────────────────

function PlaceCardList({
  place,
  lists,
  activeListId,
  onSelect,
  onEdit,
  onMoveToList,
  onRemoveFromList,
  onDelete,
}: {
  place: Place
  lists: CustomList[]
  activeListId: string | null
  onSelect: () => void
  onEdit: () => void
  onMoveToList: (listId: string) => void
  onRemoveFromList: () => void
  onDelete: () => void
}) {
  const [menuOpen, setMenuOpen] = useState(false)
  const closeMenu = useCallback(() => setMenuOpen(false), [])

  return (
    <div
      className="relative flex items-stretch bg-white rounded-[12px] shadow-card hover:shadow-card-hover transition-all group cursor-pointer"
      onClick={onSelect}
    >
      <PlacePhoto
        photoName={place.photoName}
        category={place.category}
        className="w-20 min-h-[80px] flex-shrink-0 rounded-l-[12px]"
        width={160}
      />
      <div className="flex-1 min-w-0 px-3 py-3">
        <h3 className="text-sm font-semibold text-text-heading leading-snug line-clamp-1 mb-1">{place.name}</h3>
        <div className="flex items-center gap-1.5 flex-wrap">
          <CategoryBadge category={place.category} />
          <PriorityBadge priority={place.priority} />
          {place.rating && (
            <span className="flex items-center gap-0.5 text-[11px] font-medium text-amber-500">
              <Star size={10} fill="currentColor" />
              {place.rating.toFixed(1)}
            </span>
          )}
          {place.area && <span className="text-[11px] text-text-muted">{place.area}</span>}
          {place.dayIndex != null && (
            <span className="text-[11px] font-medium text-primary bg-primary/10 px-2 py-0.5 rounded">
              Day {place.dayIndex + 1}
            </span>
          )}
        </div>
        {place.notes && (
          <p className="text-xs text-text-muted mt-1.5 line-clamp-1">{place.notes}</p>
        )}
      </div>

      <div className="relative flex-shrink-0 flex items-center pr-2">
        <button
          onClick={(e) => { e.stopPropagation(); setMenuOpen((v) => !v) }}
          className="opacity-0 group-hover:opacity-100 p-1.5 rounded-full hover:bg-[#f7f3ed] transition-all cursor-pointer"
        >
          <MoreHorizontal size={14} className="text-text-muted" />
        </button>
        {menuOpen && (
          <CardMenu
            place={place}
            lists={lists}
            activeListId={activeListId}
            onEdit={onEdit}
            onMoveToList={onMoveToList}
            onRemoveFromList={onRemoveFromList}
            onDelete={onDelete}
            onClose={closeMenu}
          />
        )}
      </div>
    </div>
  )
}

// ─── Place Detail View Modal ──────────────────────────────────────────────────

function PlaceDetailView({
  place, onClose, onEdit,
}: {
  place: Place | null
  onClose: () => void
  onEdit: (placeId: string) => void
}) {
  const overlayRef = useRef<HTMLDivElement>(null)
  const customLists = useTripStore((s) => s.customLists)

  useEffect(() => {
    if (!place) return
    const handleEscape = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [place, onClose])

  if (!place) return null

  const photos = place.photoName ? [place.photoName] : []
  const placeLists = customLists.filter((l) => place.listIds.includes(l.id))

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4"
      onClick={(e) => { if (e.target === overlayRef.current) onClose() }}
    >
      <div
        className="max-w-md w-full bg-white rounded-[16px] shadow-modal overflow-hidden max-h-[85vh] flex flex-col"
        style={{ animation: 'modalIn 0.15s ease-out' }}
      >
        {/* Hero photo */}
        <div className="relative flex-shrink-0" style={{ height: '200px' }}>
          {photos[0] ? (
            <img src={getPhotoUrl(photos[0], 800)} alt={place.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-surface-high flex items-center justify-center">
              <PlacePhoto photoName={undefined} category={place.category} className="w-full h-full" />
            </div>
          )}
          <button
            onClick={onClose}
            className="absolute top-3 left-3 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center transition-all cursor-pointer"
          >
            <X size={16} className="text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          <div>
            <h2 className="text-base font-bold font-heading text-text-heading leading-tight mb-1.5">{place.name}</h2>
            <div className="flex items-center gap-2 flex-wrap">
              <CategoryBadge category={place.category} />
              <PriorityBadge priority={place.priority} />
              {place.rating && (
                <span className="flex items-center gap-0.5 text-xs font-semibold text-amber-500">
                  <Star size={11} fill="currentColor" />
                  {place.rating.toFixed(1)}
                </span>
              )}
            </div>
          </div>

          {place.address && (
            <div className="flex items-start gap-2">
              <MapPin size={13} className="text-text-muted flex-shrink-0 mt-0.5" />
              <p className="text-xs text-text-body leading-relaxed">{place.address}</p>
            </div>
          )}

          {place.area && (
            <p className="text-xs text-text-muted">{place.area}</p>
          )}

          {place.notes && (
            <p className="text-xs text-text-body leading-relaxed bg-surface-high rounded-[8px] px-3 py-2">{place.notes}</p>
          )}

          {place.links.length > 0 && (
            <div className="space-y-1">
              {place.links.filter(Boolean).map((link, i) => (
                <a
                  key={i}
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-xs text-primary hover:underline"
                >
                  <Globe size={12} className="flex-shrink-0" />
                  <span className="truncate">{link.replace(/^https?:\/\//, '').replace(/\/$/, '')}</span>
                </a>
              ))}
            </div>
          )}

          {place.dayIndex != null && (
            <div className="text-xs text-text-muted">
              Scheduled: <span className="font-medium text-text-body">Day {place.dayIndex + 1}</span>
              {place.timeSlot && <span> · {place.timeSlot}</span>}
            </div>
          )}

          {placeLists.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {placeLists.map((l) => (
                <span key={l.id} className="text-[10px] font-medium text-text-muted bg-surface-high px-2 py-0.5 rounded-full">
                  {l.name}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 border-t border-[#f0ebe4] px-5 py-3">
          <button
            onClick={() => { onEdit(place.id); onClose() }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary hover:bg-amber-700 text-white text-xs font-semibold rounded-[10px] transition-all cursor-pointer"
          >
            <Pencil size={13} />
            Edit Place
          </button>
        </div>
      </div>

      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  )
}

// ─── PlacesPage ───────────────────────────────────────────────────────────────────

export function PlacesPage() {
  const places = useTripStore((s) => s.places)
  const customLists = useTripStore((s) => s.customLists)
  const updatePlace = useTripStore((s) => s.updatePlace)
  const deletePlace = useTripStore((s) => s.deletePlace)
  const openModal = useUIStore((s) => s.openModal)
  const activeListId = useUIStore((s) => s.activeListId)
  const setActiveListId = useUIStore((s) => s.setActiveListId)

  const [sortBy, setSortBy] = useState<SortKey>('manual')
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [detailPlace, setDetailPlace] = useState<Place | null>(null)

  const filtered = activeListId
    ? places.filter((p) => p.listIds.includes(activeListId))
    : places

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'name') return a.name.localeCompare(b.name)
    if (sortBy === 'rating') return (b.rating ?? 0) - (a.rating ?? 0)
    if (sortBy === 'category') return a.category.localeCompare(b.category)
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  })

  const activeList = customLists.find((l) => l.id === activeListId)

  const handleMoveToList = (place: Place, targetListId: string) => {
    const newListIds = [...place.listIds.filter((id) => id !== activeListId), targetListId]
    updatePlace(place.id, { listIds: newListIds })
  }

  const handleRemoveFromList = (place: Place) => {
    if (!activeListId) return
    updatePlace(place.id, { listIds: place.listIds.filter((id) => id !== activeListId) })
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <ListSidebar
        lists={customLists}
        places={places}
        activeListId={activeListId}
        onSelectList={setActiveListId}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Toolbar */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 flex-shrink-0">
          <div>
            <h1 className="text-xl font-bold font-heading text-text-heading leading-tight">
              {activeList ? activeList.name : 'All Places'}
            </h1>
            <p className="text-xs text-text-muted mt-0.5">{sorted.length} place{sorted.length !== 1 ? 's' : ''}</p>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortKey)}
              className="text-xs bg-[#f1ede7] text-text-body border-none rounded-[8px] px-3 py-1.5 outline-none cursor-pointer"
            >
              <option value="manual">Sort: Added</option>
              <option value="name">Sort: Name</option>
              <option value="rating">Sort: Rating</option>
              <option value="category">Sort: Category</option>
            </select>

            <div className="flex bg-[#f1ede7] rounded-[8px] p-0.5">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-[6px] transition-all cursor-pointer ${viewMode === 'grid' ? 'bg-white shadow-sm text-text-heading' : 'text-text-muted hover:text-text-body'}`}
              >
                <LayoutGrid size={14} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-[6px] transition-all cursor-pointer ${viewMode === 'list' ? 'bg-white shadow-sm text-text-heading' : 'text-text-muted hover:text-text-body'}`}
              >
                <List size={14} />
              </button>
            </div>

            <button
              onClick={() => openModal('place')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white text-xs font-semibold rounded-[8px] hover:bg-amber-700 transition-colors cursor-pointer"
            >
              <Plus size={13} />
              Add Place
            </button>
          </div>
        </div>

        {/* Place grid/list */}
        <div className="flex-1 overflow-y-auto px-6 pb-6">
          {sorted.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-16">
              <div className="text-4xl mb-4">📍</div>
              <h3 className="text-lg font-semibold font-heading text-text-heading mb-2">
                {activeList ? `No places in "${activeList.name}" yet` : 'Start building your collection'}
              </h3>
              <p className="text-sm text-text-muted mb-6">
                Save places from the map or add them manually.
              </p>
              <button
                onClick={() => openModal('place')}
                className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white text-sm font-semibold rounded-[10px] hover:bg-amber-700 transition-colors cursor-pointer"
              >
                <Plus size={15} />
                Add Your First Place
              </button>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
              {sorted.map((place) => (
                <PlaceCardGrid
                  key={place.id}
                  place={place}
                  lists={customLists}
                  activeListId={activeListId}
                  onSelect={() => setDetailPlace(place)}
                  onEdit={() => openModal('place', place.id)}
                  onMoveToList={(listId) => handleMoveToList(place, listId)}
                  onRemoveFromList={() => handleRemoveFromList(place)}
                  onDelete={() => deletePlace(place.id)}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {sorted.map((place) => (
                <PlaceCardList
                  key={place.id}
                  place={place}
                  lists={customLists}
                  activeListId={activeListId}
                  onSelect={() => setDetailPlace(place)}
                  onEdit={() => openModal('place', place.id)}
                  onMoveToList={(listId) => handleMoveToList(place, listId)}
                  onRemoveFromList={() => handleRemoveFromList(place)}
                  onDelete={() => deletePlace(place.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Detail view modal */}
      <PlaceDetailView
        place={detailPlace}
        onClose={() => setDetailPlace(null)}
        onEdit={(id) => openModal('place', id)}
      />
    </div>
  )
}
