import { useNavigate } from 'react-router-dom'
import { Shield, Users, FileText, Lock } from 'lucide-react'

export function Welcome() {
  const navigate = useNavigate()

  const features = [
    {
      icon: Shield,
      title: 'Trauma-Informed Support',
      description: 'Designed with your wellbeing in mind at every step',
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-700',
    },
    {
      icon: Users,
      title: 'Know Your Rights',
      description: 'Understanding your role in dependency court proceedings',
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-700',
    },
    {
      icon: FileText,
      title: 'Track Your Case',
      description: 'Keep important dates, documents, and contacts organized',
      iconBg: 'bg-green-100',
      iconColor: 'text-green-700',
    },
  ]

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#F0EAE0' }}>

      {/* ── LOGO HERO ── */}
      <div className="flex flex-col items-center pt-16 pb-8 px-6 text-center">
        <img
          src="/anchor-logo-new.png"
          alt="Anchor"
          style={{
            width: 120,
            height: 120,
            objectFit: 'contain',
            filter: 'drop-shadow(0 6px 18px rgba(122,102,144,0.25))',
            marginBottom: 16,
          }}
        />
        <h1
          className="text-4xl font-bold mb-2"
          style={{ fontFamily: "'Fraunces', Georgia, serif", color: '#7A6690', letterSpacing: '-0.3px' }}
        >
          Anchor
        </h1>
        <p className="text-lg" style={{ color: '#5A5065' }}>
          Your guide through California dependency court
        </p>
      </div>

      {/* ── DIVIDER ── */}
      <div className="mx-6 mb-6" style={{ height: 1, background: 'linear-gradient(90deg, transparent, rgba(122,102,144,0.18), transparent)' }} />

      {/* ── FEATURE CARDS ── */}
      <div className="px-5 space-y-3 mb-6">
        {features.map((feature, index) => (
          <div
            key={index}
            className="flex items-start gap-4 rounded-2xl px-5 py-4"
            style={{ background: '#FAF7F4', border: '1px solid rgba(122,102,144,0.12)', boxShadow: '0 2px 8px rgba(90,78,110,0.06)' }}
          >
            <div className={`p-3 rounded-xl flex-shrink-0 ${feature.iconBg}`}>
              <feature.icon className={`w-6 h-6 ${feature.iconColor}`} />
            </div>
            <div>
              <h3 className="font-semibold mb-1" style={{ color: '#2A2030' }}>{feature.title}</h3>
              <p className="text-sm" style={{ color: '#5A5065' }}>{feature.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── PRIVACY NOTICE ── */}
      <div className="px-5 mb-8">
        <div
          className="flex items-start gap-3 rounded-2xl px-4 py-3"
          style={{ background: '#F5ECD8', border: '1px solid rgba(200,136,58,0.2)' }}
        >
          <Lock className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#C8883A' }} />
          <div className="text-sm" style={{ color: '#7A5A2A' }}>
            <p className="font-semibold mb-0.5">Your answers are private and secure</p>
            <p style={{ fontWeight: 300 }}>We only ask what we need to help guide you</p>
          </div>
        </div>
      </div>

      {/* ── BUTTONS ── */}
      <div className="px-5 space-y-3 pb-12">
        <button
          onClick={() => navigate('/auth?mode=signup')}
          className="w-full py-4 rounded-2xl font-semibold text-white text-base transition-all active:scale-95"
          style={{ background: '#7A6690', boxShadow: '0 6px 20px rgba(122,102,144,0.35)', fontFamily: "'DM Sans', sans-serif" }}
        >
          Get Started
        </button>
        <button
          onClick={() => navigate('/auth?mode=signin')}
          className="w-full py-4 rounded-2xl font-semibold text-base transition-all active:scale-95"
          style={{ background: 'transparent', border: '1.5px solid rgba(122,102,144,0.4)', color: '#7A6690', fontFamily: "'DM Sans', sans-serif" }}
        >
          I Already Have an Account
        </button>
        <p className="text-center text-xs pt-1" style={{ color: '#9A90A8' }}>
          Free and confidential support for families in California
        </p>
      </div>

    </div>
  )
}
