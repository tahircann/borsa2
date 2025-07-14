import { useState, useEffect } from 'react'
import { useAuth } from '@/utils/auth'
import { FiCreditCard, FiDownload, FiCalendar, FiDollarSign, FiRefreshCw } from 'react-icons/fi'

export default function PaymentHistoryPage() {
  const { user } = useAuth()
  const [payments, setPayments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    if (user?.email) {
      fetchPaymentHistory()
    }
  }, [user])

  const fetchPaymentHistory = async () => {
    setRefreshing(true)
    try {
      const response = await fetch('/api/gumroad/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user?.email })
      })
      
      const result = await response.json()
      
      if (result.subscriptionInfo?.purchases) {
        setPayments(result.subscriptionInfo.purchases)
      }
    } catch (error) {
      console.error('Failed to fetch payment history:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const downloadInvoice = (payment: any) => {
    // Create a simple invoice text file
    const invoiceData = `
BORSA ANALYTICS - INVOICE
=======================

Product: ${payment.productName}
Purchase Date: ${formatDate(payment.purchaseDate)}
Amount: $${payment.price}
Product ID: ${payment.productId}
Customer Email: ${user?.email}

Thank you for your purchase!
    `
    
    const blob = new Blob([invoiceData], { type: 'text/plain' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `invoice-${payment.productId}-${payment.purchaseDate}.txt`
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Payment History</h1>
                <p className="mt-1 text-sm text-gray-600">
                  View and download your payment history and invoices
                </p>
              </div>
              <button
                onClick={fetchPaymentHistory}
                disabled={refreshing}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                <FiRefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>

          <div className="p-6">
            {payments.length === 0 ? (
              <div className="text-center py-12">
                <FiCreditCard className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Payment History</h3>
                <p className="text-gray-600">
                  You haven't made any purchases yet. Subscribe to premium to get started!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Summary */}
                <div className="bg-blue-50 rounded-lg p-4 mb-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{payments.length}</div>
                      <div className="text-sm text-blue-800">Total Purchases</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        ${payments.reduce((sum, p) => sum + p.price, 0).toFixed(2)}
                      </div>
                      <div className="text-sm text-blue-800">Total Spent</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {payments.length > 0 ? formatDate(payments[0].purchaseDate) : 'N/A'}
                      </div>
                      <div className="text-sm text-blue-800">Latest Purchase</div>
                    </div>
                  </div>
                </div>

                {/* Payment List */}
                <div className="space-y-4">
                  <h2 className="text-lg font-medium text-gray-900">Payment Details</h2>
                  
                  {payments.map((payment, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center mb-2">
                            <FiCreditCard className="h-5 w-5 text-green-500 mr-3" />
                            <h3 className="text-lg font-semibold text-gray-900">
                              {payment.productName}
                            </h3>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                            <div className="flex items-center">
                              <FiCalendar className="h-4 w-4 mr-2" />
                              <span>{formatDate(payment.purchaseDate)}</span>
                            </div>
                            
                            <div className="flex items-center">
                              <FiDollarSign className="h-4 w-4 mr-2" />
                              <span>${payment.price}</span>
                            </div>
                            
                            <div className="flex items-center">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Completed
                              </span>
                            </div>
                          </div>
                          
                          <div className="mt-3 text-xs text-gray-500">
                            Product ID: {payment.productId}
                          </div>
                        </div>
                        
                        <div className="ml-6">
                          <button
                            onClick={() => downloadInvoice(payment)}
                            className="flex items-center px-3 py-2 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
                          >
                            <FiDownload className="h-4 w-4 mr-1" />
                            Download
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
