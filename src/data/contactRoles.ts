import type { LucideIcon } from 'lucide-react'
import {
  Scale,
  UserCog,
  ClipboardList,
  Heart,
  Brain,
  Eye,
  Gavel,
  User,
} from 'lucide-react'

export const contactRoleValues = [
  'attorney',
  'social_worker',
  'case_manager',
  'casa',
  'therapist',
  'supervisor',
  'judge',
  'other',
] as const

export type ContactRoleValue = typeof contactRoleValues[number]

export const dbContactRoles = [
  'Attorney',
  'Social Worker',
  'Case Manager',
  'CASA',
  'Therapist',
  'Supervisor',
  'Judge',
  'Other',
] as const

export type DbContactRole = typeof dbContactRoles[number]

export interface ContactRole {
  value: ContactRoleValue
  label: string
  dbValue: DbContactRole
  icon: LucideIcon
}

const iconMap: Record<ContactRoleValue, LucideIcon> = {
  attorney: Scale,
  social_worker: UserCog,
  case_manager: ClipboardList,
  casa: Heart,
  therapist: Brain,
  supervisor: Eye,
  judge: Gavel,
  other: User,
}

export const contactRoles: ContactRole[] = [
  {
    value: 'attorney',
    label: 'Attorney',
    dbValue: 'Attorney',
    icon: Scale,
  },
  {
    value: 'social_worker',
    label: 'Social Worker',
    dbValue: 'Social Worker',
    icon: UserCog,
  },
  {
    value: 'case_manager',
    label: 'Case Manager',
    dbValue: 'Case Manager',
    icon: ClipboardList,
  },
  {
    value: 'casa',
    label: 'CASA (Court Advocate)',
    dbValue: 'CASA',
    icon: Heart,
  },
  {
    value: 'therapist',
    label: 'Therapist',
    dbValue: 'Therapist',
    icon: Brain,
  },
  {
    value: 'supervisor',
    label: 'Visitation Supervisor',
    dbValue: 'Supervisor',
    icon: Eye,
  },
  {
    value: 'judge',
    label: 'Judge/Referee',
    dbValue: 'Judge',
    icon: Gavel,
  },
  {
    value: 'other',
    label: 'Other',
    dbValue: 'Other',
    icon: User,
  },
]

export function isValidContactRole(role: string): role is ContactRoleValue {
  return contactRoleValues.includes(role as ContactRoleValue)
}

export function isValidDbContactRole(role: string): role is DbContactRole {
  return dbContactRoles.includes(role as DbContactRole)
}

export function getContactRoleByValue(value: ContactRoleValue): ContactRole | undefined {
  return contactRoles.find(role => role.value === value)
}

export function getContactRoleByDbValue(dbValue: DbContactRole): ContactRole | undefined {
  return contactRoles.find(role => role.dbValue === dbValue)
}

export function getContactRoleIcon(value: ContactRoleValue): LucideIcon {
  return iconMap[value]
}

export function dbValueToValue(dbValue: DbContactRole): ContactRoleValue {
  const role = getContactRoleByDbValue(dbValue)
  return role?.value || 'other'
}

export function valueToDbValue(value: ContactRoleValue): DbContactRole {
  const role = getContactRoleByValue(value)
  return role?.dbValue || 'Other'
}
