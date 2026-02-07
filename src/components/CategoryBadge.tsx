interface CategoryBadgeProps {
  category: string
  size?: 'sm' | 'md' | 'lg'
}

export function CategoryBadge({ category, size = 'md' }: CategoryBadgeProps) {
  const getCategoryColor = (cat: string) => {
    const normalized = cat.toLowerCase()

    if (normalized.includes('court') || normalized.includes('hearing')) {
      return 'bg-purple-100 text-purple-700'
    }
    if (normalized.includes('legal') || normalized.includes('rights')) {
      return 'bg-blue-100 text-blue-700'
    }
    if (normalized.includes('document') || normalized.includes('filing')) {
      return 'bg-amber-100 text-amber-700'
    }
    if (normalized.includes('support') || normalized.includes('resource')) {
      return 'bg-coral-100 text-coral-700'
    }
    if (normalized.includes('important') || normalized.includes('urgent')) {
      return 'bg-red-100 text-red-700'
    }
    if (normalized.includes('question') || normalized.includes('ask')) {
      return 'bg-teal-100 text-teal-700'
    }
    if (normalized.includes('progress') || normalized.includes('update')) {
      return 'bg-green-100 text-green-700'
    }
    if (normalized.includes('meeting') || normalized.includes('appointment')) {
      return 'bg-orange-100 text-orange-700'
    }

    return 'bg-gray-100 text-gray-700'
  }

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 text-xs',
    lg: 'px-4 py-2 text-sm',
  }

  return (
    <span
      className={`inline-block rounded-full font-semibold ${getCategoryColor(category)} ${sizeClasses[size]}`}
    >
      {category}
    </span>
  )
}
