import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Lock, Check, AlertCircle, Eye, EyeOff } from 'lucide-react'
import { supabase } from '../lib/supabase'

const inputStyle: React.CSSProperties = {
  width: '100%',
  borderRadius: 16,
  padding: '12px 16px',
  fontSize: 14,
  background: '#EDE6DB',
  border: '1.5px solid rgba(122,102,144,0.2)',
  color: '#2A2030',
  outline: 'none',
  fontFamily: "'DM Sans', sans-serif",
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  marginBottom: 6,
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: '0.08em',
  textTransform: 'uppercase' as const,
  color: '#9A90A8',
}

function LogoMark() {
  return (
    <img
      src="/anchor-icon-only.png"
      alt="Anchor"
      style={{
        width: 72,
        height: 72,
        objectFit: 'contain',
        filter: 'drop-shadow(0 4px 14px rgba(122,102,144,0.25))',
        marginBottom: 16,
      }}
    />
  )
}

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5 py-12" style={{ background: '#EDE6DB' }}>
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-6">
          <LogoMark />
        </div>
        <div className="rounded-3xl p-8" style={{ background: '#FAF7F2', border: '1px solid rgba(122,102,144,0.12)', boxShadow: '0 4px 20px rgba(90,78,110,0.08)' }}>
          {children}
        </div>
      </div>
    </div>
  )
}

export function ResetPasswordScreen() {
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [validSession, setValidSession] = useState<boolean | null>(null)

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        setValidSession(false)
        setError('This reset link has expired. Please request a new one.')
      } else {
        setValidSession(true)
      }
    }

    checkSession()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)

    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      })

      if (error) {
        if (error.message.includes('session')) {
          setError('This reset link has expired. Please request a new one.')
        } else {
          setError('Failed to update password. Please try again.')
        }
      } else {
        setSuccess(true)
        await supabase.auth.signOut()
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleSignIn = () => {
    navigate('/login')
  }

  // Loading state
  if (validSession === null) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#EDE6DB' }}>
        <div className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: '#7A6690', borderTopColor: 'transparent' }} />
      </div>
    )
  }

  // Expired link
  if (validSession === false) {
    return (
      <PageShell>
        <div className="text-center">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
            style={{ background: '#F5ECD8' }}
          >
            <AlertCircle className="w-8 h-8" style={{ color: '#C8883A' }} />
          </div>

          <h1 className="text-2xl font-bold mb-2" style={{ fontFamily: "'Fraunces', Georgia, serif", color: '#2A2030' }}>
            Link Expired
          </h1>
          <p className="text-sm mb-8" style={{ color: '#5A5065' }}>{error}</p>

          <button
            onClick={() => navigate('/forgot-password')}
            className="w-full py-3.5 rounded-2xl font-semibold text-white mb-3 transition-all active:scale-95"
            style={{ background: '#7A6690', boxShadow: '0 4px 16px rgba(122,102,144,0.3)', fontFamily: "'DM Sans', sans-serif" }}
          >
            Request New Link
          </button>

          <button
            onClick={handleSignIn}
            className="w-full py-3.5 rounded-2xl font-semibold transition-all active:scale-95"
            style={{ background: 'transparent', border: '1.5px solid rgba(122,102,144,0.3)', color: '#7A6690', fontFamily: "'DM Sans', sans-serif" }}
          >
            Back to Sign In
          </button>
        </div>
      </PageShell>
    )
  }

  // Success state
  if (success) {
    return (
      <PageShell>
        <div className="text-center">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
            style={{ background: 'rgba(74,124,89,0.12)' }}
          >
            <Check className="w-8 h-8" style={{ color: '#4A7C59' }} />
          </div>

          <h1 className="text-2xl font-bold mb-2" style={{ fontFamily: "'Fraunces', Georgia, serif", color: '#2A2030' }}>
            Password Updated!
          </h1>
          <p className="text-sm mb-8" style={{ color: '#5A5065' }}>
            Your password has been successfully changed.
          </p>

          <button
            onClick={handleSignIn}
            className="w-full py-3.5 rounded-2xl font-semibold text-white transition-all active:scale-95"
            style={{ background: '#7A6690', boxShadow: '0 4px 16px rgba(122,102,144,0.3)', fontFamily: "'DM Sans', sans-serif" }}
          >
            Sign In
          </button>
        </div>
      </PageShell>
    )
  }

  // Main form
  return (
    <PageShell>
      <h1 className="text-3xl font-bold text-center mb-2" style={{ fontFamily: "'Fraunces', Georgia, serif", color: '#2A2030' }}>
        Create New Password
      </h1>
      <p className="text-sm text-center mb-8" style={{ color: '#5A5065' }}>
        Enter your new password below.
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label style={labelStyle}>New Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#9A90A8' }} />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter new password"
              style={{ ...inputStyle, paddingLeft: 40, paddingRight: 44 }}
              required
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2"
              style={{ color: '#9A90A8' }}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <p className="text-xs mt-1" style={{ color: '#9A90A8' }}>At least 6 characters</p>
        </div>

        <div>
          <label style={labelStyle}>Confirm Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#9A90A8' }} />
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              style={{ ...inputStyle, paddingLeft: 40, paddingRight: 44 }}
              required
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2"
              style={{ color: '#9A90A8' }}
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl flex items-start gap-2" style={{ background: '#F5ECD8', border: '1px solid rgba(200,136,58,0.25)' }}>
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#C8883A' }} />
            <p className="text-sm" style={{ color: '#7A5A2A' }}>{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !password || !confirmPassword}
          className="w-full py-3.5 rounded-2xl font-semibold text-white transition-all active:scale-95 disabled:opacity-50"
          style={{ background: '#7A6690', boxShadow: '0 4px 16px rgba(122,102,144,0.3)', fontFamily: "'DM Sans', sans-serif" }}
        >
          {loading ? 'Resetting...' : 'Reset Password'}
        </button>
      </form>
    </PageShell>
  )
}
