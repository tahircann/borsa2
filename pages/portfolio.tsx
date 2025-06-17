import { useState, useEffect } from 'react'
import { FiTrendingUp, FiTrendingDown, FiExternalLink } from 'react-icons/fi'
import { getPortfolio, type Portfolio, type Position } from '@/services/ibapi'
import { formatCurrency, formatPercent } from '../utils/formatters'
import PremiumGuard from '../components/PremiumGuard'

// Helper function to format purchase date
const formatPurchaseDate = (purchaseDate?: string): string => {
  if (!purchaseDate) return '-';
  try {
    const date = new Date(purchaseDate);
    if (isNaN(date.getTime())) return '-';
    return date.toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  } catch {
    return '-';
  }
};

// Helper function to format dividend information
const formatDividend = (dividendYield?: number, marketValue?: number): string => {
  if (!dividendYield || dividendYield === 0) return '-';
  
  const percentage = (dividendYield * 100).toFixed(2);
  if (marketValue) {
    const annualDividend = marketValue * dividendYield;
    return `${percentage}% ($${annualDividend.toFixed(2)})`;
  }
  return `${percentage}%`;
};

export default function PortfolioPage() {
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sortColumn, setSortColumn] = useState('marketValue')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [isAdmin, setIsAdmin] = useState(false) // Admin mode for editing dates

  // Check if user is admin (you can implement your own authentication logic)
  useEffect(() => {
    // For now, we'll check if user is admin based on local storage or environment
    // You can replace this with your actual authentication check
    const adminMode = localStorage.getItem('adminMode') === 'true' || process.env.NODE_ENV === 'development';
    setIsAdmin(adminMode);
  }, []);

  useEffect(() => {
    const fetchPortfolio = async () => {
      setLoading(true)
      setError(null)
      
      try {
        const result = await getPortfolio();
        setPortfolio(result)
        setError(null)
      } catch (error) {
        console.error('Failed to fetch portfolio:', error)
        
        if (error instanceof Error) {
          if (error.message.includes('timeout')) {
            setError('Portfolio data request timed out. Please check your IBKR Gateway/TWS connection and try again.')
          } else {
            setError(`Failed to load portfolio data: ${error.message}`)
          }
        } else {
          setError('Failed to load portfolio data. Please check your IBKR Gateway/TWS connection.')
        }
        
        setPortfolio(null)
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

  // Admin functions for editing dates (simplified version)
  const handleEditPurchaseDate = (symbol: string, newDate: string) => {
    if (!isAdmin || !portfolio) return;
    
    const updatedPositions = portfolio.positions.map(pos => 
      pos.symbol === symbol ? { ...pos, purchaseDate: newDate } : pos
    );
    
    setPortfolio({ ...portfolio, positions: updatedPositions });
    // You can add API call here to save the changes
  };

  const handleEditSoldPercentage = (symbol: string, newPercentage: number) => {
    if (!isAdmin || !portfolio) return;
    
    const updatedPositions = portfolio.positions.map(pos => 
      pos.symbol === symbol ? { ...pos, salePercentage: newPercentage } : pos
    );
    
    setPortfolio({ ...portfolio, positions: updatedPositions });
    // You can add API call here to save the changes
  };

  return (
    <PremiumGuard>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Portfolio</h1>
          {isAdmin && (
            <p className="text-sm text-orange-600 mt-1">Admin Mode: Purchase dates and sold percentages can be edited</p>
          )}
        </div>
        {isAdmin && (
          <button
            onClick={() => {
              const newAdminMode = !isAdmin;
              setIsAdmin(newAdminMode);
              localStorage.setItem('adminMode', newAdminMode.toString());
            }}
            className="px-3 py-2 text-sm bg-orange-500 hover:bg-orange-600 text-white rounded-md"
          >
            Toggle Admin Mode
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          <h3 className="font-semibold">Error Loading Portfolio</h3>
          <p className="text-sm mt-1">{error}</p>
        </div>
      )}

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
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dividend
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Purchase Date
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <span title="Percentage of total shares purchased that have been sold">Sold</span>
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Country
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={10} className="px-6 py-4 text-center text-sm text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : sortedPositions.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-6 py-4 text-center text-sm text-gray-500">
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                      {formatDividend(position.dividendYield, position.marketValue)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                      <div className="flex items-center justify-center">
                        <span className="mr-2">{formatPurchaseDate(position.purchaseDate)}</span>
                        {isAdmin && (
                          <input
                            type="date"
                            value={position.purchaseDate || ''}
                            onChange={(e) => handleEditPurchaseDate(position.symbol, e.target.value)}
                            className="border border-gray-300 rounded-md p-1"
                          />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                      <div className="flex items-center justify-center">
                        {position.salePercentage && position.salePercentage > 0 ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            {position.salePercentage}%
                          </span>
                        ) : (
                          <span className="text-gray-400">0%</span>
                        )}
                        {isAdmin && (
                          <input
                            type="number"
                            value={position.salePercentage || ''}
                            onChange={(e) => handleEditSoldPercentage(position.symbol, Number(e.target.value))}
                            className="border border-gray-300 rounded-md p-1 ml-2"
                          />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                      {position.country || '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </PremiumGuard>
  )
} 