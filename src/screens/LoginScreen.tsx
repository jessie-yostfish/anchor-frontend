import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Shield, User, Lock, Eye, EyeOff, LifeBuoy, Users, Heart } from 'lucide-react'
import { Button } from '../components'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'

type Role = 'parent' | 'youth' | 'supporter'

export function LoginScreen() {
  const [searchParams] = useSearchParams()
  const initialMode = searchParams.get('mode') === 'signup' ? 'signup' : 'signin'
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const [firstName, setFirstName] = useState('')
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [username, setUsername] = useState('')
  const [recoveryEmail, setRecoveryEmail] = useState('')
  const [signupPassword, setSignupPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { signIn, signUp } = useAuth()
  const navigate = useNavigate()

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { error: authError } = await signIn(email, password)

      if (authError) {
        if (authError.message.includes('Invalid login credentials')) {
          setError("That password doesn't match our records. Please try again.")
        } else if (authError.message.includes('Email not confirmed')) {
          setError("Please confirm your email address before signing in.")
        } else if (authError.message.includes('User not found')) {
          setError("We couldn't find an account with that email. Would you like to create one?")
        } else {
          setError("We're having trouble connecting. Please check your internet and try again.")
        }
      } else {
        navigate('/onboarding')
      }
    } catch (err) {
      setError("We're having trouble connecting. Please check your internet and try again.")
    } finally {
      setLoading(false)
    }
  }

  const validateUsername = (username: string): string | null => {
    if (username.length < 3 || username.length > 20) {
      return 'Username must be between 3 and 20 characters.'
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return 'Username can only contain letters, numbers, and underscores.'
    }
    return null
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!firstName.trim()) {
      setError('Please enter your first name.')
      return
    }

    if (!selectedRole) {
      setError('Please select your role.')
      return
    }

    const usernameError = validateUsername(username)
    if (usernameError) {
      setError(usernameError)
      return
    }

    if (!recoveryEmail) {
      setError('Please enter a recovery email.')
      return
    }

    if (signupPassword.length < 6) {
      setError('Please choose a stronger password (at least 6 characters).')
      return
    }

    if (signupPassword !== confirmPassword) {
      setError("Your passwords don't match. Please try again.")
      return
    }

    setLoading(true)

    try {
      const { data: existingUsername } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', username)
        .maybeSingle()

      if (existingUsername) {
        setError('This username is already taken. Please choose another one.')
        setLoading(false)
        return
      }

      const { error: authError } = await signUp({
        email: recoveryEmail,
        password: signupPassword,
        metadata: {
          username: username,
          first_name: firstName,
          role: selectedRole,
        },
      })

      if (authError) {
        if (authError.message.includes('already registered')) {
          setError('This email is already registered. Would you like to sign in instead?')
        } else if (authError.message.includes('Password')) {
          setError('Please choose a stronger password (at least 6 characters).')
        } else {
          setError("We're having trouble connecting. Please check your internet and try again.")
        }
      } else {
        navigate('/onboarding')
      }
    } catch (err) {
      setError("We're having trouble connecting. Please check your internet and try again.")
    } finally {
      setLoading(false)
    }
  }

  const roleCards = [
    {
      id: 'parent' as Role,
      icon: Users,
      label: 'Parent',
      description: 'I am a parent in dependency court',
    },
    {
      id: 'youth' as Role,
      icon: User,
      label: 'Youth',
      description: 'I am a youth in dependency court',
    },
    {
      id: 'supporter' as Role,
      icon: Heart,
      label: 'Supporter',
      description: 'I am supporting someone in court',
    },
  ]

  const inputClass = "w-full rounded-2xl px-4 py-3 text-sm outline-none transition-all"
  const inputStyle = {
    background: '#FAF7F4',
    border: '1.5px solid rgba(122,102,144,0.2)',
    color: '#2A2030',
    fontFamily: "'DM Sans', sans-serif",
  }
  const inputFocusStyle = "focus:ring-2 focus:ring-purple-200"
  const labelClass = "block mb-1.5 text-xs font-semibold tracking-wide uppercase"
  const labelStyle = { color: '#9A90A8' }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#F0EAE0' }}>
      <div className="max-w-md mx-auto w-full px-5 py-10 flex flex-col">

        {/* ── LOGO ── */}
        <div className="flex flex-col items-center mb-8">
          <img
            src="/anchor-logo-new.png"
            alt="Anchor"
            style={{
              width: 80,
              height: 80,
              objectFit: 'contain',
              filter: 'drop-shadow(0 4px 14px rgba(122,102,144,0.25))',
              marginBottom: 12,
            }}
          />
          <h1
            className="text-3xl font-bold mb-1"
            style={{ fontFamily: "'Fraunces', Georgia, serif", color: '#7A6690' }}
          >
            Anchor
          </h1>
          <p className="text-sm" style={{ color: '#9A90A8' }}>Find your footing.</p>
        </div>

        {/* ── TAB SWITCHER ── */}
        <div
          className="flex rounded-2xl p-1 mb-6"
          style={{ background: '#E8DDE8' }}
        >
          <button
            onClick={() => { setMode('signin'); setError('') }}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all"
            style={mode === 'signin'
              ? { background: '#FAF7F4', color: '#7A6690', boxShadow: '0 2px 8px rgba(122,102,144,0.15)' }
              : { background: 'transparent', color: '#9A90A8' }}
          >
            Sign In
          </button>
          <button
            onClick={() => { setMode('signup'); setError('') }}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all"
            style={mode === 'signup'
              ? { background: '#FAF7F4', color: '#7A6690', boxShadow: '0 2px 8px rgba(122,102,144,0.15)' }
              : { background: 'transparent', color: '#9A90A8' }}
          >
            Create Account
          </button>
        </div>

        {/* ── CARD ── */}
        <div
          className="rounded-3xl p-6 mb-5"
          style={{ background: '#FAF7F4', border: '1px solid rgba(122,102,144,0.12)', boxShadow: '0 4px 20px rgba(90,78,110,0.08)' }}
        >
          {mode === 'signin' ? (
            <>
              <h2 className="text-xl font-bold mb-1" style={{ fontFamily: "'Fraunces', Georgia, serif", color: '#2A2030' }}>Welcome Back</h2>
              <p className="text-sm mb-6" style={{ color: '#5A5065' }}>Access your personal court journey safely.</p>

              <form onSubmit={handleSignIn} className="space-y-4">
                <div>
                  <label className={labelClass} style={labelStyle}>Email</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#9A90A8' }} />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      className={`${inputClass} ${inputFocusStyle} pl-10`}
                      style={inputStyle}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className={labelClass} style={labelStyle}>Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#9A90A8' }} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className={`${inputClass} ${inputFocusStyle} pl-10 pr-12`}
                      style={inputStyle}
                      required
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
                </div>

                {error && (
                  <div className="p-3 rounded-xl" style={{ background: '#F5ECD8', border: '1px solid rgba(200,136,58,0.25)' }}>
                    <p className="text-sm" style={{ color: '#7A5A2A' }}>{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-2xl font-semibold text-white transition-all active:scale-95 disabled:opacity-50"
                  style={{ background: '#7A6690', boxShadow: '0 4px 16px rgba(122,102,144,0.3)' }}
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Signing in...</span>
                    </div>
                  ) : 'Sign In'}
                </button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => navigate('/forgot-password')}
                    className="text-xs font-semibold tracking-wide uppercase"
                    style={{ color: '#7A6690' }}
                  >
                    Forgot Password?
                  </button>
                </div>
              </form>
            </>
          ) : (
            <>
              <h2 className="text-xl font-bold mb-1" style={{ fontFamily: "'Fraunces', Georgia, serif", color: '#2A2030' }}>Create Account</h2>
              <p className="text-sm mb-6" style={{ color: '#5A5065' }}>Join Anchor and start finding your footing today.</p>

              <form onSubmit={handleSignUp} className="space-y-4">
                <div>
                  <label className={labelClass} style={labelStyle}>First Name</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="What should we call you?"
                    className={`${inputClass} ${inputFocusStyle}`}
                    style={inputStyle}
                    required
                  />
                </div>

                <div>
                  <label className={labelClass} style={labelStyle}>Your Role</label>
                  <div className="space-y-2">
                    {roleCards.map((role) => {
                      const Icon = role.icon
                      const isSelected = selectedRole === role.id
                      return (
                        <button
                          key={role.id}
                          type="button"
                          onClick={() => setSelectedRole(role.id)}
                          className="w-full flex items-center gap-3 p-3.5 rounded-2xl transition-all"
                          style={isSelected
                            ? { background: '#F4EFF8', border: '1.5px solid #7A6690' }
                            : { background: '#F0EAE0', border: '1.5px solid transparent' }}
                        >
                          <div
                            className="p-2 rounded-xl flex-shrink-0"
                            style={{ background: isSelected ? 'rgba(122,102,144,0.15)' : 'rgba(122,102,144,0.08)' }}
                          >
                            <Icon className="w-4 h-4" style={{ color: '#7A6690' }} />
                          </div>
                          <div className="text-left">
                            <div className="text-sm font-semibold" style={{ color: isSelected ? '#7A6690' : '#2A2030' }}>{role.label}</div>
                            <div className="text-xs" style={{ color: '#9A90A8' }}>{role.description}</div>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div>
                  <label className={labelClass} style={labelStyle}>Choose Username</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                    placeholder="e.g. anchor_user"
                    className={`${inputClass} ${inputFocusStyle}`}
                    style={inputStyle}
                    required
                  />
                </div>

                <div>
                  <label className={labelClass} style={labelStyle}>Recovery Email</label>
                  <input
                    type="email"
                    value={recoveryEmail}
                    onChange={(e) => setRecoveryEmail(e.target.value)}
                    placeholder="Used for account recovery only"
                    className={`${inputClass} ${inputFocusStyle}`}
                    style={inputStyle}
                    required
                  />
                  <p className="mt-1 text-xs" style={{ color: '#9A90A8' }}>
                    This email is only used for password recovery and won't be shared.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass} style={labelStyle}>Password</label>
                    <input
                      type="password"
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      placeholder="Min 6 chars"
                      className={`${inputClass} ${inputFocusStyle}`}
                      style={inputStyle}
                      required
                    />
                  </div>
                  <div>
                    <label className={labelClass} style={labelStyle}>Confirm</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat"
                      className={`${inputClass} ${inputFocusStyle}`}
                      style={inputStyle}
                      required
                    />
                  </div>
                </div>

                {error && (
                  <div className="p-3 rounded-xl" style={{ background: '#F5ECD8', border: '1px solid rgba(200,136,58,0.25)' }}>
                    <p className="text-sm" style={{ color: '#7A5A2A' }}>{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-2xl font-semibold text-white transition-all active:scale-95 disabled:opacity-50"
                  style={{ background: '#7A6690', boxShadow: '0 4px 16px rgba(122,102,144,0.3)' }}
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Creating account...</span>
                    </div>
                  ) : 'Create Account'}
                </button>
              </form>
            </>
          )}
        </div>

        {/* ── CONTACT SUPPORT ── */}
        <button
          onClick={() => {}}
          className="w-full py-3.5 rounded-2xl font-semibold mb-5 flex items-center justify-center gap-2 transition-all active:scale-95"
          style={{ background: 'transparent', border: '1.5px solid rgba(122,102,144,0.3)', color: '#7A6690' }}
        >
          <LifeBuoy className="w-5 h-5" />
          Contact Support
        </button>

        <p className="text-center text-xs px-4" style={{ color: '#9A90A8' }}>
          Your privacy is our priority. Anchor data is encrypted and never shared with court officials.
        </p>

      </div>
    </div>
  )
}
