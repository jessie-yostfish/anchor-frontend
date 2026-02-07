import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Search, ChevronDown, ChevronUp } from 'lucide-react'
import { Card, BottomNav, AppHeader } from '../components'
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

type CategoryType = 'All' | 'Legal Terms' | 'Acronyms' | 'Roles' | 'Process' | 'General'

const CATEGORIES: CategoryType[] = ['All', 'Legal Terms', 'Acronyms', 'Roles', 'Process', 'General']

const getCategoryColor = (category: string) => {
  switch (category) {
    case 'Legal Terms':
      return 'bg-purple-100 text-purple-700'
    case 'Acronyms':
      return 'bg-blue-100 text-blue-700'
    case 'Roles':
      return 'bg-green-100 text-green-700'
    case 'Process':
      return 'bg-amber-100 text-amber-700'
    case 'General':
      return 'bg-gray-100 text-gray-700'
    default:
      return 'bg-gray-100 text-gray-700'
  }
}

export function Glossary() {
  const navigate = useNavigate()
  const [terms, setTerms] = useState<GlossaryTerm[]>([])
  const [filteredTerms, setFilteredTerms] = useState<GlossaryTerm[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('All')
  const [expandedTermId, setExpandedTermId] = useState<string | null>(null)

  useEffect(() => {
    loadTerms()
  }, [])

  useEffect(() => {
    filterTerms()
  }, [terms, searchQuery, selectedCategory])

  const loadTerms = async () => {
    try {
      const { data, error } = await supabase
        .from('glossary_terms')
        .select('*')
        .order('term', { ascending: true })

      if (error) throw error

      setTerms(data || [])
    } catch (error) {
      console.error('Error loading glossary terms:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterTerms = () => {
    let filtered = terms

    if (selectedCategory !== 'All') {
      filtered = filtered.filter((term) => term.category === selectedCategory)
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (term) =>
          term.term.toLowerCase().includes(query) ||
          term.definition.toLowerCase().includes(query) ||
          term.spanish_term.toLowerCase().includes(query) ||
          term.category.toLowerCase().includes(query)
      )
    }

    setFilteredTerms(filtered)
  }

  const toggleTermExpanded = (id: string) => {
    setExpandedTermId(expandedTermId === id ? null : id)
  }

  const handleRelatedTermClick = (relatedTerm: string) => {
    setSearchQuery(relatedTerm)
    setSelectedCategory('All')
    setExpandedTermId(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading glossary...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader />
      <div className="max-w-md mx-auto px-6 py-8 pb-24">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Glossary 📖</h1>
          <p className="text-gray-600">Understand the terms used in dependency court</p>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search terms..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        <div className="mb-6 overflow-x-auto scrollbar-hide">
          <div className="flex gap-2 pb-2">
            {CATEGORIES.map((category) => (
              <button
                key={category}
                onClick={() => {
                  setSelectedCategory(category)
                  setExpandedTermId(null)
                }}
                className={`px-4 py-2 rounded-full font-medium text-sm whitespace-nowrap transition-colors ${
                  selectedCategory === category
                    ? 'bg-purple-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {filteredTerms.length === 0 ? (
          <div className="text-center py-16">
            <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              {searchQuery ? `No terms found for "${searchQuery}"` : 'No terms in this category'}
            </h3>
            <p className="text-gray-500">
              {searchQuery ? 'Try a different search term' : 'Select a different category'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTerms.map((term) => {
              const isExpanded = expandedTermId === term.id

              return (
                <Card
                  key={term.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => toggleTermExpanded(term.id)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-2 mb-2">
                        <h3 className="text-lg font-bold text-gray-900">{term.term}</h3>
                        <span
                          className={`inline-block px-2 py-1 text-xs font-semibold rounded ${getCategoryColor(
                            term.category
                          )}`}
                        >
                          {term.category}
                        </span>
                      </div>

                      <p
                        className={`text-sm text-gray-700 ${
                          isExpanded ? '' : 'line-clamp-3'
                        }`}
                      >
                        {term.definition}
                      </p>

                      {isExpanded && (
                        <div className="mt-4 space-y-4">
                          {term.spanish_term && term.spanish_definition && (
                            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                              <p className="text-sm font-semibold text-blue-900 mb-1">
                                En Español: {term.spanish_term}
                              </p>
                              <p className="text-sm text-blue-800">{term.spanish_definition}</p>
                            </div>
                          )}

                          {term.related_terms && term.related_terms.length > 0 && (
                            <div>
                              <p className="text-sm font-semibold text-gray-700 mb-2">
                                Related Terms:
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {term.related_terms.map((relatedTerm) => (
                                  <button
                                    key={relatedTerm}
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleRelatedTermClick(relatedTerm)
                                    }}
                                    className="px-3 py-1 bg-purple-100 text-purple-700 text-sm font-medium rounded-full hover:bg-purple-200 transition-colors"
                                  >
                                    {relatedTerm}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}

                          {term.source && (
                            <div className="text-xs text-gray-500 italic">
                              Source: {term.source}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex-shrink-0">
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        )}

        {filteredTerms.length > 0 && (
          <div className="mt-6 text-center text-sm text-gray-500">
            Showing {filteredTerms.length} {filteredTerms.length === 1 ? 'term' : 'terms'}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  )
}
