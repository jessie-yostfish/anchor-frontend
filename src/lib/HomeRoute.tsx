import { useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Welcome } from '../screens'

export function HomeRoute() {
  const { user, profile, loading } = useAuth()
  const [showSplash, setShowSplash] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 1800)
    return () => clearTimeout(timer)
  }, [])

  if (showSplash || loading || (user && !profile)) {
    return (
      <div style={{
        minHeight: '100vh', background: '#F0EAE0',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 20,
      }}>
        <style>{`
          @keyframes anchorPulse {
            0%, 100% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.06); opacity: 0.85; }
          }
          @keyframes dotPulse {
            0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); }
            40% { opacity: 1; transform: scale(1); }
          }
        `}</style>

        {/* Glow ring + logo */}
        <div style={{
          width: 120, height: 120, borderRadius: '50%',
          background: 'rgba(122,102,144,0.08)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <img
            src="/anchor-icon-only.png"
            alt="Anchor"
            style={{
              width: 72, height: 72, objectFit: 'contain',
              animation: 'anchorPulse 2s ease-in-out infinite',
            }}
          />
        </div>

        {/* App name */}
        <div style={{
          fontFamily: 'Fraunces, serif', fontSize: 28, fontWeight: 700,
          color: '#2A2030', letterSpacing: '-0.3px',
        }}>
          Anchor
        </div>

        {/* Dot loader */}
        <div style={{ display: 'flex', gap: 7, marginTop: 4 }}>
          {[0, 1, 2].map((i) => (
            <div key={i} style={{
              width: 6, height: 6, borderRadius: '50%',
              background: '#7A6690',
              animation: `dotPulse 1.2s ease-in-out ${i * 0.2}s infinite`,
            }} />
          ))}
        </div>
      </div>
    )
  }

  if (user && profile) {
    if (!profile.intake_completed) return <Navigate to="/onboarding" replace />
    if (!profile.onboarding_foster_care_seen) return <Navigate to="/foster-care-intro" replace />
    return <Navigate to="/dashboard" replace />
  }

  return <Welcome />
}
