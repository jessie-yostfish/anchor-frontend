import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Lock,
  FileText,
  Users,
  CheckCircle,
  Sparkles,
  Copy,
  Save,
  Printer,
  Check,
  AlertCircle,
  Loader2,
} from 'lucide-react'
import { Card, BottomNav, MarkdownDisplay, AppHeader } from '../components'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

type PrepType = 'hearing' | 'meeting' | 'after_hearing' | null

interface PrepOption {
  type: PrepType
  icon: typeof FileText
  iconColor: string
  iconBg: string
  title: string
  description: string
}

const PREP_OPTIONS: PrepOption[] = [
  {
    type: 'hearing',
    icon: FileText,
    iconColor: 'text-purple-600',
    iconBg: 'bg-purple-100',
    title: 'Before a Hearing',
    description: 'Prepare what you want to say to the judge and organize your questions.',
  },
  {
    type: 'meeting',
    icon: Users,
    iconColor: 'text-blue-600',
    iconBg: 'bg-blue-100',
    title: 'Before a Meeting',
    description: 'Prepare for calls or meetings with your attorney or social worker.',
  },
  {
    type: 'after_hearing',
    icon: CheckCircle,
    iconColor: 'text-coral-600',
    iconBg: 'bg-coral-100',
    title: 'After a Hearing',
    description: 'Summarize what happened and identify your next best actions.',
  },
]

type MeetingType = 'attorney' | 'social_worker' | 'casa' | 'therapist' | 'other' | null

const MEETING_TYPES = [
  { value: 'attorney', label: 'Attorney / Lawyer' },
  { value: 'social_worker', label: 'Social Worker / Caseworker' },
  { value: 'casa', label: 'CASA Volunteer' },
  { value: 'therapist', label: 'Therapist / Counselor' },
  { value: 'other', label: 'Other' },
]

export function Preparation() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [selectedType, setSelectedType] = useState<PrepType>(null)
  const [meetingType, setMeetingType] = useState<MeetingType>(null)
  const [concerns, setConcerns] = useState('')
  const [guide, setGuide] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copiedToClipboard, setCopiedToClipboard] = useState(false)
  const [savedAsNote, setSavedAsNote] = useState(false)
  const [currentStage, setCurrentStage] = useState<string | null>(null)

  useEffect(() => {
    const fetchCurrentStage = async () => {
      if (!user) return

      try {
        const { data } = await supabase
          .from('profiles')
          .select('current_stage')
          .eq('id', user.id)
          .maybeSingle()

        if (data?.current_stage) {
          setCurrentStage(data.current_stage)
        }
      } catch (error) {
        console.error('Error fetching current stage:', error)
      }
    }

    fetchCurrentStage()
  }, [user])

  const getMeetingTypeLabel = (type: MeetingType): string => {
    const meetingTypeObj = MEETING_TYPES.find((mt) => mt.value === type)
    return meetingTypeObj?.label || 'professional'
  }

  const getContextFromPrepType = (prepType: PrepType, meetingTypeValue?: MeetingType): string => {
    switch (prepType) {
      case 'hearing':
        return 'preparing for a court hearing in California dependency court'
      case 'meeting':
        if (meetingTypeValue) {
          return `preparing for a meeting with ${getMeetingTypeLabel(meetingTypeValue)} in California dependency court`
        }
        return 'preparing for a meeting with caseworker, attorney, CASA, or social worker in California dependency court'
      case 'after_hearing':
        return 'reflecting after a court hearing in California dependency court'
      default:
        return 'general preparation'
    }
  }

  const handleGetGuide = async () => {
    if (!selectedType || !concerns.trim()) return
    if (selectedType === 'meeting' && !meetingType) return

    setLoading(true)
    setError(null)

    try {
      let promptText = concerns
      if (selectedType === 'meeting' && meetingType) {
        promptText = `${concerns} I am preparing for a meeting with my ${getMeetingTypeLabel(meetingType)}.`
      }

      const response = await fetch('https://anchor-ap1c.onrender.com/prepare', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: promptText,
          role: 'parent',
          context: getContextFromPrepType(selectedType, meetingType),
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate guidance')
      }

      const data = await response.json()
      const generatedContent = data.response

      if (!generatedContent) {
        throw new Error('No response received from API')
      }

      setGuide(generatedContent)

      if (user) {
        await supabase.from('preparation_notes').insert({
          user_id: user.id,
          prep_type: selectedType,
          concerns: concerns,
          generated_guide: { content: generatedContent },
          exported: false,
        })
      }
    } catch (error) {
      console.error('Error generating guide:', error)
      setError('We couldn\'t generate your guide right now. Please try again in a moment.')
    } finally {
      setLoading(false)
    }
  }

  const handleCopyToClipboard = async () => {
    if (!guide) return

    const selectedOption = PREP_OPTIONS.find((opt) => opt.type === selectedType)
    let text = `${selectedOption?.title || 'Preparation Guide'}\n\n`
    if (selectedType === 'meeting' && meetingType) {
      text += `Meeting with: ${getMeetingTypeLabel(meetingType)}\n`
    }
    text += `Your Concerns: ${concerns}\n\n`
    text += `${guide}\n\n`
    text += `---\nThis guidance is generated by AI based on general dependency court information. Always consult your attorney for advice specific to your case.`

    try {
      await navigator.clipboard.writeText(text)
      setCopiedToClipboard(true)
      setTimeout(() => setCopiedToClipboard(false), 2000)
    } catch (error) {
      console.error('Error copying to clipboard:', error)
    }
  }

  const handleSaveAsNote = async () => {
    if (!guide || !user) return

    const selectedOption = PREP_OPTIONS.find((opt) => opt.type === selectedType)
    let title = `${selectedOption?.title}`
    if (selectedType === 'meeting' && meetingType) {
      title += ` - ${getMeetingTypeLabel(meetingType)}`
    }
    title += ` - ${new Date().toLocaleDateString()}`

    let content = ''
    if (selectedType === 'meeting' && meetingType) {
      content += `Meeting with: ${getMeetingTypeLabel(meetingType)}\n`
    }
    content += `Concerns: ${concerns}\n\n${guide}`

    try {
      await supabase.from('notes').insert({
        user_id: user.id,
        title: title,
        content: content,
        category: 'Other',
      })

      setSavedAsNote(true)
      setTimeout(() => setSavedAsNote(false), 2000)
    } catch (error) {
      console.error('Error saving note:', error)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const handleChangeType = () => {
    setSelectedType(null)
    setMeetingType(null)
    setConcerns('')
    setGuide(null)
  }

  const selectedOption = PREP_OPTIONS.find((opt) => opt.type === selectedType)

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader />

      <div className="bg-gradient-to-r from-amber-100 to-amber-50 border-b border-amber-200 px-6 py-3">
        <div className="max-w-md mx-auto flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-amber-900 font-medium">
            General info, not legal advice. Talk to your lawyer for your specific case.
          </p>
        </div>
      </div>

      <div className="max-w-md mx-auto px-6 py-8 pb-24">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Preparation & Reflection</h1>
          <p className="text-gray-600">Your "second brain" for organizing thoughts and self-advocating.</p>
        </div>

        <Card className="mb-6 bg-purple-50 border-purple-200">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                <Lock className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Private & Safe</h3>
              <p className="text-sm text-gray-700 mb-2">
                Anchor aims to help you understand what's happening. These are educational suggestions, not legal
                advice.
              </p>
              <p className="text-sm font-semibold text-coral-600">
                None of your notes are shared with CPS or the court.
              </p>
            </div>
          </div>
        </Card>

        {!selectedType ? (
          <>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Choose a starting point</h2>
            <div className="space-y-3">
              {PREP_OPTIONS.map((option) => {
                const IconComponent = option.icon
                return (
                  <Card
                    key={option.type}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => setSelectedType(option.type)}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`flex-shrink-0 w-12 h-12 ${option.iconBg} rounded-lg flex items-center justify-center`}>
                        <IconComponent className={`w-6 h-6 ${option.iconColor}`} />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900 mb-1">{option.title}</h3>
                        <p className="text-sm text-gray-600">{option.description}</p>
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          </>
        ) : !guide ? (
          <Card>
            <div className="flex items-center justify-between mb-4">
              <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold">
                {selectedOption?.title}
              </span>
              <button onClick={handleChangeType} className="text-sm text-purple-600 hover:text-purple-700 font-medium">
                Change
              </button>
            </div>

            {selectedType === 'meeting' && (
              <>
                <h3 className="text-lg font-bold text-gray-900 mb-3 uppercase">Who is this meeting with?</h3>
                <div className="grid grid-cols-1 gap-2 mb-6">
                  {MEETING_TYPES.map((type) => (
                    <button
                      key={type.value}
                      onClick={() => setMeetingType(type.value as MeetingType)}
                      className={`px-4 py-3 rounded-lg border-2 text-left font-medium transition-all ${
                        meetingType === type.value
                          ? 'border-blue-600 bg-blue-50 text-blue-900'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-blue-300'
                      }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </>
            )}

            <h3 className="text-lg font-bold text-gray-900 mb-3 uppercase">
              {selectedType === 'meeting' ? 'What do you want to discuss?' : 'Any specific concerns today?'}
            </h3>

            <textarea
              value={concerns}
              onChange={(e) => setConcerns(e.target.value)}
              placeholder={
                selectedType === 'meeting'
                  ? "E.g., 'I need to understand my case plan better' or 'I want to discuss visitation schedule'"
                  : "E.g., 'I want to talk about my visits' or 'I don't understand the new plan'"
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              rows={5}
            />

            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <button
              onClick={handleGetGuide}
              disabled={!concerns.trim() || loading || (selectedType === 'meeting' && !meetingType)}
              className="mt-4 w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-coral-600 text-white rounded-lg hover:bg-coral-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {selectedType === 'meeting' ? 'Preparing your meeting guide...' : 'Preparing your personalized guide...'}
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Get Preparation Tips
                </>
              )}
            </button>

            {loading && (
              <p className="mt-3 text-sm text-gray-600 text-center">
                This may take 10-30 seconds while Claude generates personalized advice for you.
              </p>
            )}
          </Card>
        ) : (
          <div className="space-y-4">
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                  {selectedType === 'meeting' ? 'Your Meeting Guide' : 'Your Guide'}
                </h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyToClipboard}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Copy to clipboard"
                  >
                    {copiedToClipboard ? (
                      <Check className="w-5 h-5 text-green-600" />
                    ) : (
                      <Copy className="w-5 h-5" />
                    )}
                  </button>
                  <button
                    onClick={handleSaveAsNote}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Save as note"
                  >
                    {savedAsNote ? <Check className="w-5 h-5 text-green-600" /> : <Save className="w-5 h-5" />}
                  </button>
                  <button
                    onClick={handlePrint}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Print"
                  >
                    <Printer className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="mb-4 p-3 bg-purple-50 rounded-lg">
                {selectedType === 'meeting' && meetingType && (
                  <p className="text-sm text-gray-700 mb-2">
                    <span className="font-semibold">Meeting with:</span> {getMeetingTypeLabel(meetingType)}
                  </p>
                )}
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">Your concerns:</span> {concerns}
                </p>
              </div>

              <div className="mb-6">
                <MarkdownDisplay content={guide} />
              </div>

              <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-amber-900">
                    <span className="font-semibold">Disclaimer:</span> This guidance is generated by AI based on
                    general dependency court information. Always consult your attorney for advice specific to your
                    case.
                  </p>
                </div>
              </div>

              <button
                onClick={handleChangeType}
                className="w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-semibold"
              >
                Start New Preparation
              </button>
            </Card>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  )
}
