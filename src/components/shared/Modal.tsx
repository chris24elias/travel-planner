import { useEffect, useRef, type ReactNode } from 'react'
import { X } from 'lucide-react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: ReactNode
  footer?: ReactNode
  width?: string
}

export function Modal({ isOpen, onClose, title, children, footer, width = 'max-w-lg' }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen) return
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/40 md:p-4"
      onClick={(e) => { if (e.target === overlayRef.current) onClose() }}
    >
      <div
        className={`${width} w-full bg-card-bg rounded-t-[16px] md:rounded-[16px] shadow-modal animate-in max-h-[90vh] md:max-h-none flex flex-col`}
        style={{ animation: 'modalIn 0.15s ease-out' }}
      >
        <div className="flex items-center justify-between px-4 md:px-6 py-3 md:py-4 border-b border-border-light flex-shrink-0">
          <h2 className="text-base md:text-lg font-semibold font-heading">{title}</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-text-muted hover:text-text-body hover:bg-surface-high transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        <div className="px-4 md:px-6 py-4 md:py-5 max-h-[70vh] overflow-y-auto flex-1">
          {children}
        </div>
        {footer && (
          <div className="flex items-center justify-between px-4 md:px-6 py-3 md:py-4 border-t border-border-light flex-shrink-0">
            {footer}
          </div>
        )}
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
