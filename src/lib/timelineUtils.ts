import { supabase } from './supabase'
import { timelineStages } from '../data/timelineStages'

export interface TimelineStageDB {
  id: string
  user_id: string
  stage_name: string
  stage_order: number
  status: 'not_started' | 'in_progress' | 'completed'
  court_date: string | null
  icon_name: string
  color: string
  created_at: string
  updated_at: string
}

export interface TimelineTaskDB {
  id: string
  stage_id: string
  user_id: string
  task_text: string
  task_order: number
  is_completed: boolean
  created_at: string
  updated_at: string
}

export async function initializeUserTimeline(userId: string) {
  const stagesToInsert = timelineStages.map((stage) => ({
    user_id: userId,
    stage_name: stage.title,
    stage_order: stage.order,
    status: stage.order === 1 ? 'in_progress' : 'not_started',
    icon_name: stage.icon,
    color: stage.order === 1 ? 'purple' : 'gray',
  }))

  const { data: insertedStages, error: stagesError } = await supabase
    .from('timeline_stages')
    .insert(stagesToInsert)
    .select()

  if (stagesError) {
    throw new Error(`Failed to initialize timeline stages: ${stagesError.message}`)
  }

  const tasksToInsert = insertedStages.flatMap((dbStage) => {
    const stageData = timelineStages.find((s) => s.order === dbStage.stage_order)
    if (!stageData) return []

    return stageData.tasks.map((task, index) => ({
      stage_id: dbStage.id,
      user_id: userId,
      task_text: task.title,
      task_order: index + 1,
      is_completed: false,
    }))
  })

  const { error: tasksError } = await supabase
    .from('timeline_tasks')
    .insert(tasksToInsert)

  if (tasksError) {
    throw new Error(`Failed to initialize timeline tasks: ${tasksError.message}`)
  }

  return { stages: insertedStages, success: true }
}

export async function getUserTimeline(userId: string) {
  const { data: stages, error: stagesError } = await supabase
    .from('timeline_stages')
    .select('*')
    .eq('user_id', userId)
    .order('stage_order', { ascending: true })

  if (stagesError) {
    throw new Error(`Failed to fetch timeline stages: ${stagesError.message}`)
  }

  const stageIds = stages.map((s) => s.id)

  const { data: tasks, error: tasksError } = await supabase
    .from('timeline_tasks')
    .select('*')
    .in('stage_id', stageIds)
    .order('task_order', { ascending: true })

  if (tasksError) {
    throw new Error(`Failed to fetch timeline tasks: ${tasksError.message}`)
  }

  return { stages, tasks }
}

export async function updateStageStatus(
  stageId: string,
  status: 'not_started' | 'in_progress' | 'completed'
) {
  const color = status === 'completed' ? 'green' : status === 'in_progress' ? 'purple' : 'gray'

  const { data, error } = await supabase
    .from('timeline_stages')
    .update({ status, color })
    .eq('id', stageId)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to update stage status: ${error.message}`)
  }

  return data
}

export async function updateCourtDate(stageId: string, courtDate: string | null) {
  const { data, error } = await supabase
    .from('timeline_stages')
    .update({ court_date: courtDate })
    .eq('id', stageId)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to update court date: ${error.message}`)
  }

  return data
}

export async function toggleTaskCompletion(taskId: string, isCompleted: boolean) {
  const { data, error } = await supabase
    .from('timeline_tasks')
    .update({ is_completed: isCompleted })
    .eq('id', taskId)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to toggle task completion: ${error.message}`)
  }

  return data
}

export async function getStageProgress(stageId: string) {
  const { data: tasks, error } = await supabase
    .from('timeline_tasks')
    .select('is_completed')
    .eq('stage_id', stageId)

  if (error) {
    throw new Error(`Failed to fetch stage progress: ${error.message}`)
  }

  const total = tasks.length
  const completed = tasks.filter((t) => t.is_completed).length

  return {
    total,
    completed,
    percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
  }
}

export async function checkAndAutoProgressStage(stageId: string, userId: string) {
  const progress = await getStageProgress(stageId)

  if (progress.percentage === 100) {
    await updateStageStatus(stageId, 'completed')

    const { data: currentStage } = await supabase
      .from('timeline_stages')
      .select('stage_order')
      .eq('id', stageId)
      .single()

    if (currentStage) {
      const { data: nextStage } = await supabase
        .from('timeline_stages')
        .select('id')
        .eq('user_id', userId)
        .eq('stage_order', currentStage.stage_order + 1)
        .maybeSingle()

      if (nextStage) {
        await updateStageStatus(nextStage.id, 'in_progress')
      }
    }
  }
}
