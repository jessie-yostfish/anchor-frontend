import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Users,
  User,
  Heart,
  Phone,
  Calendar,
  Clipboard,
  Gavel,
  Bell,
  Lock,
  ChevronLeft,
  Home,
  Check,
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

type Role = 'parent' | 'youth' | 'supporter'
type ChildrenStatus = 'at_home' | 'removed' | 'with_family'
type LawyerStatus = 'yes' | 'no' | 'unsure'
type CaseManagerStatus = 'yes' | 'no' | 'unsure'
type CourtHistory = 'not_yet' | 'been_to_court' | 'scheduled'
type Stage = 'detention' | 'jurisdiction' | 'disposition' | 'review' | 'permanency'
type YouthPlacement = 'home' | 'foster' | 'relative' | 'group_home' | 'other'
type SupporterRelation = 'family' | 'friend' | 'mentor' | 'professional' | 'other'

interface ReminderSettings {
  courtHearings: { enabled: boolean; timing: string }
  appointments: { enabled: boolean; timing: string }
  tasks: { enabled: boolean; timing: string }
  visits: { enabled: boolean; timing: string }
}

// ── STYLES ───────────────────────────────────────────────────────────────────
const S = {
  page: { background: '#F0EAE0', minHeight: '100vh' } as React.CSSProperties,
  card: {
    background: '#FAF7F4',
    border: '1px solid rgba(122,102,144,0.12)',
    borderRadius: 24,
    padding: '20px',
    marginBottom: 12,
  } as React.CSSProperties,
  input: {
    background: '#F0EAE0',
    border: '1.5px solid rgba(122,102,144,0.2)',
    borderRadius: 16,
    padding: '14px 16px',
    color: '#2A2030',
    outline: 'none',
    width: '100%',
    fontSize: 16,
    fontFamily: 'inherit',
  } as React.CSSProperties,
  inputFocus: {
    border: '1.5px solid #7A6690',
  } as React.CSSProperties,
  label: {
    display: 'block',
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '0.07em',
    textTransform: 'uppercase' as const,
    color: '#9A90A8',
    marginBottom: 8,
  } as React.CSSProperties,
  heading: {
    fontFamily: "'Fraunces', Georgia, serif",
    fontWeight: 700,
    fontSize: 26,
    color: '#2A2030',
    lineHeight: 1.25,
    marginBottom: 8,
  } as React.CSSProperties,
  sub: {
    fontSize: 15,
    color: '#5A5065',
    lineHeight: 1.5,
    marginBottom: 24,
  } as React.CSSProperties,
  primaryBtn: {
    background: '#7A6690',
    color: 'white',
    border: 'none',
    borderRadius: 16,
    padding: '15px 24px',
    fontWeight: 700,
    fontSize: 16,
    cursor: 'pointer',
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    boxShadow: '0 4px 16px rgba(122,102,144,0.3)',
    transition: 'opacity 0.15s',
  } as React.CSSProperties,
  backBtn: {
    background: '#E8DDE8',
    color: '#7A6690',
    border: 'none',
    borderRadius: 16,
    padding: '15px 20px',
    fontWeight: 600,
    fontSize: 15,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  } as React.CSSProperties,
}

// ── OPTION BUTTON ─────────────────────────────────────────────────────────────
function OptionBtn({
  selected,
  onClick,
  children,
}: {
  selected: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left transition-all"
      style={{
        background: selected ? '#F4EFF8' : '#FAF7F4',
        border: selected ? '2px solid #7A6690' : '1.5px solid rgba(122,102,144,0.15)',
        borderRadius: 20,
        padding: '16px 18px',
        marginBottom: 10,
        cursor: 'pointer',
      }}
    >
      <div className="flex items-center gap-3">
        <div
          className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
          style={{
            background: selected ? '#7A6690' : 'transparent',
            border: selected ? '2px solid #7A6690' : '2px solid rgba(122,102,144,0.3)',
          }}
        >
          {selected && <Check className="w-3 h-3 text-white" />}
        </div>
        <span style={{ color: '#2A2030', fontWeight: selected ? 600 : 400, fontSize: 15 }}>
          {children}
        </span>
      </div>
    </button>
  )
}

// ── CONTACT INFO BLOCK ────────────────────────────────────────────────────────
function ContactFields({
  namePlaceholder,
  nameValue,
  onNameChange,
  phoneValue,
  onPhoneChange,
}: {
  namePlaceholder: string
  nameValue: string
  onNameChange: (v: string) => void
  phoneValue: string
  onPhoneChange: (v: string) => void
}) {
  return (
    <div
      className="space-y-3 mt-3"
      style={{ background: '#F4EFF8', borderRadius: 16, padding: 16 }}
    >
      <div>
        <label style={S.label}>Name</label>
        <input
          type="text"
          value={nameValue}
          onChange={e => onNameChange(e.target.value)}
          placeholder={namePlaceholder}
          style={S.input}
        />
      </div>
      <div>
        <label style={S.label}>Phone Number</label>
        <input
          type="tel"
          value={phoneValue}
          onChange={e => onPhoneChange(e.target.value)}
          placeholder="(555) 123-4567"
          style={S.input}
        />
      </div>
    </div>
  )
}

export function Onboarding() {
  const { profile, updateProfile } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [saving, setSaving] = useState(false)

  const [firstName, setFirstName] = useState('')
  const [lawyerStatus, setLawyerStatus] = useState<LawyerStatus | null>(null)
  const [lawyerName, setLawyerName] = useState('')
  const [lawyerPhone, setLawyerPhone] = useState('')
  const [caseManagerStatus, setCaseManagerStatus] = useState<CaseManagerStatus | null>(null)
  const [caseManagerName, setCaseManagerName] = useState('')
  const [caseManagerPhone, setCaseManagerPhone] = useState('')
  const [courtHistory, setCourtHistory] = useState<CourtHistory | null>(null)
  const [selectedStages, setSelectedStages] = useState<Stage[]>([])
  const [nextCourtDate, setNextCourtDate] = useState('')
  const [primaryConcerns, setPrimaryConcerns] = useState('')
  const [textRemindersEnabled, setTextRemindersEnabled] = useState(false)
  const [phoneNumber, setPhoneNumber] = useState('')
  const [reminderSettings, setReminderSettings] = useState<ReminderSettings>({
    courtHearings: { enabled: true, timing: '1_day' },
    appointments: { enabled: true, timing: '1_day' },
    tasks: { enabled: true, timing: '1_day' },
    visits: { enabled: true, timing: '2_hours' },
  })
  const [childrenStatus, setChildrenStatus] = useState<ChildrenStatus | null>(null)
  const [youthPlacement, setYouthPlacement] = useState<YouthPlacement | null>(null)
  const [youthAge, setYouthAge] = useState('')
  const [hasCASD, setHasCASD] = useState<LawyerStatus | null>(null)
  const [casdName, setCasdName] = useState('')
  const [casdPhone, setCasdPhone] = useState('')
  const [supporterRelation, setSupporterRelation] = useState<SupporterRelation | null>(null)
  const [whoSupporting, setWhoSupporting] = useState('')

  const role = (profile?.role as Role) || 'parent'

  useEffect(() => {
    if (profile?.first_name) setFirstName(profile.first_name)
    if (profile?.intake_completed) { navigate('/dashboard'); return }
    if (profile?.intake_step && profile.intake_step <= 10) setStep(profile.intake_step)
  }, [profile, navigate])

  const saveProgress = async (currentStep: number, data: Record<string, unknown>) => {
    setSaving(true)
    await updateProfile({ ...data, intake_step: currentStep })
    setSaving(false)
  }

  const handleNext = async () => {
    let nextStep = step + 1
    const updates: Record<string, unknown> = {}

    if (role === 'parent') {
      switch (step) {
        case 1: updates.first_name = firstName; break
        case 2: updates.children_status = childrenStatus; break
        case 3:
          updates.has_lawyer = lawyerStatus
          if (lawyerStatus === 'yes') { updates.lawyer_name = lawyerName; updates.lawyer_phone = lawyerPhone }
          break
        case 4:
          updates.has_case_manager = caseManagerStatus
          if (caseManagerStatus === 'yes') { updates.case_manager_name = caseManagerName; updates.case_manager_phone = caseManagerPhone }
          break
        case 5:
          updates.court_history = courtHistory
          if (courtHistory === 'not_yet' || courtHistory === 'scheduled') nextStep = 7
          break
        case 6: updates.current_stage = selectedStages[selectedStages.length - 1] || null; break
        case 7: updates.next_court_date = nextCourtDate || null; break
        case 8: updates.primary_concerns = primaryConcerns; break
        case 9:
          updates.text_reminders_enabled = textRemindersEnabled
          updates.phone_number = textRemindersEnabled ? phoneNumber : null
          if (!textRemindersEnabled) nextStep = 11
          break
        case 10: updates.reminder_settings = reminderSettings; nextStep = 11; break
      }
    }

    if (role === 'youth') {
      switch (step) {
        case 1: updates.first_name = firstName; break
        case 2: updates.youth_age = youthAge; updates.youth_placement = youthPlacement; break
        case 3:
          updates.has_lawyer = lawyerStatus
          if (lawyerStatus === 'yes') { updates.lawyer_name = lawyerName; updates.lawyer_phone = lawyerPhone }
          break
        case 4:
          updates.has_casd = hasCASD
          if (hasCASD === 'yes') { updates.casd_name = casdName; updates.casd_phone = casdPhone }
          break
        case 5:
          updates.has_case_manager = caseManagerStatus
          if (caseManagerStatus === 'yes') { updates.case_manager_name = caseManagerName; updates.case_manager_phone = caseManagerPhone }
          break
        case 6:
          updates.court_history = courtHistory
          if (courtHistory === 'not_yet' || courtHistory === 'scheduled') nextStep = 8
          break
        case 7: updates.current_stage = selectedStages[selectedStages.length - 1] || null; break
        case 8: updates.next_court_date = nextCourtDate || null; break
        case 9: updates.primary_concerns = primaryConcerns; break
        case 10:
          updates.text_reminders_enabled = textRemindersEnabled
          updates.phone_number = textRemindersEnabled ? phoneNumber : null
          nextStep = 11
          break
      }
    }

    if (role === 'supporter') {
      switch (step) {
        case 1: updates.first_name = firstName; break
        case 2: updates.supporter_relation = supporterRelation; updates.who_supporting = whoSupporting; break
        case 3:
          updates.court_history = courtHistory
          if (courtHistory === 'not_yet' || courtHistory === 'scheduled') nextStep = 5
          break
        case 4: updates.current_stage = selectedStages[selectedStages.length - 1] || null; break
        case 5: updates.next_court_date = nextCourtDate || null; break
        case 6: updates.primary_concerns = primaryConcerns; break
        case 7:
          updates.text_reminders_enabled = textRemindersEnabled
          updates.phone_number = textRemindersEnabled ? phoneNumber : null
          nextStep = 8
          break
      }
    }

    await saveProgress(nextStep, updates)

    if (nextStep >= 11 || (role === 'supporter' && nextStep >= 8)) {
      await updateProfile({ intake_completed: true })
      navigate('/foster-care-intro')
    } else {
      setStep(nextStep)
    }
  }

  const handleBack = () => {
    let prevStep = step - 1
    if (role === 'parent') {
      if (step === 7 && courtHistory !== 'been_to_court') prevStep = 5
      else if (step === 11 && !textRemindersEnabled) prevStep = 9
    }
    if (role === 'youth' && step === 8 && courtHistory !== 'been_to_court') prevStep = 6
    if (role === 'supporter' && step === 5 && courtHistory !== 'been_to_court') prevStep = 3
    setStep(prevStep)
  }

  const isStepValid = () => {
    if (step === 1) return firstName.trim().length > 0
    if (role === 'parent') {
      switch (step) {
        case 2: return childrenStatus !== null
        case 3: return lawyerStatus !== null && (lawyerStatus !== 'yes' || (lawyerName.trim().length > 0 && lawyerPhone.trim().length > 0))
        case 4: return caseManagerStatus !== null && (caseManagerStatus !== 'yes' || (caseManagerName.trim().length > 0 && caseManagerPhone.trim().length > 0))
        case 5: return courtHistory !== null
        case 6: return selectedStages.length > 0
        case 7: case 8: return true
        case 9: return !textRemindersEnabled || phoneNumber.trim().length >= 10
        case 10: return true
      }
    }
    if (role === 'youth') {
      switch (step) {
        case 2: return youthPlacement !== null && youthAge.trim().length > 0
        case 3: return lawyerStatus !== null && (lawyerStatus !== 'yes' || (lawyerName.trim().length > 0 && lawyerPhone.trim().length > 0))
        case 4: return hasCASD !== null && (hasCASD !== 'yes' || (casdName.trim().length > 0 && casdPhone.trim().length > 0))
        case 5: return caseManagerStatus !== null && (caseManagerStatus !== 'yes' || (caseManagerName.trim().length > 0 && caseManagerPhone.trim().length > 0))
        case 6: return courtHistory !== null
        case 7: return selectedStages.length > 0
        case 8: case 9: return true
        case 10: return !textRemindersEnabled || phoneNumber.trim().length >= 10
      }
    }
    if (role === 'supporter') {
      switch (step) {
        case 2: return supporterRelation !== null && whoSupporting.trim().length > 0
        case 3: return courtHistory !== null
        case 4: return selectedStages.length > 0
        case 5: case 6: return true
        case 7: return !textRemindersEnabled || phoneNumber.trim().length >= 10
      }
    }
    return false
  }

  const getTotalSteps = () => role === 'supporter' ? 7 : 10
  const totalSteps = getTotalSteps()
  const progress = (step / totalSteps) * 100

  const isLastStep = (role === 'supporter' && step === 7) || (role !== 'supporter' && step === totalSteps)

  // ── RENDER ────────────────────────────────────────────────────────────────
  return (
    <div style={S.page}>
      <div className="max-w-md mx-auto px-5 pt-10 pb-16">

        {/* Progress bar */}
        <div className="mb-8">
          <div
            className="h-1.5 rounded-full mb-4"
            style={{ background: '#E8DDE8' }}
          >
            <div
              className="h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${progress}%`, background: '#7A6690' }}
            />
          </div>
          <p className="text-xs font-semibold" style={{ color: '#9A90A8' }}>
            Step {step} of {totalSteps}
          </p>
        </div>

        {/* ── STEP 1: Name (all roles) ── */}
        {step === 1 && (
          <div>
            <h1 style={S.heading}>What should we call you?</h1>
            <p style={S.sub}>Just your first name is fine.</p>
            <label style={S.label}>First Name</label>
            <input
              type="text"
              value={firstName}
              onChange={e => setFirstName(e.target.value)}
              placeholder="Your first name"
              style={S.input}
              autoFocus
            />
          </div>
        )}

        {/* ── PARENT: Step 2 — Children status ── */}
        {role === 'parent' && step === 2 && (
          <div>
            <h1 style={S.heading}>Are your children currently with you?</h1>
            <p style={S.sub}>This helps us understand where you are in the process.</p>
            <OptionBtn selected={childrenStatus === 'at_home'} onClick={() => setChildrenStatus('at_home')}>My children are still with me at home</OptionBtn>
            <OptionBtn selected={childrenStatus === 'removed'} onClick={() => setChildrenStatus('removed')}>My children have been removed from my home</OptionBtn>
            <OptionBtn selected={childrenStatus === 'with_family'} onClick={() => setChildrenStatus('with_family')}>My children are staying with family or friends temporarily</OptionBtn>
          </div>
        )}

        {/* ── YOUTH: Step 2 — Age and placement ── */}
        {role === 'youth' && step === 2 && (
          <div>
            <h1 style={S.heading}>Tell us about your situation</h1>
            <p style={S.sub}>This helps us give you the right support.</p>
            <label style={S.label}>How old are you?</label>
            <input
              type="number"
              value={youthAge}
              onChange={e => setYouthAge(e.target.value)}
              placeholder="Your age"
              min="0" max="21"
              style={{ ...S.input, marginBottom: 20 }}
            />
            <label style={S.label}>Where are you currently living?</label>
            <OptionBtn selected={youthPlacement === 'home'} onClick={() => setYouthPlacement('home')}>At home with my parents</OptionBtn>
            <OptionBtn selected={youthPlacement === 'foster'} onClick={() => setYouthPlacement('foster')}>In a foster home</OptionBtn>
            <OptionBtn selected={youthPlacement === 'relative'} onClick={() => setYouthPlacement('relative')}>With a relative or family member</OptionBtn>
            <OptionBtn selected={youthPlacement === 'group_home'} onClick={() => setYouthPlacement('group_home')}>In a group home</OptionBtn>
            <OptionBtn selected={youthPlacement === 'other'} onClick={() => setYouthPlacement('other')}>Other placement</OptionBtn>
          </div>
        )}

        {/* ── SUPPORTER: Step 2 — Relation ── */}
        {role === 'supporter' && step === 2 && (
          <div>
            <h1 style={S.heading}>Tell us about your role</h1>
            <p style={S.sub}>This helps us give you the right information.</p>
            <label style={S.label}>What is your relationship?</label>
            <OptionBtn selected={supporterRelation === 'family'} onClick={() => setSupporterRelation('family')}>Family member (grandparent, aunt, uncle, sibling…)</OptionBtn>
            <OptionBtn selected={supporterRelation === 'friend'} onClick={() => setSupporterRelation('friend')}>Family friend or close support person</OptionBtn>
            <OptionBtn selected={supporterRelation === 'mentor'} onClick={() => setSupporterRelation('mentor')}>Mentor or community support</OptionBtn>
            <OptionBtn selected={supporterRelation === 'professional'} onClick={() => setSupporterRelation('professional')}>Professional advocate or helper</OptionBtn>
            <OptionBtn selected={supporterRelation === 'other'} onClick={() => setSupporterRelation('other')}>Other</OptionBtn>
            <label style={{ ...S.label, marginTop: 16 }}>Who are you supporting?</label>
            <input
              type="text"
              value={whoSupporting}
              onChange={e => setWhoSupporting(e.target.value)}
              placeholder="e.g., My niece Sarah, The Rodriguez family"
              style={S.input}
            />
          </div>
        )}

        {/* ── SHARED: Lawyer step ── */}
        {((role === 'parent' && step === 3) || (role === 'youth' && step === 3)) && (
          <div>
            <h1 style={S.heading}>
              {role === 'youth' ? 'Do you have your own lawyer?' : 'Do you have a lawyer assigned to your case?'}
            </h1>
            <p style={S.sub}>
              {role === 'youth'
                ? 'Every young person in dependency court has the right to their own lawyer — separate from your parents.'
                : 'You have the right to a lawyer at no cost. If you do not have one yet, the court will appoint one.'}
            </p>
            <OptionBtn selected={lawyerStatus === 'yes'} onClick={() => setLawyerStatus('yes')}>Yes, I have a lawyer</OptionBtn>
            <OptionBtn selected={lawyerStatus === 'no'} onClick={() => setLawyerStatus('no')}>No, I do not have one yet</OptionBtn>
            <OptionBtn selected={lawyerStatus === 'unsure'} onClick={() => setLawyerStatus('unsure')}>I am not sure</OptionBtn>
            {lawyerStatus === 'yes' && (
              <ContactFields
                namePlaceholder="Lawyer's name"
                nameValue={lawyerName}
                onNameChange={setLawyerName}
                phoneValue={lawyerPhone}
                onPhoneChange={setLawyerPhone}
              />
            )}
          </div>
        )}

        {/* ── YOUTH ONLY: CASA step ── */}
        {role === 'youth' && step === 4 && (
          <div>
            <h1 style={S.heading}>Do you have a CASA volunteer?</h1>
            <p style={S.sub}>A CASA (Court Appointed Special Advocate) is a trained volunteer who is there just for you — not for your parents or the court.</p>
            <OptionBtn selected={hasCASD === 'yes'} onClick={() => setHasCASD('yes')}>Yes, I have a CASA</OptionBtn>
            <OptionBtn selected={hasCASD === 'no'} onClick={() => setHasCASD('no')}>No, I do not have one</OptionBtn>
            <OptionBtn selected={hasCASD === 'unsure'} onClick={() => setHasCASD('unsure')}>I am not sure</OptionBtn>
            {hasCASD === 'yes' && (
              <ContactFields
                namePlaceholder="CASA volunteer's name"
                nameValue={casdName}
                onNameChange={setCasdName}
                phoneValue={casdPhone}
                onPhoneChange={setCasdPhone}
              />
            )}
          </div>
        )}

        {/* ── SHARED: Case manager step ── */}
        {((role === 'parent' && step === 4) || (role === 'youth' && step === 5)) && (
          <div>
            <h1 style={S.heading}>Do you have a social worker or case manager?</h1>
            <p style={S.sub}>This is the person assigned to your case who coordinates services and visits. Their contact info is important to have.</p>
            <OptionBtn selected={caseManagerStatus === 'yes'} onClick={() => setCaseManagerStatus('yes')}>Yes, I have a social worker</OptionBtn>
            <OptionBtn selected={caseManagerStatus === 'no'} onClick={() => setCaseManagerStatus('no')}>No, not yet</OptionBtn>
            <OptionBtn selected={caseManagerStatus === 'unsure'} onClick={() => setCaseManagerStatus('unsure')}>I am not sure</OptionBtn>
            {caseManagerStatus === 'yes' && (
              <ContactFields
                namePlaceholder="Social worker's name"
                nameValue={caseManagerName}
                onNameChange={setCaseManagerName}
                phoneValue={caseManagerPhone}
                onPhoneChange={setCaseManagerPhone}
              />
            )}
          </div>
        )}

        {/* ── SHARED: Court history ── */}
        {((role === 'parent' && step === 5) || (role === 'youth' && step === 6) || (role === 'supporter' && step === 3)) && (
          <div>
            <h1 style={S.heading}>
              {role === 'supporter' ? 'Has the person you are supporting been to court yet?' : 'Have you been to any court hearings yet?'}
            </h1>
            <p style={S.sub}>We will help figure out where {role === 'supporter' ? 'they are' : 'you are'} in the process.</p>
            <OptionBtn selected={courtHistory === 'not_yet'} onClick={() => setCourtHistory('not_yet')}>
              {role === 'supporter' ? 'No, they have not been to court yet' : 'No, I have not been to court yet'}
            </OptionBtn>
            <OptionBtn selected={courtHistory === 'been_to_court'} onClick={() => setCourtHistory('been_to_court')}>
              {role === 'supporter' ? 'Yes, they have been to one or more hearings' : 'Yes, I have been to one or more hearings'}
            </OptionBtn>
            <OptionBtn selected={courtHistory === 'scheduled'} onClick={() => setCourtHistory('scheduled')}>
              {role === 'supporter' ? 'They have a date scheduled but have not gone yet' : 'I have my first date scheduled but have not gone yet'}
            </OptionBtn>
          </div>
        )}

        {/* ── SHARED: Case stage ── */}
        {((role === 'parent' && step === 6) || (role === 'youth' && step === 7) || (role === 'supporter' && step === 4)) && (
          <div>
            <h1 style={S.heading}>Let us figure out where {role === 'supporter' ? 'they are' : 'you are'} in the process</h1>
            <p style={S.sub}>Check everything that has already happened:</p>
            {[
              { id: 'detention', label: role === 'supporter' ? 'They went to their first hearing (within days of removal)' : 'I went to my first hearing (within days of removal)', sub: 'Detention Hearing' },
              { id: 'jurisdiction', label: 'The court decided if the case should stay open', sub: 'Jurisdiction Hearing' },
              { id: 'disposition', label: role === 'supporter' ? 'They received a case plan with goals to complete' : 'I received a case plan with goals to complete', sub: 'Disposition Hearing' },
              { id: 'review', label: role === 'supporter' ? 'They are going to regular review hearings' : 'I am going to regular review hearings', sub: 'Review Hearings' },
              { id: 'permanency', label: role === 'supporter' ? 'The court is deciding on a permanent plan' : 'The court is deciding on a permanent plan for my children', sub: 'Permanency Hearing' },
            ].map(stage => {
              const isSelected = selectedStages.includes(stage.id as Stage)
              return (
                <button
                  key={stage.id}
                  type="button"
                  onClick={() => {
                    const id = stage.id as Stage
                    setSelectedStages(isSelected ? selectedStages.filter(s => s !== id) : [...selectedStages, id])
                  }}
                  className="w-full text-left transition-all"
                  style={{
                    background: isSelected ? '#F4EFF8' : '#FAF7F4',
                    border: isSelected ? '2px solid #7A6690' : '1.5px solid rgba(122,102,144,0.15)',
                    borderRadius: 20,
                    padding: '14px 18px',
                    marginBottom: 10,
                    cursor: 'pointer',
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{
                        background: isSelected ? '#7A6690' : 'transparent',
                        border: isSelected ? '2px solid #7A6690' : '2px solid rgba(122,102,144,0.3)',
                        borderRadius: 6,
                      }}
                    >
                      {isSelected && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <div>
                      <p style={{ color: '#2A2030', fontWeight: isSelected ? 600 : 400, fontSize: 15 }}>{stage.label}</p>
                      <p style={{ color: '#9A90A8', fontSize: 12, marginTop: 2 }}>{stage.sub}</p>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        )}

        {/* ── SHARED: Next court date ── */}
        {((role === 'parent' && step === 7) || (role === 'youth' && step === 8) || (role === 'supporter' && step === 5)) && (
          <div>
            <h1 style={S.heading}>{role === 'supporter' ? 'Do they have an upcoming court date?' : 'Do you have an upcoming court date?'}</h1>
            <p style={S.sub}>If you know the date, we can help you prepare. You can always add or change this later.</p>
            <label style={S.label}>Next Court Date (optional)</label>
            <input
              type="date"
              value={nextCourtDate}
              onChange={e => setNextCourtDate(e.target.value)}
              style={S.input}
            />
            <p style={{ fontSize: 13, color: '#9A90A8', marginTop: 8 }}>Leave blank if you do not know yet.</p>
          </div>
        )}

        {/* ── SHARED: Primary concerns ── */}
        {((role === 'parent' && step === 8) || (role === 'youth' && step === 9) || (role === 'supporter' && step === 6)) && (
          <div>
            <h1 style={S.heading}>What are you most worried about right now?</h1>
            <p style={S.sub}>This is optional. Your answer helps us show you the most relevant information first.</p>
            <textarea
              value={primaryConcerns}
              onChange={e => setPrimaryConcerns(e.target.value)}
              placeholder={
                role === 'youth'
                  ? 'Things like school, visits with family, your placement, or anything else on your mind...'
                  : role === 'supporter'
                  ? 'Things like helping them prepare for court, understanding the process, finding resources...'
                  : 'Things like upcoming hearings, visits, services, housing, or anything else on your mind...'
              }
              rows={5}
              className="resize-none"
              style={S.input}
            />
          </div>
        )}

        {/* ── SHARED: Text reminders ── */}
        {((role === 'parent' && step === 9) || (role === 'youth' && step === 10) || (role === 'supporter' && step === 7)) && (
          <div>
            <h1 style={S.heading}>Stay on top of important dates</h1>
            <p style={S.sub}>We can send you text reminders for court dates and appointments. You can turn this off anytime.</p>

            <button
              type="button"
              onClick={() => setTextRemindersEnabled(!textRemindersEnabled)}
              className="w-full text-left transition-all"
              style={{
                background: textRemindersEnabled ? '#F4EFF8' : '#FAF7F4',
                border: textRemindersEnabled ? '2px solid #7A6690' : '1.5px solid rgba(122,102,144,0.15)',
                borderRadius: 20,
                padding: '16px 18px',
                marginBottom: 16,
                cursor: 'pointer',
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl p-2" style={{ background: '#E8DDE8' }}>
                    <Bell className="w-5 h-5" style={{ color: '#7A6690' }} />
                  </div>
                  <div>
                    <p style={{ color: '#2A2030', fontWeight: 600, fontSize: 15 }}>Text Message Reminders</p>
                    <p style={{ color: '#5A5065', fontSize: 13 }}>Court dates, appointments, deadlines</p>
                  </div>
                </div>
                <div
                  className="rounded-full transition-all flex-shrink-0"
                  style={{ width: 44, height: 24, background: textRemindersEnabled ? '#7A6690' : '#D4C8D8', position: 'relative' }}
                >
                  <div
                    className="rounded-full transition-all"
                    style={{
                      width: 18, height: 18, background: 'white',
                      position: 'absolute', top: 3,
                      left: textRemindersEnabled ? 23 : 3,
                      boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
                    }}
                  />
                </div>
              </div>
            </button>

            {textRemindersEnabled && (
              <div style={{ marginBottom: 16 }}>
                <label style={S.label}>Your Phone Number</label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={e => setPhoneNumber(e.target.value)}
                  placeholder="(555) 123-4567"
                  style={S.input}
                />
              </div>
            )}

            <div
              className="flex items-start gap-3 rounded-2xl p-4"
              style={{ background: '#F5ECD8', border: '1px solid rgba(200,136,58,0.2)' }}
            >
              <Lock className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#C8883A' }} />
              <div>
                <p style={{ fontSize: 12, fontWeight: 700, color: '#7A5A2A', marginBottom: 4 }}>Your privacy is protected</p>
                <p style={{ fontSize: 12, color: '#7A5A2A', lineHeight: 1.5 }}>
                  Your phone number is never shared. Messages contain only dates and times — no personal details. Text STOP to unsubscribe anytime.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ── PARENT ONLY: Reminder settings ── */}
        {role === 'parent' && step === 10 && (
          <div>
            <h1 style={S.heading}>When do you want reminders?</h1>
            <p style={S.sub}>Choose how far in advance to be notified for each type of event.</p>
            <div className="space-y-3">
              {[
                { key: 'courtHearings', icon: Gavel, label: 'Court Hearings', desc: 'Upcoming court dates' },
                { key: 'appointments', icon: Calendar, label: 'Appointments', desc: 'Social worker meetings and more' },
                { key: 'tasks', icon: Clipboard, label: 'Tasks & Classes', desc: 'Parenting classes and required tasks' },
                { key: 'visits', icon: Heart, label: 'Child Visits', desc: 'Scheduled visits with your children' },
              ].map(cat => {
                const Icon = cat.icon
                const setting = reminderSettings[cat.key as keyof ReminderSettings]
                return (
                  <div
                    key={cat.key}
                    style={{
                      background: '#FAF7F4',
                      border: '1px solid rgba(122,102,144,0.12)',
                      borderRadius: 20,
                      padding: 16,
                    }}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="rounded-xl p-2" style={{ background: '#E8DDE8' }}>
                        <Icon className="w-4 h-4" style={{ color: '#7A6690' }} />
                      </div>
                      <div className="flex-1">
                        <p style={{ color: '#2A2030', fontWeight: 600, fontSize: 14 }}>{cat.label}</p>
                        <p style={{ color: '#9A90A8', fontSize: 12 }}>{cat.desc}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setReminderSettings({ ...reminderSettings, [cat.key]: { ...setting, enabled: !setting.enabled } })}
                        className="rounded-full transition-all flex-shrink-0"
                        style={{ width: 40, height: 22, background: setting.enabled ? '#7A6690' : '#D4C8D8', position: 'relative', border: 'none', cursor: 'pointer' }}
                      >
                        <div
                          className="rounded-full transition-all"
                          style={{ width: 16, height: 16, background: 'white', position: 'absolute', top: 3, left: setting.enabled ? 21 : 3, boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }}
                        />
                      </button>
                    </div>
                    {setting.enabled && (
                      <div className="flex gap-2 flex-wrap">
                        {['2_hours', '1_day', '3_days', '1_week'].map(timing => {
                          const labels: Record<string, string> = { '2_hours': '2 hrs before', '1_day': '1 day before', '3_days': '3 days before', '1_week': '1 week before' }
                          return (
                            <button
                              key={timing}
                              type="button"
                              onClick={() => setReminderSettings({ ...reminderSettings, [cat.key]: { ...setting, timing } })}
                              style={{
                                padding: '6px 12px',
                                borderRadius: 20,
                                fontSize: 12,
                                fontWeight: 600,
                                border: 'none',
                                cursor: 'pointer',
                                background: setting.timing === timing ? '#7A6690' : '#E8DDE8',
                                color: setting.timing === timing ? 'white' : '#7A6690',
                              }}
                            >
                              {labels[timing]}
                            </button>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ── NAV BUTTONS ── */}
        <div className="flex gap-3 mt-8">
          {step > 1 && (
            <button
              onClick={handleBack}
              disabled={saving}
              style={S.backBtn}
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>
          )}
          <button
            onClick={handleNext}
            disabled={!isStepValid() || saving}
            style={{
              ...S.primaryBtn,
              opacity: (!isStepValid() || saving) ? 0.5 : 1,
            }}
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving...
              </>
            ) : isLastStep ? (
              'Take Me to Anchor →'
            ) : (
              'Continue'
            )}
          </button>
        </div>

        {/* Privacy note */}
        <div className="flex items-center justify-center gap-2 mt-6">
          <Lock className="w-3 h-3" style={{ color: '#9A90A8' }} />
          <p style={{ fontSize: 12, color: '#9A90A8' }}>
            Your answers are private and never shared with CPS or the court.
          </p>
        </div>

      </div>
    </div>
  )
}
