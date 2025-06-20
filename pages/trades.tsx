import { useState, useEffect } from 'react'
import { FiDownload, FiSearch, FiChevronLeft, FiChevronRight, FiX } from 'react-icons/fi'
import { getTrades, type Trade } from '@/services/ibapi'

export default function Trades() {
  const [trades, setTrades] = useState<Trade[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [search, setSearch] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTrades = async () => {
      setLoading(true)
      setError(null)
      try {
        const result = await getTrades(page, limit)
        console.log("Alınan işlemler:", result)
        
        // Debug received trades data
        if (result.trades && result.trades.length > 0) {
          console.log("İşlem verisi örneği:", JSON.stringify(result.trades[0], null, 2))
          console.log("Company bilgileri:", result.trades.map(t => ({ 
            id: t.id, 
            ticker: t.ticker, 
            company: t.company,
            side: t.side,
            avgPrice: t.avgPrice
          })))
        }
        
        setTrades(result.trades)
        setTotal(result.total)
      } catch (error) {
        console.error('Failed to fetch trades:', error)
        setError('İşlem verisi alınırken bir hata oluştu.')
      } finally {
        setLoading(false)
      }
    }

    fetchTrades()
  }, [page, limit])

  const filteredTrades = trades.filter(
    (trade) =>
      (trade.ticker?.toLowerCase() || '').includes(search.toLowerCase()) ||
      (trade.company?.toLowerCase() || '').includes(search.toLowerCase())
  )

  const totalPages = Math.ceil(total / limit)

  const handleCancelOrder = (orderId: string) => {
    console.log(`Cancel order: ${orderId}`)
    // API call to cancel the order would go here
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

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Orders (Filled)</h1>
        <div className="flex items-center space-x-2">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by ticker or company"
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-64"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
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
                  Avg Price
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Filled Qty
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Size
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Execution Time
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cancel
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={11} className="px-4 py-4 text-center text-sm text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : filteredTrades.length === 0 ? (
                <tr>
                  <td colSpan={11} className="px-4 py-4 text-center text-sm text-gray-500">
                    API'ye bağlanılamadı veya işlem verisi bulunamadı. Lütfen Interactive Brokers hesabınıza bağlı olduğunuzdan emin olun.
                  </td>
                </tr>
              ) : (
                filteredTrades.map((trade) => (
                  <tr key={trade.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {trade.orderId}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{trade.ticker || 'Unknown'}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {trade.company || trade.companyName || 'Unknown'}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          trade.side === 'BUY'
                            ? 'bg-green-100 text-green-800'
                            : trade.side === 'SELL'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {trade.side || 'N/A'}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {trade.orderType || trade.origOrderType || 'N/A'}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {trade.avgPrice ? `$${trade.avgPrice}` : 'N/A'}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {trade.filledQuantity || '0'}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {trade.totalSize || '0'}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          trade.status === 'Filled'
                            ? 'bg-blue-100 text-blue-800'
                            : trade.status === 'Active'
                            ? 'bg-green-100 text-green-800'
                            : trade.status === 'Cancelled'
                            ? 'bg-gray-100 text-gray-800'
                            : trade.status === 'Rejected'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {trade.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatExecutionTime(trade.lastExecutionTime)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-center">
                      {trade.canCancel ? (
                        <button 
                          onClick={() => handleCancelOrder(trade.orderId)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <FiX className="h-5 w-5" />
                        </button>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
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
                Showing <span className="font-medium">{total > 0 ? (page - 1) * limit + 1 : 0}</span> to{' '}
                <span className="font-medium">
                  {Math.min(page * limit, total)}
                </span>{' '}
                of <span className="font-medium">{total}</span> results
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