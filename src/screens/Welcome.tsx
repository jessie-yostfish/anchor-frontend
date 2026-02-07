import { useNavigate } from 'react-router-dom'
import { Anchor, Shield, Users, FileText } from 'lucide-react'
import { Button, Card, PrivacyNotice } from '../components'

export function Welcome() {
  const navigate = useNavigate()

  const features = [
    {
      icon: Shield,
      title: 'Trauma-Informed Support',
      description: 'Designed with your wellbeing in mind at every step',
    },
    {
      icon: Users,
      title: 'Know Your Rights',
      description: 'Understanding your role in dependency court proceedings',
    },
    {
      icon: FileText,
      title: 'Track Your Case',
      description: 'Keep important dates, documents, and contacts organized',
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      <div className="max-w-md mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-600 to-purple-400 rounded-3xl mb-6 shadow-lg">
            <Anchor className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Anchor</h1>
          <p className="text-lg text-gray-600">
            Your guide through California dependency court
          </p>
        </div>

        <div className="space-y-4 mb-8">
          {features.map((feature, index) => (
            <Card key={index}>
              <div className="flex items-start gap-4">
                <div className="p-3 bg-purple-100 rounded-xl">
                  <feature.icon className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-gray-600">{feature.description}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="mb-8">
          <PrivacyNotice />
        </div>

        <div className="space-y-3">
          <Button
            onClick={() => navigate('/auth?mode=signup')}
            className="w-full"
            size="large"
          >
            Get Started
          </Button>
          <Button
            onClick={() => navigate('/auth?mode=signin')}
            variant="secondary"
            className="w-full"
            size="large"
          >
            I Already Have an Account
          </Button>
        </div>

        <p className="text-center text-xs text-gray-500 mt-8">
          Free and confidential support for families in California
        </p>
      </div>
    </div>
  )
}
