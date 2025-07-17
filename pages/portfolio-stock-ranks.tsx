import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { FiSearch, FiTrendingUp, FiTrendingDown } from 'react-icons/fi';
import { StockInfo } from '../services/stockApi';
import { useAuth } from '../utils/auth';
import { formatCurrency } from '../utils/formatters';
import Layout from '../components/Layout';
import PremiumGuard from '../components/PremiumGuard';

// Enhanced interfaces for the new design
interface StockRankData extends StockInfo {
  stockScore: number;
  quarterRevenue: string;
  annualRevenue: string;
  growthRating: 'A+' | 'A' | 'B+' | 'B' | 'C' | 'D' | 'G';
  valuation: 'UNDERVALUE' | 'FAIR' | 'OVERVALUE';
  technicalAnalysis: 'STRONG BUY' | 'BUY' | 'HOLD' | 'SELL';
  seasonality: string;
  priceTarget: number;
  upsidePotential: string;
  analystRating: 'BUY' | 'HOLD' | 'SELL';
  winningTrades: string;
  marketCap: number;
}

// Mock data that matches the design shown in the image
const mockStockRanksData: StockRankData[] = [
  {
    symbol: 'NVDA',
    name: 'NVIDIA Corporation',
    price: 230,
    change: 5.2,
    changePercent: 2.3,
    volume: 45000000,
    open: 225,
    high: 235,
    low: 220,
    marketCap: 580000000000,
    stockScore: 88,
    quarterRevenue: 'A+',
    annualRevenue: 'B+',
    growthRating: 'A',
    valuation: 'FAIR',
    technicalAnalysis: 'STRONG BUY',
    seasonality: '89%',
    priceTarget: 148,
    upsidePotential: '30%',
    analystRating: 'BUY',
    winningTrades: '60DAYS',
    nextQuarterEarning: 'Q4 2024',
    annualEarningGrowth: '+25.3%'
  },
  {
    symbol: 'HRI',
    name: 'Herc Holdings Inc',
    price: 116,
    change: 2.8,
    changePercent: 2.5,
    volume: 1200000,
    open: 114,
    high: 118,
    low: 113,
    marketCap: 3500000000,
    stockScore: 78,
    quarterRevenue: 'A+',
    annualRevenue: 'A',
    growthRating: 'A',
    valuation: 'UNDERVALUE',
    technicalAnalysis: 'BUY',
    seasonality: '80%',
    priceTarget: 148,
    upsidePotential: '25%',
    analystRating: 'BUY',
    winningTrades: '60DAYS',
    nextQuarterEarning: 'Q1 2025',
    annualEarningGrowth: '+18.7%'
  },
  {
    symbol: 'FIX',
    name: 'Comfort Systems USA Inc',
    price: 435,
    change: -2.1,
    changePercent: -0.5,
    volume: 890000,
    open: 437,
    high: 439,
    low: 432,
    marketCap: 16800000000,
    stockScore: 65,
    quarterRevenue: 'A+',
    annualRevenue: 'C',
    growthRating: 'B',
    valuation: 'FAIR',
    technicalAnalysis: 'BUY',
    seasonality: '65%',
    priceTarget: 510,
    upsidePotential: '15%',
    analystRating: 'BUY',
    winningTrades: '90DAYS',
    nextQuarterEarning: 'Q1 2025',
    annualEarningGrowth: '+12.4%'
  },
  {
    symbol: 'SNPS',
    name: 'Synopsys Inc',
    price: 163,
    change: 1.8,
    changePercent: 1.1,
    volume: 1500000,
    open: 161,
    high: 165,
    low: 160,
    marketCap: 25000000000,
    stockScore: 71,
    quarterRevenue: 'A+',
    annualRevenue: 'D',
    growthRating: 'B',
    valuation: 'UNDERVALUE',
    technicalAnalysis: 'BUY',
    seasonality: '80%',
    priceTarget: 510,
    upsidePotential: '14%',
    analystRating: 'BUY',
    winningTrades: '90DAYS',
    nextQuarterEarning: 'Q2 2025',
    annualEarningGrowth: '+9.8%'
  },
  {
    symbol: 'CSX',
    name: 'CSX Corporation',
    price: 115,
    change: -0.8,
    changePercent: -0.7,
    volume: 8900000,
    open: 116,
    high: 116,
    low: 114,
    marketCap: 23500000000,
    stockScore: 39,
    quarterRevenue: 'A+',
    annualRevenue: 'D',
    growthRating: 'G',
    valuation: 'UNDERVALUE',
    technicalAnalysis: 'HOLD',
    seasonality: '100%',
    priceTarget: 510,
    upsidePotential: '18%',
    analystRating: 'HOLD',
    winningTrades: '90DAYS',
    nextQuarterEarning: 'Q1 2025',
    annualEarningGrowth: '+5.2%'
  }
];

export default function PortfolioStockRanks() {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<keyof StockRankData>('stockScore');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [filteredStocks, setFilteredStocks] = useState<StockRankData[]>(mockStockRanksData);
  const [mounted, setMounted] = useState(false);
  const { user, isAuthenticated, hasPremiumMembership } = useAuth();
  const router = useRouter();

  // Handle client-side mounting
  useEffect(() => {
    setMounted(true);
  }, []);

  // Filter and sort stocks
  useEffect(() => {
    let filtered = mockStockRanksData.filter(stock =>
      stock.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stock.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Sort stocks
    filtered.sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }
      
      const aStr = String(aValue).toLowerCase();
      const bStr = String(bValue).toLowerCase();
      return sortDirection === 'asc' ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr);
    });

    setFilteredStocks(filtered);
  }, [searchTerm, sortField, sortDirection]);

  const handleSort = (field: keyof StockRankData) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    if (score >= 40) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  const getGradeColor = (grade: string) => {
    if (['A+', 'A'].includes(grade)) return 'text-green-600 bg-green-100';
    if (['B+', 'B'].includes(grade)) return 'text-blue-600 bg-blue-100';
    if (grade === 'C') return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getValuationColor = (valuation: string) => {
    if (valuation === 'UNDERVALUE') return 'text-green-600 bg-green-100';
    if (valuation === 'FAIR') return 'text-blue-600 bg-blue-100';
    return 'text-red-600 bg-red-100';
  };

  const getTechnicalColor = (analysis: string) => {
    if (analysis === 'STRONG BUY') return 'text-green-700 bg-green-200';
    if (analysis === 'BUY') return 'text-green-600 bg-green-100';
    if (analysis === 'HOLD') return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  // Don't render until mounted on client side
  if (!mounted) {
    return null;
  }

  if (!isAuthenticated()) {
    if (typeof window !== 'undefined') {
      router.push('/');
    }
    return null;
  }

  return (
    <PremiumGuard 
      useBlurOverlay={true} 
      blurMessage="Upgrade to access comprehensive portfolio stock rankings and analysis"
    >
      <Layout>
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Portfolio Stock Ranks</h1>
            <p className="text-gray-600">Comprehensive stock analysis and rankings for your portfolio</p>
          </div>

          {/* Navigation Tabs */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              <button className="border-blue-500 text-blue-600 whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm">
                Portfolio Stock Ranks
              </button>
              <button className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm">
                New Picks
              </button>
              <button className="border-transparent text-blue-600 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm underline">
                Stocks Ranks & Picks
              </button>
            </nav>
          </div>

          {/* Search and Filters */}
          <div className="mb-6 flex justify-between items-center">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search stocks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="text-sm text-gray-600">
              Showing {filteredStocks.length} stocks
            </div>
          </div>

          {/* Enhanced Stock Ranks Table */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-blue-600 text-white">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSort('symbol')}>
                      Company
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSort('stockScore')}>
                      Stocks Score
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">
                      Quarter Revenue Earnin
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">
                      Annual Revenue/Earnin
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">
                      Growth
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">
                      Valuation
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">
                      Tec Anlys
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">
                      Seasonality
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">
                      Price Now
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">
                      Analyst Price Target
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">
                      Upside Potential
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredStocks.map((stock, index) => (
                    <tr key={stock.symbol} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      {/* Company */}
                      <td className="px-4 py-4">
                        <div>
                          <div className="font-bold text-blue-600">{stock.symbol}</div>
                          <div className="text-sm text-gray-600 truncate max-w-32">{stock.name}</div>
                        </div>
                      </td>
                      
                      {/* Stock Score */}
                      <td className="px-4 py-4">
                        <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold ${getScoreColor(stock.stockScore)}`}>
                          {stock.stockScore}
                        </div>
                      </td>
                      
                      {/* Quarter Revenue */}
                      <td className="px-4 py-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded text-sm font-bold ${getGradeColor(stock.quarterRevenue)}`}>
                          {stock.quarterRevenue}
                        </span>
                      </td>
                      
                      {/* Annual Revenue */}
                      <td className="px-4 py-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded text-sm font-bold ${getGradeColor(stock.annualRevenue)}`}>
                          {stock.annualRevenue}
                        </span>
                      </td>
                      
                      {/* Growth */}
                      <td className="px-4 py-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded text-sm font-bold ${getGradeColor(stock.growthRating)}`}>
                          {stock.growthRating}
                        </span>
                      </td>
                      
                      {/* Valuation */}
                      <td className="px-4 py-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-bold ${getValuationColor(stock.valuation)}`}>
                          {stock.valuation}
                        </span>
                      </td>
                      
                      {/* Technical Analysis */}
                      <td className="px-4 py-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-bold ${getTechnicalColor(stock.technicalAnalysis)}`}>
                          {stock.technicalAnalysis}
                        </span>
                      </td>
                      
                      {/* Seasonality */}
                      <td className="px-4 py-4">
                        <div className="flex items-center">
                          {stock.technicalAnalysis === 'STRONG BUY' || stock.technicalAnalysis === 'BUY' ? (
                            <span className="text-blue-600 font-bold">{stock.seasonality}</span>
                          ) : (
                            <span className="text-gray-600">{stock.seasonality}</span>
                          )}
                        </div>
                      </td>
                      
                      {/* Price Now */}
                      <td className="px-4 py-4">
                        <div>
                          <div className="font-bold">{formatCurrency(stock.price)}</div>
                          <div className={`text-sm ${stock.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(1)}
                          </div>
                        </div>
                      </td>
                      
                      {/* Analyst Price Target */}
                      <td className="px-4 py-4">
                        <div className="font-bold">{stock.priceTarget}</div>
                      </td>
                      
                      {/* Upside Potential */}
                      <td className="px-4 py-4">
                        <div className="flex items-center">
                          <span className="text-green-600 font-bold">{stock.upsidePotential}</span>
                          <FiTrendingUp className="ml-1 text-green-600" />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Additional Info Section */}
          <div className="mt-6 text-right text-sm text-gray-500">
            <p>WINNING TRADES 5-18Y • 60DAYS</p>
          </div>

          {/* Legend */}
          <div className="mt-8 bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4">Legend</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <h4 className="font-semibold mb-2">Stock Score</h4>
                <div className="space-y-1">
                  <div className="flex items-center"><span className="w-3 h-3 bg-green-500 rounded mr-2"></span>80-100: Excellent</div>
                  <div className="flex items-center"><span className="w-3 h-3 bg-yellow-500 rounded mr-2"></span>60-79: Good</div>
                  <div className="flex items-center"><span className="w-3 h-3 bg-orange-500 rounded mr-2"></span>40-59: Fair</div>
                  <div className="flex items-center"><span className="w-3 h-3 bg-red-500 rounded mr-2"></span>0-39: Poor</div>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Valuation</h4>
                <div className="space-y-1">
                  <div className="text-green-600">UNDERVALUE: Buy opportunity</div>
                  <div className="text-blue-600">FAIR: Fairly priced</div>
                  <div className="text-red-600">OVERVALUE: Potentially expensive</div>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Technical Analysis</h4>
                <div className="space-y-1">
                  <div className="text-green-700">STRONG BUY</div>
                  <div className="text-green-600">BUY</div>
                  <div className="text-yellow-600">HOLD</div>
                  <div className="text-red-600">SELL</div>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Revenue Grades</h4>
                <div className="space-y-1">
                  <div className="text-green-600">A+, A: Excellent</div>
                  <div className="text-blue-600">B+, B: Good</div>
                  <div className="text-yellow-600">C: Average</div>
                  <div className="text-red-600">D: Below Average</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </PremiumGuard>
  );
}