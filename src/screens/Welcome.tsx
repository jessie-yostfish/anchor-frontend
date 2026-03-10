import { useNavigate } from 'react-router-dom'
import { Shield, Users, FileText, Lock } from 'lucide-react'

export function Welcome() {
  const navigate = useNavigate()

  const features = [
    {
      icon: Shield,
      title: 'Know Your Rights',
      description: 'Plain-language explanations of every stage of your case',
      color: 'bg-purple-100',
      iconColor: 'text-purple-700',
    },
    {
      icon: Users,
      title: 'Your Support Team',
      description: 'Keep your attorney, social worker, and contacts in one place',
      color: 'bg-amber-100',
      iconColor: 'text-amber-700',
    },
    {
      icon: FileText,
      title: 'Track Your Journey',
      description: 'Follow your timeline and prepare for every hearing',
      color: 'bg-green-100',
      iconColor: 'text-green-700',
    },
  ]

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: '#F0EAE0' }}
    >
      {/* ── HEADER / LOGO HERO ── */}
      <div
        className="flex flex-col items-center pt-16 pb-10 px-6"
        style={{ background: '#F0EAE0' }}
      >
        {/* Logo mark */}
        <div
          className="mb-5"
          style={{
            filter: 'drop-shadow(0 8px 24px rgba(122,102,144,0.28))',
          }}
        >
          <img
            src="/anchor-logo-new.png"
            alt="Anchor"
            style={{
              width: 110,
              height: 110,
              objectFit: 'contain',
            }}
          />
        </div>

        {/* Brand name */}
        <h1
          className="text-4xl font-bold mb-1 tracking-tight"
          style={{
            fontFamily: "'Fraunces', Georgia, serif",
            color: '#7A6690',
            letterSpacing: '-0.3px',
          }}
        >
          Anchor
        </h1>
        <p
          className="text-xs font-medium tracking-widest uppercase mb-6"
          style={{ color: '#9A90A8', letterSpacing: '2px' }}
        >
          Find your footing.
        </p>

        {/* Hero text */}
        <div className="text-center max-w-xs">
          <h2
            className="text-2xl font-bold mb-3 leading-tight"
            style={{
              fontFamily: "'Fraunces', Georgia, serif",
              color: '#2A2030',
              letterSpacing: '-0.3px',
            }}
          >
            You deserve support{' '}
            <em
              className="not-italic"
              style={{ color: '#7A6690' }}
            >
              every step
            </em>{' '}
            of the way.
          </h2>
          <p
            className="text-sm leading-relaxed"
            style={{ color: '#5A5065', fontWeight: 300 }}
          >
            A free, private guide for California families navigating dependency court.
          </p>
        </div>
      </div>

      {/* ── DIVIDER ── */}
      <div
        className="mx-6"
        style={{
          height: 1,
          background: 'linear-gradient(90deg, transparent, rgba(122,102,144,0.18), transparent)',
          marginBottom: 24,
        }}
      />

      {/* ── FEATURE CARDS ── */}
      <div className="px-5 space-y-3 mb-6">
        {features.map((feature, index) => (
          <div
            key={index}
            className="flex items-center gap-4 rounded-2xl px-5 py-4"
            style={{
              background: '#FAF7F4',
              border: '1px solid rgba(122,102,144,0.12)',
              boxShadow: '0 2px 8px rgba(90,78,110,0.06)',
            }}
          >
            <div className={`p-2.5 rounded-xl ${feature.color} flex-shrink-0`}>
              <feature.icon className={`w-5 h-5 ${feature.iconColor}`} />
            </div>
            <div>
              <p
                className="font-semibold text-sm mb-0.5"
                style={{ color: '#2A2030' }}
              >
                {feature.title}
              </p>
              <p
                className="text-xs leading-relaxed"
                style={{ color: '#5A5065', fontWeight: 300 }}
              >
                {feature.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* ── PRIVACY NOTICE ── */}
      <div className="px-5 mb-8">
        <div
          className="flex items-start gap-3 rounded-2xl px-4 py-3"
          style={{
            background: '#F5ECD8',
            border: '1px solid rgba(200,136,58,0.2)',
          }}
        >
          <Lock className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#C8883A' }} />
          <p className="text-xs leading-relaxed" style={{ color: '#7A5A2A' }}>
            <span className="font-semibold">Your information stays private.</span>{' '}
            We only ask what we need to help guide you.
          </p>
        </div>
      </div>

      {/* ── BUTTONS ── */}
      <div className="px-5 space-y-3 pb-12">
        <button
          onClick={() => navigate('/auth?mode=signup')}
          className="w-full py-4 rounded-2xl font-semibold text-white text-base transition-all active:scale-95"
          style={{
            background: '#7A6690',
            boxShadow: '0 6px 20px rgba(122,102,144,0.35)',
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          Get Started — It's Free
        </button>

        <button
          onClick={() => navigate('/auth?mode=signin')}
          className="w-full py-4 rounded-2xl font-semibold text-base transition-all active:scale-95"
          style={{
            background: 'transparent',
            border: '1.5px solid rgba(122,102,144,0.35)',
            color: '#7A6690',
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          I Already Have an Account
        </button>

        <p
          className="text-center text-xs pt-2"
          style={{ color: '#9A90A8', fontWeight: 300 }}
        >
          Free and confidential · California families only
        </p>
      </div>
    </div>
  )
}
