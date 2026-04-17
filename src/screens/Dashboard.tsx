import { trackEvent } from '../lib/analytics'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ChevronRight,
  Sparkles,
  Calendar,
  Users,
  MapPin,
} from 'lucide-react'
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

// ─── PEER VOICES ────────────────────────────────────────────────────────────

const PEER_DESCRIPTOR: Record<Role, string> = {
  parent: 'A parent who made it through',
  youth: 'A young person who\'s been there',
  supporter: 'Someone who\'s walked this road',
}

const PEER_QUOTES: Record<Role, Record<string, string>> = {
  parent: {
    'case-opening': 'When they first got involved, I thought it was over. It\'s not. This is the beginning of a process, not the end of the story. The most important thing you can do right now is find your attorney and talk to them before you talk to anyone else.',
    'detention': 'I was terrified walking into that first hearing. But I showed up, and that mattered. The judge notices who\'s in the room. Be there, be on time, and let your attorney do the talking — but make sure your attorney knows what you want to say.',
    'jurisdiction': 'This hearing is about whether the allegations are true. You don\'t have to agree with everything that\'s been said about you. Talk to your attorney about what you want to contest. Your voice matters here even when it doesn\'t feel like it.',
    'disposition': 'The disposition hearing is when they hand you your case plan. I know it can feel like a list of everything you\'re doing wrong. But it\'s actually a roadmap. Every single thing on that list is a door back to your child. Start opening them right away.',
    'six-month': 'Six months in, I was exhausted. But this is where your work starts to show. Bring proof of everything — letters from your therapist, attendance sheets, anything. The court wants to see that you showed up consistently, not perfectly.',
    'twelve-month': 'At 12 months I started to panic because things were moving slowly. What helped me was focusing on what I could control — my visits, my services, my relationship with my attorney. You can\'t control the timeline. You can control your effort.',
    'eighteen-month': 'This is the hardest stretch. The system has deadlines and they\'re real. If you\'ve been doing the work, keep going and document everything. If you\'ve fallen behind, it\'s not too late — talk to your attorney today about what\'s still possible.',
    'permanency': 'Even at this stage, your relationship with your child matters to the court. Show up to every visit. Write letters. Stay connected. The bond you\'ve maintained is evidence — and it counts.',
    'review-hearings': 'When the case goes on longer than you expected, it\'s easy to lose momentum. Don\'t. Every hearing is another chance to show the court who you are and what you\'re doing. Keep showing up.',
    'case-closure': 'Getting to the end of this — whatever it looks like — took everything I had. Give yourself credit for still being here. And if you need support after, ask for it. There\'s no shame in needing help to land.',
  },
  youth: {
    'case-opening': 'Nobody explained anything to me at first. I just got moved and didn\'t know why or for how long. If that\'s where you are — you\'re allowed to ask questions. Your lawyer works for you, not the system. Ask them to explain everything.',
    'detention': 'I didn\'t know I could speak at my first hearing. You can. If you want the judge to know something about what you want or how you\'re feeling, tell your lawyer beforehand. They can make sure your voice gets in the room.',
    'jurisdiction': 'This part can feel really out of your hands. But your lawyer is supposed to be fighting for what you want, not just what the adults think is best. If something doesn\'t feel right, say something to your attorney.',
    'disposition': 'When they make the plan, you should have some say in it — especially about visits with your family and where you\'re placed. If nobody\'s asking what you want, that\'s a problem. You can ask your lawyer to bring it up in court.',
    'six-month': 'Six months felt like forever to me. The check-ins can feel pointless but they\'re actually your chance to tell the court how things are really going. If your placement isn\'t working or something isn\'t right, this is the moment to say it.',
    'twelve-month': 'By this point I was starting to wonder what my future looked like. That\'s a real question worth asking — about school, about where you\'ll live, about people you want to stay connected to. You\'re allowed to think about your future out loud.',
    'eighteen-month': 'This is when they start making bigger decisions about where you\'ll end up. You deserve to be part of that conversation. If there are people you want to stay connected to — family, friends, mentors — tell your lawyer. Those connections matter and the court can consider them.',
    'permanency': 'Whatever the plan is — going home, staying in care, adoption, guardianship — you\'re allowed to have feelings about it. Find someone you trust to talk to. A therapist, a CASA, a teacher. You shouldn\'t have to carry this alone.',
    'review-hearings': 'The hearings keep happening even when it feels like nothing is changing. Use them. Every one is a chance to tell the court what\'s working and what\'s not. Your voice should be getting louder in this process, not quieter.',
    'case-closure': 'When the case closes, it doesn\'t mean support disappears. There are resources — extended foster care, transitional programs, people whose job it is to help you. Ask what you\'re entitled to before the case closes, not after.',
  },
  supporter: {
    'case-opening': 'When this first started for the person I was supporting, I wanted to fix everything immediately. I couldn\'t. What I could do was show up, listen, and not make them explain the whole thing to me every time. That was enough.',
    'detention': 'I went to the first hearing just to be a familiar face in the room. I didn\'t say anything, I didn\'t need to. But knowing someone was there made a real difference to them. If you can go, go.',
    'jurisdiction': 'This part of the process can feel really abstract and scary. The best thing I did was learn enough about what was happening to ask good questions. Not to take over — just to understand what my person was going through.',
    'disposition': 'The case plan has a lot of requirements. Transportation, childcare, and time off work are real barriers. I found specific things I could help with and offered those. Concrete help is more useful than general encouragement.',
    'six-month': 'Six months in, burnout is real — for them and for you. I had to remind myself that consistency was the most valuable thing I could offer. Not intensity, just reliability. Showing up every week mattered more than grand gestures.',
    'twelve-month': 'At this point I started to understand the system better, which helped me be a better support. If you can learn the language — what hearings mean, what the case plan requires — you can help your person feel less alone in navigating it.',
    'eighteen-month': 'This stretch is emotionally heavy. The stakes feel higher and decisions feel more final. The most important thing I did was just keep showing up and not disappear when things got hard. That\'s when it mattered most.',
    'permanency': 'Whatever the outcome of the permanency hearing, your person is going to need support on the other side of it. Start thinking now about how you can be there for them — not just through the process but after it.',
    'review-hearings': 'Long cases are exhausting for everyone. I made sure to check in on my own capacity too. You can\'t support someone else well if you\'re running on empty. It\'s okay to set limits on what you can give.',
    'case-closure': 'When the case ended I thought my role was done. It wasn\'t. For a lot of families, the hardest adjustment comes after. Stay present. Check in. The relationship you built through this matters beyond the case.',
  },
}

// ─── WHAT MATTERS RIGHT NOW ──────────────────────────────────────────────────

const WHAT_MATTERS: Record<Role, Record<string, string[]>> = {
  parent: {
    'case-opening': [
      'Find your attorney today — you have the right to one at no cost. If you don\'t have one, ask the court.',
      'Do not talk to the social worker without your attorney — anything you say can be used in court.',
      'Write down everything — dates, names, what was said. Start a log today.',
    ],
    'detention': [
      'Meet with your attorney before the hearing — tell them what you want the judge to know.',
      'Arrive early and dress respectfully — first impressions matter to the court.',
      'Ask about visitation — you have the right to see your child. Get a schedule in writing.',
    ],
    'jurisdiction': [
      'Review the petition with your attorney — understand exactly what the allegations are.',
      'Decide what you want to contest — you don\'t have to agree with everything written about you.',
      'Gather any evidence that supports your side — photos, letters, records, witnesses.',
    ],
    'disposition': [
      'Read your case plan carefully — every requirement is something you need to start on immediately.',
      'Enroll in required services this week — waiting costs you time the court is watching.',
      'Ask about help with transportation or childcare — barriers are real and assistance may be available.',
    ],
    'six-month': [
      'Get progress letters from every service provider — bring written proof, not just your word.',
      'Document your visits with your child — dates, how long, how it went.',
      'Ask your attorney what the court needs to see — prepare specifically for what the judge will look for.',
    ],
    'twelve-month': [
      'Show consistency, not perfection — courts want to see steady effort over time.',
      'Demonstrate stable housing and income if possible — even progress toward stability matters.',
      'Talk to your attorney about what\'s needed to bring your child home — know the remaining steps.',
    ],
    'eighteen-month': [
      'Complete every remaining case plan requirement — this is the court\'s primary deadline.',
      'Talk to your attorney about a 388 petition — if circumstances have changed, this is how you ask the court to reconsider.',
      'Do not miss any visits — maintaining your bond with your child is evidence the court considers.',
    ],
    'permanency': [
      'Attend every scheduled visit — your ongoing bond with your child matters to the court even now.',
      'Ask your attorney about the beneficial relationship exception — it may apply in your case.',
      'Document your relationship — letters, photos, records of contact all count.',
    ],
    'review-hearings': [
      'Keep showing up to every hearing — your presence is noticed and it matters.',
      'Stay in contact with your attorney — don\'t wait for them to reach out to you.',
      'Stay involved in your child\'s life — visits, letters, phone calls all demonstrate your commitment.',
    ],
    'case-closure': [
      'Get copies of all your case records — you have the right to them and may need them later.',
      'Ask about aftercare services — support doesn\'t have to end when the case does.',
      'Know what closure means for your specific situation — ask your attorney to explain what comes next.',
    ],
  },
  youth: {
    'case-opening': [
      'Meet your lawyer — they work only for you, not the agency or the court. Ask them to explain what\'s happening.',
      'Ask where you\'re going and why — you have the right to know what is happening in your case.',
      'Tell someone what you need — clothing, medication, school materials. You are allowed to ask.',
    ],
    'detention': [
      'Talk to your lawyer before the hearing — tell them what you want the judge to know.',
      'You can speak in court — if you want to say something, your lawyer can help you do that.',
      'Ask about seeing your family — visitation is something the court decides, and your wishes matter.',
    ],
    'jurisdiction': [
      'Ask your lawyer what is being said about your family — you have the right to know.',
      'Tell your lawyer what you want — your wishes should be represented in court.',
      'Ask questions if you don\'t understand something — there are no bad questions here.',
    ],
    'disposition': [
      'Tell your social worker what you need — therapy, tutoring, medical care. You are allowed to ask for support.',
      'Ask about your visitation schedule — you have the right to see your family regularly.',
      'Make sure your voice is in the plan — if nobody asked what you want, tell your lawyer to bring it up.',
    ],
    'six-month': [
      'Tell the court how things are actually going — if your placement isn\'t safe or working, say so.',
      'Tell your lawyer if anything has changed — school, placement, your feelings about the plan.',
      'Ask what\'s happening with your case — you deserve a straight answer about where things stand.',
    ],
    'twelve-month': [
      'Start thinking about what you want your future to look like — you\'re allowed to say where you want to live.',
      'Tell your lawyer who matters to you — family, friends, mentors you want to stay connected to.',
      'Find someone you trust to talk to — a therapist, CASA, teacher. You shouldn\'t carry this alone.',
    ],
    'eighteen-month': [
      'Make sure your wishes about permanency are known — tell your lawyer clearly what you want.',
      'Talk about people you want to stay connected to — siblings, extended family, mentors. The court can consider this.',
      'Ask about your rights as you get older — extended foster care and transition programs exist for you.',
    ],
    'permanency': [
      'You are allowed to have feelings about this decision — find someone safe to talk to about it.',
      'Ask about staying connected to people who matter to you — relationships don\'t have to end because a plan is set.',
      'Know what support is available to you going forward — ask your lawyer or CASA before anything is finalized.',
    ],
    'review-hearings': [
      'Go to your hearings when you can — your presence tells the court you\'re engaged in your own case.',
      'Keep speaking up about what you need — every hearing is a chance to be heard.',
      'Stay connected to your support people — CASA, attorney, trusted adults. Don\'t go through this alone.',
    ],
    'case-closure': [
      'Ask what you\'re entitled to before the case closes — extended foster care, housing support, education help.',
      'Get copies of your records — medical, educational, case history. You have the right to them.',
      'Know that support doesn\'t disappear — there are programs and people whose job is still to help you.',
    ],
  },
  supporter: {
    'case-opening': [
      'Ask your person what they need most right now — don\'t assume. Listen first.',
      'Learn the basics of the dependency process — understanding what\'s happening helps you support without panic.',
      'Offer one concrete thing — a ride, a meal, someone to sit with. Small and reliable beats grand and inconsistent.',
    ],
    'detention': [
      'Ask if they want you at the hearing — a familiar face in the room matters more than you might think.',
      'Help with logistics — transportation, childcare, anything that removes a barrier to them showing up.',
      'Check in after — hearings are emotionally exhausting. Be available, don\'t push.',
    ],
    'jurisdiction': [
      'Keep showing up — consistency is the most valuable thing you can offer right now.',
      'Learn enough to ask good questions — you don\'t need to be an expert, just informed enough to help.',
      'Don\'t give legal advice — encourage them to rely on their attorney for decisions, not you.',
    ],
    'disposition': [
      'Ask about their case plan requirements — find one specific thing you can help with consistently.',
      'Help remove practical barriers — transportation to services and childcare are the most common blockers.',
      'Celebrate engagement, not perfection — they showed up to a class. That matters. Say so.',
    ],
    'six-month': [
      'Check in on your own capacity — six months is a long time. Make sure you\'re sustainable.',
      'Help them document progress — remind them to get letters from service providers before the hearing.',
      'Stay consistent — reliability matters more than intensity at this stage.',
    ],
    'twelve-month': [
      'Learn the language of the process — understanding what hearings mean helps you explain things to your person.',
      'Ask what they need going into this hearing — practical help, emotional support, or just someone to go with them.',
      'Keep showing up — a year in, your continued presence sends a powerful message.',
    ],
    'eighteen-month': [
      'Don\'t disappear when things feel heavy — this is when your presence matters most.',
      'Help them prepare for the hearing emotionally — listen, don\'t fix. Ask how they\'re feeling about it.',
      'Start thinking about what support looks like on the other side — whatever the outcome, they\'ll need you after.',
    ],
    'permanency': [
      'Be present for whatever comes — the outcome of this hearing will be hard regardless. Just be there.',
      'Ask about ongoing contact arrangements — your relationship with the child or family may be able to continue.',
      'Let them lead on what they need from you — don\'t assume. Ask.',
    ],
    'review-hearings': [
      'Set limits on what you can give — long cases are exhausting. Sustainable support is better than burned-out support.',
      'Check in regularly — even a short message that says "I\'m still here" matters during a long process.',
      'Stay curious about what\'s changed — needs shift over time. Keep asking what\'s most helpful now.',
    ],
    'case-closure': [
      'Don\'t assume your role is done — many families need the most support right after the case closes.',
      'Help them find aftercare resources — services are available but families often don\'t know where to look.',
      'Acknowledge how far they\'ve come — they made it through something incredibly hard. Say that out loud.',
    ],
  },
}

// ─── STAGE ORDER ─────────────────────────────────────────────────────────────

const STAGE_ORDER = [
  'case-opening',
  'detention',
  'jurisdiction',
  'disposition',
  'six-month',
  'twelve-month',
  'eighteen-month',
  'permanency',
  'review-hearings',
  'case-closure',
]

const STAGE_LABELS: Record<Role, Record<string, string>> = {
  parent: {
    'case-opening': 'Case Opening',
    'detention': 'Detention Hearing',
    'jurisdiction': 'Jurisdiction Hearing',
    'disposition': 'Disposition Hearing',
    'six-month': '6-Month Review',
    'twelve-month': '12-Month Review',
    'eighteen-month': '18-Month Review',
    'permanency': 'Permanency Hearing',
    'review-hearings': 'Ongoing Reviews',
    'case-closure': 'Case Closure',
  },
  youth: {
    'case-opening': 'Your Case Begins',
    'detention': 'First Court Hearing',
    'jurisdiction': 'Court Decides',
    'disposition': 'Making the Plan',
    'six-month': '6-Month Check-In',
    'twelve-month': '12-Month Check-In',
    'eighteen-month': '18-Month Decision',
    'permanency': 'Your Permanent Home',
    'review-hearings': 'Regular Check-Ins',
    'case-closure': 'Case Ends',
  },
  supporter: {
    'case-opening': 'Case Opens',
    'detention': 'Detention Hearing',
    'jurisdiction': 'Jurisdiction Hearing',
    'disposition': 'Disposition Hearing',
    'six-month': '6-Month Review',
    'twelve-month': '12-Month Review',
    'eighteen-month': '18-Month Review',
    'permanency': 'Permanency Hearing',
    'review-hearings': 'Ongoing Reviews',
    'case-closure': 'Case Closes',
  },
}

// ─── ROLE COLORS ──────────────────────────────────────────────────────────────

const ROLE_COLORS: Record<Role, { accent: string; bg: string; light: string }> = {
  parent:    { accent: '#7A6690', bg: '#E8DDE8', light: '#F4EFF8' },
  youth:     { accent: '#3A5A80', bg: '#C8D8E8', light: '#EAF0F8' },
  supporter: { accent: '#4A7C59', bg: '#C0D8C4', light: '#EAF4EE' },
}

// ─── FORMAT DATE ─────────────────────────────────────────────────────────────

function formatCourtDate(dateStr: string | null | undefined): string {
  if (!dateStr) return 'Not set'
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

function daysUntil(dateStr: string | null | undefined): number | null {
  if (!dateStr) return null
  const d = new Date(dateStr + 'T00:00:00')
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const diff = Math.round((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  return diff
}

// ─── COMPONENT ───────────────────────────────────────────────────────────────

export function Dashboard() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])

  const role: Role = (profile?.role as Role) || 'parent'
  const currentStage = profile?.current_stage || 'case-opening'
  const colors = ROLE_COLORS[role]

  const currentStageIndex = STAGE_ORDER.indexOf(currentStage)
  const quote = PEER_QUOTES[role][currentStage] || PEER_QUOTES[role]['case-opening']
  const actions = WHAT_MATTERS[role][currentStage] || WHAT_MATTERS[role]['case-opening']
  const stageLabels = STAGE_LABELS[role]
  const nextStageKey = STAGE_ORDER[currentStageIndex + 1] || null
  const courtDate = profile?.next_court_date
  const days = daysUntil(courtDate)

  useEffect(() => {
    if (profile?.id) loadTeam()
    trackEvent('screen_viewed', { screen: 'blueprint', role })
  }, [profile?.id])

  const loadTeam = async () => {
    try {
      const { data } = await supabase
        .from('contacts')
        .select('name, role, phone')
        .eq('user_id', profile!.id)
        .order('created_at', { ascending: true })
        .limit(3)
      if (data) setTeamMembers(data)
    } catch (e) {
      console.error('Error loading team:', e)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F0EAE0', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
      {/* Watermark */}
      <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 0, pointerEvents: 'none' }}>
        <img src='/anchor-icon-only.png' alt='' aria-hidden='true' style={{ width: 340, height: 340, objectFit: 'contain', opacity: 0.055 }} />
      </div>
      <div style={{ position: 'relative', zIndex: 1 }}><AppHeader /></div>

      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 90, position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: 480, margin: '0 auto', padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Logo + Greeting */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', paddingTop: 4, paddingBottom: 4 }}>
            <img
              src='/anchor-icon-only.png'
              alt='Anchor'
              style={{ width: 80, height: 80, objectFit: 'contain', marginBottom: 10 }}
            />
            <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: 28, fontWeight: 700, color: '#2A2030', margin: '0 0 4px' }}>
              {profile?.first_name ? `Hi, ${profile.first_name}` : 'Your Blueprint'}
            </h1>
            <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 14, color: '#9A90A8', margin: 0 }}>
              Here's where you are and what to focus on next
            </p>
          </div>

          {/* Peer voice card */}
          <div style={{
            background: '#FAF7F4',
            borderRadius: 20,
            padding: '16px 18px',
            borderLeft: `3px solid ${colors.accent}`,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 10,
                background: colors.bg,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <Users size={14} color={colors.accent} />
              </div>
              <span style={{
                fontFamily: 'DM Sans, sans-serif', fontSize: 12, fontWeight: 700,
                color: colors.accent,
              }}>
                {PEER_DESCRIPTOR[role]}
              </span>
            </div>
            <p style={{
              fontFamily: 'DM Sans, sans-serif', fontSize: 14,
              color: '#5A5065', lineHeight: 1.7,
              fontStyle: 'italic', margin: 0,
            }}>
              "{quote}"
            </p>
          </div>

          {/* Journey map */}
          <div>
            <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 11, fontWeight: 700, color: '#9A90A8', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 8px' }}>
              Your journey
            </p>
            <div style={{ background: '#FAF7F4', borderRadius: 20, padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 0 }}>
              {STAGE_ORDER.map((stageKey, i) => {
                const isDone = i < currentStageIndex
                const isActive = i === currentStageIndex
                const isLast = i === STAGE_ORDER.length - 1
                const dotColor = isDone ? '#4A7C59' : isActive ? colors.accent : '#D0C8D8'
                const lineColor = isDone ? '#4A7C59' : '#E8E0F0'
                const label = stageLabels[stageKey] || stageKey

                return (
                  <div key={stageKey}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingTop: 3, paddingBottom: 3 }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                        <div style={{
                          width: isActive ? 14 : 10,
                          height: isActive ? 14 : 10,
                          borderRadius: '50%',
                          background: dotColor,
                          boxShadow: isActive ? `0 0 0 4px ${colors.bg}` : 'none',
                          flexShrink: 0,
                        }} />
                      </div>
                      <span style={{
                        fontFamily: 'DM Sans, sans-serif',
                        fontSize: isActive ? 14 : 13,
                        fontWeight: isActive ? 700 : 400,
                        color: isDone ? '#4A7C59' : isActive ? '#2A2030' : '#9A90A8',
                        flex: 1,
                      }}>
                        {label}
                      </span>
                      {isActive && (
                        <span style={{
                          fontFamily: 'DM Sans, sans-serif', fontSize: 10, fontWeight: 700,
                          background: colors.light, color: colors.accent,
                          borderRadius: 20, padding: '2px 10px', flexShrink: 0,
                        }}>
                          You are here
                        </span>
                      )}
                      {isDone && (
                        <span style={{
                          fontFamily: 'DM Sans, sans-serif', fontSize: 10, fontWeight: 600,
                          color: '#4A7C59', flexShrink: 0,
                        }}>
                          ✓
                        </span>
                      )}
                    </div>
                    {!isLast && (
                      <div style={{ width: 2, height: 14, background: lineColor, marginLeft: 4, marginTop: 0, marginBottom: 0 }} />
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* What matters right now */}
          <div style={{ background: '#FAF7F4', borderRadius: 20, padding: '16px 18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <Sparkles size={14} color={colors.accent} />
              <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, fontWeight: 700, color: '#2A2030' }}>
                What matters right now
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {actions.map((action, i) => {
                const [bold, ...rest] = action.split(' — ')
                return (
                  <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <div style={{
                      width: 6, height: 6, borderRadius: '50%',
                      background: colors.accent,
                      marginTop: 6, flexShrink: 0,
                    }} />
                    <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 14, color: '#5A5065', margin: 0, lineHeight: 1.6 }}>
                      <strong style={{ color: '#2A2030', fontWeight: 700 }}>{bold}</strong>
                      {rest.length > 0 && ` — ${rest.join(' — ')}`}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Coming up — court date */}
          <div
            onClick={() => { haptics.light(); navigate('/preparation') }}
            style={{
              background: '#FAF7F4', borderRadius: 20, padding: '16px 18px',
              border: `1.5px solid ${colors.bg}`,
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: '#F5ECD8',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <Calendar size={16} color="#C8883A" />
              </div>
              <div>
                <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 10, fontWeight: 700, color: '#C8883A', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 2px' }}>
                  Coming up
                </p>
                <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 14, fontWeight: 700, color: '#2A2030', margin: '0 0 2px' }}>
                  {stageLabels[currentStage]}
                </p>
                <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: '#9A90A8', margin: 0 }}>
                  {courtDate
                    ? `${formatCourtDate(courtDate)}${days !== null ? ` · ${days > 0 ? `${days} days away` : days === 0 ? 'Today' : `${Math.abs(days)} days ago`}` : ''}`
                    : 'Tap to set your court date'
                  }
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 11, fontWeight: 700, color: colors.accent }}>Prepare</span>
              <ChevronRight size={14} color={colors.accent} />
            </div>
          </div>

          {/* Team preview */}
          {teamMembers.length > 0 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 11, fontWeight: 700, color: '#9A90A8', textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>
                  Your team
                </p>
                <button
                  onClick={() => { haptics.light(); navigate('/contacts') }}
                  style={{ background: 'none', border: 'none', fontFamily: 'DM Sans, sans-serif', fontSize: 12, fontWeight: 700, color: colors.accent, cursor: 'pointer', padding: 0 }}
                >
                  See all
                </button>
              </div>
              <div style={{ background: '#FAF7F4', borderRadius: 20, overflow: 'hidden' }}>
                {teamMembers.map((member, i) => (
                  <div key={i} style={{
                    padding: '12px 18px',
                    borderBottom: i < teamMembers.length - 1 ? '1px solid rgba(122,102,144,0.08)' : 'none',
                    display: 'flex', alignItems: 'center', gap: 12,
                  }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: 10,
                      background: colors.light,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, fontWeight: 700, color: colors.accent }}>
                        {member.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 14, fontWeight: 600, color: '#2A2030', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {member.name}
                      </p>
                      <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: '#9A90A8', margin: 0 }}>
                        {member.role}
                      </p>
                    </div>
                    {member.phone && (
                      <a href={`tel:${member.phone}`} style={{ color: colors.accent }} onClick={(e) => e.stopPropagation()}>
                        <MapPin size={14} color={colors.accent} />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* No team yet — prompt */}
          {teamMembers.length === 0 && (
            <div
              onClick={() => { haptics.light(); navigate('/contacts') }}
              style={{
                background: '#FAF7F4', borderRadius: 20, padding: '16px 18px',
                border: '1.5px dashed rgba(122,102,144,0.25)',
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}
            >
              <div>
                <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, fontWeight: 700, color: '#2A2030', margin: '0 0 2px' }}>
                  Add your team
                </p>
                <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: '#9A90A8', margin: 0 }}>
                  Attorney, social worker, supporters
                </p>
              </div>
              <ChevronRight size={16} color="#9A90A8" />
            </div>
          )}

        </div>
      </div>

      <BottomNav />
    </div>
  )
}
