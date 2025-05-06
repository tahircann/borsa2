import { useState, useEffect } from 'react'
import { FiTrendingUp, FiTrendingDown, FiExternalLink } from 'react-icons/fi'
import { getPortfolio, type Portfolio, type Position } from '@/services/ibapi'
import { formatCurrency, formatPercent } from '../utils/formatters'

export default function PortfolioPage() {
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null)
  const [loading, setLoading] = useState(true)
  const [sortColumn, setSortColumn] = useState('marketValue')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')

  useEffect(() => {
    const fetchPortfolio = async () => {
      setLoading(true)
      try {
        const result = await getPortfolio()
        setPortfolio(result)
      } catch (error) {
        console.error('Failed to fetch portfolio:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPortfolio()
  }, [])

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortDirection('desc')
    }
  }

  const sortedPositions = portfolio?.positions
    ? [...portfolio.positions].sort((a: Position, b: Position) => {
        const aValue = a[sortColumn as keyof Position]
        const bValue = b[sortColumn as keyof Position]

        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return sortDirection === 'asc' ? aValue - bValue : bValue - aValue
        }

        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sortDirection === 'asc'
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue)
        }

        return 0
      })
    : []

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Portfolio</h1>
        {portfolio && (
          <div className="flex items-center space-x-6">
            <div>
              <div className="text-sm text-gray-500">Total Value</div>
              <div className="text-xl font-semibold">{formatCurrency(portfolio.totalValue)}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Cash</div>
              <div className="text-xl font-semibold">{formatCurrency(portfolio.cash)}</div>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('symbol')}
                >
                  Symbol
                  {sortColumn === 'symbol' && (
                    <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('quantity')}
                >
                  Quantity
                  {sortColumn === 'quantity' && (
                    <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </th>
                <th
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('averageCost')}
                >
                  Avg Cost
                  {sortColumn === 'averageCost' && (
                    <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </th>
                <th
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('marketValue')}
                >
                  Market Value
                  {sortColumn === 'marketValue' && (
                    <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </th>
                <th
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('unrealizedPnL')}
                >
                  Profit / Loss
                  {sortColumn === 'unrealizedPnL' && (
                    <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </th>
                <th
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('percentChange')}
                >
                  % Change
                  {sortColumn === 'percentChange' && (
                    <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : sortedPositions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                    No positions found
                  </td>
                </tr>
              ) : (
                sortedPositions.map((position) => (
                  <tr key={position.symbol} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="font-medium text-gray-900">{position.symbol}</div>
                        <a
                          href={`https://finance.yahoo.com/quote/${position.symbol}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-2 text-gray-400 hover:text-gray-600"
                        >
                          <FiExternalLink size={14} />
                        </a>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {position.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                      {position.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                      ${position.averageCost.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                      {formatCurrency(position.marketValue)}
                    </td>
                    <td
                      className={`px-6 py-4 whitespace-nowrap text-sm text-right font-medium ${
                        position.unrealizedPnL >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {formatCurrency(Math.abs(position.unrealizedPnL))}
                    </td>
                    <td
                      className={`px-6 py-4 whitespace-nowrap text-sm text-right font-medium ${
                        position.percentChange >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      <div className="flex items-center justify-end">
                        {position.percentChange >= 0 ? (
                          <FiTrendingUp className="mr-1 h-4 w-4" />
                        ) : (
                          <FiTrendingDown className="mr-1 h-4 w-4" />
                        )}
                        {formatPercent(position.percentChange)}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
} 