import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
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
  X,
  Check,
} from 'lucide-react'
import { AppHeader, BottomNav } from '../components'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { haptics } from '../lib/haptics'

// ── STYLES ────────────────────────────────────────────────────────────────────
const input: React.CSSProperties = {
  background: '#EDE6DB',
  border: '1.5px solid rgba(122,102,144,0.2)',
  borderRadius: 14,
  padding: '12px 16px',
  color: '#2A2030',
  outline: 'none',
  width: '100%',
  fontSize: 15,
  fontFamily: 'inherit',
}
const label: React.CSSProperties = {
  display: 'block',
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: '0.07em',
  textTransform: 'uppercase',
  color: '#8A8098',
  marginBottom: 6,
}
const primaryBtn: React.CSSProperties = {
  background: '#7A6690',
  color: 'white',
  border: 'none',
  borderRadius: 14,
  padding: '13px 20px',
  fontWeight: 700,
  fontSize: 15,
  cursor: 'pointer',
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
  boxShadow: '0 4px 16px rgba(122,102,144,0.25)',
}
const ghostBtn: React.CSSProperties = {
  background: 'transparent',
  color: '#7A6690',
  border: '1.5px solid rgba(122,102,144,0.3)',
  borderRadius: 14,
  padding: '12px 20px',
  fontWeight: 600,
  fontSize: 15,
  cursor: 'pointer',
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
}
const dangerBtn: React.CSSProperties = {
  background: 'rgba(220,38,38,0.08)',
  color: '#DC2626',
  border: '1.5px solid rgba(220,38,38,0.2)',
  borderRadius: 14,
  padding: '13px 20px',
  fontWeight: 700,
  fontSize: 15,
  cursor: 'pointer',
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
}
const sectionCard: React.CSSProperties = {
  background: '#FAF7F2',
  border: '1px solid rgba(255,255,255,0.88)',
  borderRadius: 20,
  overflow: 'hidden',
  marginBottom: 6,
}
const row: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '14px 16px',
  cursor: 'pointer',
  borderBottom: '1px solid rgba(122,102,144,0.08)',
}
const rowLast: React.CSSProperties = {
  ...row,
  borderBottom: 'none',
}
const iconWrap: React.CSSProperties = {
  background: '#E8DDE8',
  borderRadius: 10,
  padding: 8,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
}

// ── MODAL WRAPPER ─────────────────────────────────────────────────────────────
function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div
      className="fixed inset-0 flex items-end justify-center z-50 p-4"
      style={{ background: 'rgba(42,32,48,0.5)' }}
      onClick={onClose}
    >
      <div className="w-full max-w-md rounded-3xl p-6" style={{ background: '#FAF7F2' }} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 700, fontSize: 20, color: '#2A2030' }}>
            {title}
          </h2>
          <button onClick={onClose} style={{ color: '#8A8098', background: 'none', border: 'none', cursor: 'pointer' }}>
            <X className="w-5 h-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

// ── ERROR BOX ─────────────────────────────────────────────────────────────────
function ErrorBox({ msg }: { msg: string }) {
  return (
    <div className="rounded-2xl p-3 mb-4" style={{ background: '#F5ECD8', border: '1px solid rgba(200,136,58,0.2)' }}>
      <p style={{ fontSize: 13, color: '#7A5A2A' }}>{msg}</p>
    </div>
  )
}

export function Settings() {
  const { user, profile, signOut, updateProfile } = useAuth()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(false)
  const [language, setLanguage] = useState(profile?.language || 'en')

  const [showEditProfile, setShowEditProfile] = useState(false)
  const [showChangePassword, setShowChangePassword] = useState(false)
  const [showUpdateEmail, setShowUpdateEmail] = useState(false)
  const [showUpdatePhone, setShowUpdatePhone] = useState(false)
  const [showLanguageModal, setShowLanguageModal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const [editedFirstName, setEditedFirstName] = useState(profile?.first_name || '')
  const [editedUsername, setEditedUsername] = useState(profile?.username || '')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [newEmail, setNewEmail] = useState(user?.email || '')
  const [currentEmailPassword, setCurrentEmailPassword] = useState('')
  const [newPhone, setNewPhone] = useState(profile?.phone_number || '')
  const [deletePassword, setDeletePassword] = useState('')

  const [error, setError] = useState('')
  const [deleteError, setDeleteError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  const flash = (msg: string) => {
    setSuccessMsg(msg)
    setTimeout(() => setSuccessMsg(''), 3000)
  }

  const getInitials = () => {
    if (profile?.first_name) return profile.first_name.charAt(0).toUpperCase()
    if (profile?.username) return profile.username.charAt(0).toUpperCase()
    return 'U'
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

  const roleLabel: Record<string, string> = { parent: 'Parent', youth: 'Youth', supporter: 'Supporter' }

  // ── HANDLERS ────────────────────────────────────────────────────────────────
  const handleSaveProfile = async () => {
    setLoading(true); setError('')
    const { error } = await updateProfile({ first_name: editedFirstName, username: editedUsername })
    if (error) { setError(error.message) } else { setShowEditProfile(false); haptics.success(); flash('Profile updated') }
    setLoading(false)
  }

  const handleChangePassword = async () => {
    if (!currentPassword.trim()) { setError('Please enter your current password'); return }
    if (newPassword !== confirmPassword) { setError('New passwords do not match'); return }
    if (newPassword.length < 6) { setError('New password must be at least 6 characters'); return }
    setLoading(true); setError('')
    // Verify current password first
    const { error: signInError } = await supabase.auth.signInWithPassword({ email: user?.email || '', password: currentPassword })
    if (signInError) { setError('Current password is incorrect'); setLoading(false); return }
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) { setError(error.message) } else {
      setShowChangePassword(false); setCurrentPassword(''); setNewPassword(''); setConfirmPassword('')
      haptics.success(); flash('Password updated')
    }
    setLoading(false)
  }

  const handleUpdateEmail = async () => {
    if (!currentEmailPassword.trim()) { setError('Please enter your current password to confirm'); return }
    setLoading(true); setError('')
    const { error: signInError } = await supabase.auth.signInWithPassword({ email: user?.email || '', password: currentEmailPassword })
    if (signInError) { setError('Password is incorrect'); setLoading(false); return }
    const { error } = await supabase.auth.updateUser({ email: newEmail })
    if (error) { setError(error.message) } else {
      setShowUpdateEmail(false); setCurrentEmailPassword(''); haptics.success(); flash('Check your new email for a confirmation link')
    }
    setLoading(false)
  }

  const handleUpdatePhone = async () => {
    setLoading(true); setError('')
    const { error } = await updateProfile({ phone_number: newPhone })
    if (error) { setError(error.message) } else { setShowUpdatePhone(false); haptics.success(); flash('Phone updated') }
    setLoading(false)
  }

  const handleUpdateLanguage = async () => {
    setLoading(true)
    await updateProfile({ language })
    haptics.success(); setShowLanguageModal(false); flash('Language updated')
    setLoading(false)
  }

  const handleToggleNotifications = async () => {
    if (!profile) return
    haptics.medium()
    await updateProfile({ text_reminders_enabled: !profile.text_reminders_enabled })
  }

  const handleExportData = async () => {
    setLoading(true)
    try {
      const [notes, timeline, contacts] = await Promise.all([
        supabase.from('notes').select('*').eq('user_id', user?.id).order('created_at', { ascending: false }),
        supabase.from('timeline_stages').select('*').eq('user_id', user?.id).order('order_index'),
        supabase.from('contacts').select('*').eq('user_id', user?.id),
      ])
      const data = { profile, exportDate: new Date().toISOString(), notes: notes.data || [], timeline: timeline.data || [], contacts: contacts.data || [] }
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url; a.download = `anchor-data-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a); a.click(); document.body.removeChild(a)
      URL.revokeObjectURL(url); haptics.success()
    } catch { haptics.error() }
    setLoading(false)
  }

  const handleDeleteAccount = async () => {
    if (!deletePassword.trim()) { setDeleteError('Enter your password to confirm'); haptics.error(); return }
    setLoading(true); setDeleteError('')
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email: user?.email || '', password: deletePassword })
      if (signInError) { setDeleteError('Incorrect password'); haptics.error(); setLoading(false); return }
      await supabase.from('notes').delete().eq('user_id', user?.id)
      await supabase.from('timeline_stages').delete().eq('user_id', user?.id)
      await supabase.from('contacts').delete().eq('user_id', user?.id)
      await supabase.from('court_info').delete().eq('user_id', user?.id)
      await supabase.from('profiles').delete().eq('id', user?.id)
      const { error: delErr } = await supabase.rpc('delete_user')
      if (delErr) { setDeleteError('Failed to delete account. Please contact support.'); haptics.error(); setLoading(false); return }
      haptics.success(); await signOut(); navigate('/')
    } catch { setDeleteError('Something went wrong. Please try again.'); haptics.error(); setLoading(false) }
  }

  // ── MAIN RENDER ──────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen pb-24" style={{ background: '#EDE6DB' }}>
      <AppHeader title="Settings" />

      <div className="max-w-md mx-auto px-4 pt-5">

        {/* Success toast */}
        {successMsg && (
          <div
            className="flex items-center gap-2 rounded-2xl px-4 py-3 mb-4"
            style={{ background: 'rgba(74,124,89,0.12)', border: '1px solid rgba(74,124,89,0.2)' }}
          >
            <Check className="w-4 h-4 flex-shrink-0" style={{ color: '#4A7C59' }} />
            <p style={{ fontSize: 13, fontWeight: 600, color: '#4A7C59' }}>{successMsg}</p>
          </div>
        )}

        {/* ── PROFILE CARD ── */}
        <div
          className="rounded-3xl p-5 mb-6"
          style={{ background: '#FAF7F2', border: '1px solid rgba(255,255,255,0.88)' }}
        >
          <div className="flex items-center gap-4 mb-4">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #7A6690, #9A7CB0)' }}
            >
              <span style={{ color: 'white', fontSize: 22, fontWeight: 700, fontFamily: "'Fraunces', Georgia, serif" }}>
                {getInitials()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 700, fontSize: 18, color: '#2A2030' }}>
                {profile?.first_name || profile?.username || 'Your Account'}
              </p>
              {profile?.username && (
                <p style={{ fontSize: 13, color: '#8A8098' }}>@{profile.username}</p>
              )}
              {profile?.role && (
                <span
                  className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-bold"
                  style={{ background: '#E8DDE8', color: '#7A6690' }}
                >
                  {roleLabel[profile.role] || profile.role}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={() => { haptics.light(); setEditedFirstName(profile?.first_name || ''); setEditedUsername(profile?.username || ''); setShowEditProfile(true) }}
            style={ghostBtn}
          >
            <Edit2 className="w-4 h-4" />
            Edit Profile
          </button>
        </div>

        {/* ── ACCOUNT ── */}
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: '#8A8098', marginBottom: 8, paddingLeft: 4 }}>
          Account
        </p>
        <div style={{ ...sectionCard, marginBottom: 20 }}>
          <button style={row} onClick={() => { haptics.light(); setShowChangePassword(true) }} className="w-full hover:bg-purple-50 transition-colors">
            <div className="flex items-center gap-3">
              <div style={iconWrap}><Lock className="w-4 h-4" style={{ color: '#7A6690' }} /></div>
              <span style={{ fontSize: 15, fontWeight: 500, color: '#2A2030' }}>Change Password</span>
            </div>
            <ChevronRight className="w-4 h-4" style={{ color: '#8A8098' }} />
          </button>
          <div style={row}>
            <div className="flex items-center gap-3">
              <div style={iconWrap}><Mail className="w-4 h-4" style={{ color: '#7A6690' }} /></div>
              <div>
                <p style={{ fontSize: 15, fontWeight: 500, color: '#2A2030' }}>Email</p>
                <p style={{ fontSize: 12, color: '#8A8098' }}>{maskEmail(user?.email || '')}</p>
              </div>
            </div>
            <button
              onClick={() => { haptics.light(); setNewEmail(user?.email || ''); setShowUpdateEmail(true) }}
              style={{ fontSize: 13, fontWeight: 700, color: '#7A6690', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              Update
            </button>
          </div>
          <button style={rowLast} onClick={() => { haptics.light(); setShowLanguageModal(true) }} className="w-full hover:bg-purple-50 transition-colors">
            <div className="flex items-center gap-3">
              <div style={iconWrap}><Globe className="w-4 h-4" style={{ color: '#7A6690' }} /></div>
              <div>
                <p style={{ fontSize: 15, fontWeight: 500, color: '#2A2030' }}>Language</p>
                <p style={{ fontSize: 12, color: '#8A8098' }}>{language === 'en' ? 'English' : 'Español'}</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4" style={{ color: '#8A8098' }} />
          </button>
        </div>

        {/* ── NOTIFICATIONS ── */}
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: '#8A8098', marginBottom: 8, paddingLeft: 4 }}>
          Notifications
        </p>
        <div style={{ ...sectionCard, marginBottom: 20 }}>
          <div style={row}>
            <div className="flex items-center gap-3">
              <div style={iconWrap}><Bell className="w-4 h-4" style={{ color: '#7A6690' }} /></div>
              <div>
                <p style={{ fontSize: 15, fontWeight: 500, color: '#2A2030' }}>Text Reminders</p>
                <p style={{ fontSize: 12, color: '#8A8098' }}>Court dates and appointments</p>
              </div>
            </div>
            <button
              onClick={handleToggleNotifications}
              style={{
                width: 44, height: 24, borderRadius: 12,
                background: profile?.text_reminders_enabled ? '#7A6690' : '#D4C8D8',
                border: 'none', cursor: 'pointer', position: 'relative', flexShrink: 0,
              }}
            >
              <div style={{
                width: 18, height: 18, background: 'white', borderRadius: '50%',
                position: 'absolute', top: 3, transition: 'left 0.2s',
                left: profile?.text_reminders_enabled ? 23 : 3,
                boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
              }} />
            </button>
          </div>
          <div style={rowLast}>
            <div className="flex items-center gap-3">
              <div style={iconWrap}><Phone className="w-4 h-4" style={{ color: '#7A6690' }} /></div>
              <div>
                <p style={{ fontSize: 15, fontWeight: 500, color: '#2A2030' }}>Phone Number</p>
                <p style={{ fontSize: 12, color: '#8A8098' }}>{maskPhone(profile?.phone_number)}</p>
              </div>
            </div>
            <button
              onClick={() => { haptics.light(); setNewPhone(profile?.phone_number || ''); setShowUpdatePhone(true) }}
              style={{ fontSize: 13, fontWeight: 700, color: '#7A6690', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              Update
            </button>
          </div>
        </div>

        {/* ── PRIVACY & DATA ── */}
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: '#8A8098', marginBottom: 8, paddingLeft: 4 }}>
          Privacy & Data
        </p>
        <div style={{ ...sectionCard, marginBottom: 20 }}>
          <button
            style={row}
            onClick={handleExportData}
            disabled={loading}
            className="w-full hover:bg-purple-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div style={iconWrap}><Download className="w-4 h-4" style={{ color: '#7A6690' }} /></div>
              <div className="text-left">
                <p style={{ fontSize: 15, fontWeight: 500, color: '#2A2030' }}>Export My Data</p>
                <p style={{ fontSize: 12, color: '#8A8098' }}>Download a copy of your information</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4" style={{ color: '#8A8098' }} />
          </button>
          <button
            style={rowLast}
            onClick={() => { haptics.light(); setShowDeleteConfirm(true) }}
            className="w-full hover:bg-red-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div style={{ ...iconWrap, background: 'rgba(220,38,38,0.08)' }}>
                <Trash2 className="w-4 h-4" style={{ color: '#DC2626' }} />
              </div>
              <div className="text-left">
                <p style={{ fontSize: 15, fontWeight: 500, color: '#DC2626' }}>Delete Account</p>
                <p style={{ fontSize: 12, color: '#8A8098' }}>Permanently remove all your data</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4" style={{ color: '#DC2626', opacity: 0.5 }} />
          </button>
        </div>

        {/* ── ABOUT ── */}
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: '#8A8098', marginBottom: 8, paddingLeft: 4 }}>
          About
        </p>
        <div style={{ ...sectionCard, marginBottom: 20 }}>
          <button style={row} className="w-full hover:bg-purple-50 transition-colors">
            <div className="flex items-center gap-3">
              <div style={iconWrap}><FileText className="w-4 h-4" style={{ color: '#7A6690' }} /></div>
              <span style={{ fontSize: 15, fontWeight: 500, color: '#2A2030' }}>Terms of Service</span>
            </div>
            <ChevronRight className="w-4 h-4" style={{ color: '#8A8098' }} />
          </button>
          <button style={row} className="w-full hover:bg-purple-50 transition-colors">
            <div className="flex items-center gap-3">
              <div style={iconWrap}><Shield className="w-4 h-4" style={{ color: '#7A6690' }} /></div>
              <span style={{ fontSize: 15, fontWeight: 500, color: '#2A2030' }}>Privacy Policy</span>
            </div>
            <ChevronRight className="w-4 h-4" style={{ color: '#8A8098' }} />
          </button>
          <button style={rowLast} className="w-full hover:bg-purple-50 transition-colors">
            <div className="flex items-center gap-3">
              <div style={iconWrap}><HelpCircle className="w-4 h-4" style={{ color: '#7A6690' }} /></div>
              <span style={{ fontSize: 15, fontWeight: 500, color: '#2A2030' }}>Contact Support</span>
            </div>
            <ChevronRight className="w-4 h-4" style={{ color: '#8A8098' }} />
          </button>
        </div>

        {/* ── SIGN OUT ── */}
        <button
          onClick={async () => { haptics.light(); await signOut(); navigate('/auth') }}
          style={ghostBtn}
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>

        <p className="text-center mt-6" style={{ fontSize: 12, color: '#8A8098' }}>
          Anchor v1.0.0 · Made with care for California families
        </p>
      </div>

      {/* ── EDIT PROFILE MODAL ── */}
      {showEditProfile && (
        <Modal title="Edit Profile" onClose={() => setShowEditProfile(false)}>
          {error && <ErrorBox msg={error} />}
          <div className="space-y-4 mb-5">
            <div>
              <label style={label}>First Name</label>
              <input type="text" value={editedFirstName} onChange={e => setEditedFirstName(e.target.value)} style={input} />
            </div>
            <div>
              <label style={label}>Username</label>
              <input type="text" value={editedUsername} onChange={e => setEditedUsername(e.target.value)} style={input} />
            </div>
          </div>
          <div className="space-y-2">
            <button onClick={handleSaveProfile} disabled={loading} style={{ ...primaryBtn, opacity: loading ? 0.6 : 1 }}>
              {loading ? 'Saving...' : <><Check className="w-4 h-4" />Save Changes</>}
            </button>
            <button onClick={() => { setShowEditProfile(false); setError('') }} style={ghostBtn}>Cancel</button>
          </div>
        </Modal>
      )}

      {/* ── CHANGE PASSWORD MODAL ── */}
      {showChangePassword && (
        <Modal title="Change Password" onClose={() => { setShowChangePassword(false); setError(''); setCurrentPassword(''); setNewPassword(''); setConfirmPassword('') }}>
          {error && <ErrorBox msg={error} />}
          <div className="space-y-4 mb-5">
            <div>
              <label style={label}>Current Password</label>
              <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} placeholder="Your current password" style={input} />
            </div>
            <div>
              <label style={label}>New Password</label>
              <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="At least 6 characters" style={input} />
            </div>
            <div>
              <label style={label}>Confirm New Password</label>
              <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Re-enter new password" style={input} />
            </div>
          </div>
          <div className="space-y-2">
            <button onClick={handleChangePassword} disabled={loading} style={{ ...primaryBtn, opacity: loading ? 0.6 : 1 }}>
              {loading ? 'Updating...' : 'Update Password'}
            </button>
            <button onClick={() => { setShowChangePassword(false); setError(''); setCurrentPassword(''); setNewPassword(''); setConfirmPassword('') }} style={ghostBtn}>Cancel</button>
          </div>
        </Modal>
      )}

      {/* ── UPDATE EMAIL MODAL ── */}
      {showUpdateEmail && (
        <Modal title="Update Email" onClose={() => { setShowUpdateEmail(false); setError(''); setCurrentEmailPassword('') }}>
          {error && <ErrorBox msg={error} />}
          <div className="space-y-4 mb-5">
            <div>
              <label style={label}>New Email Address</label>
              <input type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} style={input} />
            </div>
            <div>
              <label style={label}>Current Password</label>
              <input type="password" value={currentEmailPassword} onChange={e => setCurrentEmailPassword(e.target.value)} placeholder="Confirm with your password" style={input} />
            </div>
          </div>
          <div className="space-y-2">
            <button onClick={handleUpdateEmail} disabled={loading} style={{ ...primaryBtn, opacity: loading ? 0.6 : 1 }}>
              {loading ? 'Updating...' : 'Update Email'}
            </button>
            <button onClick={() => { setShowUpdateEmail(false); setError(''); setCurrentEmailPassword('') }} style={ghostBtn}>Cancel</button>
          </div>
        </Modal>
      )}

      {/* ── UPDATE PHONE MODAL ── */}
      {showUpdatePhone && (
        <Modal title="Update Phone Number" onClose={() => { setShowUpdatePhone(false); setError('') }}>
          {error && <ErrorBox msg={error} />}
          <div className="mb-5">
            <label style={label}>Phone Number</label>
            <input type="tel" value={newPhone} onChange={e => setNewPhone(e.target.value)} placeholder="(555) 123-4567" style={input} />
          </div>
          <div className="space-y-2">
            <button onClick={handleUpdatePhone} disabled={loading} style={{ ...primaryBtn, opacity: loading ? 0.6 : 1 }}>
              {loading ? 'Updating...' : 'Update Phone'}
            </button>
            <button onClick={() => { setShowUpdatePhone(false); setError('') }} style={ghostBtn}>Cancel</button>
          </div>
        </Modal>
      )}

      {/* ── LANGUAGE MODAL ── */}
      {showLanguageModal && (
        <Modal title="Language" onClose={() => setShowLanguageModal(false)}>
          <div className="space-y-3 mb-5">
            {[{ value: 'en', label: 'English' }, { value: 'es', label: 'Español' }].map(lang => (
              <button
                key={lang.value}
                onClick={() => { haptics.light(); setLanguage(lang.value) }}
                className="w-full text-left transition-all"
                style={{
                  background: language === lang.value ? '#F4EFF8' : '#F0EAE0',
                  border: language === lang.value ? '2px solid #7A6690' : '1.5px solid rgba(122,102,144,0.15)',
                  borderRadius: 16, padding: '14px 16px', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 12,
                }}
              >
                <div
                  style={{
                    width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                    background: language === lang.value ? '#7A6690' : 'transparent',
                    border: language === lang.value ? '2px solid #7A6690' : '2px solid rgba(122,102,144,0.3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  {language === lang.value && <Check className="w-3 h-3 text-white" />}
                </div>
                <span style={{ fontSize: 15, fontWeight: language === lang.value ? 600 : 400, color: '#2A2030' }}>{lang.label}</span>
              </button>
            ))}
          </div>
          <div className="space-y-2">
            <button onClick={handleUpdateLanguage} disabled={loading} style={{ ...primaryBtn, opacity: loading ? 0.6 : 1 }}>
              {loading ? 'Saving...' : 'Save'}
            </button>
            <button onClick={() => setShowLanguageModal(false)} style={ghostBtn}>Cancel</button>
          </div>
        </Modal>
      )}

      {/* ── DELETE ACCOUNT MODAL ── */}
      {showDeleteConfirm && (
        <Modal title="Delete Account?" onClose={() => { setShowDeleteConfirm(false); setDeletePassword(''); setDeleteError('') }}>
          <div
            className="rounded-2xl p-4 mb-5 text-center"
            style={{ background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.15)' }}
          >
            <Trash2 className="w-8 h-8 mx-auto mb-2" style={{ color: '#DC2626' }} />
            <p style={{ fontSize: 14, color: '#7A5A2A' }}>
              This cannot be undone. All your notes, timeline progress, and contacts will be permanently deleted.
            </p>
          </div>
          {deleteError && <ErrorBox msg={deleteError} />}
          <div className="mb-5">
            <label style={label}>Enter your password to confirm</label>
            <input
              type="password"
              value={deletePassword}
              onChange={e => setDeletePassword(e.target.value)}
              placeholder="Your password"
              style={input}
            />
          </div>
          <div className="space-y-2">
            <button onClick={handleDeleteAccount} disabled={loading} style={{ ...dangerBtn, opacity: loading ? 0.6 : 1 }}>
              {loading ? 'Deleting...' : 'Yes, Delete My Account'}
            </button>
            <button onClick={() => { setShowDeleteConfirm(false); setDeletePassword(''); setDeleteError('') }} style={ghostBtn}>
              Cancel
            </button>
          </div>
        </Modal>
      )}

      <BottomNav />
    </div>
  )
}
