import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { haptics } from '../lib/haptics'

interface HeaderProps {
  title?: string
  onBack?: () => void
  showBack?: boolean
  action?: React.ReactNode
}

export function Header({ title, onBack, showBack = true, action }: HeaderProps) {
  const navigate = useNavigate()

  const handleBack = () => {
    haptics.light()
    if (onBack) {
      onBack()
    } else {
      navigate(-1)
    }
  }

  return (
    <header className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-4">
        {showBack && (
          <button
            onClick={handleBack}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
        )}
        {title && <h1 className="text-2xl font-bold text-gray-900">{title}</h1>}
      </div>
      {action && <div>{action}</div>}
    </header>
  )
}
