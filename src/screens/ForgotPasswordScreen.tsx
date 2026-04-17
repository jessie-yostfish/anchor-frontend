import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, Check, AlertCircle } from 'lucide-react'
import { supabase } from '../lib/supabase'

const inputStyle: React.CSSProperties = {
  width: '100%',
  borderRadius: 16,
  padding: '12px 16px',
  fontSize: 14,
  background: '#F0EAE0',
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

export function ForgotPasswordScreen() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [sentEmail, setSentEmail] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (error) {
        if (error.message.includes('rate limit')) {
          setError('Too many attempts. Please try again in a few minutes.')
        } else {
          setError("We couldn't find an account with that email. Would you like to create one?")
        }
      } else {
        setSentEmail(email)
        setSent(true)
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    setError('')
    setLoading(true)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(sentEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (error) {
        setError('Failed to resend email. Please try again.')
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-5 py-12" style={{ background: '#F0EAE0' }}>
        <div className="w-full max-w-md">
          <div className="flex flex-col items-center mb-6">
            <LogoMark />
          </div>

          <div className="rounded-3xl p-8 text-center" style={{ background: '#FAF7F4', border: '1px solid rgba(122,102,144,0.12)', boxShadow: '0 4px 20px rgba(90,78,110,0.08)' }}>
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
              style={{ background: 'rgba(74,124,89,0.12)' }}
            >
              <Check className="w-8 h-8" style={{ color: '#4A7C59' }} />
            </div>

            <h1 className="text-2xl font-bold mb-2" style={{ fontFamily: "'Fraunces', Georgia, serif", color: '#2A2030' }}>
              Check Your Email
            </h1>
            <p className="text-sm mb-1" style={{ color: '#5A5065' }}>
              We've sent password reset instructions to
            </p>
            <p className="text-sm font-semibold mb-6" style={{ color: '#7A6690' }}>{sentEmail}</p>

            <p className="text-sm mb-4" style={{ color: '#5A5065' }}>
              Didn't receive it? Check your spam folder or try again.
            </p>

            <button
              onClick={handleResend}
              disabled={loading}
              className="font-semibold text-sm mb-6 w-full disabled:opacity-50"
              style={{ color: '#7A6690' }}
            >
              {loading ? 'Sending...' : 'Resend Email'}
            </button>

            {error && (
              <div className="mb-4 p-3 rounded-xl flex items-start gap-2 text-left" style={{ background: '#F5ECD8', border: '1px solid rgba(200,136,58,0.25)' }}>
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#C8883A' }} />
                <p className="text-sm" style={{ color: '#7A5A2A' }}>{error}</p>
              </div>
            )}

            <Link to="/login">
              <button
                className="w-full py-3.5 rounded-2xl font-semibold transition-all active:scale-95"
                style={{ background: 'transparent', border: '1.5px solid rgba(122,102,144,0.3)', color: '#7A6690', fontFamily: "'DM Sans', sans-serif" }}
              >
                Back to Sign In
              </button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5 py-12" style={{ background: '#F0EAE0' }}>
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-6">
          <LogoMark />
        </div>

        <div className="rounded-3xl p-8" style={{ background: '#FAF7F4', border: '1px solid rgba(122,102,144,0.12)', boxShadow: '0 4px 20px rgba(90,78,110,0.08)' }}>
          <h1 className="text-3xl font-bold text-center mb-2" style={{ fontFamily: "'Fraunces', Georgia, serif", color: '#2A2030' }}>
            Reset Your Password
          </h1>
          <p className="text-sm text-center mb-8" style={{ color: '#5A5065' }}>
            Enter your email address and we'll send you a link to reset your password.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label style={labelStyle}>Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#9A90A8' }} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  style={{ ...inputStyle, paddingLeft: 40 }}
                  required
                  autoComplete="email"
                />
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
              disabled={loading || !email}
              className="w-full py-3.5 rounded-2xl font-semibold text-white transition-all active:scale-95 disabled:opacity-50"
              style={{ background: '#7A6690', boxShadow: '0 4px 16px rgba(122,102,144,0.3)', fontFamily: "'DM Sans', sans-serif" }}
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>

            <div className="text-center">
              <Link to="/login" className="text-sm font-semibold" style={{ color: '#7A6690' }}>
                Back to Sign In
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
