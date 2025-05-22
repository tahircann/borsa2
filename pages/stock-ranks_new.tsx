import { useState, useEffect } from 'react'
import { FiInfo, FiFilter, FiRefreshCw, FiArrowRight } from 'react-icons/fi'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useAuth } from '../utils/auth'
import { SubscriptionContext } from '@/components/Layout'
import BlurOverlay from '@/components/BlurOverlay'

// Mock API service for demonstration
const mockStockData = [
  {
    symbol: 'AAPL',
    company: 'Apple Inc.',
    price: 182.63,
    stockScore: 87,
    nextQuarterEarning: 2.8,
    annualEarningGrowth: 8.4,
    growth: 15.7,
    valuation: -2.3,
    technicalScore: 75,
    seasonalityShort: 82,
    seasonalityLong: 68,
    targetPrice: 210.50,
    annualReturn: 12.8
  },
  {
    symbol: 'MSFT',
    company: 'Microsoft Corporation',
    price: 402.75,
    stockScore: 92,
    nextQuarterEarning: 3.5,
    annualEarningGrowth: 10.2,
    growth: 18.3,
    valuation: -1.9,
    technicalScore: 88,
    seasonalityShort: 76,
    seasonalityLong: 85,
    targetPrice: 455.00,
    annualReturn: 14.7
  },
  {
    symbol: 'GOOGL',
    company: 'Alphabet Inc.',
    price: 176.25,
    stockScore: 85,
    nextQuarterEarning: 2.4,
    annualEarningGrowth: 7.9,
    growth: 14.1,
    valuation: -0.8,
    technicalScore: 71,
    seasonalityShort: 64,
    seasonalityLong: 79,
    targetPrice: 195.00,
    annualReturn: 11.5
  },
  {
    symbol: 'AMZN',
    company: 'Amazon.com Inc.',
    price: 185.07,
    stockScore: 81,
    nextQuarterEarning: 1.2,
    annualEarningGrowth: 6.7,
    growth: 12.9,
    valuation: -3.4,
    technicalScore: 68,
    seasonalityShort: 72,
    seasonalityLong: 74,
    targetPrice: 210.00,
    annualReturn: 9.8
  },
  {
    symbol: 'META',
    company: 'Meta Platforms Inc.',
    price: 493.50,
    stockScore: 78,
    nextQuarterEarning: 2.0,
    annualEarningGrowth: 5.4,
    growth: 11.2,
    valuation: -2.7,
    technicalScore: 70,
    seasonalityShort: 68,
    seasonalityLong: 65,
    targetPrice: 520.00,
    annualReturn: 8.6
  }
];

// Define stock info interface
interface StockInfo {
  symbol: string;
  company: string;
  price: number;
  stockScore: number;
  nextQuarterEarning: number;
  annualEarningGrowth: number;
  growth: number;
  valuation: number;
  technicalScore: number;
  seasonalityShort: number;
  seasonalityLong: number;
  targetPrice: number;
  annualReturn: number;
}

export default function StockRanks() {
  const [sortColumn, setSortColumn] = useState<string>('stockScore')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [stocks, setStocks] = useState<StockInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filterOpen, setFilterOpen] = useState(false)
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false)
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  
  // Fetch stock data from portfolio-stock-ranks
  useEffect(() => {
    const loadStockData = async () => {
      try {
        setLoading(true)
        
        // In a real implementation, this would be an API call to fetch data
        // For demonstration, we're using mock data
        setTimeout(() => {
          setStocks(mockStockData)
          setLoading(false)
        }, 1000)
      } catch (err) {
        console.error('Error loading stock data:', err)
        setError('Failed to load stock data. Please try again later.')
        setLoading(false)
      }
    }
    
    loadStockData()
  }, [])

  // Handle column sorting
  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortDirection('desc') // Default to descending for most financial metrics
    }
  }
  
  // Helper function to get color class based on score value
  function getScoreColorClass(score: number): string {
    if (score >= 80) return 'bg-green-100 text-green-800';
    if (score >= 60) return 'bg-blue-100 text-blue-800';
    if (score >= 40) return 'bg-yellow-100 text-yellow-800';
    if (score >= 20) return 'bg-orange-100 text-orange-800';
    return 'bg-red-100 text-red-800';
  }
  
  // Helper function to format values with +/- sign
  function formatWithSign(value: number): string {
    return value >= 0 ? `+${value.toFixed(2)}%` : `${value.toFixed(2)}%`;
  }

  // Sorting logic
  const sortedStocks = [...stocks].sort((a, b) => {
    const aValue = a[sortColumn as keyof StockInfo] as number;
    const bValue = b[sortColumn as keyof StockInfo] as number;
    
    if (sortDirection === 'asc') {
      return aValue - bValue;
    } else {
      return bValue - aValue;
    }
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Stock Ranks</h1>
          <p className="text-gray-600">Stocks ranked by performance, growth, and investment quality</p>
        </div>
        <div className="flex items-center space-x-3">
          <Link 
            href="/portfolio-stock-ranks" 
            className="flex items-center bg-blue-50 border border-blue-200 text-blue-700 rounded-md py-2 px-4 text-sm hover:bg-blue-100 transition-colors"
          >
            View Portfolio Stocks <FiArrowRight className="ml-1" />
          </Link>
          <button 
            onClick={() => setFilterOpen(!filterOpen)}
            className="flex items-center bg-white border border-gray-300 rounded-md py-2 px-4 text-sm text-gray-700 hover:bg-gray-50"
          >
            <FiFilter className="mr-2 h-4 w-4" />
            Filter
          </button>
        </div>
      </div>

      {filterOpen && (
        <div className="bg-white rounded-lg shadow-md p-4 mb-6 border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stock Score Range</label>
              <div className="flex items-center space-x-2">
                <input type="number" min="0" max="100" placeholder="Min" className="w-full border border-gray-300 rounded-md py-2 px-3 text-sm" />
                <span>-</span>
                <input type="number" min="0" max="100" placeholder="Max" className="w-full border border-gray-300 rounded-md py-2 px-3 text-sm" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Growth Range</label>
              <div className="flex items-center space-x-2">
                <input type="number" placeholder="Min %" className="w-full border border-gray-300 rounded-md py-2 px-3 text-sm" />
                <span>-</span>
                <input type="number" placeholder="Max %" className="w-full border border-gray-300 rounded-md py-2 px-3 text-sm" />
              </div>
            </div>
            <div className="flex items-end">
              <button className="bg-blue-600 text-white rounded-md py-2 px-4 text-sm hover:bg-blue-700 w-full">
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

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
                  onClick={() => handleSort('stockScore')}
                >
                  Stock Score
                  {sortColumn === 'stockScore' && (
                    <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </th>
                <th 
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('nextQuarterEarning')}
                >
                  Next Quarter
                  {sortColumn === 'nextQuarterEarning' && (
                    <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </th>
                <th 
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('annualEarningGrowth')}
                >
                  Annual Earning
                  {sortColumn === 'annualEarningGrowth' && (
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
                  onClick={() => handleSort('technicalScore')}
                >
                  Technical
                  {sortColumn === 'technicalScore' && (
                    <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </th>
                <th 
                  className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('seasonalityShort')}
                >
                  Short Season
                  {sortColumn === 'seasonalityShort' && (
                    <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </th>
                <th 
                  className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('seasonalityLong')}
                >
                  Long Season
                  {sortColumn === 'seasonalityLong' && (
                    <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </th>
                <th 
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('price')}
                >
                  Price Now
                  {sortColumn === 'price' && (
                    <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </th>
                <th 
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('targetPrice')}
                >
                  Target Price
                  {sortColumn === 'targetPrice' && (
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
              {loading ? (
                <tr>
                  <td colSpan={12} className="px-6 py-10 text-center">
                    <div className="flex justify-center items-center">
                      <FiRefreshCw className="animate-spin h-5 w-5 mr-2 text-blue-600" />
                      <span>Loading stock data...</span>
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={12} className="px-6 py-10 text-center text-red-600">
                    {error}
                  </td>
                </tr>
              ) : sortedStocks.length === 0 ? (
                <tr>
                  <td colSpan={12} className="px-6 py-10 text-center">
                    No stock data available.
                  </td>
                </tr>
              ) : (
                sortedStocks.map((stock) => (
                  <tr key={stock.symbol} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      <div className="flex items-center">
                        <div className="font-medium">{stock.symbol}</div>
                        <div className="text-gray-500 ml-2 text-xs">{stock.company}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getScoreColorClass(stock.stockScore)}`}>
                        {stock.stockScore}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                      {formatWithSign(stock.nextQuarterEarning)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                      {formatWithSign(stock.annualEarningGrowth)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                      {formatWithSign(stock.growth)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                      {formatWithSign(stock.valuation)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getScoreColorClass(stock.technicalScore)}`}>
                        {stock.technicalScore}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getScoreColorClass(stock.seasonalityShort)}`}>
                        {stock.seasonalityShort}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getScoreColorClass(stock.seasonalityLong)}`}>
                        {stock.seasonalityLong}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                      ${stock.price.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                      ${stock.targetPrice.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                      {formatWithSign(stock.annualReturn)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="mt-6 flex justify-between items-center">
        <div className="text-sm text-gray-500">Showing {sortedStocks.length} stocks</div>
        <Link 
          href="/portfolio-stock-ranks" 
          className="flex items-center text-blue-600 hover:text-blue-800"
        >
          View detailed portfolio analysis <FiArrowRight className="ml-1" />
        </Link>
      </div>
    </div>
  )
}
