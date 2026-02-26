import { useState, useEffect } from 'react'
import {
  Search,
  Heart,
  Phone,
  MapPin,
  Clock,
  Globe,
  ExternalLink,
  AlertCircle,
  Info,
  BookOpen,
  Home,
  MessageCircle,
  Scale,
  Users,
  Briefcase,
  ShoppingBag,
  Baby,
  Car,
  MoreHorizontal,
  MessageSquare,
  Shield,
  GraduationCap,
  FileText,
  Gavel,
} from 'lucide-react'
import { Card, BottomNav, AppHeader } from '../components'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

interface Resource {
  id: string
  name: string
  description: string
  category: string
  type: string
  county: string
  address: string
  phone: string
  text_line: string
  hours: string
  website: string
  languages: string[]
  cost: string
  availability_note: string
  is_example: boolean
  click_count: number
  topic_category: string
  target_age_range: string
  geographic_scope: string
  user_role: string[]
  created_at: string
  updated_at: string
}

// ── PARENT VIEW CONFIG ──────────────────────────────────────────────
type ParentCategory = 'All' | 'Classes & Workshops' | 'Housing Assistance' | 'Counseling & Support' | 'Legal Services' | 'Parenting Programs'

const PARENT_CATEGORIES: ParentCategory[] = [
  'All',
  'Classes & Workshops',
  'Housing Assistance',
  'Counseling & Support',
  'Legal Services',
  'Parenting Programs',
]

const CA_COUNTIES = [
  'All Counties',
  'Los Angeles',
  'Orange County',
  'San Diego',
  'Sacramento',
  'Alameda',
  'Contra Costa',
  'Fresno',
  'Kern',
  'Riverside',
  'San Bernardino',
  'San Francisco',
  'San Joaquin',
  'Santa Clara',
  'Stanislaus',
  'Ventura',
]

// ── YOUTH VIEW CONFIG ──────────────────────────────────────────────
type YouthCategory =
  | 'All'
  | 'Rights in Foster Care'
  | 'Court Process for Youth'
  | 'Education Rights'
  | 'Mental Health Resources'
  | 'Legal Representation and CASA'
  | 'Emancipation / Aging Out'
  | 'Crisis and Hotline Resources'
  | 'General Foster Youth Resources'

const YOUTH_CATEGORIES: YouthCategory[] = [
  'All',
  'Crisis and Hotline Resources',
  'Rights in Foster Care',
  'Court Process for Youth',
  'Education Rights',
  'Mental Health Resources',
  'Legal Representation and CASA',
  'Emancipation / Aging Out',
  'General Foster Youth Resources',
]

// ── ICONS ──────────────────────────────────────────────
const getParentCategoryIcon = (category: string) => {
  switch (category) {
    case 'Classes & Workshops': return BookOpen
    case 'Housing Assistance': return Home
    case 'Counseling & Support': return MessageCircle
    case 'Legal Services': return Scale
    case 'Parenting Programs': return Users
    case 'Employment & Education': return Briefcase
    case 'Food & Basic Needs': return ShoppingBag
    case 'Childcare': return Baby
    case 'Transportation': return Car
    default: return MoreHorizontal
  }
}

const getYouthTopicIcon = (topic: string) => {
  switch (topic) {
    case 'Rights in Foster Care': return Shield
    case 'Court Process for Youth': return Gavel
    case 'Education Rights': return GraduationCap
    case 'Mental Health Resources': return MessageCircle
    case 'Legal Representation and CASA': return Scale
    case 'Emancipation / Aging Out': return Home
    case 'Crisis and Hotline Resources': return Heart
    case 'General Foster Youth Resources': return BookOpen
    default: return FileText
  }
}

const getYouthTopicColor = (topic: string) => {
  switch (topic) {
    case 'Rights in Foster Care': return 'bg-purple-100 text-purple-700'
    case 'Court Process for Youth': return 'bg-blue-100 text-blue-700'
    case 'Education Rights': return 'bg-green-100 text-green-700'
    case 'Mental Health Resources': return 'bg-teal-100 text-teal-700'
    case 'Legal Representation and CASA': return 'bg-indigo-100 text-indigo-700'
    case 'Emancipation / Aging Out': return 'bg-amber-100 text-amber-700'
    case 'Crisis and Hotline Resources': return 'bg-red-100 text-red-700'
    case 'General Foster Youth Resources': return 'bg-gray-100 text-gray-700'
    default: return 'bg-gray-100 text-gray-700'
  }
}

export function Resources() {
  const { profile } = useAuth()
  const isYouth = profile?.role === 'youth'

  const [resources, setResources] = useState<Resource[]>([])
  const [filteredResources, setFilteredResources] = useState<Resource[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  // Parent filters
  const [selectedParentCategory, setSelectedParentCategory] = useState<ParentCategory>('All')
  const [selectedCounty, setSelectedCounty] = useState('All Counties')

  // Youth filters
  const [selectedYouthCategory, setSelectedYouthCategory] = useState<YouthCategory>('All')

  useEffect(() => {
    loadResources()
  }, [profile?.role])

  useEffect(() => {
    filterResources()
  }, [resources, searchQuery, selectedParentCategory, selectedCounty, selectedYouthCategory])

  const loadResources = async () => {
    try {
      setLoading(true)
      const role = profile?.role || 'parent'

      const { data, error: fetchError } = await supabase
        .from('resources')
        .select('*')
        .contains('user_role', [role])
        .order('name', { ascending: true })

      if (fetchError) throw fetchError

      setResources(data || [])
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load resources')
    } finally {
      setLoading(false)
    }
  }

  const filterResources = () => {
    let filtered = resources

    if (isYouth) {
      if (selectedYouthCategory !== 'All') {
        filtered = filtered.filter((r) => r.topic_category === selectedYouthCategory)
      }
    } else {
      if (selectedParentCategory !== 'All') {
        filtered = filtered.filter((r) => r.category === selectedParentCategory)
      }
      if (selectedCounty !== 'All Counties') {
        filtered = filtered.filter((r) => r.county === selectedCounty)
      }
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (r) =>
          r.name?.toLowerCase().includes(query) ||
          r.description?.toLowerCase().includes(query) ||
          r.topic_category?.toLowerCase().includes(query) ||
          r.category?.toLowerCase().includes(query)
      )
    }

    setFilteredResources(filtered)
  }

  const handleWebsiteClick = async (resourceId: string, website: string) => {
    try {
      const current = resources.find((r) => r.id === resourceId)
      await supabase
        .from('resources')
        .update({ click_count: (current?.click_count || 0) + 1 })
        .eq('id', resourceId)
    } catch (_) {}
    window.open(website, '_blank', 'noopener,noreferrer')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading resources...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center px-6">
          <div className="bg-red-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Unable to Load Resources</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => { setLoading(true); setError(null); loadResources() }}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader />
      <div className="max-w-md mx-auto px-6 py-8 pb-24">

        {/* ── HEADER ── */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {isYouth ? 'Your Resources' : 'Local Resources'}
          </h1>
          <p className="text-gray-600">
            {isYouth
              ? 'Rights, legal help, education, and crisis support for foster youth'
              : 'Find classes, services, and support in your area'}
          </p>
        </div>

        {/* ── CRISIS CARD — shown for all roles ── */}
        <Card className="mb-6 bg-gradient-to-br from-red-50 to-red-100 border-red-300">
          <h2 className="text-xl font-bold text-red-900 mb-4">Need Help Right Now?</h2>
          <div className="space-y-3">

            {isYouth ? (
              <>
                {/* Cal-FURS — foster youth specific */}
                <div className="p-4 bg-white rounded-lg border border-red-200">
                  <div className="flex items-start gap-3">
                    <Heart className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 mb-1">Cal-FURS — Foster Youth Crisis Line</h3>
                      <p className="text-sm text-gray-700 mb-2">
                        24/7 crisis support specifically for foster youth and caregivers. Trained counselors — a mobile response team can come to you.
                      </p>
                      <a
                        href="tel:1-833-939-3877"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-semibold"
                      >
                        <Phone className="w-4 h-4" />
                        Call or Text 1-833-939-3877
                      </a>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-white rounded-lg border border-red-200">
                  <h3 className="font-bold text-gray-900 mb-2">More Crisis Support</h3>
                  <div className="space-y-1 text-sm">
                    <p className="text-gray-700">
                      <span className="font-semibold">988 Crisis Line:</span>{' '}
                      <a href="tel:988" className="text-red-700 font-semibold underline">Call or text 988</a>
                    </p>
                    <p className="text-gray-700">
                      <span className="font-semibold">Crisis Text Line:</span>{' '}
                      <a href="sms:741741&body=HOME" className="text-red-700 font-semibold underline">Text HOME to 741741</a>
                    </p>
                    <p className="text-gray-700">
                      <span className="font-semibold">California Youth Crisis Line:</span>{' '}
                      <a href="tel:1-800-843-5200" className="text-red-700 font-semibold underline">1-800-843-5200</a>
                    </p>
                    <p className="text-gray-700">
                      <span className="font-semibold">Foster Care Ombudsperson:</span>{' '}
                      <a href="tel:1-877-846-1602" className="text-red-700 font-semibold underline">1-877-846-1602</a>
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="p-4 bg-white rounded-lg border border-red-200">
                  <div className="flex items-start gap-3 mb-2">
                    <Heart className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 mb-1">Dial 211</h3>
                      <p className="text-sm text-gray-700 mb-2">
                        Free, confidential help 24/7. Find food, housing, healthcare, childcare, and more.
                      </p>
                      <a
                        href="tel:211"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-semibold"
                      >
                        <Phone className="w-4 h-4" />
                        Call 211 Now
                      </a>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-white rounded-lg border border-red-200">
                  <div className="flex items-start gap-3">
                    <Phone className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 mb-1">CA Parent & Caregiver Warmline</h3>
                      <p className="text-sm text-gray-700 mb-2">
                        Talk to a trained parent about parenting challenges, support groups, and resources.
                      </p>
                      <a href="tel:1-855-627-6437" className="text-sm font-semibold text-red-700 hover:text-red-800 underline">
                        1-855-627-6437 (Mon–Fri 8am–5pm PST)
                      </a>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-white rounded-lg border border-red-200">
                  <h3 className="font-bold text-gray-900 mb-2">Crisis Support</h3>
                  <div className="space-y-1 text-sm">
                    <p className="text-gray-700">
                      <span className="font-semibold">Crisis Text Line:</span>{' '}
                      <a href="sms:741741&body=HOME" className="text-red-700 underline">Text HOME to 741741</a>
                    </p>
                    <p className="text-gray-700">
                      <span className="font-semibold">Suicide Hotline:</span>{' '}
                      <a href="tel:988" className="text-red-700 underline">988</a>
                    </p>
                    <p className="text-gray-700">
                      <span className="font-semibold">Domestic Violence:</span>{' '}
                      <a href="tel:1-800-799-7233" className="text-red-700 underline">1-800-799-7233</a>
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        </Card>

        {/* ── COUNTY MENTAL HEALTH (parent/supporter only) ── */}
        {!isYouth && (
          <Card className="mb-6 bg-blue-50 border-blue-200">
            <h3 className="text-lg font-bold text-gray-900 mb-3">County Mental Health Lines</h3>
            <div className="space-y-2 text-sm">
              {[
                ['Los Angeles', '800-854-7771'],
                ['Orange County', '855-625-4657'],
                ['San Diego', '888-724-7240'],
                ['Sacramento', '916-875-1055'],
              ].map(([county, number]) => (
                <div key={county} className="flex justify-between">
                  <span className="text-gray-700">{county}:</span>
                  <a href={`tel:${number}`} className="font-semibold text-blue-700 hover:text-blue-800">{number}</a>
                </div>
              ))}
            </div>
            <p className="text-xs text-blue-800 mt-3 italic">Not your county? Dial 211 for local resources</p>
          </Card>
        )}

        {/* ── SEARCH ── */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isYouth ? 'Search rights, court, education...' : 'Search resources...'}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        {/* ── FILTERS ── */}
        {isYouth ? (
          // Youth: topic category chips
          <div className="mb-4 overflow-x-auto">
            <div className="flex gap-2 pb-2">
              {YOUTH_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedYouthCategory(cat)}
                  className={`px-4 py-2 rounded-lg whitespace-nowrap text-sm font-medium transition-colors ${
                    selectedYouthCategory === cat
                      ? 'bg-purple-600 text-white'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        ) : (
          // Parent: county dropdown + category chips
          <>
            <div className="mb-4">
              <select
                value={selectedCounty}
                onChange={(e) => setSelectedCounty(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
              >
                {CA_COUNTIES.map((county) => (
                  <option key={county} value={county}>{county}</option>
                ))}
              </select>
            </div>
            <div className="mb-4 overflow-x-auto">
              <div className="flex gap-2 pb-2">
                {PARENT_CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedParentCategory(cat)}
                    className={`px-4 py-2 rounded-lg whitespace-nowrap text-sm font-medium transition-colors ${
                      selectedParentCategory === cat
                        ? 'bg-purple-600 text-white'
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ── RESULT COUNT ── */}
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            {filteredResources.length} {filteredResources.length === 1 ? 'resource' : 'resources'} found
          </p>
        </div>

        {/* ── RESOURCE LIST ── */}
        {filteredResources.length === 0 ? (
          <Card className="text-center py-8">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-gray-900 mb-2">No resources found</h3>
            <p className="text-sm text-gray-600 mb-4">Try adjusting your filters or search terms</p>
            {isYouth ? (
              <a
                href="tel:1-877-846-1602"
                className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-semibold"
              >
                <Phone className="w-4 h-4" />
                Call Ombudsperson
              </a>
            ) : (
              <a
                href="tel:211"
                className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-semibold"
              >
                <Phone className="w-4 h-4" />
                Call 211 for Help
              </a>
            )}
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredResources.map((resource) => {
              const IconComponent = isYouth
                ? getYouthTopicIcon(resource.topic_category)
                : getParentCategoryIcon(resource.category)

              const topicColor = isYouth ? getYouthTopicColor(resource.topic_category) : 'bg-purple-100 text-purple-700'

              return (
                <Card key={resource.id} className="hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="flex-shrink-0">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        isYouth ? topicColor : 'bg-purple-100'
                      }`}>
                        <IconComponent className={`w-5 h-5 ${isYouth ? '' : 'text-purple-600'}`} />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-gray-900 mb-1">{resource.name}</h3>
                      <p className="text-sm text-gray-700 mb-3">{resource.description}</p>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-2 mb-3">
                        {isYouth && resource.topic_category && (
                          <span className={`px-2 py-1 rounded text-xs font-medium ${topicColor}`}>
                            {resource.topic_category}
                          </span>
                        )}
                        {!isYouth && resource.category && (
                          <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium">
                            {resource.category}
                          </span>
                        )}
                        {resource.target_age_range && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs font-medium">
                            {resource.target_age_range}
                          </span>
                        )}
                        {resource.geographic_scope && resource.geographic_scope !== 'Statewide' && resource.geographic_scope !== 'National' && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                            {resource.geographic_scope}
                          </span>
                        )}
                        {!isYouth && resource.cost && (
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            resource.cost === 'Free' ? 'bg-green-100 text-green-700' :
                            resource.cost === 'Sliding Scale' ? 'bg-blue-100 text-blue-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {resource.cost}
                          </span>
                        )}
                      </div>

                      {/* Parent-only fields */}
                      {!isYouth && (
                        <div className="space-y-2 mb-3">
                          {resource.address && (
                            <div className="flex items-start gap-2 text-sm text-gray-600">
                              <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
                              <span>{resource.address}</span>
                            </div>
                          )}
                          {resource.hours && (
                            <div className="flex items-start gap-2 text-sm text-gray-600">
                              <Clock className="w-4 h-4 flex-shrink-0 mt-0.5" />
                              <span>{resource.hours}</span>
                            </div>
                          )}
                          {resource.languages && resource.languages.length > 0 && (
                            <div className="flex items-start gap-2 text-sm text-gray-600">
                              <Globe className="w-4 h-4 flex-shrink-0 mt-0.5" />
                              <span>Languages: {resource.languages.join(', ')}</span>
                            </div>
                          )}
                          {resource.availability_note && (
                            <div className="flex items-start gap-2 text-xs text-amber-700">
                              <AlertCircle className="w-3 h-3 flex-shrink-0 mt-0.5" />
                              <span>{resource.availability_note}</span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Action buttons */}
                      <div className="flex flex-wrap gap-2">
                        {resource.phone && (
                          <a
                            href={`tel:${resource.phone}`}
                            className="inline-flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-semibold"
                          >
                            <Phone className="w-4 h-4" />
                            {resource.phone}
                          </a>
                        )}
                        {resource.text_line && (
                          <a
                            href={`sms:${resource.text_line.split(' ')[0]}`}
                            className="inline-flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold"
                          >
                            <MessageSquare className="w-4 h-4" />
                            Text
                          </a>
                        )}
                        {resource.website && (
                          <button
                            onClick={() => handleWebsiteClick(resource.id, resource.website)}
                            className="inline-flex items-center gap-2 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-semibold"
                          >
                            <ExternalLink className="w-4 h-4" />
                            {resource.type?.includes('PDF') ? 'Open PDF' : 'Visit Website'}
                          </button>
                        )}
                      </div>

                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  )
}
