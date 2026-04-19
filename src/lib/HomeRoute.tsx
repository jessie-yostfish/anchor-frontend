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

  // Always show splash on first load
  if (showSplash) {
    return (
      <div style={{
        minHeight: '100vh', background: '#EDE6DB',
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
        <div style={{
          fontFamily: 'Fraunces, serif', fontSize: 28, fontWeight: 700,
          color: '#2A2030', letterSpacing: '-0.3px',
        }}>
          Anchor
        </div>
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

  // Still loading auth state — show neutral screen, never redirect
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', background: '#EDE6DB',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{ width: 44, height: 44, border: '3px solid #7A6690', borderTopColor: 'transparent', borderRadius: '50%', animation: 'anchorPulse 0.8s linear infinite' }} />
      </div>
    )
  }

  // User logged in but profile not yet fetched — wait, never redirect to onboarding
  if (user && !profile) {
    return (
      <div style={{
        minHeight: '100vh', background: '#EDE6DB',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <img src="/anchor-icon-only.png" alt="Anchor" style={{ width: 48, height: 48, objectFit: 'contain', opacity: 0.5 }} />
      </div>
    )
  }

  // Profile fully loaded — now safe to route
  if (user && profile) {
    if (profile.intake_completed === false) return <Navigate to="/onboarding" replace />
    if (!profile.onboarding_foster_care_seen) return <Navigate to="/foster-care-intro" replace />
    return <Navigate to="/dashboard" replace />
  }

  return <Welcome />
}
