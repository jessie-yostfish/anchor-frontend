import { useState } from 'react'
import { LucideIcon, Eye, EyeOff } from 'lucide-react'

interface InputFieldProps {
  label: string
  icon?: LucideIcon
  type?: string
  placeholder?: string
  value: string
  onChange: (value: string) => void
  error?: string
  disabled?: boolean
  multiline?: boolean
  rows?: number
}

export function InputField({
  label,
  icon: Icon,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  disabled = false,
  multiline = false,
  rows = 4,
}: InputFieldProps) {
  const [showPassword, setShowPassword] = useState(false)

  const isPassword = type === 'password'
  const inputType = isPassword && showPassword ? 'text' : type

  const baseClasses = `w-full rounded-xl border-2 px-4 py-3 focus:outline-none transition-colors ${
    Icon ? 'pl-12' : ''
  } ${error ? 'border-red-300 focus:border-red-600 focus:ring-4 focus:ring-red-100' : 'border-gray-200 focus:border-purple-600 focus:ring-4 focus:ring-purple-100'} ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`

  return (
    <div className="w-full">
      <label className="block mb-2 text-sm font-semibold text-gray-700">{label}</label>
      <div className="relative">
        {Icon && (
          <div className="absolute left-4 top-3.5 pointer-events-none">
            <Icon className="w-5 h-5 text-gray-400" />
          </div>
        )}

        {multiline ? (
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            rows={rows}
            className={baseClasses}
          />
        ) : (
          <input
            type={inputType}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            className={baseClasses}
          />
        )}

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600 transition-colors"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        )}
      </div>

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  )
}
