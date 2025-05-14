import { useState, useEffect } from 'react'
import { getPositions } from '../services/ibapi'
import { FiTrendingUp, FiTrendingDown, FiRefreshCw } from 'react-icons/fi'
import { formatCurrency, formatPercent } from '../utils/formatters'

interface Position {
  symbol: string;
  name: string;
  quantity: number;
  averageCost: number;
  marketValue: number;
  unrealizedPnL: number;
  percentChange: number;
  sector?: string | null;
  group?: string | null;
  assetClass?: string | null;
}

export default function Positions() {
  const [positions, setPositions] = useState<Position[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isRealData, setIsRealData] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      // Add a timestamp parameter to prevent caching
      const positionsData = await getPositions()
      
      // Check if this is real data or mock data (mock data has a specific structure)
      const isMockData = 
        Array.isArray(positionsData) && 
        positionsData.length > 0 && 
        positionsData[0].symbol === 'AAPL' && 
        positionsData[1]?.symbol === 'MSFT' &&
        positionsData[2]?.symbol === 'GOOGL';
      
      setIsRealData(!isMockData)
      setPositions(Array.isArray(positionsData) ? positionsData : [])
      setLastUpdated(new Date())
    } catch (error) {
      console.error('Error fetching positions data:', error)
      setError('Failed to load positions data. Please check if the backend API is running.')
      setIsRealData(false)
    } finally {
      setLoading(false)
    }
  }
  
  useEffect(() => {
    fetchData()
    
    // Set up polling every 30 seconds to get real-time updates
    const intervalId = setInterval(fetchData, 30000)
    
    // Clean up on unmount
    return () => clearInterval(intervalId)
  }, [])
  
  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Positions</h1>
        <button
          onClick={fetchData}
          disabled={loading}
          className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          <FiRefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {!isRealData && !error && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded mb-6">
          Currently showing mock data. Make sure the API server is running at http://localhost:5056.
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Current Positions</h2>
          {lastUpdated && (
            <div className="text-sm text-gray-500">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </div>
          )}
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center h-60">
            <div className="text-center">
              <svg className="animate-spin -ml-1 mr-3 h-10 w-10 text-blue-500 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="text-gray-500 mt-2">Loading positions data...</p>
            </div>
          </div>
        ) : positions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Symbol
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Avg Cost
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Market Value
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Unrealized P&L
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    % Change
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sector
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {positions.map((position, index) => (
                  <tr key={position.symbol || index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {position.symbol}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {position.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                      {Number(position.quantity).toFixed(position.quantity % 1 === 0 ? 0 : 4)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                      {formatCurrency(position.averageCost)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                      {formatCurrency(position.marketValue)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                      <span className={position.unrealizedPnL >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {formatCurrency(position.unrealizedPnL)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                      <div className={`flex items-center justify-end ${position.percentChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {position.percentChange >= 0 ? 
                          <FiTrendingUp className="inline mr-1 h-3 w-3" /> : 
                          <FiTrendingDown className="inline mr-1 h-3 w-3" />
                        }
                        {Math.abs(position.percentChange).toFixed(2)}%
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {position.sector || (position.assetClass ? `(${position.assetClass})` : '-')}
                      {position.group && <span className="text-xs block text-gray-400">{position.group}</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex justify-center items-center h-60">
            <p className="text-gray-500">No positions data available</p>
          </div>
        )}
      </div>
    </>
  )
} 