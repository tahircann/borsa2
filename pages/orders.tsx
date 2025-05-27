import { useState, useEffect } from 'react'
import { FiDownload, FiSearch, FiChevronLeft, FiChevronRight, FiX, FiRefreshCw } from 'react-icons/fi'
import { getAllOrders, type Trade } from '@/services/ibapi'

export default function Orders() {
  const [orders, setOrders] = useState<Trade[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [limit] = useState(15)
  const [search, setSearch] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>('all')

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true)
      setError(null)
      try {
        const result = await getAllOrders(page, limit)
        console.log("Alınan order'lar:", result)
        
        if (result.trades && result.trades.length > 0) {
          console.log("Order verisi örneği:", JSON.stringify(result.trades[0], null, 2))
        }
        
        setOrders(result.trades)
        setTotal(result.total)
      } catch (error) {
        console.error('Failed to fetch orders:', error)
        setError('Order verisi alınırken bir hata oluştu.')
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [page, limit])

  const filteredOrders = orders.filter((order) => {
    const matchesSearch = 
      (order.ticker?.toLowerCase() || '').includes(search.toLowerCase()) ||
      (order.company?.toLowerCase() || '').includes(search.toLowerCase()) ||
      (order.orderId?.toLowerCase() || '').includes(search.toLowerCase())
    
    const matchesStatus = filterStatus === 'all' || order.status?.toLowerCase() === filterStatus.toLowerCase()
    
    return matchesSearch && matchesStatus
  })

  const totalPages = Math.ceil(total / limit)

  const handleCancelOrder = (orderId: string) => {
    console.log(`Cancel order: ${orderId}`)
    // API call to cancel the order would go here
  }

  const handleRefresh = () => {
    setPage(1)
    window.location.reload() // Simple refresh for now
  }

  // Format execution time
  const formatExecutionTime = (timeStr?: string) => {
    if (!timeStr) return 'N/A'
    
    // API'den gelen format: "231211180049" (YYMMDDHHMMSS)
    if (timeStr.length === 12) {
      const year = '20' + timeStr.substring(0, 2)
      const month = timeStr.substring(2, 4)
      const day = timeStr.substring(4, 6)
      const hour = timeStr.substring(6, 8)
      const minute = timeStr.substring(8, 10)
      const second = timeStr.substring(10, 12)
      
      const date = new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}`)
      return date.toLocaleString('tr-TR')
    }
    
    return timeStr
  }

  // Status için renkler
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'filled':
        return 'bg-blue-100 text-blue-800'
      case 'active':
      case 'submitted':
      case 'presubmitted':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-gray-100 text-gray-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">All Orders</h1>
        <div className="flex items-center space-x-2">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by ticker, company, or order ID"
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-80"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2"
          >
            <option value="all">All Statuses</option>
            <option value="filled">Filled</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="cancelled">Cancelled</option>
            <option value="rejected">Rejected</option>
          </select>
          <button
            onClick={handleRefresh}
            className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md flex items-center"
          >
            <FiRefreshCw className="mr-2" />
            Refresh
          </button>
          <button
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 px-4 rounded-md flex items-center"
          >
            <FiDownload className="mr-2" />
            Export
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
          <p>{error}</p>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order ID
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ticker
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Company
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Side
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order Type
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Qty (Filled/Total)
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Avg Price
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Time in Force
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Execution
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={11} className="px-4 py-4 text-center text-sm text-gray-500">
                    Loading orders...
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={11} className="px-4 py-4 text-center text-sm text-gray-500">
                    {orders.length === 0 
                      ? "No orders found. Make sure you're connected to Interactive Brokers."
                      : "No orders match the current filter criteria."
                    }
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                      {order.orderId}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{order.ticker || 'Unknown'}</div>
                      <div className="text-xs text-gray-500">{order.secType || 'STK'}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 max-w-xs truncate">
                      {order.company || order.companyName || order.description1 || 'Unknown'}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          order.side === 'BUY'
                            ? 'bg-green-100 text-green-800'
                            : order.side === 'SELL'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {order.side || 'N/A'}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.orderType || order.origOrderType || 'N/A'}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex flex-col">
                        <span>{order.filledQuantity || 0} / {order.totalSize || 0}</span>
                        {order.remainingQuantity !== undefined && (
                          <span className="text-xs text-gray-400">
                            Remaining: {order.remainingQuantity}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.avgPrice ? `$${order.avgPrice}` : 'N/A'}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status || '')}`}
                      >
                        {order.status || order.order_ccp_status || 'Unknown'}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.timeInForce || 'N/A'}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatExecutionTime(order.lastExecutionTime)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-center">
                      <div className="flex justify-center space-x-2">
                        {order.canCancel ? (
                          <button 
                            onClick={() => handleCancelOrder(order.orderId)}
                            className="text-red-600 hover:text-red-900 p-1"
                            title="Cancel Order"
                          >
                            <FiX className="h-4 w-4" />
                          </button>
                        ) : (
                          <span className="text-gray-400 p-1">-</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="flex-1 flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{filteredOrders.length > 0 ? (page - 1) * limit + 1 : 0}</span> to{' '}
                <span className="font-medium">
                  {Math.min(page * limit, filteredOrders.length)}
                </span>{' '}
                of <span className="font-medium">{filteredOrders.length}</span> filtered results
                {total > 0 && (
                  <span className="text-gray-500"> ({total} total orders)</span>
                )}
              </p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                  page === 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                <FiChevronLeft className="h-4 w-4 mr-2" />
                Previous
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages || totalPages === 0}
                className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                  page === totalPages || totalPages === 0
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Next
                <FiChevronRight className="h-4 w-4 ml-2" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
} 