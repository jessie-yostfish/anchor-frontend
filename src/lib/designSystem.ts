// ─── ANCHOR DESIGN SYSTEM v2 ─────────────────────────────────────────────────
// Single source of truth for all design tokens used across screens

export const DS = {
  // Backgrounds
  pageBg: '#EDE6DB',
  cardBg: '#FAF7F2',
  headerBg: 'rgba(250,247,242,0.96)',

  // Core palette
  purple:  '#7A6690',
  purpleBg:'rgba(122,102,144,0.1)',
  teal:    '#4A8878',
  tealBg:  'rgba(74,136,120,0.1)',
  amber:   '#C8883A',
  amberBg: 'rgba(200,136,58,0.1)',
  rose:    '#A85878',
  roseBg:  'rgba(168,88,120,0.1)',
  blue:    '#4A70A8',
  blueBg:  'rgba(74,112,168,0.1)',

  // Text
  ink:     '#2A2030',
  muted:   '#5A5065',
  subtle:  '#9A90A8',

  // Shadows (color-tinted per section)
  shadowPurple: '0 4px 20px rgba(90,70,110,0.11), 0 1px 4px rgba(90,70,110,0.07)',
  shadowTeal:   '0 4px 20px rgba(74,136,120,0.1), 0 1px 4px rgba(90,70,110,0.06)',
  shadowAmber:  '0 5px 18px rgba(180,120,40,0.14), 0 2px 6px rgba(180,120,40,0.08)',
  shadowRose:   '0 5px 18px rgba(160,70,110,0.12), 0 2px 6px rgba(160,70,110,0.07)',
  shadowBlue:   '0 4px 20px rgba(74,112,168,0.1), 0 1px 4px rgba(74,112,168,0.06)',
}

// Glossy card style — apply as inline style object
export const glossCard = (accentColor = DS.purple, shadowOverride?: string) => ({
  background: DS.cardBg,
  borderRadius: 22,
  border: '1px solid rgba(255,255,255,0.92)',
  boxShadow: `${shadowOverride || DS.shadowPurple}, inset 0 1px 0 rgba(255,255,255,1), inset 0 -1px 0 rgba(160,140,180,0.06)`,
  position: 'relative' as const,
  overflow: 'hidden' as const,
})

// Shimmer line to place as first child of glossy card
export const ShimmerLine = () => (
  <div style={{
    position: 'absolute', top: 0, left: '8%', right: '8%', height: 1,
    background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.9),transparent)',
    pointerEvents: 'none',
  }} />
)

// Glossy button style
export const glossBtn = (color = DS.purple) => ({
  background: `linear-gradient(160deg, ${color}DD 0%, ${color} 100%)`,
  border: 'none',
  borderRadius: 18,
  color: '#fff',
  fontFamily: 'DM Sans, sans-serif',
  fontWeight: 700,
  fontSize: 15,
  cursor: 'pointer',
  boxShadow: `0 6px 24px ${color}55, 0 2px 6px ${color}33, inset 0 1px 0 rgba(255,255,255,0.25), inset 0 -2px 0 rgba(0,0,0,0.12)`,
  position: 'relative' as const,
  overflow: 'hidden' as const,
})

// Ghost/secondary button
export const ghostBtn = (color = DS.purple) => ({
  background: 'transparent',
  border: `1.5px solid ${color}55`,
  borderRadius: 18,
  color: color,
  fontFamily: 'DM Sans, sans-serif',
  fontWeight: 600,
  fontSize: 14,
  cursor: 'pointer',
})

// Page wrapper
export const pageWrap = {
  minHeight: '100vh',
  background: DS.pageBg,
  display: 'flex',
  flexDirection: 'column' as const,
}

// Section label style
export const sectionLabel = (color = DS.subtle) => ({
  fontFamily: 'DM Sans, sans-serif',
  fontSize: 10,
  fontWeight: 700,
  color,
  textTransform: 'uppercase' as const,
  letterSpacing: '0.07em',
})

// Jewel colors matched to stage index
export const STAGE_JEWELS = [
  { color: '#7A6690', glow: 'rgba(122,102,144,0.5)', bg: 'rgba(122,102,144,0.12)' },
  { color: '#4A8878', glow: 'rgba(74,136,120,0.5)',  bg: 'rgba(74,136,120,0.12)'  },
  { color: '#C8883A', glow: 'rgba(200,136,58,0.5)',  bg: 'rgba(200,136,58,0.12)'  },
  { color: '#A85878', glow: 'rgba(168,88,120,0.4)',  bg: 'rgba(168,88,120,0.1)'   },
  { color: '#4A70A8', glow: 'rgba(74,112,168,0.4)',  bg: 'rgba(74,112,168,0.1)'   },
  { color: '#6A7A40', glow: 'rgba(106,122,64,0.4)',  bg: 'rgba(106,122,64,0.1)'   },
  { color: '#7A6690', glow: 'rgba(122,102,144,0.4)', bg: 'rgba(122,102,144,0.1)'  },
  { color: '#4A8878', glow: 'rgba(74,136,120,0.4)',  bg: 'rgba(74,136,120,0.1)'   },
  { color: '#C8883A', glow: 'rgba(200,136,58,0.4)',  bg: 'rgba(200,136,58,0.1)'   },
  { color: '#A85878', glow: 'rgba(168,88,120,0.4)',  bg: 'rgba(168,88,120,0.1)'   },
]
