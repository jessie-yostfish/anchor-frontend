import { useState, useEffect } from 'react'
import { MapPin, Users, User, ListChecks, ChevronDown, ChevronUp, AlertTriangle, Eye, EyeOff } from 'lucide-react'
import { Card, BottomNav, AppHeader } from '../components'
import { supabase } from '../lib/supabase'

interface RightDuty {
  id: string
  title: string
  role_role: 'Parents' | 'Youth' | 'Duties'
  state: string
  description: string
  full_content: string
  legal_reference: string
  plain_language: string
  practical_tips: string
  sort_order: number
  created_at: string
  updated_at: string
}

type RoleTab = 'Parents' | 'Youth' | 'Duties'

export function RightsScreen() {
  const [activeTab, setActiveTab] = useState<RoleTab>('Parents')
  const [rightsAndDuties, setRightsAndDuties] = useState<RightDuty[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [showLegalBasis, setShowLegalBasis] = useState(false)

  useEffect(() => {
    loadRightsAndDuties()
  }, [])

  const loadRightsAndDuties = async () => {
    try {
      const { data, error } = await supabase
        .from('rights_duties')
        .select('*')
        .order('sort_order', { ascending: true })

      if (error) throw error

      setRightsAndDuties(data || [])
    } catch (error) {
      console.error('Error loading rights and duties:', error)
    } finally {
      setLoading(false)
    }
  }

  const currentItems = rightsAndDuties.filter((item) => item.user_role === activeTab)

  const toggleExpanded = (id: string) => {
    setExpandedId(expandedId === id ? null : id)
  }

  // Check if current items have any legal references
  const hasLegalBasis = currentItems.some((item) => item.legal_reference)

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading rights and responsibilities...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader />
      <div className="max-w-md mx-auto px-6 py-8 pb-24">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Rights & Responsibilities</h1>
          <p className="text-gray-600">Know your rights in dependency court</p>
        </div>

        <Card className="mb-6 bg-blue-50 border-blue-200">
          <div className="flex gap-3">
            <MapPin className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-blue-900 mb-1">State: California</h3>
              <p className="text-xs text-blue-800">
                Rights may vary by state. Currently showing California information. More states coming soon.
              </p>
            </div>
          </div>
        </Card>

        <div className="mb-6 border-b border-gray-200">
          <div className="flex gap-6">
            <button
              onClick={() => {
                setActiveTab('Parents')
                setExpandedId(null)
              }}
              className={`pb-3 px-1 flex items-center gap-2 transition-colors ${
                activeTab === 'Parents'
                  ? 'border-b-2 border-purple-600 text-purple-600 font-semibold'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Users className="w-5 h-5" />
              <span>Parents</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('Youth')
                setExpandedId(null)
              }}
              className={`pb-3 px-1 flex items-center gap-2 transition-colors ${
                activeTab === 'Youth'
                  ? 'border-b-2 border-purple-600 text-purple-600 font-semibold'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <User className="w-5 h-5" />
              <span>Youth</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('Duties')
                setExpandedId(null)
              }}
              className={`pb-3 px-1 flex items-center gap-2 transition-colors ${
                activeTab === 'Duties'
                  ? 'border-b-2 border-purple-600 text-purple-600 font-semibold'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <ListChecks className="w-5 h-5" />
              <span>Duties</span>
            </button>
          </div>
        </div>

        {/* Show Legal Basis Toggle - Available on all tabs */}
        {(() => {
  console.log('hasLegalBasis:', hasLegalBasis)
  console.log('currentItems:', currentItems.length)
  console.log('Items with legal_reference:', currentItems.filter(i => i.legal_reference).length)
  return hasLegalBasis
})() && (
          <div className="mb-6 flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200">
            <div className="flex items-center gap-2">
              {showLegalBasis ? (
                <Eye className="w-4 h-4 text-purple-600" />
              ) : (
                <EyeOff className="w-4 h-4 text-gray-400" />
              )}
              <span className="text-sm font-medium text-gray-700">
                {showLegalBasis ? 'Hiding' : 'Show'} Legal Basis
              </span>
            </div>
            <button
              onClick={() => setShowLegalBasis(!showLegalBasis)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                showLegalBasis ? 'bg-purple-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  showLegalBasis ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        )}

        {activeTab === 'Parents' && (
          <>
            <Card className="mb-6 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Parent's Bill of Rights</h3>
              <p className="text-sm text-gray-700">
                As a parent in dependency court, you have important rights. Understanding these rights helps you
                advocate for yourself and your child.
              </p>
            </Card>

            <div className="space-y-3">
              {currentItems.map((item) => {
                const isExpanded = expandedId === item.id

                return (
                  <Card
                    key={item.id}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => toggleExpanded(item.id)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-gray-900 mb-1">{item.title}</h3>
                        <p className="text-sm text-gray-700">{item.description}</p>

                        {isExpanded && (
                          <div className="mt-4 space-y-4">
                            <div className="prose prose-sm max-w-none">
                              <div className="whitespace-pre-line text-sm text-gray-700">{item.full_content}</div>
                            </div>

                            {showLegalBasis && item.legal_reference && (
                              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                <p className="text-xs font-semibold text-gray-700 mb-2">Legal Basis (California Statute):</p>
                                <p className="text-xs font-mono text-gray-600 mb-2">{item.legal_reference}</p>
                                {item.plain_language && (
                                  <div className="mt-3 pt-3 border-t border-gray-200">
                                    <p className="text-xs text-gray-600">
                                      <span className="font-semibold">What this means:</span> {item.plain_language}
                                    </p>
                                  </div>
                                )}
                              </div>
                            )}

                            {item.practical_tips && (
                              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                                <p className="text-xs font-semibold text-green-900 mb-1">Practical Tips:</p>
                                <p className="text-xs text-green-800 whitespace-pre-line">{item.practical_tips}</p>
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
          </>
        )}

        {activeTab === 'Youth' && (
          <>
            <Card className="mb-6 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Youth Rights in Foster Care</h3>
              <p className="text-sm text-gray-700">
                If you're 13 or older, these are your rights. You deserve to be treated with respect and have your
                voice heard.
              </p>
            </Card>

            <div className="space-y-3">
              {currentItems.map((item) => {
                const isExpanded = expandedId === item.id

                return (
                  <Card
                    key={item.id}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => toggleExpanded(item.id)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-gray-900 mb-1">{item.title}</h3>
                        <p className="text-sm text-gray-700">{item.description}</p>

                        {isExpanded && (
                          <div className="mt-4 space-y-4">
                            <div className="prose prose-sm max-w-none">
                              <div className="whitespace-pre-line text-sm text-gray-700">{item.full_content}</div>
                            </div>

                            {showLegalBasis && item.legal_reference && (
                              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                <p className="text-xs font-semibold text-gray-700 mb-2">Legal Basis (California Statute):</p>
                                <p className="text-xs font-mono text-gray-600 mb-2">{item.legal_reference}</p>
                                {item.plain_language && (
                                  <div className="mt-3 pt-3 border-t border-gray-200">
                                    <p className="text-xs text-gray-600">
                                      <span className="font-semibold">What this means:</span> {item.plain_language}
                                    </p>
                                  </div>
                                )}
                              </div>
                            )}

                            {item.practical_tips && (
                              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                                <p className="text-xs font-semibold text-green-900 mb-1">Practical Tips:</p>
                                <p className="text-xs text-green-800 whitespace-pre-line">{item.practical_tips}</p>
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
          </>
        )}

        {activeTab === 'Duties' && (
          <>
            <Card className="mb-6 bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Your Responsibilities</h3>
              <p className="text-sm text-gray-700">
                Along with rights come responsibilities. Meeting these expectations helps your case go smoothly.
              </p>
            </Card>

            <div className="space-y-3">
              {currentItems.map((item) => {
                const isExpanded = expandedId === item.id

                return (
                  <Card
                    key={item.id}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => toggleExpanded(item.id)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-gray-900 mb-1">{item.title}</h3>
                        <p className="text-sm text-gray-700 mb-2">{item.description}</p>

                        {isExpanded && (
                          <div className="mt-4 space-y-4">
                            <div className="whitespace-pre-line text-sm text-gray-700">{item.full_content}</div>

                            {showLegalBasis && item.legal_reference && (
                              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                <p className="text-xs font-semibold text-gray-700 mb-2">Legal Basis (California Statute):</p>
                                <p className="text-xs font-mono text-gray-600 mb-2">{item.legal_reference}</p>
                                {item.plain_language && (
                                  <div className="mt-3 pt-3 border-t border-gray-200">
                                    <p className="text-xs text-gray-600">
                                      <span className="font-semibold">What this means:</span> {item.plain_language}
                                    </p>
                                  </div>
                                )}
                              </div>
                            )}

                            {item.practical_tips && (
                              <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                                <p className="text-xs font-semibold text-amber-900 mb-1">Practical Tips:</p>
                                <p className="text-xs text-amber-800 whitespace-pre-line">{item.practical_tips}</p>
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
          </>
        )}

        <Card className="mt-8 bg-amber-50 border-amber-200">
          <div className="flex gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-amber-900 mb-1">Know Your Rights</h3>
              <p className="text-xs text-amber-800">
                If you feel your rights are being violated, tell your attorney immediately. They are there to protect
                your rights and advocate for you.
              </p>
            </div>
          </div>
        </Card>
      </div>

      <BottomNav />
    </div>
  )
}
