import { useState } from 'react'
import { useAuth } from '@/utils/auth'
import { FiShield, FiLock, FiMail, FiKey, FiCheck, FiAlertTriangle, FiSave } from 'react-icons/fi'

export default function AccountSecurityPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('password')
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [emailForm, setEmailForm] = useState({
    newEmail: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null)

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage({type: 'error', text: 'New passwords do not match'})
      return
    }

    if (passwordForm.newPassword.length < 8) {
      setMessage({type: 'error', text: 'Password must be at least 8 characters long'})
      return
    }

    setLoading(true)
    try {
      // Mock password change API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      setMessage({type: 'success', text: 'Password updated successfully'})
      setPasswordForm({currentPassword: '', newPassword: '', confirmPassword: ''})
    } catch (error) {
      setMessage({type: 'error', text: 'Failed to update password'})
    } finally {
      setLoading(false)
    }
  }

  const handleEmailChange = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!emailForm.newEmail.includes('@')) {
      setMessage({type: 'error', text: 'Please enter a valid email address'})
      return
    }

    setLoading(true)
    try {
      // Mock email change API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      setMessage({type: 'success', text: 'Email update request sent. Please check your new email for verification.'})
      setEmailForm({newEmail: '', password: ''})
    } catch (error) {
      setMessage({type: 'error', text: 'Failed to update email'})
    } finally {
      setLoading(false)
    }
  }

  const securityScore = 75 // Mock security score

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">Account Security</h1>
            <p className="mt-1 text-sm text-gray-600">
              Manage your account security settings and password
            </p>
          </div>

          <div className="p-6">
            {/* Security Score */}
            <div className="mb-8">
              <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Security Score</h2>
                    <p className="text-sm text-gray-600">Your account security strength</p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-green-600">{securityScore}%</div>
                    <div className="text-sm text-gray-600">Good</div>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${securityScore}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Security Checklist */}
            <div className="mb-8">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Security Checklist</h2>
              <div className="space-y-3">
                <div className="flex items-center p-3 bg-green-50 rounded-lg">
                  <FiCheck className="h-5 w-5 text-green-500 mr-3" />
                  <span className="text-green-800">Account verified with email</span>
                </div>
                <div className="flex items-center p-3 bg-green-50 rounded-lg">
                  <FiCheck className="h-5 w-5 text-green-500 mr-3" />
                  <span className="text-green-800">Strong password in use</span>
                </div>
                <div className="flex items-center p-3 bg-yellow-50 rounded-lg">
                  <FiAlertTriangle className="h-5 w-5 text-yellow-500 mr-3" />
                  <span className="text-yellow-800">Two-factor authentication not enabled</span>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="mb-6">
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                  <button
                    onClick={() => setActiveTab('password')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'password'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <FiLock className="h-4 w-4 inline mr-2" />
                    Change Password
                  </button>
                  <button
                    onClick={() => setActiveTab('email')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'email'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <FiMail className="h-4 w-4 inline mr-2" />
                    Change Email
                  </button>
                </nav>
              </div>
            </div>

            {/* Message */}
            {message && (
              <div className={`mb-6 p-4 rounded-md ${
                message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
              }`}>
                {message.text}
              </div>
            )}

            {/* Password Change Form */}
            {activeTab === 'password' && (
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Change Password</h3>
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Current Password</label>
                    <input
                      type="password"
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">New Password</label>
                    <input
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                      minLength={8}
                    />
                    <p className="mt-1 text-xs text-gray-500">Must be at least 8 characters long</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Confirm New Password</label>
                    <input
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    <FiSave className="h-4 w-4 mr-2" />
                    {loading ? 'Updating...' : 'Update Password'}
                  </button>
                </form>
              </div>
            )}

            {/* Email Change Form */}
            {activeTab === 'email' && (
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Change Email Address</h3>
                <div className="mb-4 p-3 bg-blue-50 rounded-md">
                  <div className="flex items-center">
                    <FiMail className="h-4 w-4 text-blue-500 mr-2" />
                    <span className="text-sm text-blue-800">Current: {user?.email}</span>
                  </div>
                </div>
                
                <form onSubmit={handleEmailChange} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">New Email Address</label>
                    <input
                      type="email"
                      value={emailForm.newEmail}
                      onChange={(e) => setEmailForm({...emailForm, newEmail: e.target.value})}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
                    <input
                      type="password"
                      value={emailForm.password}
                      onChange={(e) => setEmailForm({...emailForm, password: e.target.value})}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                    <p className="mt-1 text-xs text-gray-500">Enter your current password to confirm</p>
                  </div>
                  
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    <FiSave className="h-4 w-4 mr-2" />
                    {loading ? 'Updating...' : 'Update Email'}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
