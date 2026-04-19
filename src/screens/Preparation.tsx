import { useState, useEffect } from 'react'
import {
  FileText,
  Users,
  CheckCircle,
  Sparkles,
  Save,
  RotateCcw,
  AlertCircle,
  Loader2,
  Send,
  Lock,
  X,
  Check,
} from 'lucide-react'
import { BottomNav, AppHeader } from '../components'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { trackEvent } from '../lib/analytics'

type PrepType = 'hearing' | 'meeting' | 'after_hearing' | null
type Role = 'parent' | 'youth' | 'supporter'
type MeetingType = 'attorney' | 'social_worker' | 'casa' | 'therapist' | 'other' | null

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

// ── ROLE COPY ────────────────────────────────────────────────────────────────
const COPY = {
  parent: {
    heading: 'Get Ready',
    subheading: 'A little preparation goes a long way.',
    privacyNote: 'None of your notes are shared with CPS or the court.',
    prepOptions: [
      { type: 'hearing' as PrepType, icon: FileText, title: 'Before a Hearing', description: 'What to say, what to bring, what to expect.' },
      { type: 'meeting' as PrepType, icon: Users, title: 'Before a Meeting', description: 'Prepare for your attorney or social worker.' },
      { type: 'after_hearing' as PrepType, icon: CheckCircle, title: 'After a Hearing', description: 'Make sense of what happened and what is next.' },
    ],
    meetingTypes: [
      { value: 'attorney', label: 'My Attorney' },
      { value: 'social_worker', label: 'Social Worker' },
      { value: 'therapist', label: 'Therapist / Counselor' },
      { value: 'other', label: 'Other' },
    ],
    questionLabel: (type: PrepType) => type === 'meeting' ? 'What do you want to talk about?' : 'What is on your mind right now?',
    placeholder: (type: PrepType) => type === 'after_hearing'
      ? "E.g., 'The judge said I need to complete parenting classes — I don't know what that means'"
      : type === 'meeting'
      ? "E.g., 'I want to understand my case plan better'"
      : "E.g., 'I'm worried about what the judge will think about my housing'",
    followUpPlaceholder: 'Ask a follow-up question...',
  },
  youth: {
    heading: 'Get Ready',
    subheading: 'Your thoughts matter. Let\'s organize them.',
    privacyNote: 'None of this is shared with your parents, social worker, or the court.',
    prepOptions: [
      { type: 'hearing' as PrepType, icon: FileText, title: 'Before Court', description: 'What to say, what to expect, how to feel ready.' },
      { type: 'meeting' as PrepType, icon: Users, title: 'Before a Meeting', description: 'Get ready to talk to your lawyer, social worker, or CASA.' },
      { type: 'after_hearing' as PrepType, icon: CheckCircle, title: 'After Court', description: 'Make sense of what happened.' },
    ],
    meetingTypes: [
      { value: 'attorney', label: 'My Lawyer' },
      { value: 'social_worker', label: 'Social Worker' },
      { value: 'casa', label: 'CASA Volunteer' },
      { value: 'therapist', label: 'Therapist' },
      { value: 'other', label: 'Someone Else' },
    ],
    questionLabel: (_type: PrepType) => 'What is on your mind?',
    placeholder: (type: PrepType) => type === 'after_hearing'
      ? "E.g., 'The judge talked about adoption and I don't know what that means for me'"
      : type === 'meeting'
      ? "E.g., 'I want to talk about changing my placement'"
      : "E.g., 'I want the judge to know I want to stay with my current foster family'",
    followUpPlaceholder: 'Ask something else...',
  },
  supporter: {
    heading: 'Get Ready',
    subheading: 'Being prepared helps you show up for them.',
    privacyNote: 'None of this is shared with anyone.',
    prepOptions: [
      { type: 'hearing' as PrepType, icon: FileText, title: 'Before a Hearing', description: 'How to support someone going to court.' },
      { type: 'meeting' as PrepType, icon: Users, title: 'Before a Meeting', description: 'Prepare to support someone meeting with professionals.' },
      { type: 'after_hearing' as PrepType, icon: CheckCircle, title: 'After a Hearing', description: 'How to help them process what happened.' },
    ],
    meetingTypes: [
      { value: 'social_worker', label: 'Social Worker' },
      { value: 'attorney', label: 'Attorney' },
      { value: 'other', label: 'Other Professional' },
    ],
    questionLabel: (_type: PrepType) => 'What do you need help with?',
    placeholder: (_type: PrepType) => "E.g., 'She is really scared about her hearing next week and I don't know how to help'",
    followUpPlaceholder: 'Ask a follow-up...',
  },
}

export function Preparation() {
  const { user, profile } = useAuth()
  const userRole: Role = (profile?.role as Role) || 'parent'
  const copy = COPY[userRole]

  const [selectedType, setSelectedType] = useState<PrepType>(null)
  const [meetingType, setMeetingType] = useState<MeetingType>(null)
  const [concerns, setConcerns] = useState('')
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([])
  const [followUp, setFollowUp] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentStage, setCurrentStage] = useState<string | null>(null)
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [saveTitle, setSaveTitle] = useState('')
  const [savedSuccess, setSavedSuccess] = useState(false)

  useEffect(() => {
    const fetchStage = async () => {
      if (!user) return
      const { data } = await supabase.from('profiles').select('current_stage').eq('id', user.id).maybeSingle()
      if (data?.current_stage) setCurrentStage(data.current_stage)
    }
    fetchStage()
  }, [user])

  const getAuthHeaders = async () => {
    const { data } = await supabase.auth.getSession()
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${data.session?.access_token}`,
    }
  }

  const handleGenerate = async () => {
    if (!selectedType || !concerns.trim()) return
    if (selectedType === 'meeting' && !meetingType) return

    setLoading(true)
    setError(null)

    try {
      const concernsWithContext = selectedType === 'meeting' && meetingType
        ? `${concerns} (meeting with: ${copy.meetingTypes.find(m => m.value === meetingType)?.label})`
        : concerns

      const headers = await getAuthHeaders()
      const res = await fetch(
        'https://dmrmgpidvfcywilcsmff.supabase.co/functions/v1/generate-preparation-guide',
        {
          method: 'POST',
          headers,
          body: JSON.stringify({
            prepType: selectedType,
            concerns: concernsWithContext,
            currentStage,
            userRole,
          }),
        }
      )

      if (!res.ok) throw new Error('Failed to generate guidance')
      const data = await res.json()
      if (!data.response) throw new Error('No response received')

      setChatHistory([
        { role: 'user', content: concerns },
        { role: 'assistant', content: data.response },
      ])
      trackEvent('preparation_started', { role: userRole, prep_type: selectedType })

      if (user) {
        await supabase.from('preparation_notes').insert({
          user_id: user.id,
          prep_type: selectedType,
          concerns,
          generated_guide: { content: data.response },
          exported: false,
        })
      }
    } catch (err) {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleFollowUp = async () => {
    if (!followUp.trim() || loading) return

    const newMsg: ChatMessage = { role: 'user', content: followUp }
    const updated = [...chatHistory, newMsg]
    setChatHistory(updated)
    setFollowUp('')
    setLoading(true)
    setError(null)

    try {
      const headers = await getAuthHeaders()
      const res = await fetch(
        'https://dmrmgpidvfcywilcsmff.supabase.co/functions/v1/generate-preparation-guide',
        {
          method: 'POST',
          headers,
          body: JSON.stringify({
            prepType: selectedType,
            concerns,
            currentStage,
            userRole,
            messages: updated,
          }),
        }
      )

      if (!res.ok) throw new Error('Failed to generate response')
      const data = await res.json()
      if (!data.response) throw new Error('No response received')

      setChatHistory(prev => [...prev, { role: 'assistant', content: data.response }])
    } catch (err) {
      setError('Something went wrong. Please try again.')
      setChatHistory(prev => prev.slice(0, -1))
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!user || !saveTitle.trim()) return
    try {
      const content = [
        `Date: ${new Date().toLocaleDateString()}`,
        `Your question: ${concerns}`,
        '',
        ...chatHistory.map(m => `${m.role === 'user' ? 'You' : 'Preparation Guide'}:\n${m.content}`),
      ].join('\n\n')

      await supabase.from('notes').insert({
        user_id: user.id,
        title: saveTitle,
        content,
        category: 'Other',
      })

      setShowSaveModal(false)
      setSavedSuccess(true)
      setTimeout(() => setSavedSuccess(false), 3000)
      trackEvent('preparation_completed', { role: userRole, prep_type: selectedType })
    } catch {
      setError('Could not save. Please try again.')
    }
  }

  const reset = () => {
    setSelectedType(null)
    setMeetingType(null)
    setConcerns('')
    setChatHistory([])
    setFollowUp('')
    setError(null)
  }

  const hasResponse = chatHistory.length > 0
  const assistantResponse = chatHistory.filter(m => m.role === 'assistant')

  // ── STYLES ───────────────────────────────────────────────────────────────
  const card: React.CSSProperties = {
    background: '#FAF7F2',
    border: '1px solid rgba(255,255,255,0.88)',
    borderRadius: 24,
    boxShadow: '0 2px 12px rgba(90,78,110,0.07)',
  }
  const inputStyle: React.CSSProperties = {
    background: '#EDE6DB',
    border: '1.5px solid rgba(122,102,144,0.2)',
    borderRadius: 16,
    padding: '12px 16px',
    color: '#2A2030',
    outline: 'none',
    width: '100%',
    fontSize: 15,
  }
  const primaryBtn: React.CSSProperties = {
    background: '#7A6690',
    color: 'white',
    border: 'none',
    borderRadius: 16,
    padding: '14px 24px',
    fontWeight: 700,
    fontSize: 15,
    cursor: 'pointer',
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    boxShadow: '0 4px 16px rgba(122,102,144,0.3)',
  }
  const ghostBtn: React.CSSProperties = {
    background: 'transparent',
    color: '#7A6690',
    border: '1.5px solid rgba(122,102,144,0.35)',
    borderRadius: 16,
    padding: '12px 24px',
    fontWeight: 600,
    fontSize: 14,
    cursor: 'pointer',
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  }

  return (
    <div style={{ minHeight: '100vh', background: '#EDE6DB', display: 'flex', flexDirection: 'column' }}>
      <AppHeader />

      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 90 }}><div style={{ maxWidth: 480, margin: '0 auto', padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* ── HEADER ── */}
        {!hasResponse && (
          <div>
            <h1
              style={{ fontFamily: "Fraunces, serif", fontSize: 28, fontWeight: 700, color: '#2A2030', margin: '0 0 4px' }}
            >
              {copy.heading}
            </h1>
            <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 14, color: '#9A90A8', margin: 0 }}>{copy.subheading}</p>
          </div>
        )}

        {/* ── PRIVACY NOTE ── */}
        {!hasResponse && (
          <div
            style={{ background: '#FAF7F2', borderRadius: 16, padding: '12px 14px', display: 'flex', alignItems: 'flex-start', gap: 10, border: '1px solid rgba(255,255,255,0.88)' }}
          >
            <Lock size={15} style={{ color: '#7A6690', flexShrink: 0, marginTop: 2 }} />
            <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: '#5A5065', margin: 0, lineHeight: 1.6 }}>
              <span style={{ fontWeight: 700, color: '#2A2030' }}>Private. </span>
              {copy.privacyNote}
            </p>
          </div>
        )}

        {/* ── STEP 1: CHOOSE TYPE ── */}
        {!selectedType && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 11, fontWeight: 700, color: '#9A90A8', textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>
              What do you need help with?
            </p>
            {copy.prepOptions.map(opt => {
              const Icon = opt.icon
              return (
                <button
                  key={opt.type}
                  onClick={() => setSelectedType(opt.type)}
                  style={{ ...card, cursor: 'pointer', padding: 16, textAlign: 'left', width: '100%' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{ borderRadius: 12, padding: 10, flexShrink: 0, background: '#E8DDE8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon size={18} style={{ color: '#7A6690' }} />
                    </div>
                    <div>
                      <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 14, fontWeight: 700, color: '#2A2030', margin: 0 }}>{opt.title}</p>
                      <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: '#5A5065', margin: '3px 0 0' }}>{opt.description}</p>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        )}

        {/* ── STEP 2: MEETING TYPE (if meeting) ── */}
        {selectedType === 'meeting' && !meetingType && (
          <div style={{ ...card, padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 11, fontWeight: 700, color: '#9A90A8', textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>
                Who is this meeting with?
              </p>
              <button onClick={reset} style={{ color: '#9A90A8' }}>
                <X size={16} color="#9A90A8" />
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {copy.meetingTypes.map(mt => (
                <button
                  key={mt.value}
                  onClick={() => setMeetingType(mt.value as MeetingType)}
                  style={{ cursor: 'pointer',
                    background: '#EDE6DB',
                    border: '1.5px solid rgba(122,102,144,0.15)',
                    color: '#2A2030',
                    fontWeight: 600,
                    fontSize: 15,
                  }}
                >
                  {mt.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── STEP 3: CONCERNS INPUT ── */}
        {selectedType && (selectedType !== 'meeting' || meetingType) && !hasResponse && (
          <div style={{ ...card, padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <span
                style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', padding: '3px 12px', borderRadius: 20, background: '#E8DDE8', color: '#7A6690' }}
              >
                {copy.prepOptions.find(o => o.type === selectedType)?.title}
                {meetingType && ` · ${copy.meetingTypes.find(m => m.value === meetingType)?.label}`}
              </span>
              <button onClick={reset} style={{ color: '#9A90A8' }}>
                <X size={16} color="#9A90A8" />
              </button>
            </div>

            <label
              style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, fontWeight: 700, color: '#2A2030', display: 'block', marginBottom: 8 }}
            >
              {copy.questionLabel(selectedType)}
            </label>
            <textarea
              value={concerns}
              onChange={e => setConcerns(e.target.value)}
              placeholder={copy.placeholder(selectedType)}
              rows={4}
              style={{ ...inputStyle, resize: 'none', fontFamily: 'DM Sans, sans-serif', lineHeight: 1.6 }}
            />

            {error && (
              <div
                style={{ marginTop: 10, borderRadius: 12, padding: 10, display: 'flex', alignItems: 'flex-start', gap: 8 }}
                style={{ background: '#F5ECD8', border: '1px solid rgba(200,136,58,0.2)' }}
              >
                <AlertCircle size={15} style={{ color: '#C8883A', flexShrink: 0, marginTop: 2 }} />
                <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: '#7A5A2A', margin: 0 }}>{error}</p>
              </div>
            )}

            <button
              onClick={handleGenerate}
              disabled={!concerns.trim() || loading}
              style={{
                ...primaryBtn,
                marginTop: 16,
                opacity: (!concerns.trim() || loading) ? 0.5 : 1,
              }}
            >
              {loading ? (
                <>
                  <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} />
                  Getting your guide...
                </>
              ) : (
                <>
                  <Sparkles size={15} />
                  Get My Guide
                </>
              )}
            </button>

            {loading && (
              <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 11, textAlign: 'center', marginTop: 6, color: '#9A90A8' }}>
                Usually ready in 5–10 seconds
              </p>
            )}
          </div>
        )}

        {/* ── RESPONSE VIEW ── */}
        {hasResponse && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

            {/* Header row */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h2
                style={{ fontFamily: 'Fraunces, serif', fontSize: 22, fontWeight: 700, color: '#2A2030', margin: 0 }}
              >
                Your Guide
              </h2>
              <button
                onClick={reset}
                style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'DM Sans, sans-serif', fontSize: 12, fontWeight: 700, borderRadius: 12, padding: '7px 12px', background: '#E8DDE8', color: '#7A6690', border: 'none', cursor: 'pointer' }}
              >
                <RotateCcw size={12} />
                Start Over
              </button>
            </div>

            {/* Your question */}
            <div
              style={{ background: '#E8DDE8', borderRadius: 16, padding: '12px 14px' }}
            >
              <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#9A90A8', margin: '0 0 4px' }}>
                You said
              </p>
              <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: '#2A2030', margin: 0 }}>{concerns}</p>
            </div>

            {/* AI responses */}
            {assistantResponse.map((msg, i) => (
              <div key={i} style={{ ...card, padding: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <Sparkles size={15} color="#7A6690" />
                  <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#7A6690', margin: 0 }}>
                    {i === 0 ? 'Your Preparation Guide' : 'Follow-up'}
                  </p>
                </div>
                <div
                  style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 14, color: '#2A2030', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {/* Follow-up questions from user */}
            {chatHistory.filter(m => m.role === 'user').slice(1).map((msg, i) => (
              <div
                key={i}
                style={{ background: '#7A6690', borderRadius: 16, padding: '10px 14px', alignSelf: 'flex-end', marginLeft: 32 }}
              >
                <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: '#fff', margin: 0 }}>{msg.content}</p>
              </div>
            ))}

            {/* Loading state */}
            {loading && (
              <div style={{ ...card, padding: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
                <Loader2 size={15} style={{ color: '#7A6690', animation: 'spin 1s linear infinite' }} />
                <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: '#9A90A8', margin: 0 }}>Getting your answer...</p>
              </div>
            )}

            {error && (
              <div
                style={{ borderRadius: 16, padding: 12, display: 'flex', alignItems: 'flex-start', gap: 8, background: '#F5ECD8', border: '1px solid rgba(200,136,58,0.2)' }}
              >
                <AlertCircle size={15} style={{ color: '#C8883A', flexShrink: 0, marginTop: 2 }} />
                <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: '#7A5A2A', margin: 0 }}>{error}</p>
              </div>
            )}

            {/* Disclaimer */}
            <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 11, textAlign: 'center', padding: '0 16px', color: '#9A90A8', margin: 0 }}>
              General information only — not legal advice. Talk to your attorney about your specific case.
            </p>

            {/* Follow-up input */}
            <div style={{ ...card, padding: 14 }}>
              <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#9A90A8', margin: '0 0 8px', display: 'block' }}>
                Have a follow-up question?
              </p>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  type="text"
                  value={followUp}
                  onChange={e => setFollowUp(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && followUp.trim()) handleFollowUp()
                  }}
                  placeholder={copy.followUpPlaceholder}
                  style={{ ...inputStyle, borderRadius: 12, padding: '10px 14px', flex: 1 }}
                  disabled={loading}
                />
                <button
                  onClick={handleFollowUp}
                  disabled={!followUp.trim() || loading}
                  style={{ borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                  style={{
                    background: '#7A6690',
                    border: 'none',
                    width: 44,
                    height: 44,
                    opacity: (!followUp.trim() || loading) ? 0.5 : 1,
                    cursor: 'pointer',
                  }}
                >
                  <Send size={15} color="#fff" />
                </button>
              </div>
            </div>

            {/* Save button */}
            {savedSuccess ? (
              <div
                style={{ borderRadius: 16, padding: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: 'rgba(74,124,89,0.12)' }}
              >
                <Check size={15} style={{ color: '#4A7C59' }} />
                <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, fontWeight: 700, color: '#4A7C59', margin: 0 }}>Saved to your notes!</p>
              </div>
            ) : (
              <button
                onClick={() => {
                  setSaveTitle(`${copy.prepOptions.find(o => o.type === selectedType)?.title ?? 'Preparation'} — ${new Date().toLocaleDateString()}`)
                  setShowSaveModal(true)
                }}
                style={ghostBtn}
              >
                <Save size={15} />
                Save to My Notes
              </button>
            )}
          </div>
        )}
      </div></div>

      {/* ── SAVE MODAL ── */}
      {showSaveModal && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(42,32,48,0.5)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 50, padding: 16 }}
        >
          <div
            style={{ width: '100%', maxWidth: 480, borderRadius: '24px 24px 0 0', padding: 24, background: '#FAF7F2' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h3 style={{ fontFamily: 'Fraunces, serif', fontSize: 20, fontWeight: 700, color: '#2A2030', margin: 0 }}>
                Save to Notes
              </h3>
              <button onClick={() => setShowSaveModal(false)}>
                <X size={18} color="#9A90A8" />
              </button>
            </div>
            <label style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#9A90A8', display: 'block', marginBottom: 8 }}>
              Title
            </label>
            <input
              type="text"
              value={saveTitle}
              onChange={e => setSaveTitle(e.target.value)}
              style={{ ...inputStyle, marginBottom: 16 }}
            />
            <button
              onClick={handleSave}
              disabled={!saveTitle.trim()}
              style={{ ...primaryBtn, opacity: !saveTitle.trim() ? 0.5 : 1 }}
            >
              <Check size={15} />
              Save
            </button>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  )
}
