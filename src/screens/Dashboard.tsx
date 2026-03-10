import { trackEvent } from '../lib/analytics'
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
import { BottomNav, AppHeader } from '../components'
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
  const [showDateModal, setShowDateModal] = useState(false)
  const [newCourtDate, setNewCourtDate] = useState('')

  useEffect(() => {
    const dismissed = localStorage.getItem('legal-banner-dismissed')
    if (dismissed) {
      setShowBanner(false)
    }
    loadCourtInfo()
    loadCurrentStage()

    const lastVisit = localStorage.getItem('last-dashboard-visit')
    const now = new Date().toISOString()
    if (lastVisit) {
      trackEvent('return_visit', { role: profile?.role, screen: 'dashboard' })
    }
    trackEvent('screen_viewed', { screen: 'dashboard', role: profile?.role })
    localStorage.setItem('last-dashboard-visit', now)
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
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      if (!currentUser) return

      const { data, error } = await supabase
        .from('court_info')
        .select('county, presiding_judge, next_court_date')
        .eq('user_id', currentUser.id)
        .maybeSingle()

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

  const handleSaveCourtDate = async () => {
    if (!newCourtDate) return
    haptics.light()
    const { error } = await updateProfile({ next_court_date: newCourtDate })
    if (!error) {
      setShowDateModal(false)
      setNewCourtDate('')
      window.location.reload()
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
    <div className="min-h-screen pb-24" style={{ background: '#F0EAE0' }}>
      <AppHeader />

      {/* ── BANNER ── */}
      {showBanner && (
        <div
          className="px-5 py-3 border-b"
          style={{ background: '#F5ECD8', borderColor: 'rgba(200,136,58,0.25)' }}
        >
          <div className="max-w-4xl mx-auto flex items-start gap-3">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#C8883A' }} />
            <p className="text-sm flex-1" style={{ color: '#7A5A2A' }}>
              General info, not legal advice. Talk to your lawyer for your specific case.
            </p>
            <button onClick={dismissBanner} aria-label="Dismiss banner" style={{ color: '#C8883A' }}>
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto px-5 py-6">

        {/* ── GREETING ── */}
        <div className="mb-6">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1" />

            {isEditingRole ? (
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  {(['parent', 'youth', 'supporter'] as Role[]).map((r) => (
                    <button
                      key={r}
                      onClick={() => setSelectedRole(r)}
                      className="px-3 py-1 text-xs font-bold tracking-wider rounded-full uppercase transition-all"
                      style={
                        selectedRole === r
                          ? { background: '#7A6690', color: '#fff' }
                          : { background: '#E8DDE8', color: '#7A6690' }
                      }
                    >
                      {roleLabels[r]}
                    </button>
                  ))}
                </div>
                <button
                  onClick={handleSaveRole}
                  className="p-1.5 rounded-full transition-colors"
                  style={{ background: 'rgba(74,124,89,0.12)', color: '#4A7C59' }}
                >
                  <Check className="w-4 h-4" />
                </button>
                <button
                  onClick={() => { setIsEditingRole(false); setSelectedRole(role as Role) }}
                  className="p-1.5 rounded-full transition-colors"
                  style={{ background: '#E8DDE8', color: '#7A6690' }}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => { haptics.light(); setIsEditingRole(true) }}
                className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase transition-all"
                style={{ background: '#E8DDE8', color: '#7A6690' }}
              >
                <span>{roleLabels[role as Role]}</span>
                <Edit2 className="w-3 h-3" />
              </button>
            )}
          </div>

          <h1
            className="text-3xl font-bold mb-1"
            style={{ fontFamily: "'Fraunces', Georgia, serif", color: '#2A2030' }}
          >
            {getGreeting()}, {firstName}
          </h1>
          <p className="text-base" style={{ color: '#5A5065' }}>Finding your footing, one step at a time.</p>
        </div>

        <div className="space-y-4">

          {/* ── YOUR JOURNEY ── */}
          <div
            className="rounded-3xl p-5"
            style={{ background: '#FAF7F4', border: '1px solid rgba(122,102,144,0.12)', boxShadow: '0 2px 12px rgba(90,78,110,0.07)' }}
          >
            <div className="flex items-start justify-between mb-3">
              <h2 className="text-lg font-bold" style={{ fontFamily: "'Fraunces', Georgia, serif", color: '#2A2030' }}>
                Your Journey
              </h2>
              <span
                className="px-3 py-1 rounded-full text-xs font-semibold"
                style={{ background: '#E8DDE8', color: '#7A6690' }}
              >
                {completedSteps} of {totalSteps} Steps
              </span>
            </div>

            <p className="text-sm mb-4" style={{ color: '#5A5065' }}>
              You have completed {completedSteps} important milestone{completedSteps !== 1 ? 's' : ''}.
            </p>

            <button
              onClick={() => { haptics.light(); navigate('/timeline') }}
              className="flex items-center gap-1.5 text-sm font-semibold transition-colors"
              style={{ color: '#7A6690' }}
            >
              <span>Next up: {currentStage ? stageLabels[currentStage] : 'Get Started'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* ── NEXT COURT HEARING ── */}
          <button
            onClick={() => {
              if (nextCourtDate) { haptics.light(); setIsHearingExpanded(!isHearingExpanded) }
            }}
            className="w-full rounded-3xl relative overflow-hidden transition-all text-left"
            style={{
              background: '#F4EFF8',
              border: '1px solid rgba(122,102,144,0.2)',
              boxShadow: '0 2px 12px rgba(90,78,110,0.07)',
              cursor: nextCourtDate ? 'pointer' : 'default',
            }}
          >
            {/* decorative circle */}
            <div
              className="absolute top-0 right-0 w-28 h-28 rounded-full opacity-20"
              style={{ background: '#C8883A', transform: 'translate(40%, -40%)' }}
            />

            <div className="relative p-5">
              <div className="flex items-start gap-3">
                <div
                  className="p-2 rounded-xl flex-shrink-0"
                  style={{ background: '#FAF7F4' }}
                >
                  <Calendar className="w-5 h-5" style={{ color: '#7A6690' }} />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-1">
                    <h2 className="text-lg font-bold" style={{ fontFamily: "'Fraunces', Georgia, serif", color: '#2A2030' }}>
                      Next Court Hearing
                    </h2>
                    {nextCourtDate && (
                      isHearingExpanded
                        ? <ChevronUp className="w-5 h-5 flex-shrink-0" style={{ color: '#7A6690' }} />
                        : <ChevronDown className="w-5 h-5 flex-shrink-0" style={{ color: '#7A6690' }} />
                    )}
                  </div>

                  {nextCourtDate ? (
                    <>
                      {currentStageData && (
                        <p className="text-sm font-semibold mb-1" style={{ color: '#7A6690' }}>
                          {currentStageData.stage_name}
                        </p>
                      )}
                      <p className="text-xl font-bold mb-1" style={{ color: '#2A2030' }}>
                        {formatCourtDate(nextCourtDate)}
                      </p>
                      <p className="text-sm font-medium" style={{ color: '#7A6690' }}>
                        {getDaysUntilHearing(nextCourtDate)}
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-sm mb-2" style={{ color: '#5A5065' }}>No upcoming hearing scheduled</p>
                      <span
                        onClick={(e) => { e.stopPropagation(); haptics.light(); setShowDateModal(true) }}
                        className="text-sm font-semibold inline-block cursor-pointer"
                        style={{ color: '#7A6690' }}
                      >
                        Add date →
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* expanded detail */}
              {isHearingExpanded && nextCourtDate && (
                <div
                  className="mt-5 pt-5 space-y-4"
                  style={{ borderTop: '1px solid rgba(122,102,144,0.15)' }}
                >
                  {currentStageData && (
                    <div
                      className="rounded-2xl p-3"
                      style={{ background: 'rgba(122,102,144,0.1)' }}
                    >
                      <p className="text-xs font-bold uppercase tracking-wide mb-1" style={{ color: '#7A6690' }}>
                        Step {currentStageData.order_index} of 7
                      </p>
                      <p className="text-sm font-semibold" style={{ color: '#2A2030' }}>
                        {currentStageData.stage_name}
                      </p>
                    </div>
                  )}

                  {currentStageData?.what_happens && (
                    <div>
                      <h3 className="text-sm font-bold mb-2" style={{ color: '#2A2030' }}>
                        What Happens at This Hearing
                      </h3>
                      <p className="text-sm leading-relaxed" style={{ color: '#5A5065' }}>
                        {currentStageData.what_happens}
                      </p>
                    </div>
                  )}

                  <div className="space-y-3">
                    {courtInfo?.county && (
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: '#9A90A8' }} />
                        <div>
                          <p className="text-xs font-semibold uppercase" style={{ color: '#9A90A8' }}>Location</p>
                          <p className="text-sm" style={{ color: '#2A2030' }}>{courtInfo.county} County</p>
                        </div>
                      </div>
                    )}
                    <div className="flex items-start gap-2">
                      <Clock className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: '#9A90A8' }} />
                      <div>
                        <p className="text-xs font-semibold uppercase" style={{ color: '#9A90A8' }}>Time</p>
                        <p className="text-sm" style={{ color: '#2A2030' }}>Check with your attorney for exact time</p>
                      </div>
                    </div>
                    {courtInfo?.presiding_judge && (
                      <div className="flex items-start gap-2">
                        <User className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: '#9A90A8' }} />
                        <div>
                          <p className="text-xs font-semibold uppercase" style={{ color: '#9A90A8' }}>Judge</p>
                          <p className="text-sm" style={{ color: '#2A2030' }}>{courtInfo.presiding_judge}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div
                    className="rounded-2xl p-4"
                    style={{ background: '#F5ECD8', border: '1px solid rgba(200,136,58,0.2)' }}
                  >
                    <div className="flex items-start gap-2 mb-2">
                      <Info className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#C8883A' }} />
                      <h3 className="text-sm font-bold" style={{ color: '#7A5A2A' }}>What to Expect</h3>
                    </div>
                    <p className="text-sm leading-relaxed" style={{ color: '#7A5A2A' }}>
                      Come prepared with any documents your attorney requested. Dress professionally and arrive 15 minutes early. Your attorney will be there to support you.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <button
                      onClick={(e) => { e.stopPropagation(); haptics.light(); navigate('/timeline') }}
                      className="px-4 py-2.5 rounded-2xl font-semibold text-sm transition-all"
                      style={{ background: '#FAF7F4', border: '1.5px solid rgba(122,102,144,0.3)', color: '#7A6690' }}
                    >
                      View Timeline
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); haptics.light(); navigate('/preparation') }}
                      className="px-4 py-2.5 rounded-2xl font-semibold text-sm text-white transition-all"
                      style={{ background: '#7A6690' }}
                    >
                      Prepare Now
                    </button>
                  </div>
                </div>
              )}
            </div>
          </button>

          {/* ── PREPARATION CARD ── */}
          <div
            className="rounded-3xl p-5"
            style={{ background: '#7A6690', boxShadow: '0 4px 20px rgba(122,102,144,0.3)' }}
          >
            <div className="flex items-start gap-3">
              <div
                className="p-2 rounded-xl flex-shrink-0"
                style={{ background: 'rgba(255,255,255,0.15)' }}
              >
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-bold text-white mb-1">Preparation and Reflection</h2>
                <p className="text-sm mb-4" style={{ color: 'rgba(255,255,255,0.75)' }}>
                  Organize your thoughts before hearing or reflect on what happened after. This is for your eyes only.
                </p>
                <button
                  onClick={() => { haptics.light(); navigate('/preparation') }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl font-semibold text-sm transition-all"
                  style={{ background: '#FAF7F4', color: '#7A6690' }}
                >
                  <span>Start Preparing</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* ── QUICK NAV GRID ── */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => { haptics.light(); navigate('/timeline') }}
              className="rounded-3xl p-5 text-left transition-all active:scale-95"
              style={{ background: '#FAF7F4', border: '1px solid rgba(122,102,144,0.12)', boxShadow: '0 2px 8px rgba(90,78,110,0.06)' }}
            >
              <div
                className="p-2 rounded-xl w-fit mb-3"
                style={{ background: '#E8DDE8' }}
              >
                <Clock className="w-5 h-5" style={{ color: '#7A6690' }} />
              </div>
              <h3 className="font-bold text-sm uppercase tracking-wide" style={{ color: '#2A2030' }}>
                Timeline
              </h3>
            </button>

            <button
              onClick={() => { haptics.light(); navigate('/legal') }}
              className="rounded-3xl p-5 text-left transition-all active:scale-95"
              style={{ background: '#FAF7F4', border: '1px solid rgba(122,102,144,0.12)', boxShadow: '0 2px 8px rgba(90,78,110,0.06)' }}
            >
              <div
                className="p-2 rounded-xl w-fit mb-3"
                style={{ background: '#E8DDE8' }}
              >
                <Star className="w-5 h-5" style={{ color: '#7A6690' }} />
              </div>
              <h3 className="font-bold text-sm uppercase tracking-wide" style={{ color: '#2A2030' }}>
                My Rights
              </h3>
            </button>
          </div>

          {/* ── MY TEAM ── */}
          <div
            className="rounded-3xl p-5"
            style={{ background: '#FAF7F4', border: '1px solid rgba(122,102,144,0.12)', boxShadow: '0 2px 12px rgba(90,78,110,0.07)' }}
          >
            <h2
              className="text-lg font-bold mb-4"
              style={{ fontFamily: "'Fraunces', Georgia, serif", color: '#2A2030' }}
            >
              My Team
            </h2>

            {teamMembers.length > 0 ? (
              <div className="space-y-3">
                {teamMembers.map((member, index) => {
                  const Icon = member.icon
                  return (
                    <div
                      key={index}
                      className="flex items-center gap-4 p-4 rounded-2xl"
                      style={{ background: '#F0EAE0' }}
                    >
                      <div
                        className="p-2.5 rounded-full flex-shrink-0"
                        style={{ background: '#E8DDE8' }}
                      >
                        <Icon className="w-5 h-5" style={{ color: '#7A6690' }} />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-sm" style={{ color: '#2A2030' }}>{member.name}</p>
                        <p className="text-xs font-bold uppercase tracking-wide" style={{ color: '#7A6690' }}>
                          {member.role}
                        </p>
                        {member.phone && (
                          <a
                            href={`tel:${member.phone}`}
                            className="text-xs flex items-center gap-1 mt-1"
                            style={{ color: '#5A5065' }}
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
                  className="w-full text-center text-sm font-semibold py-2"
                  style={{ color: '#7A6690' }}
                >
                  Manage Contacts →
                </button>
              </div>
            ) : (
              <div className="text-center py-8">
                <div
                  className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
                  style={{ background: '#E8DDE8' }}
                >
                  <UserCircle className="w-8 h-8" style={{ color: '#9A90A8' }} />
                </div>
                <p className="text-sm mb-4" style={{ color: '#5A5065' }}>No team members added yet</p>
                <button
                  onClick={() => navigate('/contacts')}
                  className="px-5 py-2.5 rounded-2xl font-semibold text-sm transition-all"
                  style={{ background: 'transparent', border: '1.5px solid rgba(122,102,144,0.35)', color: '#7A6690' }}
                >
                  Add Your Support Team
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── DELETE ACCOUNT ── */}
      <div className="max-w-4xl mx-auto px-5">
        <div
          className="mt-8 pt-6"
          style={{ borderTop: '1px solid rgba(122,102,144,0.12)' }}
        >
          <button
            onClick={() => { haptics.light(); navigate('/delete-account') }}
            className="text-sm font-semibold"
            style={{ color: '#C0574A' }}
          >
            Delete my account
          </button>
          <p className="text-xs mt-1" style={{ color: '#9A90A8' }}>This permanently deletes your data.</p>
        </div>
      </div>

      {/* ── DATE MODAL ── */}
      {showDateModal && (
        <div className="fixed inset-0 flex items-center justify-center p-4 z-50" style={{ background: 'rgba(42,32,48,0.5)' }}>
          <div
            className="rounded-3xl p-6 w-full max-w-md"
            style={{ background: '#FAF7F4', boxShadow: '0 8px 40px rgba(42,32,48,0.2)' }}
          >
            <div className="flex items-center justify-between mb-5">
              <h2
                className="text-xl font-bold"
                style={{ fontFamily: "'Fraunces', Georgia, serif", color: '#2A2030' }}
              >
                Add Court Date
              </h2>
              <button
                onClick={() => { setShowDateModal(false); setNewCourtDate('') }}
                className="p-2 rounded-xl transition-colors"
                style={{ background: '#E8DDE8', color: '#7A6690' }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label
                  className="block text-xs font-semibold uppercase tracking-wide mb-2"
                  style={{ color: '#9A90A8' }}
                >
                  Next Court Hearing Date
                </label>
                <input
                  type="date"
                  value={newCourtDate}
                  onChange={(e) => setNewCourtDate(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl outline-none"
                  style={{
                    background: '#F0EAE0',
                    border: '1.5px solid rgba(122,102,144,0.2)',
                    color: '#2A2030',
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                />
              </div>

              <button
                onClick={handleSaveCourtDate}
                disabled={!newCourtDate}
                className="w-full py-3.5 rounded-2xl font-semibold text-white flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                style={{ background: '#7A6690', boxShadow: '0 4px 16px rgba(122,102,144,0.3)' }}
              >
                <Check className="w-4 h-4" />
                Save Date
              </button>
              <button
                onClick={() => { setShowDateModal(false); setNewCourtDate('') }}
                className="w-full py-3.5 rounded-2xl font-semibold transition-all"
                style={{ background: '#E8DDE8', color: '#7A6690' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  )
}
