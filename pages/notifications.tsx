import { useState } from 'react'
import { useAuth } from '@/utils/auth'
import { FiBell, FiMail, FiSmartphone, FiToggleLeft, FiToggleRight, FiSave } from 'react-icons/fi'

export default function NotificationsPage() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState({
    email: {
      portfolio_updates: true,
      market_alerts: true,
      subscription_reminders: true,
      security_alerts: true,
      newsletter: false
    },
    push: {
      portfolio_updates: false,
      market_alerts: true,
      subscription_reminders: true,
      security_alerts: true
    }
  })
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleToggle = (type: 'email' | 'push', setting: string) => {
    setNotifications(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        [setting]: !prev[type][setting as keyof typeof prev[typeof type]]
      }
    }))
    setSaved(false)
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      // Mock API call to save notification preferences
      await new Promise(resolve => setTimeout(resolve, 1000))
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (error) {
      console.error('Failed to save notification preferences:', error)
    } finally {
      setLoading(false)
    }
  }

  const Toggle = ({ enabled, onChange }: { enabled: boolean, onChange: () => void }) => (
    <button
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        enabled ? 'bg-blue-600' : 'bg-gray-200'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          enabled ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  )

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Notification Settings</h1>
                <p className="mt-1 text-sm text-gray-600">
                  Manage how you receive notifications and updates
                </p>
              </div>
              <button
                onClick={handleSave}
                disabled={loading}
                className={`flex items-center px-4 py-2 rounded-md text-white transition-colors ${
                  saved 
                    ? 'bg-green-600' 
                    : loading 
                      ? 'bg-gray-400' 
                      : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                <FiSave className="h-4 w-4 mr-2" />
                {saved ? 'Saved!' : loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>

          <div className="p-6">
            {/* Email Notifications */}
            <div className="mb-8">
              <div className="flex items-center mb-4">
                <FiMail className="h-6 w-6 text-blue-500 mr-3" />
                <h2 className="text-xl font-semibold text-gray-900">Email Notifications</h2>
              </div>
              <p className="text-sm text-gray-600 mb-6">
                Receive notifications via email at: <strong>{user?.email}</strong>
              </p>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">Portfolio Updates</h3>
                    <p className="text-sm text-gray-600">Daily portfolio performance summaries</p>
                  </div>
                  <Toggle 
                    enabled={notifications.email.portfolio_updates}
                    onChange={() => handleToggle('email', 'portfolio_updates')}
                  />
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">Market Alerts</h3>
                    <p className="text-sm text-gray-600">Important market news and stock alerts</p>
                  </div>
                  <Toggle 
                    enabled={notifications.email.market_alerts}
                    onChange={() => handleToggle('email', 'market_alerts')}
                  />
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">Subscription Reminders</h3>
                    <p className="text-sm text-gray-600">Billing and subscription notifications</p>
                  </div>
                  <Toggle 
                    enabled={notifications.email.subscription_reminders}
                    onChange={() => handleToggle('email', 'subscription_reminders')}
                  />
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">Security Alerts</h3>
                    <p className="text-sm text-gray-600">Account security and login notifications</p>
                  </div>
                  <Toggle 
                    enabled={notifications.email.security_alerts}
                    onChange={() => handleToggle('email', 'security_alerts')}
                  />
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">Newsletter</h3>
                    <p className="text-sm text-gray-600">Weekly market insights and tips</p>
                  </div>
                  <Toggle 
                    enabled={notifications.email.newsletter}
                    onChange={() => handleToggle('email', 'newsletter')}
                  />
                </div>
              </div>
            </div>

            {/* Push Notifications */}
            <div className="mb-8">
              <div className="flex items-center mb-4">
                <FiBell className="h-6 w-6 text-purple-500 mr-3" />
                <h2 className="text-xl font-semibold text-gray-900">Push Notifications</h2>
              </div>
              <p className="text-sm text-gray-600 mb-6">
                Receive real-time notifications in your browser
              </p>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">Portfolio Updates</h3>
                    <p className="text-sm text-gray-600">Real-time portfolio changes</p>
                  </div>
                  <Toggle 
                    enabled={notifications.push.portfolio_updates}
                    onChange={() => handleToggle('push', 'portfolio_updates')}
                  />
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">Market Alerts</h3>
                    <p className="text-sm text-gray-600">Urgent market movements</p>
                  </div>
                  <Toggle 
                    enabled={notifications.push.market_alerts}
                    onChange={() => handleToggle('push', 'market_alerts')}
                  />
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">Subscription Reminders</h3>
                    <p className="text-sm text-gray-600">Payment due notifications</p>
                  </div>
                  <Toggle 
                    enabled={notifications.push.subscription_reminders}
                    onChange={() => handleToggle('push', 'subscription_reminders')}
                  />
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">Security Alerts</h3>
                    <p className="text-sm text-gray-600">Immediate security notifications</p>
                  </div>
                  <Toggle 
                    enabled={notifications.push.security_alerts}
                    onChange={() => handleToggle('push', 'security_alerts')}
                  />
                </div>
              </div>
            </div>

            {/* Additional Settings */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Additional Settings</h2>
              
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-start">
                  <FiSmartphone className="h-5 w-5 text-blue-500 mr-3 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-blue-900">Enable Browser Notifications</h3>
                    <p className="text-sm text-blue-700 mt-1">
                      Allow browser notifications for real-time alerts. You may need to grant permission when prompted.
                    </p>
                    <button 
                      onClick={() => {
                        if ('Notification' in window) {
                          Notification.requestPermission()
                        }
                      }}
                      className="mt-2 text-sm text-blue-600 hover:text-blue-800 underline"
                    >
                      Enable Browser Notifications
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
