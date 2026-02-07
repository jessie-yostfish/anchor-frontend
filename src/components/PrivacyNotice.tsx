import { Lock } from 'lucide-react'

export function PrivacyNotice() {
  return (
    <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-xl border border-amber-200">
      <Lock className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
      <div className="text-sm text-gray-600">
        <p className="font-semibold text-gray-700 mb-1">
          Your answers are private and secure
        </p>
        <p>We only ask what we need to help guide you</p>
      </div>
    </div>
  )
}
