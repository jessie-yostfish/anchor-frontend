import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Plus,
  Search,
  FileText,
  Pencil,
  Trash2,
  X,
} from 'lucide-react'
import { Card, Button, Input, BottomNav, AppHeader } from '../components'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { haptics } from '../lib/haptics'

interface Note {
  id: string
  user_id: string
  title: string
  content: string
  category: 'Court' | 'Visit' | 'Meeting' | 'Personal' | 'Other'
  is_pinned: boolean
  created_at: string
  updated_at: string
}

type CategoryType = 'Court' | 'Visit' | 'Meeting' | 'Personal' | 'Other'

const CATEGORIES: CategoryType[] = ['Personal', 'Court', 'Visit', 'Meeting', 'Other']

const CATEGORY_COLORS = {
  Personal: 'bg-purple-100 text-purple-700',
  Court: 'bg-blue-100 text-blue-700',
  Visit: 'bg-green-100 text-green-700',
  Meeting: 'bg-amber-100 text-amber-700',
  Other: 'bg-gray-100 text-gray-700',
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
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'Personal' as CategoryType,
  })

  useEffect(() => {
    if (user) {
      loadNotes()
    }
  }, [user])

  useEffect(() => {
    filterNotes()
  }, [searchQuery, notes])

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
      setFilteredNotes(data || [])
    } catch (error) {
      console.error('Error loading notes:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterNotes = () => {
    if (!searchQuery.trim()) {
      setFilteredNotes(notes)
      return
    }

    const query = searchQuery.toLowerCase()
    const filtered = notes.filter(
      (note) =>
        note.title.toLowerCase().includes(query) ||
        note.content.toLowerCase().includes(query) ||
        note.category.toLowerCase().includes(query)
    )
    setFilteredNotes(filtered)
  }

  const openAddModal = () => {
    haptics.light()
    setEditingNote(null)
    setFormData({ title: '', content: '', category: 'Personal' })
    setShowModal(true)
  }

  const openEditModal = (note: Note) => {
    haptics.light()
    setEditingNote(note)
    setFormData({
      title: note.title,
      content: note.content,
      category: note.category,
    })
    setShowModal(true)
  }

  const closeModal = () => {
    haptics.light()
    setShowModal(false)
    setEditingNote(null)
    setFormData({ title: '', content: '', category: 'Personal' })
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
          })
          .eq('id', editingNote.id)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('notes')
          .insert({
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

  const truncateContent = (content: string, maxLength: number = 100) => {
    if (content.length <= maxLength) return content
    return content.substring(0, maxLength) + '...'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading notes...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader />
      <div className="max-w-md mx-auto px-6 py-8 pb-24">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Notes</h1>

          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium"
          >
            <Plus className="w-5 h-5" />
            Add Note
          </button>
        </div>

        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Notes 📝</h1>
          <p className="text-gray-600">Securely saved in your Anchor account</p>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search notes..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        {filteredNotes.length === 0 ? (
          <div className="text-center py-16">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              {searchQuery ? 'No notes found' : 'No notes yet'}
            </h3>
            <p className="text-gray-500">
              {searchQuery
                ? 'Try a different search term'
                : 'Add your first note to get started'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredNotes.map((note) => (
              <Card key={note.id} className="relative">
                <div className="mb-3">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${CATEGORY_COLORS[note.category]}`}
                  >
                    {note.category}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-gray-900 mb-2 pr-20">{note.title}</h3>

                {note.content && (
                  <p className="text-sm text-gray-600 mb-3">{truncateContent(note.content)}</p>
                )}

                <p className="text-xs text-gray-400">{formatDate(note.updated_at)}</p>

                <div className="absolute top-4 right-4 flex items-center gap-2">
                  <button
                    onClick={() => openEditModal(note)}
                    className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(note.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                {editingNote ? 'Edit Note' : 'Add New Note'}
              </h2>
              <button
                onClick={closeModal}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter note title..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value as CategoryType })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Write your note here..."
                  rows={8}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-y"
                />
              </div>
            </div>

            <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex gap-3">
              <Button variant="outline" onClick={closeModal} className="flex-1">
                Cancel
              </Button>
              <button
                onClick={handleSave}
                disabled={!formData.title.trim()}
                className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
              >
                Save Note
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-sm w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Delete this note?</h2>
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
                onClick={() => handleDelete(deleteConfirm)}
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
