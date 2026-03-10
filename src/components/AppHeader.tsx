import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Settings } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { haptics } from '../lib/haptics'
import { ConfirmDialog } from './ConfirmDialog'

interface AppHeaderProps {
  showBack?: boolean
  title?: string
}

export function AppHeader({ showBack = true, title }: AppHeaderProps) {
  const { signOut } = useAuth()
  const navigate = useNavigate()
  const [showLogoutDialog, setShowLogoutDialog] = useState(false)

  return (
    <>
      <div
        className="sticky top-0 z-50"
        style={{
          background: '#FAF7F4',
          borderBottom: '1px solid rgba(122,102,144,0.12)',
        }}
      >
        <div className="max-w-md mx-auto px-4 flex items-center justify-between" style={{ paddingTop: title ? 10 : 8, paddingBottom: title ? 10 : 8 }}>
          <div className="flex items-center gap-3">
            {showBack && (
              <button
                onClick={() => { haptics.light(); navigate(-1) }}
                className="rounded-xl p-2 transition-colors"
                style={{ background: '#E8DDE8' }}
                aria-label="Go back"
              >
                <ArrowLeft className="w-4 h-4" style={{ color: '#7A6690' }} />
              </button>
            )}
            <img
              src="/anchor-logo-transparent.png"
              alt="Anchor"
              style={{
                width: title ? 44 : 52,
                height: title ? 44 : 52,
                objectFit: 'contain',
                filter: 'drop-shadow(0 2px 6px rgba(122,102,144,0.35))',
              }}
            />
            <div>
              <span
                style={{
                  fontFamily: "'Fraunces', Georgia, serif",
                  fontWeight: 700,
                  fontSize: title ? 17 : 22,
                  color: '#2A2030',
                  lineHeight: 1.1,
                  display: 'block',
                }}
              >
                {title || 'Anchor'}
              </span>
              {!title && (
                <span
                  style={{
                    fontSize: 11,
                    color: '#9A90A8',
                    fontWeight: 500,
                    letterSpacing: '0.04em',
                  }}
                >
                  Find your footing.
                </span>
              )}
            </div>
          </div>

          <button
            onClick={() => { haptics.light(); navigate('/settings') }}
            className="rounded-xl p-2 transition-colors"
            style={{ background: '#E8DDE8' }}
            aria-label="Settings"
          >
            <Settings className="w-4 h-4" style={{ color: '#7A6690' }} />
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
