import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertTriangle, Lock, Mail, Trash2 } from 'lucide-react'
import { AppHeader } from '../components'
import { useAuth } from '../contexts/AuthContext'
import { haptics } from '../lib/haptics'

export function DeleteAccount() {
  const [step, setStep] = useState<'export' | 'confirm'>('export')
  const [password, setPassword] = useState('')
  const [confirmed, setConfirmed] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [exportSent, setExportSent] = useState(false)
  const { deleteAccount } = useAuth()
  const navigate = useNavigate()

  const handleExport = async () => {
    haptics.light()
    setExportSent(true)
    setTimeout(() => setStep('confirm'), 1000)
  }

  const handleDelete = async () => {
    if (!password || !confirmed) return
    setError('')
    setLoading(true)
    haptics.light()
    try {
      const { error } = await deleteAccount(password)
      if (error) {
        setError(error.message)
        setLoading(false)
        return
      }
      navigate('/auth?mode=signup', { replace: true })
    } catch {
      setError('Failed to delete account. Please try again.')
      setLoading(false)
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', boxSizing: 'border-box',
    padding: '13px 16px 13px 44px',
    background: '#F0EAE0',
    border: '1.5px solid rgba(122,102,144,0.2)',
    borderRadius: 16,
    fontFamily: 'DM Sans, sans-serif', fontSize: 15, color: '#2A2030',
    outline: 'none',
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F0EAE0' }}>
      <AppHeader title="Delete Account" />

      <div style={{ maxWidth: 480, margin: '0 auto', padding: '32px 20px 48px' }}>

        {step === 'export' ? (
          <>
            {/* Warning card */}
            <div style={{ background: '#F5ECD8', border: '1px solid rgba(200,136,58,0.25)', borderRadius: 20, padding: '18px', marginBottom: 28 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 12, background: '#C8883A', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <AlertTriangle size={18} color="#fff" />
                </div>
                <div>
                  <p style={{ fontFamily: 'Fraunces, serif', fontSize: 17, fontWeight: 700, color: '#2A2030', margin: '0 0 6px' }}>
                    Before you go
                  </p>
                  <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 14, color: '#7A5A2A', margin: 0, lineHeight: 1.6 }}>
                    We can email you a copy of your notes, contacts, and timeline before deleting your account.
                  </p>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <button
                onClick={handleExport}
                disabled={exportSent}
                style={{
                  width: '100%', padding: '14px',
                  background: exportSent ? '#EAF4EE' : '#7A6690',
                  border: 'none', borderRadius: 16,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  fontFamily: 'DM Sans, sans-serif', fontWeight: 600, fontSize: 15,
                  color: exportSent ? '#4A7C59' : '#fff',
                  cursor: exportSent ? 'default' : 'pointer',
                  boxShadow: exportSent ? 'none' : '0 4px 16px rgba(122,102,144,0.3)',
                }}
              >
                <Mail size={16} />
                {exportSent ? 'Export sent ✓' : 'Email me my data'}
              </button>

              <button
                onClick={() => { haptics.light(); setStep('confirm') }}
                style={{
                  width: '100%', padding: '14px',
                  background: '#FAF7F4',
                  border: '1.5px solid rgba(122,102,144,0.2)',
                  borderRadius: 16,
                  fontFamily: 'DM Sans, sans-serif', fontWeight: 600, fontSize: 15,
                  color: '#9A90A8', cursor: 'pointer',
                }}
              >
                Skip — delete without export
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Danger warning */}
            <div style={{ background: '#FDF0F0', border: '1px solid rgba(200,74,74,0.2)', borderRadius: 20, padding: '18px', marginBottom: 28 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 12, background: '#C84A4A', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Trash2 size={18} color="#fff" />
                </div>
                <div>
                  <p style={{ fontFamily: 'Fraunces, serif', fontSize: 17, fontWeight: 700, color: '#2A2030', margin: '0 0 6px' }}>
                    This is permanent
                  </p>
                  <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 14, color: '#8A3A3A', margin: 0, lineHeight: 1.6 }}>
                    All your notes, contacts, and timeline will be deleted forever. This cannot be undone.
                  </p>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {/* Password field */}
              <div>
                <label style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, fontWeight: 600, color: '#5A5065', display: 'block', marginBottom: 6 }}>
                  Confirm your password
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#9A90A8' }} />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    style={inputStyle}
                  />
                </div>
              </div>

              {/* Confirmation checkbox */}
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: 12, cursor: 'pointer' }}>
                <div
                  onClick={() => setConfirmed(!confirmed)}
                  style={{
                    width: 20, height: 20, borderRadius: 6, flexShrink: 0, marginTop: 1,
                    background: confirmed ? '#C84A4A' : '#F0EAE0',
                    border: confirmed ? '2px solid #C84A4A' : '2px solid rgba(122,102,144,0.3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer',
                  }}
                >
                  {confirmed && (
                    <svg width="11" height="9" viewBox="0 0 11 9" fill="none">
                      <path d="M1 4L4 7L10 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
                <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 14, color: '#5A5065', lineHeight: 1.5 }}>
                  I understand this will permanently delete my account and all my data
                </span>
              </label>

              {/* Error */}
              {error && (
                <div style={{ background: '#FDF0F0', border: '1px solid rgba(200,74,74,0.2)', borderRadius: 14, padding: '12px 14px' }}>
                  <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: '#C84A4A', margin: 0 }}>{error}</p>
                </div>
              )}

              {/* Delete button */}
              <button
                onClick={handleDelete}
                disabled={!password || !confirmed || loading}
                style={{
                  width: '100%', padding: '14px',
                  background: password && confirmed && !loading ? '#C84A4A' : '#C8C0D0',
                  border: 'none', borderRadius: 16,
                  fontFamily: 'DM Sans, sans-serif', fontWeight: 600, fontSize: 15,
                  color: '#fff',
                  cursor: password && confirmed && !loading ? 'pointer' : 'not-allowed',
                  boxShadow: password && confirmed && !loading ? '0 4px 16px rgba(200,74,74,0.3)' : 'none',
                }}
              >
                {loading ? 'Deleting…' : 'Delete my account permanently'}
              </button>

              {/* Cancel */}
              <button
                onClick={() => navigate('/settings')}
                style={{
                  width: '100%', padding: '14px',
                  background: '#FAF7F4',
                  border: '1.5px solid rgba(122,102,144,0.2)',
                  borderRadius: 16,
                  fontFamily: 'DM Sans, sans-serif', fontWeight: 600, fontSize: 15,
                  color: '#7A6690', cursor: 'pointer',
                }}
              >
                Cancel
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
