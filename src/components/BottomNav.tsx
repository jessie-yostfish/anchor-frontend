import { useLocation, useNavigate } from 'react-router-dom'
import { List, FileText, Scale, Users } from 'lucide-react'
import { haptics } from '../lib/haptics'

const tabs = [
  { id: 'home',      label: 'Home',     icon: null,     path: '/dashboard', color: '#7A6690', bg: 'rgba(122,102,144,0.12)', border: 'rgba(122,102,144,0.22)' },
  { id: 'timeline',  label: 'Timeline', icon: List,     path: '/timeline',  color: '#4A8878', bg: 'rgba(74,136,120,0.1)',   border: 'rgba(74,136,120,0.18)'  },
  { id: 'notes',     label: 'Notes',    icon: FileText, path: '/notes',     color: '#7A6690', bg: 'rgba(122,102,144,0.08)', border: 'rgba(122,102,144,0.14)' },
  { id: 'legal',     label: 'Legal',    icon: Scale,    path: '/legal',     color: '#4A70A8', bg: 'rgba(74,112,168,0.08)',  border: 'rgba(74,112,168,0.14)'  },
  { id: 'contacts',  label: 'Team',     icon: Users,    path: '/contacts',  color: '#A85878', bg: 'rgba(168,88,120,0.08)',  border: 'rgba(168,88,120,0.14)'  },
]

export function BottomNav() {
  const location = useLocation()
  const navigate = useNavigate()

  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: 0, right: 0,
      background: 'rgba(250,247,242,0.94)',
      backdropFilter: 'blur(16px)',
      borderTop: '1px solid rgba(255,255,255,0.82)',
      boxShadow: '0 -4px 20px rgba(90,70,110,0.08)',
      paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      zIndex: 50,
    }}>
      <div style={{ maxWidth: 480, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-around' }}>
        {tabs.map((tab) => {
          const Icon = tab.icon as React.ElementType | null
          const active = location.pathname === tab.path

          return (
            <button
              key={tab.id}
              onClick={() => { haptics.light(); navigate(tab.path) }}
              style={{
                flex: 1,
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                padding: '10px 4px 9px',
                background: 'none', border: 'none', cursor: 'pointer',
                opacity: active ? 1 : 0.28,
                transition: 'opacity 0.15s',
              }}
            >
              <div style={{
                width: 28, height: 28, borderRadius: 9,
                background: active ? tab.bg : 'transparent',
                border: active ? `1px solid ${tab.border}` : '1px solid transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 3,
                boxShadow: active ? `0 2px 8px ${tab.bg}` : 'none',
                transition: 'all 0.15s',
              }}>
                {tab.id === 'home' ? (
                  <img
                    src="/anchor-icon-only.png"
                    alt=""
                    style={{
                      width: 16, height: 16, objectFit: 'contain',
                      filter: active ? 'none' : 'grayscale(0.3)',
                    }}
                  />
                ) : Icon ? (
                  <Icon size={14} color={active ? tab.color : '#9A90A8'} strokeWidth={active ? 2.2 : 1.8} />
                ) : null}
              </div>
              <span style={{
                fontFamily: 'DM Sans, sans-serif',
                fontSize: 9,
                fontWeight: active ? 700 : 500,
                color: active ? tab.color : '#9A90A8',
                letterSpacing: '0.01em',
              }}>
                {tab.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
