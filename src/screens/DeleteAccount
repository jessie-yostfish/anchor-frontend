import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertTriangle, Lock, Mail } from 'lucide-react'
import { Button, Input, Header } from '../components'
import { useAuth } from '../contexts/AuthContext'
import { haptics } from '../lib/haptics'

export function DeleteAccount() {
  const [step, setStep] = useState<'export' | 'confirm'>('export')
  const [password, setPassword] = useState('')
  const [confirmed, setConfirmed] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [exportSent, setExportSent] = useState(false)
  const { deleteAccount, user } = useAuth()
  const navigate = useNavigate()

  const handleExport = async () => {
    haptics.light()
    setExportSent(true)
    // TODO: Implement actual export functionality
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

      // Success - redirect to auth
      navigate('/auth?mode=signup', { replace: true })
    } catch (err) {
      setError('Failed to delete account')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto px-6 py-8">
        <Header title="Delete Account" showBack={true} />

        {step === 'export' ? (
          <div className="mt-8">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" />
                <div>
                  <h2 className="font-bold text-amber-900 mb-2">Before you go</h2>
                  <p className="text-sm text-amber-800">
                    We can email you a copy of your notes, contacts, and timeline information before deleting your account.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <Button
                onClick={handleExport}
                disabled={exportSent}
                className="w-full"
              >
                <Mail className="w-5 h-5 mr-2" />
                {exportSent ? 'Export sent!' : 'Email me my data'}
              </Button>

              <Button
                onClick={() => {
                  haptics.light()
                  setStep('confirm')
                }}
                variant="secondary"
                className="w-full"
              >
                Skip export
              </Button>
            </div>
          </div>
        ) : (
          <div className="mt-8">
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                <div>
                  <h2 className="font-bold text-red-900 mb-2">This action is permanent</h2>
                  <p className="text-sm text-red-800">
                    All your data will be permanently deleted. This cannot be undone.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <Input
                label="Confirm your password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                icon={<Lock className="w-5 h-5" />}
                required
              />

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={confirmed}
                  onChange={(e) => setConfirmed(e.target.checked)}
                  className="mt-1 w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                />
                <span className="text-sm text-gray-700">
                  I understand this will permanently delete my account and all my data
                </span>
              </label>

              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <Button
                onClick={handleDelete}
                disabled={!password || !confirmed || loading}
                className="w-full bg-red-600 hover:bg-red-700"
              >
                {loading ? 'Deleting...' : 'Delete permanently'}
              </Button>

              <Button
                onClick={() => navigate('/dashboard')}
                variant="secondary"
                className="w-full"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
