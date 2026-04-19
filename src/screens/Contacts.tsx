import { useState, useEffect } from 'react'
import {
  Plus,
  Users,
  Phone,
  Mail,
  Pencil,
  Trash2,
  X,
  Gavel,
  Scale,
  UserCog,
  ClipboardList,
  Heart,
  Brain,
  User,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { BottomNav, AppHeader } from '../components'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { haptics } from '../lib/haptics'

interface CourtInfo {
  id: string
  user_id: string
  county: string
  presiding_judge: string
  next_court_date: string | null
  created_at: string
  updated_at: string
}

interface Contact {
  id: string
  user_id: string
  name: string
  role: RoleType
  phone: string
  email: string
  notes: string
  created_at: string
  updated_at: string
}

type RoleType =
  | 'Attorney'
  | 'Social Worker'
  | 'Case Manager'
  | 'CASA'
  | 'Therapist'
  | 'Supervisor'
  | 'Judge'
  | 'Other'

const ROLES: RoleType[] = [
  'Attorney', 'Social Worker', 'Case Manager',
  'CASA', 'Therapist', 'Supervisor', 'Judge', 'Other',
]

const CALIFORNIA_COUNTIES = [
  'Alameda','Alpine','Amador','Butte','Calaveras','Colusa','Contra Costa',
  'Del Norte','El Dorado','Fresno','Glenn','Humboldt','Imperial','Inyo',
  'Kern','Kings','Lake','Lassen','Los Angeles','Madera','Marin','Mariposa',
  'Mendocino','Merced','Modoc','Mono','Monterey','Napa','Nevada','Orange',
  'Placer','Plumas','Riverside','Sacramento','San Benito','San Bernardino',
  'San Diego','San Francisco','San Joaquin','San Luis Obispo','San Mateo',
  'Santa Barbara','Santa Clara','Santa Cruz','Shasta','Sierra','Siskiyou',
  'Solano','Sonoma','Stanislaus','Sutter','Tehama','Trinity','Tulare',
  'Tuolumne','Ventura','Yolo','Yuba',
]

const ROLE_COLORS: Record<RoleType, { bg: string; text: string; dot: string }> = {
  Attorney:       { bg: '#EAF0F8', text: '#3A5A80', dot: '#3A5A80' },
  Judge:          { bg: '#F5ECD8', text: '#7A5A2A', dot: '#C8883A' },
  'Social Worker':{ bg: '#F4EFF8', text: '#7A6690', dot: '#7A6690' },
  'Case Manager': { bg: '#EAF4EE', text: '#4A7C59', dot: '#4A7C59' },
  CASA:           { bg: '#FDF0F0', text: '#8A3A3A', dot: '#C84A4A' },
  Therapist:      { bg: '#F0F4F8', text: '#3A5A70', dot: '#4A7A9A' },
  Supervisor:     { bg: '#F4EFF8', text: '#5A4A70', dot: '#7A6690' },
  Other:          { bg: '#F0EAE0', text: '#5A5065', dot: '#9A90A8' },
}

const getRoleIcon = (role: RoleType) => {
  switch (role) {
    case 'Attorney': return Scale
    case 'Social Worker': return UserCog
    case 'Case Manager': return ClipboardList
    case 'CASA': return Heart
    case 'Therapist': return Brain
    case 'Judge': return Gavel
    case 'Supervisor': return UserCog
    default: return User
  }
}

const inputStyle: React.CSSProperties = {
  width: '100%', boxSizing: 'border-box',
  padding: '12px 16px',
  background: '#EDE6DB',
  border: '1.5px solid rgba(122,102,144,0.2)',
  borderRadius: 16,
  fontFamily: 'DM Sans, sans-serif', fontSize: 15, color: '#2A2030',
  outline: 'none',
}

const labelStyle: React.CSSProperties = {
  fontFamily: 'DM Sans, sans-serif', fontSize: 13, fontWeight: 600,
  color: '#5A5065', display: 'block', marginBottom: 6,
}

export function Contacts() {
  const { user, updateProfile } = useAuth()
  const [courtInfo, setCourtInfo] = useState<CourtInfo | null>(null)
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [showContactModal, setShowContactModal] = useState(false)
  const [showCourtModal, setShowCourtModal] = useState(false)
  const [editingContact, setEditingContact] = useState<Contact | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [expandedContact, setExpandedContact] = useState<string | null>(null)
  const [keyboardHeight, setKeyboardHeight] = useState(0)

  const [contactForm, setContactForm] = useState({
    name: '', role: 'Attorney' as RoleType, phone: '', email: '', notes: '',
  })
  const [courtForm, setCourtForm] = useState({
    county: '', presiding_judge: '', next_court_date: '',
  })

  useEffect(() => { if (user) loadData() }, [user])

  useEffect(() => {
    const vv = window.visualViewport
    if (!vv) return
    const handler = () => {
      const hidden = window.innerHeight - vv.height - vv.offsetTop
      setKeyboardHeight(hidden > 0 ? hidden : 0)
    }
    vv.addEventListener('resize', handler)
    vv.addEventListener('scroll', handler)
    return () => { vv.removeEventListener('resize', handler); vv.removeEventListener('scroll', handler) }
  }, [])

  const loadData = async () => {
    if (!user) return
    try {
      await Promise.all([loadCourtInfo(), loadContacts()])
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadCourtInfo = async () => {
    if (!user) return
    try {
      const { data, error } = await supabase
        .from('court_info').select('*').eq('user_id', user.id).maybeSingle()
      if (error) throw error
      setCourtInfo(data)
      if (data) setCourtForm({
        county: data.county || '',
        presiding_judge: data.presiding_judge || '',
        next_court_date: data.next_court_date || '',
      })
    } catch (error) { console.error('Error loading court info:', error) }
  }

  const loadContacts = async () => {
    if (!user) return
    try {
      const { data, error } = await supabase
        .from('contacts').select('*').eq('user_id', user.id)
        .order('created_at', { ascending: false })
      if (error) throw error
      setContacts(data || [])
    } catch (error) { console.error('Error loading contacts:', error) }
  }

  const openAddContactModal = () => {
    haptics.light()
    setEditingContact(null)
    setContactForm({ name: '', role: 'Attorney', phone: '', email: '', notes: '' })
    setShowContactModal(true)
  }

  const openEditContactModal = (contact: Contact) => {
    haptics.light()
    setEditingContact(contact)
    setContactForm({ name: contact.name, role: contact.role, phone: contact.phone, email: contact.email, notes: contact.notes })
    setShowContactModal(true)
    setExpandedContact(null)
  }

  const closeContactModal = () => {
    setShowContactModal(false)
    setEditingContact(null)
    setContactForm({ name: '', role: 'Attorney', phone: '', email: '', notes: '' })
  }

  const openCourtModal = () => {
    if (courtInfo) setCourtForm({
      county: courtInfo.county || '',
      presiding_judge: courtInfo.presiding_judge || '',
      next_court_date: courtInfo.next_court_date || '',
    })
    setShowCourtModal(true)
  }

  const handleSaveContact = async () => {
    if (!user || !contactForm.name.trim()) return
    try {
      if (editingContact) {
        const { error } = await supabase.from('contacts').update({
          name: contactForm.name.trim(), role: contactForm.role,
          phone: contactForm.phone.trim(), email: contactForm.email.trim(),
          notes: contactForm.notes.trim(),
        }).eq('id', editingContact.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('contacts').insert({
          user_id: user.id, name: contactForm.name.trim(), role: contactForm.role,
          phone: contactForm.phone.trim(), email: contactForm.email.trim(),
          notes: contactForm.notes.trim(),
        })
        if (error) throw error
      }
      haptics.success()
      await loadContacts()
      closeContactModal()
    } catch (error) { console.error('Error saving contact:', error); haptics.error() }
  }

  const handleSaveCourtInfo = async () => {
    if (!user) return
    try {
      if (courtInfo) {
        const { error } = await supabase.from('court_info').update({
          county: courtForm.county.trim(),
          presiding_judge: courtForm.presiding_judge.trim(),
          next_court_date: courtForm.next_court_date || null,
        }).eq('id', courtInfo.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('court_info').insert({
          user_id: user.id, county: courtForm.county.trim(),
          presiding_judge: courtForm.presiding_judge.trim(),
          next_court_date: courtForm.next_court_date || null,
        })
        if (error) throw error
      }
      // Sync court date to profile so Dashboard stays current
      if (courtForm.next_court_date) {
        await updateProfile({ next_court_date: courtForm.next_court_date })
      }
      haptics.success()
      await loadCourtInfo()
      setShowCourtModal(false)
    } catch (error) { console.error('Error saving court info:', error); haptics.error() }
  }

  const handleDeleteContact = async (id: string) => {
    try {
      const { error } = await supabase.from('contacts').delete().eq('id', id)
      if (error) throw error
      haptics.medium()
      await loadContacts()
      setDeleteConfirm(null)
      setExpandedContact(null)
    } catch (error) { console.error('Error deleting contact:', error); haptics.error() }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not set'
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const formatPhone = (phone: string) => {
    const c = phone.replace(/\D/g, '')
    if (c.length === 10) return `(${c.slice(0,3)}) ${c.slice(3,6)}-${c.slice(6)}`
    return phone
  }

  const modalSheet: React.CSSProperties = {
    background: '#FAF7F2', borderRadius: '24px 24px 0 0',
    width: '100%', maxWidth: 480,
    maxHeight: '92vh',
    display: 'flex', flexDirection: 'column',
    animation: 'slideUp 0.25s ease',
  }

  const modalHeader: React.CSSProperties = {
    padding: '20px 20px 16px',
    borderBottom: '1px solid rgba(122,102,144,0.12)',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    flexShrink: 0,
  }

  const modalFooter: React.CSSProperties = {
    padding: '16px 20px env(safe-area-inset-bottom, 32px)',
    borderTop: '1px solid rgba(122,102,144,0.12)',
    display: 'flex', gap: 12,
    flexShrink: 0,
  }

  const overlay: React.CSSProperties = {
    position: 'fixed', inset: 0, background: 'rgba(42,32,48,0.5)',
    display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 50,
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#EDE6DB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', border: '3px solid #E8DDE8', borderTopColor: '#7A6690', animation: 'spin 0.8s linear infinite', margin: '0 auto' }} />
          <p style={{ marginTop: 16, color: '#5A5065', fontFamily: 'DM Sans, sans-serif' }}>Loading contacts…</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#EDE6DB' }}>
      <AppHeader title="My Team" />

      <div style={{ maxWidth: 480, margin: '0 auto', padding: '24px 20px 100px' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: 28, fontWeight: 700, color: '#2A2030', margin: 0 }}>My Team</h1>
            <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 14, color: '#9A90A8', marginTop: 4 }}>
              Everyone working on your case
            </p>
          </div>
          <button
            onClick={openAddContactModal}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: '#7A6690', color: '#fff', border: 'none',
              borderRadius: 16, padding: '10px 18px',
              fontFamily: 'DM Sans, sans-serif', fontWeight: 600, fontSize: 14,
              cursor: 'pointer', boxShadow: '0 4px 16px rgba(122,102,144,0.3)',
            }}
          >
            <Plus size={16} />
            Add
          </button>
        </div>

        {/* Court info card */}
        <div style={{
          background: '#FAF7F2', border: '1px solid rgba(255,255,255,0.88)',
          borderRadius: 20, padding: '18px 18px 16px', marginBottom: 24,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 12, background: '#F5ECD8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Gavel size={18} color="#C8883A" />
              </div>
              <span style={{ fontFamily: 'Fraunces, serif', fontSize: 17, fontWeight: 700, color: '#2A2030' }}>Court Info</span>
            </div>
            <button
              onClick={openCourtModal}
              style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, fontWeight: 600, color: '#7A6690', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px' }}
            >
              Edit
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { label: 'County', value: courtInfo?.county },
              { label: 'Judge', value: courtInfo?.presiding_judge },
              { label: 'Next date', value: formatDate(courtInfo?.next_court_date || null) },
            ].map(({ label, value }) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: '#9A90A8' }}>{label}</span>
                <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, fontWeight: 600, color: value ? '#2A2030' : '#C8C0D0' }}>
                  {value || 'Not set'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Contacts list */}
        {contacts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '64px 0' }}>
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#E8DDE8', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <Users size={32} color="#7A6690" />
            </div>
            <h3 style={{ fontFamily: 'Fraunces, serif', fontSize: 20, fontWeight: 700, color: '#2A2030', marginBottom: 8 }}>No contacts yet</h3>
            <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 14, color: '#9A90A8' }}>Tap "Add" to save your attorney, social worker, and more</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {contacts.map((contact) => {
              const Icon = getRoleIcon(contact.role)
              const colors = ROLE_COLORS[contact.role] || ROLE_COLORS.Other
              const isExpanded = expandedContact === contact.id
              return (
                <div
                  key={contact.id}
                  style={{ background: '#FAF7F2', border: '1px solid rgba(255,255,255,0.88)', borderRadius: 20, overflow: 'hidden' }}
                >
                  {/* Contact row */}
                  <button
                    onClick={() => setExpandedContact(isExpanded ? null : contact.id)}
                    style={{
                      width: '100%', background: 'none', border: 'none', cursor: 'pointer',
                      padding: '16px', display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left',
                    }}
                  >
                    <div style={{ width: 44, height: 44, borderRadius: 14, background: colors.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Icon size={20} color={colors.dot} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: 'Fraunces, serif', fontSize: 16, fontWeight: 700, color: '#2A2030' }}>{contact.name}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 3 }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: colors.dot, display: 'inline-block' }} />
                        <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, fontWeight: 600, color: colors.text }}>{contact.role}</span>
                      </div>
                    </div>
                    {isExpanded ? <ChevronUp size={16} color="#9A90A8" /> : <ChevronDown size={16} color="#9A90A8" />}
                  </button>

                  {/* Expanded details */}
                  {isExpanded && (
                    <div style={{ padding: '0 16px 16px', borderTop: '1px solid rgba(122,102,144,0.08)' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingTop: 14 }}>
                        {contact.phone && (
                          <a href={`tel:${contact.phone}`} style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
                            <div style={{ width: 32, height: 32, borderRadius: 10, background: '#EAF4EE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <Phone size={14} color="#4A7C59" />
                            </div>
                            <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 14, color: '#4A7C59', fontWeight: 600 }}>{formatPhone(contact.phone)}</span>
                          </a>
                        )}
                        {contact.email && (
                          <a href={`mailto:${contact.email}`} style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
                            <div style={{ width: 32, height: 32, borderRadius: 10, background: '#EAF0F8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <Mail size={14} color="#3A5A80" />
                            </div>
                            <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 14, color: '#3A5A80', fontWeight: 600, wordBreak: 'break-all' }}>{contact.email}</span>
                          </a>
                        )}
                        {contact.notes && (
                          <div style={{ background: '#EDE6DB', borderRadius: 12, padding: '10px 12px' }}>
                            <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: '#5A5065', margin: 0, lineHeight: 1.5 }}>{contact.notes}</p>
                          </div>
                        )}
                        {/* Edit / Delete */}
                        <div style={{ display: 'flex', gap: 8, paddingTop: 4 }}>
                          <button
                            onClick={() => openEditContactModal(contact)}
                            style={{
                              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                              padding: '9px', background: '#F4EFF8', border: 'none', borderRadius: 12,
                              fontFamily: 'DM Sans, sans-serif', fontSize: 13, fontWeight: 600, color: '#7A6690', cursor: 'pointer',
                            }}
                          >
                            <Pencil size={13} /> Edit
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(contact.id)}
                            style={{
                              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                              padding: '9px', background: '#FDF0F0', border: 'none', borderRadius: 12,
                              fontFamily: 'DM Sans, sans-serif', fontSize: 13, fontWeight: 600, color: '#C84A4A', cursor: 'pointer',
                            }}
                          >
                            <Trash2 size={13} /> Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Contact modal */}
      {showContactModal && (
        <div style={{ ...overlay, paddingBottom: keyboardHeight }}>
          <div style={modalSheet}>
            <div style={modalHeader}>
              <div>
                <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 22, fontWeight: 700, color: '#2A2030', margin: 0 }}>
                  {editingContact ? 'Edit Contact' : 'New Contact'}
                </h2>
                {!editingContact && (
                  <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: '#9A90A8', marginTop: 4 }}>
                    Saved securely in your Anchor account
                  </p>
                )}
              </div>
              <button onClick={closeContactModal} style={{ width: 36, height: 36, borderRadius: 12, background: '#E8DDE8', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <X size={16} color="#7A6690" />
              </button>
            </div>

            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 16, overflowY: 'auto', flex: 1 }}>
              <div>
                <label style={labelStyle}>Name</label>
                <input type="text" value={contactForm.name} onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })} placeholder="Full name" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Role</label>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {ROLES.map((role) => {
                    const c = ROLE_COLORS[role]
                    const sel = contactForm.role === role
                    return (
                      <button key={role} onClick={() => setContactForm({ ...contactForm, role })}
                        style={{
                          padding: '6px 14px', borderRadius: 20,
                          border: sel ? `1.5px solid ${c.dot}` : '1.5px solid transparent',
                          background: sel ? c.bg : '#F0EAE0',
                          color: sel ? c.text : '#9A90A8',
                          fontFamily: 'DM Sans, sans-serif', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                        }}
                      >{role}</button>
                    )
                  })}
                </div>
              </div>
              <div>
                <label style={labelStyle}>Phone</label>
                <input type="tel" value={contactForm.phone} onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })} placeholder="(555) 123-4567" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Email</label>
                <input type="email" value={contactForm.email} onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })} placeholder="email@example.com" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Notes</label>
                <textarea value={contactForm.notes} onChange={(e) => setContactForm({ ...contactForm, notes: e.target.value })} placeholder="Anything important to remember…" rows={2}
                  style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }} />
              </div>
              {/* Buttons inside scroll — always reachable */}
              <div style={{ display: 'flex', gap: 12, paddingTop: 4, paddingBottom: 'env(safe-area-inset-bottom, 16px)' }}>
                <button onClick={closeContactModal} style={{ flex: 1, padding: '14px', background: '#EDE6DB', border: '1.5px solid rgba(122,102,144,0.2)', borderRadius: 16, fontFamily: 'DM Sans, sans-serif', fontWeight: 600, fontSize: 15, color: '#7A6690', cursor: 'pointer' }}>
                  Cancel
                </button>
                <button onClick={handleSaveContact} disabled={!contactForm.name.trim()}
                  style={{ flex: 1, padding: '14px', background: contactForm.name.trim() ? '#7A6690' : '#C8C0D0', border: 'none', borderRadius: 16, fontFamily: 'DM Sans, sans-serif', fontWeight: 600, fontSize: 15, color: '#fff', cursor: contactForm.name.trim() ? 'pointer' : 'not-allowed', boxShadow: contactForm.name.trim() ? '0 4px 16px rgba(122,102,144,0.3)' : 'none' }}>
                  {editingContact ? 'Save Changes' : 'Add to Team'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Court info modal */}
      {showCourtModal && (
        <div style={{ ...overlay, paddingBottom: keyboardHeight }}>
          <div style={modalSheet}>
            <div style={modalHeader}>
              <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 22, fontWeight: 700, color: '#2A2030', margin: 0 }}>Court Info</h2>
              <button onClick={() => setShowCourtModal(false)} style={{ width: 36, height: 36, borderRadius: 12, background: '#E8DDE8', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <X size={16} color="#7A6690" />
              </button>
            </div>

            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 16, overflowY: 'auto', flex: 1 }}>
              <div>
                <label style={labelStyle}>County</label>
                <select value={courtForm.county} onChange={(e) => setCourtForm({ ...courtForm, county: e.target.value })} style={{ ...inputStyle, appearance: 'none' }}>
                  <option value="">Select a county</option>
                  {CALIFORNIA_COUNTIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Presiding Judge</label>
                <input type="text" value={courtForm.presiding_judge} onChange={(e) => setCourtForm({ ...courtForm, presiding_judge: e.target.value })} placeholder="Judge's name" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Next Court Date</label>
                <input type="date" value={courtForm.next_court_date} onChange={(e) => setCourtForm({ ...courtForm, next_court_date: e.target.value })} style={inputStyle} />
              </div>
              {/* Buttons inside scroll — always reachable */}
              <div style={{ display: 'flex', gap: 12, paddingTop: 4, paddingBottom: 'env(safe-area-inset-bottom, 16px)' }}>
                <button onClick={() => setShowCourtModal(false)} style={{ flex: 1, padding: '14px', background: '#EDE6DB', border: '1.5px solid rgba(122,102,144,0.2)', borderRadius: 16, fontFamily: 'DM Sans, sans-serif', fontWeight: 600, fontSize: 15, color: '#7A6690', cursor: 'pointer' }}>
                  Cancel
                </button>
                <button onClick={handleSaveCourtInfo}
                  style={{ flex: 1, padding: '14px', background: 'linear-gradient(160deg,#8A74A0 0%,#6A5588 100%)', border: 'none', borderRadius: 16, boxShadow: '0 6px 24px rgba(100,75,140,0.3), inset 0 1px 0 rgba(255,255,255,0.2)', fontFamily: 'DM Sans, sans-serif', fontWeight: 600, fontSize: 15, color: '#fff', cursor: 'pointer', boxShadow: '0 4px 16px rgba(122,102,144,0.3)' }}>
                  Save Court Info
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteConfirm && (
        <div style={{ ...overlay, alignItems: 'center', padding: '0 20px' }}>
          <div style={{ background: '#FAF7F2', borderRadius: 24, padding: '28px 24px', width: '100%', maxWidth: 360 }}>
            <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 22, fontWeight: 700, color: '#2A2030', marginBottom: 8 }}>Remove this contact?</h2>
            <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 14, color: '#5A5065', marginBottom: 24 }}>This can't be undone.</p>
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => setDeleteConfirm(null)} style={{ flex: 1, padding: '13px', background: '#EDE6DB', border: '1.5px solid rgba(122,102,144,0.2)', borderRadius: 16, fontFamily: 'DM Sans, sans-serif', fontWeight: 600, fontSize: 15, color: '#7A6690', cursor: 'pointer' }}>
                Cancel
              </button>
              <button onClick={() => handleDeleteContact(deleteConfirm)} style={{ flex: 1, padding: '13px', background: '#C0392B', border: 'none', borderRadius: 16, fontFamily: 'DM Sans, sans-serif', fontWeight: 600, fontSize: 15, color: '#fff', cursor: 'pointer' }}>
                Remove
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } } @keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <BottomNav />
    </div>
  )
}
