import { FiTrendingUp, FiTrendingDown, FiExternalLink, FiCreditCard, FiBarChart2, FiPieChart, FiDollarSign, FiArrowRight } from 'react-icons/fi'
import { useState, useEffect, useContext } from 'react'
import StockChart from '@/components/StockChart'
import PerformanceChart from '@/components/PerformanceChart'
import AllocationChart from '@/components/AllocationChart'
import { getPerformance, getPortfolio, getAllocation } from '../services/ibapi'
import { formatCurrency, formatPercent } from '../utils/formatters'
import { SubscriptionContext } from '@/components/Layout'
import BlurOverlay from '@/components/BlurOverlay'
import SubscriptionModal from '@/components/SubscriptionModal'
import Image from 'next/image'
import Link from 'next/link'

export default function Home() {
  const [period, setPeriod] = useState('1m')
  const [performance, setPerformance] = useState<any>(null)
  const [portfolio, setPortfolio] = useState<any>(null)
  const [allocation, setAllocation] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const { isSubscribed, subscribe, loading: subscriptionLoading } = useContext(SubscriptionContext)

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
        if (error instanceof Error) {
          setErrorMessage(`Failed to load data: ${error.message}`)
        } else {
          setErrorMessage('Failed to load data: Unknown error')
        }
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
  }, [period])
  
  // Log resource loading errors
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error('Resource loading error:', event.message, event.filename, event.lineno)
      setErrorMessage(`Resource loading failed: ${event.message}`)
    };
    
    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);
  
  // Function to render the hero section for unsubscribed users
  const renderHeroSection = () => {
    return (
      <div className="relative text-white">
        {/* Hero background image */}
        <div className="absolute inset-0 z-0 w-full h-full">
          <div 
            className="absolute inset-0 bg-center bg-cover w-full h-full" 
            style={{
              backgroundImage: 'url("https://images.pexels.com/photos/6781008/pexels-photo-6781008.jpeg?auto=compress&cs=tinysrgb&w=1920")',
              backgroundSize: 'cover',
              filter: 'brightness(0.6)'
            }}
          ></div>
          <div className="absolute inset-0 bg-black/30"></div> {/* Overlay to darken image */}
        </div>
        
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-32 md:py-48 flex flex-col items-center justify-center text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            Unlock <span className="border-b-4 border-blue-500 pb-2">Financial Insights</span> with 
                            <span className="text-blue-400"> ESEN GLOBAL</span> INVESTMENT
          </h1>
          
          <p className="text-xl md:text-2xl max-w-3xl mx-auto font-light text-gray-100 leading-relaxed mb-12">
                          Follow Esen Global Investment and portfolio performance in real-time. Subscribe now to gain
            access to investment and trade strategies and learn how navigate the market. Start
            your journey towards financial literacy today!
          </p>
          
          {/* Email signup form */}
          <div className="flex flex-col sm:flex-row w-full max-w-xl mx-auto gap-2">
            <input 
              type="email" 
              placeholder="Enter your email" 
              className="flex-grow py-3 px-4 rounded-md text-gray-900 border-0 focus:ring-2 focus:ring-blue-500"
            />
            <button 
              onClick={() => setShowSubscriptionModal(true)}
              className="bg-blue-600 hover:bg-blue-700 py-3 px-6 rounded-md font-medium transition-colors duration-200 text-white">
              Sign up
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  // Function to render the dashboard for subscribed users
  const renderDashboard = () => {
    return (
      <div className="w-full">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Investment Dashboard</h1>
          <div className="flex items-center space-x-2">
            {['1w', '1m', '3m', '6m', '1y', 'all'].map((timeRange) => (
              <button
                key={timeRange}
                onClick={() => setPeriod(timeRange)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  period === timeRange
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {timeRange === '1w' ? '1W' : 
                 timeRange === '1m' ? '1M' : 
                 timeRange === '3m' ? '3M' : 
                 timeRange === '6m' ? '6M' : 
                 timeRange === '1y' ? '1Y' : 'All'}
              </button>
            ))}
          </div>
        </div>

        {errorMessage && (
          <div className="bg-red-50 text-red-800 p-4 rounded-lg border border-red-200 mb-6">
            <h2 className="text-lg font-semibold">Error</h2>
            <p className="text-sm">{errorMessage}</p>
          </div>
        )}

        {/* Performance Cards */}
        {performance && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow relative">
              {(!isSubscribed && !subscriptionLoading) && (
                <BlurOverlay onUpgrade={() => setShowSubscriptionModal(true)} message="Upgrade to view performance" />
              )}
              <div className="text-sm text-gray-500 mb-1">Today's Change</div>
              <div className="text-2xl font-semibold text-gray-800">
                {loading ? (
                  '-'
                ) : (
                  performance.todayChange !== undefined ? (
                    <span className={performance.todayChange >= 0 ? 'text-green-600' : 'text-red-600'}>
                      {performance.todayChange >= 0 ? '+' : ''}{performance.todayChange.toFixed(2)}%
                    </span>
                  ) : '-'
                )}
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow relative">
              {(!isSubscribed && !subscriptionLoading) && (
                <BlurOverlay onUpgrade={() => setShowSubscriptionModal(true)} message="Upgrade to view monthly performance" />
              )}
              <div className="text-sm text-gray-500 mb-1">Monthly Change</div>
              <div className="text-2xl font-semibold text-gray-800">
                {loading ? (
                  '-'
                ) : (
                  performance.monthChange !== undefined ? (
                    <span className={performance.monthChange >= 0 ? 'text-green-600' : 'text-red-600'}>
                      {performance.monthChange >= 0 ? '+' : ''}{performance.monthChange.toFixed(2)}%
                    </span>
                  ) : '-'
                )}
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow relative">
              {(!isSubscribed && !subscriptionLoading) && (
                <BlurOverlay onUpgrade={() => setShowSubscriptionModal(true)} message="Upgrade to view yearly performance" />
              )}
              <div className="text-sm text-gray-500 mb-1">Yearly Change</div>
              <div className="text-2xl font-semibold text-gray-800">
                {loading ? (
                  '-'
                ) : (
                  performance.yearChange !== undefined ? (
                    <span className={performance.yearChange >= 0 ? 'text-green-600' : 'text-red-600'}>
                      {performance.yearChange >= 0 ? '+' : ''}{performance.yearChange.toFixed(2)}%
                    </span>
                  ) : '-'
                )}
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Performance Chart */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow relative overflow-hidden">
              {(!isSubscribed && !subscriptionLoading) && (
                <BlurOverlay onUpgrade={() => setShowSubscriptionModal(true)} message="Upgrade to see your portfolio performance" />
              )}
              
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">Performance</h2>
                  <p className="text-gray-500">Percentage change over time</p>
                </div>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => setPeriod('1m')} 
                    className={`px-3 py-1 text-sm rounded-md ${period === '1m' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                  >
                    1M
                  </button>
                  <button 
                    onClick={() => setPeriod('3m')} 
                    className={`px-3 py-1 text-sm rounded-md ${period === '3m' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                  >
                    3M
                  </button>
                  <button 
                    onClick={() => setPeriod('1y')} 
                    className={`px-3 py-1 text-sm rounded-md ${period === '1y' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                  >
                    1Y
                  </button>
                  <button 
                    onClick={() => setPeriod('all')} 
                    className={`px-3 py-1 text-sm rounded-md ${period === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                  >
                    All
                  </button>
                </div>
              </div>
              
              {loading ? (
                <div className="h-80 flex items-center justify-center">
                  <p>Loading...</p>
                </div>
              ) : performance && performance.data ? (
                <>
                  <div className="h-80">
                    <PerformanceChart data={performance.data} />
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4">
                    <div>
                      <p className="text-sm text-gray-500">Today</p>
                      <p className={`text-lg font-semibold ${performance.todayChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {performance.todayChange !== undefined ? (
                          <>{performance.todayChange >= 0 ? '+' : ''}{performance.todayChange.toFixed(2)}%</>
                        ) : ('-')}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">This Week</p>
                      <p className={`text-lg font-semibold ${performance.weekChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {performance.weekChange !== undefined ? (
                          <>{performance.weekChange >= 0 ? '+' : ''}{performance.weekChange.toFixed(2)}%</>
                        ) : ('0.00%')}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">This Month</p>
                      <p className={`text-lg font-semibold ${performance.monthChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {performance.monthChange !== undefined ? (
                          <>{performance.monthChange >= 0 ? '+' : ''}{performance.monthChange.toFixed(2)}%</>
                        ) : ('0.00%')}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">This Year</p>
                      <p className={`text-lg font-semibold ${performance.yearChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {performance.yearChange !== undefined ? (
                          <>{performance.yearChange >= 0 ? '+' : ''}{performance.yearChange.toFixed(2)}%</>
                        ) : ('0.00%')}
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="h-80 flex items-center justify-center">
                  <p>No data available</p>
                </div>
              )}
              
              <div className="flex justify-between mt-4">
                <Link href="/performance" className="text-blue-600 hover:text-blue-800 text-sm flex items-center">
                  View detailed performance <FiArrowRight className="ml-1" />
                </Link>
                <Link href="/portfolio-stock-ranks" className="text-blue-600 hover:text-blue-800 text-sm flex items-center">
                  Portfolio Stock Ranks <FiArrowRight className="ml-1" />
                </Link>
              </div>
            </div>
          </div>

          {/* Top Holdings from Portfolio */}
          <div className="relative h-full">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow h-full relative overflow-hidden">
              {(!isSubscribed && !subscriptionLoading) && (
                <BlurOverlay onUpgrade={() => setShowSubscriptionModal(true)} message="Upgrade to view your top holdings" />
              )}
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Top Holdings</h2>
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
                      <div key={position.symbol} className="flex justify-between items-center border-b border-gray-100 pb-3">
                        <div>
                          <div className="font-medium text-gray-800">{position.symbol}</div>
                          <div className="text-sm text-gray-500">{position.name}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium text-gray-800">${position.marketValue.toFixed(2)}</div>
                          <div className={`text-sm ${position.percentChange >= 0 ? 'text-green-600' : 'text-red-600'}`}
                          >
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

        {/* Holdings Allocation Chart */}
        <div className="mt-6 relative">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow relative overflow-hidden">
            {(!isSubscribed && !subscriptionLoading) && (
              <BlurOverlay onUpgrade={() => setShowSubscriptionModal(true)} message="Upgrade to access holdings allocation insights" />
            )}
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Holdings Allocation</h2>
            {loading ? (
              <div className="h-60 flex items-center justify-center">
                <p>Loading...</p>
              </div>
            ) : portfolio && portfolio.positions && portfolio.positions.length > 0 ? (
              <div className="h-60">
                <AllocationChart 
                  data={portfolio.positions.map((position: any, index: number) => ({
                    name: position.symbol,
                    value: position.marketValue || 0,
                    color: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16', '#F97316'][index % 8]
                  }))} 
                  totalValue={portfolio.positions.reduce((sum: number, item: any) => sum + (item.marketValue || 0), 0)} 
                  title="Holdings" 
                />
              </div>
            ) : (
              <div className="h-60 flex items-center justify-center">
                <p>No holdings allocation data available</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <>
      {!isSubscribed ? renderHeroSection() : renderDashboard()}
      
      <SubscriptionModal 
        isOpen={showSubscriptionModal} 
        onClose={() => setShowSubscriptionModal(false)}
      />
    </>
  )
}
