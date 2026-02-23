import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  AlertTriangle,
  X,
  Calendar,
  Clock,
  Star,
  Sparkles,
  ChevronRight,
  ArrowRight,
  Briefcase,
  UserCircle,
  Phone,
  ChevronDown,
  ChevronUp,
  MapPin,
  User,
  Info,
  Edit2,
  Check,
} from 'lucide-react'
import { BottomNav, Button, AppHeader } from '../components'
import { useAuth } from '../contexts/AuthContext'
import { haptics } from '../lib/haptics'
import { supabase } from '../lib/supabase'

interface CourtInfo {
  county: string
  presiding_judge: string
  next_court_date: string | null
}

interface TimelineStage {
  stage_key: string
  stage_name: string
  what_happens: string
  order_index: number
}

interface TeamMember {
  name: string
  role: string
  phone: string | null
  icon: typeof Briefcase
}

type Role = 'parent' | 'youth' | 'supporter'

export function Dashboard() {
  const { profile, updateProfile } = useAuth()
  const navigate = useNavigate()
  const [showBanner, setShowBanner] = useState(true)
  const [isHearingExpanded, setIsHearingExpanded] = useState(false)
  const [courtInfo, setCourtInfo] = useState<CourtInfo | null>(null)
  const [currentStageData, setCurrentStageData] = useState<TimelineStage | null>(null)
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [isEditingRole, setIsEditingRole] = useState(false)
  const [selectedRole, setSelectedRole] = useState<Role>('parent')

  useEffect(() => {
    const dismissed = localStorage.getItem('legal-banner-dismissed')
    if (dismissed) {
      setShowBanner(false)
    }
    loadCourtInfo()
    loadCurrentStage()
  }, [])

  useEffect(() => {
    if (profile?.role) {
      setSelectedRole(profile.role as Role)
    }
  }, [profile?.role])

  useEffect(() => {
    const loadContacts = async () => {
      if (!profile?.id) return
      try {
        const { data } = await supabase
          .from('contacts')
          .select('name, role, phone')
          .eq('user_id', profile.id)
          .order('is_primary', { ascending: false })
          .order('created_at', { ascending: true })

        if (data && data.length > 0) {
          setTeamMembers(data.map(c => ({
            name: c.name,
            role: c.role?.toUpperCase() || 'SUPPORT',
            phone: c.phone,
            icon: c.role?.toLowerCase().includes('attorney') || c.role?.toLowerCase().includes('lawyer') ? Briefcase : UserCircle,
          })))
        }
      } catch (error) {
        console.error('Error loading contacts:', error)
      }
    }
    loadContacts()
  }, [profile?.id])

  const loadCourtInfo = async () => {
    try {
      const { data, error } = await supabase
        .from('court_info')
        .select('county, presiding_judge, next_court_date')
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading court info:', error)
        return
      }

      if (data) {
        setCourtInfo(data)
      }
    } catch (error) {
      console.error('Error loading court info:', error)
    }
  }

  const loadCurrentStage = async () => {
    if (!profile?.current_stage) return

    try {
      const { data, error } = await supabase
        .from('timeline_stages')
        .select('stage_key, stage_name, what_happens, order_index')
        .eq('stage_key', profile.current_stage)
        .maybeSingle()

      if (error) {
        console.error('Error loading current stage:', error)
        return
      }

      if (data) {
        setCurrentStageData(data)
      }
    } catch (error) {
      console.error('Error loading current stage:', error)
    }
  }

  const dismissBanner = () => {
    haptics.light()
    localStorage.setItem('legal-banner-dismissed', 'true')
    setShowBanner(false)
  }

  const handleSaveRole = async () => {
    haptics.light()
    const { error } = await updateProfile({ role: selectedRole })
    if (!error) {
      setIsEditingRole(false)
    }
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
  }

  const formatCourtDate = (dateStr: string | null) => {
    if (!dateStr) return null
    const date = new Date(dateStr)
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }
    return date.toLocaleDateString('en-US', options)
  }

  const getDaysUntilHearing = (dateStr: string | null) => {
    if (!dateStr) return null
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const hearingDate = new Date(dateStr)
    hearingDate.setHours(0, 0, 0, 0)
    const diffTime = hearingDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Tomorrow'
    if (diffDays < 0) return `${Math.abs(diffDays)} days ago`
    return `${diffDays} days away`
  }

  const firstName = profile?.first_name || 'there'
  const role = profile?.role || 'parent'
  const nextCourtDate = profile?.next_court_date
  const currentStage = profile?.current_stage

  const roleLabels: Record<Role, string> = {
    parent: 'Parent',
    youth: 'Youth',
    supporter: 'Supporter',
  }

  const stageLabels: Record<string, string> = {
    detention: 'Detention Hearing',
    jurisdiction: 'Jurisdiction Hearing',
    disposition: 'Disposition Hearing',
    review: 'Review Hearings',
    permanency: 'Permanency Hearing',
  }

  const completedSteps = currentStage ? 2 : 1
  const totalSteps = 5

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <AppHeader />

      {showBanner && (
        <div className="bg-amber-50 border-b border-amber-200 px-6 py-3">
          <div className="max-w-4xl mx-auto flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-amber-900 flex-1">
              General info, not legal advice. Talk to your lawyer for your specific case.
            </p>
            <button
              onClick={dismissBanner}
              className="text-amber-600 hover:text-amber-800 transition-colors"
              aria-label="Dismiss banner"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="relative mb-8">
          <div className="absolute top-0 left-0 w-16 h-16 bg-purple-100 rounded-full opacity-20 -z-10" />

          <div className="flex items-start justify-between mb-4">
            <div className="flex-1" />
            
            {isEditingRole ? (
              <div className="flex items-center gap-2">
                <div className="flex gap-2">
                  {(['parent', 'youth', 'supporter'] as Role[]).map((r) => (
                    <button
                      key={r}
                      onClick={() => setSelectedRole(r)}
                      className={`px-3 py-1 text-xs font-bold tracking-wider rounded-full uppercase transition-all ${
                        selectedRole === r
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {roleLabels[r]}
                    </button>
                  ))}
                </div>
                <button
                  onClick={handleSaveRole}
                  className="p-1.5 bg-green-100 text-green-700 rounded-full hover:bg-green-200 transition-colors"
                >
                  <Check className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    setIsEditingRole(false)
                    setSelectedRole(role as Role)
                  }}
                  className="p-1.5 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  haptics.light()
                  setIsEditingRole(true)
                }}
                className="flex items-center gap-2 px-3 py-1 bg-purple-100 text-purple-700 text-xs font-bold tracking-wider rounded-full uppercase hover:bg-purple-200 transition-colors"
              >
                <span>{roleLabels[role as Role]}</span>
                <Edit2 className="w-3 h-3" />
              </button>
            )}
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {getGreeting()}, {firstName}
          </h1>
          <p className="text-gray-600 text-lg">Finding your footing, one step at a time.</p>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-start justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Your Journey</h2>
              <span className="px-3 py-1 bg-coral-100 text-coral-700 text-xs font-semibold rounded-full">
                {completedSteps} of {totalSteps} Steps
              </span>
            </div>

            <p className="text-gray-600 mb-4">
              You have completed {completedSteps} important milestone{completedSteps !== 1 ? 's' : ''}.
            </p>

            <button
              onClick={() => {
                haptics.light()
                navigate('/timeline')
              }}
              className="flex items-center gap-2 text-purple-600 font-semibold hover:text-purple-700 transition-colors"
            >
              <span>
                Next up: {currentStage ? stageLabels[currentStage] : 'Get Started'}
              </span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => {
              if (nextCourtDate) {
                haptics.light()
                setIsHearingExpanded(!isHearingExpanded)
              }
            }}
            className={`w-full bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl shadow-sm border border-purple-200 relative overflow-hidden transition-all ${
              nextCourtDate ? 'hover:shadow-md cursor-pointer' : 'cursor-default'
            }`}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-coral-200 rounded-full opacity-30 transform translate-x-12 -translate-y-12" />

            <div className="relative p-6">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-white rounded-lg">
                  <Calendar className="w-5 h-5 text-purple-600" />
                </div>
                <div className="flex-1 text-left">
                  <div className="flex items-start justify-between mb-1">
                    <h2 className="text-lg font-bold text-gray-900">Next Court Hearing</h2>
                    {nextCourtDate && (
                      <div className="flex-shrink-0">
                        {isHearingExpanded ? (
                          <ChevronUp className="w-5 h-5 text-purple-600" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-purple-600" />
                        )}
                      </div>
                    )}
                  </div>
                  {nextCourtDate ? (
                    <>
                      {currentStageData && (
                        <p className="text-sm font-semibold text-purple-700 mb-1">
                          {currentStageData.stage_name}
                        </p>
                      )}
                      <p className="text-2xl font-bold text-purple-900 mb-1">
                        {formatCourtDate(nextCourtDate)}
                      </p>
                      <p className="text-sm text-purple-700 font-medium">
                        {getDaysUntilHearing(nextCourtDate)}
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-gray-600 mb-2">No upcoming hearing scheduled</p>
                      <span
                        onClick={(e) => {
                          e.stopPropagation()
                          haptics.light()
                          navigate('/settings')
                        }}
                        className="text-purple-600 font-semibold text-sm hover:text-purple-700 transition-colors inline-block"
                      >
                        Add date →
                      </span>
                    </>
                  )}
                </div>
              </div>

              {isHearingExpanded && nextCourtDate && (
                <div className="mt-6 pt-6 border-t border-purple-200 space-y-4 text-left">
                  {currentStageData && (
                    <div className="bg-blue-100 rounded-lg p-3">
                      <p className="text-xs font-bold text-blue-900 uppercase tracking-wide mb-1">
                        Step {currentStageData.order_index} of 7
                      </p>
                      <p className="text-sm font-semibold text-blue-900">
                        {currentStageData.stage_name}
                      </p>
                    </div>
                  )}

                  {currentStageData?.what_happens && (
                    <div>
                      <h3 className="text-sm font-bold text-gray-900 mb-2">What Happens at This Hearing</h3>
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {currentStageData.what_happens}
                      </p>
                    </div>
                  )}

                  <div className="space-y-2">
                    {courtInfo?.county && (
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-gray-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-xs font-semibold text-gray-600 uppercase">Location</p>
                          <p className="text-sm text-gray-900">{courtInfo.county} County</p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-start gap-2">
                      <Clock className="w-4 h-4 text-gray-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-semibold text-gray-600 uppercase">Time</p>
                        <p className="text-sm text-gray-900">Check with your attorney for exact time</p>
                      </div>
                    </div>

                    {courtInfo?.presiding_judge && (
                      <div className="flex items-start gap-2">
                        <User className="w-4 h-4 text-gray-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-xs font-semibold text-gray-600 uppercase">Judge</p>
                          <p className="text-sm text-gray-900">{courtInfo.presiding_judge}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <div className="flex items-start gap-2 mb-2">
                      <Info className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
                      <h3 className="text-sm font-bold text-amber-900">What to Expect</h3>
                    </div>
                    <p className="text-sm text-amber-900 leading-relaxed">
                      Come prepared with any documents your attorney requested. Dress professionally and arrive 15 minutes early. Your attorney will be there to support you.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        haptics.light()
                        navigate('/timeline')
                      }}
                      className="px-4 py-2.5 bg-white border border-purple-300 text-purple-700 rounded-lg font-semibold hover:bg-purple-50 transition-colors text-sm"
                    >
                      View Timeline
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        haptics.light()
                        navigate('/preparation')
                      }}
                      className="px-4 py-2.5 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors text-sm"
                    >
                      Prepare Now
                    </button>
                  </div>
                </div>
              )}
            </div>
          </button>

          <div className="bg-gradient-to-br from-purple-700 to-purple-900 rounded-2xl shadow-lg p-6 text-white">
            <div className="flex items-start gap-3 mb-4">
              <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-bold mb-2">Preparation and Reflection</h2>
                <p className="text-purple-100 text-sm mb-4">
                  Organize your thoughts before hearing or reflect on what happened after. This is
                  for your eyes only.
                </p>
                <button
                  onClick={() => {
                    haptics.light()
                    navigate('/preparation')
                  }}
                  className="bg-white text-purple-900 px-5 py-2.5 rounded-xl font-semibold hover:bg-purple-50 transition-colors inline-flex items-center gap-2"
                >
                  <span>Start Preparing</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => {
                haptics.light()
                navigate('/timeline')
              }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-left hover:border-purple-200 hover:shadow-md transition-all"
            >
              <div className="p-2 bg-purple-100 rounded-lg w-fit mb-3">
                <Clock className="w-5 h-5 text-purple-600" />
              </div>
              <h3 className="font-bold text-gray-900 uppercase text-sm tracking-wide">
                Timeline
              </h3>
            </button>

            <button
              onClick={() => {
                haptics.light()
                navigate('/legal')
              }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-left hover:border-purple-200 hover:shadow-md transition-all"
            >
              <div className="p-2 bg-purple-100 rounded-lg w-fit mb-3">
                <Star className="w-5 h-5 text-purple-600" />
              </div>
              <h3 className="font-bold text-gray-900 uppercase text-sm tracking-wide">
                My Rights
              </h3>
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">My Team</h2>

            {teamMembers.length > 0 ? (
              <div className="space-y-3">
                {teamMembers.map((member, index) => {
                  const Icon = member.icon
                  return (
                    <div
                      key={index}
                      className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl"
                    >
                      <div className="p-3 bg-purple-100 rounded-full">
                        <Icon className="w-5 h-5 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{member.name}</p>
                        <p className="text-xs font-bold text-purple-600 uppercase tracking-wide">
                          {member.role}
                        </p>
                        {member.phone && (
                          <a
                            href={`tel:${member.phone}`}
                            className="text-sm text-gray-600 hover:text-purple-600 flex items-center gap-1 mt-1"
                          >
                            <Phone className="w-3 h-3" />
                            {member.phone}
                          </a>
                        )}
                      </div>
                    </div>
                  )
                })}
                <button
                  onClick={() => { haptics.light(); navigate('/contacts') }}
                  className="w-full text-center text-sm text-purple-600 font-semibold hover:text-purple-700 py-2"
                >
                  Manage Contacts →
                </button>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="p-4 bg-gray-50 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <UserCircle className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-600 mb-4">No team members added yet</p>
                <Button onClick={() => navigate('/contacts')} variant="secondary">
                  Add Your Support Team
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="max-w-4xl mx-auto px-6">
        <div className="mt-8 pt-8 border-t border-gray-200">
          <button
            onClick={() => {
              haptics.light()
              navigate('/delete-account')
            }}
            className="text-red-600 text-sm font-semibold hover:text-red-700"
          >
            Delete my account
          </button>
          <p className="text-xs text-gray-500 mt-1">This permanently deletes your data.</p>
        </div>
      </div>

      <BottomNav />
    </div>
  )
}
