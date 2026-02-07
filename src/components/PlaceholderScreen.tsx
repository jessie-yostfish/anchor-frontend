import { Header } from './Header'
import { BottomNav } from './BottomNav'

interface PlaceholderScreenProps {
  title: string
  description?: string
}

export function PlaceholderScreen({ title, description }: PlaceholderScreenProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto px-6 py-8 pb-24">
        <Header title={title} />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">🚧</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
            {description && (
              <p className="text-gray-600">{description}</p>
            )}
            <p className="text-sm text-gray-500 mt-4">
              This screen is under construction
            </p>
          </div>
        </div>
      </div>
      <BottomNav />
    </div>
  )
}
