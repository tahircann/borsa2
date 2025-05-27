import { useState, useEffect } from 'react'
import { FiTrendingUp, FiTrendingDown, FiExternalLink } from 'react-icons/fi'
import { getPortfolio, type Portfolio, type Position } from '@/services/ibapi'
import { formatCurrency, formatPercent } from '../utils/formatters'

// Helper function to check if a stock was purchased within the last 24 hours
const isNewBuy = (purchaseDate?: string): boolean => {
  if (!purchaseDate) return false;
  try {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const purchaseDateTime = new Date(purchaseDate);
    return purchaseDateTime > oneDayAgo;
  } catch (error) {
    console.error('Error parsing purchase date:', purchaseDate, error);
    return false;
  }
};

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
  const [dataSource, setDataSource] = useState<string>('unknown')
  const [sortColumn, setSortColumn] = useState('marketValue')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')

  useEffect(() => {
    const fetchPortfolio = async () => {
      setLoading(true)
      setError(null)
      
      // Set a timeout for the API call
      const timeoutId = setTimeout(() => {
        setError('Portfolio data is taking longer than expected. Please check your API connections.')
      }, 10000);
      
      try {
        const result = await Promise.race([
          getPortfolio(),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Portfolio fetch timeout after 20 seconds')), 20000)
          )
        ]) as Portfolio;
        
        clearTimeout(timeoutId);
        setPortfolio(result)
        setError(null)
        
        // Determine data source based on whether we have real API data
        const hasRealDividendData = result.positions.some(pos => 
          pos.dividendYield !== undefined && pos.dividendYield !== null && pos.dividendYield > 0
        );
        const hasRealCountryData = result.positions.some(pos => 
          pos.country && pos.country !== 'USA' && pos.country !== 'United States'
        );
        const hasRecentPurchases = result.positions.some(pos => 
          pos.purchaseDate && new Date(pos.purchaseDate) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        );
        const hasNewBuys = result.positions.some(pos => isNewBuy(pos.purchaseDate));
        
        if (hasRealDividendData && hasRealCountryData && hasNewBuys) {
          setDataSource('Live Data (IBKR + Alpha Vantage + Real Trades)');
        } else if (hasRealDividendData || hasRealCountryData) {
          setDataSource('Mixed Data (IBKR + Alpha Vantage)');
        } else if (hasRecentPurchases) {
          setDataSource('IBKR API with Mock Enhancement');
        } else {
          setDataSource('Demo Data for Testing');
        }
        
      } catch (error) {
        clearTimeout(timeoutId);
        console.error('Failed to fetch portfolio:', error)
        if (error instanceof Error && error.message.includes('timeout')) {
          setError('Portfolio data request timed out. Using demo data instead.')
        } else {
          setError('Failed to load portfolio data. Please check your API connections.')
        }
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
        <div>
          <h1 className="text-2xl font-bold">Portfolio</h1>
          <p className="text-sm text-gray-500 mt-1">Data source: {dataSource}</p>
        </div>
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

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          <h3 className="font-semibold">Error Loading Portfolio</h3>
          <p className="text-sm mt-1">{error}</p>
          <p className="text-xs mt-2">
            Check that your Alpha Vantage API key is configured and IBKR API is accessible.
          </p>
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
                  <td colSpan={11} className="px-6 py-4 text-center text-sm text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : sortedPositions.length === 0 ? (
                <tr>
                  <td colSpan={11} className="px-6 py-4 text-center text-sm text-gray-500">
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                      {formatDividend(position.dividendYield, position.marketValue)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                      <div className="flex items-center justify-center">
                        <span className="mr-2">{formatPurchaseDate(position.purchaseDate)}</span>
                        {isNewBuy(position.purchaseDate) && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            New Buy
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                      {position.salePercentage ? `${position.salePercentage}%` : '0%'}
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
    </>
  )
} 