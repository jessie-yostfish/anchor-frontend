import { LucideIcon } from 'lucide-react'
import { haptics } from '../lib/haptics'

interface SelectionCardProps {
  selected: boolean
  icon: LucideIcon
  title: string
  description?: string
  onClick: () => void
}

export function SelectionCard({ selected, icon: Icon, title, description, onClick }: SelectionCardProps) {
  const handleClick = () => {
    haptics.light()
    onClick()
  }

  return (
    <button
      onClick={handleClick}
      className={`w-full p-6 rounded-xl border-2 transition-all text-left ${
        selected
          ? 'border-purple-600 bg-purple-50 shadow-md'
          : 'border-gray-200 hover:border-purple-200 hover:shadow-sm'
      }`}
    >
      <div className="flex items-start gap-4">
        <div
          className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
            selected ? 'bg-purple-600' : 'bg-gray-100'
          }`}
        >
          <Icon className={`w-6 h-6 ${selected ? 'text-white' : 'text-gray-600'}`} />
        </div>
        <div className="flex-1">
          <h3 className={`font-bold mb-1 ${selected ? 'text-purple-900' : 'text-gray-900'}`}>
            {title}
          </h3>
          {description && (
            <p className={`text-sm ${selected ? 'text-purple-700' : 'text-gray-600'}`}>
              {description}
            </p>
          )}
        </div>
        {selected && (
          <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}
      </div>
    </button>
  )
}
