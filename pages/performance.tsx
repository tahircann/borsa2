import { useState, useEffect } from 'react'
import { getPerformance } from '@/services/ibapi'
import PerformanceChart from '@/components/PerformanceChart'

export default function PerformancePage() {
  const [period, setPeriod] = useState('1m')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [chartKey, setChartKey] = useState(0); // Force chart re-render
  const [performanceData, setPerformanceData] = useState<{
    data: { date: string; value: number; return: number }[];
    startValue: number;
    endValue: number;
    percentChange: number;
    source?: string;
    system_date?: string;
    original_data?: any;
  } | null>(null)

  useEffect(() => {
    const fetchPerformance = async () => {
      setLoading(true)
      setError(null)
      try {
        const result = await getPerformance(period)
        console.log('Performance data received:', result)
        
        // Make sure we have valid data for the chart
        if (!result.data || !Array.isArray(result.data) || result.data.length === 0) {
          setError('Received empty or invalid data from server');
        } else {
          // Add return values if they don't exist
          const enhancedData = {
            ...result,
            data: result.data.map(item => {
              // If return already exists, keep it
              if ('return' in item) {
                return item as { date: string; value: number; return: number };
              }
              // Calculate a return based on the value (for demonstration purposes)
              const normalizedValue = item.value / result.startValue;
              const sampleReturn = (normalizedValue - 1) * 0.05;
              return {
                date: item.date,
                value: item.value,
                return: sampleReturn
              };
            })
          };
          
          // Log each data point for debugging
          console.log(`Received ${enhancedData.data.length} data points:`, 
            enhancedData.data.map(point => `${point.date}: ${point.value}, return: ${point.return}`).join(', ')
          );
          
          setPerformanceData(enhancedData);
        }
        
        // Increment chart key to force re-render
        setChartKey(prev => prev + 1);
      } catch (error) {
        console.error('Failed to fetch performance data:', error)
        setError('Failed to load performance data. Please try again later.')
      } finally {
        setLoading(false)
      }
    }

    fetchPerformance()
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
        <h1 className="text-2xl font-bold">Portfolio Performance</h1>
        <div className="flex items-center space-x-2">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="block bg-white border border-gray-300 rounded-md py-2 px-3 text-sm"
            disabled={loading}
          >
            <option value="1w">1 Week</option>
            <option value="1m">1 Month</option>
            <option value="3m">3 Months</option>
            <option value="6m">6 Months</option>
            <option value="1y">1 Year</option>
            <option value="all">All Time</option>
          </select>
          
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

      {performanceData?.source === 'mock_data' && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded mb-6">
          Note: Currently showing estimated performance data. This may not reflect actual account performance.
        </div>
      )}

      {hasFutureDates && (
        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded mb-6">
          Note: The system date appears to be incorrect. The chart shows data with future dates.
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-sm text-gray-500 mb-1">Starting Value</div>
          <div className="text-2xl font-semibold">
            {loading ? (
              '-'
            ) : (
              <>$
                {performanceData?.startValue.toLocaleString(undefined, {
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
                {performanceData?.endValue.toLocaleString(undefined, {
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
            <PerformanceChart key={chartKey} data={performanceData.data} />
          ) : (
            <div className="flex justify-center items-center h-full">
              <p className="text-gray-500">No performance data available for this period</p>
            </div>
          )}
        </div>
      </div>

      {/* Debug bölümü - Gelen ham verileri göster */}
      <div className="bg-gray-100 rounded-lg p-4 mb-6 overflow-auto">
        <h3 className="text-lg font-semibold mb-2">Debug: Raw Performance Data</h3>
        <div className="mb-2">
          <span className="font-medium">Data points:</span> {performanceData?.data.length || 0}
        </div>
        <details>
          <summary className="cursor-pointer text-blue-600 hover:text-blue-800">Show Raw Data</summary>
          <pre className="bg-white p-4 rounded mt-2 overflow-auto max-h-96 text-xs">
            {performanceData ? JSON.stringify(performanceData, null, 2) : 'No data'}
          </pre>
        </details>
        
        <h4 className="text-md font-semibold mt-4 mb-2">Data Points Sample</h4>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left">Index</th>
                <th className="px-3 py-2 text-left">Date</th>
                <th className="px-3 py-2 text-right">Return</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {performanceData?.data.slice(0, 10).map((item, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                  <td className="px-3 py-2">{index}</td>
                  <td className="px-3 py-2">{item.date}</td>
                  <td className="px-3 py-2 text-right">{(item.return * 100).toFixed(2)}%</td>
                </tr>
              ))}
              {performanceData && performanceData.data.length > 10 && (
                <tr>
                  <td colSpan={3} className="px-3 py-2 text-center text-gray-500">
                    ...and {performanceData.data.length - 10} more data points
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
} 