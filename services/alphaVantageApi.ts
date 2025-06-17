// Alpha Vantage API Service for US Stock Data
import axios from 'axios';

// API key with environment variable support
// Get your own free key from: https://www.alphavantage.co/support/#api-key
const API_KEY = process.env.ALPHA_VANTAGE_API_KEY || process.env.NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY || 'demo';
const BASE_URL = 'https://www.alphavantage.co/query';

// Log API key status (without exposing the actual key)
console.log('Alpha Vantage API Key Status:', API_KEY === 'demo' ? 'Using demo key (limited requests)' : 'Using configured API key');

export interface USStockData {
  symbol: string;
  company: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap?: number;
  pe?: number;
  eps?: number;
  dividend?: number;
  week52High?: number;
  week52Low?: number;
  avgVolume?: number;
  beta?: number;
  timestamp: string;
  // Yeni eklenen kolonlar
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

export interface StockQuote {
  '01. symbol': string;
  '02. open': string;
  '03. high': string;
  '04. low': string;
  '05. price': string;
  '06. volume': string;
  '07. latest trading day': string;
  '08. previous close': string;
  '09. change': string;
  '10. change percent': string;
}

export interface CompanyOverview {
  Symbol: string;
  Name: string;
  Description: string;
  Exchange: string;
  Currency: string;
  Country: string;
  Sector: string;
  Industry: string;
  MarketCapitalization: string;
  PERatio: string;
  PEGRatio: string;
  BookValue: string;
  DividendPerShare: string;
  DividendYield: string;
  EPS: string;
  Beta: string;
  '52WeekHigh': string;
  '52WeekLow': string;
}

// Popular US stocks to display (ilk 100 stock)
export const POPULAR_US_STOCKS = [
  // Mega Cap Stocks
  'AAPL', 'MSFT', 'GOOGL', 'GOOG', 'AMZN', 'TSLA', 'META', 'NVDA', 'BRK.B', 'LLY',
  // Large Cap Financial
  'JPM', 'V', 'MA', 'BAC', 'WFC', 'C', 'GS', 'MS', 'AXP', 'COF',
  // Large Cap Tech
  'AVGO', 'ORCL', 'CRM', 'ADBE', 'NFLX', 'INTC', 'AMD', 'NOW', 'IBM', 'CSCO',
  // Healthcare & Pharma
  'JNJ', 'PFE', 'UNH', 'ABBV', 'MRK', 'TMO', 'ABT', 'DHR', 'BMY', 'AMGN',
  // Consumer & Retail
  'PG', 'KO', 'PEP', 'WMT', 'HD', 'MCD', 'NKE', 'SBUX', 'TGT', 'LOW',
  // Industrial & Manufacturing
  'BA', 'CAT', 'GE', 'MMM', 'HON', 'UPS', 'RTX', 'LMT', 'NOC', 'GD',
  // Energy & Utilities
  'XOM', 'CVX', 'COP', 'SLB', 'EOG', 'KMI', 'OKE', 'WMB', 'PXD', 'MPC',
  // Telecommunications & Media
  'VZ', 'T', 'CMCSA', 'DIS', 'NFLX', 'PARA', 'WBD', 'FOX', 'FOXA', 'CHTR',
  // Banking & Insurance
  'BRK.A', 'JPM', 'BAC', 'WFC', 'USB', 'PNC', 'TFC', 'COF', 'AIG', 'MET',
  // Real Estate & REITs
  'AMT', 'PLD', 'CCI', 'EQIX', 'PSA', 'WELL', 'EXR', 'AVB', 'EQR', 'VTR',
  // Emerging & Growth
  'ZOOM', 'SNOW', 'PLTR', 'RBLX', 'COIN', 'UBER', 'LYFT', 'ABNB', 'DASH', 'RIVN'
];

class AlphaVantageAPI {
  private apiKey: string;
  private baseUrl: string;
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 60000; // 1 minute cache

  constructor(apiKey: string = API_KEY) {
    this.apiKey = apiKey;
    this.baseUrl = BASE_URL;
  }

  private getCachedData(key: string): any | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }
    return null;
  }

  private setCachedData(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  async getQuote(symbol: string): Promise<USStockData | null> {
    const cacheKey = `quote_${symbol}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      const response = await axios.get(this.baseUrl, {
        params: {
          function: 'GLOBAL_QUOTE',
          symbol: symbol,
          apikey: this.apiKey
        },
        timeout: 10000
      });

      const quote = response.data['Global Quote'] as StockQuote;
      
      if (!quote || !quote['01. symbol']) {
        console.warn(`No data found for symbol: ${symbol}`);
        return null;
      }

      const stockData: USStockData = {
        symbol: quote['01. symbol'],
        company: quote['01. symbol'], // Will be updated with company info
        price: parseFloat(quote['05. price']),
        change: parseFloat(quote['09. change']),
        changePercent: parseFloat(quote['10. change percent'].replace('%', '')),
        volume: parseInt(quote['06. volume']),
        timestamp: quote['07. latest trading day']
      };

      this.setCachedData(cacheKey, stockData);
      return stockData;
    } catch (error) {
      console.error(`Error fetching quote for ${symbol}:`, error);
      return null;
    }
  }

  async getCompanyOverview(symbol: string): Promise<CompanyOverview | null> {
    const cacheKey = `overview_${symbol}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      const response = await axios.get(this.baseUrl, {
        params: {
          function: 'OVERVIEW',
          symbol: symbol,
          apikey: this.apiKey
        },
        timeout: 10000
      });

      const overview = response.data as CompanyOverview;
      
      if (!overview || !overview.Symbol) {
        console.warn(`No overview data found for symbol: ${symbol}`);
        return null;
      }

      this.setCachedData(cacheKey, overview);
      return overview;
    } catch (error) {
      console.error(`Error fetching overview for ${symbol}:`, error);
      return null;
    }
  }

  async getIntradayData(symbol: string, interval: string = '5min'): Promise<any> {
    const cacheKey = `intraday_${symbol}_${interval}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      const response = await axios.get(this.baseUrl, {
        params: {
          function: 'TIME_SERIES_INTRADAY',
          symbol: symbol,
          interval: interval,
          apikey: this.apiKey,
          outputsize: 'compact'
        },
        timeout: 15000
      });

      const data = response.data;
      this.setCachedData(cacheKey, data);
      return data;
    } catch (error) {
      console.error(`Error fetching intraday data for ${symbol}:`, error);
      return null;
    }
  }

  async getMultipleQuotes(symbols: string[]): Promise<USStockData[]> {
    const promises = symbols.map(symbol => this.getQuote(symbol));
    const results = await Promise.allSettled(promises);
    
    return results
      .filter((result): result is PromiseFulfilledResult<USStockData> => 
        result.status === 'fulfilled' && result.value !== null
      )
      .map(result => result.value);
  }

  async getPopularStocks(): Promise<USStockData[]> {
    return this.getMultipleQuotes(POPULAR_US_STOCKS.slice(0, 100)); // İlk 100 stock'u göster
  }

  // Get dividend yield for a specific symbol
  async getDividendYield(symbol: string): Promise<number | null> {
    try {
      const overview = await this.getCompanyOverview(symbol);
      if (overview && overview.DividendYield && overview.DividendYield !== 'None') {
        const yieldValue = parseFloat(overview.DividendYield);
        return isNaN(yieldValue) ? null : yieldValue / 100; // Convert percentage to decimal
      }
      return null;
    } catch (error) {
      console.error(`Error fetching dividend yield for ${symbol}:`, error);
      return null;
    }
  }

  // Get country for a specific symbol
  async getCountry(symbol: string): Promise<string | null> {
    try {
      const overview = await this.getCompanyOverview(symbol);
      return overview?.Country || null;
    } catch (error) {
      console.error(`Error fetching country for ${symbol}:`, error);
      return null;
    }
  }

  // Get both dividend yield and country for multiple symbols efficiently
  async getStockMetadata(symbols: string[]): Promise<Map<string, {dividendYield: number | null, country: string | null}>> {
    const metadataMap = new Map();
    
    // Mock data as fallback for common stocks
    const mockData = {
      'AAPL': { dividendYield: 0.0044, country: 'United States' },
      'MSFT': { dividendYield: 0.0072, country: 'United States' },
      'GOOGL': { dividendYield: 0.0000, country: 'United States' },
      'AMZN': { dividendYield: 0.0000, country: 'United States' },
      'TSLA': { dividendYield: 0.0000, country: 'United States' },
      'META': { dividendYield: 0.0040, country: 'United States' },
      'NVDA': { dividendYield: 0.0002, country: 'United States' },
      'JPM': { dividendYield: 0.0252, country: 'United States' },
      'JNJ': { dividendYield: 0.0287, country: 'United States' },
      'V': { dividendYield: 0.0075, country: 'United States' },
      'PG': { dividendYield: 0.0240, country: 'United States' },
      'UNH': { dividendYield: 0.0130, country: 'United States' },
      'HD': { dividendYield: 0.0239, country: 'United States' },
      'DIS': { dividendYield: 0.0000, country: 'United States' },
      'MA': { dividendYield: 0.0050, country: 'United States' },
      'PFE': { dividendYield: 0.0588, country: 'United States' },
      'BAC': { dividendYield: 0.0291, country: 'United States' },
      'XOM': { dividendYield: 0.0575, country: 'United States' },
      'ABBV': { dividendYield: 0.0351, country: 'United States' },
      'KO': { dividendYield: 0.0301, country: 'United States' },
      'VZ': { dividendYield: 0.0644, country: 'United States' },
      'ADBE': { dividendYield: 0.0000, country: 'United States' },
      'CRM': { dividendYield: 0.0000, country: 'United States' },
      'NFLX': { dividendYield: 0.0000, country: 'United States' },
      'CMCSA': { dividendYield: 0.0276, country: 'United States' },
      'PEP': { dividendYield: 0.0274, country: 'United States' },
      'TMO': { dividendYield: 0.0021, country: 'United States' },
      'COST': { dividendYield: 0.0051, country: 'United States' },
    };
    
    // Process symbols in batches to avoid API rate limits
    const batchSize = 5;
    for (let i = 0; i < symbols.length; i += batchSize) {
      const batch = symbols.slice(i, i + batchSize);
      const promises = batch.map(async (symbol) => {
        try {
          // First try mock data for common stocks
          if (mockData[symbol as keyof typeof mockData]) {
            const mock = mockData[symbol as keyof typeof mockData];
            return {
              symbol,
              dividendYield: mock.dividendYield,
              country: mock.country
            };
          }
          
          // Then try API call
          const overview = await this.getCompanyOverview(symbol);
          let dividendYield = null;
          if (overview?.DividendYield && overview.DividendYield !== 'None') {
            const yieldValue = parseFloat(overview.DividendYield);
            dividendYield = isNaN(yieldValue) ? null : yieldValue / 100;
          }
          
          return {
            symbol,
            dividendYield,
            country: overview?.Country || 'United States' // Default to US
          };
        } catch (error) {
          console.error(`Error fetching metadata for ${symbol}:`, error);
          // Use default values for unknown symbols
          return {
            symbol,
            dividendYield: null,
            country: 'United States'
          };
        }
      });

      const results = await Promise.allSettled(promises);
      results.forEach((result) => {
        if (result.status === 'fulfilled') {
          metadataMap.set(result.value.symbol, {
            dividendYield: result.value.dividendYield,
            country: result.value.country
          });
        }
      });

      // Add delay between batches to respect rate limits
      if (i + batchSize < symbols.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    return metadataMap;
  }

  // Mock data for fallback when API limits are reached - S&P 500 Top 100 stocks
  getMockStockData(): USStockData[] {
    // S&P 500'ün ilk 100 hissesi için gerçekçi mock data
    const mockStocks = [
      // Top 10 Mega Cap
      { symbol: 'AAPL', company: 'Apple Inc.', price: 182.63, change: 2.85, changePercent: 1.58, volume: 45230000, marketCap: 2850000000000, pe: 28.5, eps: 6.42, dividend: 0.96, stockScore: 85, quarterRevenueEarning: '$89.5B', annualRevenueEarning: '$394.3B', growth: '+8.2%', valuation: 'Fair', techAnalysis: 'Bullish', seasonality: 'Neutral', analysisPriceTarget: '$195.00', upsidePotential: '+6.8%' },
      { symbol: 'MSFT', company: 'Microsoft Corporation', price: 402.75, change: 5.20, changePercent: 1.31, volume: 23450000, marketCap: 2990000000000, pe: 32.1, eps: 12.55, dividend: 3.32, stockScore: 92, quarterRevenueEarning: '$65.6B', annualRevenueEarning: '$245.1B', growth: '+12.1%', valuation: 'Buy', techAnalysis: 'Strong Buy', seasonality: 'Positive', analysisPriceTarget: '$425.00', upsidePotential: '+5.5%' },
      { symbol: 'GOOGL', company: 'Alphabet Inc.', price: 176.25, change: -1.85, changePercent: -1.04, volume: 18200000, marketCap: 2180000000000, pe: 24.8, eps: 7.09, dividend: 0.0, stockScore: 78, quarterRevenueEarning: '$76.7B', annualRevenueEarning: '$307.4B', growth: '+7.0%', valuation: 'Hold', techAnalysis: 'Neutral', seasonality: 'Negative', analysisPriceTarget: '$185.00', upsidePotential: '+4.9%' },
      { symbol: 'AMZN', company: 'Amazon.com Inc.', price: 185.07, change: 3.42, changePercent: 1.88, volume: 34100000, marketCap: 1930000000000, pe: 58.2, eps: 3.18, dividend: 0.0, stockScore: 72, quarterRevenueEarning: '$143.3B', annualRevenueEarning: '$554.0B', growth: '+9.4%', valuation: 'Overvalued', techAnalysis: 'Buy', seasonality: 'Positive', analysisPriceTarget: '$195.00', upsidePotential: '+5.4%' },
      { symbol: 'NVDA', company: 'NVIDIA Corporation', price: 878.37, change: 15.62, changePercent: 1.81, volume: 45600000, marketCap: 2170000000000, pe: 66.8, eps: 13.14, dividend: 0.16, stockScore: 95, quarterRevenueEarning: '$18.1B', annualRevenueEarning: '$79.8B', growth: '+126.0%', valuation: 'Fair', techAnalysis: 'Strong Buy', seasonality: 'Strong', analysisPriceTarget: '$950.00', upsidePotential: '+8.2%' },
      { symbol: 'TSLA', company: 'Tesla Inc.', price: 238.59, change: 8.45, changePercent: 3.67, volume: 89200000, marketCap: 758000000000, pe: 65.4, eps: 3.65, dividend: 0.0, stockScore: 68, quarterRevenueEarning: '$25.2B', annualRevenueEarning: '$96.8B', growth: '+19.3%', valuation: 'Overvalued', techAnalysis: 'Volatile', seasonality: 'Strong', analysisPriceTarget: '$275.00', upsidePotential: '+15.3%' },
      { symbol: 'META', company: 'Meta Platforms Inc.', price: 493.50, change: -7.25, changePercent: -1.45, volume: 12800000, marketCap: 1250000000000, pe: 25.7, eps: 19.21, dividend: 2.0, stockScore: 81, quarterRevenueEarning: '$36.5B', annualRevenueEarning: '$134.9B', growth: '+15.7%', valuation: 'Fair', techAnalysis: 'Buy', seasonality: 'Neutral', analysisPriceTarget: '$520.00', upsidePotential: '+5.4%' },
      { symbol: 'BRK.B', company: 'Berkshire Hathaway Inc.', price: 435.20, change: 2.15, changePercent: 0.50, volume: 3200000, marketCap: 984000000000, pe: 18.2, eps: 23.90, dividend: 0.0, stockScore: 88, quarterRevenueEarning: '$89.9B', annualRevenueEarning: '$364.5B', growth: '+5.8%', valuation: 'Undervalued', techAnalysis: 'Buy', seasonality: 'Positive', analysisPriceTarget: '$465.00', upsidePotential: '+6.9%' },
      { symbol: 'LLY', company: 'Eli Lilly and Company', price: 612.45, change: 18.32, changePercent: 3.08, volume: 2850000, marketCap: 580000000000, pe: 89.4, eps: 6.85, dividend: 5.76, stockScore: 91, quarterRevenueEarning: '$9.1B', annualRevenueEarning: '$34.1B', growth: '+28.5%', valuation: 'Buy', techAnalysis: 'Strong Buy', seasonality: 'Strong', analysisPriceTarget: '$680.00', upsidePotential: '+11.0%' },
      { symbol: 'AVGO', company: 'Broadcom Inc.', price: 1125.80, change: 8.95, changePercent: 0.80, volume: 1420000, marketCap: 520000000000, pe: 34.5, eps: 32.60, dividend: 21.60, stockScore: 79, quarterRevenueEarning: '$12.2B', annualRevenueEarning: '$48.1B', growth: '+14.2%', valuation: 'Fair', techAnalysis: 'Buy', seasonality: 'Positive', analysisPriceTarget: '$1200.00', upsidePotential: '+6.6%' },
      
      // Financial Sector (11-25)
      { symbol: 'JPM', company: 'JPMorgan Chase & Co.', price: 182.45, change: 1.25, changePercent: 0.69, volume: 8900000, marketCap: 531000000000, pe: 12.3, eps: 14.83, dividend: 4.60, stockScore: 76, quarterRevenueEarning: '$42.8B', annualRevenueEarning: '$162.4B', growth: '+22.3%', valuation: 'Undervalued', techAnalysis: 'Buy', seasonality: 'Positive', analysisPriceTarget: '$200.00', upsidePotential: '+9.6%' },
      { symbol: 'V', company: 'Visa Inc.', price: 268.75, change: 3.45, changePercent: 1.30, volume: 4250000, marketCap: 575000000000, pe: 32.8, eps: 8.20, dividend: 2.08, stockScore: 84, quarterRevenueEarning: '$8.9B', annualRevenueEarning: '$32.7B', growth: '+11.4%', valuation: 'Fair', techAnalysis: 'Buy', seasonality: 'Neutral', analysisPriceTarget: '$285.00', upsidePotential: '+6.0%' },
      { symbol: 'MA', company: 'Mastercard Incorporated', price: 421.60, change: 5.80, changePercent: 1.39, volume: 2100000, marketCap: 400000000000, pe: 35.2, eps: 11.97, dividend: 2.37, stockScore: 82, quarterRevenueEarning: '$6.4B', annualRevenueEarning: '$25.1B', growth: '+13.2%', valuation: 'Fair', techAnalysis: 'Buy', seasonality: 'Positive', analysisPriceTarget: '$450.00', upsidePotential: '+6.7%' },
      { symbol: 'BAC', company: 'Bank of America Corporation', price: 34.85, change: 0.45, changePercent: 1.31, volume: 45200000, marketCap: 275000000000, pe: 13.8, eps: 2.53, dividend: 0.96, stockScore: 71, quarterRevenueEarning: '$25.3B', annualRevenueEarning: '$94.2B', growth: '+8.7%', valuation: 'Undervalued', techAnalysis: 'Hold', seasonality: 'Neutral', analysisPriceTarget: '$38.00', upsidePotential: '+9.0%' },
      { symbol: 'WFC', company: 'Wells Fargo & Company', price: 58.20, change: 0.85, changePercent: 1.48, volume: 18500000, marketCap: 215000000000, pe: 12.5, eps: 4.66, dividend: 1.20, stockScore: 68, quarterRevenueEarning: '$20.1B', annualRevenueEarning: '$73.8B', growth: '+6.2%', valuation: 'Undervalued', techAnalysis: 'Hold', seasonality: 'Positive', analysisPriceTarget: '$63.00', upsidePotential: '+8.2%' },
      { symbol: 'GS', company: 'Goldman Sachs Group Inc.', price: 385.20, change: 4.85, changePercent: 1.28, volume: 1850000, marketCap: 130000000000, pe: 11.8, eps: 32.64, dividend: 10.00, stockScore: 75, quarterRevenueEarning: '$12.7B', annualRevenueEarning: '$44.9B', growth: '+16.4%', valuation: 'Undervalued', techAnalysis: 'Buy', seasonality: 'Positive', analysisPriceTarget: '$420.00', upsidePotential: '+9.0%' },
      { symbol: 'MS', company: 'Morgan Stanley', price: 105.30, change: 1.85, changePercent: 1.79, volume: 8950000, marketCap: 175000000000, pe: 14.2, eps: 7.42, dividend: 3.70, stockScore: 73, quarterRevenueEarning: '$13.3B', annualRevenueEarning: '$47.7B', growth: '+4.6%', valuation: 'Fair', techAnalysis: 'Buy', seasonality: 'Neutral', analysisPriceTarget: '$115.00', upsidePotential: '+9.2%' },
      { symbol: 'AXP', company: 'American Express Company', price: 165.45, change: 2.35, changePercent: 1.44, volume: 3250000, marketCap: 120000000000, pe: 15.8, eps: 10.47, dividend: 2.80, stockScore: 77, quarterRevenueEarning: '$15.1B', annualRevenueEarning: '$55.7B', growth: '+9.1%', valuation: 'Fair', techAnalysis: 'Buy', seasonality: 'Positive', analysisPriceTarget: '$180.00', upsidePotential: '+8.8%' },
      { symbol: 'COF', company: 'Capital One Financial Corporation', price: 142.85, change: 2.95, changePercent: 2.11, volume: 2850000, marketCap: 55000000000, pe: 10.2, eps: 14.01, dividend: 2.40, stockScore: 72, quarterRevenueEarning: '$9.3B', annualRevenueEarning: '$33.4B', growth: '+8.2%', valuation: 'Undervalued', techAnalysis: 'Buy', seasonality: 'Positive', analysisPriceTarget: '$160.00', upsidePotential: '+12.0%' },
      { symbol: 'C', company: 'Citigroup Inc.', price: 63.75, change: 0.95, changePercent: 1.51, volume: 14200000, marketCap: 125000000000, pe: 8.9, eps: 7.16, dividend: 2.04, stockScore: 69, quarterRevenueEarning: '$20.1B', annualRevenueEarning: '$75.3B', growth: '+3.1%', valuation: 'Undervalued', techAnalysis: 'Hold', seasonality: 'Neutral', analysisPriceTarget: '$70.00', upsidePotential: '+9.8%' },
      
      // Technology Sector (26-50)
      { symbol: 'ORCL', company: 'Oracle Corporation', price: 138.45, change: 2.15, changePercent: 1.58, volume: 8200000, marketCap: 380000000000, pe: 28.9, eps: 4.79, dividend: 1.60, stockScore: 74, quarterRevenueEarning: '$12.9B', annualRevenueEarning: '$50.0B', growth: '+7.1%', valuation: 'Fair', techAnalysis: 'Buy', seasonality: 'Neutral', analysisPriceTarget: '$150.00', upsidePotential: '+8.3%' },
      { symbol: 'CRM', company: 'Salesforce Inc.', price: 285.30, change: -2.45, changePercent: -0.85, volume: 3850000, marketCap: 275000000000, pe: 58.2, eps: 4.90, dividend: 0.0, stockScore: 69, quarterRevenueEarning: '$9.3B', annualRevenueEarning: '$34.9B', growth: '+11.2%', valuation: 'Overvalued', techAnalysis: 'Hold', seasonality: 'Negative', analysisPriceTarget: '$310.00', upsidePotential: '+8.7%' },
      { symbol: 'ADBE', company: 'Adobe Inc.', price: 568.75, change: 8.50, changePercent: 1.52, volume: 1950000, marketCap: 260000000000, pe: 45.8, eps: 12.43, dividend: 0.0, stockScore: 77, quarterRevenueEarning: '$5.0B', annualRevenueEarning: '$19.4B', growth: '+9.8%', valuation: 'Fair', techAnalysis: 'Buy', seasonality: 'Positive', analysisPriceTarget: '$610.00', upsidePotential: '+7.3%' },
      { symbol: 'NFLX', company: 'Netflix Inc.', price: 485.20, change: 12.45, changePercent: 2.63, volume: 4200000, marketCap: 210000000000, pe: 42.3, eps: 11.47, dividend: 0.0, stockScore: 73, quarterRevenueEarning: '$8.5B', annualRevenueEarning: '$31.6B', growth: '+15.0%', valuation: 'Fair', techAnalysis: 'Buy', seasonality: 'Strong', analysisPriceTarget: '$520.00', upsidePotential: '+7.2%' },
      { symbol: 'INTC', company: 'Intel Corporation', price: 32.80, change: -0.85, changePercent: -2.53, volume: 32500000, marketCap: 140000000000, pe: 18.2, eps: 1.80, dividend: 0.50, stockScore: 55, quarterRevenueEarning: '$15.9B', annualRevenueEarning: '$63.1B', growth: '-8.2%', valuation: 'Undervalued', techAnalysis: 'Hold', seasonality: 'Negative', analysisPriceTarget: '$38.00', upsidePotential: '+15.9%' },
      { symbol: 'AMD', company: 'Advanced Micro Devices Inc.', price: 142.30, change: 4.20, changePercent: 3.04, volume: 28500000, marketCap: 230000000000, pe: 52.8, eps: 2.69, dividend: 0.0, stockScore: 71, quarterRevenueEarning: '$5.8B', annualRevenueEarning: '$22.7B', growth: '+2.1%', valuation: 'Fair', techAnalysis: 'Buy', seasonality: 'Positive', analysisPriceTarget: '$165.00', upsidePotential: '+15.9%' },
      { symbol: 'CSCO', company: 'Cisco Systems Inc.', price: 52.45, change: 0.65, changePercent: 1.25, volume: 15800000, marketCap: 210000000000, pe: 15.2, eps: 3.45, dividend: 1.60, stockScore: 66, quarterRevenueEarning: '$13.6B', annualRevenueEarning: '$53.8B', growth: '+0.2%', valuation: 'Undervalued', techAnalysis: 'Hold', seasonality: 'Neutral', analysisPriceTarget: '$58.00', upsidePotential: '+10.6%' },
      { symbol: 'IBM', company: 'International Business Machines Corporation', price: 195.80, change: 1.85, changePercent: 0.95, volume: 3850000, marketCap: 180000000000, pe: 22.1, eps: 8.86, dividend: 6.72, stockScore: 62, quarterRevenueEarning: '$14.2B', annualRevenueEarning: '$57.4B', growth: '-4.6%', valuation: 'Undervalued', techAnalysis: 'Hold', seasonality: 'Neutral', analysisPriceTarget: '$210.00', upsidePotential: '+7.2%' },
      { symbol: 'NOW', company: 'ServiceNow Inc.', price: 745.30, change: 12.85, changePercent: 1.76, volume: 1250000, marketCap: 155000000000, pe: 78.5, eps: 9.49, dividend: 0.0, stockScore: 80, quarterRevenueEarning: '$2.6B', annualRevenueEarning: '$9.9B', growth: '+26.1%', valuation: 'Overvalued', techAnalysis: 'Buy', seasonality: 'Strong', analysisPriceTarget: '$810.00', upsidePotential: '+8.7%' },
      { symbol: 'QCOM', company: 'QUALCOMM Incorporated', price: 169.85, change: 3.25, changePercent: 1.95, volume: 8950000, marketCap: 190000000000, pe: 17.2, eps: 9.87, dividend: 3.04, stockScore: 76, quarterRevenueEarning: '$9.9B', annualRevenueEarning: '$35.8B', growth: '-1.1%', valuation: 'Fair', techAnalysis: 'Buy', seasonality: 'Positive', analysisPriceTarget: '$185.00', upsidePotential: '+8.9%' },
      
      // Healthcare & Pharmaceuticals (51-75)
      { symbol: 'JNJ', company: 'Johnson & Johnson', price: 159.85, change: 1.25, changePercent: 0.79, volume: 6850000, marketCap: 385000000000, pe: 17.2, eps: 9.29, dividend: 4.96, stockScore: 83, quarterRevenueEarning: '$21.4B', annualRevenueEarning: '$85.2B', growth: '+0.8%', valuation: 'Fair', techAnalysis: 'Buy', seasonality: 'Positive', analysisPriceTarget: '$170.00', upsidePotential: '+6.3%' },
      { symbol: 'PFE', company: 'Pfizer Inc.', price: 28.45, change: -0.35, changePercent: -1.22, volume: 28500000, marketCap: 160000000000, pe: 12.8, eps: 2.22, dividend: 1.68, stockScore: 59, quarterRevenueEarning: '$13.3B', annualRevenueEarning: '$58.5B', growth: '-42.0%', valuation: 'Undervalued', techAnalysis: 'Hold', seasonality: 'Negative', analysisPriceTarget: '$32.00', upsidePotential: '+12.5%' },
      { symbol: 'UNH', company: 'UnitedHealth Group Incorporated', price: 548.70, change: 6.85, changePercent: 1.26, volume: 2100000, marketCap: 520000000000, pe: 24.5, eps: 22.40, dividend: 7.52, stockScore: 89, quarterRevenueEarning: '$92.4B', annualRevenueEarning: '$371.6B', growth: '+14.6%', valuation: 'Fair', techAnalysis: 'Strong Buy', seasonality: 'Positive', analysisPriceTarget: '$590.00', upsidePotential: '+7.5%' },
      { symbol: 'ABBV', company: 'AbbVie Inc.', price: 168.25, change: 2.15, changePercent: 1.29, volume: 5200000, marketCap: 297000000000, pe: 15.8, eps: 10.65, dividend: 6.24, stockScore: 78, quarterRevenueEarning: '$14.5B', annualRevenueEarning: '$54.3B', growth: '-0.9%', valuation: 'Fair', techAnalysis: 'Buy', seasonality: 'Positive', analysisPriceTarget: '$180.00', upsidePotential: '+7.0%' },
      { symbol: 'MRK', company: 'Merck & Co. Inc.', price: 125.80, change: 1.45, changePercent: 1.17, volume: 8950000, marketCap: 318000000000, pe: 16.2, eps: 7.77, dividend: 2.92, stockScore: 80, quarterRevenueEarning: '$16.7B', annualRevenueEarning: '$60.1B', growth: '+7.2%', valuation: 'Fair', techAnalysis: 'Buy', seasonality: 'Neutral', analysisPriceTarget: '$135.00', upsidePotential: '+7.3%' },
      { symbol: 'TMO', company: 'Thermo Fisher Scientific Inc.', price: 568.25, change: 8.45, changePercent: 1.51, volume: 1150000, marketCap: 220000000000, pe: 29.8, eps: 19.07, dividend: 1.20, stockScore: 82, quarterRevenueEarning: '$10.5B', annualRevenueEarning: '$42.5B', growth: '+0.5%', valuation: 'Fair', techAnalysis: 'Buy', seasonality: 'Neutral', analysisPriceTarget: '$610.00', upsidePotential: '+7.4%' },
      { symbol: 'ABT', company: 'Abbott Laboratories', price: 108.45, change: 1.85, changePercent: 1.74, volume: 5250000, marketCap: 190000000000, pe: 24.2, eps: 4.48, dividend: 2.16, stockScore: 79, quarterRevenueEarning: '$10.6B', annualRevenueEarning: '$40.1B', growth: '+1.9%', valuation: 'Fair', techAnalysis: 'Buy', seasonality: 'Positive', analysisPriceTarget: '$118.00', upsidePotential: '+8.8%' },
      { symbol: 'DHR', company: 'Danaher Corporation', price: 245.30, change: 3.85, changePercent: 1.59, volume: 2150000, marketCap: 180000000000, pe: 31.5, eps: 7.79, dividend: 0.84, stockScore: 81, quarterRevenueEarning: '$5.7B', annualRevenueEarning: '$23.1B', growth: '-1.8%', valuation: 'Fair', techAnalysis: 'Buy', seasonality: 'Neutral', analysisPriceTarget: '$265.00', upsidePotential: '+8.0%' },
      { symbol: 'BMY', company: 'Bristol-Myers Squibb Company', price: 52.85, change: 0.85, changePercent: 1.63, volume: 9850000, marketCap: 110000000000, pe: 11.8, eps: 4.48, dividend: 2.12, stockScore: 68, quarterRevenueEarning: '$11.9B', annualRevenueEarning: '$45.0B', growth: '+0.9%', valuation: 'Undervalued', techAnalysis: 'Hold', seasonality: 'Neutral', analysisPriceTarget: '$58.00', upsidePotential: '+9.7%' },
      { symbol: 'AMGN', company: 'Amgen Inc.', price: 285.45, change: 4.25, changePercent: 1.51, volume: 2450000, marketCap: 155000000000, pe: 15.2, eps: 18.78, dividend: 8.36, stockScore: 75, quarterRevenueEarning: '$7.1B', annualRevenueEarning: '$28.2B', growth: '+5.1%', valuation: 'Fair', techAnalysis: 'Buy', seasonality: 'Positive', analysisPriceTarget: '$310.00', upsidePotential: '+8.6%' },
      
      // Consumer & Retail (76-85)
      { symbol: 'PG', company: 'Procter & Gamble Company', price: 158.45, change: 0.85, changePercent: 0.54, volume: 4850000, marketCap: 375000000000, pe: 26.8, eps: 5.91, dividend: 3.70, stockScore: 81, quarterRevenueEarning: '$21.7B', annualRevenueEarning: '$82.0B', growth: '+2.3%', valuation: 'Fair', techAnalysis: 'Hold', seasonality: 'Neutral', analysisPriceTarget: '$165.00', upsidePotential: '+4.1%' },
      { symbol: 'KO', company: 'Coca-Cola Company', price: 59.25, change: 0.35, changePercent: 0.59, volume: 14200000, marketCap: 256000000000, pe: 25.4, eps: 2.33, dividend: 1.84, stockScore: 74, quarterRevenueEarning: '$12.0B', annualRevenueEarning: '$45.8B', growth: '+7.8%', valuation: 'Fair', techAnalysis: 'Hold', seasonality: 'Positive', analysisPriceTarget: '$63.00', upsidePotential: '+6.3%' },
      { symbol: 'WMT', company: 'Walmart Inc.', price: 165.30, change: 2.15, changePercent: 1.32, volume: 6250000, marketCap: 542000000000, pe: 27.2, eps: 6.08, dividend: 2.28, stockScore: 76, quarterRevenueEarning: '$169.3B', annualRevenueEarning: '$648.1B', growth: '+6.0%', valuation: 'Fair', techAnalysis: 'Buy', seasonality: 'Strong', analysisPriceTarget: '$175.00', upsidePotential: '+5.9%' },
      { symbol: 'HD', company: 'Home Depot Inc.', price: 368.20, change: 4.85, changePercent: 1.34, volume: 2850000, marketCap: 375000000000, pe: 26.1, eps: 14.11, dividend: 8.48, stockScore: 79, quarterRevenueEarning: '$37.7B', annualRevenueEarning: '$157.4B', growth: '+6.8%', valuation: 'Fair', techAnalysis: 'Buy', seasonality: 'Positive', analysisPriceTarget: '$390.00', upsidePotential: '+5.9%' },
      { symbol: 'MCD', company: 'McDonald\'s Corporation', price: 282.45, change: 1.85, changePercent: 0.66, volume: 1950000, marketCap: 205000000000, pe: 24.8, eps: 11.39, dividend: 6.68, stockScore: 77, quarterRevenueEarning: '$6.7B', annualRevenueEarning: '$25.5B', growth: '+8.1%', valuation: 'Fair', techAnalysis: 'Hold', seasonality: 'Neutral', analysisPriceTarget: '$295.00', upsidePotential: '+4.4%' },
      { symbol: 'PEP', company: 'PepsiCo Inc.', price: 172.85, change: 1.45, changePercent: 0.85, volume: 4250000, marketCap: 240000000000, pe: 25.2, eps: 6.86, dividend: 4.88, stockScore: 76, quarterRevenueEarning: '$23.3B', annualRevenueEarning: '$91.5B', growth: '+0.5%', valuation: 'Fair', techAnalysis: 'Hold', seasonality: 'Neutral', analysisPriceTarget: '$180.00', upsidePotential: '+4.1%' },
      { symbol: 'COST', company: 'Costco Wholesale Corporation', price: 745.25, change: 8.95, changePercent: 1.22, volume: 1850000, marketCap: 330000000000, pe: 48.2, eps: 15.46, dividend: 4.48, stockScore: 83, quarterRevenueEarning: '$58.4B', annualRevenueEarning: '$237.7B', growth: '+7.1%', valuation: 'Overvalued', techAnalysis: 'Buy', seasonality: 'Strong', analysisPriceTarget: '$790.00', upsidePotential: '+6.0%' },
      { symbol: 'NKE', company: 'NIKE Inc.', price: 95.45, change: -1.85, changePercent: -1.90, volume: 8950000, marketCap: 150000000000, pe: 28.5, eps: 3.35, dividend: 1.48, stockScore: 70, quarterRevenueEarning: '$13.4B', annualRevenueEarning: '$51.2B', growth: '+0.1%', valuation: 'Fair', techAnalysis: 'Hold', seasonality: 'Negative', analysisPriceTarget: '$105.00', upsidePotential: '+10.0%' },
      { symbol: 'SBUX', company: 'Starbucks Corporation', price: 95.25, change: 1.45, changePercent: 1.55, volume: 6850000, marketCap: 110000000000, pe: 24.8, eps: 3.84, dividend: 2.04, stockScore: 72, quarterRevenueEarning: '$9.2B', annualRevenueEarning: '$36.0B', growth: '+11.0%', valuation: 'Fair', techAnalysis: 'Buy', seasonality: 'Positive', analysisPriceTarget: '$105.00', upsidePotential: '+10.2%' },
      { symbol: 'TGT', company: 'Target Corporation', price: 148.75, change: 2.85, changePercent: 1.95, volume: 4250000, marketCap: 68000000000, pe: 16.8, eps: 8.85, dividend: 4.32, stockScore: 74, quarterRevenueEarning: '$25.2B', annualRevenueEarning: '$107.4B', growth: '+2.7%', valuation: 'Fair', techAnalysis: 'Buy', seasonality: 'Strong', analysisPriceTarget: '$165.00', upsidePotential: '+10.9%' },
      
      // Energy & Utilities (86-95)
      { symbol: 'XOM', company: 'Exxon Mobil Corporation', price: 118.45, change: 2.35, changePercent: 2.02, volume: 15800000, marketCap: 485000000000, pe: 14.2, eps: 8.34, dividend: 3.64, stockScore: 72, quarterRevenueEarning: '$90.5B', annualRevenueEarning: '$344.6B', growth: '+17.5%', valuation: 'Fair', techAnalysis: 'Buy', seasonality: 'Positive', analysisPriceTarget: '$130.00', upsidePotential: '+9.7%' },
      { symbol: 'CVX', company: 'Chevron Corporation', price: 158.20, change: 1.95, changePercent: 1.25, volume: 8950000, marketCap: 295000000000, pe: 13.8, eps: 11.46, dividend: 3.76, stockScore: 75, quarterRevenueEarning: '$50.7B', annualRevenueEarning: '$200.5B', growth: '+6.1%', valuation: 'Undervalued', techAnalysis: 'Buy', seasonality: 'Positive', analysisPriceTarget: '$170.00', upsidePotential: '+7.5%' },
      { symbol: 'NEE', company: 'NextEra Energy Inc.', price: 75.85, change: 0.85, changePercent: 1.13, volume: 6200000, marketCap: 155000000000, pe: 22.1, eps: 3.43, dividend: 1.86, stockScore: 73, quarterRevenueEarning: '$6.4B', annualRevenueEarning: '$28.1B', growth: '+8.9%', valuation: 'Fair', techAnalysis: 'Hold', seasonality: 'Neutral', analysisPriceTarget: '$82.00', upsidePotential: '+8.1%' },
      { symbol: 'COP', company: 'ConocoPhillips', price: 108.45, change: 1.85, changePercent: 1.74, volume: 7250000, marketCap: 135000000000, pe: 12.2, eps: 8.89, dividend: 2.04, stockScore: 76, quarterRevenueEarning: '$17.8B', annualRevenueEarning: '$64.4B', growth: '+35.1%', valuation: 'Undervalued', techAnalysis: 'Buy', seasonality: 'Positive', analysisPriceTarget: '$120.00', upsidePotential: '+10.7%' },
      { symbol: 'SLB', company: 'Schlumberger Limited', price: 48.25, change: 0.95, changePercent: 2.01, volume: 12500000, marketCap: 68000000000, pe: 15.8, eps: 3.05, dividend: 1.00, stockScore: 69, quarterRevenueEarning: '$7.9B', annualRevenueEarning: '$30.1B', growth: '+12.2%', valuation: 'Fair', techAnalysis: 'Buy', seasonality: 'Positive', analysisPriceTarget: '$55.00', upsidePotential: '+14.0%' },
      { symbol: 'EOG', company: 'EOG Resources Inc.', price: 128.45, change: 2.15, changePercent: 1.70, volume: 4250000, marketCap: 75000000000, pe: 11.8, eps: 10.89, dividend: 3.00, stockScore: 74, quarterRevenueEarning: '$5.4B', annualRevenueEarning: '$21.3B', growth: '+18.2%', valuation: 'Undervalued', techAnalysis: 'Buy', seasonality: 'Positive', analysisPriceTarget: '$145.00', upsidePotential: '+12.9%' },
      { symbol: 'KMI', company: 'Kinder Morgan Inc.', price: 18.85, change: 0.25, changePercent: 1.34, volume: 14200000, marketCap: 42000000000, pe: 17.2, eps: 1.10, dividend: 1.12, stockScore: 67, quarterRevenueEarning: '$3.2B', annualRevenueEarning: '$12.4B', growth: '+3.8%', valuation: 'Fair', techAnalysis: 'Hold', seasonality: 'Neutral', analysisPriceTarget: '$21.00', upsidePotential: '+11.4%' },
      { symbol: 'OKE', company: 'ONEOK Inc.', price: 88.45, change: 1.25, changePercent: 1.43, volume: 2850000, marketCap: 42000000000, pe: 9.8, eps: 9.02, dividend: 3.76, stockScore: 75, quarterRevenueEarning: '$5.9B', annualRevenueEarning: '$18.7B', growth: '+12.4%', valuation: 'Undervalued', techAnalysis: 'Buy', seasonality: 'Positive', analysisPriceTarget: '$98.00', upsidePotential: '+10.8%' },
      { symbol: 'WMB', company: 'Williams Companies Inc.', price: 42.85, change: 0.65, changePercent: 1.54, volume: 8950000, marketCap: 52000000000, pe: 28.5, eps: 1.50, dividend: 1.80, stockScore: 71, quarterRevenueEarning: '$2.3B', annualRevenueEarning: '$9.1B', growth: '+15.2%', valuation: 'Fair', techAnalysis: 'Buy', seasonality: 'Positive', analysisPriceTarget: '$48.00', upsidePotential: '+12.0%' },
      { symbol: 'PXD', company: 'Pioneer Natural Resources Company', price: 258.45, change: 4.85, changePercent: 1.91, volume: 1850000, marketCap: 52000000000, pe: 12.1, eps: 21.36, dividend: 8.00, stockScore: 77, quarterRevenueEarning: '$4.1B', annualRevenueEarning: '$17.8B', growth: '+22.1%', valuation: 'Fair', techAnalysis: 'Buy', seasonality: 'Strong', analysisPriceTarget: '$285.00', upsidePotential: '+10.3%' },
      
      // Industrial & Others (96-100)
      { symbol: 'BA', company: 'Boeing Company', price: 205.85, change: 3.45, changePercent: 1.70, volume: 8950000, marketCap: 125000000000, pe: 25.8, eps: 7.98, dividend: 0.0, stockScore: 65, quarterRevenueEarning: '$17.8B', annualRevenueEarning: '$77.8B', growth: '+11.5%', valuation: 'Fair', techAnalysis: 'Hold', seasonality: 'Neutral', analysisPriceTarget: '$230.00', upsidePotential: '+11.7%' },
      { symbol: 'CAT', company: 'Caterpillar Inc.', price: 348.25, change: 5.85, changePercent: 1.71, volume: 2850000, marketCap: 185000000000, pe: 15.2, eps: 22.91, dividend: 5.00, stockScore: 78, quarterRevenueEarning: '$16.7B', annualRevenueEarning: '$67.1B', growth: '+1.5%', valuation: 'Fair', techAnalysis: 'Buy', seasonality: 'Positive', analysisPriceTarget: '$375.00', upsidePotential: '+7.7%' },
      { symbol: 'GE', company: 'General Electric Company', price: 168.25, change: 2.85, changePercent: 1.72, volume: 5250000, marketCap: 185000000000, pe: 20.5, eps: 8.21, dividend: 1.60, stockScore: 73, quarterRevenueEarning: '$19.8B', annualRevenueEarning: '$74.2B', growth: '+9.8%', valuation: 'Fair', techAnalysis: 'Buy', seasonality: 'Positive', analysisPriceTarget: '$185.00', upsidePotential: '+10.0%' },
      { symbol: 'MMM', company: '3M Company', price: 125.45, change: 1.85, changePercent: 1.50, volume: 4250000, marketCap: 70000000000, pe: 18.2, eps: 6.89, dividend: 6.00, stockScore: 69, quarterRevenueEarning: '$8.3B', annualRevenueEarning: '$35.4B', growth: '-0.8%', valuation: 'Undervalued', techAnalysis: 'Hold', seasonality: 'Neutral', analysisPriceTarget: '$138.00', upsidePotential: '+10.0%' },
      { symbol: 'HON', company: 'Honeywell International Inc.', price: 218.45, change: 3.25, changePercent: 1.51, volume: 2150000, marketCap: 145000000000, pe: 24.8, eps: 8.81, dividend: 4.04, stockScore: 79, quarterRevenueEarning: '$9.1B', annualRevenueEarning: '$37.7B', growth: '+3.1%', valuation: 'Fair', techAnalysis: 'Buy', seasonality: 'Positive', analysisPriceTarget: '$240.00', upsidePotential: '+9.9%' }
    ];

    return mockStocks.map((stock, index) => ({
      ...stock,
      week52High: Number((stock.price * (1.15 + Math.random() * 0.35)).toFixed(2)), // 15-50% above current
      week52Low: Number((stock.price * (0.60 + Math.random() * 0.25)).toFixed(2)), // 25-40% below current
      avgVolume: Math.round(stock.volume * (0.8 + Math.random() * 0.4)), // ±20% variation
      beta: Number((0.5 + Math.random() * 1.5).toFixed(2)), // Beta between 0.5-2.0
      timestamp: new Date().toISOString().split('T')[0]
    }));
  }
}

export const alphaVantageAPI = new AlphaVantageAPI();
export default AlphaVantageAPI; 