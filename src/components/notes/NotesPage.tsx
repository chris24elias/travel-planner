import { Plus, StickyNote } from 'lucide-react'
import { SectionHeader } from '../layout/SectionHeader'
import { Button } from '../shared/Button'
import { useTripStore } from '../../stores/tripStore'
import { useUIStore } from '../../stores/uiStore'

export function NotesPage() {
  const notes = useTripStore((s) => s.notes)
  const openModal = useUIStore((s) => s.openModal)

  return (
    <div>
      <SectionHeader
        title="Notes"
        action={
          <Button icon={<Plus size={16} />} onClick={() => openModal('note')}>
            New Note
          </Button>
        }
      />

      {notes.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-4xl mb-4">📝</div>
          <h3 className="text-lg font-semibold font-heading text-text-heading mb-2">
            Jot down tips, phrases, reminders
          </h3>
          <p className="text-sm text-text-muted mb-6">
            Anything useful for your trip — all in one place.
          </p>
          <Button icon={<Plus size={16} />} onClick={() => openModal('note')}>
            Create Your First Note
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {notes.sort((a, b) => a.orderIndex - b.orderIndex).map((note) => (
            <div
              key={note.id}
              onClick={() => openModal('note', note.id)}
              className="bg-card-bg rounded-[12px] shadow-card hover:shadow-card-hover p-5 transition-all cursor-pointer hover:scale-[1.005]"
            >
              <h3 className="text-sm font-semibold text-text-heading mb-2">{note.title}</h3>
              <p className="text-xs text-text-muted line-clamp-4 whitespace-pre-line">{note.content}</p>
            </div>
          ))}

          {/* New Note Card */}
          <button
            onClick={() => openModal('note')}
            className="border-2 border-dashed border-border-medium rounded-[12px] p-5 flex flex-col items-center justify-center gap-2 text-text-placeholder hover:text-text-muted hover:border-text-placeholder transition-all cursor-pointer min-h-[120px]"
          >
            <Plus size={20} />
            <span className="text-xs font-medium">New Note</span>
          </button>
        </div>
      )}
    </div>
  )
}
