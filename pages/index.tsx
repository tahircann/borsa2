import { FiTrendingUp, FiTrendingDown, FiExternalLink, FiCreditCard, FiBarChart2, FiPieChart, FiDollarSign, FiArrowRight } from 'react-icons/fi'
import { useState, useEffect, useContext, Suspense, lazy } from 'react'
import StockChart from '@/components/StockChart'
// Lazy load PerformanceChart for better performance
const PerformanceChart = lazy(() => import('@/components/PerformanceChart'))
// Lazy load AllocationChart for better performance
const AllocationChart = lazy(() => import('@/components/AllocationChart'))
import { getPerformance, getPortfolio, getAllocation, getSP500Data } from '../services/ibapi'
import { formatCurrency, formatPercent } from '../utils/formatters'
import { SubscriptionContext } from '@/components/Layout'
import BlurOverlay from '@/components/BlurOverlay'
import SubscriptionModal from '@/components/SubscriptionModal'
import Image from 'next/image'
import Link from 'next/link'
import { LanguageContext } from './_app'

export default function Home() {
  const { language } = useContext(LanguageContext);
  const [period, setPeriod] = useState('1m')
  const [performance, setPerformance] = useState<any>(null)
  const [portfolio, setPortfolio] = useState<any>(null)
  const [allocation, setAllocation] = useState<any>(null)
  const [sp500Data, setSp500Data] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const { isSubscribed, subscribe, loading: subscriptionLoading } = useContext(SubscriptionContext)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setErrorMessage(null) // Clear any previous error messages
      try {
        // Fetch data with timeout and parallel processing
        const fetchWithTimeout = (promise: Promise<any>, timeout: number) => {
          return Promise.race([
            promise,
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Request timeout')), timeout)
            )
          ]);
        };

        // Use longer timeouts for dashboard critical data
        const [performanceResult, portfolioResult] = await Promise.all([
          fetchWithTimeout(getPerformance(period), 10000), // Increased from 5000 to 10000
          fetchWithTimeout(getPortfolio(), 15000) // Increased from 5000 to 15000
        ]);
        
        setPerformance(performanceResult)
        setPortfolio(portfolioResult)
        setErrorMessage(null) // Clear error message on successful load
        
        // Fetch less critical data separately to avoid blocking UI
        Promise.all([
          fetchWithTimeout(getAllocation(), 12000), // Increased from 8000 to 12000
          fetchWithTimeout(getSP500Data(period), 12000) // Increased from 8000 to 12000
        ]).then(([allocationResult, sp500Result]) => {
          setAllocation(allocationResult)
          setSp500Data(sp500Result)
        }).catch(error => {
          console.warn('Secondary data fetch failed:', error);
          // Set fallback data for non-critical components
        });
        
      } catch (error) {
        console.error('Error fetching critical data:', error)
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
          <h1 className="text-3xl font-bold text-gray-800">
            {language === 'en' ? 'Investment Dashboard' : 'Yatırım Panosu'}
          </h1>
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
                 timeRange === '1y' ? '1Y' : (language === 'en' ? 'All' : 'Tümü')}
              </button>
            ))}
          </div>
        </div>

        {errorMessage && (
          <div className="bg-red-50 text-red-800 p-4 rounded-lg border border-red-200 mb-6">
            <h2 className="text-lg font-semibold">
              {language === 'en' ? 'Error' : 'Hata'}
            </h2>
            <p className="text-sm">{errorMessage}</p>
          </div>
        )}

        {/* Performance Statistics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-md p-6 relative overflow-hidden">
            {(!isSubscribed && !subscriptionLoading) && (
              <BlurOverlay onUpgrade={() => setShowSubscriptionModal(true)} message="Upgrade to see portfolio performance" />
            )}
            <div className="text-sm text-gray-500 mb-1">Portfolio Performance</div>
            {loading ? (
              <div className="text-2xl font-semibold">-</div>
            ) : (
              <div
                className={`text-2xl font-semibold flex items-center ${
                  performance && performance.percentChange >= 0
                    ? 'text-green-600'
                    : 'text-red-600'
                }`}
              >
                {performance && performance.percentChange >= 0 ? (
                  <FiTrendingUp className="w-5 h-5 mr-1" />
                ) : (
                  <FiTrendingDown className="w-5 h-5 mr-1" />
                )}
                {Math.abs(performance?.percentChange || 0).toFixed(2)}%
              </div>
            )}
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 relative overflow-hidden">
            {(!isSubscribed && !subscriptionLoading) && (
              <BlurOverlay onUpgrade={() => setShowSubscriptionModal(true)} message="Upgrade to see S&P 500 performance" />
            )}
            <div className="text-sm text-gray-500 mb-1">S&P 500 Performance</div>
            {loading ? (
              <div className="text-2xl font-semibold">-</div>
            ) : (
              <div
                className={`text-2xl font-semibold flex items-center ${
                  sp500Data && sp500Data.percentChange >= 0
                    ? 'text-green-600'
                    : 'text-red-600'
                }`}
              >
                {sp500Data && sp500Data.percentChange >= 0 ? (
                  <FiTrendingUp className="w-5 h-5 mr-1" />
                ) : (
                  <FiTrendingDown className="w-5 h-5 mr-1" />
                )}
                {Math.abs(sp500Data?.percentChange || 0).toFixed(2)}%
              </div>
            )}
          </div>
        </div>

        {/* Performance Chart */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6 relative overflow-hidden">
          {(!isSubscribed && !subscriptionLoading) && (
            <BlurOverlay onUpgrade={() => setShowSubscriptionModal(true)} message="Upgrade to see your portfolio performance chart" />
          )}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Portfolio Performance vs S&P 500</h1>
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
                  disabled={loading}
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

          {loading ? (
            <div className="h-80 flex items-center justify-center">
              <div className="animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ) : performance && performance.data ? (
            <div className="h-80">
              <Suspense fallback={
                <div className="h-80 flex items-center justify-center">
                  <div className="animate-pulse">
                    <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
                    <div className="space-y-3">
                      <div className="h-4 bg-gray-200 rounded w-full"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                </div>
              }>
                <PerformanceChart 
                  data={performance.data} 
                  spData={sp500Data?.data || undefined}
                />
              </Suspense>
            </div>
          ) : (
            <div className="h-80 flex items-center justify-center">
              <p>No data available</p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
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
                          <div className="font-medium text-gray-800">{position.marketValue.toFixed(2)} pts</div>
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

          {/* Sector Allocation Chart */}
          <div className="relative h-full">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow h-full relative overflow-hidden">
              {(!isSubscribed && !subscriptionLoading) && (
                <BlurOverlay onUpgrade={() => setShowSubscriptionModal(true)} message="Upgrade to access sector allocation insights" />
              )}
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Sector Allocation</h2>
              {loading ? (
                <div className="h-60 flex items-center justify-center">
                  <p>Loading...</p>
                </div>
              ) : allocation && allocation.sector && allocation.sector.length > 0 ? (
                <div className="h-60">
                  <Suspense fallback={
                    <div className="h-60 flex items-center justify-center">
                      <p>Loading...</p>
                    </div>
                  }>
                    <AllocationChart 
                      data={allocation.sector} 
                      totalValue={allocation.sector.reduce((sum: number, item: any) => sum + item.value, 0)} 
                      title="Sector" 
                    />
                  </Suspense>
                </div>
              ) : (
                <div className="h-60 flex items-center justify-center">
                  <p>No sector allocation data available</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  // Show loading state while checking subscription
  if (subscriptionLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-t-4 border-b-4 border-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your personalized dashboard...</p>
        </div>
      </div>
    );
  }
  
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
