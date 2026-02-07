import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  User,
  Lock,
  Mail,
  Globe,
  Bell,
  Phone,
  Download,
  Trash2,
  FileText,
  Shield,
  HelpCircle,
  LogOut,
  ChevronRight,
  Edit2,
} from 'lucide-react'
import { Button, Card, AppHeader } from '../components'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { haptics } from '../lib/haptics'

export function Settings() {
  const { user, profile, signOut, updateProfile } = useAuth()
  const navigate = useNavigate()
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deletePassword, setDeletePassword] = useState('')
  const [deleteError, setDeleteError] = useState('')
  const [loading, setLoading] = useState(false)
  const [language, setLanguage] = useState('English')
  const [showLanguageModal, setShowLanguageModal] = useState(false)

  const getInitials = () => {
    if (profile?.first_name) {
      return profile.first_name.charAt(0).toUpperCase()
    }
    if (profile?.username) {
      return profile.username.charAt(0).toUpperCase()
    }
    return 'U'
  }

  const getRoleBadgeColor = (role?: string) => {
    switch (role) {
      case 'parent':
        return 'bg-blue-100 text-blue-700'
      case 'youth':
        return 'bg-purple-100 text-purple-700'
      case 'supporter':
        return 'bg-coral-100 text-coral-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const maskEmail = (email: string) => {
    const [name, domain] = email.split('@')
    if (name.length <= 2) return email
    return `${name.charAt(0)}${'*'.repeat(Math.min(name.length - 1, 3))}@${domain}`
  }

  const maskPhone = (phone?: string) => {
    if (!phone) return 'Not set'
    const digits = phone.replace(/\D/g, '')
    if (digits.length < 4) return phone
    return `(***) ***-${digits.slice(-4)}`
  }

  const handleToggleNotifications = async () => {
    if (!profile) return
    haptics.medium()
    await updateProfile({ text_reminders_enabled: !profile.text_reminders_enabled })
  }

  const handleExportData = async () => {
    setLoading(true)
    try {
      const data = {
        profile,
        exportDate: new Date().toISOString(),
        notes: await fetchUserNotes(),
        timeline: await fetchUserTimeline(),
        contacts: await fetchUserContacts(),
      }

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `anchor-data-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      haptics.success()
    } catch (error) {
      console.error('Error exporting data:', error)
      haptics.error()
    } finally {
      setLoading(false)
    }
  }

  const fetchUserNotes = async () => {
    const { data } = await supabase
      .from('notes')
      .select('*')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false })
    return data || []
  }

  const fetchUserTimeline = async () => {
    const { data } = await supabase
      .from('timeline_events')
      .select('*')
      .eq('user_id', user?.id)
      .order('event_date', { ascending: false })
    return data || []
  }

  const fetchUserContacts = async () => {
    const { data } = await supabase
      .from('contacts')
      .select('*')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false })
    return data || []
  }

  const handleDeleteAccount = async () => {
    if (!deletePassword.trim()) {
      setDeleteError('Please enter your password to confirm')
      haptics.error()
      return
    }

    setLoading(true)
    setDeleteError('')

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user?.email || '',
        password: deletePassword,
      })

      if (signInError) {
        setDeleteError('Incorrect password')
        haptics.error()
        setLoading(false)
        return
      }

      await supabase.from('notes').delete().eq('user_id', user?.id)
      await supabase.from('timeline_events').delete().eq('user_id', user?.id)
      await supabase.from('contacts').delete().eq('user_id', user?.id)
      await supabase.from('preparation_notes').delete().eq('user_id', user?.id)
      await supabase.from('profiles').delete().eq('id', user?.id)

      const { error: deleteError } = await supabase.rpc('delete_user')

      if (deleteError) {
        setDeleteError('Failed to delete account. Please contact support.')
        haptics.error()
        setLoading(false)
        return
      }

      haptics.success()
      await signOut()
      navigate('/')
    } catch (error) {
      setDeleteError('An error occurred. Please try again.')
      haptics.error()
      setLoading(false)
    }
  }

  if (showDeleteConfirm) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
        <div className="w-full max-w-md">
          <Card className="p-6">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 className="w-8 h-8 text-red-600" />
              </div>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
              Delete Account?
            </h2>
            <p className="text-gray-600 text-center mb-6">
              This action cannot be undone. All your data will be permanently deleted.
            </p>

            <div className="mb-6">
              <label className="block mb-2 text-sm font-semibold text-gray-700">
                Enter your password to confirm
              </label>
              <input
                type="password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                placeholder="Your password"
                className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 focus:border-red-600 focus:ring-4 focus:ring-red-100 focus:outline-none"
              />
            </div>

            {deleteError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700">{deleteError}</p>
              </div>
            )}

            <div className="space-y-3">
              <Button
                onClick={handleDeleteAccount}
                disabled={loading}
                className="w-full bg-red-600 hover:bg-red-700"
              >
                {loading ? 'Deleting...' : 'Yes, Delete My Account'}
              </Button>
              <Button
                onClick={() => {
                  setShowDeleteConfirm(false)
                  setDeletePassword('')
                  setDeleteError('')
                }}
                variant="outline"
                className="w-full"
              >
                Cancel
              </Button>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  if (showLanguageModal) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
        <div className="w-full max-w-md">
          <Card className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Select Language</h2>

            <div className="space-y-2 mb-6">
              {['English', 'Español'].map((lang) => (
                <button
                  key={lang}
                  onClick={() => {
                    haptics.light()
                    setLanguage(lang)
                    setShowLanguageModal(false)
                  }}
                  className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                    language === lang
                      ? 'border-purple-600 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-200'
                  }`}
                >
                  <span className={`font-semibold ${language === lang ? 'text-purple-900' : 'text-gray-900'}`}>
                    {lang}
                  </span>
                </button>
              ))}
            </div>

            <Button onClick={() => setShowLanguageModal(false)} variant="outline" className="w-full">
              Close
            </Button>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader />
      <div className="max-w-md mx-auto px-6 py-8 pb-24">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        </div>

        <Card className="mb-6 p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-coral-600 rounded-full flex items-center justify-center">
              <span className="text-white text-2xl font-bold">{getInitials()}</span>
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900">
                {profile?.first_name || profile?.username || 'User'}
              </h2>
              <p className="text-gray-600 text-sm">@{profile?.username || 'username'}</p>
              {profile?.role && (
                <span
                  className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold ${getRoleBadgeColor(profile.role)}`}
                >
                  {profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}
                </span>
              )}
            </div>
          </div>
          <Button variant="outline" className="w-full" onClick={() => {}}>
            <Edit2 className="w-4 h-4 mr-2" />
            Edit Profile
          </Button>
        </Card>

        <div className="space-y-6">
          <div>
            <h3 className="text-xs font-semibold tracking-wide uppercase text-gray-500 mb-3">
              Account
            </h3>
            <Card className="divide-y divide-gray-100">
              <button
                onClick={() => navigate('/change-password')}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Lock className="w-5 h-5 text-gray-600" />
                  <span className="text-gray-900 font-medium">Change Password</span>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </button>

              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <Mail className="w-5 h-5 text-gray-600 mt-0.5" />
                    <div>
                      <p className="text-gray-900 font-medium">Recovery Email</p>
                      <p className="text-gray-600 text-sm">{maskEmail(user?.email || '')}</p>
                    </div>
                  </div>
                  <button className="text-purple-600 hover:text-purple-700 font-semibold text-sm">
                    Update
                  </button>
                </div>
              </div>

              <button
                onClick={() => setShowLanguageModal(true)}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Globe className="w-5 h-5 text-gray-600" />
                  <div className="text-left">
                    <p className="text-gray-900 font-medium">Language</p>
                    <p className="text-gray-600 text-sm">{language}</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </button>
            </Card>
          </div>

          <div>
            <h3 className="text-xs font-semibold tracking-wide uppercase text-gray-500 mb-3">
              Notifications
            </h3>
            <Card className="divide-y divide-gray-100">
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <Bell className="w-5 h-5 text-gray-600" />
                    <span className="text-gray-900 font-medium">Text Reminders</span>
                  </div>
                  <button
                    onClick={handleToggleNotifications}
                    className={`relative w-12 h-7 rounded-full transition-colors ${
                      profile?.text_reminders_enabled ? 'bg-purple-600' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform ${
                        profile?.text_reminders_enabled ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
                {profile?.text_reminders_enabled && (
                  <button className="text-purple-600 hover:text-purple-700 font-semibold text-sm ml-8">
                    Manage
                  </button>
                )}
              </div>

              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <Phone className="w-5 h-5 text-gray-600 mt-0.5" />
                    <div>
                      <p className="text-gray-900 font-medium">Phone Number</p>
                      <p className="text-gray-600 text-sm">{maskPhone(profile?.phone_number)}</p>
                    </div>
                  </div>
                  <button className="text-purple-600 hover:text-purple-700 font-semibold text-sm">
                    Update
                  </button>
                </div>
              </div>
            </Card>
          </div>

          <div>
            <h3 className="text-xs font-semibold tracking-wide uppercase text-gray-500 mb-3">
              Privacy & Data
            </h3>
            <Card className="divide-y divide-gray-100">
              <button
                onClick={handleExportData}
                disabled={loading}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                <div className="flex items-start gap-3">
                  <Download className="w-5 h-5 text-gray-600 mt-0.5" />
                  <div className="text-left">
                    <p className="text-gray-900 font-medium">Export My Data</p>
                    <p className="text-gray-600 text-sm">Download a copy of your data</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </button>

              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="w-full flex items-center justify-between p-4 hover:bg-red-50 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <Trash2 className="w-5 h-5 text-red-600 mt-0.5" />
                  <div className="text-left">
                    <p className="text-red-600 font-medium">Delete Account</p>
                    <p className="text-gray-600 text-sm">
                      Permanently delete your account and data
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-red-400" />
              </button>
            </Card>
          </div>

          <div>
            <h3 className="text-xs font-semibold tracking-wide uppercase text-gray-500 mb-3">
              About
            </h3>
            <Card className="divide-y divide-gray-100">
              <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-gray-600" />
                  <span className="text-gray-900 font-medium">Terms of Service</span>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </button>

              <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-gray-600" />
                  <span className="text-gray-900 font-medium">Privacy Policy</span>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </button>

              <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <HelpCircle className="w-5 h-5 text-gray-600" />
                  <span className="text-gray-900 font-medium">Contact Support</span>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </button>
            </Card>

            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600">Anchor v1.0.0</p>
              <p className="text-xs text-gray-500 mt-1">Made with care for California families</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
