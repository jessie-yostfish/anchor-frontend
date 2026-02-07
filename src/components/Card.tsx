import { HTMLAttributes } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  selected?: boolean
  selectable?: boolean
}

export function Card({
  children,
  selected = false,
  selectable = false,
  className = '',
  ...props
}: CardProps) {
  const baseStyles = 'bg-white rounded-2xl p-6'
  const selectableStyles = selectable
    ? selected
      ? 'border-2 border-purple-600 bg-purple-50 border-l-4 border-l-purple-600 cursor-pointer'
      : 'border-2 border-gray-200 cursor-pointer hover:border-gray-300'
    : 'border border-gray-100 shadow-sm'

  return (
    <div className={`${baseStyles} ${selectableStyles} ${className}`} {...props}>
      {children}
    </div>
  )
}
