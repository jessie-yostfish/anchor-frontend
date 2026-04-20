import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Plus,
  Search,
  FileText,
  Pencil,
  Trash2,
  X,
} from 'lucide-react'
import { BottomNav, AppHeader } from '../components'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { haptics } from '../lib/haptics'

interface Note {
  id: string
  user_id: string
  title: string
  content: string
  category: 'Court' | 'Visit' | 'Meeting' | 'Personal' | 'Other'
  stage_key: string | null
  is_pinned: boolean
  created_at: string
  updated_at: string
}

type CategoryType = 'Court' | 'Visit' | 'Meeting' | 'Personal' | 'Other'

const CATEGORIES: CategoryType[] = ['Personal', 'Court', 'Visit', 'Meeting', 'Other']

const CATEGORY_STYLES: Record<CategoryType, { bg: string; text: string; dot: string }> = {
  Personal: { bg: '#F4EFF8', text: '#7A6690', dot: '#7A6690' },
  Court:    { bg: '#EAF0F8', text: '#3A5A80', dot: '#3A5A80' },
  Visit:    { bg: '#EAF4EE', text: '#4A7C59', dot: '#4A7C59' },
  Meeting:  { bg: '#F5ECD8', text: '#7A5A2A', dot: '#C8883A' },
  Other:    { bg: '#F0EAE0', text: '#5A5065', dot: '#9A90A8' },
}

export function Notes() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [notes, setNotes] = useState<Note[]>([])
  const [filteredNotes, setFilteredNotes] = useState<Note[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingNote, setEditingNote] = useState<Note | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [keyboardHeight, setKeyboardHeight] = useState(0)
  const STAGE_OPTIONS = [
    { key: 'case-opening', label: 'Case Opening' },
    { key: 'detention', label: 'Detention Hearing' },
    { key: 'jurisdiction', label: 'Jurisdiction Hearing' },
    { key: 'disposition', label: 'Disposition Hearing' },
    { key: 'six-month', label: '6-Month Review' },
    { key: 'twelve-month', label: '12-Month Review' },
    { key: 'eighteen-month', label: '18-Month Review' },
    { key: 'permanency', label: 'Permanency Hearing' },
    { key: 'review-hearings', label: 'Ongoing Reviews' },
    { key: 'case-closure', label: 'Case Closure' },
  ]

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'Personal' as CategoryType,
    stage_key: null as string | null,
  })

  useEffect(() => {
    if (user) loadNotes()
  }, [user])

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredNotes(notes)
      return
    }
    const query = searchQuery.toLowerCase()
    setFilteredNotes(
      notes.filter(
        (note) =>
          note.title.toLowerCase().includes(query) ||
          note.content.toLowerCase().includes(query) ||
          note.category.toLowerCase().includes(query)
      )
    )
  }, [searchQuery, notes])

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

  const loadNotes = async () => {
    if (!user) return
    try {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', user.id)
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false })
      if (error) throw error
      setNotes(data || [])
    } catch (error) {
      console.error('Error loading notes:', error)
    } finally {
      setLoading(false)
    }
  }

  const openAddModal = () => {
    haptics.light()
    setEditingNote(null)
    setFormData({ title: '', content: '', category: 'Personal', stage_key: null })
    setShowModal(true)
  }

  const openEditModal = (note: Note) => {
    haptics.light()
    setEditingNote(note)
    setFormData({ title: note.title, content: note.content, category: note.category, stage_key: note.stage_key || null })
    setShowModal(true)
  }

  const closeModal = () => {
    haptics.light()
    setShowModal(false)
    setEditingNote(null)
    setFormData({ title: '', content: '', category: 'Personal', stage_key: null })
  }

  const handleSave = async () => {
    if (!user || !formData.title.trim()) return
    try {
      if (editingNote) {
        const { error } = await supabase
          .from('notes')
          .update({
            title: formData.title.trim(),
            content: formData.content.trim(),
            category: formData.category,
            stage_key: formData.stage_key || null,
          })
          .eq('id', editingNote.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('notes').insert({
          user_id: user.id,
          title: formData.title.trim(),
          content: formData.content.trim(),
          category: formData.category,
        })
        if (error) throw error
      }
      haptics.success()
      await loadNotes()
      closeModal()
    } catch (error) {
      console.error('Error saving note:', error)
      haptics.error()
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from('notes').delete().eq('id', id)
      if (error) throw error
      haptics.medium()
      await loadNotes()
      setDeleteConfirm(null)
    } catch (error) {
      console.error('Error deleting note:', error)
      haptics.error()
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)
    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const truncateContent = (content: string, maxLength = 100) => {
    if (content.length <= maxLength) return content
    return content.substring(0, maxLength) + '…'
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#EDE6DB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 48, height: 48, borderRadius: '50%',
            border: '3px solid #E8DDE8', borderTopColor: '#7A6690',
            animation: 'spin 0.8s linear infinite', margin: '0 auto'
          }} />
          <p style={{ marginTop: 16, color: '#4A4058', fontFamily: 'DM Sans, sans-serif' }}>Loading notes…</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#EDE6DB' }}>
      <AppHeader title="My Notes" />

      <div style={{ maxWidth: 480, margin: '0 auto', padding: '24px 20px 100px' }}>

        {/* Header row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <div>
            <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: 28, fontWeight: 700, color: '#2A2030', margin: 0 }}>
              My Notes
            </h1>
            <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 14, color: '#8A8098', marginTop: 4 }}>
              Saved securely in your Anchor account
            </p>
          </div>
          <button
            onClick={openAddModal}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: '#7A6690', color: '#fff',
              border: 'none', borderRadius: 16,
              padding: '10px 18px',
              fontFamily: 'DM Sans, sans-serif', fontWeight: 600, fontSize: 14,
              cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(122,102,144,0.3)',
            }}
          >
            <Plus size={16} />
            New
          </button>
        </div>

        {/* Search */}
        <div style={{ position: 'relative', marginBottom: 24, marginTop: 20 }}>
          <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#8A8098' }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search notes…"
            style={{
              width: '100%', boxSizing: 'border-box',
              padding: '12px 16px 12px 40px',
              background: '#FAF7F2',
              border: '1.5px solid rgba(122,102,144,0.2)',
              borderRadius: 16,
              fontFamily: 'DM Sans, sans-serif', fontSize: 15, color: '#2A2030',
              outline: 'none',
            }}
          />
        </div>

        {/* Empty state */}
        {filteredNotes.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 16px' }}>
            <div style={{
              width: 72, height: 72, borderRadius: '50%',
              background: 'linear-gradient(145deg,#F4EFF8,#EDE5F4)',
              display: 'flex', alignItems: 'center',
              justifyContent: 'center', margin: '0 auto 20px',
              boxShadow: '0 4px 16px rgba(122,102,144,0.15)',
            }}>
              <FileText size={32} color="#7A6690" />
            </div>
            <h3 style={{ fontFamily: 'Fraunces, serif', fontSize: 20, fontWeight: 700, color: '#2A2030', marginBottom: 8 }}>
              {searchQuery ? 'No notes found' : 'Your notes live here'}
            </h3>
            <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 14, color: '#8A8098', lineHeight: 1.6, marginBottom: 20 }}>
              {searchQuery
                ? 'Try a different search term'
                : 'Use notes to track what happens at hearings, visits, and meetings. Tap + New to get started.'}
            </p>
            {!searchQuery && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, textAlign: 'left', background: '#FAF7F2', borderRadius: 16, padding: '12px 16px', border: '1px solid rgba(255,255,255,0.88)' }}>
                <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 11, fontWeight: 700, color: '#8A8098', textTransform: 'uppercase', letterSpacing: '0.07em', margin: 0 }}>Ideas to get started</p>
                {["What happened at today's hearing", 'Questions to ask my attorney', 'What the judge said about my case plan', 'How my visit with my child went'].map((idea, i) => (
                  <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#C8B8D0', flexShrink: 0 }} />
                    <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: '#4A4058', margin: 0 }}>{idea}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filteredNotes.map((note) => {
              const style = CATEGORY_STYLES[note.category]
              return (
                <div
                  key={note.id}
                  style={{
                    background: '#FAF7F2',
                    border: '1px solid rgba(255,255,255,0.88)',
                    borderRadius: 20,
                    padding: '16px 16px 14px',
                    position: 'relative',
                  }}
                >
                  <div style={{ marginBottom: 10 }}>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: 5,
                      background: style.bg, color: style.text,
                      borderRadius: 20, padding: '3px 10px',
                      fontFamily: 'DM Sans, sans-serif', fontSize: 12, fontWeight: 600,
                    }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: style.dot, display: 'inline-block' }} />
                      {note.category}
                    </span>
                  </div>
                  <h3 style={{ fontFamily: 'Fraunces, serif', fontSize: 17, fontWeight: 700, color: '#2A2030', margin: '0 0 6px', paddingRight: 64 }}>
                    {note.title}
                  </h3>
                  {note.content && (
                    <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: '#4A4058', margin: '0 0 10px', lineHeight: 1.5 }}>
                      {truncateContent(note.content)}
                    </p>
                  )}
                  <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: '#8A8098', margin: 0 }}>
                    {formatDate(note.updated_at)}
                  </p>
                  <div style={{ position: 'absolute', top: 14, right: 14, display: 'flex', gap: 4 }}>
                    <button onClick={() => openEditModal(note)} style={{ width: 32, height: 32, borderRadius: 10, background: 'transparent', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#8A8098' }}>
                      <Pencil size={15} />
                    </button>
                    <button onClick={() => setDeleteConfirm(note.id)} style={{ width: 32, height: 32, borderRadius: 10, background: 'transparent', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#8A8098' }}>
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ── ADD / EDIT MODAL ── */}
      {showModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(42,32,48,0.5)',
          display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
          zIndex: 50, paddingBottom: keyboardHeight,
        }}>
          {/* Sheet: flex column so header + scrollable body + sticky footer never overlap */}
          <div style={{
            background: '#FAF7F2', borderRadius: '24px 24px 0 0',
            width: '100%', maxWidth: 480,
            maxHeight: '92vh',
            display: 'flex', flexDirection: 'column',
            animation: 'slideUp 0.25s ease',
          }}>

            {/* HEADER — fixed height, never scrolls */}
            <div style={{
              padding: '20px 20px 16px',
              borderBottom: '1px solid rgba(122,102,144,0.12)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              flexShrink: 0,
            }}>
              <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 22, fontWeight: 700, color: '#2A2030', margin: 0 }}>
                {editingNote ? 'Edit Note' : 'New Note'}
              </h2>
              <button onClick={closeModal} style={{ width: 36, height: 36, borderRadius: 12, background: '#E8DDE8', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <X size={16} color="#7A6690" />
              </button>
            </div>

            {/* BODY — scrollable */}
            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 16, overflowY: 'auto', flex: 1 }}>
              <div>
                <label style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, fontWeight: 600, color: '#4A4058', display: 'block', marginBottom: 6 }}>Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Give your note a title…"
                  style={{ width: '100%', boxSizing: 'border-box', padding: '12px 16px', background: '#EDE6DB', border: '1.5px solid rgba(122,102,144,0.2)', borderRadius: 16, fontFamily: 'DM Sans, sans-serif', fontSize: 15, color: '#2A2030', outline: 'none' }}
                />
              </div>
              <div>
                <label style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, fontWeight: 600, color: '#4A4058', display: 'block', marginBottom: 8 }}>Category</label>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {CATEGORIES.map((cat) => {
                    const s = CATEGORY_STYLES[cat]
                    const selected = formData.category === cat
                    return (
                      <button key={cat} onClick={() => setFormData({ ...formData, category: cat })} style={{ padding: '6px 14px', borderRadius: 20, border: selected ? `1.5px solid ${s.dot}` : '1.5px solid transparent', background: selected ? s.bg : '#F0EAE0', color: selected ? s.text : '#9A90A8', fontFamily: 'DM Sans, sans-serif', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                        {cat}
                      </button>
                    )
                  })}
                </div>
              </div>
              <div>
                <label style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, fontWeight: 600, color: '#4A4058', display: 'block', marginBottom: 6 }}>
                  Link to a stage <span style={{ fontWeight: 400, color: '#8A8098' }}>(optional)</span>
                </label>
                <select
                  value={formData.stage_key || ''}
                  onChange={(e) => setFormData({ ...formData, stage_key: e.target.value || null })}
                  style={{ width: '100%', padding: '11px 14px', background: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.9)', borderRadius: 14, fontFamily: 'DM Sans, sans-serif', fontSize: 14, color: '#2A2030', outline: 'none', appearance: 'none', cursor: 'pointer' }}
                >
                  <option value="">No stage linked</option>
                  {STAGE_OPTIONS.map((s) => (
                    <option key={s.key} value={s.key}>{s.label}</option>
                  ))}
                </select>
                {formData.stage_key && (
                  <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 11, color: '#7A6690', margin: '5px 0 0', fontWeight: 600 }}>
                    This note will appear inside that stage on your Timeline
                  </p>
                )}
              </div>
              <div>
                <label style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, fontWeight: 600, color: '#4A4058', display: 'block', marginBottom: 6 }}>Note</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Write your note here…"
                  rows={5}
                  style={{ width: '100%', boxSizing: 'border-box', padding: '12px 16px', background: '#EDE6DB', border: '1.5px solid rgba(122,102,144,0.2)', borderRadius: 16, fontFamily: 'DM Sans, sans-serif', fontSize: 15, color: '#2A2030', outline: 'none', resize: 'vertical', lineHeight: 1.6 }}
                />
              </div>
            </div>

            {/* FOOTER — sticky, always visible */}
            <div style={{
              padding: '16px 20px',
              paddingBottom: `calc(16px + env(safe-area-inset-bottom, 0px))`,
              borderTop: '1px solid rgba(122,102,144,0.12)',
              display: 'flex', gap: 12,
              flexShrink: 0,
              background: '#FAF7F2',
            }}>
              <button
                onClick={closeModal}
                style={{ flex: 1, padding: '14px', background: '#EDE6DB', border: '1.5px solid rgba(122,102,144,0.2)', borderRadius: 16, fontFamily: 'DM Sans, sans-serif', fontWeight: 600, fontSize: 15, color: '#7A6690', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!formData.title.trim()}
                style={{ flex: 1, padding: '14px', background: formData.title.trim() ? '#7A6690' : '#C8C0D0', border: 'none', borderRadius: 16, fontFamily: 'DM Sans, sans-serif', fontWeight: 600, fontSize: 15, color: '#fff', cursor: formData.title.trim() ? 'pointer' : 'not-allowed', boxShadow: formData.title.trim() ? '0 4px 16px rgba(122,102,144,0.3)' : 'none' }}
              >
                Save Note
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── DELETE CONFIRM ── */}
      {deleteConfirm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(42,32,48,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '0 20px' }}>
          <div style={{ background: '#FAF7F2', borderRadius: 24, padding: '28px 24px', width: '100%', maxWidth: 360 }}>
            <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 22, fontWeight: 700, color: '#2A2030', marginBottom: 8 }}>Delete this note?</h2>
            <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 14, color: '#4A4058', marginBottom: 24 }}>This can't be undone.</p>
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => setDeleteConfirm(null)} style={{ flex: 1, padding: '13px', background: '#EDE6DB', border: '1.5px solid rgba(122,102,144,0.2)', borderRadius: 16, fontFamily: 'DM Sans, sans-serif', fontWeight: 600, fontSize: 15, color: '#7A6690', cursor: 'pointer' }}>Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm)} style={{ flex: 1, padding: '13px', background: '#C0392B', border: 'none', borderRadius: 16, fontFamily: 'DM Sans, sans-serif', fontWeight: 600, fontSize: 15, color: '#fff', cursor: 'pointer' }}>Delete</button>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }`}</style>
      <BottomNav />
    </div>
  )
}
