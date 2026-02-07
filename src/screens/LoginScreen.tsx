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

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      <div className="max-w-md mx-auto px-6 py-12">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-purple-600 rounded-3xl mb-4 shadow-lg">
            <Shield className="w-10 h-10 text-white" strokeWidth={2.5} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Anchor</h1>
          <p className="text-gray-500">Find your footing.</p>
        </div>

        <div className="flex justify-center mb-8">
          <div className="bg-gray-100 rounded-full p-1 inline-flex">
            <button
              onClick={() => {
                setMode('signin')
                setError('')
              }}
              className={`px-6 py-2 rounded-full text-sm font-semibold transition-all ${
                mode === 'signin'
                  ? 'bg-white shadow-sm text-purple-600'
                  : 'text-gray-600'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setMode('signup')
                setError('')
              }}
              className={`px-6 py-2 rounded-full text-sm font-semibold transition-all ${
                mode === 'signup'
                  ? 'bg-white shadow-sm text-purple-600'
                  : 'text-gray-600'
              }`}
            >
              Create Account
            </button>
          </div>
        </div>

        {mode === 'signin' ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Welcome Back</h2>
            <p className="text-gray-500 text-sm mb-6">
              Access your personal court journey safely.
            </p>

            <form onSubmit={handleSignIn} className="space-y-6">
              <div>
                <label className="block mb-2 text-xs font-semibold tracking-wide uppercase text-gray-500">
                  Email
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full rounded-xl border-2 border-gray-200 pl-10 pr-4 py-3 focus:border-purple-600 focus:ring-4 focus:ring-purple-100 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block mb-2 text-xs font-semibold tracking-wide uppercase text-gray-500">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full rounded-xl border-2 border-gray-200 pl-10 pr-12 py-3 focus:border-purple-600 focus:ring-4 focus:ring-purple-100 focus:outline-none"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                  <p className="text-sm text-amber-800">{error}</p>
                </div>
              )}

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Signing in...</span>
                  </div>
                ) : (
                  'Sign In'
                )}
              </Button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => navigate('/forgot-password')}
                  className="text-xs font-semibold tracking-wide uppercase text-purple-600 hover:text-purple-700"
                >
                  Forgot Password?
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Create Account</h2>
            <p className="text-gray-500 text-sm mb-6">
              Join Anchor and start finding your footing today.
            </p>

            <form onSubmit={handleSignUp} className="space-y-6">
              <div>
                <label className="block mb-2 text-xs font-semibold tracking-wide uppercase text-gray-500">
                  First Name
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="What should we call you?"
                  className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 focus:border-purple-600 focus:ring-4 focus:ring-purple-100 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block mb-3 text-xs font-semibold tracking-wide uppercase text-gray-500">
                  Your Role
                </label>
                <div className="space-y-3">
                  {roleCards.map((role) => {
                    const Icon = role.icon
                    const isSelected = selectedRole === role.id
                    return (
                      <button
                        key={role.id}
                        type="button"
                        onClick={() => setSelectedRole(role.id)}
                        className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                          isSelected
                            ? 'border-purple-600 bg-purple-50'
                            : 'border-gray-200 bg-white hover:border-purple-200'
                        }`}
                      >
                        <div
                          className={`p-2 rounded-lg ${
                            isSelected ? 'bg-purple-100' : 'bg-gray-100'
                          }`}
                        >
                          <Icon
                            className={`w-5 h-5 ${
                              isSelected ? 'text-purple-600' : 'text-gray-600'
                            }`}
                          />
                        </div>
                        <div className="text-left">
                          <div
                            className={`font-semibold ${
                              isSelected ? 'text-purple-900' : 'text-gray-900'
                            }`}
                          >
                            {role.label}
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div>
                <label className="block mb-2 text-xs font-semibold tracking-wide uppercase text-gray-500">
                  Choose Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                  placeholder="e.g. anchor_user"
                  className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 focus:border-purple-600 focus:ring-4 focus:ring-purple-100 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block mb-2 text-xs font-semibold tracking-wide uppercase text-gray-500">
                  Recovery Email
                </label>
                <input
                  type="email"
                  value={recoveryEmail}
                  onChange={(e) => setRecoveryEmail(e.target.value)}
                  placeholder="Used for account recovery only"
                  className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 focus:border-purple-600 focus:ring-4 focus:ring-purple-100 focus:outline-none"
                  required
                />
                <p className="mt-1 text-xs text-gray-500">
                  This email is only used for password recovery and won't be shared.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-2 text-xs font-semibold tracking-wide uppercase text-gray-500">
                    Password
                  </label>
                  <input
                    type="password"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    placeholder="Min 6 chars"
                    className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 focus:border-purple-600 focus:ring-4 focus:ring-purple-100 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-2 text-xs font-semibold tracking-wide uppercase text-gray-500">
                    Confirm
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat"
                    className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 focus:border-purple-600 focus:ring-4 focus:ring-purple-100 focus:outline-none"
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                  <p className="text-sm text-amber-800">{error}</p>
                </div>
              )}

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Creating account...</span>
                  </div>
                ) : (
                  'Create Account'
                )}
              </Button>
            </form>
          </div>
        )}

        <Button
          variant="secondary"
          className="w-full mb-6"
          onClick={() => {}}
        >
          <LifeBuoy className="w-5 h-5 mr-2" />
          Contact Support
        </Button>

        <div className="text-center px-4">
          <p className="text-xs text-gray-500">
            Your privacy is our priority. Anchor data is encrypted and never
            shared with court officials.
          </p>
        </div>
      </div>
    </div>
  )
}
