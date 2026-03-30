import { Plus, Copy, ExternalLink } from 'lucide-react'
import { SectionHeader } from '../layout/SectionHeader'
import { Button } from '../shared/Button'
import { useTripStore } from '../../stores/tripStore'
import { useUIStore } from '../../stores/uiStore'
import { formatDate, getNights } from '../../utils/dates'

export function AccommodationsPage() {
  const accommodations = useTripStore((s) => s.accommodations)
  const openModal = useUIStore((s) => s.openModal)
  const showToast = useUIStore((s) => s.showToast)

  const sorted = [...accommodations].sort((a, b) => a.checkIn.localeCompare(b.checkIn))

  const copyConfirmation = (num: string) => {
    navigator.clipboard.writeText(num)
    showToast('Confirmation number copied!')
  }

  return (
    <div>
      <SectionHeader
        title="Accommodations"
        action={
          <Button icon={<Plus size={16} />} onClick={() => openModal('accommodation')}>
            Add Stay
          </Button>
        }
      />

      {sorted.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-4xl mb-4">🏨</div>
          <h3 className="text-lg font-semibold font-heading text-text-heading mb-2">No accommodations yet</h3>
          <p className="text-sm text-text-muted mb-6">Add your hotels, hostels, or Airbnbs to keep track of where you're staying.</p>
          <Button icon={<Plus size={16} />} onClick={() => openModal('accommodation')}>
            Add Your First Stay
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {sorted.map((acc) => (
            <div
              key={acc.id}
              onClick={() => openModal('accommodation', acc.id)}
              className="bg-card-bg rounded-[12px] shadow-card hover:shadow-card-hover p-5 transition-all cursor-pointer hover:scale-[1.005]"
            >
              <h3 className="text-base font-semibold font-heading text-text-heading mb-3">{acc.name}</h3>

              <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                <div>
                  <span className="text-xs font-medium uppercase tracking-widest text-text-muted">Check-in</span>
                  <div className="text-text-body mt-0.5">{formatDate(acc.checkIn)}</div>
                </div>
                <div>
                  <span className="text-xs font-medium uppercase tracking-widest text-text-muted">Check-out</span>
                  <div className="text-text-body mt-0.5">
                    {formatDate(acc.checkOut)}
                    <span className="ml-2 text-xs text-text-muted">
                      ({getNights(acc.checkIn, acc.checkOut)} nights)
                    </span>
                  </div>
                </div>
              </div>

              {acc.address && (
                <p className="text-xs text-text-muted mt-3">{acc.address}</p>
              )}

              {acc.confirmationNumber && (
                <div className="flex items-center gap-2 mt-3">
                  <span className="text-xs font-medium uppercase tracking-widest text-text-muted">Conf #</span>
                  <code className="text-xs font-mono bg-surface-high px-2 py-0.5 rounded">
                    {acc.confirmationNumber}
                  </code>
                  <button
                    onClick={(e) => { e.stopPropagation(); copyConfirmation(acc.confirmationNumber!) }}
                    className="p-1 rounded hover:bg-surface-high transition-colors text-text-muted hover:text-text-body"
                  >
                    <Copy size={12} />
                  </button>
                </div>
              )}

              {acc.notes && (
                <p className="text-xs text-text-muted mt-3 line-clamp-2">{acc.notes}</p>
              )}

              {acc.link && (
                <a
                  href={acc.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex items-center gap-1 text-xs text-primary hover:text-primary-hover mt-2"
                >
                  <ExternalLink size={12} />
                  {new URL(acc.link).hostname}
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
