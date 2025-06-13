import { useState, useEffect } from 'react'
import { FiTrendingUp, FiTrendingDown, FiExternalLink, FiSettings } from 'react-icons/fi'
import { getPortfolio, testIBKREndpoints, debugLedgerEndpoint, getAlternativeTradeData, getIBKRWebTradeHistory, getRealTradeHistory, type Portfolio, type Position } from '@/services/ibapi'
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
  const [debugMode, setDebugMode] = useState(false)

  const handleDebugTest = async () => {
    console.log('🔍 Running COMPREHENSIVE REAL DATA debug test...');
    
    // First run the specific ledger endpoint debug
    console.log('\n📋 === LEDGER ENDPOINT ANALYSIS ===');
    await debugLedgerEndpoint();
    
    // Test comprehensive real trade history
    console.log('\n📈 === COMPREHENSIVE REAL TRADE HISTORY ===');
    await getRealTradeHistory();
    
    // Test alternative trade endpoints
    console.log('\n🔄 === ALTERNATIVE TRADE ENDPOINTS ===');
    await getAlternativeTradeData();
    
    // Test web API endpoints
    console.log('\n🌐 === WEB API ENDPOINTS ===');
    await getIBKRWebTradeHistory();
    
    // Then run the general endpoint tests
    console.log('\n🔍 === GENERAL ENDPOINT TESTS ===');
    const testResults = await testIBKREndpoints();
    console.log('Test results:', testResults);
    
    // Additional logging for portfolio-specific endpoints
    if (portfolio) {
      console.log('\n📊 === CURRENT PORTFOLIO ANALYSIS ===');
      console.log(`Total positions: ${portfolio.positions.length}`);
      console.log(`Positions with purchase dates: ${portfolio.positions.filter(p => p.purchaseDate).length}`);
      console.log(`Positions with sale data: ${portfolio.positions.filter(p => p.salePercentage && p.salePercentage > 0).length}`);
      
      portfolio.positions.forEach((position, index) => {
        console.log(`${index + 1}. ${position.symbol} (${position.name}):`, {
          quantity: position.quantity,
          marketValue: position.marketValue,
          purchaseDate: position.purchaseDate || 'NOT AVAILABLE',
          salePercentage: position.salePercentage || 'NO SALES',
          country: position.country || 'Unknown',
          dividendYield: position.dividendYield || 'No dividend data'
        });
      });
      
      console.log('\n⚠️ IMPORTANT: If purchase dates show "NOT AVAILABLE", this indicates:');
      console.log('   1. No trade history found in IBKR API');
      console.log('   2. Positions may have been transferred from another broker');
      console.log('   3. Trades may be older than API retention period');
      console.log('   4. API permissions may need configuration');
    }
  };

  useEffect(() => {
    const fetchPortfolio = async () => {
      setLoading(true)
      setError(null)
      
      // Set a timeout for the API call
      const timeoutId = setTimeout(() => {
        setError('Portfolio data is taking longer than expected. Please check your IBKR Gateway/TWS connection.')
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
        const hasPurchaseDates = result.positions.some(pos => pos.purchaseDate);
        const hasSaleData = result.positions.some(pos => pos.salePercentage && pos.salePercentage > 0);
        
        // Provide more detailed data source information
        let dataSourceInfo = 'IBKR API Connected';
        const dataFeatures = [];
        
        if (hasRealDividendData) dataFeatures.push('Dividends');
        if (hasRealCountryData) dataFeatures.push('Country Data');
        if (hasPurchaseDates) dataFeatures.push('Purchase Dates');
        if (hasSaleData) dataFeatures.push('Sale Data');
        if (hasNewBuys) dataFeatures.push('Recent Trades');
        
        if (dataFeatures.length > 0) {
          dataSourceInfo += ` (${dataFeatures.join(', ')})`;
        }
        
        // Add warnings for missing data
        const missingFeatures = [];
        if (!hasPurchaseDates) missingFeatures.push('Purchase Dates');
        if (!hasSaleData) missingFeatures.push('Sale Data');
        
        if (missingFeatures.length > 0) {
          dataSourceInfo += ` - Missing: ${missingFeatures.join(', ')}`;
        }
        
        setDataSource(dataSourceInfo);
        
      } catch (error) {
        clearTimeout(timeoutId);
        console.error('Failed to fetch portfolio:', error)
        
        if (error instanceof Error) {
          if (error.message.includes('timeout')) {
            setError('Portfolio data request timed out. Please check your IBKR Gateway/TWS connection and try again.')
          } else if (error.message.includes('API connection failed')) {
            setError('IBKR API connection failed. Please ensure IBKR Gateway or TWS is running and accessible.')
          } else if (error.message.includes('API request failed')) {
            setError(`IBKR API request failed: ${error.message}. Please check your account settings and API permissions.`)
          } else {
            setError(`Failed to load portfolio data: ${error.message}`)
          }
        } else {
          setError('Failed to load portfolio data. Please check your IBKR Gateway/TWS connection.')
        }
        
        // Don't set portfolio data in case of error
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

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Portfolio</h1>
          <p className="text-sm text-gray-500 mt-1">Data source: {dataSource}</p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setDebugMode(!debugMode)}
            className="flex items-center px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-md"
          >
            <FiSettings className="w-4 h-4 mr-1" />
            {debugMode ? 'Hide' : 'Show'} Debug
          </button>
          {debugMode && (
            <button
              onClick={handleDebugTest}
              className="px-3 py-2 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded-md"
            >
              Test IBKR API
            </button>
          )}
        </div>
      </div>

      {debugMode && portfolio && (
        <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded mb-6">
          <h3 className="font-semibold">Debug Information</h3>
          <div className="text-sm mt-2 space-y-1">
            <p><strong>Total Positions:</strong> {portfolio.positions.length}</p>
            <p><strong>Positions with Purchase Date:</strong> {portfolio.positions.filter(p => p.purchaseDate).length}</p>
            <p><strong>Positions with Sale Data:</strong> {portfolio.positions.filter(p => p.salePercentage && p.salePercentage > 0).length}</p>
            <p><strong>Positions with Dividends:</strong> {portfolio.positions.filter(p => p.dividendYield && p.dividendYield > 0).length}</p>
            <p><strong>Total Portfolio Value:</strong> {formatCurrency(portfolio.totalValue)}</p>
            <p><strong>Available Cash:</strong> {formatCurrency(portfolio.cash)}</p>
          </div>
          
          {/* Detailed position analysis */}
          <div className="mt-3">
            <h4 className="font-medium text-sm mb-2">Position Details:</h4>
            <div className="text-xs space-y-1 max-h-32 overflow-y-auto">
              {portfolio.positions.map((pos, idx) => (
                <div key={pos.symbol} className="flex justify-between">
                  <span>{pos.symbol}:</span>
                  <span>
                    Purchase: {pos.purchaseDate ? new Date(pos.purchaseDate).toLocaleDateString() : 'N/A'}, 
                    Sold: {pos.salePercentage || 0}%
                  </span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="mt-2">
            <p className="text-xs">
              📝 Check browser console for detailed API endpoint test results and purchase date analysis.
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          <h3 className="font-semibold">Error Loading Portfolio</h3>
          <p className="text-sm mt-1">{error}</p>
          <p className="text-xs mt-2">
            Make sure IBKR Gateway or TWS is running and your API settings are configured correctly.
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
                        {isNewBuy(position.purchaseDate) && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            New Buy
                          </span>
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
    </>
  )
} 