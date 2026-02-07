import { AlertTriangle } from 'lucide-react'
import { Modal } from './Modal'
import { Button } from './Button'

interface ConfirmDialogProps {
  isOpen: boolean
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void
  onCancel: () => void
  destructive?: boolean
  loading?: boolean
}

export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  destructive = false,
  loading = false,
}: ConfirmDialogProps) {
  return (
    <Modal isOpen={isOpen} onClose={onCancel}>
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <div
            className={`w-16 h-16 rounded-full flex items-center justify-center ${
              destructive ? 'bg-red-100' : 'bg-purple-100'
            }`}
          >
            <AlertTriangle
              className={`w-8 h-8 ${destructive ? 'text-red-600' : 'text-purple-600'}`}
            />
          </div>
        </div>

        <h2 className="text-xl font-bold text-gray-900 mb-2">{title}</h2>
        <p className="text-gray-600 mb-6">{message}</p>

        <div className="space-y-3">
          <Button
            onClick={onConfirm}
            disabled={loading}
            className={`w-full ${destructive ? 'bg-red-600 hover:bg-red-700' : ''}`}
          >
            {loading ? 'Processing...' : confirmLabel}
          </Button>
          <Button onClick={onCancel} variant="outline" className="w-full" disabled={loading}>
            {cancelLabel}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
