import React, { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Mail, Lock, User } from 'lucide-react'
import { Header, PrivacyNotice } from '../components'
import { useAuth } from '../contexts/AuthContext'

export function Auth() {
  const [searchParams] = useSearchParams()
  const initialMode = searchParams.get('mode') === 'signin' ? 'signin' : 'signup'
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [role, setRole] = useState<'parent' | 'youth' | 'supporter'>('parent')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn, signUp, updateProfile } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (mode === 'signup' && password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    if (mode === 'signup' && !firstName.trim()) {
      setError('Please enter your first name')
      return
    }

    setLoading(true)

    try {
      if (mode === 'signup') {
        const { error } = await signUp({
          email,
          password,
          metadata: {
            first_name: firstName,
            role: role,
          },
        })
        if (error) {
          setError(error.message)
        } else {
          // Safety net: write role to profile in case DB trigger missed it
          await updateProfile({ role, first_name: firstName })
          navigate('/onboarding')
        }
      } else {
        const { error } = await signIn(email, password)
        if (error) {
          setError(error.message)
        } else {
          navigate('/dashboard')
        }
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const tabs = [
    { id: 'signup', label: 'Sign Up' },
    { id: 'signin', label: 'Sign In' },
  ]

  const roles = [
    { value: 'parent', label: 'Parent/Guardian', description: 'I am a parent or legal guardian' },
    { value: 'youth', label: 'Youth', description: 'I am the young person in the case' },
    { value: 'supporter', label: 'Supporter', description: 'I support someone in a case' },
  ]

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
    textTransform: 'uppercase',
    color: '#9A90A8',
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#F0EAE0' }}>
      <div className="max-w-md mx-auto w-full px-5 py-8 flex flex-col">

        {/* Back button via Header — keep for navigation */}
        <Header title="" showBack={true} />

        {/* ── HEADING ── */}
        <div className="mb-6 mt-2">
          <h1
            className="text-3xl font-bold mb-2"
            style={{ fontFamily: "'Fraunces', Georgia, serif", color: '#2A2030' }}
          >
            {mode === 'signup' ? 'Create Your Account' : 'Welcome Back'}
          </h1>
          <p className="text-sm" style={{ color: '#5A5065' }}>
            {mode === 'signup'
              ? 'Join Anchor to access your personalized support'
              : 'Sign in to continue your journey'}
          </p>
        </div>

        {/* ── TAB SWITCHER ── */}
        <div
          className="flex rounded-2xl p-1 mb-6"
          style={{ background: '#E8DDE8' }}
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setMode(tab.id as 'signin' | 'signup')}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all"
              style={
                mode === tab.id
                  ? { background: '#FAF7F4', color: '#7A6690', boxShadow: '0 2px 8px rgba(122,102,144,0.15)' }
                  : { background: 'transparent', color: '#9A90A8' }
              }
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── FORM CARD ── */}
        <div
          className="rounded-3xl p-6 mb-5"
          style={{ background: '#FAF7F4', border: '1px solid rgba(122,102,144,0.12)', boxShadow: '0 4px 20px rgba(90,78,110,0.08)' }}
        >
          <form onSubmit={handleSubmit} className="space-y-4">

            {mode === 'signup' && (
              <>
                {/* First Name */}
                <div>
                  <label style={labelStyle}>First Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#9A90A8' }} />
                    <input
                      type="text"
                      placeholder="Your first name"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      style={{ ...inputStyle, paddingLeft: 40 }}
                      required
                    />
                  </div>
                </div>

                {/* Role selector */}
                <div>
                  <label style={labelStyle}>I am a...</label>
                  <div className="space-y-2">
                    {roles.map((r) => (
                      <button
                        key={r.value}
                        type="button"
                        onClick={() => setRole(r.value as 'parent' | 'youth' | 'supporter')}
                        className="w-full text-left transition-all"
                        style={{
                          padding: '12px 16px',
                          borderRadius: 16,
                          border: role === r.value ? '1.5px solid #7A6690' : '1.5px solid rgba(122,102,144,0.15)',
                          background: role === r.value ? '#F4EFF8' : '#F0EAE0',
                        }}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className="flex-shrink-0 mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center"
                            style={{ borderColor: role === r.value ? '#7A6690' : '#C4BAD0' }}
                          >
                            {role === r.value && (
                              <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#7A6690' }} />
                            )}
                          </div>
                          <div>
                            <div className="text-sm font-semibold" style={{ color: '#2A2030' }}>{r.label}</div>
                            <div className="text-xs" style={{ color: '#5A5065' }}>{r.description}</div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Email */}
            <div>
              <label style={labelStyle}>Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#9A90A8' }} />
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ ...inputStyle, paddingLeft: 40 }}
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label style={labelStyle}>Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#9A90A8' }} />
                <input
                  type="password"
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ ...inputStyle, paddingLeft: 40 }}
                  required
                />
              </div>
            </div>

            {/* Confirm Password (signup only) */}
            {mode === 'signup' && (
              <div>
                <label style={labelStyle}>Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#9A90A8' }} />
                  <input
                    type="password"
                    placeholder="Re-enter your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    style={{ ...inputStyle, paddingLeft: 40 }}
                    required
                  />
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div
                className="p-3 rounded-xl"
                style={{ background: '#F5ECD8', border: '1px solid rgba(200,136,58,0.25)' }}
              >
                <p className="text-sm" style={{ color: '#7A5A2A' }}>{error}</p>
              </div>
            )}

            {/* Privacy Notice */}
            <PrivacyNotice />

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl font-semibold text-white transition-all active:scale-95 disabled:opacity-50"
              style={{ background: '#7A6690', boxShadow: '0 4px 16px rgba(122,102,144,0.3)', fontFamily: "'DM Sans', sans-serif" }}
            >
              {loading
                ? 'Please wait...'
                : mode === 'signup'
                ? 'Create Account'
                : 'Sign In'}
            </button>

          </form>
        </div>

        {/* Forgot password */}
        {mode === 'signin' && (
          <div className="text-center mb-4">
            <button
              onClick={() => navigate('/forgot-password')}
              className="text-sm font-semibold"
              style={{ color: '#7A6690' }}
            >
              Forgot your password?
            </button>
          </div>
        )}

      </div>
    </div>
  )
}
