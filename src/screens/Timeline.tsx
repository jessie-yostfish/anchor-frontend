import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  LayoutGrid,
  List,
  Info,
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

interface TimelineStage {
  id: string
  user_id: string
  stage_key: string
  stage_name: string
  stage_order: number
  order_index: number
  status: 'not_started' | 'in_progress' | 'completed'
  court_date: string | null
  what_happens: string | null
  your_rights: string[] | null
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
  FolderOpen,
  Building,
  Gavel,
  ClipboardList,
  Calendar,
  CalendarDays,
  CalendarCheck,
  Shield,
  Home,
  CheckCircle,
  Clock,
  FileText,
  Star,
  CheckSquare,
}


export function Timeline() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [viewMode, setViewMode] = useState<'cards' | 'list'>('cards')
  const [stages, setStages] = useState<TimelineStage[]>([])
  const [expandedStage, setExpandedStage] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      initializeTimeline()
    }
  }, [user])

  const initializeTimeline = async () => {
    if (!user) {
      console.log('No user found, cannot initialize timeline')
      setLoading(false)
      return
    }

    try {
      console.log('Fetching timeline stages for user:', user.id)
      const { data: existingStages, error: fetchError } = await supabase
        .from('timeline_stages')
        .select('*')
        .eq('user_id', user.id)
        .order('order_index')

      if (fetchError) {
        console.error('Timeline stages fetch error:', fetchError)
        throw fetchError
      }

      console.log('Timeline stages data:', existingStages)

      if (!existingStages || existingStages.length === 0) {
        console.log('No stages found, initializing timeline...')
        const { error: rpcError } = await supabase.rpc('initialize_user_timeline', { p_user_id: user.id })

        if (rpcError) {
          console.error('Initialize timeline RPC error:', rpcError)
          throw rpcError
        }

        const { data: newStages, error: refetchError } = await supabase
          .from('timeline_stages')
          .select('*')
          .eq('user_id', user.id)
          .order('order_index')

        if (refetchError) {
          console.error('Timeline stages refetch error:', refetchError)
          throw refetchError
        }

        console.log('New timeline stages created:', newStages)
        setStages(newStages || [])
      } else {
        console.log('Found existing stages:', existingStages.length)
        setStages(existingStages)
      }
      setError(null)
    } catch (error) {
      console.error('Error initializing timeline:', error)
      setError(error instanceof Error ? error.message : 'Failed to load timeline')
    } finally {
      setLoading(false)
    }
  }

  const toggleTaskCompletion = async (stageId: string, taskIndex: number) => {
    try {
      const stage = stages.find((s) => s.id === stageId)
      if (!stage || !stage.tasks) return

      const updatedTasks = [...stage.tasks]
      updatedTasks[taskIndex] = {
        ...updatedTasks[taskIndex],
        completed: !updatedTasks[taskIndex].completed,
      }

      haptics.medium()

      const { error } = await supabase
        .from('timeline_stages')
        .update({ tasks: updatedTasks })
        .eq('id', stageId)

      if (error) throw error

      setStages((prev) =>
        prev.map((s) => (s.id === stageId ? { ...s, tasks: updatedTasks } : s))
      )
    } catch (error) {
      console.error('Error updating task:', error)
    }
  }

  const updateCourtDate = async (stageId: string, date: string) => {
    try {
      const { error } = await supabase
        .from('timeline_stages')
        .update({ court_date: date || null })
        .eq('id', stageId)

      if (error) throw error

      setStages((prev) =>
        prev.map((stage) => (stage.id === stageId ? { ...stage, court_date: date } : stage))
      )
    } catch (error) {
      console.error('Error updating court date:', error)
    }
  }

  const markStageComplete = async (stageId: string, orderIndex: number) => {
    try {
      const updates = stages.map((stage) => {
        if (stage.order_index <= orderIndex) {
          return {
            id: stage.id,
            status: 'completed' as const,
            color: 'green',
          }
        } else if (stage.order_index === orderIndex + 1) {
          return {
            id: stage.id,
            status: 'in_progress' as const,
            color: 'purple',
          }
        }
        return null
      }).filter(Boolean)

      for (const update of updates) {
        if (update) {
          await supabase
            .from('timeline_stages')
            .update({ status: update.status, color: update.color })
            .eq('id', update.id)
        }
      }

      await initializeTimeline()
    } catch (error) {
      console.error('Error marking stage complete:', error)
    }
  }

  const getStageIcon = (iconName: string) => {
    const Icon = STAGE_ICONS[iconName as keyof typeof STAGE_ICONS] || FolderOpen
    return Icon
  }

  const getCompletedTaskCount = (stage: TimelineStage) => {
    const stageTasks = stage.tasks || []
    const completed = stageTasks.filter((t) => t.completed).length
    return { completed, total: stageTasks.length }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return null
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const StageCard = ({ stage }: { stage: TimelineStage }) => {
    const Icon = getStageIcon(stage.icon_name || 'FolderOpen')
    const isExpanded = expandedStage === stage.id
    const { completed, total } = getCompletedTaskCount(stage)
    const stageTasks = stage.tasks || []

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
          onClick={() => {
            haptics.light()
            setExpandedStage(isExpanded ? null : stage.id)
          }}
          className="w-full text-left"
        >
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-lg ${stage.status === 'completed' ? 'bg-green-100' : stage.status === 'in_progress' ? 'bg-purple-100' : 'bg-gray-100'}`}>
              <Icon className={`w-6 h-6 ${stage.status === 'completed' ? 'text-green-600' : stage.status === 'in_progress' ? 'text-purple-600' : 'text-gray-600'}`} />
            </div>

            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900 mb-2">{stage.stage_name}</h3>

              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${statusColors[stage.status]}`}>
                  {stage.status === 'completed' ? (
                    <Check className="w-3 h-3" />
                  ) : (
                    <Clock className="w-3 h-3" />
                  )}
                  {stage.status === 'completed' ? 'COMPLETED' : stage.status === 'in_progress' ? 'IN PROGRESS' : 'NOT STARTED'}
                </span>

                <span className="text-xs font-semibold text-gray-600">
                  {completed}/{total} TASKS DONE
                </span>
              </div>

              {stage.court_date && (
                <div className="flex items-center gap-2 text-sm text-gray-700 mb-2">
                  <Calendar className="w-4 h-4" />
                  <span>Court Date: {formatDate(stage.court_date)}</span>
                </div>
              )}
            </div>

            {isExpanded ? (
              <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
            )}
          </div>
        </button>

        {isExpanded && (
          <div className="mt-6 space-y-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-start gap-2 mb-3">
                <Calendar className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-gray-700 mb-2">
                    COURT DATE
                  </label>
                  <input
                    type="date"
                    value={stage.court_date || ''}
                    onChange={(e) => updateCourtDate(stage.id, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
            </div>

            {stage.what_happens && (
              <div>
                <div className="flex items-start gap-2 mb-3">
                  <FileText className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <h4 className="text-sm font-bold text-gray-900">WHAT HAPPENS</h4>
                </div>
                <div className="ml-7">
                  <p className="text-sm text-gray-700 leading-relaxed">{stage.what_happens}</p>
                </div>
              </div>
            )}

            {stage.your_rights && stage.your_rights.length > 0 && (
              <div>
                <div className="flex items-start gap-2 mb-3">
                  <Star className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <h4 className="text-sm font-bold text-gray-900">YOUR RIGHTS</h4>
                </div>
                <div className="flex flex-wrap gap-2 ml-7">
                  {stage.your_rights.map((right, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        haptics.light()
                        navigate('/legal')
                      }}
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
                  <div
                    className="bg-purple-600 h-2 rounded-full transition-all"
                    style={{ width: `${total > 0 ? (completed / total) * 100 : 0}%` }}
                  />
                </div>

                <div className="space-y-3 ml-7">
                  {stageTasks.map((task, index) => (
                    <label
                      key={index}
                      className="flex items-start gap-3 cursor-pointer group"
                    >
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => toggleTaskCompletion(stage.id, index)}
                        className="w-5 h-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500 flex-shrink-0 mt-0.5"
                      />
                      <span
                        className={`text-sm ${task.completed ? 'line-through text-gray-500' : 'text-gray-700'} group-hover:text-gray-900`}
                      >
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
                  MARK {stage.stage_name.toUpperCase()} AS COMPLETE
                </Button>
              </div>
            )}
          </div>
        )}
      </Card>
    )
  }

  const ListView = () => (
    <div className="space-y-2">
      {stages.map((stage) => {
        const Icon = getStageIcon(stage.icon_name || 'FolderOpen')
        return (
          <Card key={stage.id} className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
              <div className={`p-2 rounded-lg ${stage.status === 'completed' ? 'bg-green-100' : stage.status === 'in_progress' ? 'bg-purple-100' : 'bg-gray-100'}`}>
                <Icon className={`w-5 h-5 ${stage.status === 'completed' ? 'text-green-600' : stage.status === 'in_progress' ? 'text-purple-600' : 'text-gray-600'}`} />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{stage.stage_name}</h3>
                {stage.court_date && (
                  <p className="text-xs text-gray-600">{formatDate(stage.court_date)}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-xs font-semibold px-2 py-1 rounded ${stage.status === 'completed' ? 'bg-green-100 text-green-700' : stage.status === 'in_progress' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'}`}>
                {stage.status === 'completed' ? 'DONE' : stage.status === 'in_progress' ? 'ACTIVE' : 'PENDING'}
              </span>
              <button
                onClick={() => {
                  haptics.light()
                  setExpandedStage(stage.id)
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <ChevronDown className="w-5 h-5" />
              </button>
            </div>
          </Card>
        )
      })}
    </div>
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading your timeline...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center px-6">
          <div className="bg-red-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <Info className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Unable to Load Timeline</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    )
  }

  if (stages.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center px-6">
          <div className="bg-gray-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <Calendar className="w-8 h-8 text-gray-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">No Timeline Data</h2>
          <p className="text-gray-600 mb-4">Your timeline will appear here once your case begins.</p>
          <Button onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader />
      <div className="max-w-md mx-auto px-6 py-8 pb-24">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Timeline</h1>

          <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => {
                haptics.light()
                setViewMode('cards')
              }}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${viewMode === 'cards' ? 'bg-white text-purple-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
            >
              <LayoutGrid className="w-4 h-4" />
              Cards
            </button>
            <button
              onClick={() => {
                haptics.light()
                setViewMode('list')
              }}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${viewMode === 'list' ? 'bg-white text-purple-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
            >
              <List className="w-4 h-4" />
              List
            </button>
          </div>
        </div>

        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">The Journey Ahead</h1>
          <p className="text-gray-600">Your family's guide to the dependency court process.</p>
        </div>

        <div className="mb-6 bg-purple-50 border border-purple-200 rounded-xl p-4">
          <div className="flex gap-3">
            <Info className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-gray-700">
              Every family's journey is unique. This timeline shows the standard steps in California, but your specific path might vary.
            </p>
          </div>
        </div>

        {viewMode === 'cards' ? (
          <div>
            {stages.map((stage) => (
              <StageCard key={stage.id} stage={stage} />
            ))}
          </div>
        ) : (
          <ListView />
        )}
      </div>
      <BottomNav />
    </div>
  )
}
