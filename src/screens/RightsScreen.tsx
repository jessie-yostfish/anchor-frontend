import { useState, useEffect } from 'react'
import { MapPin, Users, User, Heart, ListChecks, ChevronDown, ChevronUp, AlertTriangle, Eye, EyeOff } from 'lucide-react'
import { Card, BottomNav, AppHeader } from '../components'
import { supabase } from '../lib/supabase'

interface RightDuty {
  id: string
  user_role: string
  right_key: string
  title: string
  description: string
  legal_reference: string
  category: string
  practical_tips: string
  created_at: string
  updated_at: string
}

type RoleTab = 'parent' | 'youth' | 'supporter'

export function RightsScreen() {
  const [activeTab, setActiveTab] = useState<RoleTab>('parent')
  const [rightsAndDuties, setRightsAndDuties] = useState<RightDuty[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [showLegalBasis, setShowLegalBasis] = useState(false)
  const [showDutiesOnly, setShowDutiesOnly] = useState(false)

  useEffect(() => {
    loadRightsAndDuties()
  }, [])

  const loadRightsAndDuties = async () => {
    try {
      const { data, error } = await supabase
        .from('rights_duties')
        .select('*')
        .order('category', { ascending: true })
        .order('title', { ascending: true })

      if (error) throw error
      setRightsAndDuties(data || [])
    } catch (error) {
      console.error('Error loading rights and duties:', error)
    } finally {
      setLoading(false)
    }
  }

  const currentItems = rightsAndDuties.filter((item) => {
    const matchesRole = item.user_role === activeTab || item.user_role === 'both'
    if (showDutiesOnly) return matchesRole && item.category === 'duty'
    return matchesRole
  })

  const rightItems = currentItems.filter((item) => item.category === 'right')
  const dutyItems = currentItems.filter((item) => item.category === 'duty')

  const hasLegalBasis = currentItems.some((item) => item.legal_reference)

  const toggleExpanded = (id: string) => {
    setExpandedId(expandedId === id ? null : id)
  }

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

  const renderItem = (item: RightDuty, tipColor: string) => {
    const isExpanded = expandedId === item.id
    return (
      <Card
        key={item.id}
        className="cursor-pointer hover:shadow-md transition-shadow"
        onClick={() => toggleExpanded(item.id)}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-bold text-gray-900">{item.title}</h3>
              {item.category === 'duty' && (
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">DUTY</span>
              )}
              {item.category === 'right' && (
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">RIGHT</span>
              )}
            </div>
            <p className="text-sm text-gray-700">
              {isExpanded ? item.description : item.description.length > 150 ? item.description.slice(0, 150) + '...' : item.description}
            </p>

            {isExpanded && (
              <div className="mt-4 space-y-4">
                {showLegalBasis && item.legal_reference && (
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-xs font-semibold text-gray-700 mb-2">Legal Basis (California Statute):</p>
                    <p className="text-xs font-mono text-gray-600">{item.legal_reference}</p>
                  </div>
                )}

                {item.practical_tips && (
                  <div className={`p-3 rounded-lg border ${tipColor}`}>
                    <p className="text-xs font-semibold mb-1">💡 Practical Tips:</p>
                    <p className="text-xs whitespace-pre-line">{item.practical_tips}</p>
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
  }

  const tabConfig = {
    parent: {
      label: 'Parents',
      icon: <Users className="w-5 h-5" />,
      heroTitle: "Parent's Bill of Rights",
      heroDesc: 'As a parent in dependency court, you have important rights. Understanding these rights helps you advocate for yourself and your child.',
      heroColor: 'bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200',
      tipColor: 'bg-green-50 border-green-200 text-green-800',
    },
    youth: {
      label: 'Youth',
      icon: <User className="w-5 h-5" />,
      heroTitle: 'Youth Rights in Foster Care',
      heroDesc: "If you're in foster care, these are your rights. You deserve to be treated with respect and have your voice heard.",
      heroColor: 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200',
      tipColor: 'bg-blue-50 border-blue-200 text-blue-800',
    },
    supporter: {
      label: 'Supporters',
      icon: <Heart className="w-5 h-5" />,
      heroTitle: 'Supporter Rights & Responsibilities',
      heroDesc: 'As a relative, caregiver, or foster parent, you have important rights and responsibilities in the dependency process.',
      heroColor: 'bg-gradient-to-br from-teal-50 to-teal-100 border-teal-200',
      tipColor: 'bg-teal-50 border-teal-200 text-teal-800',
    },
  }

  const tab = tabConfig[activeTab]

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

        {/* Role Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <div className="flex gap-4">
            {(Object.keys(tabConfig) as RoleTab[]).map((key) => (
              <button
                key={key}
                onClick={() => {
                  setActiveTab(key)
                  setExpandedId(null)
                  setShowDutiesOnly(false)
                }}
                className={`pb-3 px-1 flex items-center gap-2 transition-colors ${
                  activeTab === key
                    ? 'border-b-2 border-purple-600 text-purple-600 font-semibold'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tabConfig[key].icon}
                <span>{tabConfig[key].label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Toggles Row */}
        <div className="mb-6 space-y-3">
          {hasLegalBasis && (
            <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200">
              <div className="flex items-center gap-2">
                {showLegalBasis ? (
                  <Eye className="w-4 h-4 text-purple-600" />
                ) : (
                  <EyeOff className="w-4 h-4 text-gray-400" />
                )}
                <span className="text-sm font-medium text-gray-700">Show Legal Basis</span>
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

          {dutyItems.length > 0 && rightItems.length > 0 && (
            <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200">
              <div className="flex items-center gap-2">
                <ListChecks className="w-4 h-4 text-amber-600" />
                <span className="text-sm font-medium text-gray-700">Show Duties Only</span>
              </div>
              <button
                onClick={() => setShowDutiesOnly(!showDutiesOnly)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  showDutiesOnly ? 'bg-amber-500' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    showDutiesOnly ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          )}
        </div>

        {/* Hero Card */}
        <Card className={`mb-6 ${tab.heroColor}`}>
          <h3 className="text-lg font-bold text-gray-900 mb-2">{tab.heroTitle}</h3>
          <p className="text-sm text-gray-700">{tab.heroDesc}</p>
          <p className="text-xs text-gray-500 mt-2">{currentItems.length} items</p>
        </Card>

        {/* Rights Section */}
        {!showDutiesOnly && rightItems.length > 0 && (
          <div className="mb-6">
            <h2 className="text-sm font-bold text-purple-700 uppercase tracking-wide mb-3">
              Rights ({rightItems.length})
            </h2>
            <div className="space-y-3">
              {rightItems.map((item) => renderItem(item, tab.tipColor))}
            </div>
          </div>
        )}

        {/* Duties Section */}
        {dutyItems.length > 0 && (
          <div className="mb-6">
            <h2 className="text-sm font-bold text-amber-700 uppercase tracking-wide mb-3">
              Responsibilities ({dutyItems.length})
            </h2>
            <div className="space-y-3">
              {dutyItems.map((item) => renderItem(item, 'bg-amber-50 border-amber-200 text-amber-800'))}
            </div>
          </div>
        )}

        {currentItems.length === 0 && (
          <Card className="text-center py-8">
            <p className="text-gray-500">No information available for this section yet.</p>
          </Card>
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
