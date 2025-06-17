import { useState, useEffect } from 'react'
import { getPerformance, getSP500Data, getAllocation, AllocationData, AllocationItem } from '@/services/ibapi'
import PerformanceChart from '@/components/PerformanceChart'
import AllocationChart from '@/components/AllocationChart'

export default function PerformancePage() {
  const [period, setPeriod] = useState('1m')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [chartKey, setChartKey] = useState(0); // Force chart re-render
  const [allocationData, setAllocationData] = useState<AllocationData | null>(null)
  const [performanceData, setPerformanceData] = useState<{
    data: { date: string; value: number; return: number }[];
    startValue: number;
    endValue: number;
    percentChange: number;
    source?: string;
    system_date?: string;
    original_data?: any;
  } | null>(null)
  const [sp500Data, setSp500Data] = useState<{
    data: { date: string; value: number; return: number }[];
    startValue: number;
    endValue: number;
    percentChange: number;
  } | null>(null)

  // Calculate total values
  const calculateTotal = (data: AllocationItem[] | undefined): number => {
    if (!data || data.length === 0) return 0;
    return data.reduce((sum, item) => sum + item.value, 0);
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError(null)
      try {
        // Fetch both portfolio performance and S&P 500 data
        const [portfolioResult, sp500Result] = await Promise.all([
          getPerformance(period),
          getSP500Data(period)
        ])
        
        console.log('Performance data received:', portfolioResult)
        console.log('S&P 500 data received:', sp500Result)
        
        // Process portfolio data
        if (!portfolioResult.data || !Array.isArray(portfolioResult.data) || portfolioResult.data.length === 0) {
          setError('Received empty or invalid portfolio data from server');
        } else {
          // Add return values if they don't exist
          const enhancedData = {
            ...portfolioResult,
            data: portfolioResult.data.map((item: any) => {
              // If return already exists, keep it
              if ('return' in item) {
                return item as { date: string; value: number; return: number };
              }
              // Calculate a return based on the value (for demonstration purposes)
              const normalizedValue = item.value / portfolioResult.startValue;
              const sampleReturn = (normalizedValue - 1) * 0.05;
              return {
                date: item.date,
                value: item.value,
                return: sampleReturn
              };
            })
          };
          
          // Log each data point for debugging
          console.log(`Received ${enhancedData.data.length} portfolio data points:`, 
            enhancedData.data.map(point => `${point.date}: ${point.value}, return: ${point.return}`).join(', ')
          );
          
          setPerformanceData(enhancedData);
        }

        // Process S&P 500 data
        if (sp500Result.data && Array.isArray(sp500Result.data) && sp500Result.data.length > 0) {
          setSp500Data(sp500Result);
          console.log(`Received ${sp500Result.data.length} S&P 500 data points`);
        } else {
          console.warn('No S&P 500 data received');
          setSp500Data(null);
        }
        
        // Fetch allocation data separately to avoid blocking UI
        try {
          const allocationResult = await getAllocation();
          setAllocationData(allocationResult);
        } catch (allocationError) {
          console.warn('Failed to fetch allocation data:', allocationError);
        }
        
        // Increment chart key to force re-render
        setChartKey(prev => prev + 1);
      } catch (error) {
        console.error('Failed to fetch data:', error)
        setError('Failed to load performance data. Please try again later.')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [period])

  // Check if data looks like future dates
  const hasFutureDates = performanceData?.data.some(item => {
    try {
      const date = new Date(item.date);
      return date > new Date();
    } catch (e) {
      return false;
    }
  });

  // Make sure we have valid data for the chart
  const hasValidData = !!(performanceData && performanceData.data && performanceData.data.length > 0);

  const regenerateChart = () => {
    setChartKey(prev => prev + 1);
  };

  return (
    <>
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
          
          <button 
            onClick={regenerateChart}
            className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-3 rounded-md text-sm"
            disabled={loading}
          >
            Refresh Chart
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-sm text-gray-500 mb-1">Portfolio Performance</div>
          {loading ? (
            <div className="text-2xl font-semibold">-</div>
          ) : (
            <div
              className={`text-2xl font-semibold flex items-center ${
                performanceData && performanceData.percentChange >= 0
                  ? 'text-green-600'
                  : 'text-red-600'
              }`}
            >
              {performanceData && performanceData.percentChange >= 0 ? (
                <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
              ) : (
                <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              )}
              {Math.abs(performanceData?.percentChange || 0).toFixed(2)}%
            </div>
          )}
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
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
                <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
              ) : (
                <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              )}
              {Math.abs(sp500Data?.percentChange || 0).toFixed(2)}%
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="h-96">
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <div className="text-center">
                <svg className="animate-spin -ml-1 mr-3 h-10 w-10 text-blue-500 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="text-gray-500 mt-2">Loading performance data...</p>
              </div>
            </div>
          ) : hasValidData ? (
            <PerformanceChart 
              key={chartKey} 
              data={performanceData.data} 
              spData={sp500Data?.data || undefined}
            />
          ) : (
            <div className="flex justify-center items-center h-full">
              <p className="text-gray-500">No performance data available for this period</p>
            </div>
          )}
        </div>
      </div>

      {/* Portfolio Allocation Charts */}
      {allocationData && (
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-4">Portfolio Allocation</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Asset Class Chart */}
            {allocationData.assetClass && allocationData.assetClass.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-4">
                <div className="h-[300px]">
                  <AllocationChart 
                    data={allocationData.assetClass.map((item, index) => ({
                      ...item,
                      color: item.color || ['#8fffa9', '#e9e9e9', '#75d7ff', '#c9c9c9'][index % 4]
                    }))} 
                    totalValue={calculateTotal(allocationData.assetClass)} 
                    title="Asset Class" 
                  />
                </div>
              </div>
            )}
            
            {/* Sector Chart */}
            {allocationData.sector && allocationData.sector.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-4">
                <div className="h-[300px]">
                  <AllocationChart 
                    data={allocationData.sector.map((item, index) => ({
                      ...item,
                      color: item.color || ['#292b3c', '#f9d673', '#ff85c0', '#aaaaaa', '#5bc0de', '#99ddff', '#d9534f', '#f0ad4e'][index % 8]
                    }))} 
                    totalValue={calculateTotal(allocationData.sector)} 
                    title="Sector" 
                  />
                </div>
              </div>
            )}
            
            {/* Industry Chart */}
            {allocationData.industry && allocationData.industry.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-4">
                <div className="h-[300px]">
                  <AllocationChart 
                    data={allocationData.industry.map((item, index) => ({
                      ...item,
                      color: item.color || ['#bc8f50', '#f0ad4e', '#ceeaff', '#f3f3ab', '#ffea95', '#ff7575', '#ffc8b3', '#9e9e9e'][index % 8]
                    }))} 
                    totalValue={calculateTotal(allocationData.industry)} 
                    title="Industry" 
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
} 