import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Users,
  User,
  Heart,
  Briefcase,
  Phone,
  Calendar,
  Clipboard,
  Gavel,
  Bell,
  Lock,
  ChevronLeft,
} from 'lucide-react'
import { Button, PrivacyNotice } from '../components'
import { useAuth } from '../contexts/AuthContext'

type Role = 'parent' | 'youth' | 'supporter'
type ChildrenStatus = 'at_home' | 'removed' | 'with_family'
type LawyerStatus = 'yes' | 'no' | 'unsure'
type CaseManagerStatus = 'yes' | 'no' | 'unsure'
type CourtHistory = 'not_yet' | 'been_to_court' | 'scheduled'
type Stage = 'detention' | 'jurisdiction' | 'disposition' | 'review' | 'permanency'

interface ReminderSettings {
  courtHearings: { enabled: boolean; timing: string }
  appointments: { enabled: boolean; timing: string }
  tasks: { enabled: boolean; timing: string }
  visits: { enabled: boolean; timing: string }
}

export function Onboarding() {
  const { profile, updateProfile } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [saving, setSaving] = useState(false)

  const [firstName, setFirstName] = useState('')
  const [childrenStatus, setChildrenStatus] = useState<ChildrenStatus | null>(null)
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

  const role = (profile?.role as Role) || 'parent'

 useEffect(() => {
    if (profile?.first_name) {
      setFirstName(profile.first_name)
    }
    if (profile?.intake_completed) {
      navigate('/dashboard')
      return
    }
    if (profile?.intake_step && profile.intake_step <= 10) {
      setStep(profile.intake_step)
    }
  }, [profile, navigate])

  const saveProgress = async (currentStep: number, data: Record<string, unknown>) => {
    setSaving(true)
    await updateProfile({
      ...data,
      intake_step: currentStep,
    })
    setSaving(false)
  }

  const handleNext = async () => {
    let nextStep = step + 1
    const updates: Record<string, unknown> = {}

    switch (step) {
      case 1:
        updates.first_name = firstName
        updates.full_name = firstName
        break
      case 2:
        if (role !== 'parent') {
          nextStep = 3
        } else {
          updates.children_status = childrenStatus
        }
        break
      case 3:
        updates.has_lawyer = lawyerStatus
        if (lawyerStatus === 'yes') {
          updates.lawyer_name = lawyerName
          updates.lawyer_phone = lawyerPhone
        }
        break
      case 4:
        updates.has_case_manager = caseManagerStatus
        if (caseManagerStatus === 'yes') {
          updates.case_manager_name = caseManagerName
          updates.case_manager_phone = caseManagerPhone
        }
        break
      case 5:
        updates.court_history = courtHistory
        if (courtHistory === 'not_yet' || courtHistory === 'scheduled') {
          nextStep = 7
        }
        break
      case 6:
        updates.current_stage = selectedStages[selectedStages.length - 1] || null
        break
      case 7:
        updates.next_court_date = nextCourtDate || null
        break
      case 8:
        updates.primary_concerns = primaryConcerns
        break
      case 9:
        updates.text_reminders_enabled = textRemindersEnabled
        updates.phone_number = textRemindersEnabled ? phoneNumber : null
        if (!textRemindersEnabled) {
          nextStep = 11
        }
        break
      case 10:
        updates.reminder_settings = reminderSettings
        nextStep = 11
        break
    }

    await saveProgress(nextStep, updates)

    if (nextStep === 11) {
      await updateProfile({ intake_completed: true })
      navigate('/dashboard')
    } else {
      setStep(nextStep)
    }
  }

  const handleBack = () => {
    let prevStep = step - 1

    if (step === 3 && role !== 'parent') {
      prevStep = 1
    } else if (step === 7 && courtHistory !== 'been_to_court') {
      prevStep = 5
    } else if (step === 11 && !textRemindersEnabled) {
      prevStep = 9
    }

    setStep(prevStep)
  }

  const isStepValid = () => {
    switch (step) {
      case 1:
        return firstName.trim().length > 0
      case 2:
        return role !== 'parent' || childrenStatus !== null
      case 3:
        if (lawyerStatus === null) return false
        if (lawyerStatus === 'yes') {
          return lawyerName.trim().length > 0 && lawyerPhone.trim().length > 0
        }
        return true
      case 4:
        if (caseManagerStatus === null) return false
        if (caseManagerStatus === 'yes') {
          return caseManagerName.trim().length > 0 && caseManagerPhone.trim().length > 0
        }
        return true
      case 5:
        return courtHistory !== null
      case 6:
        return selectedStages.length > 0
      case 7:
        return true
      case 8:
        return true
      case 9:
        if (!textRemindersEnabled) return true
        return phoneNumber.trim().length >= 10
      case 10:
        return true
      default:
        return false
    }
  }

  const totalSteps = 10
  const progress = (step / totalSteps) * 100

  const roleIcons = {
    parent: Users,
    youth: User,
    supporter: Heart,
  }

  const RoleIcon = roleIcons[role] || Users
  const roleLabels = {
    parent: 'Parent Setup',
    youth: 'Youth Setup',
    supporter: 'Supporter Setup',
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      <div className="max-w-2xl mx-auto px-6 py-8">
        <div className="mb-8">
          <div className="h-2 bg-gray-200 rounded-full mb-6">
            <div
              className="h-2 bg-purple-600 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-100 rounded-lg">
              <RoleIcon className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-purple-600 uppercase tracking-wide">
                {roleLabels[role]}
              </h2>
              <p className="text-xs text-gray-500">Step {step} of {totalSteps}</p>
            </div>
          </div>
        </div>

        {step === 1 && (
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">What should we call you?</h1>
            <p className="text-gray-600 mb-6">
              Just your first name is fine. Anchor will use this to personalize your experience and
              guide you through the dependency process.
            </p>

            <div className="mb-8">
              <label className="block mb-2 text-xs font-semibold tracking-wide uppercase text-gray-500">
                First Name
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Enter your first name"
                className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 focus:border-purple-600 focus:ring-4 focus:ring-purple-100 focus:outline-none"
                autoFocus
              />
            </div>
          </div>
        )}

        {step === 2 && role === 'parent' && (
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Are your children currently with you?
            </h1>
            <p className="text-gray-600 mb-6">
              This helps us understand where you are in the process.
            </p>

            <div className="space-y-3 mb-8">
              {[
                { id: 'at_home', label: 'My children are still with me at home' },
                { id: 'removed', label: 'My children have been removed from my home' },
                { id: 'with_family', label: 'My children are staying with family/friends temporarily' },
              ].map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setChildrenStatus(option.id as ChildrenStatus)}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                    childrenStatus === option.id
                      ? 'border-purple-600 bg-purple-50'
                      : 'border-gray-200 bg-white hover:border-purple-200'
                  }`}
                >
                  <div className="font-medium text-gray-900">{option.label}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Do you have a lawyer assigned to your case?
            </h1>
            <p className="text-gray-600 mb-6">
              Having legal representation is your right. We can help you understand what to expect.
            </p>

            <div className="space-y-3 mb-6">
              {[
                { id: 'yes', label: 'Yes, I have a lawyer', color: 'teal' },
                { id: 'no', label: 'No, I do not have a lawyer yet', color: 'gray' },
                { id: 'unsure', label: 'I am not sure / Need help getting one', color: 'purple' },
              ].map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setLawyerStatus(option.id as LawyerStatus)}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                    lawyerStatus === option.id
                      ? option.color === 'teal'
                        ? 'border-teal-600 bg-teal-50'
                        : 'border-purple-600 bg-purple-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="font-medium text-gray-900">{option.label}</div>
                </button>
              ))}
            </div>

            {lawyerStatus === 'yes' && (
              <div className="space-y-4 bg-gray-50 p-4 rounded-xl">
                <div>
                  <label className="block mb-2 text-xs font-semibold tracking-wide uppercase text-gray-500">
                    Lawyer's Name
                  </label>
                  <input
                    type="text"
                    value={lawyerName}
                    onChange={(e) => setLawyerName(e.target.value)}
                    placeholder="Enter lawyer's name"
                    className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 focus:border-purple-600 focus:ring-4 focus:ring-purple-100 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block mb-2 text-xs font-semibold tracking-wide uppercase text-gray-500">
                    Lawyer's Phone Number
                  </label>
                  <input
                    type="tel"
                    value={lawyerPhone}
                    onChange={(e) => setLawyerPhone(e.target.value)}
                    placeholder="(555) 123-4567"
                    className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 focus:border-purple-600 focus:ring-4 focus:ring-purple-100 focus:outline-none"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {step === 4 && (
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Do you have a case manager or social worker?
            </h1>
            <p className="text-gray-600 mb-6">
              This person helps coordinate services and visits. Their contact info is important to have.
            </p>

            <div className="space-y-3 mb-6">
              {[
                { id: 'yes', label: 'Yes, I have a case manager/social worker', color: 'teal' },
                { id: 'no', label: 'No, not yet', color: 'gray' },
                { id: 'unsure', label: 'I am not sure', color: 'purple' },
              ].map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setCaseManagerStatus(option.id as CaseManagerStatus)}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                    caseManagerStatus === option.id
                      ? option.color === 'teal'
                        ? 'border-teal-600 bg-teal-50'
                        : 'border-purple-600 bg-purple-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="font-medium text-gray-900">{option.label}</div>
                </button>
              ))}
            </div>

            {caseManagerStatus === 'yes' && (
              <div className="space-y-4 bg-gray-50 p-4 rounded-xl">
                <div>
                  <label className="block mb-2 text-xs font-semibold tracking-wide uppercase text-gray-500">
                    Case Manager's Name
                  </label>
                  <input
                    type="text"
                    value={caseManagerName}
                    onChange={(e) => setCaseManagerName(e.target.value)}
                    placeholder="Enter case manager's name"
                    className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 focus:border-purple-600 focus:ring-4 focus:ring-purple-100 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block mb-2 text-xs font-semibold tracking-wide uppercase text-gray-500">
                    Case Manager's Phone Number
                  </label>
                  <input
                    type="tel"
                    value={caseManagerPhone}
                    onChange={(e) => setCaseManagerPhone(e.target.value)}
                    placeholder="(555) 123-4567"
                    className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 focus:border-purple-600 focus:ring-4 focus:ring-purple-100 focus:outline-none"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {step === 5 && (
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Have you been to any court hearings yet?
            </h1>
            <p className="text-gray-600 mb-6">
              We will help you figure out where you are in the process step by step.
            </p>

            <div className="space-y-3 mb-8">
              {[
                { id: 'not_yet', label: 'No, I have not been to court yet' },
                { id: 'been_to_court', label: 'Yes, I have been to one or more court hearings' },
                { id: 'scheduled', label: 'I have my first court date scheduled but have not gone yet' },
              ].map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setCourtHistory(option.id as CourtHistory)}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                    courtHistory === option.id
                      ? 'border-purple-600 bg-purple-50'
                      : 'border-gray-200 bg-white hover:border-purple-200'
                  }`}
                >
                  <div className="font-medium text-gray-900">{option.label}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 6 && (
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Let us figure out which step you are at
            </h1>
            <p className="text-gray-600 mb-2">
              Answer a few questions about what has happened so far.
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Check the box next to the statement that best describes what has happened:
            </p>

            <div className="space-y-3 mb-8">
              {[
                {
                  id: 'detention',
                  label: 'I went to my first court hearing (within a few days of removal)',
                  description: 'Detention Hearing',
                },
                {
                  id: 'jurisdiction',
                  label: 'The court decided if the case should stay open',
                  description: 'Jurisdiction Hearing',
                },
                {
                  id: 'disposition',
                  label: 'I got my case plan with things I need to complete',
                  description: 'Disposition Hearing',
                },
                {
                  id: 'review',
                  label: 'I am working on my case plan and going to regular review hearings',
                  description: 'Review Hearings',
                },
                {
                  id: 'permanency',
                  label: 'The court is deciding on a permanent plan for my children',
                  description: 'Permanency Hearing',
                },
              ].map((stage) => {
                const isSelected = selectedStages.includes(stage.id as Stage)
                return (
                  <button
                    key={stage.id}
                    type="button"
                    onClick={() => {
                      const stageId = stage.id as Stage
                      setSelectedStages(
                        isSelected
                          ? selectedStages.filter((s) => s !== stageId)
                          : [...selectedStages, stageId]
                      )
                    }}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                      isSelected
                        ? 'border-purple-600 bg-purple-50'
                        : 'border-gray-200 bg-white hover:border-purple-200'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                          isSelected
                            ? 'border-purple-600 bg-purple-600'
                            : 'border-gray-300'
                        }`}
                      >
                        {isSelected && (
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 mb-1">{stage.label}</div>
                        <div className="text-sm text-gray-500">{stage.description}</div>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {step === 7 && (
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Do you have an upcoming court date?
            </h1>
            <p className="text-gray-600 mb-6">
              If you know when your next court date is, we can help you prepare.
            </p>

            <div className="mb-8">
              <label className="block mb-2 text-xs font-semibold tracking-wide uppercase text-gray-500">
                Next Court Date (if known)
              </label>
              <input
                type="date"
                value={nextCourtDate}
                onChange={(e) => setNextCourtDate(e.target.value)}
                className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 focus:border-purple-600 focus:ring-4 focus:ring-purple-100 focus:outline-none"
              />
              <p className="mt-2 text-sm text-gray-500">
                Leave blank if you don't know or don't have one scheduled yet.
              </p>
            </div>
          </div>
        )}

        {step === 8 && (
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              What are you most worried about right now?
            </h1>
            <p className="text-gray-600 mb-6">
              This helps us prioritize the most important information for you. (Optional)
            </p>

            <div className="mb-8">
              <textarea
                value={primaryConcerns}
                onChange={(e) => setPrimaryConcerns(e.target.value)}
                placeholder="Share what's on your mind – like upcoming hearings, visits, services, or anything else you're concerned about..."
                className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 focus:border-purple-600 focus:ring-4 focus:ring-purple-100 focus:outline-none min-h-32 resize-none"
              />
            </div>
          </div>
        )}

        {step === 9 && (
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Stay Connected</h1>
            <p className="text-gray-600 mb-6">
              Get helpful text reminders for important dates and deadlines.
            </p>

            <button
              type="button"
              onClick={() => setTextRemindersEnabled(!textRemindersEnabled)}
              className={`w-full text-left p-5 rounded-xl border-2 transition-all mb-6 ${
                textRemindersEnabled
                  ? 'border-purple-600 bg-purple-50'
                  : 'border-gray-200 bg-white hover:border-purple-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Bell className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 mb-1">
                      Text Message Reminders
                    </div>
                    <div className="text-sm text-gray-600">
                      Receive helpful text reminders for court dates, appointments, and important deadlines
                    </div>
                  </div>
                </div>
                <div
                  className={`w-12 h-6 rounded-full transition-all ${
                    textRemindersEnabled ? 'bg-purple-600' : 'bg-gray-300'
                  }`}
                >
                  <div
                    className={`w-5 h-5 bg-white rounded-full transition-all m-0.5 ${
                      textRemindersEnabled ? 'translate-x-6' : ''
                    }`}
                  />
                </div>
              </div>
            </button>

            {textRemindersEnabled && (
              <div className="mb-6">
                <label className="block mb-2 text-xs font-semibold tracking-wide uppercase text-gray-500">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="(555) 123-4567"
                  className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 focus:border-purple-600 focus:ring-4 focus:ring-purple-100 focus:outline-none"
                />
              </div>
            )}

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <div className="flex gap-3">
                <Lock className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="space-y-2 text-sm text-amber-900">
                  <p className="font-semibold">Privacy & Security</p>
                  <ul className="space-y-1 text-xs">
                    <li>Your phone number is encrypted and never shared with third parties</li>
                    <li>You can turn off notifications or change your number anytime</li>
                    <li>Text 'STOP' to any message to unsubscribe immediately</li>
                    <li>Messages contain only appointment times, not personal details</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 10 && (
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Reminder Settings</h1>
            <p className="text-gray-600 mb-6">
              Choose when you'd like to receive reminders for different types of events
            </p>

            <div className="space-y-4 mb-6">
              {[
                {
                  key: 'courtHearings',
                  icon: Gavel,
                  label: 'Court Hearings',
                  description: 'Get reminded about upcoming court dates',
                },
                {
                  key: 'appointments',
                  icon: Calendar,
                  label: 'Appointments',
                  description: 'Reminders for social worker meetings and other appointments',
                },
                {
                  key: 'tasks',
                  icon: Clipboard,
                  label: 'Tasks & Classes',
                  description: 'Reminders for parenting classes and other required tasks',
                },
                {
                  key: 'visits',
                  icon: Heart,
                  label: 'Child Visits',
                  description: 'Reminders for scheduled visits with your children',
                },
              ].map((category) => {
                const Icon = category.icon
                const setting = reminderSettings[category.key as keyof ReminderSettings]
                return (
                  <div key={category.key} className="border-2 border-gray-200 rounded-xl p-4">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        <Icon className="w-5 h-5 text-gray-600" />
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900">{category.label}</div>
                        <div className="text-sm text-gray-600">{category.description}</div>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setReminderSettings({
                            ...reminderSettings,
                            [category.key]: { ...setting, enabled: !setting.enabled },
                          })
                        }
                        className={`w-12 h-6 rounded-full transition-all flex-shrink-0 ${
                          setting.enabled ? 'bg-purple-600' : 'bg-gray-300'
                        }`}
                      >
                        <div
                          className={`w-5 h-5 bg-white rounded-full transition-all m-0.5 ${
                            setting.enabled ? 'translate-x-6' : ''
                          }`}
                        />
                      </button>
                    </div>

                    {setting.enabled && (
                      <div className="flex gap-2 flex-wrap">
                        {['2_hours', '1_day', '3_days', '1_week'].map((timing) => {
                          const labels: Record<string, string> = {
                            '2_hours': '2 hours before',
                            '1_day': '1 day before',
                            '3_days': '3 days before',
                            '1_week': '1 week before',
                          }
                          return (
                            <button
                              key={timing}
                              type="button"
                              onClick={() =>
                                setReminderSettings({
                                  ...reminderSettings,
                                  [category.key]: { ...setting, timing },
                                })
                              }
                              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                                setting.timing === timing
                                  ? 'bg-purple-600 text-white'
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }`}
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

            <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
              <p className="text-xs font-semibold text-purple-900 mb-2">Sample Messages:</p>
              <div className="space-y-2 text-xs text-purple-800">
                <p className="bg-white p-2 rounded">
                  "Tomorrow 9:00 AM: Court hearing scheduled. Remember to bring required documents. Good luck!"
                </p>
                <p className="bg-white p-2 rounded">
                  "Today 2:00 PM: Visit with children at Family Center. Arrive 15 minutes early."
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 space-y-4">
          <div className="flex gap-3">
            {step > 1 && (
              <Button
                onClick={handleBack}
                variant="secondary"
                className="flex items-center gap-2"
                disabled={saving}
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </Button>
            )}
            <Button
              onClick={handleNext}
              disabled={!isStepValid() || saving}
              className="flex-1"
            >
              {saving ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Saving...</span>
                </div>
              ) : step === 10 ? (
                'Get Started'
              ) : (
                'Next'
              )}
            </Button>
          </div>

          <PrivacyNotice />
        </div>
      </div>
    </div>
  )
}
