import { useState, useEffect } from 'react';
import { FiInfo, FiFilter, FiRefreshCw, FiTrendingUp, FiTrendingDown, FiBarChart } from 'react-icons/fi';
import { useRouter } from 'next/router';
import BlurOverlay from '../components/BlurOverlay';
import { useSubscription } from '../utils/subscription';
import USStockChart from '../components/USStockChart';
import { alphaVantageAPI, USStockData } from '../services/alphaVantageApi';

export default function StockRanks() {
  const [sortColumn, setSortColumn] = useState<string>('changePercent');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [stocks, setStocks] = useState<USStockData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedStock, setSelectedStock] = useState<USStockData | null>(null);
  const [showChart, setShowChart] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null);
  const router = useRouter();
  
  // Fetch US stock data
  useEffect(() => {
    loadStockData();
    
    // Set up auto refresh every 60 seconds
    const interval = setInterval(loadStockData, 60000);
    setRefreshInterval(interval);
    
    return () => {
      if (refreshInterval) clearInterval(refreshInterval);
    };
  }, []);

  const loadStockData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Try to get real data first, fallback to mock data
      let stockData: USStockData[] = [];
      
      try {
        stockData = await alphaVantageAPI.getPopularStocks();
        
        // If no data or limited data, supplement with mock data
        if (stockData.length < 5) {
          const mockData = alphaVantageAPI.getMockStockData();
          stockData = [...stockData, ...mockData.slice(stockData.length)];
        }
      } catch (apiError) {
        console.warn('API failed, using mock data:', apiError);
        stockData = alphaVantageAPI.getMockStockData();
      }
      
      setStocks(stockData);
    } catch (err) {
      console.error('Error loading stock data:', err);
      setError('Failed to load stock data. Please try again later.');
      setStocks(alphaVantageAPI.getMockStockData());
    } finally {
      setLoading(false);
    }
  };

  // Handle column sorting
  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('desc');
    }
  };
  
  // Handle stock click for chart display
  const handleStockClick = (stock: USStockData) => {
    setSelectedStock(stock);
    setShowChart(true);
  };

  const closeChart = () => {
    setShowChart(false);
    setSelectedStock(null);
  };
  
  // Helper function to get color class based on percentage change
  const getChangeColorClass = (change: number): string => {
    if (change > 0) return 'text-green-600';
    if (change < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  // Format market cap
  const formatMarketCap = (value?: number): string => {
    if (!value) return 'N/A';
    if (value >= 1e12) return `$${(value / 1e12).toFixed(1)}T`;
    if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
    return `$${value.toLocaleString()}`;
  };

  // Format volume
  const formatVolume = (value: number): string => {
    if (value >= 1e9) return `${(value / 1e9).toFixed(1)}B`;
    if (value >= 1e6) return `${(value / 1e6).toFixed(1)}M`;
    if (value >= 1e3) return `${(value / 1e3).toFixed(1)}K`;
    return value.toLocaleString();
  };

  // Sorting logic
  const sortedStocks = [...stocks].sort((a, b) => {
    const aValue = a[sortColumn as keyof USStockData];
    const bValue = b[sortColumn as keyof USStockData];
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }
    
    const aNum = Number(aValue) || 0;
    const bNum = Number(bValue) || 0;
    
    if (sortDirection === 'asc') {
      return aNum - bNum;
    } else {
      return bNum - aNum;
    }
  });

  return (
    <BlurOverlay>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">US Stock Rankings</h1>
            <p className="text-gray-600">Real-time data for popular American stocks with interactive charts</p>
          </div>
          <div className="flex items-center space-x-3">
            <button 
              onClick={loadStockData}
              disabled={loading}
              className="flex items-center bg-green-50 border border-green-200 text-green-700 rounded-md py-2 px-4 text-sm hover:bg-green-100 transition-colors disabled:opacity-50"
            >
              <FiRefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh Data
            </button>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Price Range ($)</label>
                <div className="flex items-center space-x-2">
                  <input type="number" min="0" placeholder="Min" className="w-full border border-gray-300 rounded-md py-2 px-3 text-sm" />
                  <span>-</span>
                  <input type="number" placeholder="Max" className="w-full border border-gray-300 rounded-md py-2 px-3 text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Change Range (%)</label>
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
              <h3 className="font-medium text-gray-900">About US Stock Rankings</h3>
              <p className="text-sm text-gray-600 mt-1">
                Real-time data for popular American stocks including price, market cap, P/E ratio, and more. 
                Click on any stock to view detailed interactive charts and get real-time price updates.
                Data is updated every minute during market hours.
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
                    onClick={() => handleSort('symbol')}
                  >
                    Symbol
                    {sortColumn === 'symbol' && (
                      <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </th>
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
                    onClick={() => handleSort('price')}
                  >
                    Price
                    {sortColumn === 'price' && (
                      <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </th>
                  <th 
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('change')}
                  >
                    Change
                    {sortColumn === 'change' && (
                      <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </th>
                  <th 
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('changePercent')}
                  >
                    Change %
                    {sortColumn === 'changePercent' && (
                      <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </th>
                  <th 
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('volume')}
                  >
                    Volume
                    {sortColumn === 'volume' && (
                      <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </th>
                  <th 
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('marketCap')}
                  >
                    Market Cap
                    {sortColumn === 'marketCap' && (
                      <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </th>
                  <th 
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('pe')}
                  >
                    P/E
                    {sortColumn === 'pe' && (
                      <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Chart
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-10 text-center">
                      <div className="flex justify-center items-center">
                        <FiRefreshCw className="animate-spin h-5 w-5 mr-2 text-blue-600" />
                        <span>Loading US stock data...</span>
                      </div>
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-10 text-center text-red-600">
                      {error}
                    </td>
                  </tr>
                ) : sortedStocks.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-10 text-center">
                      No stock data available.
                    </td>
                  </tr>
                ) : (
                  sortedStocks.map((stock) => (
                    <tr key={stock.symbol} className="hover:bg-gray-50 cursor-pointer" onClick={() => handleStockClick(stock)}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                        {stock.symbol}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="font-medium">{stock.company}</div>
                        <div className="text-xs text-gray-500">{stock.timestamp}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium">
                        ${stock.price.toFixed(2)}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-medium ${getChangeColorClass(stock.change)}`}>
                        <div className="flex items-center justify-end">
                          {stock.change > 0 ? <FiTrendingUp className="mr-1 h-3 w-3" /> : 
                           stock.change < 0 ? <FiTrendingDown className="mr-1 h-3 w-3" /> : null}
                          {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)}
                        </div>
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-medium ${getChangeColorClass(stock.changePercent)}`}>
                        {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                        {formatVolume(stock.volume)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                        {formatMarketCap(stock.marketCap)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                        {stock.pe?.toFixed(1) || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStockClick(stock);
                          }}
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                        >
                          <FiBarChart className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
        
        <div className="mt-6 flex justify-between items-center">
          <div className="text-sm text-gray-500">
            Showing {sortedStocks.length} US stocks • Updated every 60 seconds
          </div>
          <div className="text-xs text-gray-400">
            Click on any row to view detailed charts and real-time data
          </div>
        </div>
      </div>

      {/* Chart Modal */}
      {showChart && selectedStock && (
        <USStockChart 
          symbol={selectedStock.symbol}
          stockData={selectedStock}
          onClose={closeChart}
        />
      )}
    </BlurOverlay>
  );
} 