import { trackEvent } from '../lib/analytics'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import React from 'react'
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
import { BottomNav, AppHeader } from '../components'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { haptics } from '../lib/haptics'

type Role = 'parent' | 'youth' | 'supporter'

interface StageContent {
  name: string
  whatHappens: string
  yourRights: string[]
  tasks: string[]
}

// ─── ROLE-SPECIFIC CONTENT FOR EVERY STAGE ──────────────────────────────────
const STAGE_CONTENT: Record<string, Record<Role, StageContent>> = {
  'case-opening': {
    parent: {
      name: 'Case Opening',
      whatHappens: 'A case has been opened with Child Protective Services about your child. This is the beginning of the dependency court process. You have rights at every step — starting right now.',
      yourRights: ['Right to an attorney at no cost', 'Right to read the petition', 'Right to know the allegations', 'Right to request your child be placed with family'],
      tasks: [
        'Contact your attorney or ask the court to appoint one',
        'Read the petition carefully — write down anything you disagree with',
        'Tell your attorney about any family members who can care for your child',
        'Gather any documents that show your home is safe',
        'Write down the names and numbers of your social worker and attorney',
      ],
    },
    youth: {
      name: 'Case Opening',
      whatHappens: 'A case has been opened and the court is now involved in decisions about where you live. You have your own rights in this process — separate from your parents. Your voice matters.',
      yourRights: ['Right to your own attorney', 'Right to know what is happening in your case', 'Right to be heard by the judge', 'Right to safe placement'],
      tasks: [
        'Ask to speak with your own attorney as soon as possible',
        'Write down any questions you have about what is happening',
        'Tell your attorney where you want to live and who you want to stay with',
        'Let a trusted adult know what is going on',
        'Know that you are not in trouble — this process is about your safety',
      ],
    },
    supporter: {
      name: 'Case Opening',
      whatHappens: 'A dependency case has been opened for the family you are supporting. The court process is beginning. You may be able to help by offering to care for the child or attending hearings as a support person.',
      yourRights: ['Right to request placement of the child', 'Right to be notified of hearings if you are a caregiver', 'Right to provide information to the court'],
      tasks: [
        'Contact the social worker and let them know you are available for placement',
        'Ask about the hearing schedule so you can attend',
        'Offer to help the parent with transportation or childcare during court dates',
        'Keep communication open and supportive — avoid judgment',
        'Learn about your rights as a potential caregiver or de facto parent',
      ],
    },
  },
  detention: {
    parent: {
      name: 'Detention Hearing',
      whatHappens: 'The court decides if your child can return home or must stay in foster care while the case continues. This happens within 48–72 hours of removal. Tell the judge if family members can care for your child.',
      yourRights: ['Right to be present and speak', 'Right to an attorney', 'Right to suggest relatives for placement', 'Right to visits with your child'],
      tasks: [
        'Go to the hearing — do not miss it even if you do not have an attorney yet',
        'Tell the judge and social worker about family members who can care for your child',
        'Ask your attorney what you should and should not say in court',
        'Request a visitation schedule if your child is not returned home',
        'Write down everything that happens and what the judge orders',
      ],
    },
    youth: {
      name: 'Detention Hearing',
      whatHappens: 'This is the first court hearing. The judge decides where you will live while the case is open. You can tell the judge where you want to live and who you want to be with.',
      yourRights: ['Right to be at the hearing', 'Right to your own attorney', 'Right to tell the judge your wishes', 'Right to contact with your parents (unless unsafe)'],
      tasks: [
        'Go to the hearing if you are able to',
        'Tell your attorney where you want to live before the hearing',
        'Ask your attorney what the judge will decide and what you can say',
        'Write down the name of your placement and how to contact your parents',
        'Ask your attorney how you can get a message to the judge if needed',
      ],
    },
    supporter: {
      name: 'Detention Hearing',
      whatHappens: 'The judge decides where the child will live during the case. If you want the child placed with you, this is the time to tell the court. Contact the social worker right away.',
      yourRights: ['Right to request placement', 'Right to speak to the social worker', 'Right to attend the hearing if you are a caregiver'],
      tasks: [
        'Call the social worker immediately and ask to be considered for placement',
        'Be prepared for a home study or background check',
        'Attend the hearing if you can — the court values family placement',
        'Ask what is needed from you to be approved for placement',
        'Support the parent in attending and preparing for this hearing',
      ],
    },
  },
  jurisdiction: {
    parent: {
      name: 'Jurisdiction Hearing',
      whatHappens: 'The court decides if the allegations against you are true. This is like a trial. You can present evidence, call witnesses, and tell your side. Your attorney will help you prepare.',
      yourRights: ['Right to a trial', 'Right to present evidence', 'Right to cross-examine witnesses', 'Right to testify on your own behalf'],
      tasks: [
        'Meet with your attorney before the hearing to review the allegations',
        'Gather any evidence that shows the allegations are not accurate',
        'Write down names of people who can speak on your behalf',
        'Ask your attorney whether you should testify or stay silent',
        'Bring all documents your attorney asks for to this hearing',
      ],
    },
    youth: {
      name: 'Jurisdiction Hearing',
      whatHappens: 'The judge decides if the things alleged in the case are true. You do not have to testify, but you can. Your attorney will explain your options and what to expect.',
      yourRights: ['Right to have an attorney present', 'Right to remain silent', 'Right to have your wishes heard', 'Right to attend the hearing'],
      tasks: [
        'Talk to your attorney about what the hearing means for you',
        'Ask if you are expected to speak or testify',
        'Write down any questions you want answered before the hearing',
        'Tell your attorney if you have feelings or opinions about what is happening',
        'Know that you do not have to speak unless you want to',
      ],
    },
    supporter: {
      name: 'Jurisdiction Hearing',
      whatHappens: "The court is deciding if the allegations in the case are proven. If you have information that could help, share it with the family's attorney. The outcome affects what happens next in the case.",
      yourRights: ['Right to attend hearings as a caregiver', 'Right to submit a statement through the court', 'Right to request information about placement decisions'],
      tasks: [
        "Contact the family's attorney if you have relevant information",
        'Attend the hearing as support if the parent invites you',
        'Keep supporting the parent emotionally through this stressful step',
        'Ask the social worker how you can best support the child during this time',
        'Do not share details of the case publicly or on social media',
      ],
    },
  },
  disposition: {
    parent: {
      name: 'Disposition Hearing',
      whatHappens: 'The judge creates your case plan — a list of services and goals you must complete to get your child back. Enroll in services right away. The sooner you start, the better.',
      yourRights: ['Right to participate in creating your case plan', 'Right to request reasonable services', 'Right to regular visits with your child', 'Right to object to services you believe are unreasonable'],
      tasks: [
        'Read your case plan carefully — ask questions about anything unclear',
        'Sign up for required services as soon as possible, do not wait',
        'Ask your attorney to object to any services that seem unreasonable',
        'Set up a system to track and document your attendance at services',
        'Keep all receipts, certificates, and letters from providers',
        'Set up a consistent visitation schedule with your child',
      ],
    },
    youth: {
      name: 'Disposition Hearing',
      whatHappens: 'The judge decides where you will live and what services you will receive. You have the right to say what you want. Tell your attorney about your school, friends, and what matters to you.',
      yourRights: ['Right to be placed with siblings when possible', 'Right to stay in your school', 'Right to have your educational needs met', 'Right to participate in your case plan'],
      tasks: [
        'Tell your attorney what school you want to stay in',
        'Ask about staying with or near your siblings',
        'Share with your attorney anything about your placement that is not working',
        'Ask what services you will receive and how they will help you',
        'Know that you have the right to participate in planning your own case',
      ],
    },
    supporter: {
      name: 'Disposition Hearing',
      whatHappens: "The judge sets up the case plan and decides on placement. If the child is living with you, you will learn what services and visitation will look like. You may be asked to support the parent's progress.",
      yourRights: ['Right to be informed of the case plan if you are the caregiver', 'Right to visitation arrangements in writing', 'Right to request services for yourself as a caregiver'],
      tasks: [
        'Ask for a copy of the case plan if the child is in your care',
        'Understand the visitation schedule and your role in supporting it',
        'Ask about any caregiver support services available to you',
        'Encourage the parent to start services right away',
        'Keep records of the child\'s wellbeing and any concerns that come up',
      ],
    },
  },
  '6_month_review': {
    parent: {
      name: '6-Month Review Hearing',
      whatHappens: 'The judge reviews your progress on your case plan. Bring every completion certificate, letter, and proof of attendance. This is your chance to show how hard you have been working.',
      yourRights: ['Right to present evidence of your progress', 'Right to request more visits', 'Right to request return of your child if progress is sufficient', 'Right to request additional services'],
      tasks: [
        'Gather all completion certificates and attendance records',
        'Write a summary of your progress to share with your attorney',
        'Ask your attorney to request more visits if you have been consistent',
        'Confirm your visitation has been happening as ordered — report any missed visits',
        'Ask your attorney what needs to happen for your child to come home',
        'Bring anything showing stable housing, income, or sobriety',
      ],
    },
    youth: {
      name: '6-Month Review Hearing',
      whatHappens: 'The judge checks in on how things are going — your placement, school, and wellbeing. Tell your attorney and the court if something is not working. You deserve to be heard.',
      yourRights: ['Right to speak to the judge', 'Right to request a change in placement', 'Right to have your educational needs addressed', 'Right to request additional services'],
      tasks: [
        'Tell your attorney if anything about your placement is not working',
        'Let your attorney know how school is going and what you need',
        'Write down anything you want the judge to know',
        'Ask about changing your placement if it does not feel safe or right',
        'Know that this hearing is a check-in for you — your needs matter',
      ],
    },
    supporter: {
      name: '6-Month Review Hearing',
      whatHappens: "The judge reviews how the family is progressing. As a caregiver, you may be asked about the child's wellbeing. Keep notes about how the child is doing so you can report accurately.",
      yourRights: ['Right to submit a caregiver report', 'Right to request services for the child', 'Right to be heard about placement'],
      tasks: [
        "Write notes about the child's health, school, and emotional wellbeing",
        'Ask your social worker if you can submit a caregiver report',
        'Continue supporting the parent in completing their case plan',
        'Raise any concerns about the child through the proper channels',
        'Ask about any additional support services available for you',
      ],
    },
  },
  '12_month_review': {
    parent: {
      name: '12-Month Review Hearing',
      whatHappens: 'This is a critical hearing. If you have not made substantial progress, the court may move toward a permanent plan. Bring everything showing your progress. Talk to your attorney before this hearing.',
      yourRights: ['Right to request extended reunification services', 'Right to present evidence of progress', "Right to contest the court's findings", 'Right to an attorney'],
      tasks: [
        'Meet with your attorney well before this hearing — do not wait',
        'Bring every piece of evidence of your progress',
        'Ask your attorney what "substantial progress" means in your county',
        'If you have had setbacks, be honest with your attorney about them',
        'Ask about requesting an extension of reunification services if needed',
        'This is the most important hearing so far — be there and be prepared',
      ],
    },
    youth: {
      name: '12-Month Review Hearing',
      whatHappens: 'The judge takes a close look at your situation and decides what comes next. If you want to go home, say so. If things are not safe at home, say that too. Your voice matters here.',
      yourRights: ['Right to express your wishes about placement', 'Right to an attorney who represents only you', 'Right to participate in long-term planning for your life'],
      tasks: [
        'Have an honest conversation with your attorney about what you want',
        'Tell your attorney if going home is or is not what you want right now',
        'Ask what the different outcomes of this hearing could mean for you',
        'Make sure your attorney knows if anything unsafe is happening',
        'Understand you have a say in what your future looks like',
      ],
    },
    supporter: {
      name: '12-Month Review Hearing',
      whatHappens: "The court is making big decisions about the family's future. If you are a caregiver, be prepared to report on how the child is doing. Reunification or another permanent plan may be discussed.",
      yourRights: ['Right to submit information to the court', 'Right to request to be considered for guardianship or adoption', 'Right to request services for the child in your care'],
      tasks: [
        "Document the child's wellbeing, school progress, and any challenges",
        'If you are open to guardianship or adoption, let the social worker know now',
        'Continue supporting the parent — reunification is still the goal',
        'Ask your social worker what to expect from this hearing',
        'Prepare for the possibility that the case direction may change after this hearing',
      ],
    },
  },
  '18_month_permanency': {
    parent: {
      name: '18-Month Permanency Hearing',
      whatHappens: 'The court determines a permanent plan for your child. Reunification is still possible if you have made significant progress. This is the most important hearing. Be there, bring everything, and advocate for yourself.',
      yourRights: ['Right to advocate for reunification', 'Right to present all evidence of your progress', "Right to appeal the court's decision", 'Right to an attorney'],
      tasks: [
        'This is the most critical hearing — do not miss it for any reason',
        'Bring every document, certificate, and letter showing your progress',
        'Meet with your attorney before the hearing to prepare your statement',
        'Ask your attorney about your right to appeal if you disagree with the outcome',
        'Advocate for yourself — tell the judge what you have done and what you need',
        'Know that you have the right to fight for your family even after this hearing',
      ],
    },
    youth: {
      name: '18-Month Permanency Hearing',
      whatHappens: 'The judge is deciding on a long-term plan for your life — going home, guardianship, or adoption. Tell your attorney and the judge exactly what you want. This decision should reflect what is best for you.',
      yourRights: ['Right to have your wishes considered in the permanent plan', 'Right to maintain contact with siblings and important people', 'Right to participate in your own permanency planning'],
      tasks: [
        'Talk openly with your attorney about what permanent plan you want',
        'Tell your attorney who you want to stay connected to, no matter what',
        'Ask about sibling contact rights if you have brothers or sisters in care',
        'Know that a permanent plan is meant to give you stability — not to punish anyone',
        'Ask about Extended Foster Care if you are close to 18',
      ],
    },
    supporter: {
      name: '18-Month Permanency Hearing',
      whatHappens: 'The court is finalizing a permanent plan. If you are interested in guardianship or adoption, speak up now. The court considers all stable, loving options for the child.',
      yourRights: ['Right to be assessed for guardianship or adoption', 'Right to request de facto parent status if you have been the primary caregiver', 'Right to provide a statement to the court'],
      tasks: [
        'If you want to be the permanent caregiver, tell the social worker immediately',
        'Ask about the process for legal guardianship or adoption',
        'Consider requesting de facto parent status if you have been caring for the child',
        'Provide a statement to the court about your relationship with the child',
        'Understand that this decision is about finding the child the most stable home',
      ],
    },
  },
  post_permanency: {
    parent: {
      name: 'Post-Permanency Reviews',
      whatHappens: 'If reunification was successful, the court may hold follow-up hearings to make sure things are going well. Stay connected with your social worker and complete any remaining requirements.',
      yourRights: ['Right to request modification of orders', 'Right to ongoing support services', 'Right to appeal decisions you disagree with'],
      tasks: [
        'Continue attending any remaining services or appointments',
        'Stay in regular contact with your social worker',
        'Ask about post-reunification support services for your family',
        'If problems come up, reach out for help before they become a crisis',
        'Celebrate how far you have come — this is hard work',
      ],
    },
    youth: {
      name: 'Post-Permanency Reviews',
      whatHappens: 'The court is checking in to make sure your permanent plan is working. If you are nearing 18, you have rights to extended services. Ask your attorney about Extended Foster Care.',
      yourRights: ['Right to Extended Foster Care services up to age 21', 'Right to transition planning support', 'Right to maintain connections with important people in your life'],
      tasks: [
        'Ask your attorney or social worker about Extended Foster Care if you are 16 or older',
        'Work with your team on a transition plan for your future',
        'Know you do not have to face aging out alone — support exists',
        'Stay connected to the people who matter to you',
        'Ask about education, housing, and employment resources for transition-age youth',
      ],
    },
    supporter: {
      name: 'Post-Permanency Reviews',
      whatHappens: 'The case is moving toward closure. If you are a guardian or adoptive parent, the court will check in on how things are going. Reach out to your social worker if you need support.',
      yourRights: ['Right to request support services as a caregiver', 'Right to maintain court-ordered contact arrangements', 'Right to request modification of orders if circumstances change'],
      tasks: [
        'Ask about support services available to you as a long-term caregiver',
        'Keep honoring any court-ordered contact arrangements',
        'Stay in contact with the child\'s social worker for any needed support',
        'Reach out if you need help — asking for support is a sign of strength',
        'Celebrate the stability you have helped create for this child',
      ],
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
  tasks: ['Contact your attorney', 'Gather any relevant documents', 'Attend the hearing'],
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

// ─── STATUS STYLE HELPERS ────────────────────────────────────────────────────
const STATUS_STYLES = {
  not_started: {
    border: 'rgba(122,102,144,0.15)',
    iconBg: '#E8DDE8',
    iconColor: '#9A90A8',
    badgeBg: '#E8DDE8',
    badgeColor: '#7A6690',
    label: 'NOT STARTED',
  },
  in_progress: {
    border: '#7A6690',
    iconBg: '#F4EFF8',
    iconColor: '#7A6690',
    badgeBg: '#F4EFF8',
    badgeColor: '#7A6690',
    label: 'IN PROGRESS',
  },
  completed: {
    border: '#4A7C59',
    iconBg: 'rgba(74,124,89,0.12)',
    iconColor: '#4A7C59',
    badgeBg: 'rgba(74,124,89,0.12)',
    badgeColor: '#4A7C59',
    label: 'COMPLETED',
  },
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

  // Track which stages have local task overrides (role-specific tasks from STAGE_CONTENT)
  // We use the DB tasks for completion state but show role-specific task labels
  const [taskCompletions, setTaskCompletions] = useState<Record<string, boolean[]>>({})

  useEffect(() => {
    if (user) initializeTimeline()
  }, [user])

  const getContent = (stage: TimelineStage): StageContent => {
    const lookup = STAGE_CONTENT[stage.stage_key]
    if (lookup && lookup[role]) return lookup[role]
    return fallbackContent(stage.stage_name, role)
  }

  // Get task completion state: merge role-specific task labels with DB completion state
  const getStageTasks = (stage: TimelineStage): Task[] => {
    const content = getContent(stage)
    const roleTaskLabels = content.tasks
    const dbTasks = stage.tasks || []
    const localOverride = taskCompletions[stage.id]

    return roleTaskLabels.map((taskLabel, i) => ({
      task: taskLabel,
      completed: localOverride
        ? (localOverride[i] ?? false)
        : (dbTasks[i]?.completed ?? false),
    }))
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
      haptics.medium()
      const stage = stages.find(s => s.id === stageId)
      if (!stage) return

      const content = getContent(stage)
      const roleTaskCount = content.tasks.length

      // Build current completions
      const current = taskCompletions[stageId]
        ?? Array.from({ length: roleTaskCount }, (_, i) => stage.tasks?.[i]?.completed ?? false)

      const updated = [...current]
      updated[taskIndex] = !updated[taskIndex]

      // Optimistic UI
      setTaskCompletions(prev => ({ ...prev, [stageId]: updated }))

      // Persist — store as array of objects matching DB shape
      const dbTasks = updated.map((completed, i) => ({
        task: content.tasks[i] ?? `Task ${i + 1}`,
        completed,
      }))

      const { error } = await supabase
        .from('timeline_stages')
        .update({ tasks: dbTasks })
        .eq('id', stageId)

      if (error) throw error
    } catch (err) {
      console.error('Error updating task:', err)
    }
  }

  const updateCourtDate = async (stageId: string, date: string) => {
    try {
      const { error } = await supabase
        .from('timeline_stages')
        .update({ court_date: date || null })
        .eq('id', stageId)
      if (error) throw error
      setStages(prev => prev.map(s => s.id === stageId ? { ...s, court_date: date } : s))
      // Sync to profile so Dashboard court date stays current
      if (user) {
        await supabase.from('profiles').update({ next_court_date: date || null }).eq('id', user.id)
      }
    } catch (err) {
      console.error('Error updating court date:', err)
    }
  }

  const markStageComplete = async (stageId: string, orderIndex: number) => {
    try {
      const updates = stages.map(stage => {
        if (stage.order_index <= orderIndex) return { id: stage.id, status: 'completed' as const }
        if (stage.order_index === orderIndex + 1) return { id: stage.id, status: 'in_progress' as const }
        return null
      }).filter(Boolean)

      for (const update of updates) {
        if (update) await supabase.from('timeline_stages').update({ status: update.status }).eq('id', update.id)
      }

      // Sync current_stage to profile so Dashboard journey map stays current
      const nextStage = stages.find(s => s.order_index === orderIndex + 1)
      if (user && nextStage?.stage_key) {
        await supabase.from('profiles').update({ current_stage: nextStage.stage_key }).eq('id', user.id)
      }
      trackEvent('timeline_stage_completed', { stage_id: stageId })
      await initializeTimeline()
    } catch (err) {
      console.error('Error marking stage complete:', err)
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return null
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const getStageIcon = (iconName: string) =>
    STAGE_ICONS[iconName as keyof typeof STAGE_ICONS] || FolderOpen

  // ─── STAGE CARD ─────────────────────────────────────────────────────────────
  const StageCard = ({ stage }: { stage: TimelineStage }) => {
    const Icon = getStageIcon(stage.icon_name || 'FolderOpen')
    const isExpanded = expandedStage === stage.id
    const content = getContent(stage)
    const stageTasks = getStageTasks(stage)
    const completed = stageTasks.filter(t => t.completed).length
    const total = stageTasks.length
    const S = STATUS_STYLES[stage.status]

    return (
      <div
        className="rounded-3xl mb-4 overflow-hidden"
        style={{
          background: '#FAF7F2',
          border: `1.5px solid ${isExpanded ? S.border : 'rgba(122,102,144,0.12)'}`,
          boxShadow: isExpanded ? '0 4px 20px rgba(90,78,110,0.12)' : '0 1px 6px rgba(90,78,110,0.06)',
        }}
      >
        {/* ── CARD HEADER ── */}
        <button
          onClick={() => { haptics.light(); setExpandedStage(isExpanded ? null : stage.id) }}
          className="w-full text-left p-5"
        >
          <div className="flex items-start gap-4">
            <div className="rounded-2xl p-3 flex-shrink-0" style={{ background: S.iconBg }}>
              <Icon className="w-5 h-5" style={{ color: S.iconColor }} />
            </div>

            <div className="flex-1 min-w-0">
              <h3
                className="text-base font-bold mb-2 leading-tight"
                style={{ fontFamily: "'Fraunces', Georgia, serif", color: '#2A2030' }}
              >
                {content.name}
              </h3>

              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className="text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wide"
                  style={{ background: S.badgeBg, color: S.badgeColor }}
                >
                  {stage.status === 'completed' ? '✓ ' : ''}{S.label}
                </span>
                {total > 0 && (
                  <span className="text-xs font-semibold" style={{ color: '#8A8098' }}>
                    {completed}/{total} tasks
                  </span>
                )}
              </div>

              {stage.court_date && (
                <div className="flex items-center gap-1.5 mt-2">
                  <Calendar className="w-3.5 h-3.5" style={{ color: '#C8883A' }} />
                  <span className="text-xs font-semibold" style={{ color: '#C8883A' }}>
                    {formatDate(stage.court_date)}
                  </span>
                </div>
              )}
            </div>

            <div className="flex-shrink-0 mt-1">
              {isExpanded
                ? <ChevronUp className="w-4 h-4" style={{ color: '#8A8098' }} />
                : <ChevronDown className="w-4 h-4" style={{ color: '#8A8098' }} />
              }
            </div>
          </div>
        </button>

        {/* ── EXPANDED CONTENT ── */}
        {isExpanded && (
          <div className="px-5 pb-5 space-y-5">

            {/* Court date input */}
            <div
              className="rounded-2xl p-4"
              style={{ background: '#F5ECD8', border: '1px solid rgba(200,136,58,0.2)' }}
            >
              <label
                className="block text-xs font-bold uppercase tracking-wide mb-2"
                style={{ color: '#C8883A' }}
              >
                Court Date
              </label>
              <input
                type="date"
                value={stage.court_date || ''}
                onChange={e => updateCourtDate(stage.id, e.target.value)}
                className="w-full rounded-xl px-3 py-2.5 text-sm focus:outline-none"
                style={{
                  background: '#EDE6DB',
                  border: '1.5px solid rgba(200,136,58,0.3)',
                  color: '#2A2030',
                }}
              />
            </div>

            {/* What happens */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-4 h-4" style={{ color: '#7A6690' }} />
                <h4 className="text-xs font-bold uppercase tracking-wide" style={{ color: '#7A6690' }}>
                  What Happens
                </h4>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: '#2A2030' }}>
                {content.whatHappens}
              </p>
            </div>

            {/* Your rights */}
            {content.yourRights.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Star className="w-4 h-4" style={{ color: '#7A6690' }} />
                  <h4 className="text-xs font-bold uppercase tracking-wide" style={{ color: '#7A6690' }}>
                    Your Rights
                  </h4>
                </div>
                <div className="flex flex-wrap gap-2">
                  {content.yourRights.map((right, i) => (
                    <button
                      key={i}
                      onClick={() => { haptics.light(); navigate('/rights') }}
                      className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
                      style={{ background: 'linear-gradient(145deg,#F0EBF8,#E8DDF0)', color: '#7A6690' }}
                    >
                      {right}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Tasks */}
            {stageTasks.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <CheckSquare className="w-4 h-4" style={{ color: '#7A6690' }} />
                    <h4 className="text-xs font-bold uppercase tracking-wide" style={{ color: '#7A6690' }}>
                      Do Now
                    </h4>
                  </div>
                  <span className="text-xs font-semibold" style={{ color: '#8A8098' }}>
                    {completed}/{total}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="h-1.5 rounded-full mb-4" style={{ background: 'linear-gradient(145deg,#F0EBF8,#E8DDF0)' }}>
                  <div
                    className="h-1.5 rounded-full transition-all"
                    style={{
                      width: `${total > 0 ? (completed / total) * 100 : 0}%`,
                      background: '#7A6690',
                    }}
                  />
                </div>

                <div className="space-y-3">
                  {stageTasks.map((task, i) => (
                    <label key={i} className="flex items-start gap-3 cursor-pointer">
                      <div
                        onClick={(e) => { e.stopPropagation(); toggleTaskCompletion(stage.id, i) }}
                        className="w-5 h-5 rounded-lg flex-shrink-0 mt-0.5 flex items-center justify-center cursor-pointer transition-all"
                        style={{
                          background: task.completed ? '#7A6690' : 'transparent',
                          border: `2px solid ${task.completed ? '#7A6690' : 'rgba(122,102,144,0.3)'}`,
                        }}
                      >
                        {task.completed && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <span
                        className="text-sm leading-relaxed"
                        style={{
                          color: task.completed ? '#9A90A8' : '#2A2030',
                          textDecoration: task.completed ? 'line-through' : 'none',
                        }}
                      >
                        {task.task}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Mark complete button */}
            {stage.status !== 'completed' && (
              <button
                onClick={() => markStageComplete(stage.id, stage.order_index)}
                className="w-full py-3 rounded-2xl text-sm font-bold transition-all"
                style={{
                  background: 'transparent',
                  border: '1.5px solid rgba(122,102,144,0.35)',
                  color: '#7A6690',
                }}
              >
                Mark {content.name} as Complete
              </button>
            )}
          </div>
        )}
      </div>
    )
  }

  // ─── LIST VIEW ROW ────────────────────────────────────────────────────────
  const ListRow = ({ stage }: { stage: TimelineStage }) => {
    const Icon = getStageIcon(stage.icon_name || 'FolderOpen')
    const isExpanded = expandedStage === stage.id
    const content = getContent(stage)
    const stageTasks = getStageTasks(stage)
    const completed = stageTasks.filter(t => t.completed).length
    const total = stageTasks.length
    const S = STATUS_STYLES[stage.status]

    return (
      <div className="mb-2">
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            background: '#FAF7F2',
            border: `1px solid ${isExpanded ? S.border : 'rgba(122,102,144,0.12)'}`,
          }}
        >
          <button
            onClick={() => { haptics.light(); setExpandedStage(isExpanded ? null : stage.id) }}
            className="w-full flex items-center gap-3 p-4 text-left"
          >
            <div className="rounded-xl p-2 flex-shrink-0" style={{ background: S.iconBg }}>
              <Icon className="w-4 h-4" style={{ color: S.iconColor }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold leading-tight" style={{ color: '#2A2030' }}>{content.name}</p>
              {stage.court_date && (
                <p className="text-xs mt-0.5" style={{ color: '#C8883A' }}>{formatDate(stage.court_date)}</p>
              )}
            </div>
            <span
              className="text-xs font-bold px-2 py-1 rounded-full flex-shrink-0"
              style={{ background: S.badgeBg, color: S.badgeColor }}
            >
              {stage.status === 'completed' ? 'DONE' : stage.status === 'in_progress' ? 'ACTIVE' : 'PENDING'}
            </span>
            {isExpanded
              ? <ChevronUp className="w-4 h-4 flex-shrink-0" style={{ color: '#8A8098' }} />
              : <ChevronDown className="w-4 h-4 flex-shrink-0" style={{ color: '#8A8098' }} />
            }
          </button>

          {isExpanded && (
            <div className="px-4 pb-4 space-y-4 border-t" style={{ borderColor: 'rgba(122,102,144,0.1)' }}>
              <div className="pt-4">
                <p className="text-sm leading-relaxed" style={{ color: '#2A2030' }}>{content.whatHappens}</p>
              </div>

              {content.yourRights.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {content.yourRights.map((right, i) => (
                    <button
                      key={i}
                      onClick={() => navigate('/rights')}
                      className="px-3 py-1 rounded-full text-xs font-semibold"
                      style={{ background: 'linear-gradient(145deg,#F0EBF8,#E8DDF0)', color: '#7A6690' }}
                    >
                      {right}
                    </button>
                  ))}
                </div>
              )}

              {stageTasks.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-bold uppercase tracking-wide" style={{ color: '#7A6690' }}>
                    Tasks ({completed}/{total})
                  </p>
                  {stageTasks.map((task, i) => (
                    <label key={i} className="flex items-start gap-2.5 cursor-pointer">
                      <div
                        onClick={(e) => { e.stopPropagation(); toggleTaskCompletion(stage.id, i) }}
                        className="w-4 h-4 rounded flex-shrink-0 mt-0.5 flex items-center justify-center"
                        style={{
                          background: task.completed ? '#7A6690' : 'transparent',
                          border: `1.5px solid ${task.completed ? '#7A6690' : 'rgba(122,102,144,0.3)'}`,
                        }}
                      >
                        {task.completed && <Check className="w-2.5 h-2.5 text-white" />}
                      </div>
                      <span className="text-xs leading-relaxed" style={{
                        color: task.completed ? '#9A90A8' : '#2A2030',
                        textDecoration: task.completed ? 'line-through' : 'none',
                      }}>
                        {task.task}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#EDE6DB' }}>
        <div className="text-center">
          <div
            className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin mx-auto mb-3"
            style={{ borderColor: '#7A6690', borderTopColor: 'transparent' }}
          />
          <p className="text-sm" style={{ color: '#4A4058' }}>Loading your timeline...</p>
        </div>
      </div>
    )
  }

  // Role labels for the header context
  const roleLabel: Record<Role, string> = {
    parent: 'Parent Journey',
    youth: 'Your Journey',
    supporter: 'Support Journey',
  }

  return (
    <div className="min-h-screen pb-24" style={{ background: '#EDE6DB' }}>
      <AppHeader title="Journey Ahead" />

      <div className="max-w-md mx-auto px-4 pt-5">

        {error && (
          <div
            className="mb-4 p-3 rounded-2xl text-sm"
            style={{ background: '#F5ECD8', color: '#7A5A2A', border: '1px solid rgba(200,136,58,0.2)' }}
          >
            {error}
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1
              className="text-2xl font-bold"
              style={{ fontFamily: "'Fraunces', Georgia, serif", color: '#2A2030' }}
            >
              {roleLabel[role]}
            </h1>
            <p className="text-xs mt-0.5" style={{ color: '#8A8098' }}>
              {stages.filter(s => s.status === 'completed').length} of {stages.length} stages complete
            </p>
          </div>

          {/* View toggle */}
          <div
            className="flex rounded-xl p-1"
            style={{ background: 'linear-gradient(145deg,#F0EBF8,#E8DDF0)' }}
          >
            <button
              onClick={() => setViewMode('cards')}
              className="p-1.5 rounded-lg transition-all"
              style={viewMode === 'cards' ? { background: '#FAF7F2', color: '#7A6690' } : { color: '#8A8098' }}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className="p-1.5 rounded-lg transition-all"
              style={viewMode === 'list' ? { background: '#FAF7F2', color: '#7A6690' } : { color: '#8A8098' }}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Stage list */}
        {viewMode === 'cards'
          ? stages.map(stage => <StageCard key={stage.id} stage={stage} />)
          : stages.map(stage => <ListRow key={stage.id} stage={stage} />)
        }
      </div>

      <BottomNav />
    </div>
  )
}
