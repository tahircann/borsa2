import { useState } from 'react'
import { FiInfo, FiFilter } from 'react-icons/fi'

export default function StockRanks() {
  const [sortColumn, setSortColumn] = useState<string>('rank')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

  // Mock data for stock ranks
  const stockRanks = [
    { symbol: 'AAPL', name: 'Apple Inc.', rank: 1, score: 92, pe: 30.2, growth: 8.5, dividend: 0.52, momentum: 'Strong' },
    { symbol: 'MSFT', name: 'Microsoft Corp.', rank: 2, score: 89, pe: 34.8, growth: 10.2, dividend: 0.80, momentum: 'Strong' },
    { symbol: 'GOOGL', name: 'Alphabet Inc.', rank: 3, score: 85, pe: 26.1, growth: 7.8, dividend: 0, momentum: 'Moderate' },
    { symbol: 'AMZN', name: 'Amazon.com Inc.', rank: 4, score: 82, pe: 60.3, growth: 15.2, dividend: 0, momentum: 'Strong' },
    { symbol: 'META', name: 'Meta Platforms Inc.', rank: 5, score: 79, pe: 24.8, growth: 6.2, dividend: 0, momentum: 'Moderate' },
    { symbol: 'TSLA', name: 'Tesla Inc.', rank: 6, score: 78, pe: 76.2, growth: 25.8, dividend: 0, momentum: 'Volatile' },
    { symbol: 'V', name: 'Visa Inc.', rank: 7, score: 77, pe: 30.4, growth: 6.5, dividend: 0.75, momentum: 'Moderate' },
    { symbol: 'JPM', name: 'JPMorgan Chase & Co.', rank: 8, score: 75, pe: 12.8, growth: 3.2, dividend: 2.60, momentum: 'Stable' },
    { symbol: 'JNJ', name: 'Johnson & Johnson', rank: 9, score: 73, pe: 16.5, growth: 2.8, dividend: 2.75, momentum: 'Stable' },
    { symbol: 'PG', name: 'Procter & Gamble Co.', rank: 10, score: 71, pe: 24.2, growth: 3.5, dividend: 2.50, momentum: 'Stable' },
  ]

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortDirection('asc')
    }
  }

  const sortedStocks = [...stockRanks].sort((a, b) => {
    const aValue = a[sortColumn as keyof typeof a]
    const bValue = b[sortColumn as keyof typeof b]

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

  // Render functions for table cells
  const renderMomentum = (momentum: string) => {
    const styles: Record<string, string> = {
      Strong: 'bg-green-100 text-green-800',
      Moderate: 'bg-blue-100 text-blue-800',
      Stable: 'bg-gray-100 text-gray-800',
      Volatile: 'bg-yellow-100 text-yellow-800',
      Weak: 'bg-red-100 text-red-800'
    }

    return (
      <span className={`px-2 py-1 text-xs rounded-full ${styles[momentum]}`}>
        {momentum}
      </span>
    )
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
                  onClick={() => handleSort('rank')}
                >
                  Rank
                  {sortColumn === 'rank' && (
                    <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </th>
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
                  Company
                </th>
                <th 
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('score')}
                >
                  Score
                  {sortColumn === 'score' && (
                    <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </th>
                <th 
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('pe')}
                >
                  P/E Ratio
                  {sortColumn === 'pe' && (
                    <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </th>
                <th 
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('growth')}
                >
                  Growth (%)
                  {sortColumn === 'growth' && (
                    <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </th>
                <th 
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('dividend')}
                >
                  Dividend (%)
                  {sortColumn === 'dividend' && (
                    <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </th>
                <th 
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('momentum')}
                >
                  Momentum
                  {sortColumn === 'momentum' && (
                    <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedStocks.map((stock) => (
                <tr key={stock.symbol} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    #{stock.rank}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {stock.symbol}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {stock.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                    <span className={`font-semibold ${
                      stock.score >= 80 ? 'text-green-600' : 
                      stock.score >= 70 ? 'text-blue-600' : 
                      stock.score >= 60 ? 'text-gray-600' : 
                      'text-orange-600'
                    }`}>
                      {stock.score}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                    {stock.pe.toFixed(1)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                    <span className={stock.growth > 5 ? 'text-green-600' : 'text-gray-600'}>
                      {stock.growth.toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                    {stock.dividend.toFixed(2)}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                    {renderMomentum(stock.momentum)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
} 