import { useState, useEffect } from 'react'
import { useAuth } from '@/utils/auth'
import { FiCreditCard, FiUser, FiCalendar, FiDollarSign, FiCheck, FiX, FiRefreshCw } from 'react-icons/fi'

export default function SubscriptionManagePage() {
  const { user } = useAuth()
  const [subscriptionStatus, setSubscriptionStatus] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [verifying, setVerifying] = useState(false)

  useEffect(() => {
    if (user?.email) {
      checkSubscriptionStatus()
    }
  }, [user])

  const checkSubscriptionStatus = async () => {
    setVerifying(true)
    try {
      const response = await fetch('/api/gumroad/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user?.email })
      })
      
      const result = await response.json()
      setSubscriptionStatus(result)
    } catch (error) {
      console.error('Failed to check subscription:', error)
    } finally {
      setLoading(false)
      setVerifying(false)
    }
  }

  const handleSubscribe = async () => {
    try {
      const response = await fetch('/api/gumroad/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: user?.email,
          returnUrl: window.location.origin + '/subscription-success'
        })
      })
      
      const result = await response.json()
      
      if (result.success && result.paymentUrl) {
        window.open(result.paymentUrl, '_blank')
      }
    } catch (error) {
      console.error('Failed to create payment:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">Subscription Management</h1>
            <p className="mt-1 text-sm text-gray-600">
              Manage your premium subscription and billing information
            </p>
          </div>

          <div className="p-6">
            {/* Current Status */}
            <div className="mb-8">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Current Status</h2>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-3 ${
                      subscriptionStatus?.hasAccess ? 'bg-green-500' : 'bg-red-500'
                    }`}></div>
                    <span className="font-medium">
                      {subscriptionStatus?.hasAccess ? 'Premium Active' : 'No Active Subscription'}
                    </span>
                  </div>
                  <button
                    onClick={checkSubscriptionStatus}
                    disabled={verifying}
                    className="flex items-center px-3 py-1 text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50"
                  >
                    <FiRefreshCw className={`h-4 w-4 mr-1 ${verifying ? 'animate-spin' : ''}`} />
                    Refresh
                  </button>
                </div>
              </div>
            </div>

            {/* Subscription Details */}
            {subscriptionStatus?.hasAccess ? (
              <div className="mb-8">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Subscription Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="flex items-center">
                      <FiCheck className="h-5 w-5 text-green-500 mr-3" />
                      <div>
                        <h3 className="font-medium text-green-900">Active Subscription</h3>
                        <p className="text-sm text-green-700">You have access to all premium features</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex items-center">
                      <FiUser className="h-5 w-5 text-blue-500 mr-3" />
                      <div>
                        <h3 className="font-medium text-blue-900">Account Email</h3>
                        <p className="text-sm text-blue-700">{user?.email}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {subscriptionStatus?.subscriptionInfo?.purchases && (
                  <div className="mt-6">
                    <h3 className="text-md font-medium text-gray-900 mb-3">Purchase History</h3>
                    <div className="space-y-3">
                      {subscriptionStatus.subscriptionInfo.purchases.map((purchase: any, index: number) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium text-gray-900">{purchase.productName}</h4>
                              <p className="text-sm text-gray-600">
                                Purchased: {new Date(purchase.purchaseDate).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium text-gray-900">${purchase.price}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="mb-8">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Subscribe to Premium</h2>
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
                  <div className="text-center">
                    <FiCreditCard className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      Unlock Premium Features
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Get access to advanced portfolio analytics, real-time data, and premium insights
                    </p>
                    <button
                      onClick={handleSubscribe}
                      className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Subscribe Now
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Features */}
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">Premium Features</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <FiDollarSign className="h-8 w-8 text-green-500 mb-3" />
                  <h3 className="font-medium text-gray-900">Real-time Portfolio</h3>
                  <p className="text-sm text-gray-600">Live portfolio tracking and performance metrics</p>
                </div>
                
                <div className="border border-gray-200 rounded-lg p-4">
                  <FiCalendar className="h-8 w-8 text-blue-500 mb-3" />
                  <h3 className="font-medium text-gray-900">Advanced Analytics</h3>
                  <p className="text-sm text-gray-600">Detailed sector analysis and risk insights</p>
                </div>
                
                <div className="border border-gray-200 rounded-lg p-4">
                  <FiCheck className="h-8 w-8 text-purple-500 mb-3" />
                  <h3 className="font-medium text-gray-900">Stock Rankings</h3>
                  <p className="text-sm text-gray-600">AI-powered stock recommendations and rankings</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
