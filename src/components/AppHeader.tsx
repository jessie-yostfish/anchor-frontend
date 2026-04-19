import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Settings } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { haptics } from '../lib/haptics'
import { ConfirmDialog } from './ConfirmDialog'

interface AppHeaderProps {
  showBack?: boolean
}

const STAGE_COUNT = 10

export function AppHeader({ showBack = true }: AppHeaderProps) {
  const { signOut, profile } = useAuth()
  const navigate = useNavigate()
  const [showLogoutDialog, setShowLogoutDialog] = useState(false)

  const STAGE_ORDER = [
    'case-opening','detention','jurisdiction','disposition',
    'six-month','twelve-month','eighteen-month','permanency',
    'review-hearings','case-closure',
  ]
  const currentStageIndex = STAGE_ORDER.indexOf(profile?.current_stage || 'case-opening')
  const progress = Math.max(1, currentStageIndex + 1) / STAGE_COUNT
  const radius = 22
  const circumference = 2 * Math.PI * radius
  const dashLength = circumference * progress
  const ringColor = '#7A6690'

  return (
    <>
      <div style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(250,247,242,0.96)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255,255,255,0.8)',
        boxShadow: '0 1px 12px rgba(90,70,110,0.08)',
      }}>
        <div style={{
          maxWidth: 480, margin: '0 auto',
          padding: '7px 16px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          position: 'relative',
        }}>

          {/* Left */}
          <div style={{ width: 34, flexShrink: 0 }}>
            {showBack && (
              <button
                onClick={() => { haptics.light(); navigate(-1) }}
                style={{
                  width: 34, height: 34, borderRadius: 10,
                  background: 'linear-gradient(145deg,#F4EFF8,#EDE5F4)',
                  border: '1px solid rgba(255,255,255,0.9)',
                  boxShadow: '0 2px 8px rgba(122,102,144,0.12),inset 0 1px 0 rgba(255,255,255,0.9)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer',
                }}
                aria-label="Go back"
              >
                <ArrowLeft size={15} color="#7A6690" />
              </button>
            )}
          </div>

          {/* Center — logo with progress ring */}
          <div style={{
            position: 'absolute', left: '50%', top: '50%',
            transform: 'translate(-50%, -50%)',
            width: 48, height: 48,
          }}>
            {/* Progress ring SVG */}
            <svg
              width="48" height="48"
              viewBox="0 0 48 48"
              style={{ position: 'absolute', top: 0, left: 0 }}
            >
              {/* Track */}
              <circle
                cx="24" cy="24" r={radius}
                fill="none"
                stroke="rgba(122,102,144,0.12)"
                strokeWidth="2"
              />
              {/* Progress arc */}
              <circle
                cx="24" cy="24" r={radius}
                fill="none"
                stroke={ringColor}
                strokeWidth="2"
                strokeDasharray={`${dashLength} ${circumference}`}
                strokeLinecap="round"
                transform="rotate(-90 24 24)"
                style={{ opacity: 0.55 }}
              />
            </svg>
            {/* Actual logo */}
            <img
              src="/anchor-icon-only.png"
              alt="Anchor"
              style={{
                position: 'absolute',
                top: '50%', left: '50%',
                transform: 'translate(-50%, -50%)',
                width: 30, height: 30,
                objectFit: 'contain',
              }}
            />
          </div>

          {/* Right */}
          <button
            onClick={() => { haptics.light(); navigate('/settings') }}
            style={{
              width: 34, height: 34, borderRadius: 10,
              background: 'linear-gradient(145deg,#F4EFF8,#EDE5F4)',
              border: '1px solid rgba(255,255,255,0.9)',
              boxShadow: '0 2px 8px rgba(122,102,144,0.12),inset 0 1px 0 rgba(255,255,255,0.9)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', flexShrink: 0,
            }}
            aria-label="Settings"
          >
            <Settings size={15} color="#7A6690" />
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
