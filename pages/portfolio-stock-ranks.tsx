import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { FiSearch, FiPlusCircle, FiTrash2, FiRefreshCw, FiLock, FiAlertTriangle, FiAward, FiChevronDown, FiChevronUp, FiCalendar } from 'react-icons/fi';
import { getStockQuote, getHistoricalData, StockInfo, HistoricalStockData } from '../services/stockApi';
import { useAuth } from '../utils/auth';
import { formatCurrency, formatNumber } from '../utils/formatters';
import dynamic from 'next/dynamic';

// Dynamically import the Chart component with no SSR to avoid rendering issues
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

// Typescript interfaces for ApexCharts
interface ChartSeries {
  name: string;
  data: number[];
}

interface ChartOptions {
  chart: {
    id: string;
    background: string;
    toolbar: {
      show: boolean;
    };
  };
  title: {
    text: string;
    align: 'center' | 'left' | 'right';
  };
  xaxis: {
    categories: string[];
  };
  colors: string[];
  tooltip?: {
    x: {
      format?: string;
    };
    y: {
      formatter?: (val: number) => string;
    };
  };
  stroke?: {
    curve?: 'straight' | 'smooth';
    width?: number;
  };
}

interface ChartData {
  options: ChartOptions;
  series: ChartSeries[];
}

// Time interval type
type TimeInterval = 'daily' | 'weekly' | 'monthly';

export default function PortfolioStockRanks() {
  const [symbol, setSymbol] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [stocks, setStocks] = useState<StockInfo[]>([]);
  const [usingMockData, setUsingMockData] = useState(false);
  const [selectedStock, setSelectedStock] = useState<string | null>(null);
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [selectedInterval, setSelectedInterval] = useState<TimeInterval>('daily');
  const [chartLoading, setChartLoading] = useState(false);
  const [historicalData, setHistoricalData] = useState<HistoricalStockData | null>(null);
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  
  // Load an initial stock to show the functionality
  useEffect(() => {
    if (stocks.length === 0) {
      // Add a sample stock on first load to show functionality
      const loadSampleStock = async () => {
        try {
          setLoading(true);
          const stockData = await getStockQuote('AAPL');
          setStocks([stockData]);
          
          // Print the stock data to the console
          console.log("SAMPLE STOCK DATA (AAPL):", JSON.stringify({
            symbol: stockData.symbol,
            nextQuarterEarning: stockData.nextQuarterEarning,
            annualEarningGrowth: stockData.annualEarningGrowth
          }, null, 2));
          
          // Check if we're using mock data
          if (stockData.price > 0 && stockData.volume > 0) {
            setUsingMockData(false);
          } else {
            setUsingMockData(true);
          }
        } catch (err) {
          console.error('Error loading sample stock:', err);
          setUsingMockData(true);
        } finally {
          setLoading(false);
        }
      };
      
      loadSampleStock();
    }
  }, [stocks.length]);
  
  // Effect to load historical data when a stock is selected or interval changes
  useEffect(() => {
    if (selectedStock) {
      fetchHistoricalData(selectedStock, selectedInterval);
    }
  }, [selectedStock, selectedInterval]);
  
  // Function to fetch historical data and update chart
  const fetchHistoricalData = async (symbol: string, interval: TimeInterval) => {
    try {
      setChartLoading(true);
      console.log(`Fetching ${interval} data for ${symbol}`);
      
      const data = await getHistoricalData(symbol, interval);
      setHistoricalData(data);
      
      // Log the data for debugging
      console.log(`Received ${data.data.length} historical data points`);
      
      // Convert the data to chart format
      updateChartWithHistoricalData(data);
    } catch (err) {
      console.error('Error loading historical data:', err);
    } finally {
      setChartLoading(false);
    }
  };
  
  // Function to convert historical data to chart format
  const updateChartWithHistoricalData = (data: HistoricalStockData) => {
    const stock = stocks.find(s => s.symbol === data.symbol);
    if (!stock) return;
    
    // Format dates based on interval
    const formatDate = (dateStr: string) => {
      const date = new Date(dateStr);
      if (data.interval === 'daily') {
        return date.toLocaleDateString('default', { month: 'short', day: 'numeric' });
      } else if (data.interval === 'weekly') {
        return date.toLocaleDateString('default', { month: 'short', day: 'numeric' });
      } else {
        return date.toLocaleDateString('default', { year: 'numeric', month: 'short' });
      }
    };
    
    // Create the chart data
    const chartOptions: ChartOptions = {
      chart: {
        id: `stock-chart-${data.symbol}`,
        background: '#fff',
        toolbar: {
          show: false
        }
      },
      title: {
        text: `${data.symbol} - ${data.interval.charAt(0).toUpperCase() + data.interval.slice(1)} Price`,
        align: 'center'
      },
      xaxis: {
        categories: data.data.map(item => formatDate(item.date))
      },
      colors: ['#1A56DB'],
      tooltip: {
        x: {
          format: 'dd MMM'
        },
        y: {
          formatter: (val: number) => `$${val.toFixed(2)}`
        }
      },
      stroke: {
        curve: 'smooth',
        width: 2
      }
    };
    
    const chartSeries: ChartSeries[] = [
      {
        name: "Close Price",
        data: data.data.map(item => item.close)
      }
    ];
    
    setChartData({
      options: chartOptions,
      series: chartSeries
    });
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!symbol) return;
    
    setLoading(true);
    setError('');
    
    try {
      console.log(`Fetching data for symbol: ${symbol.toUpperCase()}`);
      const stockData = await getStockQuote(symbol.toUpperCase());
      
      // Log the data for debugging
      console.log(`RECEIVED STOCK DATA (${symbol.toUpperCase()}):`, JSON.stringify({
        symbol: stockData.symbol,
        name: stockData.name,
        price: stockData.price,
        nextQuarterEarning: stockData.nextQuarterEarning,
        annualEarningGrowth: stockData.annualEarningGrowth,
        allData: stockData
      }, null, 2));
      
      // Check if stock already exists in the list
      const exists = stocks.some(s => s.symbol === stockData.symbol);
      
      if (!exists) {
        setStocks(prev => {
          const newStocks = [...prev, stockData];
          // Log all stocks in the list
          console.log("CURRENT STOCKS LIST:", JSON.stringify(
            newStocks.map(s => ({
              symbol: s.symbol,
              nextQuarterEarning: s.nextQuarterEarning,
              annualEarningGrowth: s.annualEarningGrowth
            })), null, 2));
          return newStocks;
        });
        setSymbol('');
        setError('');
      } else {
        setError(`Stock ${stockData.symbol} is already in your list`);
      }
    } catch (err) {
      console.error('Error fetching stock data:', err);
      setError('Failed to fetch stock data. Please check the symbol and try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const removeStock = (symbol: string) => {
    setStocks(prev => prev.filter(stock => stock.symbol !== symbol));
    if (selectedStock === symbol) {
      setSelectedStock(null);
      setChartData(null);
      setHistoricalData(null);
    }
  };
  
  const refreshStock = async (symbol: string) => {
    setLoading(true);
    
    try {
      console.log(`Refreshing data for symbol: ${symbol}`);
      const updatedStock = await getStockQuote(symbol);
      
      // Log the refreshed data
      console.log(`REFRESHED STOCK DATA (${symbol}):`, JSON.stringify({
        symbol: updatedStock.symbol,
        nextQuarterEarning: updatedStock.nextQuarterEarning,
        annualEarningGrowth: updatedStock.annualEarningGrowth
      }, null, 2));
      
      setStocks(prev => 
        prev.map(stock => 
          stock.symbol === symbol ? updatedStock : stock
        )
      );
      
      // If this stock is selected, refresh its chart data
      if (selectedStock === symbol) {
        await fetchHistoricalData(symbol, selectedInterval);
      }
    } catch (err) {
      setError(`Failed to refresh ${symbol}`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  // Function to handle row click and show/hide chart
  const handleRowClick = (symbol: string) => {
    if (selectedStock === symbol) {
      // If the same stock is clicked again, close the chart
      setSelectedStock(null);
      setChartData(null);
      setHistoricalData(null);
    } else {
      // Set the selected stock and fetch data
      setSelectedStock(symbol);
      // Data fetching will be handled by the useEffect
    }
  };
  
  // Function to handle interval change
  const handleIntervalChange = (interval: TimeInterval) => {
    setSelectedInterval(interval);
  };
  
  // Function to render stock score with color coding
  const renderStockScore = (score?: number) => {
    if (score === undefined) return 'N/A';
    
    let colorClass = 'text-yellow-600';
    if (score >= 70) colorClass = 'text-green-600';
    else if (score < 40) colorClass = 'text-red-600';
    
    return (
      <div className="flex items-center">
        <span className={`font-medium ${colorClass}`}>{score}</span>
        <span className="text-gray-400 ml-1">/100</span>
      </div>
    );
  };
  
  // Check if user is admin with proper null checking
  const isAdmin = user !== null && user !== undefined && user.isAdmin === true;
  
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Portfolio Stock Ranks</h1>
      
      {usingMockData && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-md p-4 mb-6 flex items-center">
          <FiAlertTriangle className="text-yellow-600 mr-2" />
          <p>
            API limit reached or connection issue. Using simulated stock data for demonstration purposes.
          </p>
        </div>
      )}
      
      {isAdmin ? (
        <div className="mb-8">
          <form onSubmit={handleSubmit} className="flex space-x-2 max-w-lg">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Enter stock symbol (e.g., AAPL)"
                className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
              />
            </div>
            <button
              type="submit"
              disabled={loading || !symbol}
              className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiPlusCircle className="mr-2" />
              {loading ? 'Loading...' : 'Add Stock'}
            </button>
          </form>
          
          {error && (
            <div className="mt-2 text-red-600 text-sm">
              {error}
            </div>
          )}
        </div>
      ) : (
        <div className="bg-gray-50 border border-gray-200 rounded-md p-4 mb-6 flex items-center">
          <FiLock className="text-gray-500 mr-2" />
          <p className="text-gray-600">
            Only admin users can add new stocks and modify this data. 
            <button 
              onClick={() => router.push('/')} 
              className="ml-2 text-primary-600 hover:underline"
            >
              Log in as admin
            </button> 
            to manage stocks.
          </p>
        </div>
      )}
      
      {stocks.length > 0 ? (
        <div className="bg-white rounded-lg shadow-md overflow-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Symbol</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Change</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Stock Score</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Next Quarter Earning</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Annual Earning Growth</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Volume</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Open</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">High/Low</th>
                {isAdmin && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {stocks.map((stock) => {
                // Log each rendered stock's data
                console.log(`RENDERING STOCK: ${stock.symbol}`, JSON.stringify({
                  nextQuarterEarning: stock.nextQuarterEarning,
                  annualEarningGrowth: stock.annualEarningGrowth
                }, null, 2));
                
                return (
                  <>
                    <tr 
                      key={stock.symbol} 
                      onClick={() => handleRowClick(stock.symbol)}
                      className={`cursor-pointer hover:bg-gray-50 ${selectedStock === stock.symbol ? 'bg-blue-50' : ''}`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap font-medium flex items-center">
                        {stock.symbol}
                        {selectedStock === stock.symbol ? 
                          <FiChevronUp className="ml-2 text-blue-500" /> : 
                          <FiChevronDown className="ml-2 text-gray-400" />
                        }
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{stock.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{formatCurrency(stock.price)}</td>
                      <td className={`px-6 py-4 whitespace-nowrap ${stock.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)} ({stock.changePercent.toFixed(2)}%)
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <FiAward className={`mr-1 ${
                            (stock.stockScore || 0) >= 70 ? 'text-green-500' : 
                            (stock.stockScore || 0) >= 40 ? 'text-yellow-500' : 'text-red-500'
                          }`} />
                          {renderStockScore(stock.stockScore)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {stock.nextQuarterEarning || 'N/A'}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap ${
                        stock.annualEarningGrowth?.startsWith('+') ? 'text-green-600' : 
                        stock.annualEarningGrowth?.startsWith('-') ? 'text-red-600' : 'text-gray-700'
                      }`}>
                        {stock.annualEarningGrowth || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{formatNumber(stock.volume)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{formatCurrency(stock.open)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {formatCurrency(stock.high)} / {formatCurrency(stock.low)}
                      </td>
                      {isAdmin && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => refreshStock(stock.symbol)}
                            className="text-indigo-600 hover:text-indigo-900"
                            title="Refresh"
                          >
                            <FiRefreshCw className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => removeStock(stock.symbol)}
                            className="text-red-600 hover:text-red-900"
                            title="Remove"
                          >
                            <FiTrash2 className="h-5 w-5" />
                          </button>
                        </td>
                      )}
                    </tr>
                    
                    {/* Chart Row - Appears when a stock is selected */}
                    {selectedStock === stock.symbol && (
                      <tr key={`chart-${stock.symbol}`}>
                        <td colSpan={isAdmin ? 11 : 10} className="px-4 py-4">
                          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 transition-all duration-300 ease-in-out">
                            <div className="flex justify-between items-center mb-4">
                              <h3 className="text-lg font-medium">{stock.name} ({stock.symbol}) - Stock Chart</h3>
                              
                              {/* Time range selector */}
                              <div className="flex items-center space-x-2 bg-gray-100 rounded-md p-1">
                                <button 
                                  className={`px-3 py-1 text-sm rounded-md ${selectedInterval === 'daily' ? 'bg-white shadow-sm' : 'text-gray-600 hover:bg-gray-200'}`}
                                  onClick={() => handleIntervalChange('daily')}
                                >
                                  Daily
                                </button>
                                <button 
                                  className={`px-3 py-1 text-sm rounded-md ${selectedInterval === 'weekly' ? 'bg-white shadow-sm' : 'text-gray-600 hover:bg-gray-200'}`}
                                  onClick={() => handleIntervalChange('weekly')}
                                >
                                  Weekly
                                </button>
                                <button 
                                  className={`px-3 py-1 text-sm rounded-md ${selectedInterval === 'monthly' ? 'bg-white shadow-sm' : 'text-gray-600 hover:bg-gray-200'}`}
                                  onClick={() => handleIntervalChange('monthly')}
                                >
                                  Monthly
                                </button>
                              </div>
                            </div>
                            
                            {chartLoading ? (
                              <div className="flex justify-center items-center h-[350px] bg-gray-50">
                                <div className="text-gray-500 flex flex-col items-center">
                                  <FiRefreshCw className="animate-spin h-8 w-8 mb-2" />
                                  <span>Loading chart data...</span>
                                </div>
                              </div>
                            ) : chartData && typeof window !== 'undefined' ? (
                              <Chart 
                                options={chartData.options}
                                series={chartData.series}
                                type="line"
                                height={350}
                                width="100%"
                              />
                            ) : (
                              <div className="text-center p-4 text-gray-500">No chart data available</div>
                            )}
                            
                            {historicalData && (
                              <div className="mt-4 grid grid-cols-4 gap-4 text-sm">
                                <div className="bg-gray-50 p-3 rounded-md">
                                  <div className="text-gray-500">Open</div>
                                  <div className="font-medium">{formatCurrency(historicalData.data[historicalData.data.length - 1].open)}</div>
                                </div>
                                <div className="bg-gray-50 p-3 rounded-md">
                                  <div className="text-gray-500">Close</div>
                                  <div className="font-medium">{formatCurrency(historicalData.data[historicalData.data.length - 1].close)}</div>
                                </div>
                                <div className="bg-gray-50 p-3 rounded-md">
                                  <div className="text-gray-500">High</div>
                                  <div className="font-medium text-green-600">{formatCurrency(historicalData.data[historicalData.data.length - 1].high)}</div>
                                </div>
                                <div className="bg-gray-50 p-3 rounded-md">
                                  <div className="text-gray-500">Low</div>
                                  <div className="font-medium text-red-600">{formatCurrency(historicalData.data[historicalData.data.length - 1].low)}</div>
                                </div>
                              </div>
                            )}
                            
                            <div className="mt-2 text-xs text-gray-500 text-center flex items-center justify-center">
                              <FiCalendar className="mr-1" />
                              <span>Last updated: {new Date().toLocaleString()}</span>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <p className="text-gray-500">
            {isAdmin 
              ? "No stocks added yet. Use the form above to add stocks to your portfolio."
              : "No stocks have been added to the portfolio yet. Please check back later or log in as admin to add stocks."}
          </p>
        </div>
      )}
    </div>
  );
} 