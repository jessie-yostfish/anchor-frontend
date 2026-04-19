import { useState, useEffect } from 'react'
import { Search, ChevronDown, ChevronUp, BookOpen } from 'lucide-react'
import { BottomNav, AppHeader } from '../components'
import { supabase } from '../lib/supabase'

interface GlossaryTerm {
  id: string
  term: string
  category: CategoryType
  definition: string
  spanish_term: string
  spanish_definition: string
  related_terms: string[]
  source: string
  created_at: string
  updated_at: string
}

type CategoryType = 'All' | 'legal' | 'acronym' | 'role' | 'process' | 'general'
const CATEGORIES: CategoryType[] = ['All', 'legal', 'acronym', 'role', 'process', 'general']

const CATEGORY_LABELS: Record<CategoryType, string> = {
  All: 'All', legal: 'Legal', acronym: 'Acronyms', role: 'Roles', process: 'Process', general: 'General',
}

const CATEGORY_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  legal:   { bg: '#F4EFF8', text: '#7A6690', dot: '#7A6690' },
  acronym: { bg: '#EAF0F8', text: '#3A5A80', dot: '#3A5A80' },
  role:    { bg: '#EAF4EE', text: '#4A7C59', dot: '#4A7C59' },
  process: { bg: '#F5ECD8', text: '#7A5A2A', dot: '#C8883A' },
  general: { bg: '#F0EAE0', text: '#5A5065', dot: '#9A90A8' },
}

export function Glossary() {
  const [terms, setTerms] = useState<GlossaryTerm[]>([])
  const [filteredTerms, setFilteredTerms] = useState<GlossaryTerm[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('All')
  const [expandedTermId, setExpandedTermId] = useState<string | null>(null)

  useEffect(() => { loadTerms() }, [])

  useEffect(() => {
    let filtered = terms
    if (selectedCategory !== 'All') filtered = filtered.filter((t) => t.category === selectedCategory)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      filtered = filtered.filter((t) =>
        t.term?.toLowerCase().includes(q) ||
        t.definition?.toLowerCase().includes(q) ||
        t.spanish_term?.toLowerCase().includes(q) ||
        t.category?.toLowerCase().includes(q)
      )
    }
    setFilteredTerms(filtered)
  }, [terms, searchQuery, selectedCategory])

  const loadTerms = async () => {
    try {
      const { data, error } = await supabase.from('glossary_terms').select('*').order('term', { ascending: true })
      if (error) throw error
      setTerms(data || [])
    } catch (error) {
      console.error('Error loading glossary terms:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRelatedTermClick = (relatedTerm: string) => {
    setSearchQuery(relatedTerm)
    setSelectedCategory('All')
    setExpandedTermId(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#EDE6DB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 48, height: 48, borderRadius: '50%', border: '3px solid #E8DDE8', borderTopColor: '#7A6690', animation: 'spin 0.8s linear infinite', margin: '0 auto' }} />
        <p style={{ marginTop: 16, color: '#4A4058', fontFamily: 'DM Sans, sans-serif' }}>Loading glossary…</p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#EDE6DB' }}>
      <AppHeader title="Glossary" />

      <div style={{ maxWidth: 480, margin: '0 auto', padding: '24px 20px 100px' }}>

        {/* Header */}
        <div style={{ marginBottom: 20 }}>
          <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: 28, fontWeight: 700, color: '#2A2030', margin: 0 }}>
            Glossary
          </h1>
          <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 14, color: '#8A8098', marginTop: 4 }}>
            Plain-language definitions for court and legal terms
          </p>
        </div>

        {/* Search */}
        <div style={{ position: 'relative', marginBottom: 14 }}>
          <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#8A8098' }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search terms…"
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

        {/* Category filter pills */}
        <div style={{ overflowX: 'auto', marginBottom: 20 }}>
          <div style={{ display: 'flex', gap: 8, paddingBottom: 4 }}>
            {CATEGORIES.map((cat) => {
              const active = selectedCategory === cat
              const colors = CATEGORY_COLORS[cat]
              return (
                <button
                  key={cat}
                  onClick={() => { setSelectedCategory(cat); setExpandedTermId(null) }}
                  style={{
                    padding: '7px 14px', borderRadius: 20, whiteSpace: 'nowrap',
                    border: active && colors ? `1.5px solid ${colors.dot}` : active ? '1.5px solid #7A6690' : '1.5px solid transparent',
                    background: active && colors ? colors.bg : active ? '#F4EFF8' : '#FAF7F4',
                    color: active && colors ? colors.text : active ? '#7A6690' : '#9A90A8',
                    fontFamily: 'DM Sans, sans-serif', fontSize: 13, fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {CATEGORY_LABELS[cat]}
                </button>
              )
            })}
          </div>
        </div>

        {/* Result count */}
        <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: '#8A8098', marginBottom: 14 }}>
          {filteredTerms.length} {filteredTerms.length === 1 ? 'term' : 'terms'}
        </p>

        {/* Empty state */}
        {filteredTerms.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '64px 0' }}>
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#E8DDE8', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <BookOpen size={32} color="#7A6690" />
            </div>
            <h3 style={{ fontFamily: 'Fraunces, serif', fontSize: 20, fontWeight: 700, color: '#2A2030', marginBottom: 8 }}>
              {searchQuery ? `No results for "${searchQuery}"` : 'No terms in this category'}
            </h3>
            <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 14, color: '#8A8098' }}>
              {searchQuery ? 'Try a different search term' : 'Select a different category'}
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {filteredTerms.map((term) => {
              const isExpanded = expandedTermId === term.id
              const colors = CATEGORY_COLORS[term.category] || CATEGORY_COLORS.general

              return (
                <div
                  key={term.id}
                  onClick={() => setExpandedTermId(isExpanded ? null : term.id)}
                  style={{
                    background: '#FAF7F2',
                    border: `1px solid ${isExpanded ? 'rgba(122,102,144,0.25)' : 'rgba(122,102,144,0.12)'}`,
                    borderRadius: 20,
                    padding: '16px',
                    cursor: 'pointer',
                    transition: 'border-color 0.15s',
                  }}
                >
                  {/* Term row */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                        <h3 style={{ fontFamily: 'Fraunces, serif', fontSize: 17, fontWeight: 700, color: '#2A2030', margin: 0 }}>
                          {term.term}
                        </h3>
                        {term.category && (
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: 4,
                            background: colors.bg, color: colors.text,
                            borderRadius: 20, padding: '2px 8px',
                            fontFamily: 'DM Sans, sans-serif', fontSize: 11, fontWeight: 600,
                          }}>
                            <span style={{ width: 5, height: 5, borderRadius: '50%', background: colors.dot, display: 'inline-block' }} />
                            {CATEGORY_LABELS[term.category as CategoryType] || term.category}
                          </span>
                        )}
                      </div>

                      {/* Definition — truncated when collapsed */}
                      <p style={{
                        fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: '#4A4058',
                        margin: 0, lineHeight: 1.6,
                        display: '-webkit-box',
                        WebkitLineClamp: isExpanded ? undefined : 3,
                        WebkitBoxOrient: 'vertical' as const,
                        overflow: isExpanded ? 'visible' : 'hidden',
                      }}>
                        {term.definition}
                      </p>
                    </div>

                    <div style={{ flexShrink: 0, marginTop: 2 }}>
                      {isExpanded
                        ? <ChevronUp size={16} color="#9A90A8" />
                        : <ChevronDown size={16} color="#9A90A8" />
                      }
                    </div>
                  </div>

                  {/* Expanded content */}
                  {isExpanded && (
                    <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>

                      {/* Spanish translation */}
                      {term.spanish_term && term.spanish_definition && (
                        <div style={{ background: '#EAF0F8', border: '1px solid rgba(58,90,128,0.15)', borderRadius: 14, padding: '12px 14px' }}>
                          <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, fontWeight: 700, color: '#3A5A80', margin: '0 0 4px' }}>
                            En Español: {term.spanish_term}
                          </p>
                          <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: '#3A5A80', margin: 0, lineHeight: 1.5 }}>
                            {term.spanish_definition}
                          </p>
                        </div>
                      )}

                      {/* Related terms */}
                      {term.related_terms?.length > 0 && (
                        <div>
                          <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, fontWeight: 600, color: '#8A8098', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                            Related Terms
                          </p>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                            {term.related_terms.map((rt) => (
                              <button
                                key={rt}
                                onClick={(e) => { e.stopPropagation(); handleRelatedTermClick(rt) }}
                                style={{
                                  padding: '5px 12px', borderRadius: 20,
                                  background: '#F4EFF8', border: 'none',
                                  fontFamily: 'DM Sans, sans-serif', fontSize: 12, fontWeight: 600,
                                  color: '#7A6690', cursor: 'pointer',
                                }}
                              >
                                {rt}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Source */}
                      {term.source && (
                        <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 11, color: '#8A8098', fontStyle: 'italic', margin: 0 }}>
                          Source: {term.source}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {filteredTerms.length > 0 && (
          <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: '#8A8098', textAlign: 'center', marginTop: 24 }}>
            {filteredTerms.length} {filteredTerms.length === 1 ? 'term' : 'terms'} shown
          </p>
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <BottomNav />
    </div>
  )
}
