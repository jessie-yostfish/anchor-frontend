import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Settings } from 'lucide-react'
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

  return (
    <>
      <div
        style={{
          position: 'sticky', top: 0, zIndex: 50,
          background: '#FAF7F4',
          borderBottom: '1px solid rgba(122,102,144,0.12)',
        }}
      >
        <div style={{
          maxWidth: 480, margin: '0 auto',
          padding: '8px 16px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {showBack && (
              <button
                onClick={() => { haptics.light(); navigate(-1) }}
                style={{
                  width: 34, height: 34, borderRadius: 10,
                  background: '#E8DDE8', border: 'none',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', flexShrink: 0,
                }}
                aria-label="Go back"
              >
                <ArrowLeft size={16} color="#7A6690" />
              </button>
            )}
            <img
              src="/anchor-icon-only.png"
              alt="Anchor"
              style={{
                width: 44,
                height: 44,
                objectFit: 'contain',
              }}
            />
          </div>

          <button
            onClick={() => { haptics.light(); navigate('/settings') }}
            style={{
              width: 34, height: 34, borderRadius: 10,
              background: '#E8DDE8', border: 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
            }}
            aria-label="Settings"
          >
            <Settings size={16} color="#7A6690" />
          </button>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showLogoutDialog}
        onCancel={() => setShowLogoutDialog(false)}
        onConfirm={signOut}
        title="Sign Out"
        message="Are you sure you want to sign out?"
        confirmLabel="Sign Out"
        cancelLabel="Cancel"
      />
    </>
  )
}
