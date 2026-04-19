import { useState, useEffect } from 'react'
import { MapPin, Users, User, Heart, ListChecks, ChevronDown, ChevronUp, AlertTriangle, Eye, EyeOff, BookOpen } from 'lucide-react'
import { BottomNav, AppHeader } from '../components'
import { supabase } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { trackEvent } from '../lib/analytics'
import { haptics } from '../lib/haptics'

interface RightDuty {
  id: string
  title: string
  user_role: string
  right_key: string
  category: string
  description: string
  legal_reference: string
  practical_tips: string
}

type RoleTab = 'parent' | 'youth' | 'supporter'

const tabConfig: Record<RoleTab, {
  label: string
  icon: React.ReactNode
  billTitle: string
  billDesc: string
  accentColor: string
  accentBg: string
  rightBadge: { background: string; color: string }
}> = {
  parent: {
    label: 'Parents',
    icon: <Users size={14} />,
    billTitle: "Parent's Bill of Rights",
    billDesc: 'As a parent in dependency court, you have important rights protected by California law. Understanding these rights helps you advocate for yourself and your child.',
    accentColor: '#7A6690',
    accentBg: '#E8DDE8',
    rightBadge: { background: '#E8DDE8', color: '#7A6690' },
  },
  youth: {
    label: 'Youth',
    icon: <User size={14} />,
    billTitle: 'Foster Youth Bill of Rights',
    billDesc: 'If you are in foster care or dependency court, these are your rights under California law. You deserve to be treated with respect and have your voice heard.',
    accentColor: '#4A7C59',
    accentBg: '#EAF4EE',
    rightBadge: { background: '#EAF4EE', color: '#4A7C59' },
  },
  supporter: {
    label: 'Supporters',
    icon: <Heart size={14} />,
    billTitle: 'Rights & Responsibilities for Supporters',
    billDesc: 'As a relative caregiver, foster parent, or support person, you have important rights and responsibilities in the dependency process.',
    accentColor: '#C8883A',
    accentBg: '#F5ECD8',
    rightBadge: { background: '#F5ECD8', color: '#C8883A' },
  },
}

export function RightsScreen() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<RoleTab>('parent')
  const [allItems, setAllItems] = useState<RightDuty[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [showLegalBasis, setShowLegalBasis] = useState(false)
  const [showDutiesOnly, setShowDutiesOnly] = useState(false)

  useEffect(() => {
    if (profile?.role && ['parent', 'youth', 'supporter'].includes(profile.role)) {
      setActiveTab(profile.role as RoleTab)
    }
  }, [profile?.role])

  useEffect(() => { loadRightsAndDuties() }, [])

  const loadRightsAndDuties = async () => {
    try {
      const { data, error } = await supabase
        .from('rights_duties')
        .select('id, title, user_role, right_key, category, description, legal_reference, practical_tips')
        .order('category', { ascending: true })
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

  const visibleItems = allItems.filter(item =>
    item.user_role === activeTab || item.user_role === 'both'
  )
  const rightsItems = visibleItems.filter(item => item.category === 'right')
  const dutiesItems = visibleItems.filter(item => item.category === 'duty')
  const tab = tabConfig[activeTab]

  const renderItem = (item: RightDuty, isDuty: boolean) => {
    const isExpanded = expandedId === item.id
    const badgeStyle = isDuty ? { background: '#F5ECD8', color: '#C8883A' } : tab.rightBadge

    return (
      <div
        key={item.id}
        onClick={() => { haptics.light(); setExpandedId(isExpanded ? null : item.id) }}
        style={{
          background: '#FAF7F2',
          border: isExpanded
            ? `1.5px solid ${isDuty ? '#C8883A' : tab.accentColor}`
            : '1px solid rgba(122,102,144,0.12)',
          borderRadius: 20,
          cursor: 'pointer',
          overflow: 'hidden',
        }}
      >
        <div style={{ padding: '14px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <span style={{
                display: 'inline-block',
                fontFamily: 'DM Sans, sans-serif', fontSize: 10, fontWeight: 700,
                padding: '2px 10px', borderRadius: 20,
                textTransform: 'uppercase', letterSpacing: '0.05em',
                marginBottom: 6,
                ...badgeStyle,
              }}>
                {isDuty ? 'Responsibility' : 'Right'}
              </span>
              <h3 style={{ fontFamily: 'Fraunces, serif', fontSize: 16, fontWeight: 700, color: '#2A2030', margin: '0 0 4px', lineHeight: 1.3 }}>
                {item.title}
              </h3>
              <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: '#4A4058', margin: 0, lineHeight: 1.6 }}>
                {isExpanded
                  ? item.description
                  : item.description.length > 120
                    ? item.description.slice(0, 120) + '…'
                    : item.description
                }
              </p>
            </div>
            <div style={{ flexShrink: 0, marginTop: 2 }}>
              {isExpanded
                ? <ChevronUp size={16} color="#9A90A8" />
                : <ChevronDown size={16} color="#9A90A8" />
              }
            </div>
          </div>

          {isExpanded && (
            <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 10 }} onClick={e => e.stopPropagation()}>

              {item.practical_tips && (
                <div style={{
                  background: isDuty ? '#FDF6EC' : '#F4EFF8',
                  border: `1px solid ${isDuty ? 'rgba(200,136,58,0.2)' : 'rgba(122,102,144,0.15)'}`,
                  borderRadius: 14, padding: '12px 14px',
                }}>
                  <p style={{
                    fontFamily: 'DM Sans, sans-serif', fontSize: 11, fontWeight: 700,
                    textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 6px',
                    color: isDuty ? '#C8883A' : tab.accentColor,
                  }}>
                    What this means for you
                  </p>
                  <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: '#2A2030', margin: 0, lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                    {item.practical_tips}
                  </p>
                </div>
              )}

              {showLegalBasis && item.legal_reference && (
                <div style={{
                  background: '#EDE6DB',
                  border: '1px solid rgba(122,102,144,0.15)',
                  borderRadius: 14, padding: '12px 14px',
                }}>
                  <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#8A8098', margin: '0 0 4px' }}>
                    Legal basis
                  </p>
                  <p style={{ fontFamily: 'DM Mono, monospace', fontSize: 12, color: '#4A4058', margin: 0 }}>
                    {item.legal_reference}
                  </p>
                </div>
              )}
              <button
                onClick={() => navigate('/glossary')}
                style={{ alignSelf: 'flex-start', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', fontSize: 12, fontWeight: 700, color: tab.accentColor, padding: 0, display: 'flex', alignItems: 'center', gap: 4 }}
              >
                Look up terms in Glossary →
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#EDE6DB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 44, height: 44, border: '3px solid #7A6690', borderTopColor: 'transparent', boxShadow: '0 0 12px rgba(122,102,144,0.2)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
          <p style={{ fontFamily: 'DM Sans, sans-serif', color: '#8A8098', fontSize: 14 }}>Loading rights and responsibilities…</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#EDE6DB', display: 'flex', flexDirection: 'column' }}>
      <AppHeader />

      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 90 }}>
        <div style={{ maxWidth: 480, margin: '0 auto', padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Page title */}
          <div>
            <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: 28, fontWeight: 700, color: '#2A2030', margin: '0 0 4px' }}>
              Your Rights &amp; Responsibilities
            </h1>
            <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 14, color: '#8A8098', margin: 0 }}>
              Know your rights in dependency court
            </p>
          </div>

          {/* California badge — locked, clearly labeled */}
          <div style={{
            background: '#FAF7F2', borderRadius: 16, padding: '10px 14px',
            display: 'flex', alignItems: 'center', gap: 8,
            border: '1px solid rgba(255,255,255,0.88)',
          }}>
            <MapPin size={14} color="#7A6690" style={{ flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, fontWeight: 700, color: '#2A2030' }}>California</span>
              <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 11, color: '#8A8098', marginLeft: 6 }}>Currently available</span>
            </div>
            <span style={{
              fontFamily: 'DM Sans, sans-serif', fontSize: 10, fontWeight: 700,
              background: '#E8DDE8', color: '#7A6690',
              borderRadius: 20, padding: '2px 10px',
            }}>More states soon</span>
          </div>

          {/* Role tabs */}
          <div style={{ background: '#E8DDE8', borderRadius: 20, padding: 4, display: 'flex', gap: 4 }}>
            {(Object.keys(tabConfig) as RoleTab[]).map((key) => (
              <button
                key={key}
                onClick={() => { haptics.light(); setActiveTab(key); setExpandedId(null); setShowDutiesOnly(false) }}
                style={{
                  flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  padding: '10px 4px', borderRadius: 16, border: 'none', cursor: 'pointer',
                  fontFamily: 'DM Sans, sans-serif', fontSize: 12, fontWeight: 700,
                  transition: 'all 0.15s',
                  ...(activeTab === key
                    ? { background: '#FAF7F2', color: tabConfig[key].accentColor, boxShadow: '0 2px 8px rgba(122,102,144,0.15)' }
                    : { background: 'transparent', color: '#8A8098' }
                  ),
                }}
              >
                {tabConfig[key].icon}
                <span>{tabConfig[key].label}</span>
              </button>
            ))}
          </div>

          {/* Bill of rights hero */}
          <div style={{
            background: '#FAF7F2', borderRadius: 20, padding: '16px 18px',
            border: `1.5px solid ${tab.accentColor}33`,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <BookOpen size={16} color={tab.accentColor} />
              <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 18, fontWeight: 700, color: '#2A2030', margin: 0 }}>
                {tab.billTitle}
              </h2>
            </div>
            <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: '#4A4058', margin: '0 0 10px', lineHeight: 1.6 }}>
              {tab.billDesc}
            </p>
            <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, fontWeight: 700, color: tab.accentColor, margin: 0 }}>
              {rightsItems.length} right{rightsItems.length !== 1 ? 's' : ''}
              {dutiesItems.length > 0 && ` · ${dutiesItems.length} responsibilit${dutiesItems.length !== 1 ? 'ies' : 'y'}`}
            </p>
          </div>

          {/* Toggles */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {/* Show legal basis */}
            <div style={{
              background: '#FAF7F2', borderRadius: 16, padding: '12px 16px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              border: '1px solid rgba(255,255,255,0.88)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {showLegalBasis
                  ? <Eye size={15} color="#7A6690" />
                  : <EyeOff size={15} color="#9A90A8" />
                }
                <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, fontWeight: 600, color: '#2A2030' }}>
                  Show Legal Basis
                </span>
              </div>
              <button
                onClick={() => { haptics.light(); setShowLegalBasis(!showLegalBasis) }}
                style={{
                  width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer',
                  background: showLegalBasis ? '#7A6690' : '#D4CDD8',
                  position: 'relative', transition: 'background 0.2s', flexShrink: 0,
                }}
              >
                <span style={{
                  position: 'absolute', top: 4, width: 16, height: 16,
                  borderRadius: '50%', background: '#fff',
                  transition: 'left 0.2s',
                  left: showLegalBasis ? 24 : 4,
                }} />
              </button>
            </div>

            {/* Show responsibilities only */}
            {dutiesItems.length > 0 && rightsItems.length > 0 && (
              <div style={{
                background: '#FAF7F2', borderRadius: 16, padding: '12px 16px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                border: '1px solid rgba(255,255,255,0.88)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <ListChecks size={15} color="#C8883A" />
                  <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, fontWeight: 600, color: '#2A2030' }}>
                    Show Responsibilities Only
                  </span>
                </div>
                <button
                  onClick={() => { haptics.light(); setShowDutiesOnly(!showDutiesOnly) }}
                  style={{
                    width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer',
                    background: showDutiesOnly ? '#C8883A' : '#D4CDD8',
                    position: 'relative', transition: 'background 0.2s', flexShrink: 0,
                  }}
                >
                  <span style={{
                    position: 'absolute', top: 4, width: 16, height: 16,
                    borderRadius: '50%', background: '#fff',
                    transition: 'left 0.2s',
                    left: showDutiesOnly ? 24 : 4,
                  }} />
                </button>
              </div>
            )}
          </div>

          {/* Rights list */}
          {!showDutiesOnly && rightsItems.length > 0 && (
            <div>
              <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 11, fontWeight: 700, color: tab.accentColor, textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 10px' }}>
                Rights ({rightsItems.length})
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {rightsItems.map(item => renderItem(item, false))}
              </div>
            </div>
          )}

          {/* Duties list */}
          {dutiesItems.length > 0 && (
            <div>
              <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 11, fontWeight: 700, color: '#C8883A', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 10px' }}>
                Responsibilities ({dutiesItems.length})
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {dutiesItems.map(item => renderItem(item, true))}
              </div>
            </div>
          )}

          {/* Empty state */}
          {visibleItems.length === 0 && (
            <div style={{ background: '#FAF7F2', borderRadius: 20, padding: '40px 24px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.88)' }}>
              <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 14, color: '#8A8098', margin: 0 }}>
                No information available for this section yet.
              </p>
            </div>
          )}

          {/* Footer warning */}
          <div style={{
            background: '#F5ECD8', borderRadius: 20, padding: '14px 16px',
            border: '1px solid rgba(200,136,58,0.2)',
            display: 'flex', gap: 10,
          }}>
            <AlertTriangle size={15} color="#C8883A" style={{ flexShrink: 0, marginTop: 2 }} />
            <div>
              <h3 style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, fontWeight: 700, color: '#7A5A2A', margin: '0 0 4px' }}>
                Know Your Rights
              </h3>
              <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: '#7A5A2A', margin: 0, lineHeight: 1.6 }}>
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
