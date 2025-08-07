import { useState, useEffect } from 'react';
import { FiInfo, FiFilter, FiRefreshCw, FiTrendingUp, FiTrendingDown, FiBarChart, FiSettings, FiStar, FiEdit3 } from 'react-icons/fi';
import { useRouter } from 'next/router';
import PremiumGuard from '../components/PremiumGuard';
import { useSubscription } from '../utils/subscription';
import { useAuth } from '../utils/auth';
import USStockChart from '../components/USStockChart';
import { getPortfolio, type Portfolio, type Position } from '../services/ibapi';

// Convert Portfolio Position to Stock data format
interface StockData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume?: number;
  marketCap?: number;
  pe?: number;
  dividendYield?: number;
  averageCost?: number;
  quantity?: number;
  marketValue?: number;
  unrealizedPnL?: number;
  country?: string;
  // Additional fields for compatibility and editing
  company?: string;
  timestamp?: string;
  stockScore?: number;
  quarterRevenueEarning?: string;
  annualRevenueEarning?: string;
  growth?: string;
  valuation?: string;
  techAnalysis?: string;
  seasonality?: string;
  analysisPriceTarget?: string;
  upsidePotential?: string;
}

export default function StockRanks() {
  const [sortColumn, setSortColumn] = useState<string>('marketValue');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [stocks, setStocks] = useState<StockData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedStock, setSelectedStock] = useState<StockData | null>(null);
  const [showChart, setShowChart] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [editingStock, setEditingStock] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const { isSubscribed } = useSubscription();
  const { user } = useAuth();
  
  // Handle admin state and mounting to prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
    setIsAdmin(user?.isAdmin || false);
  }, [user]);

  // Fetch portfolio data and convert to stock format
  useEffect(() => {
    loadStockData();
    
    // Set up auto refresh every 60 seconds
    const interval = setInterval(loadStockData, 60000);
    setRefreshInterval(interval);
    
    return () => {
      clearInterval(interval);
    };
  }, []);

  const loadStockData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Get portfolio data
      const portfolio = await getPortfolio();
      
      // Convert portfolio positions to stock data format
      const stockData: StockData[] = (portfolio.positions || []).map((position: Position) => ({
        symbol: position.symbol,
        name: position.name,
        price: position.quantity > 0 ? position.marketValue / position.quantity : 0,
        change: position.unrealizedPnL,
        changePercent: position.percentChange,
        dividendYield: position.dividendYield || 0,
        averageCost: position.averageCost,
        quantity: position.quantity,
        marketValue: position.marketValue,
        unrealizedPnL: position.unrealizedPnL,
        country: position.country || 'US',
        volume: 0, // Not available from portfolio data
        marketCap: 0, // Not available from portfolio data  
        pe: 0 // Not available from portfolio data
      }));
      
      setStocks(stockData);
    } catch (err) {
      console.error('Error loading portfolio data:', err);
      setError('Failed to load portfolio data. Please try again later.');
      setStocks([]);
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
  const handleStockClick = (stock: StockData) => {
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

  // Format stock score with color
  const formatStockScore = (score?: number): JSX.Element => {
    if (!score) return <span className="text-gray-400">N/A</span>;
    
    let colorClass = 'text-yellow-600';
    if (score >= 80) colorClass = 'text-green-600';
    else if (score >= 60) colorClass = 'text-blue-600';
    else if (score < 40) colorClass = 'text-red-600';
    
    return (
      <div className="flex items-center">
        <FiStar className={`mr-1 h-3 w-3 ${colorClass}`} />
        <span className={`font-medium ${colorClass}`}>{score}</span>
        <span className="text-gray-400 text-xs ml-1">/100</span>
      </div>
    );
  };

  // Get valuation color class
  const getValuationColorClass = (valuation?: string): string => {
    if (!valuation) return 'text-gray-600';
    switch (valuation.toLowerCase()) {
      case 'buy':
      case 'strong buy':
        return 'text-green-600';
      case 'sell':
      case 'strong sell':
        return 'text-red-600';
      case 'overvalued':
        return 'text-orange-600';
      case 'undervalued':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  // Handle admin edit
  const handleEditStock = (symbol: string, field: string, value: string) => {
    setStocks(prevStocks => 
      prevStocks.map(stock => 
        stock.symbol === symbol 
          ? { ...stock, [field]: value }
          : stock
      )
    );
  };

  // Sorting logic
  const sortedStocks = [...stocks].sort((a, b) => {
    const aValue = a[sortColumn as keyof StockData];
    const bValue = b[sortColumn as keyof StockData];
    
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
    <PremiumGuard 
      useBlurOverlay={true} 
      blurMessage="Upgrade to access advanced stock analysis and rankings"
    >
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
            {mounted && isAdmin && (
              <button 
                onClick={() => setShowAdminPanel(!showAdminPanel)}
                className="flex items-center bg-blue-50 border border-blue-200 text-blue-700 rounded-md py-2 px-4 text-sm hover:bg-blue-100 transition-colors"
              >
                <FiSettings className="mr-2 h-4 w-4" />
                Admin Panel
              </button>
            )}
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

        {/* Admin Panel */}
        {mounted && showAdminPanel && isAdmin && (
          <div className="bg-blue-50 rounded-lg shadow-md p-4 mb-6 border border-blue-200">
            <h3 className="text-lg font-semibold text-blue-800 mb-3 flex items-center">
              <FiSettings className="mr-2" />
              Admin Panel - Stock Data Management
            </h3>
            <div className="text-sm text-blue-700 mb-4">
              <p>Burada stock verilerini düzenleyebilirsiniz. Düzenlemek istediğiniz hücreye tıklayın.</p>
              <p className="mt-1">Editlenebilir kolonlar: Stock Score, Quarter Revenue, Annual Revenue, Growth, Valuation, Tech Analysis, Seasonality, Price Target, Upside Potential</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Admin Mode Active</span>
              </div>
              <button 
                onClick={() => setEditingStock(null)}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Cancel All Edits
              </button>
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
                  <th 
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('marketValue')}
                  >
                    Market Value
                    {sortColumn === 'marketValue' && (
                      <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </th>
                  <th 
                    className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('stockScore')}
                  >
                    Stock Score
                    {sortColumn === 'stockScore' && (
                      <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </th>
                  <th 
                    className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('quarterRevenueEarning')}
                  >
                    Quarter Revenue
                    {sortColumn === 'quarterRevenueEarning' && (
                      <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </th>
                  <th 
                    className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('annualRevenueEarning')}
                  >
                    Annual Revenue
                    {sortColumn === 'annualRevenueEarning' && (
                      <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </th>
                  <th 
                    className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('growth')}
                  >
                    Growth
                    {sortColumn === 'growth' && (
                      <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </th>
                  <th 
                    className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('valuation')}
                  >
                    Valuation
                    {sortColumn === 'valuation' && (
                      <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </th>
                  <th 
                    className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('techAnalysis')}
                  >
                    Tech Analysis
                    {sortColumn === 'techAnalysis' && (
                      <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </th>
                  <th 
                    className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('seasonality')}
                  >
                    Seasonality
                    {sortColumn === 'seasonality' && (
                      <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </th>
                  <th 
                    className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('analysisPriceTarget')}
                  >
                    Price Target
                    {sortColumn === 'analysisPriceTarget' && (
                      <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </th>
                  <th 
                    className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('upsidePotential')}
                  >
                    Upside Potential
                    {sortColumn === 'upsidePotential' && (
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
                    <td colSpan={18} className="px-6 py-10 text-center">
                      <div className="flex justify-center items-center">
                        <FiRefreshCw className="animate-spin h-5 w-5 mr-2 text-blue-600" />
                        <span>Loading US stock data...</span>
                      </div>
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={18} className="px-6 py-10 text-center text-red-600">
                      {error}
                    </td>
                  </tr>
                ) : sortedStocks.length === 0 ? (
                  <tr>
                    <td colSpan={18} className="px-6 py-10 text-center">
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
                        {formatVolume(stock.volume || 0)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                        {formatMarketCap(stock.marketCap)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                        {stock.pe?.toFixed(1) || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium">
                        ${stock.marketValue?.toLocaleString() || 'N/A'}
                      </td>
                      {/* Yeni kolonlar */}
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {isAdmin ? (
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={stock.stockScore || ''}
                            onChange={(e) => handleEditStock(stock.symbol, 'stockScore', e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            className="w-16 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:border-blue-500 text-center"
                            placeholder="85"
                          />
                        ) : (
                          formatStockScore(stock.stockScore)
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                        {isAdmin ? (
                          <input
                            type="text"
                            value={stock.quarterRevenueEarning || ''}
                            onChange={(e) => handleEditStock(stock.symbol, 'quarterRevenueEarning', e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            className="w-20 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                            placeholder="Earning"
                          />
                        ) : (
                          stock.quarterRevenueEarning || 'N/A'
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                        {isAdmin ? (
                          <input
                            type="text"
                            value={stock.annualRevenueEarning || ''}
                            onChange={(e) => handleEditStock(stock.symbol, 'annualRevenueEarning', e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            className="w-20 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                            placeholder="Annual"
                          />
                        ) : (
                          stock.annualRevenueEarning || 'N/A'
                        )}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm text-center ${getChangeColorClass(parseFloat(stock.growth?.replace('%', '') || '0'))}`}>
                        {isAdmin ? (
                          <input
                            type="text"
                            value={stock.growth || ''}
                            onChange={(e) => handleEditStock(stock.symbol, 'growth', e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            className="w-16 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                            placeholder="+5%"
                          />
                        ) : (
                          stock.growth || 'N/A'
                        )}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm text-center ${getValuationColorClass(stock.valuation)}`}>
                        {isAdmin ? (
                          <select
                            value={stock.valuation || ''}
                            onChange={(e) => handleEditStock(stock.symbol, 'valuation', e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            className="px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                          >
                            <option value="">Select</option>
                            <option value="Buy">Buy</option>
                            <option value="Strong Buy">Strong Buy</option>
                            <option value="Hold">Hold</option>
                            <option value="Sell">Sell</option>
                            <option value="Strong Sell">Strong Sell</option>
                            <option value="Overvalued">Overvalued</option>
                            <option value="Undervalued">Undervalued</option>
                            <option value="Fair">Fair</option>
                          </select>
                        ) : (
                          stock.valuation || 'N/A'
                        )}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm text-center ${getValuationColorClass(stock.techAnalysis)}`}>
                        {isAdmin ? (
                          <select
                            value={stock.techAnalysis || ''}
                            onChange={(e) => handleEditStock(stock.symbol, 'techAnalysis', e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            className="px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                          >
                            <option value="">Select</option>
                            <option value="Strong Buy">Strong Buy</option>
                            <option value="Buy">Buy</option>
                            <option value="Bullish">Bullish</option>
                            <option value="Neutral">Neutral</option>
                            <option value="Bearish">Bearish</option>
                            <option value="Sell">Sell</option>
                            <option value="Volatile">Volatile</option>
                          </select>
                        ) : (
                          stock.techAnalysis || 'N/A'
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                        {isAdmin ? (
                          <select
                            value={stock.seasonality || ''}
                            onChange={(e) => handleEditStock(stock.symbol, 'seasonality', e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            className="px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                          >
                            <option value="">Select</option>
                            <option value="Strong">Strong</option>
                            <option value="Positive">Positive</option>
                            <option value="Neutral">Neutral</option>
                            <option value="Negative">Negative</option>
                            <option value="Weak">Weak</option>
                          </select>
                        ) : (
                          stock.seasonality || 'N/A'
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-medium">
                        {isAdmin ? (
                          <input
                            type="text"
                            value={stock.analysisPriceTarget || ''}
                            onChange={(e) => handleEditStock(stock.symbol, 'analysisPriceTarget', e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            className="w-20 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                            placeholder="$200"
                          />
                        ) : (
                          stock.analysisPriceTarget || 'N/A'
                        )}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm text-center font-medium ${getChangeColorClass(parseFloat(stock.upsidePotential?.replace('%', '') || '0'))}`}>
                        {isAdmin ? (
                          <input
                            type="text"
                            value={stock.upsidePotential || ''}
                            onChange={(e) => handleEditStock(stock.symbol, 'upsidePotential', e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            className="w-16 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                            placeholder="+10%"
                          />
                        ) : (
                          stock.upsidePotential || 'N/A'
                        )}
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
            Showing {sortedStocks.length} US stocks (max 100) • Updated every 60 seconds
            {isAdmin && <span className="ml-2 text-blue-600">• Admin Mode Active</span>}
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-xs text-gray-400">
              Click on any row to view detailed charts and real-time data
              {isAdmin && <span className="ml-2">• Edit cells to modify data</span>}
            </div>
            {/* Admin bilgisi */}
            {isAdmin && (
              <div className="text-xs text-blue-600 font-medium">
                Admin Mode: Cells are editable
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Chart Modal */}
      {showChart && selectedStock && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-semibold">{selectedStock.symbol} - {selectedStock.name}</h3>
              <button
                onClick={closeChart}
                className="text-gray-500 hover:text-gray-700 text-xl font-bold"
              >
                ×
              </button>
            </div>
            <div className="p-4">
              <p>Chart functionality temporarily disabled for portfolio-based stocks</p>
            </div>
          </div>
        </div>
      )}
    </PremiumGuard>
  );
} 