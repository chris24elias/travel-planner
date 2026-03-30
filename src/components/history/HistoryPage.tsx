import { SectionHeader } from '../layout/SectionHeader'
import { useTripStore } from '../../stores/tripStore'
import { format, isToday, isYesterday, parseISO } from 'date-fns'

export function HistoryPage() {
  const historyEntries = useTripStore((s) => s.historyEntries)

  const sorted = [...historyEntries].sort((a, b) => b.timestamp.localeCompare(a.timestamp))

  // Group by day
  const grouped: Record<string, typeof sorted> = {}
  for (const entry of sorted) {
    const date = parseISO(entry.timestamp)
    let label: string
    if (isToday(date)) label = 'Today'
    else if (isYesterday(date)) label = 'Yesterday'
    else label = format(date, 'MMMM d, yyyy')

    if (!grouped[label]) grouped[label] = []
    grouped[label].push(entry)
  }

  return (
    <div>
      <SectionHeader
        title="History"
        subtitle="Every change is tracked. Undo with ⌘Z or revert to any point."
      />

      {sorted.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-4xl mb-4">📜</div>
          <h3 className="text-lg font-semibold font-heading text-text-heading mb-2">No history yet</h3>
          <p className="text-sm text-text-muted">Changes you make will appear here.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([label, entries]) => (
            <div key={label}>
              <h3 className="text-xs font-semibold uppercase tracking-widest text-text-muted mb-3">
                {label}
              </h3>
              <div className="space-y-1">
                {entries.map((entry) => (
                  <div
                    key={entry.id}
                    className="flex items-center gap-4 px-4 py-2.5 rounded-[8px] hover:bg-surface-high transition-colors"
                  >
                    <span className="text-xs text-text-muted whitespace-nowrap">
                      {format(parseISO(entry.timestamp), 'h:mm a')}
                    </span>
                    <span className="text-sm text-text-body flex-1">{entry.description}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
