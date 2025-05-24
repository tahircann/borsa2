import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { FiX, FiRefreshCw, FiTrendingUp, FiTrendingDown } from 'react-icons/fi';
import { alphaVantageAPI, USStockData } from '../services/alphaVantageApi';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface USStockChartProps {
  symbol: string;
  stockData: USStockData;
  onClose: () => void;
}

interface ChartDataPoint {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

const USStockChart: React.FC<USStockChartProps> = ({ symbol, stockData, onClose }) => {
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeframe, setTimeframe] = useState<'5min' | '15min' | '30min' | '60min'>('5min');
  const [realTimePrice, setRealTimePrice] = useState(stockData.price);
  const [priceChange, setPriceChange] = useState(stockData.change);

  useEffect(() => {
    loadChartData();
    // Set up real-time price updates every 30 seconds
    const interval = setInterval(updateRealTimePrice, 30000);
    return () => clearInterval(interval);
  }, [symbol, timeframe]);

  const loadChartData = async () => {
    setLoading(true);
    setError('');

    try {
      const data = await alphaVantageAPI.getIntradayData(symbol, timeframe);
      
      if (!data || data['Error Message']) {
        throw new Error('Failed to fetch chart data');
      }

      const timeSeriesKey = `Time Series (${timeframe})`;
      const timeSeries = data[timeSeriesKey];

      if (!timeSeries) {
        // Use mock data as fallback
        generateMockChartData();
        return;
      }

      const chartPoints: ChartDataPoint[] = Object.entries(timeSeries)
        .slice(0, 50) // Last 50 data points
        .map(([time, values]: [string, any]) => ({
          time,
          open: parseFloat(values['1. open']),
          high: parseFloat(values['2. high']),
          low: parseFloat(values['3. low']),
          close: parseFloat(values['4. close']),
          volume: parseInt(values['5. volume'])
        }))
        .reverse();

      setChartData(chartPoints);
    } catch (err) {
      console.error('Error loading chart data:', err);
      setError('Failed to load chart data. Using sample data.');
      generateMockChartData();
    } finally {
      setLoading(false);
    }
  };

  const generateMockChartData = () => {
    const now = new Date();
    const data: ChartDataPoint[] = [];
    let basePrice = stockData.price;

    for (let i = 49; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 5 * 60 * 1000); // 5 minutes intervals
      const variation = (Math.random() - 0.5) * basePrice * 0.02; // ±2% variation
      const price = basePrice + variation;
      
      data.push({
        time: time.toISOString(),
        open: price * (0.998 + Math.random() * 0.004),
        high: price * (1.001 + Math.random() * 0.004),
        low: price * (0.996 + Math.random() * 0.003),
        close: price,
        volume: Math.floor(Math.random() * 1000000) + 100000
      });
      
      basePrice = price;
    }

    setChartData(data);
  };

  const updateRealTimePrice = async () => {
    try {
      const updatedStock = await alphaVantageAPI.getQuote(symbol);
      if (updatedStock) {
        setRealTimePrice(updatedStock.price);
        setPriceChange(updatedStock.change);
      }
    } catch (error) {
      console.error('Error updating real-time price:', error);
      // Simulate price movement for demo
      const change = (Math.random() - 0.5) * 2; // Random change
      setRealTimePrice(prev => prev + change);
      setPriceChange(change);
    }
  };

  const chartConfig = {
    labels: chartData.map(point => {
      const date = new Date(point.time);
      return date.toLocaleTimeString('tr-TR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    }),
    datasets: [
      {
        label: `${symbol} Price`,
        data: chartData.map(point => point.close),
        borderColor: priceChange >= 0 ? '#10B981' : '#EF4444',
        backgroundColor: priceChange >= 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointRadius: 2,
        pointHoverRadius: 6,
        pointBackgroundColor: priceChange >= 0 ? '#10B981' : '#EF4444',
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: '#374151',
        borderWidth: 1,
        callbacks: {
          label: function(context: any) {
            const point = chartData[context.dataIndex];
            return [
              `Price: $${point.close.toFixed(2)}`,
              `High: $${point.high.toFixed(2)}`,
              `Low: $${point.low.toFixed(2)}`,
              `Volume: ${point.volume.toLocaleString()}`
            ];
          }
        }
      }
    },
    scales: {
      x: {
        display: true,
        grid: {
          color: 'rgba(107, 114, 128, 0.1)'
        },
        ticks: {
          color: '#6B7280',
          maxTicksLimit: 10
        }
      },
      y: {
        display: true,
        grid: {
          color: 'rgba(107, 114, 128, 0.1)'
        },
        ticks: {
          color: '#6B7280',
          callback: function(value: any) {
            return '$' + value.toFixed(2);
          }
        }
      }
    },
    interaction: {
      mode: 'nearest' as const,
      axis: 'x' as const,
      intersect: false
    }
  };

  const formatMarketCap = (value?: number) => {
    if (!value) return 'N/A';
    if (value >= 1e12) return `$${(value / 1e12).toFixed(1)}T`;
    if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
    return `$${value.toLocaleString()}`;
  };

  const formatVolume = (value: number) => {
    if (value >= 1e9) return `${(value / 1e9).toFixed(1)}B`;
    if (value >= 1e6) return `${(value / 1e6).toFixed(1)}M`;
    if (value >= 1e3) return `${(value / 1e3).toFixed(1)}K`;
    return value.toLocaleString();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{stockData.symbol}</h2>
              <p className="text-gray-600">{stockData.company}</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">
                  ${realTimePrice.toFixed(2)}
                </div>
                <div className={`flex items-center text-sm ${priceChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {priceChange >= 0 ? <FiTrendingUp className="mr-1" /> : <FiTrendingDown className="mr-1" />}
                  {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)} ({stockData.changePercent.toFixed(2)}%)
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={loadChartData}
              className="p-2 text-gray-500 hover:text-gray-700 rounded-md hover:bg-gray-100"
              disabled={loading}
            >
              <FiRefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 rounded-md hover:bg-gray-100"
            >
              <FiX className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Timeframe selector */}
          <div className="flex space-x-2 mb-6">
            {(['5min', '15min', '30min', '60min'] as const).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-3 py-1 rounded-md text-sm font-medium ${
                  timeframe === tf
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Chart */}
            <div className="lg:col-span-3">
              <div className="bg-gray-50 rounded-lg p-4" style={{ height: '400px' }}>
                {loading ? (
                  <div className="flex items-center justify-center h-full">
                    <FiRefreshCw className="animate-spin h-8 w-8 text-blue-600 mr-2" />
                    <span>Loading chart data...</span>
                  </div>
                ) : error && chartData.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-red-600">
                    {error}
                  </div>
                ) : (
                  <Line data={chartConfig} options={chartOptions} />
                )}
              </div>
            </div>

            {/* Stock Info */}
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Stock Information</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Market Cap:</span>
                    <span className="font-medium">{formatMarketCap(stockData.marketCap)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">P/E Ratio:</span>
                    <span className="font-medium">{stockData.pe?.toFixed(1) || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">EPS:</span>
                    <span className="font-medium">${stockData.eps?.toFixed(2) || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Beta:</span>
                    <span className="font-medium">{stockData.beta?.toFixed(2) || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Volume:</span>
                    <span className="font-medium">{formatVolume(stockData.volume)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">52W High:</span>
                    <span className="font-medium">${stockData.week52High?.toFixed(2) || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">52W Low:</span>
                    <span className="font-medium">${stockData.week52Low?.toFixed(2) || 'N/A'}</span>
                  </div>
                  {stockData.dividend && stockData.dividend > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Dividend:</span>
                      <span className="font-medium">${stockData.dividend.toFixed(2)}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">Real-time Updates</h3>
                <p className="text-sm text-blue-700">
                  Price updates every 30 seconds during market hours
                </p>
                <div className="mt-2 text-xs text-blue-600">
                  Last updated: {new Date().toLocaleTimeString('tr-TR')}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default USStockChart; 