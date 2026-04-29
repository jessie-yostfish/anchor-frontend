import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

export function TermsOfService() {
  const navigate = useNavigate()

  return (
    <div style={{ minHeight: '100vh', background: '#EDE6DB' }}>
      {/* Header */}
      <div style={{ background: '#FAF7F2', borderBottom: '1px solid rgba(122,102,144,0.1)', padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 12, position: 'sticky', top: 0, zIndex: 10 }}>
        <button onClick={() => navigate(-1)} style={{ background: '#E8DDE8', border: 'none', borderRadius: 10, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
          <ArrowLeft size={16} color="#7A6690" />
        </button>
        <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: 20, fontWeight: 700, color: '#2A2030', margin: 0 }}>Terms of Service</h1>
      </div>

      <div style={{ maxWidth: 480, margin: '0 auto', padding: '28px 20px 60px' }}>
        <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: '#8A8098', marginBottom: 28 }}>Last updated: April 2026</p>

        {[
          {
            title: 'About Anchor',
            body: 'Anchor is a free tool designed to help parents, youth, and supporters navigate the California dependency court and foster care system. It provides general legal information and organizational support. It is not a law firm and does not provide legal advice. Nothing in this app creates an attorney-client relationship.',
          },
          {
            title: 'Who Can Use This App',
            body: 'Anchor is intended for people who are 13 years of age or older. If you are under 18, a parent, guardian, or trusted adult should be aware you are using this app. By creating an account, you confirm that the information you provide is accurate to the best of your knowledge.',
          },
          {
            title: 'What Anchor Is — and Is Not',
            body: 'Anchor provides general information about the California dependency court process. It does not represent you in court, file documents on your behalf, or give you legal advice about your specific case. For legal advice, you should speak with your attorney. If you do not have an attorney, you have the right to request one.',
          },
          {
            title: 'Your Account',
            body: 'You are responsible for keeping your login credentials private. Do not share your account with others. You can delete your account at any time from the Settings screen, which permanently removes all data we hold about you.',
          },
          {
            title: 'Your Content',
            body: 'Notes, contacts, and other content you create in Anchor belong to you. We do not read, sell, or share your personal content. You can export or delete your data at any time from Settings.',
          },
          {
            title: 'No Guarantees',
            body: 'We do our best to keep information accurate and up to date, but laws and court procedures can change. Anchor makes no guarantee that the information in the app is complete, current, or applicable to your specific situation. Always confirm important information with your attorney or the court.',
          },
          {
            title: 'Changes to These Terms',
            body: 'We may update these terms from time to time. If we make significant changes, we will let you know through the app. Continued use of Anchor after changes are posted means you accept the updated terms.',
          },
          {
            title: 'Contact Us',
            body: 'If you have questions about these terms, use the Contact Support option in Settings or reach out to us at support@peersupportco.org.',
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
