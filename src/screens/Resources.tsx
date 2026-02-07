import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
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
} from 'lucide-react'
import { Card, BottomNav, AppHeader } from '../components'
import { supabase } from '../lib/supabase'

interface Resource {
  id: string
  name: string
  description: string
  category: string
  type: string
  county: string
  address: string
  phone: string
  hours: string
  website: string
  languages: string[]
  cost: string
  availability_note: string
  is_example: boolean
  click_count: number
  created_at: string
  updated_at: string
}

type Category = 'All' | 'Classes & Workshops' | 'Housing Assistance' | 'Counseling & Support' | 'Legal Services' | 'Parenting Programs'

const CATEGORIES: Category[] = [
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

const TYPES = [
  'All Types',
  'Parenting Education',
  'Family Counseling',
  'Substance Abuse Treatment',
  'Domestic Violence Services',
  'Housing Search',
  'Legal Aid',
  'Anger Management',
  'Job Training',
  'Food Assistance',
  'Transportation',
  'Peer Support',
]

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'Classes & Workshops':
      return BookOpen
    case 'Housing Assistance':
      return Home
    case 'Counseling & Support':
      return MessageCircle
    case 'Legal Services':
      return Scale
    case 'Parenting Programs':
      return Users
    case 'Employment & Education':
      return Briefcase
    case 'Food & Basic Needs':
      return ShoppingBag
    case 'Childcare':
      return Baby
    case 'Transportation':
      return Car
    default:
      return MoreHorizontal
  }
}

export function Resources() {
  const navigate = useNavigate()
  const [resources, setResources] = useState<Resource[]>([])
  const [filteredResources, setFilteredResources] = useState<Resource[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<Category>('All')
  const [selectedCounty, setSelectedCounty] = useState('All Counties')
  const [selectedType, setSelectedType] = useState('All Types')

  useEffect(() => {
    loadResources()
  }, [])

  useEffect(() => {
    filterResources()
  }, [resources, searchQuery, selectedCategory, selectedCounty, selectedType])

  const loadResources = async () => {
    try {
      console.log('Loading resources from database...')
      const { data, error: fetchError } = await supabase
        .from('resources')
        .select('*')
        .order('name', { ascending: true })

      if (fetchError) {
        console.error('Resources fetch error:', fetchError)
        throw fetchError
      }

      console.log('Resources loaded successfully:', data?.length, 'resources')
      console.log('Sample resource:', data?.[0])
      setResources(data || [])
      setError(null)
    } catch (err) {
      console.error('Error loading resources:', err)
      setError(err instanceof Error ? err.message : 'Failed to load resources')
    } finally {
      setLoading(false)
    }
  }

  const filterResources = () => {
    console.log('Filtering resources...')
    console.log('Total resources:', resources.length)
    console.log('Search query:', searchQuery)
    console.log('Selected category:', selectedCategory)
    console.log('Selected county:', selectedCounty)
    console.log('Selected type:', selectedType)

    let filtered = resources

    if (selectedCategory !== 'All') {
      filtered = filtered.filter((resource) => resource.category === selectedCategory)
      console.log('After category filter:', filtered.length)
    }

    if (selectedCounty !== 'All Counties') {
      filtered = filtered.filter((resource) => resource.county === selectedCounty)
      console.log('After county filter:', filtered.length)
    }

    if (selectedType !== 'All Types') {
      filtered = filtered.filter((resource) => resource.type === selectedType)
      console.log('After type filter:', filtered.length)
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (resource) =>
          resource.name.toLowerCase().includes(query) ||
          resource.description.toLowerCase().includes(query) ||
          resource.type.toLowerCase().includes(query) ||
          resource.category.toLowerCase().includes(query)
      )
      console.log('After search filter:', filtered.length)
    }

    console.log('Final filtered resources:', filtered.length)
    setFilteredResources(filtered)
  }

  const handleWebsiteClick = async (resourceId: string, website: string) => {
    try {
      const currentResource = resources.find((r) => r.id === resourceId)
      const newClickCount = (currentResource?.click_count || 0) + 1

      await supabase
        .from('resources')
        .update({ click_count: newClickCount })
        .eq('id', resourceId)

      window.open(website, '_blank', 'noopener,noreferrer')
    } catch (error) {
      console.error('Error tracking click:', error)
      window.open(website, '_blank', 'noopener,noreferrer')
    }
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
            onClick={() => {
              setLoading(true)
              setError(null)
              loadResources()
            }}
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
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Local Resources</h1>
          <p className="text-gray-600">Find classes, services, and support in your area</p>
        </div>

        <Card className="mb-6 bg-gradient-to-br from-red-50 to-red-100 border-red-300">
          <h2 className="text-xl font-bold text-red-900 mb-4">Need Help Right Now?</h2>

          <div className="space-y-4">
            <div className="p-4 bg-white rounded-lg border border-red-200">
              <div className="flex items-start gap-3 mb-2">
                <Heart className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 mb-1">Dial 211</h3>
                  <p className="text-sm text-gray-700 mb-2">
                    Free, confidential help 24/7. Find food, housing, healthcare, childcare, and more. Available in
                    multiple languages.
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
                  <a
                    href="tel:1-855-627-6437"
                    className="text-sm font-semibold text-red-700 hover:text-red-800 underline"
                  >
                    1-855-627-6437 (Mon-Fri 8am-5pm PST)
                  </a>
                </div>
              </div>
            </div>

            <div className="p-4 bg-white rounded-lg border border-red-200">
              <h3 className="font-bold text-gray-900 mb-2">Crisis Support</h3>
              <div className="space-y-1 text-sm">
                <p className="text-gray-700">
                  <span className="font-semibold">Crisis Text Line:</span> Text HOME to{' '}
                  <a href="sms:741741&body=HOME" className="text-red-700 hover:text-red-800 underline">
                    741741
                  </a>
                </p>
                <p className="text-gray-700">
                  <span className="font-semibold">National Suicide Hotline:</span>{' '}
                  <a href="tel:988" className="text-red-700 hover:text-red-800 underline">
                    988
                  </a>
                </p>
                <p className="text-gray-700">
                  <span className="font-semibold">Domestic Violence:</span>{' '}
                  <a href="tel:1-800-799-7233" className="text-red-700 hover:text-red-800 underline">
                    1-800-799-7233
                  </a>
                </p>
              </div>
            </div>
          </div>
        </Card>

        <Card className="mb-6 bg-blue-50 border-blue-200">
          <h3 className="text-lg font-bold text-gray-900 mb-3">County Mental Health Lines</h3>
          <p className="text-sm text-gray-700 mb-3">
            Call your county's mental health line for local crisis support and resources
          </p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-700">Los Angeles:</span>
              <a href="tel:800-854-7771" className="font-semibold text-blue-700 hover:text-blue-800">
                (800) 854-7771
              </a>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">Orange County:</span>
              <a href="tel:855-625-4657" className="font-semibold text-blue-700 hover:text-blue-800">
                (855) 625-4657
              </a>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">San Diego:</span>
              <a href="tel:888-724-7240" className="font-semibold text-blue-700 hover:text-blue-800">
                (888) 724-7240
              </a>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">Sacramento:</span>
              <a href="tel:916-875-1055" className="font-semibold text-blue-700 hover:text-blue-800">
                (916) 875-1055
              </a>
            </div>
          </div>
          <p className="text-xs text-blue-800 mt-3 italic">Not your county? Dial 211 for local resources</p>
        </Card>

        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search resources..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <select
            value={selectedCounty}
            onChange={(e) => setSelectedCounty(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
          >
            {CA_COUNTIES.map((county) => (
              <option key={county} value={county}>
                {county}
              </option>
            ))}
          </select>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
          >
            {TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4 overflow-x-auto">
          <div className="flex gap-2 pb-2">
            {CATEGORIES.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg whitespace-nowrap text-sm font-medium transition-colors ${
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

        <div className="mb-4">
          <p className="text-sm text-gray-600">
            {filteredResources.length} {filteredResources.length === 1 ? 'resource' : 'resources'} found
          </p>
        </div>

        {filteredResources.length === 0 ? (
          <Card className="text-center py-8">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-gray-900 mb-2">No resources found matching your criteria</h3>
            <p className="text-sm text-gray-600 mb-4">Try adjusting your filters or search terms</p>
            <a
              href="tel:211"
              className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-semibold"
            >
              <Phone className="w-4 h-4" />
              Call 211 for Help
            </a>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredResources.map((resource) => {
              const IconComponent = getCategoryIcon(resource.category)

              return (
                <Card key={resource.id} className="hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <IconComponent className="w-5 h-5 text-purple-600" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-gray-900 mb-1">{resource.name}</h3>
                      <p className="text-sm text-gray-700 mb-2">{resource.description}</p>

                      {resource.is_example && (
                        <div className="mb-3 p-2 bg-blue-50 rounded border border-blue-200 flex items-start gap-2">
                          <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                          <p className="text-xs text-blue-800">
                            Example resource • Confirm details before visiting or enrolling
                          </p>
                        </div>
                      )}

                      <div className="space-y-2 mb-3">
                        {resource.address && (
                          <div className="flex items-start gap-2 text-sm text-gray-600">
                            <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
                            <span>{resource.address}</span>
                          </div>
                        )}

                        {resource.phone && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Phone className="w-4 h-4 flex-shrink-0" />
                            <a href={`tel:${resource.phone}`} className="text-purple-700 hover:text-purple-800 font-semibold">
                              {resource.phone}
                            </a>
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

                      <div className="flex flex-wrap gap-2 mb-3">
                        <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium">
                          {resource.category}
                        </span>
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            resource.cost === 'Free'
                              ? 'bg-green-100 text-green-700'
                              : resource.cost === 'Sliding Scale'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {resource.cost}
                        </span>
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium">
                          {resource.county}
                        </span>
                      </div>

                      {resource.website && (
                        <button
                          onClick={() => handleWebsiteClick(resource.id, resource.website)}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-semibold"
                        >
                          <ExternalLink className="w-4 h-4" />
                          Visit Website
                        </button>
                      )}
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
