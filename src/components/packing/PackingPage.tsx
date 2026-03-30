import { Plus, Check } from 'lucide-react'
import { useState } from 'react'
import { SectionHeader } from '../layout/SectionHeader'
import { Button } from '../shared/Button'
import { useTripStore } from '../../stores/tripStore'
import { DEFAULT_PACKING_CATEGORIES } from '../../utils/categories'

export function PackingPage() {
  const trip = useTripStore((s) => s.trip)
  const packingItems = useTripStore((s) => s.packingItems)
  const addPackingItem = useTripStore((s) => s.addPackingItem)
  const togglePacked = useTripStore((s) => s.togglePacked)
  const deletePackingItem = useTripStore((s) => s.deletePackingItem)

  const [newItemText, setNewItemText] = useState<Record<string, string>>({})

  if (!trip) return null

  const packed = packingItems.filter((i) => i.packed).length
  const total = packingItems.length
  const progress = total > 0 ? (packed / total) * 100 : 0

  // Group by category
  const categories = [...new Set([...DEFAULT_PACKING_CATEGORIES, ...packingItems.map((i) => i.category)])]
  const grouped: Record<string, typeof packingItems> = {}
  for (const cat of categories) {
    const items = packingItems.filter((i) => i.category === cat)
    if (items.length > 0 || DEFAULT_PACKING_CATEGORIES.includes(cat)) {
      grouped[cat] = items.sort((a, b) => a.orderIndex - b.orderIndex)
    }
  }

  const handleAddItem = async (category: string) => {
    const text = newItemText[category]?.trim()
    if (!text) return
    await addPackingItem({ tripId: trip.id, name: text, category })
    setNewItemText((prev) => ({ ...prev, [category]: '' }))
  }

  return (
    <div>
      <SectionHeader title="Packing List" />

      {/* Progress Bar */}
      <div className="flex items-center gap-4 mb-8">
        <div className="flex-1 h-2.5 bg-surface-high rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-amber-400 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="text-sm font-semibold text-text-body whitespace-nowrap">
          {packed}/{total} packed
        </span>
      </div>

      {/* Categories */}
      <div className="space-y-6">
        {Object.entries(grouped).map(([category, items]) => (
          <div key={category}>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-text-muted mb-3">
              {category}
            </h3>
            <div className="space-y-1">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 px-3 py-2 rounded-[8px] hover:bg-surface-high transition-colors group"
                >
                  <button
                    onClick={() => togglePacked(item.id)}
                    className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all cursor-pointer flex-shrink-0 ${
                      item.packed
                        ? 'bg-primary border-primary text-white'
                        : 'border-border-medium hover:border-primary'
                    }`}
                  >
                    {item.packed && <Check size={12} strokeWidth={3} />}
                  </button>
                  <span className={`text-sm flex-1 ${item.packed ? 'line-through text-text-muted' : 'text-text-body'}`}>
                    {item.name}
                  </span>
                  <button
                    onClick={() => deletePackingItem(item.id)}
                    className="text-xs text-text-placeholder hover:text-error opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              ))}

              {/* Inline add */}
              <div className="flex items-center gap-2 px-3 py-1">
                <input
                  type="text"
                  placeholder="Add item..."
                  value={newItemText[category] || ''}
                  onChange={(e) => setNewItemText((prev) => ({ ...prev, [category]: e.target.value }))}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleAddItem(category) }}
                  className="flex-1 text-sm bg-transparent border-none outline-none text-text-body placeholder:text-text-placeholder"
                />
                {newItemText[category]?.trim() && (
                  <button
                    onClick={() => handleAddItem(category)}
                    className="text-xs text-primary font-medium cursor-pointer hover:text-primary-hover"
                  >
                    Add
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
