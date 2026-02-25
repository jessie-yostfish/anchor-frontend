import { useState, useEffect, useRef } from 'react'
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
  Send,
  X,
} from 'lucide-react'
import { Card, BottomNav, MarkdownDisplay, AppHeader } from '../components'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { trackEvent } from '../lib/analytics'

type PrepType = 'hearing' | 'meeting' | 'after_hearing' | null
type Role = 'parent' | 'youth' | 'supporter'

interface PrepOption {
  type: PrepType
  icon: typeof FileText
  iconColor: string
  iconBg: string
  title: string
  description: string
  roles?: Role[]
}

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

interface SaveModalState {
  isOpen: boolean
  date: string
  title: string
}

type MeetingType = 'attorney' | 'social_worker' | 'casa' | 'therapist' | 'other' | null

const MEETING_TYPES_BY_ROLE = {
  parent: [
    { value: 'attorney', label: 'Attorney / Lawyer' },
    { value: 'social_worker', label: 'Social Worker / Caseworker' },
    { value: 'therapist', label: 'Therapist / Counselor' },
    { value: 'other', label: 'Other' },
  ],
  youth: [
    { value: 'attorney', label: 'My Lawyer' },
    { value: 'social_worker', label: 'Social Worker' },
    { value: 'casa', label: 'CASA Volunteer' },
    { value: 'therapist', label: 'Therapist / Counselor' },
    { value: 'other', label: 'Other' },
  ],
  supporter: [
    { value: 'attorney', label: 'Attorney (if consulting)' },
    { value: 'social_worker', label: 'Social Worker' },
    { value: 'other', label: 'Other Professional' },
  ],
}

const PREP_OPTIONS_BY_ROLE = {
  parent: [
    {
      type: 'hearing' as PrepType,
      icon: FileText,
      iconColor: 'text-purple-600',
      iconBg: 'bg-purple-100',
      title: 'Before a Hearing',
      description: 'Prepare what you want to say to the judge and organize your questions.',
    },
    {
      type: 'meeting' as PrepType,
      icon: Users,
      iconColor: 'text-blue-600',
      iconBg: 'bg-blue-100',
      title: 'Before a Meeting',
      description: 'Prepare for calls or meetings with your attorney or social worker.',
    },
    {
      type: 'after_hearing' as PrepType,
      icon: CheckCircle,
      iconColor: 'text-coral-600',
      iconBg: 'bg-coral-100',
      title: 'After a Hearing',
      description: 'Summarize what happened and identify your next best actions.',
    },
  ],
  youth: [
    {
      type: 'hearing' as PrepType,
      icon: FileText,
      iconColor: 'text-purple-600',
      iconBg: 'bg-purple-100',
      title: 'Before Court',
      description: 'Prepare what you want to tell the judge and organize your thoughts.',
    },
    {
      type: 'meeting' as PrepType,
      icon: Users,
      iconColor: 'text-blue-600',
      iconBg: 'bg-blue-100',
      title: 'Before a Meeting',
      description: 'Get ready for meetings with your lawyer, social worker, or CASA.',
    },
    {
      type: 'after_hearing' as PrepType,
      icon: CheckCircle,
      iconColor: 'text-coral-600',
      iconBg: 'bg-coral-100',
      title: 'After Court',
      description: 'Think about what happened and what comes next.',
    },
  ],
  supporter: [
    {
      type: 'hearing' as PrepType,
      icon: FileText,
      iconColor: 'text-purple-600',
      iconBg: 'bg-purple-100',
      title: 'Before a Hearing',
      description: 'Prepare to support someone attending a court hearing.',
    },
    {
      type: 'meeting' as PrepType,
      icon: Users,
      iconColor: 'text-blue-600',
      iconBg: 'bg-blue-100',
      title: 'Before a Meeting',
      description: 'Get ready to support someone in meetings with professionals.',
    },
    {
      type: 'after_hearing' as PrepType,
      icon: CheckCircle,
      iconColor: 'text-coral-600',
      iconBg: 'bg-coral-100',
      title: 'After a Hearing',
      description: 'Help process what happened and plan next steps.',
    },
  ],
}

const PLACEHOLDERS_BY_ROLE = {
  parent: {
    hearing: "E.g., 'I want to talk about my visits' or 'I don't understand the new plan'",
    meeting: "E.g., 'I need to understand my case plan better' or 'I want to discuss visitation schedule'",
    after_hearing: "E.g., 'The judge said I need to complete parenting classes. What does that mean?'",
  },
  youth: {
    hearing: "E.g., 'I want to stay with my current foster family' or 'I miss my siblings'",
    meeting: "E.g., 'I want to talk about school' or 'I need help with my placement'",
    after_hearing: "E.g., 'The judge talked about adoption. What happens now?'",
  },
  supporter: {
    hearing: "E.g., 'How can I help them prepare?' or 'What should I know about this hearing?'",
    meeting: "E.g., 'How can I best support them in this meeting?'",
    after_hearing: "E.g., 'How can I help them process what happened?'",
  },
}

export function Preparation() {
  const navigate = useNavigate()
  const { user, profile } = useAuth()
  const [selectedType, setSelectedType] = useState<PrepType>(null)
  const [meetingType, setMeetingType] = useState<MeetingType>(null)
  const [concerns, setConcerns] = useState('')
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([])
  const [currentMessage, setCurrentMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentStage, setCurrentStage] = useState<string | null>(null)
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [saveModalState, setSaveModalState] = useState<SaveModalState>({
    isOpen: false,
    date: new Date().toISOString().split('T')[0],
    title: '',
  })
  const chatEndRef = useRef<HTMLDivElement>(null)

  const userRole: Role = (profile?.role as Role) || 'parent'
  const prepOptions = PREP_OPTIONS_BY_ROLE[userRole]
  const meetingTypes = MEETING_TYPES_BY_ROLE[userRole]
  const placeholders = PLACEHOLDERS_BY_ROLE[userRole]

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

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatHistory])

  const getMeetingTypeLabel = (type: MeetingType): string => {
    const meetingTypeObj = meetingTypes.find((mt) => mt.value === type)
    return meetingTypeObj?.label || 'professional'
  }

  const getAuthHeaders = async () => {
    const { data } = await supabase.auth.getSession()
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${data.session?.access_token}`,
    }
  }

  const handleGetInitialGuide = async () => {
    if (!selectedType || !concerns.trim()) return
    if (selectedType === 'meeting' && !meetingType) return

    setLoading(true)
    setError(null)

    try {
      let promptText = concerns
      if (selectedType === 'meeting' && meetingType) {
        promptText = `${concerns} I am preparing for a meeting with my ${getMeetingTypeLabel(meetingType)}.`
      }

      const headers = await getAuthHeaders()

      const response = await fetch('https://dmrmgpidvfcywilcsmff.supabase.co/functions/v1/generate-preparation-guide', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          prepType: selectedType,
          concerns: promptText,
          currentStage: currentStage,
          userRole: userRole,
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

      setChatHistory([
        { role: 'user', content: concerns },
        { role: 'assistant', content: generatedContent },
      ])
      trackEvent('preparation_started', { role: userRole, prep_type: selectedType || undefined })

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
      setError('We could not generate your guide right now. Please try again in a moment.')
    } finally {
      setLoading(false)
    }
  }

  const handleSendFollowUp = async () => {
    if (!currentMessage.trim() || !selectedType) return

    setLoading(true)
    setError(null)

    try {
      const newUserMessage: ChatMessage = { role: 'user', content: currentMessage }
      const updatedHistory = [...chatHistory, newUserMessage]
      setChatHistory(updatedHistory)
      setCurrentMessage('')

      const headers = await getAuthHeaders()

      const response = await fetch('https://dmrmgpidvfcywilcsmff.supabase.co/functions/v1/generate-preparation-guide', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          prepType: selectedType,
          concerns: concerns,
          currentStage: currentStage,
          userRole: userRole,
          messages: updatedHistory,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate response')
      }

      const data = await response.json()
      const generatedResponse = data.response

      if (!generatedResponse) {
        throw new Error('No response received from API')
      }

      setChatHistory((prev) => [...prev, { role: 'assistant', content: generatedResponse }])
    } catch (error) {
      console.error('Error generating response:', error)
      setError('We could not generate a response. Please try again in a moment.')
      setChatHistory((prev) => prev.slice(0, -1))
    } finally {
      setLoading(false)
    }
  }

  const handleSaveChatClick = () => {
    const selectedOption = prepOptions.find((opt) => opt.type === selectedType)
    let defaultTitle = `${selectedOption?.title}`
    if (selectedType === 'meeting' && meetingType) {
      defaultTitle += ` - ${getMeetingTypeLabel(meetingType)}`
    }

    setSaveModalState({
      isOpen: true,
      date: new Date().toISOString().split('T')[0],
      title: defaultTitle,
    })
    setShowSaveModal(true)
  }

  const handleSaveChat = async () => {
    if (!user || !saveModalState.title.trim()) return

    try {
      const chatContent = chatHistory
        .map((msg) => {
          const role = msg.role === 'user' ? 'You' : 'Preparation Guide'
          return `${role}:\n${msg.content}`
        })
        .join('\n\n---\n\n')

      const fullContent = `Date: ${saveModalState.date}\n\nYour Concerns: ${concerns}\n\n${chatContent}`

      await supabase.from('notes').insert({
        user_id: user.id,
        title: saveModalState.title,
        content: fullContent,
        category: 'Other',
      })

      setShowSaveModal(false)
      setSaveModalState({ isOpen: false, date: '', title: '' })

      trackEvent('preparation_completed', { role: userRole, prep_type: selectedType || undefined })
      alert('Chat saved as note!')
    } catch (error) {
      console.error('Error saving chat:', error)
      setError('Failed to save chat. Please try again.')
    }
  }

  const handleChangeType = () => {
    setSelectedType(null)
    setMeetingType(null)
    setConcerns('')
    setChatHistory([])
    setCurrentMessage('')
    setShowSaveModal(false)
  }

  const handlePrint = () => {
    window.print()
  }

  const selectedOption = prepOptions.find((opt) => opt.type === selectedType)
  const hasChat = chatHistory.length > 0

  const getPrivacyMessage = () => {
    if (userRole === 'youth') {
      return 'None of your notes are shared with anyone - not your parents, social worker, or the court.'
    }
    return 'None of your notes are shared with CPS or the court.'
  }

  const getQuestionLabel = () => {
    if (userRole === 'youth') {
      return selectedType === 'meeting' ? 'What do you want to talk about?' : 'What is on your mind?'
    }
    if (userRole === 'supporter') {
      return selectedType === 'meeting' ? 'What do they need help with?' : 'What are your concerns?'
    }
    return selectedType === 'meeting' ? 'What do you want to discuss?' : 'Any specific concerns today?'
  }

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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {userRole === 'youth' ? 'Preparation and Reflection' : 'Preparation & Reflection'}
          </h1>
          <p className="text-gray-600">
            {userRole === 'youth'
              ? 'Your safe space for organizing thoughts and preparing for what is next.'
              : userRole === 'supporter'
              ? 'Help organize thoughts and prepare for supporting someone through their case.'
              : 'Your "second brain" for organizing thoughts and self-advocating.'}
          </p>
        </div>

        <Card className="mb-6 bg-purple-50 border-purple-200">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                <Lock className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Private and Safe</h3>
              <p className="text-sm text-gray-700 mb-2">
                {userRole === 'youth'
                  ? 'Anchor helps you understand what is happening. These are educational suggestions, not legal advice.'
                  : 'Anchor aims to help you understand what is happening. These are educational suggestions, not legal advice.'}
              </p>
              <p className="text-sm font-semibold text-coral-600">
                {getPrivacyMessage()}
              </p>
            </div>
          </div>
        </Card>

        {!selectedType ? (
          <>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Choose a starting point</h2>
            <div className="space-y-3">
              {prepOptions.map((option) => {
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
        ) : !hasChat ? (
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
                <h3 className="text-lg font-bold text-gray-900 mb-3 uppercase">
                  Who is this meeting with?
                </h3>
                <div className="grid grid-cols-1 gap-2 mb-6">
                  {meetingTypes.map((type) => (
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
              {getQuestionLabel()}
            </h3>

            <textarea
              value={concerns}
              onChange={(e) => setConcerns(e.target.value)}
              placeholder={placeholders[selectedType as keyof typeof placeholders]}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              rows={5}
            />

            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <button
              onClick={handleGetInitialGuide}
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
                  <span className="font-semibold">
                    {userRole === 'youth' ? 'What is on your mind:' : 'Your concerns:'}
                  </span> {concerns}
                </p>
              </div>

              <div className="mb-6 max-h-96 overflow-y-auto bg-white border border-gray-200 rounded-lg p-4 space-y-4">
                {chatHistory.map((message, index) => (
                  <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-xs px-4 py-2 rounded-lg ${
                        message.role === 'user'
                          ? 'bg-coral-600 text-white rounded-br-none'
                          : 'bg-gray-100 text-gray-900 rounded-bl-none'
                      }`}
                    >
                      {message.role === 'user' ? (
                        <p className="text-sm">{message.content}</p>
                      ) : (
                        <div className="text-sm">
                          <MarkdownDisplay content={message.content} />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 text-gray-900 rounded-lg rounded-bl-none px-4 py-2">
                      <Loader2 className="w-5 h-5 animate-spin text-purple-600" />
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900 mb-3">Continue the conversation</h3>
                <div className="flex gap-2">
                  <textarea
                    value={currentMessage}
                    onChange={(e) => setCurrentMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey && currentMessage.trim()) {
                        e.preventDefault()
                        handleSendFollowUp()
                      }
                    }}
                    placeholder={
                      userRole === 'youth'
                        ? 'Ask another question or share more thoughts...'
                        : 'Ask a follow-up question or share more concerns...'
                    }
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                    rows={3}
                    disabled={loading}
                  />
                  <button
                    onClick={handleSendFollowUp}
                    disabled={!currentMessage.trim() || loading}
                    className="px-4 py-3 bg-coral-600 text-white rounded-lg hover:bg-coral-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

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

              <div className="space-y-2">
                <button
                  onClick={handleSaveChatClick}
                  className="w-full px-6 py-3 bg-coral-600 text-white rounded-lg hover:bg-coral-700 transition-colors font-semibold flex items-center justify-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  Save This Chat to Notes
                </button>
                <button
                  onClick={handleChangeType}
                  className="w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-semibold"
                >
                  Start New Preparation
                </button>
              </div>
            </Card>
          </div>
        )}
      </div>

      {showSaveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Save This Chat</h2>
              <button
                onClick={() => setShowSaveModal(false)}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Date</label>
                <input
                  type="date"
                  value={saveModalState.date}
                  onChange={(e) =>
                    setSaveModalState((prev) => ({
                      ...prev,
                      date: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Title</label>
                <input
                  type="text"
                  value={saveModalState.title}
                  onChange={(e) =>
                    setSaveModalState((prev) => ({
                      ...prev,
                      title: e.target.value,
                    }))
                  }
                  placeholder="E.g., 'Custody Concerns - Feb 16'"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="space-y-2">
                <button
                  onClick={handleSaveChat}
                  className="w-full px-6 py-3 bg-coral-600 text-white rounded-lg hover:bg-coral-700 transition-colors font-semibold flex items-center justify-center gap-2"
                >
                  <Check className="w-5 h-5" />
                  Save Chat
                </button>
                <button
                  onClick={() => setShowSaveModal(false)}
                  className="w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-semibold"
                >
                  Cancel
                </button>
              </div>
            </div>
          </Card>
        </div>
      )}

      <BottomNav />
    </div>
  )
}
