interface LoadingSpinnerProps {
  text?: string
  fullScreen?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export function LoadingSpinner({ text = 'Loading...', fullScreen = true, size = 'md' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-6 h-6 border-2',
    md: 'w-10 h-10 border-3',
    lg: 'w-16 h-16 border-4',
  }

  const spinner = (
    <div className="flex flex-col items-center justify-center gap-4">
      <div
        className={`${sizeClasses[size]} border-purple-600 border-t-transparent rounded-full animate-spin`}
      />
      {text && <p className="text-gray-600 font-medium">{text}</p>}
    </div>
  )

  if (fullScreen) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
        {spinner}
      </div>
    )
  }

  return spinner
}
