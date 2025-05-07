import { useState } from 'react'
import { FiInfo, FiFilter } from 'react-icons/fi'

export default function StockRanks() {
  const [sortColumn, setSortColumn] = useState<string>('company')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortDirection('asc')
    }
  }

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Portfolio Stock Ranks</h1>
          <p className="text-gray-600">Stocks ranked by performance, growth, and investment quality</p>
        </div>
        <button className="flex items-center bg-white border border-gray-300 rounded-md py-2 px-4 text-sm text-gray-700 hover:bg-gray-50">
          <FiFilter className="mr-2 h-4 w-4" />
          Filter
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex items-start">
          <div className="rounded-full bg-blue-100 p-2 mr-3">
            <FiInfo className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900">About Stock Ranks</h3>
            <p className="text-sm text-gray-600 mt-1">
              Stocks are ranked based on a proprietary algorithm that considers growth potential, 
              valuation, financial strength, dividend yield, and technical factors. 
              The ranking scale goes from 0-100, with higher scores indicating stronger investment potential.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('company')}
                >
                  Company
                  {sortColumn === 'company' && (
                    <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </th>
                <th 
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('stocksScore')}
                >
                  Stocks Score
                  {sortColumn === 'stocksScore' && (
                    <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </th>
                <th 
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('nextQuarterEarning')}
                >
                  Next Quarter Earning
                  {sortColumn === 'nextQuarterEarning' && (
                    <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </th>
                <th 
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('annualEarning')}
                >
                  Annual Earning
                  {sortColumn === 'annualEarning' && (
                    <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </th>
                <th 
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('growth')}
                >
                  Growth
                  {sortColumn === 'growth' && (
                    <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </th>
                <th 
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('valuation')}
                >
                  Valuation
                  {sortColumn === 'valuation' && (
                    <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </th>
                <th 
                  className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('technicalAnalysis')}
                >
                  Tec Anlys
                  {sortColumn === 'technicalAnalysis' && (
                    <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </th>
                <th 
                  className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('seasonalityShort')}
                >
                  Seasonality
                  {sortColumn === 'seasonalityShort' && (
                    <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </th>
                <th 
                  className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('seasonalityLong')}
                >
                  Seasonality
                  {sortColumn === 'seasonalityLong' && (
                    <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </th>
                <th 
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('priceNow')}
                >
                  Price Now
                  {sortColumn === 'priceNow' && (
                    <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </th>
                <th 
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('analysisTarget')}
                >
                  Analys Target
                  {sortColumn === 'analysisTarget' && (
                    <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </th>
                <th 
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('annualReturn')}
                >
                  Annual Return
                  {sortColumn === 'annualReturn' && (
                    <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {/* Data will be populated here */}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
} 