import { useLocation, useNavigate } from 'react-router-dom'
import { List, FileText, MapPin, Scale, Users } from 'lucide-react'
import { haptics } from '../lib/haptics'

const tabs = [
  { id: 'home',      label: 'Home',      icon: null,     path: '/dashboard' },
  { id: 'timeline',  label: 'Timeline',  icon: List,     path: '/timeline' },
  { id: 'notes',     label: 'Notes',     icon: FileText, path: '/notes' },
  { id: 'resources', label: 'Resources', icon: MapPin,   path: '/resources' },
  { id: 'legal',     label: 'Legal',     icon: Scale,    path: '/legal' },
  { id: 'contacts',  label: 'Team',      icon: Users,    path: '/contacts' },
]

export function BottomNav() {
  const location = useLocation()
  const navigate = useNavigate()

  const handleNavigation = (path: string) => {
    haptics.light()
    navigate(path)
  }

  return (
    <>
      <nav style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        background: '#FAF7F4',
        borderTop: '1px solid rgba(122,102,144,0.15)',
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
                onClick={() => handleNavigation(tab.path)}
                style={{
                  flex: 1,
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  padding: '10px 4px 8px',
                  background: 'none', border: 'none', cursor: 'pointer',
                  position: 'relative',
                }}
              >
                {/* Active indicator dot */}
                {active && (
                  <span style={{
                    position: 'absolute', top: 6, left: '50%', transform: 'translateX(-50%)',
                    width: 4, height: 4, borderRadius: '50%', background: '#7A6690',
                  }} />
                )}

                <div style={{
                  width: 36, height: 30,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  borderRadius: 12,
                  background: active ? '#F4EFF8' : 'transparent',
                  marginBottom: 3,
                  transition: 'background 0.15s',
                }}>
                  {tab.id === 'home' ? (
                    <img
                      src='/anchor-icon-only.png'
                      alt=''
                      style={{
                        width: 22, height: 22, objectFit: 'contain',
                        opacity: active ? 1 : 0.45,
                      }}
                    />
                  ) : (
                    <Icon
                      size={18}
                      color={active ? '#7A6690' : '#9A90A8'}
                      strokeWidth={active ? 2.2 : 1.8}
                    />
                  )}
                </div>

                <span style={{
                  fontFamily: 'DM Sans, sans-serif',
                  fontSize: 10,
                  fontWeight: active ? 700 : 500,
                  color: active ? '#7A6690' : '#9A90A8',
                  letterSpacing: '0.01em',
                }}>
                  {tab.label}
                </span>
              </button>
            )
          })}
        </div>
      </nav>
    </>
  )
}
