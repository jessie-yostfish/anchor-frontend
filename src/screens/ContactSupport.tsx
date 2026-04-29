import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Check } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { haptics } from '../lib/haptics'

const TOPICS = [
  'I found an error in the app',
  'Something isn\'t working',
  'I have a question about my case',
  'I want to give feedback',
  'Something else',
]

export function ContactSupport() {
  const navigate = useNavigate()
  const { user, profile } = useAuth()
  const [topic, setTopic] = useState('')
  const [message, setMessage] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    if (!message.trim()) { setError('Please write a message before sending.'); return }
    setLoading(true); setError('')
    try {
      const { error: dbError } = await supabase.from('support_requests').insert({
        user_id: user?.id || null,
        username: profile?.username || null,
        role: profile?.role || null,
        topic: topic || 'Not specified',
        message: message.trim(),
      })
      if (dbError) throw dbError
      haptics.success()
      setSubmitted(true)
    } catch (e: any) {
      setError('Something went wrong. Please try again.')
      haptics.error()
    }
    setLoading(false)
  }

  if (submitted) {
    return (
      <div style={{ minHeight: '100vh', background: '#EDE6DB', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ textAlign: 'center', maxWidth: 320 }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(145deg,#EAF4EE,#D4EDD8)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '0 4px 16px rgba(74,124,89,0.2)' }}>
            <Check size={28} color="#4A7C59" />
          </div>
          <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 24, fontWeight: 700, color: '#2A2030', marginBottom: 10 }}>Message sent</h2>
          <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 15, color: '#4A4058', lineHeight: 1.6, marginBottom: 28 }}>
            We got your message and will follow up within a few days. Thank you for reaching out.
          </p>
          <button
            onClick={() => navigate('/settings')}
            style={{ background: '#7A6690', color: '#fff', border: 'none', borderRadius: 16, padding: '14px 28px', fontFamily: 'DM Sans, sans-serif', fontWeight: 700, fontSize: 15, cursor: 'pointer', boxShadow: '0 4px 16px rgba(122,102,144,0.3)' }}
          >
            Back to Settings
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#EDE6DB' }}>
      <div style={{ background: '#FAF7F2', borderBottom: '1px solid rgba(122,102,144,0.1)', padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 12, position: 'sticky', top: 0, zIndex: 10 }}>
        <button onClick={() => navigate(-1)} style={{ background: '#E8DDE8', border: 'none', borderRadius: 10, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
          <ArrowLeft size={16} color="#7A6690" />
        </button>
        <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: 20, fontWeight: 700, color: '#2A2030', margin: 0 }}>Contact Support</h1>
      </div>

      <div style={{ maxWidth: 480, margin: '0 auto', padding: '28px 20px 60px' }}>
        <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 15, color: '#4A4058', lineHeight: 1.6, marginBottom: 28 }}>
          Have a question, found something wrong, or want to share feedback? We read every message.
        </p>

        {/* Topic */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', fontFamily: 'DM Sans, sans-serif', fontSize: 11, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: '#8A8098', marginBottom: 10 }}>
            What's this about? <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span>
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {TOPICS.map((t) => (
              <button
                key={t}
                onClick={() => { haptics.light(); setTopic(t === topic ? '' : t) }}
                style={{
                  textAlign: 'left', padding: '12px 16px',
                  background: topic === t ? '#F4EFF8' : '#FAF7F2',
                  border: topic === t ? '1.5px solid #7A6690' : '1.5px solid rgba(122,102,144,0.15)',
                  borderRadius: 14, cursor: 'pointer',
                  fontFamily: 'DM Sans, sans-serif', fontSize: 14,
                  color: topic === t ? '#7A6690' : '#4A4058',
                  fontWeight: topic === t ? 600 : 400,
                }}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Message */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', fontFamily: 'DM Sans, sans-serif', fontSize: 11, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: '#8A8098', marginBottom: 8 }}>
            Your message
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Tell us what's on your mind…"
            rows={6}
            style={{ width: '100%', boxSizing: 'border-box', padding: '14px 16px', background: '#FAF7F2', border: '1.5px solid rgba(122,102,144,0.2)', borderRadius: 16, fontFamily: 'DM Sans, sans-serif', fontSize: 15, color: '#2A2030', outline: 'none', resize: 'vertical', lineHeight: 1.6 }}
          />
        </div>

        {error && (
          <div style={{ background: '#F5ECD8', border: '1px solid rgba(200,136,58,0.2)', borderRadius: 12, padding: '10px 14px', marginBottom: 16 }}>
            <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: '#7A5A2A', margin: 0 }}>{error}</p>
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading || !message.trim()}
          style={{ width: '100%', padding: '15px', background: message.trim() ? '#7A6690' : '#C8C0D0', border: 'none', borderRadius: 16, fontFamily: 'DM Sans, sans-serif', fontWeight: 700, fontSize: 15, color: '#fff', cursor: message.trim() ? 'pointer' : 'not-allowed', boxShadow: message.trim() ? '0 4px 16px rgba(122,102,144,0.3)' : 'none' }}
        >
          {loading ? 'Sending…' : 'Send Message'}
        </button>

        <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: '#8A8098', textAlign: 'center', marginTop: 16, lineHeight: 1.5 }}>
          We typically respond within 2–3 business days.{'\n'}For urgent legal questions, please contact your attorney.
        </p>
      </div>
    </div>
  )
}
