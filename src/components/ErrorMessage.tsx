import { AlertTriangle } from 'lucide-react'
import { Button } from './Button'

interface ErrorMessageProps {
  message: string
  onRetry?: () => void
}

export function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  return (
    <div className="p-4 bg-amber-50 border-2 border-amber-200 rounded-xl">
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-amber-900 font-medium">{message}</p>
          {onRetry && (
            <Button
              onClick={onRetry}
              variant="outline"
              className="mt-3 border-amber-300 text-amber-700 hover:bg-amber-100"
            >
              Try Again
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
