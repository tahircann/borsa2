import { FiTrendingUp, FiTrendingDown, FiExternalLink } from 'react-icons/fi'
import { useState, useEffect } from 'react'
import StockChart from '@/components/StockChart'
import PerformanceChart from '@/components/PerformanceChart'
import AllocationChart from '@/components/AllocationChart'
import { getPerformance, getPortfolio, getAllocation } from '../services/ibapi'
import { formatCurrency, formatPercent } from '../utils/formatters'

export default function Home() {
  const [period, setPeriod] = useState('1m')
  const [performance, setPerformance] = useState<any>(null)
  const [portfolio, setPortfolio] = useState<any>(null)
  const [allocation, setAllocation] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        // Fetch performance data
        const performanceData = await getPerformance(period)
        setPerformance(performanceData)
        
        // Fetch portfolio data
        const portfolioData = await getPortfolio()
        setPortfolio(portfolioData)
        
        // Fetch allocation data
        const allocationData = await getAllocation()
        setAllocation(allocationData)
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
  }, [period])
  
  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="flex items-center space-x-2">
          <select 
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="block w-full bg-white border border-gray-300 rounded-md py-2 px-3 text-sm"
          >
            <option value="1w">1 Week</option>
            <option value="1m">1 Month</option>
            <option value="3m">3 Months</option>
            <option value="6m">6 Months</option>
            <option value="1y">1 Year</option>
            <option value="all">All Time</option>
          </select>
        </div>
      </div>

      {/* Performance Cards */}
      {performance && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-sm text-gray-500 mb-1">Starting Value</div>
            <div className="text-2xl font-semibold">
              {loading ? (
                '-'
              ) : (
                <>$
                  {performance.startValue.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </>
              )}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-sm text-gray-500 mb-1">Current Value</div>
            <div className="text-2xl font-semibold">
              {loading ? (
                '-'
              ) : (
                <>$
                  {performance.endValue.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </>
              )}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-sm text-gray-500 mb-1">Performance</div>
            {loading ? (
              <div className="text-2xl font-semibold">-</div>
            ) : (
              <div
                className={`text-2xl font-semibold flex items-center ${
                  performance.percentChange >= 0
                    ? 'text-green-600'
                    : 'text-red-600'
                }`}
              >
                {performance.percentChange >= 0 ? (
                  <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                )}
                {Math.abs(performance.percentChange || 0).toFixed(2)}%
              </div>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Portfolio Performance Chart */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Portfolio Performance</h2>
            </div>
            {loading ? (
              <div className="h-80 flex items-center justify-center">
                <p>Loading...</p>
              </div>
            ) : performance && performance.data ? (
              <div>
                <div className="h-80">
                  <PerformanceChart data={performance.data} />
                </div>
                <div className="flex justify-between mt-4 text-sm text-gray-500">
                  <div>
                    <div>Start Value</div>
                    <div className="font-medium">{formatCurrency(performance.startValue)}</div>
                  </div>
                  <div>
                    <div>End Value</div>
                    <div className="font-medium">{formatCurrency(performance.endValue)}</div>
                  </div>
                  <div>
                    <div>Change</div>
                    <div className={`font-medium ${performance.percentChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {performance.percentChange >= 0 ? '+' : ''}{performance.percentChange.toFixed(2)}%
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-80 flex items-center justify-center">
                <p>No data available</p>
              </div>
            )}
          </div>
        </div>

        {/* Top Holdings from Portfolio */}
        <div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4">Top Holdings</h2>
            <div className="space-y-4">
              {loading ? (
                <div className="flex justify-center items-center h-40">
                  <p>Loading...</p>
                </div>
              ) : portfolio && portfolio.positions ? (
                portfolio.positions
                  .sort((a: any, b: any) => b.marketValue - a.marketValue)
                  .slice(0, 5)
                  .map((position: any) => (
                    <div key={position.symbol} className="flex justify-between items-center border-b border-gray-100 pb-2">
                      <div>
                        <div className="font-medium">{position.symbol}</div>
                        <div className="text-sm text-gray-500">{position.name}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">${position.marketValue.toFixed(2)}</div>
                        <div className={`text-sm ${position.percentChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {position.percentChange >= 0 ? 
                            <FiTrendingUp className="inline mr-1 h-3 w-3" /> : 
                            <FiTrendingDown className="inline mr-1 h-3 w-3" />
                          }
                          {position.percentChange >= 0 ? '+' : ''}{position.percentChange.toFixed(2)}%
                        </div>
                      </div>
                    </div>
                  ))
              ) : (
                <div className="flex justify-center items-center h-40">
                  <p>No holdings data available</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Sector Allocation Chart */}
      <div className="mt-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">Sector Allocation</h2>
          {loading ? (
            <div className="h-60 flex items-center justify-center">
              <p>Loading...</p>
            </div>
          ) : allocation && allocation.sector && allocation.sector.length > 0 ? (
            <div className="h-60">
              <AllocationChart 
                data={allocation.sector} 
                totalValue={allocation.sector.reduce((sum: number, item: any) => sum + item.value, 0)} 
                title="Sector" 
              />
            </div>
          ) : (
            <div className="h-60 flex items-center justify-center">
              <p>No sector allocation data available</p>
            </div>
          )}
        </div>
      </div>
    </>
  )
} 