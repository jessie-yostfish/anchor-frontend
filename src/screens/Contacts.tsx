import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
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
} from 'lucide-react'
import { Card, Button, BottomNav, AppHeader } from '../components'
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
  'Attorney',
  'Social Worker',
  'Case Manager',
  'CASA',
  'Therapist',
  'Supervisor',
  'Judge',
  'Other',
]

const CALIFORNIA_COUNTIES = [
  'Alameda',
  'Alpine',
  'Amador',
  'Butte',
  'Calaveras',
  'Colusa',
  'Contra Costa',
  'Del Norte',
  'El Dorado',
  'Fresno',
  'Glenn',
  'Humboldt',
  'Imperial',
  'Inyo',
  'Kern',
  'Kings',
  'Lake',
  'Lassen',
  'Los Angeles',
  'Madera',
  'Marin',
  'Mariposa',
  'Mendocino',
  'Merced',
  'Modoc',
  'Mono',
  'Monterey',
  'Napa',
  'Nevada',
  'Orange',
  'Placer',
  'Plumas',
  'Riverside',
  'Sacramento',
  'San Benito',
  'San Bernardino',
  'San Diego',
  'San Francisco',
  'San Joaquin',
  'San Luis Obispo',
  'San Mateo',
  'Santa Barbara',
  'Santa Clara',
  'Santa Cruz',
  'Shasta',
  'Sierra',
  'Siskiyou',
  'Solano',
  'Sonoma',
  'Stanislaus',
  'Sutter',
  'Tehama',
  'Trinity',
  'Tulare',
  'Tuolumne',
  'Ventura',
  'Yolo',
  'Yuba',
]

const getRoleIcon = (role: RoleType) => {
  switch (role) {
    case 'Attorney':
      return Scale
    case 'Social Worker':
      return UserCog
    case 'Case Manager':
      return ClipboardList
    case 'CASA':
      return Heart
    case 'Therapist':
      return Brain
    case 'Judge':
      return Gavel
    case 'Supervisor':
      return UserCog
    default:
      return User
  }
}

export function Contacts() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [courtInfo, setCourtInfo] = useState<CourtInfo | null>(null)
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [showContactModal, setShowContactModal] = useState(false)
  const [showCourtModal, setShowCourtModal] = useState(false)
  const [editingContact, setEditingContact] = useState<Contact | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [expandedContact, setExpandedContact] = useState<string | null>(null)

  const [contactForm, setContactForm] = useState({
    name: '',
    role: 'Attorney' as RoleType,
    phone: '',
    email: '',
    notes: '',
  })

  const [courtForm, setCourtForm] = useState({
    county: '',
    presiding_judge: '',
    next_court_date: '',
  })

  useEffect(() => {
    if (user) {
      loadData()
    }
  }, [user])

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
        .from('court_info')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()

      if (error) throw error

      setCourtInfo(data)
      if (data) {
        setCourtForm({
          county: data.county || '',
          presiding_judge: data.presiding_judge || '',
          next_court_date: data.next_court_date || '',
        })
      }
    } catch (error) {
      console.error('Error loading court info:', error)
    }
  }

  const loadContacts = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      setContacts(data || [])
    } catch (error) {
      console.error('Error loading contacts:', error)
    }
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
    setContactForm({
      name: contact.name,
      role: contact.role,
      phone: contact.phone,
      email: contact.email,
      notes: contact.notes,
    })
    setShowContactModal(true)
    setExpandedContact(null)
  }

  const closeContactModal = () => {
    setShowContactModal(false)
    setEditingContact(null)
    setContactForm({ name: '', role: 'Attorney', phone: '', email: '', notes: '' })
  }

  const openCourtModal = () => {
    if (courtInfo) {
      setCourtForm({
        county: courtInfo.county || '',
        presiding_judge: courtInfo.presiding_judge || '',
        next_court_date: courtInfo.next_court_date || '',
      })
    }
    setShowCourtModal(true)
  }

  const closeCourtModal = () => {
    setShowCourtModal(false)
  }

  const handleSaveContact = async () => {
    if (!user || !contactForm.name.trim() || !contactForm.role) return

    try {
      if (editingContact) {
        const { error } = await supabase
          .from('contacts')
          .update({
            name: contactForm.name.trim(),
            role: contactForm.role,
            phone: contactForm.phone.trim(),
            email: contactForm.email.trim(),
            notes: contactForm.notes.trim(),
          })
          .eq('id', editingContact.id)

        if (error) throw error
      } else {
        const { error } = await supabase.from('contacts').insert({
          user_id: user.id,
          name: contactForm.name.trim(),
          role: contactForm.role,
          phone: contactForm.phone.trim(),
          email: contactForm.email.trim(),
          notes: contactForm.notes.trim(),
        })

        if (error) throw error
      }

      haptics.success()
      await loadContacts()
      closeContactModal()
    } catch (error) {
      console.error('Error saving contact:', error)
      haptics.error()
    }
  }

  const handleSaveCourtInfo = async () => {
    if (!user) return

    try {
      if (courtInfo) {
        const { error } = await supabase
          .from('court_info')
          .update({
            county: courtForm.county.trim(),
            presiding_judge: courtForm.presiding_judge.trim(),
            next_court_date: courtForm.next_court_date || null,
          })
          .eq('id', courtInfo.id)

        if (error) throw error
      } else {
        const { error } = await supabase.from('court_info').insert({
          user_id: user.id,
          county: courtForm.county.trim(),
          presiding_judge: courtForm.presiding_judge.trim(),
          next_court_date: courtForm.next_court_date || null,
        })

        if (error) throw error
      }

      haptics.success()
      await loadCourtInfo()
      closeCourtModal()
    } catch (error) {
      console.error('Error saving court info:', error)
      haptics.error()
    }
  }

  const handleDeleteContact = async (id: string) => {
    try {
      const { error } = await supabase.from('contacts').delete().eq('id', id)

      if (error) throw error

      haptics.medium()
      await loadContacts()
      setDeleteConfirm(null)
      setExpandedContact(null)
    } catch (error) {
      console.error('Error deleting contact:', error)
      haptics.error()
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not set'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const formatPhoneNumber = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '')
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
    }
    return phone
  }

  const toggleContactExpanded = (id: string) => {
    setExpandedContact(expandedContact === id ? null : id)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading contacts...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader />
      <div className="max-w-md mx-auto px-6 py-8 pb-24">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Contacts</h1>

          <button
            onClick={openAddContactModal}
            className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium"
          >
            <Plus className="w-5 h-5" />
            Add Contact
          </button>
        </div>

        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Contacts 📞</h1>
          <p className="text-gray-600">Keep all your important contacts in one safe place</p>
        </div>

        <Card className="mb-6 bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Gavel className="w-6 h-6 text-blue-600" />
              </div>
              <h2 className="text-lg font-bold text-gray-900">Court Information</h2>
            </div>
            <button
              onClick={openCourtModal}
              className="text-sm text-purple-600 hover:text-purple-700 font-medium"
            >
              Edit
            </button>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">County:</span>
              <span className="text-sm font-semibold text-gray-900">
                {courtInfo?.county || 'Not set'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Judge:</span>
              <span className="text-sm font-semibold text-gray-900">
                {courtInfo?.presiding_judge || 'Not set'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Next Date:</span>
              <span className="text-sm font-semibold text-gray-900">
                {formatDate(courtInfo?.next_court_date || null)}
              </span>
            </div>
          </div>
        </Card>

        <div className="mb-4">
          <h2 className="text-xl font-bold text-gray-900">My Team</h2>
        </div>

        {contacts.length === 0 ? (
          <div className="text-center py-16">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No contacts yet</h3>
            <p className="text-gray-500">Add your first contact to get started!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {contacts.map((contact) => {
              const Icon = getRoleIcon(contact.role)
              const isExpanded = expandedContact === contact.id

              return (
                <Card
                  key={contact.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => toggleContactExpanded(contact.id)}
                >
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-purple-100 rounded-lg flex-shrink-0">
                      <Icon className="w-6 h-6 text-purple-600" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-1">
                        <h3 className="text-lg font-bold text-gray-900">{contact.name}</h3>
                        {isExpanded && (
                          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => openEditContactModal(contact)}
                              className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(contact.id)}
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>

                      <span className="inline-block px-2 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded uppercase mb-2">
                        {contact.role}
                      </span>

                      {isExpanded ? (
                        <div className="space-y-2 mt-3">
                          {contact.phone && (
                            <a
                              href={`tel:${contact.phone}`}
                              onClick={(e) => e.stopPropagation()}
                              className="flex items-center gap-2 text-sm text-gray-700 hover:text-purple-600 transition-colors"
                            >
                              <Phone className="w-4 h-4" />
                              {formatPhoneNumber(contact.phone)}
                            </a>
                          )}
                          {contact.email && (
                            <a
                              href={`mailto:${contact.email}`}
                              onClick={(e) => e.stopPropagation()}
                              className="flex items-center gap-2 text-sm text-gray-700 hover:text-purple-600 transition-colors break-all"
                            >
                              <Mail className="w-4 h-4 flex-shrink-0" />
                              {contact.email}
                            </a>
                          )}
                          {contact.notes && (
                            <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                              <p className="text-sm text-gray-700">{contact.notes}</p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-1">
                          {contact.phone && (
                            <p className="text-sm text-gray-600">{formatPhoneNumber(contact.phone)}</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      {showContactModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {editingContact ? 'Edit Contact' : 'Add New Contact'}
                </h2>
                {!editingContact && (
                  <p className="text-sm text-gray-600 mt-1">
                    Add important people in your case. Saved securely in the cloud.
                  </p>
                )}
              </div>
              <button
                onClick={closeContactModal}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={contactForm.name}
                  onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                  placeholder="Enter full name"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Role <span className="text-red-500">*</span>
                </label>
                <select
                  value={contactForm.role}
                  onChange={(e) =>
                    setContactForm({ ...contactForm, role: e.target.value as RoleType })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {ROLES.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={contactForm.phone}
                  onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                  placeholder="(555) 123-4567"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={contactForm.email}
                  onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                  placeholder="email@example.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Notes</label>
                <textarea
                  value={contactForm.notes}
                  onChange={(e) => setContactForm({ ...contactForm, notes: e.target.value })}
                  placeholder="Any important notes..."
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-y"
                />
              </div>
            </div>

            <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex gap-3">
              <Button variant="outline" onClick={closeContactModal} className="flex-1">
                Cancel
              </Button>
              <button
                onClick={handleSaveContact}
                disabled={!contactForm.name.trim()}
                className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {editingContact ? 'Save Changes' : 'Add Contact'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showCourtModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Court Information</h2>
              <button
                onClick={closeCourtModal}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">County</label>
                <select
                  value={courtForm.county}
                  onChange={(e) => setCourtForm({ ...courtForm, county: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Select a county</option>
                  {CALIFORNIA_COUNTIES.map((county) => (
                    <option key={county} value={county}>
                      {county}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Presiding Judge
                </label>
                <input
                  type="text"
                  value={courtForm.presiding_judge}
                  onChange={(e) =>
                    setCourtForm({ ...courtForm, presiding_judge: e.target.value })
                  }
                  placeholder="Enter judge name"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Next Court Date
                </label>
                <input
                  type="date"
                  value={courtForm.next_court_date}
                  onChange={(e) =>
                    setCourtForm({ ...courtForm, next_court_date: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex gap-3">
              <Button variant="outline" onClick={closeCourtModal} className="flex-1">
                Cancel
              </Button>
              <button
                onClick={handleSaveCourtInfo}
                className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-sm w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Delete this contact?</h2>
            <p className="text-gray-600 mb-6">This action cannot be undone.</p>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setDeleteConfirm(null)}
                className="flex-1"
              >
                Cancel
              </Button>
              <button
                onClick={() => handleDeleteContact(deleteConfirm)}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  )
}
