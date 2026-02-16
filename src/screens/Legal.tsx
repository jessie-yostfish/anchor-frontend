import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Search, ChevronDown, ChevronUp, FileText, Sparkles, Info, ExternalLink } from 'lucide-react'
import { Card, BottomNav, AppHeader } from '../components'
import { supabase } from '../lib/supabase'

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
  'Forms & Templates': 'forms'
}

const getCategoryColor = (category: string) => {
  switch (category) {
    case 'Statutes & Laws':
    case 'statutes':
      return 'bg-purple-100 text-purple-700'
    case 'Your Rights':
    case 'rights':
      return 'bg-orange-100 text-orange-700'
    case 'Court Procedures':
    case 'procedures':
      return 'bg-green-100 text-green-700'
    case 'Forms & Templates':
    case 'forms':
      return 'bg-teal-100 text-teal-700'
    default:
      return 'bg-gray-100 text-gray-700'
  }
}

const getCategoryDisplayName = (category: string): string => {
  switch (category) {
    case 'statutes':
      return 'Statutes & Laws'
    case 'rights':
      return 'Your Rights'
    case 'procedures':
      return 'Court Procedures'
    case 'forms':
      return 'Forms & Templates'
    default:
      return category
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

  useEffect(() => {
    loadContents()
  }, [])

  useEffect(() => {
    filterContents()
  }, [contents, searchQuery, selectedCategory])

  const loadContents = async () => {
    try {
      console.log('Loading legal content from database...')
      const { data, error } = await supabase
        .from('legal_content')
        .select('*')
        .order('title', { ascending: true })

      if (error) {
        console.error('Legal content fetch error:', error)
        throw error
      }

      console.log('Legal content loaded successfully:', data?.length, 'items')
      console.log('Sample content:', data?.[0])
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
      filtered = filtered.filter((content) => content.category === dbCategory)
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (content) =>
          content.title.toLowerCase().includes(query) ||
          content.description.toLowerCase().includes(query) ||
          content.full_content.toLowerCase().includes(query) ||
          content.plain_language.toLowerCase().includes(query)
      )
    }

    setFilteredContents(filtered)
  }

  const toggleContentExpanded = (id: string) => {
    console.log('Toggling content:', id)
    console.log('Currently expanded:', expandedContentId)
    const newExpandedId = expandedContentId === id ? null : id
    console.log('Setting expanded to:', newExpandedId)
    setExpandedContentId(newExpandedId)
  }

  const handleRelatedTopicClick = (topic: string) => {
    setSearchQuery(topic)
    setSelectedCategory('All')
    setExpandedContentId(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading legal library...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader />
      <div className="max-w-md mx-auto px-6 py-8 pb-24">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Legal Library</h1>
          <p className="text-gray-600">California dependency law and your rights</p>
        </div>

     <div className="grid grid-cols-1 gap-4 mb-6">
          <Card 
            className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => navigate('/glossary')}
          >
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                  <Search className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-gray-900 mb-1">Glossary</h3>
                <p className="text-sm text-gray-700">
                  Look up legal terms and definitions
                </p>
              </div>
              <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
            </div>
          </Card>

        <Card 
            className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => setSelectedCategory('Forms & Templates')}
          >
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-gray-900 mb-1">Forms & Templates</h3>
                <p className="text-sm text-gray-700">
                  View court forms, templates, and how to use them
                </p>
              </div>
              <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
            </div>
          </Card>

          <Card
            className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => navigate('/rights')}
          >
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-gray-900 mb-1">Your Rights & Responsibilities</h3>
                <p className="text-sm text-gray-700">
                  Know your rights as a parent or youth in dependency court
                </p>
              </div>
              <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
            </div>
          </Card>
        </div>

        <Card className="mb-6 bg-blue-50 border-blue-200">
          <div className="flex gap-3">
            <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-blue-900 mb-1">This is general legal information</h3>
              <p className="text-xs text-blue-800">
                This information is educational and not legal advice. Always talk to your attorney about your specific situation and how the law applies to your case.
              </p>
            </div>
          </div>
        </Card>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search legal topics..."
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
                  setExpandedContentId(null)
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

        {filteredContents.length === 0 ? (
          <div className="text-center py-16">
            <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              {searchQuery ? `No content found for "${searchQuery}"` : 'No content in this category'}
            </h3>
            <p className="text-gray-500">
              {searchQuery ? 'Try a different search term' : 'Select a different category'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredContents.map((content) => {
              const isExpanded = expandedContentId === content.id

              if (isExpanded) {
                console.log('Rendering expanded content:', content.title)
                console.log('Full content length:', content.full_content?.length)
                console.log('Plain language:', content.plain_language?.substring(0, 50))
                console.log('Subsections:', content.subsections)
              }

              return (
                <Card
                  key={content.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => toggleContentExpanded(content.id)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-2 mb-2 flex-wrap">
                        <h3 className="text-lg font-bold text-gray-900">{content.title}</h3>
                        <span
                          className={`inline-block px-2 py-1 text-xs font-semibold rounded ${getCategoryColor(
                            content.category
                          )}`}
                        >
                          {getCategoryDisplayName(content.category)}
                        </span>
                      </div>

                      <p className="text-sm text-gray-700 mb-2">{content.description}</p>

                      {isExpanded && (
                        <div className="mt-4 space-y-4">
                          {content.subsections && content.subsections.length > 0 && (
                            <div className="space-y-2">
                              <p className="text-sm font-semibold text-gray-700">Key Sections:</p>
                              {content.subsections.map((subsection, index) => (
                                <div key={index} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                                  <p className="text-sm font-semibold text-gray-900">{subsection.section}</p>
                                  <p className="text-sm font-medium text-gray-700">{subsection.title}</p>
                                  <p className="text-xs text-gray-600 mt-1">{subsection.summary}</p>
                                </div>
                              ))}
                            </div>
                          )}

                          <div className="prose prose-sm max-w-none">
                            <div className="whitespace-pre-line text-sm text-gray-700">
                              {content.full_content}
                            </div>
                          </div>

                          {content.plain_language && (
                            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                              <p className="text-sm font-semibold text-green-900 mb-2">In plain language:</p>
                              <p className="text-sm text-green-800 whitespace-pre-line">{content.plain_language}</p>
                            </div>
                          )}

                          {content.legal_reference && (
                            <div className="text-xs text-gray-500 italic">
                              Reference: {content.legal_reference}
                            </div>
                          )}

                          {content.related_topics && content.related_topics.length > 0 && (
                            <div>
                              <p className="text-sm font-semibold text-gray-700 mb-2">Related Topics:</p>
                              <div className="flex flex-wrap gap-2">
                                {content.related_topics.map((topic) => (
                                  <button
                                    key={topic}
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleRelatedTopicClick(topic)
                                    }}
                                    className="px-3 py-1 bg-purple-100 text-purple-700 text-sm font-medium rounded-full hover:bg-purple-200 transition-colors"
                                  >
                                    {topic}
                                  </button>
                                ))}
                              </div>
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

        {filteredContents.length > 0 && (
          <div className="mt-6 text-center text-sm text-gray-500">
            Showing {filteredContents.length} {filteredContents.length === 1 ? 'topic' : 'topics'}
          </div>
        )}

        <Card className="mt-8 bg-gray-50 border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Need More Help?</h3>
          <div className="space-y-3">
            <a
              href="https://www.courts.ca.gov/selfhelp.htm"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <div>
                <p className="text-sm font-semibold text-gray-900">California Courts Self-Help Center</p>
                <p className="text-xs text-gray-600">Official court resources and forms</p>
              </div>
              <ExternalLink className="w-5 h-5 text-gray-400" />
            </a>
            <a
              href="https://leginfo.legislature.ca.gov/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <div>
                <p className="text-sm font-semibold text-gray-900">California Legislative Information</p>
                <p className="text-xs text-gray-600">Full text of California laws</p>
              </div>
              <ExternalLink className="w-5 h-5 text-gray-400" />
            </a>
          </div>
        </Card>
      </div>

      <BottomNav />
    </div>
  )
}
