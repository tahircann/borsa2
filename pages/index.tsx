import { FiTrendingUp, FiTrendingDown, FiDollarSign, FiBarChart2 } from 'react-icons/fi'
import { useState, useEffect } from 'react'
import DashboardCard from '@/components/DashboardCard'
import StockChart from '@/components/StockChart'
import { getPerformance } from '../services/ibapi'
import { formatCurrency, formatNumber } from '../utils/formatters'

export default function Home() {
  const [period, setPeriod] = useState('1m')
  const [performance, setPerformance] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // Mock data
  const portfolioValue = 125842.65
  const portfolioChange = 2.34
  const portfolioChangeAmount = 2876.32
  const totalTrades = 42
  const successfulTrades = 28
  const winRate = (successfulTrades / totalTrades) * 100
  const dividends = 842.12
  
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const performanceData = await getPerformance(period)
        setPerformance(performanceData)
      } catch (error) {
        console.error('Error fetching performance data:', error)
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <DashboardCard 
          title="Portfolio Value" 
          value={formatCurrency(portfolioValue)} 
          change={portfolioChange}
          icon={<FiDollarSign className="h-6 w-6 text-primary-600" />}
        />
        <DashboardCard 
          title="Win Rate" 
          value={`${winRate.toFixed(1)}%`} 
          change={4.2}
          icon={<FiTrendingUp className="h-6 w-6 text-green-600" />}
        />
        <DashboardCard 
          title="Total Trades" 
          value={formatNumber(totalTrades)} 
          change={12.5}
          icon={<FiBarChart2 className="h-6 w-6 text-indigo-600" />}
        />
        <DashboardCard 
          title="Dividends" 
          value={formatCurrency(dividends)}
          change={1.8}
          icon={<FiDollarSign className="h-6 w-6 text-yellow-600" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Portfolio Performance</h2>
            </div>
            {loading ? (
              <div className="h-80 flex items-center justify-center">
                <p>Loading...</p>
              </div>
            ) : performance ? (
              <div>
                <div className="h-80">
                  <StockChart period={period} />
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
        <div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4">Top Holdings</h2>
            <div className="space-y-4">
              {[
                { symbol: 'AAPL', name: 'Apple Inc.', price: 184.32, change: 1.2 },
                { symbol: 'MSFT', name: 'Microsoft Corp.', price: 338.21, change: -0.8 },
                { symbol: 'AMZN', name: 'Amazon.com Inc.', price: 145.68, change: 2.3 },
                { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 142.15, change: 0.5 },
                { symbol: 'TSLA', name: 'Tesla Inc.', price: 176.83, change: -1.2 }
              ].map((stock) => (
                <div key={stock.symbol} className="flex justify-between items-center border-b border-gray-100 pb-2">
                  <div>
                    <div className="font-medium">{stock.symbol}</div>
                    <div className="text-sm text-gray-500">{stock.name}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">${stock.price}</div>
                    <div className={`text-sm ${stock.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {stock.change >= 0 ? <FiTrendingUp className="inline mr-1 h-3 w-3" /> : <FiTrendingDown className="inline mr-1 h-3 w-3" />}
                      {stock.change >= 0 ? '+' : ''}{stock.change}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
} 