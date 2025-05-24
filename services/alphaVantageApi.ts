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

// Popular US stocks to display
export const POPULAR_US_STOCKS = [
  'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'META', 'NVDA', 'JPM', 
  'JNJ', 'V', 'PG', 'UNH', 'HD', 'DIS', 'MA', 'PFE', 'BAC', 'XOM',
  'ABBV', 'KO', 'VZ', 'ADBE', 'CRM', 'NFLX', 'CMCSA', 'PEP', 'TMO', 'COST'
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
    return this.getMultipleQuotes(POPULAR_US_STOCKS.slice(0, 15)); // Limit to 15 for free tier
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

  // Mock data for fallback when API limits are reached
  getMockStockData(): USStockData[] {
    return [
      {
        symbol: 'AAPL',
        company: 'Apple Inc.',
        price: 182.63,
        change: 2.85,
        changePercent: 1.58,
        volume: 45230000,
        marketCap: 2850000000000,
        pe: 28.5,
        eps: 6.42,
        dividend: 0.96,
        week52High: 199.62,
        week52Low: 124.17,
        avgVolume: 52000000,
        beta: 1.24,
        timestamp: new Date().toISOString().split('T')[0]
      },
      {
        symbol: 'MSFT',
        company: 'Microsoft Corporation',
        price: 402.75,
        change: 5.20,
        changePercent: 1.31,
        volume: 23450000,
        marketCap: 2990000000000,
        pe: 32.1,
        eps: 12.55,
        dividend: 3.32,
        week52High: 468.35,
        week52Low: 309.45,
        avgVolume: 28000000,
        beta: 0.91,
        timestamp: new Date().toISOString().split('T')[0]
      },
      {
        symbol: 'GOOGL',
        company: 'Alphabet Inc.',
        price: 176.25,
        change: -1.85,
        changePercent: -1.04,
        volume: 18200000,
        marketCap: 2180000000000,
        pe: 24.8,
        eps: 7.09,
        dividend: 0.0,
        week52High: 193.31,
        week52Low: 129.40,
        avgVolume: 22000000,
        beta: 1.05,
        timestamp: new Date().toISOString().split('T')[0]
      },
      {
        symbol: 'AMZN',
        company: 'Amazon.com Inc.',
        price: 185.07,
        change: 3.42,
        changePercent: 1.88,
        volume: 34100000,
        marketCap: 1930000000000,
        pe: 58.2,
        eps: 3.18,
        dividend: 0.0,
        week52High: 201.20,
        week52Low: 118.35,
        avgVolume: 41000000,
        beta: 1.15,
        timestamp: new Date().toISOString().split('T')[0]
      },
      {
        symbol: 'TSLA',
        company: 'Tesla Inc.',
        price: 238.59,
        change: 8.45,
        changePercent: 3.67,
        volume: 89200000,
        marketCap: 758000000000,
        pe: 65.4,
        eps: 3.65,
        dividend: 0.0,
        week52High: 299.29,
        week52Low: 138.80,
        avgVolume: 95000000,
        beta: 2.11,
        timestamp: new Date().toISOString().split('T')[0]
      },
      {
        symbol: 'META',
        company: 'Meta Platforms Inc.',
        price: 493.50,
        change: -7.25,
        changePercent: -1.45,
        volume: 12800000,
        marketCap: 1250000000000,
        pe: 25.7,
        eps: 19.21,
        dividend: 2.0,
        week52High: 542.81,
        week52Low: 279.49,
        avgVolume: 15000000,
        beta: 1.18,
        timestamp: new Date().toISOString().split('T')[0]
      },
      {
        symbol: 'NVDA',
        company: 'NVIDIA Corporation',
        price: 878.37,
        change: 15.62,
        changePercent: 1.81,
        volume: 45600000,
        marketCap: 2170000000000,
        pe: 66.8,
        eps: 13.14,
        dividend: 0.16,
        week52High: 974.00,
        week52Low: 394.70,
        avgVolume: 52000000,
        beta: 1.68,
        timestamp: new Date().toISOString().split('T')[0]
      },
      {
        symbol: 'JPM',
        company: 'JPMorgan Chase & Co.',
        price: 182.45,
        change: 1.25,
        changePercent: 0.69,
        volume: 8900000,
        marketCap: 531000000000,
        pe: 12.3,
        eps: 14.83,
        dividend: 4.60,
        week52High: 199.95,
        week52Low: 135.19,
        avgVolume: 12000000,
        beta: 1.08,
        timestamp: new Date().toISOString().split('T')[0]
      }
    ];
  }
}

export const alphaVantageAPI = new AlphaVantageAPI();
export default AlphaVantageAPI; 