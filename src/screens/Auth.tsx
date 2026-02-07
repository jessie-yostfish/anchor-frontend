import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Mail, Lock } from 'lucide-react'
import { Button, Input, Header, PrivacyNotice, TabSwitcher } from '../components'
import { useAuth } from '../contexts/AuthContext'

export function Auth() {
  const [searchParams] = useSearchParams()
  const initialMode = searchParams.get('mode') === 'signin' ? 'signin' : 'signup'
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn, signUp } = useAuth()
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

    setLoading(true)

    try {
      if (mode === 'signup') {
        const { error } = await signUp(email, password)
        if (error) {
          setError(error.message)
        } else {
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto px-6 py-8">
        <Header title="" showBack={true} />

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {mode === 'signup' ? 'Create Your Account' : 'Welcome Back'}
          </h1>
          <p className="text-gray-600">
            {mode === 'signup'
              ? 'Join Anchor to access your personalized support'
              : 'Sign in to continue your journey'}
          </p>
        </div>

        <div className="mb-8 flex justify-center">
          <TabSwitcher
            tabs={tabs}
            activeTab={mode}
            onChange={(tab) => setMode(tab as 'signin' | 'signup')}
          />
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Email"
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            icon={<Mail className="w-5 h-5" />}
            required
          />

          <Input
            label="Password"
            type="password"
            placeholder="At least 6 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            icon={<Lock className="w-5 h-5" />}
            required
          />

          {mode === 'signup' && (
            <Input
              label="Confirm Password"
              type="password"
              placeholder="Re-enter your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              icon={<Lock className="w-5 h-5" />}
              required
            />
          )}

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <PrivacyNotice />

          <Button type="submit" disabled={loading} className="w-full">
            {loading
              ? 'Please wait...'
              : mode === 'signup'
              ? 'Create Account'
              : 'Sign In'}
          </Button>
        </form>

        {mode === 'signin' && (
          <div className="mt-6 text-center">
            <button
              onClick={() => {}}
              className="text-sm text-purple-600 hover:text-purple-700 font-medium"
            >
              Forgot your password?
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
