import { useState, useEffect } from 'react'
import { Modal } from '../shared/Modal'
import { Button } from '../shared/Button'
import { Input, TextArea } from '../shared/Input'
import { useTripStore } from '../../stores/tripStore'
import { useUIStore } from '../../stores/uiStore'

export function NoteModal() {
  const modal = useUIStore((s) => s.modal)
  const closeModal = useUIStore((s) => s.closeModal)
  const showToast = useUIStore((s) => s.showToast)

  const trip = useTripStore((s) => s.trip)
  const notes = useTripStore((s) => s.notes)
  const addNote = useTripStore((s) => s.addNote)
  const updateNote = useTripStore((s) => s.updateNote)
  const deleteNote = useTripStore((s) => s.deleteNote)

  const isOpen = modal.type === 'note'
  const existing = modal.itemId ? notes.find((n) => n.id === modal.itemId) : null
  const isEdit = !!existing

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [showDelete, setShowDelete] = useState(false)

  useEffect(() => {
    if (isOpen && existing) {
      setTitle(existing.title)
      setContent(existing.content)
    } else if (isOpen) {
      setTitle('')
      setContent('')
    }
    setShowDelete(false)
  }, [isOpen, existing])

  const handleSave = async () => {
    if (!title.trim() || !trip) return
    if (isEdit && existing) {
      await updateNote(existing.id, { title: title.trim(), content })
      showToast(`Updated "${title.trim()}"`)
    } else {
      await addNote({ tripId: trip.id, title: title.trim(), content })
      showToast(`Created "${title.trim()}"`)
    }
    closeModal()
  }

  const handleDelete = async () => {
    if (!existing) return
    await deleteNote(existing.id)
    showToast(`Deleted "${existing.title}"`)
    closeModal()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={closeModal}
      title={isEdit ? 'Edit Note' : 'New Note'}
      width="max-w-xl"
      footer={
        <>
          <div>
            {isEdit && (
              <Button variant="danger" onClick={() => setShowDelete(true)}>Delete</Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={closeModal}>Cancel</Button>
            <Button onClick={handleSave} disabled={!title.trim()}>Save</Button>
          </div>
        </>
      }
    >
      <div className="space-y-4">
        <Input
          label="Title"
          placeholder="e.g., General Tips"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          autoFocus
        />

        <TextArea
          label="Content"
          placeholder="Write your note here..."
          rows={10}
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
      </div>

      {showDelete && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4" onClick={() => setShowDelete(false)}>
          <div className="w-full max-w-[360px] bg-card-bg rounded-[16px] shadow-modal p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-base font-semibold font-heading text-text-heading mb-2">Delete note?</h3>
            <p className="text-sm text-text-muted mb-6">Remove "{existing?.title}"?</p>
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
