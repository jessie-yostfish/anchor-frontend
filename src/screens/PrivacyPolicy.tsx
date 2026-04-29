import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

export function PrivacyPolicy() {
  const navigate = useNavigate()

  return (
    <div style={{ minHeight: '100vh', background: '#EDE6DB' }}>
      <div style={{ background: '#FAF7F2', borderBottom: '1px solid rgba(122,102,144,0.1)', padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 12, position: 'sticky', top: 0, zIndex: 10 }}>
        <button onClick={() => navigate(-1)} style={{ background: '#E8DDE8', border: 'none', borderRadius: 10, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
          <ArrowLeft size={16} color="#7A6690" />
        </button>
        <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: 20, fontWeight: 700, color: '#2A2030', margin: 0 }}>Privacy Policy</h1>
      </div>

      <div style={{ maxWidth: 480, margin: '0 auto', padding: '28px 20px 60px' }}>
        <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: '#8A8098', marginBottom: 28 }}>Last updated: April 2026</p>

        <div style={{ background: '#F4EFF8', border: '1px solid rgba(122,102,144,0.15)', borderRadius: 16, padding: '14px 16px', marginBottom: 28 }}>
          <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 14, color: '#4A4058', lineHeight: 1.6, margin: 0 }}>
            Your privacy matters to us. Anchor is built for people in vulnerable situations, and we take that seriously. We collect as little as possible and never sell your data.
          </p>
        </div>

        {[
          {
            title: 'What We Collect',
            body: 'When you create an account, we collect your first name or username and your email address. We also collect the role you select (parent, youth, or supporter) and basic usage data — such as which screens you visit — to help us improve the app. We do not collect your full name, Social Security number, case number, or any legal documents.',
          },
          {
            title: 'What You Create',
            body: 'Notes, contacts, and other content you add in Anchor are stored securely in your account. Only you can see this content. We do not read it, analyze it, or share it with anyone — including courts, social workers, or government agencies.',
          },
          {
            title: 'How We Use Your Information',
            body: 'We use your account information to provide the app and send you important updates if you opt in. We use anonymous usage data (not tied to your identity) to understand how people use Anchor so we can improve it. We do not use your information for advertising.',
          },
          {
            title: 'Who We Share Data With',
            body: 'We do not sell your data. We use Supabase to store your account information securely. Supabase is a trusted third-party service with strong security standards. We do not share your personal information with courts, child welfare agencies, or any government entity.',
          },
          {
            title: 'Your Rights',
            body: 'You can export all your data at any time from Settings. You can delete your account and all associated data at any time from Settings. If you have questions about what we hold, contact us and we will respond within 30 days.',
          },
          {
            title: 'Data Security',
            body: 'Your data is encrypted in transit and at rest. We use row-level security so that only your account can access your information. We take reasonable steps to protect your data, though no system is completely risk-free.',
          },
          {
            title: 'Children',
            body: 'Anchor is available to users 13 and older. Youth users (ages 13–17) have the same privacy protections as adults under this policy. We do not knowingly collect information from children under 13.',
          },
          {
            title: 'Changes to This Policy',
            body: 'If we make significant changes to this policy, we will notify you through the app before the changes take effect.',
          },
          {
            title: 'Contact Us',
            body: 'Questions about your privacy? Use Contact Support in Settings or email us at privacy@peersupportco.org.',
          },
        ].map((section) => (
          <div key={section.title} style={{ marginBottom: 28 }}>
            <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 17, fontWeight: 700, color: '#2A2030', marginBottom: 8 }}>{section.title}</h2>
            <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 14, color: '#4A4058', lineHeight: 1.7, margin: 0 }}>{section.body}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
