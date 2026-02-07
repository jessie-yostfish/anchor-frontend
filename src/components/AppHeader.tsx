import { useState } from 'react'
import { Anchor, LogOut } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { haptics } from '../lib/haptics'
import { ConfirmDialog } from './ConfirmDialog'

export function AppHeader() {
  const { signOut } = useAuth()
  const [showLogoutDialog, setShowLogoutDialog] = useState(false)

  const handleLogout = async () => {
    haptics.medium()
    await signOut()
  }

  return (
    <>
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-teal-600 to-teal-400 rounded-xl flex items-center justify-center shadow-md">
              <Anchor className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">Anchor</span>
          </div>
          <button
            onClick={() => {
              haptics.light()
              setShowLogoutDialog(true)
            }}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Sign out"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showLogoutDialog}
        onClose={() => setShowLogoutDialog(false)}
        onConfirm={handleLogout}
        title="Sign Out"
        message="Are you sure you want to sign out?"
        confirmText="Sign Out"
        cancelText="Cancel"
      />
    </>
  )
}
