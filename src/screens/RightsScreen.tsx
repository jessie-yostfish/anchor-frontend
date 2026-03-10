import { useState, useEffect } from 'react'
import { MapPin, Users, User, Heart, ListChecks, ChevronDown, ChevronUp, AlertTriangle, Eye, EyeOff, BookOpen } from 'lucide-react'
import { BottomNav, AppHeader } from '../components'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { trackEvent } from '../lib/analytics'

interface RightDuty {
  id: string
  title: string
  role: string           // 'Parents' | 'Youth' | 'Duties'
  description: string
  full_content: string
  plain_language: string
  legal_reference: string
  practical_tips: string
  sort_order: number
}

type RoleTab = 'parent' | 'youth' | 'supporter'

// Map UI tab → DB role values to include
const ROLE_TO_DB: Record<RoleTab, string[]> = {
  parent:    ['Parents', 'Duties'],
  youth:     ['Youth', 'Duties'],
  supporter: ['Parents', 'Youth', 'Duties'],
}

const tabConfig: Record<RoleTab, {
  label: string
  icon: React.ReactNode
  billTitle: string
  billDesc: string
  accentColor: string
  badgeStyle: React.CSSProperties
}> = {
  parent: {
    label: 'Parents',
    icon: <Users className="w-4 h-4" />,
    billTitle: "Parent's Bill of Rights",
    billDesc: 'As a parent in dependency court, you have important rights protected by California law. Understanding these rights helps you advocate for yourself and your child.',
    accentColor: '#7A6690',
    badgeStyle: { background: '#E8DDE8', color: '#7A6690' },
  },
  youth: {
    label: 'Youth',
    icon: <User className="w-4 h-4" />,
    billTitle: 'Foster Youth Bill of Rights',
    billDesc: 'If you are in foster care or dependency court, these are your rights under California law. You deserve to be treated with respect and have your voice heard.',
    accentColor: '#4A7C59',
    badgeStyle: { background: 'rgba(74,124,89,0.12)', color: '#4A7C59' },
  },
  supporter: {
    label: 'Supporters',
    icon: <Heart className="w-4 h-4" />,
    billTitle: 'Rights & Responsibilities for Supporters',
    billDesc: 'As a relative caregiver, foster parent, or support person, you have important rights and responsibilities in the dependency process.',
    accentColor: '#C8883A',
    badgeStyle: { background: '#F5ECD8', color: '#C8883A' },
  },
}

export function RightsScreen() {
  const { profile } = useAuth()
  const [activeTab, setActiveTab] = useState<RoleTab>('parent')
  const [allItems, setAllItems] = useState<RightDuty[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [showLegalBasis, setShowLegalBasis] = useState(false)
  const [showDutiesOnly, setShowDutiesOnly] = useState(false)

  // Default tab to user's own role
  useEffect(() => {
    if (profile?.role && ['parent', 'youth', 'supporter'].includes(profile.role)) {
      setActiveTab(profile.role as RoleTab)
    }
  }, [profile?.role])

  useEffect(() => {
    loadRightsAndDuties()
  }, [])

  const loadRightsAndDuties = async () => {
    try {
      const { data, error } = await supabase
        .from('rights_duties')
        .select('id, title, role, description, full_content, plain_language, legal_reference, practical_tips, sort_order')
        .order('sort_order', { ascending: true })
        .order('title', { ascending: true })

      if (error) throw error
      setAllItems(data || [])
      trackEvent('rights_viewed', { role: profile?.role || undefined })
    } catch (error) {
      console.error('Error loading rights and duties:', error)
    } finally {
      setLoading(false)
    }
  }

  // Filter to items relevant to the active tab
  const dbRoles = ROLE_TO_DB[activeTab]
  const visibleItems = allItems.filter(item => dbRoles.includes(item.role))

  const rightsItems = visibleItems.filter(item => item.role !== 'Duties')
  const dutiesItems = visibleItems.filter(item => item.role === 'Duties')

  const displayedRights = showDutiesOnly ? [] : rightsItems
  const displayedDuties = dutiesItems

  const tab = tabConfig[activeTab]

  const renderItem = (item: RightDuty, isDuty: boolean) => {
    const isExpanded = expandedId === item.id
    const badgeStyle = isDuty
      ? { background: '#F5ECD8', color: '#C8883A' }
      : tab.badgeStyle
    const badgeLabel = isDuty ? 'RESPONSIBILITY' : 'RIGHT'

    return (
      <div
        key={item.id}
        onClick={() => setExpandedId(isExpanded ? null : item.id)}
        className="rounded-2xl cursor-pointer transition-all"
        style={{
          background: '#FAF7F4',
          border: isExpanded
            ? `1.5px solid ${isDuty ? '#C8883A' : tab.accentColor}`
            : '1px solid rgba(122,102,144,0.12)',
          boxShadow: isExpanded ? '0 4px 16px rgba(90,78,110,0.10)' : '0 1px 4px rgba(90,78,110,0.05)',
        }}
      >
        <div className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span
                  className="text-xs font-bold px-2 py-0.5 rounded-full uppercase tracking-wide"
                  style={badgeStyle}
                >
                  {badgeLabel}
                </span>
              </div>
              <h3 className="text-base font-bold mb-1" style={{ color: '#2A2030' }}>{item.title}</h3>

              {/* Plain language summary — always shown */}
              {item.plain_language ? (
                <p className="text-sm leading-relaxed" style={{ color: '#5A5065' }}>
                  {isExpanded ? item.plain_language : (
                    item.plain_language.length > 120
                      ? item.plain_language.slice(0, 120) + '…'
                      : item.plain_language
                  )}
                </p>
              ) : (
                <p className="text-sm leading-relaxed" style={{ color: '#5A5065' }}>
                  {isExpanded ? item.description : (
                    item.description.length > 120
                      ? item.description.slice(0, 120) + '…'
                      : item.description
                  )}
                </p>
              )}
            </div>
            <div className="flex-shrink-0 mt-1">
              {isExpanded
                ? <ChevronUp className="w-4 h-4" style={{ color: '#9A90A8' }} />
                : <ChevronDown className="w-4 h-4" style={{ color: '#9A90A8' }} />
              }
            </div>
          </div>

          {/* Expanded content */}
          {isExpanded && (
            <div className="mt-4 space-y-3" onClick={e => e.stopPropagation()}>

              {/* Full content (if different from plain_language) */}
              {item.full_content && item.full_content !== item.plain_language && (
                <div
                  className="rounded-xl p-3"
                  style={{ background: '#F0EAE0' }}
                >
                  <p className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: '#9A90A8' }}>
                    More Detail
                  </p>
                  <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: '#2A2030' }}>
                    {item.full_content}
                  </p>
                </div>
              )}

              {/* Practical tips */}
              {item.practical_tips && (
                <div
                  className="rounded-xl p-3"
                  style={{ background: isDuty ? '#FDF6EC' : '#F4EFF8', border: `1px solid ${isDuty ? 'rgba(200,136,58,0.2)' : 'rgba(122,102,144,0.15)'}` }}
                >
                  <p className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: isDuty ? '#C8883A' : tab.accentColor }}>
                    💡 What this means for you
                  </p>
                  <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: '#2A2030' }}>
                    {item.practical_tips}
                  </p>
                </div>
              )}

              {/* Legal basis (toggle-gated) */}
              {showLegalBasis && item.legal_reference && (
                <div
                  className="rounded-xl p-3"
                  style={{ background: '#F0EAE0', border: '1px solid rgba(122,102,144,0.15)' }}
                >
                  <p className="text-xs font-bold uppercase tracking-wide mb-1" style={{ color: '#9A90A8' }}>
                    Legal Basis
                  </p>
                  <p className="text-xs font-mono" style={{ color: '#5A5065' }}>{item.legal_reference}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#F0EAE0' }}>
        <div className="text-center">
          <div className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin mx-auto mb-3"
            style={{ borderColor: '#7A6690', borderTopColor: 'transparent' }} />
          <p className="text-sm" style={{ color: '#5A5065' }}>Loading rights and responsibilities...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-24" style={{ background: '#F0EAE0' }}>
      <AppHeader />

      <div className="max-w-md mx-auto px-5 py-6">

        {/* ── PAGE TITLE ── */}
        <div className="mb-5">
          <h1
            className="text-3xl font-bold mb-1"
            style={{ fontFamily: "'Fraunces', Georgia, serif", color: '#2A2030' }}
          >
            Your Rights &amp; Responsibilities
          </h1>
          <p className="text-sm" style={{ color: '#5A5065' }}>Know your rights in dependency court</p>
        </div>

        {/* ── CALIFORNIA BADGE ── */}
        <div
          className="flex items-center gap-2 rounded-2xl px-4 py-3 mb-5"
          style={{ background: '#FAF7F4', border: '1px solid rgba(122,102,144,0.12)' }}
        >
          <MapPin className="w-4 h-4 flex-shrink-0" style={{ color: '#7A6690' }} />
          <div>
            <span className="text-xs font-bold" style={{ color: '#2A2030' }}>State: California</span>
            <span className="text-xs ml-2" style={{ color: '#9A90A8' }}>More states coming soon</span>
          </div>
        </div>

        {/* ── ROLE TABS ── */}
        <div
          className="flex rounded-2xl p-1 mb-5"
          style={{ background: '#E8DDE8' }}
        >
          {(Object.keys(tabConfig) as RoleTab[]).map((key) => (
            <button
              key={key}
              onClick={() => {
                setActiveTab(key)
                setExpandedId(null)
                setShowDutiesOnly(false)
              }}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold transition-all"
              style={
                activeTab === key
                  ? { background: '#FAF7F4', color: tabConfig[key].accentColor, boxShadow: '0 2px 8px rgba(122,102,144,0.15)' }
                  : { background: 'transparent', color: '#9A90A8' }
              }
            >
              {tabConfig[key].icon}
              <span>{tabConfig[key].label}</span>
            </button>
          ))}
        </div>

        {/* ── BILL OF RIGHTS HERO ── */}
        <div
          className="rounded-3xl p-5 mb-5"
          style={{
            background: '#FAF7F4',
            border: `1.5px solid ${tab.accentColor}22`,
            boxShadow: '0 2px 12px rgba(90,78,110,0.07)',
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="w-5 h-5" style={{ color: tab.accentColor }} />
            <h2
              className="text-lg font-bold"
              style={{ fontFamily: "'Fraunces', Georgia, serif", color: '#2A2030' }}
            >
              {tab.billTitle}
            </h2>
          </div>
          <p className="text-sm leading-relaxed" style={{ color: '#5A5065' }}>{tab.billDesc}</p>
          <p className="text-xs mt-3 font-semibold" style={{ color: tab.accentColor }}>
            {rightsItems.length} right{rightsItems.length !== 1 ? 's' : ''}
            {dutiesItems.length > 0 && ` · ${dutiesItems.length} responsibilit${dutiesItems.length !== 1 ? 'ies' : 'y'}`}
          </p>
        </div>

        {/* ── TOGGLES ── */}
        <div className="space-y-2 mb-5">
          {/* Show Legal Basis */}
          <div
            className="flex items-center justify-between rounded-2xl px-4 py-3"
            style={{ background: '#FAF7F4', border: '1px solid rgba(122,102,144,0.12)' }}
          >
            <div className="flex items-center gap-2">
              {showLegalBasis
                ? <Eye className="w-4 h-4" style={{ color: '#7A6690' }} />
                : <EyeOff className="w-4 h-4" style={{ color: '#9A90A8' }} />
              }
              <span className="text-sm font-medium" style={{ color: '#2A2030' }}>Show Legal Basis</span>
            </div>
            <button
              onClick={() => setShowLegalBasis(!showLegalBasis)}
              className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
              style={{ background: showLegalBasis ? '#7A6690' : '#D4CDD8' }}
            >
              <span
                className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
                style={{ transform: showLegalBasis ? 'translateX(24px)' : 'translateX(4px)' }}
              />
            </button>
          </div>

          {/* Show Duties Only */}
          {dutiesItems.length > 0 && rightsItems.length > 0 && (
            <div
              className="flex items-center justify-between rounded-2xl px-4 py-3"
              style={{ background: '#FAF7F4', border: '1px solid rgba(122,102,144,0.12)' }}
            >
              <div className="flex items-center gap-2">
                <ListChecks className="w-4 h-4" style={{ color: '#C8883A' }} />
                <span className="text-sm font-medium" style={{ color: '#2A2030' }}>Show Responsibilities Only</span>
              </div>
              <button
                onClick={() => setShowDutiesOnly(!showDutiesOnly)}
                className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
                style={{ background: showDutiesOnly ? '#C8883A' : '#D4CDD8' }}
              >
                <span
                  className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
                  style={{ transform: showDutiesOnly ? 'translateX(24px)' : 'translateX(4px)' }}
                />
              </button>
            </div>
          )}
        </div>

        {/* ── RIGHTS LIST ── */}
        {!showDutiesOnly && displayedRights.length > 0 && (
          <div className="mb-6">
            <h2
              className="text-xs font-bold uppercase tracking-widest mb-3"
              style={{ color: tab.accentColor }}
            >
              Rights ({displayedRights.length})
            </h2>
            <div className="space-y-3">
              {displayedRights.map(item => renderItem(item, false))}
            </div>
          </div>
        )}

        {/* ── DUTIES LIST ── */}
        {displayedDuties.length > 0 && (
          <div className="mb-6">
            <h2
              className="text-xs font-bold uppercase tracking-widest mb-3"
              style={{ color: '#C8883A' }}
            >
              Responsibilities ({displayedDuties.length})
            </h2>
            <div className="space-y-3">
              {displayedDuties.map(item => renderItem(item, true))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {displayedRights.length === 0 && displayedDuties.length === 0 && (
          <div
            className="rounded-3xl p-8 text-center"
            style={{ background: '#FAF7F4', border: '1px solid rgba(122,102,144,0.12)' }}
          >
            <p className="text-sm" style={{ color: '#9A90A8' }}>No information available for this section yet.</p>
          </div>
        )}

        {/* ── KNOW YOUR RIGHTS FOOTER ── */}
        <div
          className="rounded-3xl p-4 mt-6"
          style={{ background: '#F5ECD8', border: '1px solid rgba(200,136,58,0.2)' }}
        >
          <div className="flex gap-3">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#C8883A' }} />
            <div>
              <h3 className="text-sm font-bold mb-1" style={{ color: '#7A5A2A' }}>Know Your Rights</h3>
              <p className="text-xs leading-relaxed" style={{ color: '#7A5A2A' }}>
                If you feel your rights are being violated, tell your attorney immediately. They are there to protect your rights and advocate for you.
              </p>
            </div>
          </div>
        </div>

      </div>

      <BottomNav />
    </div>
  )
}
