import { useState, useEffect } from 'react'
import {
  Search, Heart, Phone, MapPin, Clock, Globe, ExternalLink,
  AlertCircle, BookOpen, Home, MessageCircle, Scale, Users,
  Briefcase, ShoppingBag, Baby, Car, MoreHorizontal, MessageSquare,
  Shield, GraduationCap, FileText, Gavel,
} from 'lucide-react'
import { BottomNav, AppHeader } from '../components'
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

type ParentCategory = 'All' | 'Classes & Workshops' | 'Housing Assistance' | 'Counseling & Support' | 'Legal Services' | 'Parenting Programs'
const PARENT_CATEGORIES: ParentCategory[] = ['All', 'Classes & Workshops', 'Housing Assistance', 'Counseling & Support', 'Legal Services', 'Parenting Programs']

type YouthCategory = 'All' | 'Rights in Foster Care' | 'Court Process for Youth' | 'Education Rights' | 'Mental Health Resources' | 'Legal Representation and CASA' | 'Emancipation / Aging Out' | 'Crisis and Hotline Resources' | 'General Foster Youth Resources'
const YOUTH_CATEGORIES: YouthCategory[] = ['All', 'Crisis and Hotline Resources', 'Rights in Foster Care', 'Court Process for Youth', 'Education Rights', 'Mental Health Resources', 'Legal Representation and CASA', 'Emancipation / Aging Out', 'General Foster Youth Resources']

const CA_COUNTIES = ['All Counties','Los Angeles','Orange County','San Diego','Sacramento','Alameda','Contra Costa','Fresno','Kern','Riverside','San Bernardino','San Francisco','San Joaquin','Santa Clara','Stanislaus','Ventura']

const getParentCategoryIcon = (cat: string) => {
  switch (cat) {
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

const YOUTH_TOPIC_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  'Rights in Foster Care':        { bg: '#F4EFF8', text: '#7A6690', dot: '#7A6690' },
  'Court Process for Youth':      { bg: '#EAF0F8', text: '#3A5A80', dot: '#3A5A80' },
  'Education Rights':             { bg: '#EAF4EE', text: '#4A7C59', dot: '#4A7C59' },
  'Mental Health Resources':      { bg: '#E8F4F4', text: '#3A6A6A', dot: '#4A8A8A' },
  'Legal Representation and CASA':{ bg: '#EAF0F8', text: '#3A4A80', dot: '#4A5AA0' },
  'Emancipation / Aging Out':     { bg: '#F5ECD8', text: '#7A5A2A', dot: '#C8883A' },
  'Crisis and Hotline Resources': { bg: '#FDF0F0', text: '#8A3A3A', dot: '#C84A4A' },
  'General Foster Youth Resources':{ bg: '#F0EAE0', text: '#5A5065', dot: '#9A90A8' },
}

const PARENT_CAT_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  'Classes & Workshops': { bg: '#EAF4EE', text: '#4A7C59', dot: '#4A7C59' },
  'Housing Assistance':  { bg: '#EAF0F8', text: '#3A5A80', dot: '#3A5A80' },
  'Counseling & Support':{ bg: '#F4EFF8', text: '#7A6690', dot: '#7A6690' },
  'Legal Services':      { bg: '#EAF0F8', text: '#3A4A80', dot: '#4A5AA0' },
  'Parenting Programs':  { bg: '#F5ECD8', text: '#7A5A2A', dot: '#C8883A' },
}

export function Resources() {
  const { profile } = useAuth()
  const isYouth = profile?.role === 'youth'

  const [resources, setResources] = useState<Resource[]>([])
  const [filteredResources, setFilteredResources] = useState<Resource[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedParentCategory, setSelectedParentCategory] = useState<ParentCategory>('All')
  const [selectedCounty, setSelectedCounty] = useState('All Counties')
  const [selectedYouthCategory, setSelectedYouthCategory] = useState<YouthCategory>('All')

  useEffect(() => { loadResources() }, [profile?.role])

  useEffect(() => {
    let filtered = resources
    if (isYouth) {
      if (selectedYouthCategory !== 'All') filtered = filtered.filter((r) => r.topic_category === selectedYouthCategory)
    } else {
      if (selectedParentCategory !== 'All') filtered = filtered.filter((r) => r.category === selectedParentCategory)
      if (selectedCounty !== 'All Counties') filtered = filtered.filter((r) => r.county === selectedCounty)
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      filtered = filtered.filter((r) =>
        r.name?.toLowerCase().includes(q) ||
        r.description?.toLowerCase().includes(q) ||
        r.topic_category?.toLowerCase().includes(q) ||
        r.category?.toLowerCase().includes(q)
      )
    }
    setFilteredResources(filtered)
  }, [resources, searchQuery, selectedParentCategory, selectedCounty, selectedYouthCategory])

  const loadResources = async () => {
    try {
      setLoading(true)
      const role = profile?.role || 'parent'
      const { data, error: fetchError } = await supabase
        .from('resources').select('*').contains('user_role', [role]).order('name', { ascending: true })
      if (fetchError) throw fetchError
      setResources(data || [])
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load resources')
    } finally {
      setLoading(false)
    }
  }

  const handleWebsiteClick = async (resourceId: string, website: string) => {
    try {
      const current = resources.find((r) => r.id === resourceId)
      await supabase.from('resources').update({ click_count: (current?.click_count || 0) + 1 }).eq('id', resourceId)
    } catch (_) {}
    window.open(website, '_blank', 'noopener,noreferrer')
  }

  const pillBtn = (active: boolean, colors?: { bg: string; text: string; dot: string }): React.CSSProperties => ({
    padding: '7px 14px', borderRadius: 20, whiteSpace: 'nowrap',
    border: active && colors ? `1.5px solid ${colors.dot}` : active ? '1.5px solid #7A6690' : '1.5px solid transparent',
    background: active && colors ? colors.bg : active ? '#F4EFF8' : '#FAF7F4',
    color: active && colors ? colors.text : active ? '#7A6690' : '#9A90A8',
    fontFamily: 'DM Sans, sans-serif', fontSize: 13, fontWeight: 600,
    cursor: 'pointer',
  })

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#EDE6DB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 48, height: 48, borderRadius: '50%', border: '3px solid #E8DDE8', borderTopColor: '#7A6690', animation: 'spin 0.8s linear infinite', margin: '0 auto' }} />
        <p style={{ marginTop: 16, color: '#5A5065', fontFamily: 'DM Sans, sans-serif' }}>Loading resources…</p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )

  if (error) return (
    <div style={{ minHeight: '100vh', background: '#EDE6DB', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 24px' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#FDF0F0', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
          <AlertCircle size={28} color="#C84A4A" />
        </div>
        <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 22, fontWeight: 700, color: '#2A2030', marginBottom: 8 }}>Couldn't load resources</h2>
        <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 14, color: '#5A5065', marginBottom: 20 }}>{error}</p>
        <button onClick={() => { setLoading(true); setError(null); loadResources() }}
          style={{ background: '#7A6690', color: '#fff', border: 'none', borderRadius: 16, padding: '12px 24px', fontFamily: 'DM Sans, sans-serif', fontWeight: 600, fontSize: 15, cursor: 'pointer' }}>
          Try Again
        </button>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#EDE6DB' }}>
      <AppHeader title="Resources" />

      <div style={{ maxWidth: 480, margin: '0 auto', padding: '24px 20px 100px' }}>

        {/* Header */}
        <div style={{ marginBottom: 20 }}>
          <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: 28, fontWeight: 700, color: '#2A2030', margin: 0 }}>
            {isYouth ? 'Your Resources' : 'Local Resources'}
          </h1>
          <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 14, color: '#9A90A8', marginTop: 4 }}>
            {isYouth ? 'Rights, legal help, education, and crisis support' : 'Find classes, services, and support in your area'}
          </p>
        </div>

        {/* Crisis card */}
        <div style={{ background: '#FDF0F0', border: '1px solid rgba(200,74,74,0.2)', borderRadius: 20, padding: '18px', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <div style={{ width: 36, height: 36, borderRadius: 12, background: '#C84A4A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Heart size={18} color="#fff" />
            </div>
            <span style={{ fontFamily: 'Fraunces, serif', fontSize: 17, fontWeight: 700, color: '#2A2030' }}>Need Help Right Now?</span>
          </div>

          {isYouth ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ background: '#FAF7F2', borderRadius: 14, padding: '14px' }}>
                <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, fontWeight: 700, color: '#2A2030', margin: '0 0 4px' }}>Cal-FURS — Foster Youth Crisis Line</p>
                <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: '#5A5065', margin: '0 0 10px', lineHeight: 1.5 }}>24/7 crisis support for foster youth. Mobile response teams available.</p>
                <a href="tel:1-833-939-3877" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#C84A4A', color: '#fff', borderRadius: 12, padding: '8px 14px', fontFamily: 'DM Sans, sans-serif', fontWeight: 600, fontSize: 13, textDecoration: 'none' }}>
                  <Phone size={13} /> Call or Text 1-833-939-3877
                </a>
              </div>
              <div style={{ background: '#FAF7F2', borderRadius: 14, padding: '14px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                {[['988 Crisis Line', 'tel:988', '988'],['Crisis Text Line', 'sms:741741', 'Text HOME to 741741'],['CA Youth Crisis', 'tel:1-800-843-5200', '1-800-843-5200'],['Foster Care Ombudsperson', 'tel:1-877-846-1602', '1-877-846-1602']].map(([label, href, display]) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: '#5A5065' }}>{label}</span>
                    <a href={href} style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, fontWeight: 700, color: '#C84A4A', textDecoration: 'none' }}>{display}</a>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ background: '#FAF7F2', borderRadius: 14, padding: '14px' }}>
                <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, fontWeight: 700, color: '#2A2030', margin: '0 0 4px' }}>Dial 211</p>
                <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: '#5A5065', margin: '0 0 10px', lineHeight: 1.5 }}>Free, confidential 24/7 help. Food, housing, healthcare, childcare, and more.</p>
                <a href="tel:211" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#C84A4A', color: '#fff', borderRadius: 12, padding: '8px 14px', fontFamily: 'DM Sans, sans-serif', fontWeight: 600, fontSize: 13, textDecoration: 'none' }}>
                  <Phone size={13} /> Call 211 Now
                </a>
              </div>
              <div style={{ background: '#FAF7F2', borderRadius: 14, padding: '14px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                {[['CA Parent Warmline', 'tel:1-855-627-6437', '1-855-627-6437'],['Crisis Text Line', 'sms:741741', 'Text HOME to 741741'],['988 Suicide & Crisis', 'tel:988', '988'],['Domestic Violence', 'tel:1-800-799-7233', '1-800-799-7233']].map(([label, href, display]) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: '#5A5065' }}>{label}</span>
                    <a href={href} style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, fontWeight: 700, color: '#C84A4A', textDecoration: 'none' }}>{display}</a>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* County mental health — parents only */}
        {!isYouth && (
          <div style={{ background: '#EAF0F8', border: '1px solid rgba(58,90,128,0.15)', borderRadius: 20, padding: '16px 18px', marginBottom: 16 }}>
            <p style={{ fontFamily: 'Fraunces, serif', fontSize: 16, fontWeight: 700, color: '#2A2030', margin: '0 0 10px' }}>County Mental Health Lines</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              {[['Los Angeles','800-854-7771'],['Orange County','855-625-4657'],['San Diego','888-724-7240'],['Sacramento','916-875-1055']].map(([county, num]) => (
                <div key={county} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: '#5A5065' }}>{county}</span>
                  <a href={`tel:${num}`} style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, fontWeight: 700, color: '#3A5A80', textDecoration: 'none' }}>{num}</a>
                </div>
              ))}
            </div>
            <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: '#3A5A80', marginTop: 10 }}>Not your county? Dial 211 for local numbers</p>
          </div>
        )}

        {/* Search */}
        <div style={{ position: 'relative', marginBottom: 14 }}>
          <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#9A90A8' }} />
          <input
            type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isYouth ? 'Search rights, court, education…' : 'Search resources…'}
            style={{ width: '100%', boxSizing: 'border-box', padding: '12px 16px 12px 40px', background: '#FAF7F2', border: '1.5px solid rgba(122,102,144,0.2)', borderRadius: 16, fontFamily: 'DM Sans, sans-serif', fontSize: 15, color: '#2A2030', outline: 'none' }}
          />
        </div>

        {/* Filters */}
        {isYouth ? (
          <div style={{ overflowX: 'auto', marginBottom: 16 }}>
            <div style={{ display: 'flex', gap: 8, paddingBottom: 4 }}>
              {YOUTH_CATEGORIES.map((cat) => (
                <button key={cat} onClick={() => setSelectedYouthCategory(cat)}
                  style={pillBtn(selectedYouthCategory === cat, YOUTH_TOPIC_COLORS[cat])}>
                  {cat}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            <div style={{ marginBottom: 10 }}>
              <select value={selectedCounty} onChange={(e) => setSelectedCounty(e.target.value)}
                style={{ width: '100%', padding: '11px 16px', background: '#FAF7F2', border: '1.5px solid rgba(122,102,144,0.2)', borderRadius: 16, fontFamily: 'DM Sans, sans-serif', fontSize: 14, color: '#2A2030', outline: 'none', appearance: 'none' }}>
                {CA_COUNTIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div style={{ overflowX: 'auto', marginBottom: 16 }}>
              <div style={{ display: 'flex', gap: 8, paddingBottom: 4 }}>
                {PARENT_CATEGORIES.map((cat) => (
                  <button key={cat} onClick={() => setSelectedParentCategory(cat)}
                    style={pillBtn(selectedParentCategory === cat, PARENT_CAT_COLORS[cat])}>
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Result count */}
        <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: '#9A90A8', marginBottom: 14 }}>
          {filteredResources.length} {filteredResources.length === 1 ? 'resource' : 'resources'} found
        </p>

        {/* Empty state */}
        {filteredResources.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 0' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#E8DDE8', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <AlertCircle size={28} color="#7A6690" />
            </div>
            <h3 style={{ fontFamily: 'Fraunces, serif', fontSize: 20, fontWeight: 700, color: '#2A2030', marginBottom: 8 }}>No resources found</h3>
            <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 14, color: '#9A90A8', marginBottom: 20 }}>Try adjusting your filters or search</p>
            <a href={isYouth ? 'tel:1-877-846-1602' : 'tel:211'}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#7A6690', color: '#fff', borderRadius: 16, padding: '12px 20px', fontFamily: 'DM Sans, sans-serif', fontWeight: 600, fontSize: 14, textDecoration: 'none' }}>
              <Phone size={14} />
              {isYouth ? 'Call Ombudsperson' : 'Call 211 for Help'}
            </a>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filteredResources.map((resource) => {
              const IconComponent = isYouth ? getYouthTopicIcon(resource.topic_category) : getParentCategoryIcon(resource.category)
              const colors = isYouth
                ? (YOUTH_TOPIC_COLORS[resource.topic_category] || YOUTH_TOPIC_COLORS['General Foster Youth Resources'])
                : (PARENT_CAT_COLORS[resource.category] || { bg: '#F4EFF8', text: '#7A6690', dot: '#7A6690' })

              return (
                <div key={resource.id} style={{ background: '#FAF7F2', border: '1px solid rgba(255,255,255,0.88)', borderRadius: 20, padding: '16px' }}>
                  {/* Title row */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 10 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 12, background: colors.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <IconComponent size={18} color={colors.dot} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ fontFamily: 'Fraunces, serif', fontSize: 16, fontWeight: 700, color: '#2A2030', margin: '0 0 4px' }}>{resource.name}</h3>
                      {/* Category pill */}
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: colors.bg, color: colors.text, borderRadius: 20, padding: '2px 8px', fontFamily: 'DM Sans, sans-serif', fontSize: 11, fontWeight: 600 }}>
                        <span style={{ width: 5, height: 5, borderRadius: '50%', background: colors.dot, display: 'inline-block' }} />
                        {isYouth ? resource.topic_category : resource.category}
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: '#5A5065', margin: '0 0 12px', lineHeight: 1.6 }}>{resource.description}</p>

                  {/* Tags row */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
                    {resource.target_age_range && (
                      <span style={{ background: '#EDE6DB', color: '#5A5065', borderRadius: 20, padding: '2px 8px', fontFamily: 'DM Sans, sans-serif', fontSize: 11, fontWeight: 600 }}>{resource.target_age_range}</span>
                    )}
                    {resource.geographic_scope && !['Statewide','National'].includes(resource.geographic_scope) && (
                      <span style={{ background: '#EAF0F8', color: '#3A5A80', borderRadius: 20, padding: '2px 8px', fontFamily: 'DM Sans, sans-serif', fontSize: 11, fontWeight: 600 }}>{resource.geographic_scope}</span>
                    )}
                    {!isYouth && resource.cost && (
                      <span style={{ background: resource.cost === 'Free' ? '#EAF4EE' : resource.cost === 'Sliding Scale' ? '#EAF0F8' : '#F0EAE0', color: resource.cost === 'Free' ? '#4A7C59' : resource.cost === 'Sliding Scale' ? '#3A5A80' : '#5A5065', borderRadius: 20, padding: '2px 8px', fontFamily: 'DM Sans, sans-serif', fontSize: 11, fontWeight: 600 }}>{resource.cost}</span>
                    )}
                  </div>

                  {/* Details — parents only */}
                  {!isYouth && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
                      {resource.address && (
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                          <MapPin size={13} color="#9A90A8" style={{ marginTop: 2, flexShrink: 0 }} />
                          <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: '#5A5065' }}>{resource.address}</span>
                        </div>
                      )}
                      {resource.hours && (
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                          <Clock size={13} color="#9A90A8" style={{ marginTop: 2, flexShrink: 0 }} />
                          <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: '#5A5065' }}>{resource.hours}</span>
                        </div>
                      )}
                      {resource.languages?.length > 0 && (
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                          <Globe size={13} color="#9A90A8" style={{ marginTop: 2, flexShrink: 0 }} />
                          <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: '#5A5065' }}>{resource.languages.join(', ')}</span>
                        </div>
                      )}
                      {resource.availability_note && (
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, background: '#F5ECD8', borderRadius: 10, padding: '8px 10px' }}>
                          <AlertCircle size={13} color="#C8883A" style={{ marginTop: 2, flexShrink: 0 }} />
                          <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: '#7A5A2A' }}>{resource.availability_note}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Action buttons */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {resource.phone && (
                      <a href={`tel:${resource.phone}`}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#EAF4EE', color: '#4A7C59', borderRadius: 12, padding: '8px 14px', fontFamily: 'DM Sans, sans-serif', fontWeight: 600, fontSize: 13, textDecoration: 'none' }}>
                        <Phone size={13} /> {resource.phone}
                      </a>
                    )}
                    {resource.text_line && (
                      <a href={`sms:${resource.text_line.split(' ')[0]}`}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#EAF0F8', color: '#3A5A80', borderRadius: 12, padding: '8px 14px', fontFamily: 'DM Sans, sans-serif', fontWeight: 600, fontSize: 13, textDecoration: 'none' }}>
                        <MessageSquare size={13} /> Text
                      </a>
                    )}
                    {resource.website && (
                      <button onClick={() => handleWebsiteClick(resource.id, resource.website)}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#F4EFF8', color: '#7A6690', border: 'none', borderRadius: 12, padding: '8px 14px', fontFamily: 'DM Sans, sans-serif', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
                        <ExternalLink size={13} /> {resource.type?.includes('PDF') ? 'Open PDF' : 'Website'}
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <BottomNav />
    </div>
  )
}
