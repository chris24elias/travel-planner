import { type ReactNode } from 'react'
import { AlertTriangle, Trash2, Upload } from 'lucide-react'
import { Button } from './Button'

interface ConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmLabel?: string
  variant?: 'warning' | 'danger' | 'info'
}

const VARIANT_CONFIG = {
  warning: { icon: AlertTriangle, iconColor: 'text-warning', buttonVariant: 'primary' as const },
  danger: { icon: Trash2, iconColor: 'text-error', buttonVariant: 'danger' as const },
  info: { icon: Upload, iconColor: 'text-primary', buttonVariant: 'primary' as const },
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  variant = 'warning',
}: ConfirmDialogProps) {
  if (!isOpen) return null

  const config = VARIANT_CONFIG[variant]
  const IconComponent = config.icon

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[360px] bg-card-bg rounded-[16px] shadow-modal p-6"
        onClick={(e) => e.stopPropagation()}
        style={{ animation: 'modalIn 0.15s ease-out' }}
      >
        <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-4 ${
          variant === 'danger' ? 'bg-red-50' : variant === 'warning' ? 'bg-primary-light' : 'bg-primary-light'
        }`}>
          <IconComponent size={20} className={config.iconColor} />
        </div>

        <h3 className="text-base font-semibold font-heading text-text-heading mb-2">{title}</h3>
        <p className="text-sm text-text-muted mb-6">{message}</p>

        <div className="flex gap-3 justify-end">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button
            variant={config.buttonVariant}
            onClick={() => { onConfirm(); onClose() }}
            className={variant === 'danger' ? 'bg-error hover:bg-red-600 text-white' : ''}
          >
            {confirmLabel}
          </Button>
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
