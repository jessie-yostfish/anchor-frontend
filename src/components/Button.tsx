import { ButtonHTMLAttributes } from 'react'
import { haptics } from '../lib/haptics'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline'
  size?: 'large' | 'medium'
  children: React.ReactNode
}

export function Button({
  variant = 'primary',
  size = 'large',
  children,
  className = '',
  onClick,
  ...props
}: ButtonProps) {
  const baseStyles = 'font-semibold rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed'

  const variantStyles = {
    primary: 'bg-gradient-to-r from-coral-500 to-coral-400 text-white hover:shadow-lg',
    secondary: 'border-2 border-purple-600 text-purple-600 bg-white hover:bg-purple-50',
    outline: 'border-2 border-gray-300 text-gray-700 bg-white hover:bg-gray-50',
  }

  const sizeStyles = {
    large: 'px-8 py-4 min-h-[48px]',
    medium: 'px-6 py-3 min-h-[48px]',
  }

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    haptics.light()
    onClick?.(e)
  }

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      onClick={handleClick}
      {...props}
    >
      {children}
    </button>
  )
}
