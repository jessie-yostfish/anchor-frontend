export interface TimelineTask {
  key: string
  title: string
}

export interface TimelineStage {
  key: string
  title: string
  icon: string
  order: number
  description: string
  whatHappens: string[]
  rights: string[]
  tasks: TimelineTask[]
  timeline?: string
}

export const timelineStages: TimelineStage[] = [
  {
    key: 'case-opening',
    title: 'Case Opening',
    icon: 'FolderOpen',
    order: 1,
    description: 'Your case has been filed with the court.',
    timeline: 'When CPS files a petition',
    whatHappens: [
      'CPS files a petition with the court',
      'The petition explains why they believe your child needs protection',
      'You will receive notice of the court hearing',
      'The court assigns you an attorney if you cannot afford one'
    ],
    rights: [
      'Right to an Attorney',
      'Right to Read the Petition',
      'Right to Present Evidence',
      'Right to Cross-Examine Witnesses'
    ],
    tasks: [
      { key: 'read-petition', title: 'Get a copy of the petition and read it carefully' },
      { key: 'get-attorney', title: 'Make sure you have an attorney assigned' },
      { key: 'gather-documents', title: 'Start gathering important documents (birth certificates, medical records, etc.)' },
      { key: 'contact-list', title: 'Create a list of witnesses who can support your case' }
    ]
  },
  {
    key: 'detention',
    title: 'Detention Hearing',
    icon: 'Building',
    order: 2,
    description: 'First hearing within 48-72 hours of removal.',
    timeline: 'Within 48-72 hours of child being removed',
    whatHappens: [
      'Judge decides if your child should remain in custody or return home',
      'This is your first opportunity to speak to the judge',
      'CPS presents evidence about why removal was necessary',
      'You can present evidence for why your child should return home',
      'Judge may order services you need to complete'
    ],
    rights: [
      'Right to a Lawyer',
      'Right to Be Present',
      'Right to Present Evidence',
      'Right to Question CPS Workers',
      'Right to Be Heard by the Judge'
    ],
    tasks: [
      { key: 'attend-hearing', title: 'Attend the detention hearing - do not miss it' },
      { key: 'speak-attorney', title: 'Talk to your attorney before the hearing' },
      { key: 'prepare-statement', title: 'Prepare what you want to say to the judge' },
      { key: 'gather-support', title: 'Bring support people or character witnesses if possible' },
      { key: 'review-allegations', title: 'Review the allegations with your attorney' }
    ]
  },
  {
    key: 'jurisdiction',
    title: 'Jurisdiction Hearing',
    icon: 'Scale',
    order: 3,
    description: 'Judge determines if allegations are true.',
    timeline: 'Within 30 days of detention hearing',
    whatHappens: [
      'Judge decides if the allegations in the petition are true',
      'CPS presents evidence and witnesses',
      'You and your attorney can present your side of the story',
      'You can accept or deny the allegations',
      'If allegations are found true, the case moves to disposition'
    ],
    rights: [
      'Right to a Trial',
      'Right to Present Evidence',
      'Right to Call Witnesses',
      'Right to Cross-Examine Witnesses',
      'Right to Deny Allegations',
      'Right to Appeal'
    ],
    tasks: [
      { key: 'meet-attorney', title: 'Meet with your attorney to prepare your defense' },
      { key: 'gather-evidence', title: 'Gather evidence that supports your case' },
      { key: 'prepare-witnesses', title: 'Prepare your witnesses to testify' },
      { key: 'understand-allegations', title: 'Make sure you understand each allegation' },
      { key: 'attend-hearing', title: 'Attend the jurisdiction hearing' }
    ]
  },
  {
    key: 'disposition',
    title: 'Disposition Hearing',
    icon: 'Clipboard',
    order: 4,
    description: 'Judge creates your case plan with services.',
    timeline: 'Within 60 days of initial hearing',
    whatHappens: [
      'Judge creates a case plan with specific services you must complete',
      'Services may include parenting classes, therapy, drug testing, housing assistance',
      'Judge sets visitation schedule with your child',
      'Goals and timeline for reunification are established',
      'Progress reviews are scheduled'
    ],
    rights: [
      'Right to Participate in Case Plan',
      'Right to Visitation',
      'Right to Request Services',
      'Right to Object to Case Plan Requirements',
      'Right to Regular Updates'
    ],
    tasks: [
      { key: 'review-case-plan', title: 'Review the proposed case plan with your attorney' },
      { key: 'start-services', title: 'Begin services immediately - do not wait' },
      { key: 'document-progress', title: 'Keep records of all services you complete' },
      { key: 'attend-visits', title: 'Attend all scheduled visits with your child' },
      { key: 'communicate-social-worker', title: 'Maintain regular communication with your social worker' }
    ]
  },
  {
    key: 'review',
    title: 'Review Hearings',
    icon: 'FileCheck',
    order: 5,
    description: 'Regular check-ins on your progress.',
    timeline: 'Every 6 months',
    whatHappens: [
      'Judge reviews your progress on the case plan',
      'Social worker reports on your compliance with services',
      'Judge evaluates if services should continue or change',
      'Visitation schedule may be modified based on progress',
      'Judge determines if reunification is still the goal'
    ],
    rights: [
      'Right to Be Present',
      'Right to Report Your Progress',
      'Right to Dispute False Reports',
      'Right to Request Additional Services',
      'Right to Increased Visitation'
    ],
    tasks: [
      { key: 'complete-services', title: 'Continue completing all required services' },
      { key: 'prepare-progress-report', title: 'Document all services completed since last hearing' },
      { key: 'bring-certificates', title: 'Bring completion certificates and attendance records' },
      { key: 'maintain-contact', title: 'Maintain consistent contact with your child' },
      { key: 'address-concerns', title: 'Address any concerns raised by CPS' }
    ]
  },
  {
    key: 'permanency',
    title: 'Permanency Hearing',
    icon: 'Home',
    order: 6,
    description: 'Judge decides permanent plan for your child.',
    timeline: 'Within 12 months of removal',
    whatHappens: [
      'Judge makes a decision about permanent placement for your child',
      'Options include reunification, guardianship, or adoption',
      'Your progress on the case plan is heavily considered',
      'If you have completed services, reunification may be ordered',
      'If insufficient progress, termination of rights may be considered'
    ],
    rights: [
      'Right to Show You Are Ready for Reunification',
      'Right to Present Evidence of Progress',
      'Right to Object to Termination',
      'Right to Appeal the Decision',
      'Right to Legal Representation'
    ],
    tasks: [
      { key: 'complete-all-services', title: 'Ensure all case plan services are completed' },
      { key: 'stable-housing', title: 'Demonstrate stable housing and income' },
      { key: 'prepare-home', title: 'Prepare your home for your child\'s return' },
      { key: 'character-witnesses', title: 'Have character witnesses ready to testify' },
      { key: 'show-changes', title: 'Document all positive changes you have made' }
    ]
  },
  {
    key: 'reunification',
    title: 'Reunification/Case Closure',
    icon: 'Heart',
    order: 7,
    description: 'Your child returns home or case ends.',
    timeline: 'When services are completed',
    whatHappens: [
      'If successful, your child returns to your care',
      'Court may order continued monitoring for 6 months',
      'Case is eventually closed if family remains stable',
      'You may be connected with ongoing support services',
      'If unsuccessful, other permanency options are pursued'
    ],
    rights: [
      'Right to Aftercare Services',
      'Right to Support During Transition',
      'Right to Request Extended Services',
      'Right to Appeal Case Closure Conditions'
    ],
    tasks: [
      { key: 'transition-plan', title: 'Work with social worker on transition plan' },
      { key: 'maintain-services', title: 'Continue services even after reunification' },
      { key: 'establish-support', title: 'Establish ongoing support network' },
      { key: 'follow-up', title: 'Attend all follow-up appointments and check-ins' },
      { key: 'communicate-needs', title: 'Communicate any needs or concerns immediately' }
    ]
  }
]

export function getStageByKey(key: string): TimelineStage | undefined {
  return timelineStages.find(stage => stage.key === key)
}

export function getStageByOrder(order: number): TimelineStage | undefined {
  return timelineStages.find(stage => stage.order === order)
}

export function getNextStage(currentKey: string): TimelineStage | undefined {
  const current = getStageByKey(currentKey)
  if (!current || current.order === timelineStages.length) return undefined
  return getStageByOrder(current.order + 1)
}

export function getPreviousStage(currentKey: string): TimelineStage | undefined {
  const current = getStageByKey(currentKey)
  if (!current || current.order === 1) return undefined
  return getStageByOrder(current.order - 1)
}
