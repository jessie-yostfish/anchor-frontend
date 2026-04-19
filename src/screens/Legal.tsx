import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, ChevronDown, ChevronUp, FileText, Sparkles, Info, ExternalLink, BookOpen } from 'lucide-react'
import { BottomNav, AppHeader } from '../components'
import { supabase } from '../lib/supabase'
import { haptics } from '../lib/haptics'

interface LegalContent {
  id: string
  title: string
  category: CategoryType
  description: string
  full_content: string
  plain_language: string
  legal_reference: string
  related_topics: string[]
  external_link: string
  subsections: Subsection[]
  view_count: number
  created_at: string
  updated_at: string
}

interface Subsection {
  section: string
  title: string
  summary: string
}

type CategoryType = 'All' | 'Statutes & Laws' | 'Your Rights' | 'Court Procedures' | 'Forms & Templates'

const CATEGORIES: CategoryType[] = ['All', 'Statutes & Laws', 'Your Rights', 'Court Procedures', 'Forms & Templates']

const CATEGORY_MAP: Record<string, string> = {
  'Statutes & Laws': 'statutes',
  'Your Rights': 'rights',
  'Court Procedures': 'procedures',
  'Forms & Templates': 'forms',
}

const CATEGORY_STYLES: Record<string, { bg: string; text: string; dot: string }> = {
  statutes:   { bg: '#F4EFF8', text: '#7A6690', dot: '#7A6690' },
  rights:     { bg: '#F5ECD8', text: '#7A5A2A', dot: '#C8883A' },
  procedures: { bg: '#EAF4EE', text: '#4A7C59', dot: '#4A7C59' },
  forms:      { bg: '#EAF0F8', text: '#3A5A80', dot: '#3A5A80' },
  default:    { bg: '#F0EAE0', text: '#5A5065', dot: '#9A90A8' },
}

const getCategoryStyles = (category: string) =>
  CATEGORY_STYLES[category] || CATEGORY_STYLES.default

const getCategoryDisplayName = (category: string): string => {
  switch (category) {
    case 'statutes':   return 'Statutes & Laws'
    case 'rights':     return 'Your Rights'
    case 'procedures': return 'Court Procedures'
    case 'forms':      return 'Forms & Templates'
    default:           return category
  }
}

export function Legal() {
  const navigate = useNavigate()
  const [contents, setContents] = useState<LegalContent[]>([])
  const [filteredContents, setFilteredContents] = useState<LegalContent[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('All')
  const [expandedContentId, setExpandedContentId] = useState<string | null>(null)

  useEffect(() => { loadContents() }, [])
  useEffect(() => { filterContents() }, [contents, searchQuery, selectedCategory])

  const loadContents = async () => {
    try {
      const { data, error } = await supabase
        .from('legal_content')
        .select('*')
        .order('title', { ascending: true })
      if (error) throw error
      setContents(data || [])
    } catch (error) {
      console.error('Error loading legal content:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterContents = () => {
    let filtered = contents
    if (selectedCategory !== 'All') {
      const dbCategory = CATEGORY_MAP[selectedCategory]
      filtered = filtered.filter((c) => c.category === dbCategory)
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          c.full_content.toLowerCase().includes(q) ||
          c.plain_language.toLowerCase().includes(q)
      )
    }
    setFilteredContents(filtered)
  }

  const toggleExpanded = (id: string) => {
    haptics.light()
    setExpandedContentId(expandedContentId === id ? null : id)
  }

  const handleRelatedTopicClick = (topic: string) => {
    setSearchQuery(topic)
    setSelectedCategory('All')
    setExpandedContentId(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#EDE6DB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 44, height: 44, border: '3px solid #7A6690', borderTopColor: 'transparent', boxShadow: '0 0 12px rgba(122,102,144,0.2)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
          <p style={{ fontFamily: 'DM Sans, sans-serif', color: '#8A8098', fontSize: 14 }}>Loading legal library…</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#EDE6DB', display: 'flex', flexDirection: 'column' }}>
      <AppHeader />

      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 90 }}>
        <div style={{ maxWidth: 480, margin: '0 auto', padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Header */}
          <div>
            <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: 28, fontWeight: 700, color: '#2A2030', margin: '0 0 4px' }}>
              Legal Library
            </h1>
            <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 14, color: '#8A8098', margin: 0 }}>
              California dependency law and your rights
            </p>
          </div>

          {/* Quick links */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {/* Glossary */}
            <div
              onClick={() => { haptics.light(); navigate('/glossary') }}
              style={{
                background: '#FAF7F2', borderRadius: 20, padding: '14px 16px',
                display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer',
                border: '1px solid rgba(255,255,255,0.88)',
              }}
            >
              <div style={{ width: 40, height: 40, borderRadius: 12, background: '#EAF0F8', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Search size={18} color="#3A5A80" />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 14, fontWeight: 700, color: '#2A2030', margin: '0 0 2px' }}>Glossary</p>
                <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: '#8A8098', margin: 0 }}>Look up legal terms and definitions</p>
              </div>
              <ChevronDown size={16} color="#9A90A8" />
            </div>

            {/* Forms & Templates */}
            <div
              onClick={() => {
                haptics.light()
                setSelectedCategory('Forms & Templates')
                setSearchQuery('')
                setExpandedContentId(null)
                setTimeout(() => {
                  const el = document.getElementById('category-pills')
                  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }, 100)
              }}
              style={{
                background: '#FAF7F2', borderRadius: 20, padding: '14px 16px',
                display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer',
                border: '1px solid rgba(255,255,255,0.88)',
              }}
            >
              <div style={{ width: 40, height: 40, borderRadius: 12, background: '#F5ECD8', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <FileText size={18} color="#C8883A" />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 14, fontWeight: 700, color: '#2A2030', margin: '0 0 2px' }}>Forms & Templates</p>
                <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: '#8A8098', margin: 0 }}>Court forms, templates, and how to use them</p>
              </div>
              <ChevronDown size={16} color="#9A90A8" />
            </div>

            {/* Rights */}
            <div
              onClick={() => { haptics.light(); navigate('/rights') }}
              style={{
                background: '#FAF7F2', borderRadius: 20, padding: '14px 16px',
                display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer',
                border: '1px solid rgba(255,255,255,0.88)',
              }}
            >
              <div style={{ width: 40, height: 40, borderRadius: 12, background: '#E8DDE8', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Sparkles size={18} color="#7A6690" />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 14, fontWeight: 700, color: '#2A2030', margin: '0 0 2px' }}>Your Rights & Responsibilities</p>
                <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: '#8A8098', margin: 0 }}>Know your rights in dependency court</p>
              </div>
              <ChevronDown size={16} color="#9A90A8" />
            </div>
          </div>

          {/* Info banner */}
          <div style={{
            background: '#EAF0F8', borderRadius: 16, padding: '14px 16px',
            display: 'flex', gap: 10,
          }}>
            <Info size={16} color="#3A5A80" style={{ flexShrink: 0, marginTop: 2 }} />
            <div>
              <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, fontWeight: 700, color: '#2A3A50', margin: '0 0 4px' }}>
                This is general legal information
              </p>
              <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: '#3A5A80', margin: 0, lineHeight: 1.6 }}>
                This information is educational and not legal advice. Always talk to your attorney about your specific situation.
              </p>
            </div>
          </div>

          {/* Search */}
          <div style={{ position: 'relative' }}>
            <Search size={16} color="#9A90A8" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search legal topics…"
              style={{
                width: '100%', boxSizing: 'border-box',
                padding: '12px 16px 12px 40px',
                background: '#FAF7F2',
                border: '1.5px solid rgba(122,102,144,0.2)',
                borderRadius: 16,
                fontFamily: 'DM Sans, sans-serif', fontSize: 14, color: '#2A2030',
                outline: 'none',
              }}
            />
          </div>

          {/* Category pills */}
          <div id="category-pills" style={{ overflowX: 'auto', paddingBottom: 4 }}>
            <div style={{ display: 'flex', gap: 8, width: 'max-content' }}>
              {CATEGORIES.map((cat) => {
                const selected = selectedCategory === cat
                return (
                  <button
                    key={cat}
                    onClick={() => { haptics.light(); setSelectedCategory(cat); setExpandedContentId(null) }}
                    style={{
                      padding: '7px 16px', borderRadius: 20, whiteSpace: 'nowrap',
                      border: selected ? '1.5px solid #7A6690' : '1.5px solid rgba(122,102,144,0.2)',
                      background: selected ? '#7A6690' : '#FAF7F4',
                      fontFamily: 'DM Sans, sans-serif', fontSize: 13, fontWeight: 600,
                      color: selected ? '#fff' : '#5A5065',
                      cursor: 'pointer',
                    }}
                  >
                    {cat}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Content list */}
          {filteredContents.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 0' }}>
              <BookOpen size={40} color="#D0C8D8" style={{ margin: '0 auto 12px' }} />
              <p style={{ fontFamily: 'Fraunces, serif', fontSize: 18, fontWeight: 700, color: '#2A2030', margin: '0 0 6px' }}>
                {searchQuery ? `No results for "${searchQuery}"` : 'Nothing in this category'}
              </p>
              <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 14, color: '#8A8098', margin: 0 }}>
                {searchQuery ? 'Try a different search term' : 'Select a different category'}
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {filteredContents.map((content) => {
                const isExpanded = expandedContentId === content.id
                const catStyles = getCategoryStyles(content.category)

                return (
                  <div
                    key={content.id}
                    onClick={() => toggleExpanded(content.id)}
                    style={{
                      background: '#FAF7F2', borderRadius: 20,
                      border: `1px solid ${isExpanded ? 'rgba(122,102,144,0.25)' : 'rgba(122,102,144,0.12)'}`,
                      overflow: 'hidden', cursor: 'pointer',
                    }}
                  >
                    {/* Card header */}
                    <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                          <span style={{
                            fontFamily: 'DM Sans, sans-serif', fontSize: 10, fontWeight: 700,
                            background: catStyles.bg, color: catStyles.text,
                            borderRadius: 20, padding: '2px 10px',
                            display: 'flex', alignItems: 'center', gap: 4,
                          }}>
                            <span style={{ width: 5, height: 5, borderRadius: '50%', background: catStyles.dot, display: 'inline-block' }} />
                            {getCategoryDisplayName(content.category)}
                          </span>
                        </div>
                        <h3 style={{ fontFamily: 'Fraunces, serif', fontSize: 16, fontWeight: 700, color: '#2A2030', margin: '0 0 4px', lineHeight: 1.3 }}>
                          {content.title}
                        </h3>
                        <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: '#4A4058', margin: 0, lineHeight: 1.5 }}>
                          {content.description}
                        </p>
                      </div>
                      <div style={{ flexShrink: 0, marginTop: 2 }}>
                        {isExpanded
                          ? <ChevronUp size={18} color="#9A90A8" />
                          : <ChevronDown size={18} color="#9A90A8" />
                        }
                      </div>
                    </div>

                    {/* Expanded content */}
                    {isExpanded && (
                      <div style={{ padding: '0 16px 16px', display: 'flex', flexDirection: 'column', gap: 14 }} onClick={(e) => e.stopPropagation()}>
                        <div style={{ height: 1, background: 'rgba(122,102,144,0.12)' }} />

                        {/* Subsections */}
                        {content.subsections && content.subsections.length > 0 && (
                          <div>
                            <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, fontWeight: 700, color: '#8A8098', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 8px' }}>
                              Key sections
                            </p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                              {content.subsections.map((sub, i) => (
                                <div key={i} style={{ background: '#EDE6DB', borderRadius: 12, padding: '10px 12px' }}>
                                  <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, fontWeight: 700, color: '#7A6690', margin: '0 0 2px' }}>{sub.section}</p>
                                  <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, fontWeight: 600, color: '#2A2030', margin: '0 0 4px' }}>{sub.title}</p>
                                  <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: '#4A4058', margin: 0, lineHeight: 1.5 }}>{sub.summary}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Full content */}
                        {content.full_content && (
                          <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 14, color: '#4A4058', margin: 0, lineHeight: 1.7, whiteSpace: 'pre-line' }}>
                            {content.full_content}
                          </p>
                        )}

                        {/* Plain language */}
                        {content.plain_language && (
                          <div style={{ background: '#EAF4EE', borderRadius: 12, padding: '12px 14px' }}>
                            <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 11, fontWeight: 700, color: '#4A7C59', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 6px' }}>
                              In plain language
                            </p>
                            <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: '#2A3A30', margin: 0, lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                              {content.plain_language}
                            </p>
                          </div>
                        )}

                        {/* Legal reference */}
                        {content.legal_reference && (
                          <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 11, color: '#8A8098', fontStyle: 'italic', margin: 0 }}>
                            Reference: {content.legal_reference}
                          </p>
                        )}

                        {/* Related topics */}
                        {content.related_topics && content.related_topics.length > 0 && (
                          <div>
                            <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, fontWeight: 700, color: '#8A8098', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 8px' }}>
                              Related topics
                            </p>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                              {content.related_topics.map((topic) => (
                                <button
                                  key={topic}
                                  onClick={(e) => { e.stopPropagation(); handleRelatedTopicClick(topic) }}
                                  style={{
                                    padding: '5px 14px', borderRadius: 20,
                                    background: '#E8DDE8', color: '#7A6690',
                                    border: 'none', fontFamily: 'DM Sans, sans-serif',
                                    fontSize: 12, fontWeight: 600, cursor: 'pointer',
                                  }}
                                >
                                  {topic}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* External link */}
                        {content.external_link && (
                          <a
                            href={content.external_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            style={{
                              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                              padding: '13px', borderRadius: 16,
                              background: '#7A6690', color: '#fff',
                              fontFamily: 'DM Sans, sans-serif', fontSize: 14, fontWeight: 700,
                              textDecoration: 'none',
                              boxShadow: '0 4px 16px rgba(122,102,144,0.3)',
                            }}
                          >
                            <ExternalLink size={16} />
                            View Official Form
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {/* Result count */}
          {filteredContents.length > 0 && (
            <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: '#8A8098', textAlign: 'center', margin: 0 }}>
              Showing {filteredContents.length} {filteredContents.length === 1 ? 'topic' : 'topics'}
            </p>
          )}

          {/* Need more help */}
          <div style={{ background: '#FAF7F2', borderRadius: 20, padding: '16px 18px', border: '1px solid rgba(255,255,255,0.88)' }}>
            <h3 style={{ fontFamily: 'Fraunces, serif', fontSize: 18, fontWeight: 700, color: '#2A2030', margin: '0 0 14px' }}>
              Need more help?
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <a
                href="https://www.courts.ca.gov/selfhelp.htm"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '12px 14px', background: '#EDE6DB', borderRadius: 14,
                  textDecoration: 'none',
                  border: '1px solid rgba(255,255,255,0.88)',
                }}
              >
                <div>
                  <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, fontWeight: 700, color: '#2A2030', margin: '0 0 2px' }}>California Courts Self-Help Center</p>
                  <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: '#8A8098', margin: 0 }}>Official court resources and forms</p>
                </div>
                <ExternalLink size={14} color="#9A90A8" style={{ flexShrink: 0, marginLeft: 8 }} />
              </a>
              <a
                href="https://leginfo.legislature.ca.gov/"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '12px 14px', background: '#EDE6DB', borderRadius: 14,
                  textDecoration: 'none',
                  border: '1px solid rgba(255,255,255,0.88)',
                }}
              >
                <div>
                  <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, fontWeight: 700, color: '#2A2030', margin: '0 0 2px' }}>California Legislative Information</p>
                  <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: '#8A8098', margin: 0 }}>Full text of California laws</p>
                </div>
                <ExternalLink size={14} color="#9A90A8" style={{ flexShrink: 0, marginLeft: 8 }} />
              </a>
            </div>
          </div>

        </div>
      </div>

      <BottomNav />
    </div>
  )
}
