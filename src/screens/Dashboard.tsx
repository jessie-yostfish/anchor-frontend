import { trackEvent } from '../lib/analytics'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronRight, Sparkles, Calendar, MapPin } from 'lucide-react'
import { BottomNav, AppHeader } from '../components'
import { useAuth } from '../contexts/AuthContext'
import { haptics } from '../lib/haptics'
import { supabase } from '../lib/supabase'

type Role = 'parent' | 'youth' | 'supporter'

interface TeamMember {
  name: string
  role: string
  phone: string | null
}

// ─── JEWEL COLORS PER STAGE ──────────────────────────────────────────────────
const STAGE_JEWELS = [
  { color: '#7A6690', glow: 'rgba(122,102,144,0.5)',  bg: 'rgba(122,102,144,0.12)' }, // purple
  { color: '#4A8878', glow: 'rgba(74,136,120,0.5)',   bg: 'rgba(74,136,120,0.12)'  }, // teal
  { color: '#C8883A', glow: 'rgba(200,136,58,0.5)',   bg: 'rgba(200,136,58,0.12)'  }, // amber
  { color: '#A85878', glow: 'rgba(168,88,120,0.4)',   bg: 'rgba(168,88,120,0.1)'   }, // rose
  { color: '#4A70A8', glow: 'rgba(74,112,168,0.4)',   bg: 'rgba(74,112,168,0.1)'   }, // blue
  { color: '#6A7A40', glow: 'rgba(106,122,64,0.4)',   bg: 'rgba(106,122,64,0.1)'   }, // olive
  { color: '#7A6690', glow: 'rgba(122,102,144,0.4)',  bg: 'rgba(122,102,144,0.1)'  }, // purple
  { color: '#4A8878', glow: 'rgba(74,136,120,0.4)',   bg: 'rgba(74,136,120,0.1)'   }, // teal
  { color: '#C8883A', glow: 'rgba(200,136,58,0.4)',   bg: 'rgba(200,136,58,0.1)'   }, // amber
  { color: '#A85878', glow: 'rgba(168,88,120,0.4)',   bg: 'rgba(168,88,120,0.1)'   }, // rose
]

// ─── PEER VOICES ─────────────────────────────────────────────────────────────
const PEER_DESCRIPTOR: Record<Role, string> = {
  parent:    'A parent who made it through',
  youth:     "A young person who's been there",
  supporter: "Someone who's walked this road",
}

const PEER_QUOTES: Record<Role, Record<string, string>> = {
  parent: {
    'case-opening':   "When they first got involved, I thought it was over. It's not. This is the beginning of a process, not the end of the story. Find your attorney and talk to them before you talk to anyone else.",
    'detention':      "I was terrified walking into that first hearing. But I showed up, and that mattered. The judge notices who's in the room. Be there, be on time, and let your attorney do the talking.",
    'jurisdiction':   "This hearing is about whether the allegations are true. You don't have to agree with everything. Talk to your attorney about what you want to contest.",
    'disposition':    "The disposition hearing is when they hand you your case plan. Every single thing on that list is a door back to your child. Start opening them right away.",
    'six-month':      "Six months in, I was exhausted. But this is where your work starts to show. Bring proof of everything. The court wants to see that you showed up consistently, not perfectly.",
    'twelve-month':   "At 12 months I started to panic. What helped was focusing on what I could control — my visits, my services, my relationship with my attorney.",
    'eighteen-month': "This is the hardest stretch. The system has deadlines and they're real. If you've been doing the work, keep going and document everything.",
    'permanency':     "Even at this stage, your relationship with your child matters to the court. Show up to every visit. The bond you've maintained is evidence — and it counts.",
    'review-hearings':"When the case goes on longer than you expected, it's easy to lose momentum. Don't. Every hearing is another chance to show the court who you are.",
    'case-closure':   "Getting to the end of this — whatever it looks like — took everything I had. Give yourself credit for still being here.",
  },
  youth: {
    'case-opening':   "Nobody explained anything to me at first. You're allowed to ask questions. Your lawyer works for you, not the system. Ask them to explain everything.",
    'detention':      "I didn't know I could speak at my first hearing. You can. If you want the judge to know something, tell your lawyer beforehand.",
    'jurisdiction':   "Your lawyer is supposed to be fighting for what you want, not just what the adults think is best. If something doesn't feel right, say something.",
    'disposition':    "When they make the plan, you should have some say in it. If nobody's asking what you want, that's a problem. Ask your lawyer to bring it up.",
    'six-month':      "The check-ins can feel pointless but they're actually your chance to tell the court how things are really going. If something isn't right, this is the moment.",
    'twelve-month':   "By this point I was starting to wonder what my future looked like. You're allowed to think about your future out loud.",
    'eighteen-month': "You deserve to be part of this conversation. If there are people you want to stay connected to, tell your lawyer.",
    'permanency':     "Whatever the plan is, you're allowed to have feelings about it. Find someone you trust to talk to.",
    'review-hearings':"Use every hearing. Each one is a chance to tell the court what's working and what's not.",
    'case-closure':   "When the case closes, it doesn't mean support disappears. Ask what you're entitled to before the case closes, not after.",
  },
  supporter: {
    'case-opening':   "When this first started I wanted to fix everything immediately. I couldn't. What I could do was show up, listen, and not make them explain the whole thing every time.",
    'detention':      "I went to the first hearing just to be a familiar face in the room. Knowing someone was there made a real difference. If you can go, go.",
    'jurisdiction':   "The best thing I did was learn enough about what was happening to ask good questions. Not to take over — just to understand.",
    'disposition':    "Concrete help is more useful than general encouragement. Find specific things you can help with and offer those.",
    'six-month':      "Six months in, burnout is real — for them and for you. Consistency was the most valuable thing I could offer. Not intensity, just reliability.",
    'twelve-month':   "If you can learn the language — what hearings mean, what the case plan requires — you can help your person feel less alone.",
    'eighteen-month': "The most important thing I did was just keep showing up and not disappear when things got hard.",
    'permanency':     "Whatever the outcome, your person is going to need support on the other side of it. Start thinking now about how you can be there.",
    'review-hearings':"Long cases are exhausting for everyone. Check in on your own capacity too. You can't support someone else well if you're running on empty.",
    'case-closure':   "When the case ended I thought my role was done. It wasn't. The relationship you built through this matters beyond the case.",
  },
}

// ─── WHAT MATTERS ────────────────────────────────────────────────────────────
const WHAT_MATTERS: Record<Role, Record<string, string[]>> = {
  parent: {
    'case-opening':   ["Find your attorney today — you have the right to one at no cost","Don't talk to the social worker without your attorney present","Write everything down — dates, names, what was said"],
    'detention':      ["Meet with your attorney before the hearing","Arrive early and dress respectfully — first impressions matter","Ask about visitation — get a schedule in writing"],
    'jurisdiction':   ["Review the petition with your attorney — understand the allegations","Decide what you want to contest — you don't have to agree","Gather evidence that supports your side"],
    'disposition':    ["Read your case plan carefully — start on it immediately","Enroll in required services this week — don't wait","Ask about help with transportation or childcare"],
    'six-month':      ["Get progress letters from every service provider","Document your visits with your child — dates and how it went","Ask your attorney what the court needs to see"],
    'twelve-month':   ["Show consistency, not perfection — courts want steady effort","Demonstrate stable housing and income if possible","Talk to your attorney about remaining steps to reunification"],
    'eighteen-month': ["Complete every remaining case plan requirement — this is the deadline","Talk to your attorney about a 388 petition if circumstances changed","Do not miss any visits — your bond is evidence"],
    'permanency':     ["Attend every scheduled visit","Ask your attorney about the beneficial relationship exception","Document your relationship — letters, photos, records of contact"],
    'review-hearings':["Keep showing up to every hearing","Stay in contact with your attorney — don't wait for them to reach out","Stay involved in your child's life — visits, letters, phone calls"],
    'case-closure':   ["Get copies of all your case records","Ask about aftercare services — support doesn't have to end","Know what closure means for your specific situation"],
  },
  youth: {
    'case-opening':   ["Meet your lawyer — they work only for you","Ask where you're going and why — you have the right to know","Tell someone what you need — you are allowed to ask"],
    'detention':      ["Talk to your lawyer before the hearing","You can speak in court — your lawyer can help you do that","Ask about seeing your family — your wishes matter"],
    'jurisdiction':   ["Ask your lawyer what is being said about your family","Tell your lawyer what you want — your wishes should be represented","Ask questions if you don't understand something"],
    'disposition':    ["Tell your social worker what you need — therapy, tutoring, medical care","Ask about your visitation schedule","Make sure your voice is in the plan"],
    'six-month':      ["Tell the court how things are actually going","Tell your lawyer if anything has changed — school, placement, feelings","Ask what's happening with your case — you deserve a straight answer"],
    'twelve-month':   ["Start thinking about what you want your future to look like","Tell your lawyer who matters to you — people you want to stay connected to","Find someone you trust to talk to about how you're feeling"],
    'eighteen-month': ["Make sure your wishes about permanency are known — tell your lawyer","Talk about people you want to stay connected to","Ask about your rights as you get older — extended foster care programs exist"],
    'permanency':     ["You are allowed to have feelings about this decision","Ask about staying connected to people who matter to you","Know what support is available to you going forward"],
    'review-hearings':["Go to your hearings when you can — your presence matters","Keep speaking up about what you need","Stay connected to your support people — CASA, attorney, trusted adults"],
    'case-closure':   ["Ask what you're entitled to before the case closes","Get copies of your records — medical, educational, case history","Know that support doesn't disappear — programs exist to help you"],
  },
  supporter: {
    'case-opening':   ["Ask your person what they need most right now — listen first","Learn the basics of the dependency process","Offer one concrete thing — a ride, a meal, someone to sit with"],
    'detention':      ["Ask if they want you at the hearing — your presence matters","Help with logistics — transportation, childcare","Check in after — hearings are emotionally exhausting"],
    'jurisdiction':   ["Keep showing up — consistency is the most valuable thing","Learn enough to ask good questions","Don't give legal advice — encourage them to rely on their attorney"],
    'disposition':    ["Ask about their case plan — find one specific thing you can help with","Help remove practical barriers — transportation, childcare","Celebrate engagement, not perfection — showing up to class matters"],
    'six-month':      ["Check in on your own capacity — six months is a long time","Help them document progress — remind them to get letters from providers","Stay consistent — reliability matters more than intensity"],
    'twelve-month':   ["Learn the language of the process — it helps you support better","Ask what they need going into this hearing","Keep showing up — a year in, your presence sends a powerful message"],
    'eighteen-month': ["Don't disappear when things feel heavy — this is when it matters most","Help them prepare emotionally — listen, don't fix","Start thinking about what support looks like on the other side"],
    'permanency':     ["Be present for whatever comes — just be there","Ask about ongoing contact arrangements","Let them lead on what they need from you — ask, don't assume"],
    'review-hearings':["Set limits on what you can give — sustainable support is better","Check in regularly — even a short message saying 'I'm still here' matters","Stay curious about what's changed — keep asking what's most helpful now"],
    'case-closure':   ["Don't assume your role is done — many families need support after closure","Help them find aftercare resources","Acknowledge how far they've come — they made it through something incredibly hard"],
  },
}

const STAGE_ORDER = [
  'case-opening','detention','jurisdiction','disposition',
  'six-month','twelve-month','eighteen-month','permanency',
  'review-hearings','case-closure',
]

const STAGE_LABELS: Record<Role, Record<string, string>> = {
  parent: {
    'case-opening':'Case Opening','detention':'Detention Hearing','jurisdiction':'Jurisdiction Hearing',
    'disposition':'Disposition Hearing','six-month':'6-Month Review','twelve-month':'12-Month Review',
    'eighteen-month':'18-Month Review','permanency':'Permanency Hearing','review-hearings':'Ongoing Reviews',
    'case-closure':'Case Closure',
  },
  youth: {
    'case-opening':'Your Case Begins','detention':'First Court Hearing','jurisdiction':'Court Decides',
    'disposition':'Making the Plan','six-month':'6-Month Check-In','twelve-month':'12-Month Check-In',
    'eighteen-month':'18-Month Decision','permanency':'Your Permanent Home','review-hearings':'Regular Check-Ins',
    'case-closure':'Case Ends',
  },
  supporter: {
    'case-opening':'Case Opens','detention':'Detention Hearing','jurisdiction':'Jurisdiction Hearing',
    'disposition':'Disposition Hearing','six-month':'6-Month Review','twelve-month':'12-Month Review',
    'eighteen-month':'18-Month Review','permanency':'Permanency Hearing','review-hearings':'Ongoing Reviews',
    'case-closure':'Case Closes',
  },
}

function formatCourtDate(dateStr: string | null | undefined): string {
  if (!dateStr) return 'Not set'
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

function daysUntil(dateStr: string | null | undefined): number | null {
  if (!dateStr) return null
  const d = new Date(dateStr + 'T00:00:00')
  const today = new Date(); today.setHours(0,0,0,0)
  return Math.round((d.getTime() - today.getTime()) / (1000*60*60*24))
}

export function Dashboard() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])

  const role: Role = (profile?.role as Role) || 'parent'
  const currentStage = profile?.current_stage || 'case-opening'
  const currentStageIndex = STAGE_ORDER.indexOf(currentStage)
  const stageLabels = STAGE_LABELS[role]
  const quote = PEER_QUOTES[role][currentStage] || PEER_QUOTES[role]['case-opening']
  const actions = WHAT_MATTERS[role][currentStage] || WHAT_MATTERS[role]['case-opening']
  const courtDate = profile?.next_court_date
  const days = daysUntil(courtDate)
  const activeJewel = STAGE_JEWELS[currentStageIndex] || STAGE_JEWELS[0]

  useEffect(() => {
    if (profile?.id) {
      loadTeam()
      // Retry once after short delay to catch race condition on first load
      setTimeout(() => loadTeam(), 800)
    }
    trackEvent('screen_viewed', { screen: 'blueprint_v2', role })
  }, [profile?.id])

  const loadTeam = async () => {
    try {
      const { data } = await supabase
        .from('contacts').select('name, role, phone')
        .eq('user_id', profile?.id).order('created_at', { ascending: true }).limit(3)
      if (data) setTeamMembers(data)
    } catch (e) { console.error(e) }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#EDE6DB', display: 'flex', flexDirection: 'column', position: 'relative' }}>

      {/* Watermark — your logo, breathing */}
      <div style={{
        position: 'fixed', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 0, pointerEvents: 'none',
      }}>
        <img
          src="/anchor-icon-only.png"
          alt=""
          aria-hidden="true"
          style={{
            width: 340, height: 340, objectFit: 'contain',
            opacity: 0.07,
            filter: 'saturate(1.2) brightness(0.75)',
            animation: 'wmBreathe 7s ease-in-out infinite',
          }}
        />
      </div>
      <style>{`
        @keyframes wmBreathe {
          0%,100% { opacity:0.07; transform:scale(1) rotate(0deg); }
          50%      { opacity:0.11; transform:scale(1.03) rotate(2deg); }
        }
        @keyframes activePulse {
          0%,100% { box-shadow: 0 0 0 3px ${activeJewel.bg}, 0 0 10px ${activeJewel.glow}; }
          50%      { box-shadow: 0 0 0 5px ${activeJewel.bg}, 0 0 18px ${activeJewel.glow}; }
        }
      `}</style>

      {/* Header */}
      <div style={{ position: 'relative', zIndex: 2 }}>
        <AppHeader showBack={false} />
      </div>

      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 90, position: 'relative', zIndex: 1 }}>

        {/* ── ORGANIC HERO ── */}
        <div style={{
          background: 'linear-gradient(155deg, #7A6690 0%, #614E78 60%, #503D6A 100%)',
          padding: '20px 20px 52px',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Hero catch-light */}
          <div style={{
            position: 'absolute', top: -50, left: -30,
            width: 200, height: 200,
            background: 'radial-gradient(circle, rgba(255,255,255,0.12) 0%, transparent 65%)',
            pointerEvents: 'none',
          }} />
          {/* Hero anchor ghost top-right */}
          <div style={{ position: 'absolute', right: -10, top: -5, opacity: 0.08, pointerEvents: 'none' }}>
            <img src="/anchor-icon-only.png" alt="" aria-hidden="true"
              style={{ width: 130, height: 130, objectFit: 'contain', filter: 'brightness(10)' }} />
          </div>

          {/* Top meta row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.42)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              Stage {currentStageIndex + 1} of 10
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#8ADCC8', boxShadow: '0 0 5px rgba(138,220,200,0.7)' }} />
              <div style={{ fontSize: 9, color: 'rgba(138,220,200,0.75)', fontWeight: 600 }}>Active</div>
            </div>
          </div>

          {/* Headline */}
          <div style={{ marginBottom: 6 }}>
            <div style={{ fontFamily: 'Fraunces, serif', fontSize: 32, fontWeight: 800, color: 'rgba(255,255,255,0.95)', lineHeight: 1.05, marginBottom: 4 }}>
              {profile?.first_name ? `Hi, ${profile.first_name}.` : 'Your Blueprint.'}
            </div>
            <div style={{ fontFamily: 'Fraunces, serif', fontSize: 20, fontWeight: 600, color: 'rgba(255,255,255,0.55)', fontStyle: 'italic', lineHeight: 1.2 }}>
              You're still here.
            </div>
          </div>
          <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 11, color: 'rgba(255,255,255,0.35)', lineHeight: 1.5 }}>
            That matters more than you know.
          </div>

          {/* Organic curve into body */}
          <div style={{
            position: 'absolute', bottom: -1, left: 0, right: 0, height: 42,
            background: '#EDE6DB',
            clipPath: 'ellipse(55% 100% at 50% 100%)',
          }} />
        </div>

        {/* ── BODY CONTENT ── */}
        <div style={{ maxWidth: 480, margin: '0 auto', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 11 }}>

          {/* Peer voice card */}
          <div style={{
            background: '#FAF7F2',
            borderRadius: 22,
            borderLeft: `3px solid ${activeJewel.color}`,
            border: `1px solid rgba(255,255,255,0.92)`,
            borderLeftWidth: 3,
            borderLeftColor: activeJewel.color,
            boxShadow: `0 4px 20px rgba(90,70,110,0.11), 0 1px 4px rgba(90,70,110,0.07), inset 0 1px 0 rgba(255,255,255,1)`,
            padding: '14px 16px',
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', top: 0, left: '8%', right: '8%', height: 1, background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.9),transparent)' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: activeJewel.color, boxShadow: `0 0 5px ${activeJewel.glow}`, flexShrink: 0 }} />
              <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 9, fontWeight: 700, color: activeJewel.color, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                {PEER_DESCRIPTOR[role]}
              </span>
            </div>
            <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: '#4A4058', lineHeight: 1.68, fontStyle: 'italic', margin: 0 }}>
              "{quote}"
            </p>
          </div>

          {/* Journey — jewel dots */}
          <div style={{
            background: '#FAF7F2',
            borderRadius: 22,
            borderLeft: '3px solid #4A8878',
            border: '1px solid rgba(255,255,255,0.92)',
            borderLeftWidth: 3, borderLeftColor: '#4A8878',
            boxShadow: '0 4px 20px rgba(74,136,120,0.1), 0 1px 4px rgba(90,70,110,0.07), inset 0 1px 0 rgba(255,255,255,1)',
            padding: '14px 16px',
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', top: 0, left: '8%', right: '8%', height: 1, background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.9),transparent)' }} />
            <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 9, color: '#4A8878', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 12 }}>
              Your journey
            </div>
            <div style={{ position: 'relative', paddingLeft: 20 }}>
              {/* Connecting line */}
              <div style={{
                position: 'absolute', left: 5, top: 6, width: 1, height: 'calc(100% - 12px)',
                background: 'linear-gradient(to bottom, rgba(122,102,144,0.3), rgba(74,136,120,0.2), transparent)',
              }} />

              {STAGE_ORDER.slice(0, Math.min(currentStageIndex + 3, STAGE_ORDER.length)).map((stageKey, i) => {
                const jewel = STAGE_JEWELS[i]
                const isDone = i < currentStageIndex
                const isActive = i === currentStageIndex
                const label = stageLabels[stageKey] || stageKey

                return (
                  <div key={stageKey} style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: i < Math.min(currentStageIndex + 2, STAGE_ORDER.length - 1) ? 10 : 0, opacity: isDone ? 0.65 : isActive ? 1 : 0.32 }}>
                    <div style={{
                      width: isActive ? 12 : 9,
                      height: isActive ? 12 : 9,
                      borderRadius: '50%',
                      background: jewel.color,
                      flexShrink: 0,
                      marginLeft: isActive ? -23 : -21,
                      boxShadow: isActive ? `0 0 0 3px ${jewel.bg}, 0 0 10px ${jewel.glow}` : `0 0 4px ${jewel.glow}`,
                      animation: isActive ? 'activePulse 2.5s ease-in-out infinite' : 'none',
                    }} />
                    <div style={{
                      fontFamily: 'DM Sans, sans-serif',
                      fontSize: isActive ? 13 : 11,
                      fontWeight: isActive ? 800 : isDone ? 500 : 400,
                      color: isActive ? '#2A2030' : isDone ? jewel.color : '#8A8098',
                      textDecoration: isDone ? 'line-through' : 'none',
                      textDecorationColor: `${jewel.color}50`,
                      flex: 1,
                    }}>
                      {label}
                    </div>
                    {isDone && <span style={{ fontSize: 10, color: jewel.color, fontWeight: 700 }}>✓</span>}
                    {isActive && (
                      <span style={{
                        fontSize: 8, padding: '2px 9px',
                        background: jewel.bg,
                        color: jewel.color,
                        borderRadius: 20,
                        border: `1px solid ${jewel.color}30`,
                        fontWeight: 700, whiteSpace: 'nowrap',
                      }}>Now</span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* What matters right now */}
          <div style={{
            background: '#FAF7F2',
            borderRadius: 22,
            border: '1px solid rgba(255,255,255,0.92)',
            boxShadow: '0 4px 20px rgba(90,70,110,0.11), inset 0 1px 0 rgba(255,255,255,1)',
            padding: '14px 16px',
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', top: 0, left: '8%', right: '8%', height: 1, background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.9),transparent)' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 11 }}>
              <Sparkles size={13} color={activeJewel.color} />
              <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, fontWeight: 700, color: '#2A2030' }}>What matters right now</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
              {actions.map((action, i) => {
                const [bold, ...rest] = action.split(' — ')
                return (
                  <div key={i} style={{ display: 'flex', gap: 9, alignItems: 'flex-start' }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: activeJewel.color, marginTop: 5, flexShrink: 0, boxShadow: `0 0 4px ${activeJewel.glow}` }} />
                    <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: '#5A5065', margin: 0, lineHeight: 1.55 }}>
                      <strong style={{ color: '#2A2030', fontWeight: 700 }}>{bold}</strong>
                      {rest.length > 0 && ` — ${rest.join(' — ')}`}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Court date + Team row */}
          <div style={{ display: 'flex', gap: 10 }}>
            {/* Court — amber */}
            <div
              onClick={() => { haptics.light(); navigate('/preparation') }}
              style={{
                flex: 1.2,
                background: 'linear-gradient(145deg,#FDF0E0,#F8E4C8)',
                borderRadius: 20,
                border: '1px solid rgba(255,255,255,0.85)',
                boxShadow: '0 5px 18px rgba(180,120,40,0.14), 0 2px 6px rgba(180,120,40,0.08), inset 0 1px 0 rgba(255,255,255,0.9)',
                padding: '13px 14px',
                cursor: 'pointer',
                position: 'relative', overflow: 'hidden',
              }}
            >
              <div style={{ position: 'absolute', top: 0, left: '10%', right: '10%', height: 1, background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.95),transparent)' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 4 }}>
                <Calendar size={10} color="rgba(160,100,30,0.65)" />
                <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 8, color: 'rgba(160,100,30,0.65)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Next court</span>
              </div>
              <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 14, color: '#7A4A18', fontWeight: 800, marginBottom: 3 }}>
                {courtDate ? formatCourtDate(courtDate) : 'Not set'}
              </div>
              {days !== null && (
                <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 10, color: 'rgba(160,100,30,0.55)', fontWeight: 600 }}>
                  {days > 0 ? `${days} days away` : days === 0 ? 'Today' : `${Math.abs(days)} days ago`}
                </div>
              )}
              {!courtDate && (
                <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 10, color: 'rgba(160,100,30,0.5)', fontWeight: 600 }}>Tap to prepare →</div>
              )}
            </div>

            {/* Team — rose */}
            <div
              onClick={() => { haptics.light(); navigate('/contacts') }}
              style={{
                flex: 1,
                background: 'linear-gradient(145deg,#F8EAF0,#F0D8E4)',
                borderRadius: 20,
                border: '1px solid rgba(255,255,255,0.85)',
                boxShadow: '0 5px 18px rgba(160,70,110,0.12), 0 2px 6px rgba(160,70,110,0.07), inset 0 1px 0 rgba(255,255,255,0.9)',
                padding: '13px 14px',
                cursor: 'pointer',
                position: 'relative', overflow: 'hidden',
              }}
            >
              <div style={{ position: 'absolute', top: 0, left: '10%', right: '10%', height: 1, background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.95),transparent)' }} />
              <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 8, color: 'rgba(140,60,90,0.65)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 4 }}>Your team</div>
              <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 14, color: '#6A2848', fontWeight: 800, marginBottom: 3 }}>
                {teamMembers.length > 0 ? `${teamMembers.length} added` : '0 people'}
              </div>
              <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 10, color: 'rgba(140,60,90,0.5)', fontWeight: 600 }}>
                {teamMembers.length > 0 ? 'View team →' : 'Add now →'}
              </div>
            </div>
          </div>

          {/* Action chips */}
          <div style={{ display: 'flex', gap: 8 }}>
            {[
              { label: 'Prepare', sub: 'Court guide', bg: 'linear-gradient(145deg,#F4EFF8,#EDE5F4)', text: '#7A5A98', sub2: '#4A3068', shadow: 'rgba(120,90,160,0.12)', path: '/preparation' },
              { label: 'Rights',  sub: 'Know yours',  bg: 'linear-gradient(145deg,#EAF4F0,#DCECe6)', text: '#387868', sub2: '#1A4838', shadow: 'rgba(60,130,110,0.1)',  path: '/rights' },
              { label: 'Notes',   sub: 'Add one',     bg: 'linear-gradient(145deg,#FDF0E0,#F5E4CC)', text: '#A87830', sub2: '#6A4010', shadow: 'rgba(180,120,40,0.1)',  path: '/notes' },
            ].map((chip) => (
              <div
                key={chip.label}
                onClick={() => { haptics.light(); navigate(chip.path) }}
                style={{
                  flex: 1, padding: '10px 8px', textAlign: 'center', borderRadius: 16,
                  background: chip.bg,
                  border: '1px solid rgba(255,255,255,0.82)',
                  boxShadow: `0 3px 10px ${chip.shadow}, inset 0 1px 0 rgba(255,255,255,0.9)`,
                  cursor: 'pointer', position: 'relative', overflow: 'hidden',
                }}
              >
                <div style={{ position: 'absolute', top: 0, left: '5%', right: '5%', height: 1, background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.95),transparent)' }} />
                <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 8, color: chip.text, fontWeight: 700, marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{chip.label}</div>
                <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 10, color: chip.sub2 }}>{chip.sub}</div>
              </div>
            ))}
          </div>

          {/* Team preview if populated */}
          {teamMembers.length > 0 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 10, fontWeight: 700, color: '#9A90A8', textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>Your team</p>
                <button onClick={() => { haptics.light(); navigate('/contacts') }} style={{ background: 'none', border: 'none', fontFamily: 'DM Sans, sans-serif', fontSize: 12, fontWeight: 700, color: '#7A6690', cursor: 'pointer', padding: 0 }}>See all</button>
              </div>
              <div style={{
                background: '#FAF7F2', borderRadius: 20,
                border: '1px solid rgba(255,255,255,0.92)',
                boxShadow: '0 4px 18px rgba(90,70,110,0.1), inset 0 1px 0 rgba(255,255,255,1)',
                overflow: 'hidden',
              }}>
                {teamMembers.map((m, i) => (
                  <div key={i} style={{
                    padding: '11px 16px',
                    borderBottom: i < teamMembers.length - 1 ? '1px solid rgba(122,102,144,0.08)' : 'none',
                    display: 'flex', alignItems: 'center', gap: 11,
                  }}>
                    <div style={{ width: 32, height: 32, borderRadius: 10, background: 'linear-gradient(145deg,#F4EFF8,#EDE5F4)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.9)' }}>
                      <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, fontWeight: 700, color: '#7A6690' }}>{m.name.charAt(0).toUpperCase()}</span>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, fontWeight: 600, color: '#2A2030', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.name}</p>
                      <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 11, color: '#9A90A8', margin: 0 }}>{m.role}</p>
                    </div>
                    {m.phone && <a href={`tel:${m.phone}`} onClick={(e) => e.stopPropagation()}><MapPin size={14} color="#7A6690" /></a>}
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>

      <BottomNav />
    </div>
  )
}
