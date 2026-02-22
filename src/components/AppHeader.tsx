import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, LogOut } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { haptics } from '../lib/haptics'
import { ConfirmDialog } from './ConfirmDialog'

interface AppHeaderProps {
  showBack?: boolean
}

export function AppHeader({ showBack = true }: AppHeaderProps) {
  const { signOut } = useAuth()
  const navigate = useNavigate()
  const [showLogoutDialog, setShowLogoutDialog] = useState(false)

  const handleBack = () => {
    haptics.light()
    navigate(-1)
  }

  const handleLogout = async () => {
    haptics.medium()
    await signOut()
  }

  return (
    <>
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {showBack && (
              <button
                onClick={handleBack}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Go back"
              >
                <ArrowLeft className="w-5 h-5 text-gray-700" />
              </button>
            )}
            <img
              src="/anchor-logo.png"
              alt="Anchor"
              className="w-10 h-10 object-contain"
            />
            <div className="flex flex-col">
              <span className="text-xl font-bold text-purple-800 tracking-tight" style={{ fontFamily: '"DM Serif Display", Georgia, serif' }}>
                Anchor
              </span>
              <span className="text-[10px] text-purple-400 font-medium -mt-1 tracking-wide">
                Find your footing.
              </span>
            </div>
          </div>
          <button
            onClick={() => {
              haptics.light()
              setShowLogoutDialog(true)
            }}
            className="flex items-center gap-2 px-3 py-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors text-sm"
            aria-label="Sign out"
          >
            <LogOut className="w-4 h-4" />
            <span className="font-medium hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </div>

     <ConfirmDialog
        isOpen={showLogoutDialog}
        onCancel={() => setShowLogoutDialog(false)}
        onConfirm={handleLogout}
        title="Sign Out"
        message="Are you sure you want to sign out?"
        confirmLabel="Sign Out"
        cancelLabel="Cancel"
      />
    </>
  )
}
