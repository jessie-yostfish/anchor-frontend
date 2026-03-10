import { trackEvent } from '../lib/analytics'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  LayoutGrid,
  List,
  Calendar,
  FileText,
  Star,
  CheckSquare,
  ChevronDown,
  ChevronUp,
  FolderOpen,
  Building,
  Gavel,
  ClipboardList,
  CalendarDays,
  CalendarCheck,
  Clock,
  Check,
  Shield,
  Home,
  CheckCircle,
} from 'lucide-react'
import { Card, Button, BottomNav, AppHeader } from '../components'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { haptics } from '../lib/haptics'

type Role = 'parent' | 'youth' | 'supporter'

interface StageContent {
  name: string
  whatHappens: string
  yourRights: string[]
}

const STAGE_CONTENT: Record<string, Record<Role, StageContent>> = {
  'case-opening': {
    parent: {
      name: 'Case Opening',
      whatHappens: 'A case has been opened with Child Protective Services about your child. This is the beginning of the dependency court process. You have rights at every step — starting right now.',
      yourRights: ['Right to an attorney at no cost', 'Right to read the petition', 'Right to know the allegations', 'Right to request your child be placed with family'],
    },
    youth: {
      name: 'Case Opening',
      whatHappens: 'A case has been opened and the court is now involved in decisions about where you live. You have your own rights in this process — separate from your parents. Your voice matters.',
      yourRights: ['Right to your own attorney', 'Right to know what is happening in your case', 'Right to be heard by the judge', 'Right to safe placement'],
    },
    supporter: {
      name: 'Case Opening',
      whatHappens: 'A dependency case has been opened for the family you are supporting. The court process is beginning. You may be able to help by being a placement option or a support person at hearings.',
      yourRights: ['Right to request placement of the child', 'Right to be notified of hearings if you are a caregiver', 'Right to provide information to the court'],
    },
  },
  detention: {
    parent: {
      name: 'Detention Hearing',
      whatHappens: 'The court decides if your child can return home or must stay in foster care while the case continues. This happens within 48–72 hours of removal. Tell the judge if family members can care for your child.',
      yourRights: ['Right to be present and speak', 'Right to an attorney', 'Right to suggest relatives for placement', 'Right to visits with your child'],
    },
    youth: {
      name: 'Detention Hearing',
      whatHappens: 'This is the first court hearing. The judge decides where you will live while the case is open. You can tell the judge where you want to live and who you want to be with.',
      yourRights: ['Right to be at the hearing', 'Right to your own attorney', 'Right to tell the judge your wishes', 'Right to contact with your parents (unless unsafe)'],
    },
    supporter: {
      name: 'Detention Hearing',
      whatHappens: 'The judge decides where the child will live during the case. If you want the child placed with you, this is the time to tell the court. Contact the social worker right away.',
      yourRights: ['Right to request placement', 'Right to speak to the social worker', 'Right to attend the hearing if you are a caregiver'],
    },
  },
  jurisdiction: {
    parent: {
      name: 'Jurisdiction Hearing',
      whatHappens: 'The court decides if the allegations against you are true. This is like a trial. You can present evidence, call witnesses, and tell your side. Your attorney will help you prepare.',
      yourRights: ['Right to a trial', 'Right to present evidence', 'Right to cross-examine witnesses', 'Right to testify on your own behalf'],
    },
    youth: {
      name: 'Jurisdiction Hearing',
      whatHappens: 'The judge decides if the things alleged in the case are true. You do not have to testify, but you can. Your attorney will explain your options and what to expect.',
      yourRights: ['Right to have an attorney present', 'Right to remain silent', 'Right to have your wishes heard', 'Right to attend the hearing'],
    },
    supporter: {
      name: 'Jurisdiction Hearing',
      whatHappens: "The court is deciding if the allegations in the case are proven. If you have information that could help, share it with the family's attorney. The outcome affects the case plan.",
      yourRights: ['Right to attend hearings as a caregiver', 'Right to submit a statement through the court', 'Right to request information about placement decisions'],
    },
  },
  disposition: {
    parent: {
      name: 'Disposition Hearing',
      whatHappens: 'The judge creates your case plan — a list of services and goals you must complete to get your child back. Enroll in services right away. The sooner you start, the better.',
      yourRights: ['Right to participate in creating your case plan', 'Right to request reasonable services', 'Right to regular visits with your child', 'Right to object to services you believe are unreasonable'],
    },
    youth: {
      name: 'Disposition Hearing',
      whatHappens: 'The judge decides where you will live and what services you will receive. You have the right to say what you want. Tell your attorney about your school, friends, and what matters to you.',
      yourRights: ['Right to be placed with siblings when possible', 'Right to stay in your school', 'Right to have your educational needs met', 'Right to participate in your case plan'],
    },
    supporter: {
      name: 'Disposition Hearing',
      whatHappens: "The judge sets up the case plan and decides on placement. If the child is living with you, you will learn what services and visitation will look like. You may be asked to support the parent's case plan.",
      yourRights: ['Right to be informed of the case plan if you are the caregiver', 'Right to visitation arrangements in writing', 'Right to request services for yourself as a caregiver'],
    },
  },
  '6_month_review': {
    parent: {
      name: '6-Month Review Hearing',
      whatHappens: 'The judge reviews your progress on your case plan. Bring every completion certificate, letter, and proof of attendance. This is your chance to show how hard you have been working.',
      yourRights: ['Right to present evidence of your progress', 'Right to request more visits', 'Right to request return of your child if progress is sufficient', 'Right to request additional services'],
    },
    youth: {
      name: '6-Month Review Hearing',
      whatHappens: 'The judge checks in on how things are going — your placement, school, and wellbeing. Tell your attorney and the court if something is not working. You deserve to be heard.',
      yourRights: ['Right to speak to the judge', 'Right to request a change in placement', 'Right to have your educational needs addressed', 'Right to request additional services'],
    },
    supporter: {
      name: '6-Month Review Hearing',
      whatHappens: "The judge reviews how the family is progressing. As a caregiver, you may be asked about the child's wellbeing. Keep notes about how the child is doing so you can report accurately.",
      yourRights: ['Right to submit a caregiver report', 'Right to request services for the child', 'Right to be heard about placement'],
    },
  },
  '12_month_review': {
    parent: {
      name: '12-Month Review Hearing',
      whatHappens: 'This is a critical hearing. If you have not made substantial progress, the court may move toward a permanent plan. Bring everything showing your progress. Talk to your attorney before this hearing.',
      yourRights: ['Right to request extended reunification services', 'Right to present evidence of progress', "Right to contest the court's findings", 'Right to an attorney'],
    },
    youth: {
      name: '12-Month Review Hearing',
      whatHappens: 'The judge takes a close look at your situation and decides what comes next. If you want to go home, say so. If things are not safe at home, say that too. Your voice matters here.',
      yourRights: ['Right to express your wishes about placement', 'Right to an attorney who represents only you', 'Right to participate in long-term planning for your life'],
    },
    supporter: {
      name: '12-Month Review Hearing',
      whatHappens: "The court is making big decisions about the family's future. If you are a caregiver, be prepared to report on how the child is doing. If reunification is not happening, the court may discuss other permanent options.",
      yourRights: ['Right to submit information to the court', 'Right to request to be considered for guardianship or adoption', 'Right to request services for the child in your care'],
    },
  },
  '18_month_permanency': {
    parent: {
      name: '18-Month Permanency Hearing',
      whatHappens: 'The court determines a permanent plan for your child. Reunification is still possible if you have made significant progress. This is the most important hearing. Be there, bring everything, and advocate for yourself.',
      yourRights: ['Right to advocate for reunification', 'Right to present all evidence of your progress', "Right to appeal the court's decision", 'Right to an attorney'],
    },
    youth: {
      name: '18-Month Permanency Hearing',
      whatHappens: 'The judge is deciding on a long-term plan for your life — going home, guardianship, or adoption. Tell your attorney and the judge exactly what you want. This decision should reflect what is best for you.',
      yourRights: ['Right to have your wishes considered in the permanent plan', 'Right to maintain contact with siblings and important people', 'Right to participate in your own permanency planning'],
    },
    supporter: {
      name: '18-Month Permanency Hearing',
      whatHappens: 'The court is finalizing a permanent plan. If you are interested in guardianship or adoption, speak up now. The court considers all stable, loving options for the child.',
      yourRights: ['Right to be assessed for guardianship or adoption', 'Right to request de facto parent status if you have been the primary caregiver', 'Right to provide a statement to the court'],
    },
  },
  post_permanency: {
    parent: {
      name: 'Post-Permanency Reviews',
      whatHappens: 'If reunification was successful, the court may hold follow-up hearings to make sure things are going well. Stay connected with your social worker and complete any remaining requirements.',
      yourRights: ['Right to request modification of orders', 'Right to ongoing support services', 'Right to appeal decisions you disagree with'],
    },
    youth: {
      name: 'Post-Permanency Reviews',
      whatHappens: 'The court is checking in to make sure your permanent plan is working. If you are aging out of foster care, you have rights to extended services. Ask your attorney about Extended Foster Care up to age 21.',
      yourRights: ['Right to Extended Foster Care services up to age 21', 'Right to transition planning support', 'Right to maintain connections with important people in your life'],
    },
    supporter: {
      name: 'Post-Permanency Reviews',
      whatHappens: 'The case is moving toward closure. If you are a guardian or adoptive parent, the court will check in on how things are going. Reach out to your social worker if you need additional support.',
      yourRights: ['Right to request support services as a caregiver', 'Right to maintain court-ordered contact arrangements', 'Right to request modification of orders if circumstances change'],
    },
  },
}

const fallbackContent = (stageName: string, role: Role): StageContent => ({
  name: stageName,
  whatHappens: role === 'youth'
    ? 'This is an important step in your case. Talk to your attorney to understand what is happening and what you can do.'
    : role === 'supporter'
    ? "This hearing is an important step in the case. Stay in contact with the family's attorney and your social worker."
    : 'This is an important step in your case. Talk to your attorney before this hearing and bring all documentation of your progress.',
  yourRights: ['Right to an attorney', 'Right to be present and heard', 'Right to present evidence'],
})

interface TimelineStage {
  id: string
  user_id: string
  stage_key: string
  stage_name: string
  stage_order: number
  order_index: number
  status: 'not_started' | 'in_progress' | 'completed'
  court_date: string | null
  tasks: Task[]
  icon_name: string
  color: string
  created_at: string
  updated_at: string
}

interface Task {
  task: string
  completed: boolean
}

const STAGE_ICONS = {
  FolderOpen, Building, Gavel, ClipboardList, Calendar,
  CalendarDays, CalendarCheck, Shield, Home, CheckCircle,
  Clock, FileText, Star, CheckSquare,
}

export function Timeline() {
  const navigate = useNavigate()
  const { user, profile } = useAuth()
  const role: Role = (profile?.role as Role) || 'parent'

  const [viewMode, setViewMode] = useState<'cards' | 'list'>('cards')
  const [stages, setStages] = useState<TimelineStage[]>([])
  const [expandedStage, setExpandedStage] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (user) initializeTimeline()
  }, [user])

  const getContent = (stage: TimelineStage): StageContent => {
    const lookup = STAGE_CONTENT[stage.stage_key]
    if (lookup && lookup[role]) return lookup[role]
    return fallbackContent(stage.stage_name, role)
  }

  const initializeTimeline = async () => {
    if (!user) { setLoading(false); return }

    try {
      const { data: existingStages, error: fetchError } = await supabase
        .from('timeline_stages')
        .select('*')
        .eq('user_id', user.id)
        .order('order_index')

      if (fetchError) throw fetchError

      if (!existingStages || existingStages.length === 0) {
        const { error: rpcError } = await supabase.rpc('initialize_user_timeline', { p_user_id: user.id })
        if (rpcError) throw rpcError

        const { data: newStages, error: refetchError } = await supabase
          .from('timeline_stages')
          .select('*')
          .eq('user_id', user.id)
          .order('order_index')

        if (refetchError) throw refetchError
        setStages(newStages || [])
      } else {
        setStages(existingStages)
      }

      trackEvent('screen_viewed', { screen: 'timeline' })
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load timeline')
    } finally {
      setLoading(false)
    }
  }

  const toggleTaskCompletion = async (stageId: string, taskIndex: number) => {
    try {
      const stage = stages.find((s) => s.id === stageId)
      if (!stage || !stage.tasks) return

      const updatedTasks = [...stage.tasks]
      updatedTasks[taskIndex] = { ...updatedTasks[taskIndex], completed: !updatedTasks[taskIndex].completed }

      haptics.medium()

      const { error } = await supabase.from('timeline_stages').update({ tasks: updatedTasks }).eq('id', stageId)
      if (error) throw error

      setStages((prev) => prev.map((s) => (s.id === stageId ? { ...s, tasks: updatedTasks } : s)))
    } catch (err) {
      console.error('Error updating task:', err)
    }
  }

  const updateCourtDate = async (stageId: string, date: string) => {
    try {
      const { error } = await supabase.from('timeline_stages').update({ court_date: date || null }).eq('id', stageId)
      if (error) throw error
      setStages((prev) => prev.map((s) => (s.id === stageId ? { ...s, court_date: date } : s)))
    } catch (err) {
      console.error('Error updating court date:', err)
    }
  }

  const markStageComplete = async (stageId: string, orderIndex: number) => {
    try {
      const updates = stages.map((stage) => {
        if (stage.order_index <= orderIndex) return { id: stage.id, status: 'completed' as const, color: 'green' }
        if (stage.order_index === orderIndex + 1) return { id: stage.id, status: 'in_progress' as const, color: 'purple' }
        return null
      }).filter(Boolean)

      for (const update of updates) {
        if (update) await supabase.from('timeline_stages').update({ status: update.status, color: update.color }).eq('id', update.id)
      }

      trackEvent('timeline_stage_completed', { stage_id: stageId })
      await initializeTimeline()
    } catch (err) {
      console.error('Error marking stage complete:', err)
    }
  }

  const getCompletedTaskCount = (stage: TimelineStage) => {
    const t = stage.tasks || []
    return { completed: t.filter((t) => t.completed).length, total: t.length }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return null
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const getStageIcon = (iconName: string) => STAGE_ICONS[iconName as keyof typeof STAGE_ICONS] || FolderOpen

  const StageCard = ({ stage }: { stage: TimelineStage }) => {
    const Icon = getStageIcon(stage.icon_name || 'FolderOpen')
    const isExpanded = expandedStage === stage.id
    const { completed, total } = getCompletedTaskCount(stage)
    const stageTasks = stage.tasks || []
    const content = getContent(stage)

    const statusColors = {
      not_started: 'text-gray-600 bg-gray-100',
      in_progress: 'text-purple-700 bg-purple-100',
      completed: 'text-green-700 bg-green-100',
    }
    const borderColors = {
      not_started: 'border-l-gray-400',
      in_progress: 'border-l-purple-600',
      completed: 'border-l-green-600',
    }

    return (
      <Card className={`border-l-4 ${borderColors[stage.status]} mb-4`}>
        <button
          onClick={() => { haptics.light(); setExpandedStage(isExpanded ? null : stage.id) }}
          className="w-full text-left"
        >
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-lg ${stage.status === 'completed' ? 'bg-green-100' : stage.status === 'in_progress' ? 'bg-purple-100' : 'bg-gray-100'}`}>
              <Icon className={`w-6 h-6 ${stage.status === 'completed' ? 'text-green-600' : stage.status === 'in_progress' ? 'text-purple-600' : 'text-gray-600'}`} />
            </div>

            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900 mb-2">{content.name}</h3>

              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${statusColors[stage.status]}`}>
                  {stage.status === 'completed' ? <Check className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                  {stage.status === 'completed' ? 'COMPLETED' : stage.status === 'in_progress' ? 'IN PROGRESS' : 'NOT STARTED'}
                </span>
                <span className="text-xs font-semibold text-gray-600">{completed}/{total} TASKS DONE</span>
              </div>

              {stage.court_date && (
                <div className="flex items-center gap-2 text-sm text-gray-700 mb-2">
                  <Calendar className="w-4 h-4" />
                  <span>Court Date: {formatDate(stage.court_date)}</span>
                </div>
              )}
            </div>

            {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0" /> : <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />}
          </div>
        </button>

        {isExpanded && (
          <div className="mt-6 space-y-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-start gap-2 mb-3">
                <Calendar className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-gray-700 mb-2">COURT DATE</label>
                  <input
                    type="date"
                    value={stage.court_date || ''}
                    onChange={(e) => updateCourtDate(stage.id, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-start gap-2 mb-3">
                <FileText className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                <h4 className="text-sm font-bold text-gray-900">WHAT HAPPENS</h4>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed ml-7">{content.whatHappens}</p>
            </div>

            {content.yourRights.length > 0 && (
              <div>
                <div className="flex items-start gap-2 mb-3">
                  <Star className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <h4 className="text-sm font-bold text-gray-900">YOUR RIGHTS</h4>
                </div>
                <div className="flex flex-wrap gap-2 ml-7">
                  {content.yourRights.map((right, index) => (
                    <button
                      key={index}
                      onClick={() => { haptics.light(); navigate('/legal') }}
                      className="px-3 py-2 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold hover:bg-purple-200 transition-colors"
                    >
                      {right}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {stageTasks.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-start gap-2">
                    <CheckSquare className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                    <h4 className="text-sm font-bold text-gray-900">
                      DO NOW <span className="text-gray-600 font-normal">({completed}/{total} COMPLETED)</span>
                    </h4>
                  </div>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-2 mb-4 ml-7">
                  <div className="bg-purple-600 h-2 rounded-full transition-all" style={{ width: `${total > 0 ? (completed / total) * 100 : 0}%` }} />
                </div>

                <div className="space-y-3 ml-7">
                  {stageTasks.map((task, index) => (
                    <label key={index} className="flex items-start gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => toggleTaskCompletion(stage.id, index)}
                        className="w-5 h-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500 flex-shrink-0 mt-0.5"
                      />
                      <span className={`text-sm ${task.completed ? 'line-through text-gray-500' : 'text-gray-700'} group-hover:text-gray-900`}>
                        {task.task}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {stage.status !== 'completed' && (
              <div className="pt-4 border-t border-gray-200">
                <Button
                  variant="outline"
                  onClick={() => markStageComplete(stage.id, stage.order_index)}
                  className="w-full"
                >
                  MARK {content.name.toUpperCase()} AS COMPLETE
                </Button>
              </div>
            )}
          </div>
        )}
      </Card>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading your timeline...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <AppHeader title="Journey Ahead" />

      <div className="px-4 pt-4">
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
        )}

        <div className="flex items-center justify-end gap-2 mb-4">
          <button onClick={() => setViewMode('cards')} className={`p-2 rounded-lg ${viewMode === 'cards' ? 'bg-purple-100 text-purple-700' : 'text-gray-400'}`}>
            <LayoutGrid className="w-5 h-5" />
          </button>
          <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-purple-100 text-purple-700' : 'text-gray-400'}`}>
            <List className="w-5 h-5" />
          </button>
        </div>

        {viewMode === 'cards' && (
          <div>
            {stages.map((stage) => <StageCard key={stage.id} stage={stage} />)}
          </div>
        )}

        {viewMode === 'list' && (
          <div className="space-y-2">
            {stages.map((stage) => {
              const Icon = getStageIcon(stage.icon_name || 'FolderOpen')
              const isExpanded = expandedStage === stage.id
              const { completed, total } = getCompletedTaskCount(stage)
              const stageTasks = stage.tasks || []
              const content = getContent(stage)

              return (
                <div key={stage.id}>
                  <Card className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <div className={`p-2 rounded-lg ${stage.status === 'completed' ? 'bg-green-100' : stage.status === 'in_progress' ? 'bg-purple-100' : 'bg-gray-100'}`}>
                        <Icon className={`w-5 h-5 ${stage.status === 'completed' ? 'text-green-600' : stage.status === 'in_progress' ? 'text-purple-600' : 'text-gray-600'}`} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{content.name}</h3>
                        {stage.court_date && <p className="text-xs text-gray-600">{formatDate(stage.court_date)}</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs font-semibold px-2 py-1 rounded ${stage.status === 'completed' ? 'bg-green-100 text-green-700' : stage.status === 'in_progress' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'}`}>
                        {stage.status === 'completed' ? 'DONE' : stage.status === 'in_progress' ? 'ACTIVE' : 'PENDING'}
                      </span>
                      <button onClick={() => { haptics.light(); setExpandedStage(isExpanded ? null : stage.id) }} className="text-gray-400 hover:text-gray-600">
                        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </button>
                    </div>
                  </Card>

                  {isExpanded && (
                    <Card className="mt-2 ml-4">
                      <div className="space-y-6">
                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="flex items-start gap-2 mb-3">
                            <Calendar className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                              <label className="block text-xs font-semibold text-gray-700 mb-2">COURT DATE</label>
                              <input
                                type="date"
                                value={stage.court_date || ''}
                                onChange={(e) => updateCourtDate(stage.id, e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                              />
                            </div>
                          </div>
                        </div>

                        <div>
                          <div className="flex items-start gap-2 mb-3">
                            <FileText className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                            <h4 className="text-sm font-bold text-gray-900">WHAT HAPPENS</h4>
                          </div>
                          <p className="text-sm text-gray-700 leading-relaxed ml-7">{content.whatHappens}</p>
                        </div>

                        {content.yourRights.length > 0 && (
                          <div>
                            <div className="flex items-start gap-2 mb-3">
                              <Star className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                              <h4 className="text-sm font-bold text-gray-900">YOUR RIGHTS</h4>
                            </div>
                            <div className="flex flex-wrap gap-2 ml-7">
                              {content.yourRights.map((right, index) => (
                                <button key={index} onClick={() => { haptics.light(); navigate('/legal') }} className="px-3 py-2 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold hover:bg-purple-200 transition-colors">
                                  {right}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {stageTasks.length > 0 && (
                          <div>
                            <div className="flex items-start gap-2 mb-3">
                              <CheckSquare className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                              <h4 className="text-sm font-bold text-gray-900">DO NOW <span className="text-gray-600 font-normal">({completed}/{total} COMPLETED)</span></h4>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2 mb-4 ml-7">
                              <div className="bg-purple-600 h-2 rounded-full transition-all" style={{ width: `${total > 0 ? (completed / total) * 100 : 0}%` }} />
                            </div>
                            <div className="space-y-3 ml-7">
                              {stageTasks.map((task, index) => (
                                <label key={index} className="flex items-start gap-3 cursor-pointer group">
                                  <input type="checkbox" checked={task.completed} onChange={() => toggleTaskCompletion(stage.id, index)} className="w-5 h-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500 flex-shrink-0 mt-0.5" />
                                  <span className={`text-sm ${task.completed ? 'line-through text-gray-500' : 'text-gray-700'} group-hover:text-gray-900`}>{task.task}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                        )}

                        {stage.status !== 'completed' && (
                          <div className="pt-4 border-t border-gray-200">
                            <Button variant="outline" onClick={() => markStageComplete(stage.id, stage.order_index)} className="w-full">
                              MARK {content.name.toUpperCase()} AS COMPLETE
                            </Button>
                          </div>
                        )}
                      </div>
                    </Card>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  )
}
