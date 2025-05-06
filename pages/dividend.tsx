import { useState, useEffect } from 'react'
import { FiSearch, FiChevronLeft, FiChevronRight, FiCalendar } from 'react-icons/fi'
import { getDividends, type Dividend } from '@/services/ibapi'
import { format } from 'date-fns'
import { formatCurrency } from '../utils/formatters'

export default function DividendPage() {
  const [dividends, setDividends] = useState<Dividend[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [search, setSearch] = useState('')

  useEffect(() => {
    const fetchDividends = async () => {
      setLoading(true)
      try {
        const result = await getDividends(page, limit)
        setDividends(result.dividends)
        setTotal(result.total)
      } catch (error) {
        console.error('Failed to fetch dividends:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDividends()
  }, [page, limit])

  // Calculate summary data
  const totalDividends = dividends.reduce((sum, dividend) => sum + dividend.total, 0)
  
  const filteredDividends = dividends.filter(
    (dividend) =>
      dividend.symbol.toLowerCase().includes(search.toLowerCase()) ||
      dividend.name.toLowerCase().includes(search.toLowerCase())
  )

  const totalPages = Math.ceil(total / limit)

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Dividend History</h1>
        <div className="flex items-center space-x-2">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by symbol or name"
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-64"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-sm text-gray-500 mb-1">Total Dividends</div>
          <div className="text-2xl font-semibold text-primary-600">
            {formatCurrency(totalDividends)}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-sm text-gray-500 mb-1">Number of Payments</div>
          <div className="text-2xl font-semibold">
            {total}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-sm text-gray-500 mb-1">Average Payment</div>
          <div className="text-2xl font-semibold">
            {total > 0 ? formatCurrency(totalDividends / total) : "$0.00"}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ex-Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Symbol
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Shares
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount Per Share
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : filteredDividends.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                    No dividends found
                  </td>
                </tr>
              ) : (
                filteredDividends.map((dividend) => (
                  <tr key={dividend.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <FiCalendar className="mr-2 text-gray-400" />
                        {format(new Date(dividend.exDate), 'MMM dd, yyyy')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(new Date(dividend.paymentDate), 'MMM dd, yyyy')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{dividend.symbol}</div>
                      <div className="text-sm text-gray-500">{dividend.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {dividend.shares}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatCurrency(dividend.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatCurrency(dividend.total)}
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
                Showing <span className="font-medium">{(page - 1) * limit + 1}</span> to{' '}
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
                disabled={page === totalPages}
                className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                  page === totalPages
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