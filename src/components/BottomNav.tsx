import { useLocation, useNavigate } from 'react-router-dom'
import { Home, List, FileText, MapPin, Scale, Users } from 'lucide-react'
import { haptics } from '../lib/haptics'

export function BottomNav() {
  const location = useLocation()
  const navigate = useNavigate()

  const tabs = [
    { id: 'home', label: 'HOME', icon: Home, path: '/dashboard' },
    { id: 'timeline', label: 'TIMELINE', icon: List, path: '/timeline' },
    { id: 'notes', label: 'NOTES', icon: FileText, path: '/notes' },
    { id: 'resources', label: 'RESOURCES', icon: MapPin, path: '/resources' },
    { id: 'legal', label: 'LEGAL', icon: Scale, path: '/legal' },
    { id: 'contacts', label: 'CONTACTS', icon: Users, path: '/contacts' },
  ]

  const isActive = (path: string) => {
    return location.pathname === path
  }

  const handleNavigation = (path: string) => {
    haptics.light()
    navigate(path)
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-inset-bottom z-50">
      <div className="max-w-screen-xl mx-auto px-2">
        <div className="flex items-center justify-around">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const active = isActive(tab.path)
            return (
              <button
                key={tab.id}
                onClick={() => handleNavigation(tab.path)}
                className={`flex flex-col items-center py-2 px-3 min-w-0 flex-1 transition-colors ${
                  active ? 'text-purple-600' : 'text-gray-500'
                }`}
              >
                <Icon className={`w-5 h-5 mb-1 ${active ? 'fill-purple-600' : ''}`} />
                <span className="text-[10px] font-semibold tracking-wide">{tab.label}</span>
              </button>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
