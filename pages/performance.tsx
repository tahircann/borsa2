import { useState, useEffect } from 'react'
import { getPerformance } from '@/services/ibapi'
import PerformanceChart from '@/components/PerformanceChart'

export default function PerformancePage() {
  const [period, setPeriod] = useState('1m')
  const [loading, setLoading] = useState(true)
  const [performanceData, setPerformanceData] = useState<{
    data: { date: string; value: number }[];
    startValue: number;
    endValue: number;
    percentChange: number;
  } | null>(null)

  useEffect(() => {
    const fetchPerformance = async () => {
      setLoading(true)
      try {
        const result = await getPerformance(period)
        setPerformanceData(result)
      } catch (error) {
        console.error('Failed to fetch performance data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPerformance()
  }, [period])

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Portfolio Performance</h1>
        <div className="flex items-center space-x-2">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="block bg-white border border-gray-300 rounded-md py-2 px-3 text-sm"
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-sm text-gray-500 mb-1">Starting Value</div>
          <div className="text-2xl font-semibold">
            ${loading ? '-' : performanceData?.startValue.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-sm text-gray-500 mb-1">Current Value</div>
          <div className="text-2xl font-semibold">
            ${loading ? '-' : performanceData?.endValue.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-sm text-gray-500 mb-1">Performance</div>
          {loading ? (
            <div className="text-2xl font-semibold">-</div>
          ) : (
            <div
              className={`text-2xl font-semibold ${
                performanceData && performanceData.percentChange >= 0
                  ? 'text-green-600'
                  : 'text-red-600'
              }`}
            >
              {performanceData && performanceData.percentChange >= 0 ? '+' : ''}
              {performanceData?.percentChange.toFixed(2)}%
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="h-96">
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <p className="text-gray-500">Loading chart data...</p>
            </div>
          ) : (
            performanceData && <PerformanceChart data={performanceData.data} />
          )}
        </div>
      </div>
    </>
  )
} 