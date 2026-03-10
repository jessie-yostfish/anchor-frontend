import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Welcome } from '../screens'

export function HomeRoute() {
  const { user, profile, loading } = useAuth()

  // Wait until both session and profile are resolved
  if (loading || (user && !profile)) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F0EAE0' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 48, height: 48, border: '4px solid #7A6690', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
          <p style={{ fontFamily: 'DM Sans, sans-serif', color: '#9A90A8', fontSize: 14 }}>Loading…</p>
        </div>
      </div>
    )
  }

  if (user && profile) {
    if (!profile.intake_completed) {
      return <Navigate to="/onboarding" replace />
    }
    if (!profile.onboarding_foster_care_seen) {
      return <Navigate to="/foster-care-intro" replace />
    }
    return <Navigate to="/dashboard" replace />
  }

  return <Welcome />
}
