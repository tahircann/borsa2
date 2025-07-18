import React, { useState, useEffect } from 'react';
import { FiSettings, FiPlay, FiPause, FiSquare, FiRefreshCw, FiAlertTriangle, FiCheckCircle, FiDollarSign, FiTrendingUp, FiBarChart, FiActivity, FiShield } from 'react-icons/fi';
import PremiumGuard from '../components/PremiumGuard';

interface TradeBotConfig {
  accountId: string;
  apiKey: string;
  baseUrl: string;
  maxRiskPerTrade: number;
  maxDailyLoss: number;
  tradingPairs: string[];
  strategy: 'momentum' | 'mean_reversion' | 'breakout' | 'scalping';
  isActive: boolean;
}

interface TradeOrder {
  id: string;
  symbol: string;
  side: 'BUY' | 'SELL';
  quantity: number;
  price: number;
  timestamp: string;
  status: 'PENDING' | 'FILLED' | 'CANCELLED';
  profit?: number;
}

export default function TradeBotPage() {
  const [config, setConfig] = useState<TradeBotConfig>({
    accountId: '',
    apiKey: '',
    baseUrl: 'https://localhost:5000',
    maxRiskPerTrade: 2.0,
    maxDailyLoss: 5.0,
    tradingPairs: ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA'],
    strategy: 'momentum',
    isActive: false
  });

  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');
  const [recentOrders, setRecentOrders] = useState<TradeOrder[]>([]);
  const [dailyPnL, setDailyPnL] = useState(0);
  const [totalTrades, setTotalTrades] = useState(0);
  const [winRate, setWinRate] = useState(0);
  const [showConfig, setShowConfig] = useState(false);

  // Mock data for demonstration
  useEffect(() => {
    const mockOrders: TradeOrder[] = [
      {
        id: '1',
        symbol: 'AAPL',
        side: 'BUY',
        quantity: 10,
        price: 182.50,
        timestamp: new Date(Date.now() - 300000).toISOString(),
        status: 'FILLED',
        profit: 45.30
      },
      {
        id: '2',
        symbol: 'MSFT',
        side: 'SELL',
        quantity: 5,
        price: 402.75,
        timestamp: new Date(Date.now() - 600000).toISOString(),
        status: 'FILLED',
        profit: -12.50
      },
      {
        id: '3',
        symbol: 'GOOGL',
        side: 'BUY',
        quantity: 8,
        price: 176.25,
        timestamp: new Date(Date.now() - 900000).toISOString(),
        status: 'PENDING'
      }
    ];
    setRecentOrders(mockOrders);
    setDailyPnL(32.80);
    setTotalTrades(24);
    setWinRate(75);
  }, []);

  const handleConnect = async () => {
    if (!config.accountId || !config.apiKey) {
      alert('Please provide Account ID and API Key');
      return;
    }

    setConnectionStatus('connecting');
    
    // Simulate connection process
    setTimeout(() => {
      setConnectionStatus('connected');
    }, 2000);
  };

  const handleStartBot = () => {
    if (connectionStatus !== 'connected') {
      alert('Please connect to IBKR first');
      return;
    }
    setConfig(prev => ({ ...prev, isActive: true }));
  };

  const handleStopBot = () => {
    setConfig(prev => ({ ...prev, isActive: false }));
  };

  const handleConfigChange = (field: keyof TradeBotConfig, value: any) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'text-green-600 bg-green-50 border-green-200';
      case 'connecting': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'error': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case 'connected': return <FiCheckCircle className="h-5 w-5" />;
      case 'connecting': return <FiRefreshCw className="h-5 w-5 animate-spin" />;
      case 'error': return <FiAlertTriangle className="h-5 w-5" />;
      default: return <FiShield className="h-5 w-5" />;
    }
  };

  return (
    <PremiumGuard 
      useBlurOverlay={true} 
      blurMessage="Upgrade to access copy trading features and follow professional strategies"
    >
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Copy Trade</h1>
              <p className="text-gray-600 mt-2">Follow and copy Esen Global Investment portfolio trades automatically</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg border ${getStatusColor()}`}>
              {getStatusIcon()}
              <span className="font-medium capitalize">{connectionStatus}</span>
            </div>
            <button
              onClick={() => setShowConfig(!showConfig)}
              className="flex items-center space-x-2 bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <FiSettings className="h-4 w-4" />
              <span>Configure</span>
            </button>
          </div>
        </div>

        {/* Configuration Panel */}
        {showConfig && (
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 border border-gray-200">
            <h2 className="text-xl font-semibold mb-6 flex items-center">
              <FiSettings className="mr-2" />
              Bot Configuration
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* IBKR Connection */}
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900">IBKR Connection</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Account ID</label>
                  <input
                    type="text"
                    value={config.accountId}
                    onChange={(e) => handleConfigChange('accountId', e.target.value)}
                    placeholder="U7960949"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">API Key</label>
                  <input
                    type="password"
                    value={config.apiKey}
                    onChange={(e) => handleConfigChange('apiKey', e.target.value)}
                    placeholder="Enter your API key"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Base URL</label>
                  <input
                    type="url"
                    value={config.baseUrl}
                    onChange={(e) => handleConfigChange('baseUrl', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Risk Management */}
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900">Risk Management</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Risk Per Trade (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    max="10"
                    value={config.maxRiskPerTrade}
                    onChange={(e) => handleConfigChange('maxRiskPerTrade', parseFloat(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Daily Loss (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    max="20"
                    value={config.maxDailyLoss}
                    onChange={(e) => handleConfigChange('maxDailyLoss', parseFloat(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Trading Strategy</label>
                  <select
                    value={config.strategy}
                    onChange={(e) => handleConfigChange('strategy', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="momentum">Momentum Strategy</option>
                    <option value="mean_reversion">Mean Reversion</option>
                    <option value="breakout">Breakout Strategy</option>
                    <option value="scalping">Scalping</option>
                  </select>
                </div>
              </div>

              {/* Trading Pairs */}
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900">Trading Symbols</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Active Symbols</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {config.tradingPairs.map((symbol) => (
                      <span
                        key={symbol}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        {symbol}
                        <button
                          onClick={() => {
                            const newPairs = config.tradingPairs.filter(s => s !== symbol);
                            handleConfigChange('tradingPairs', newPairs);
                          }}
                          className="ml-1 text-blue-600 hover:text-blue-800"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                  <input
                    type="text"
                    placeholder="Add symbol (e.g., NVDA)"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        const value = (e.target as HTMLInputElement).value.toUpperCase();
                        if (value && !config.tradingPairs.includes(value)) {
                          handleConfigChange('tradingPairs', [...config.tradingPairs, value]);
                          (e.target as HTMLInputElement).value = '';
                        }
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
              <button
                onClick={handleConnect}
                disabled={connectionStatus === 'connecting'}
                className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                <FiCheckCircle className="h-4 w-4" />
                <span>Connect to IBKR</span>
              </button>
              <button
                onClick={() => setShowConfig(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* Control Panel & Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          {/* Bot Controls */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <FiActivity className="mr-2 text-blue-600" />
              Bot Controls
            </h3>
            <div className="space-y-3">
              <button
                onClick={handleStartBot}
                disabled={connectionStatus !== 'connected' || config.isActive}
                className="w-full flex items-center justify-center space-x-2 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <FiPlay className="h-4 w-4" />
                <span>Start Bot</span>
              </button>
              <button
                onClick={handleStopBot}
                disabled={!config.isActive}
                className="w-full flex items-center justify-center space-x-2 bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <FiSquare className="h-4 w-4" />
                <span>Stop Bot</span>
              </button>
              <div className={`text-center py-2 px-4 rounded-lg ${config.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                Status: {config.isActive ? 'Running' : 'Stopped'}
              </div>
            </div>
          </div>

          {/* Daily P&L */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
            <h3 className="text-lg font-semibold mb-2 flex items-center">
              <FiDollarSign className="mr-2 text-green-600" />
              Daily P&L
            </h3>
            <div className={`text-3xl font-bold ${dailyPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {dailyPnL >= 0 ? '+' : ''}${dailyPnL.toFixed(2)}
            </div>
            <div className="text-sm text-gray-500 mt-1">
              {dailyPnL >= 0 ? 'Profit' : 'Loss'} today
            </div>
          </div>

          {/* Total Trades */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
            <h3 className="text-lg font-semibold mb-2 flex items-center">
              <FiBarChart className="mr-2 text-blue-600" />
              Total Trades
            </h3>
            <div className="text-3xl font-bold text-gray-800">{totalTrades}</div>
            <div className="text-sm text-gray-500 mt-1">Executed today</div>
          </div>

          {/* Win Rate */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
            <h3 className="text-lg font-semibold mb-2 flex items-center">
              <FiTrendingUp className="mr-2 text-purple-600" />
              Win Rate
            </h3>
            <div className="text-3xl font-bold text-gray-800">{winRate}%</div>
            <div className="text-sm text-gray-500 mt-1">Success rate</div>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold">Recent Orders</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Symbol</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Side</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">P&L</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{order.symbol}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        order.side === 'BUY' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {order.side}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-900">{order.quantity}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-900">${order.price.toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        order.status === 'FILLED' ? 'bg-green-100 text-green-800' :
                        order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {order.profit !== undefined ? (
                        <span className={order.profit >= 0 ? 'text-green-600' : 'text-red-600'}>
                          {order.profit >= 0 ? '+' : ''}${order.profit.toFixed(2)}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(order.timestamp).toLocaleTimeString('tr-TR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          </div>
        </div>
      </div>
    </PremiumGuard>
  );
} 