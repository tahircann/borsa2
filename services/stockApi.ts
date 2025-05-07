// You need to sign up for a free API key at https://www.alphavantage.co/support/#api-key
// In a real application, store this in environment variables
const API_KEY = 'DCMJ0CPXN5JNMB6P'; // API key created for this project

export interface StockInfo {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  open: number;
  high: number;
  low: number;
  volume: number;
  stockScore?: number;
  nextQuarterEarning?: string;
  annualEarningGrowth?: string;
}

export interface HistoricalDataPoint {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface HistoricalStockData {
  symbol: string;
  interval: 'daily' | 'weekly' | 'monthly';
  data: HistoricalDataPoint[];
}

// Function to log important stock data for debugging
const logStockData = (stock: any, label: string) => {
  const importantData = {
    symbol: stock.symbol || stock.Symbol,
    nextQuarterEarning: stock.nextQuarterEarning || stock.NextQuarterEPS,
    annualEarningGrowth: stock.annualEarningGrowth || stock.AnnualEarningGrowth,
    // Include raw data for debugging
    rawEarningData: stock.QuarterlyEarnings?.[0] || null,
    rawAnnualData: stock.AnnualReports?.[0] || null
  };
  
  console.log(`==== ${label} ====`);
  console.log(JSON.stringify(importantData, null, 2));
};

// Calculate a stock score based on various metrics
const calculateStockScore = (data: any): number => {
  try {
    // Default score - if we can't calculate it from metrics
    if (!data || Object.keys(data).length === 0) return 50;
    
    // Start with base score
    let score = 50;
    
    // PE Ratio impact (lower is generally better)
    const pe = parseFloat(data.PERatio);
    if (!isNaN(pe) && pe > 0) {
      if (pe < 15) score += 10;
      else if (pe > 30) score -= 10;
    }
    
    // PEG Ratio impact (lower is better)
    const peg = parseFloat(data.PEGRatio);
    if (!isNaN(peg) && peg > 0) {
      if (peg < 1) score += 15;
      else if (peg > 2) score -= 10;
    }
    
    // Profit Margin impact (higher is better)
    const profitMargin = parseFloat(data.ProfitMargin);
    if (!isNaN(profitMargin)) {
      if (profitMargin > 0.2) score += 15; // Over 20% profit margin
      else if (profitMargin > 0.1) score += 10; // Over 10% profit margin
      else if (profitMargin < 0) score -= 15; // Negative profit margin
    }
    
    // ROE impact (higher is better)
    const roe = parseFloat(data.ReturnOnEquityTTM);
    if (!isNaN(roe)) {
      if (roe > 0.2) score += 10; // Over 20% ROE
      else if (roe < 0) score -= 10; // Negative ROE
    }
    
    // Cap the score between 0 and 100
    return Math.max(0, Math.min(100, score));
  } catch (error) {
    console.error('Error calculating stock score:', error);
    return 50; // Default score on error
  }
};

// Generate mock fundamentals data when the API fails
const getMockFundamentals = (symbol: string): any => {
  // Generate realistic looking EPS value (between $0.10 and $5.00)
  const nextQtrEps = (Math.random() * 4.9 + 0.1).toFixed(2);
  
  // Generate realistic looking growth rate (-15% to +35%)
  const growthValue = (Math.random() * 50 - 15).toFixed(2);
  
  // Random values for demonstration
  const peRatio = (Math.random() * 30 + 5).toFixed(2);
  const pegRatio = (Math.random() * 3 + 0.5).toFixed(2);
  const profitMargin = (Math.random() * 0.3).toFixed(2);
  const roe = (Math.random() * 0.25).toFixed(2);
  const revenueGrowth = ((Math.random() * 0.4 - 0.1) * 100).toFixed(2);
  
  // Map common symbols to expected EPS values
  const epsEstimates: {[key: string]: number} = {
    'AAPL': 1.95,
    'MSFT': 2.65,
    'GOOGL': 1.85,
    'AMZN': 0.85,
    'META': 4.25,
    'TSLA': 0.95,
    'NVDA': 4.75
  };
  
  // Map common symbols to expected growth rates
  const growthRates: {[key: string]: number} = {
    'AAPL': 8.5,
    'MSFT': 12.7,
    'GOOGL': 15.2,
    'AMZN': 19.8,
    'META': 7.5,
    'TSLA': 22.4,
    'NVDA': 32.8
  };
  
  // Use predefined values for common stocks or random values for others
  const estimatedEps = epsEstimates[symbol.toUpperCase()] || parseFloat(nextQtrEps);
  const growthRate = growthRates[symbol.toUpperCase()] || parseFloat(growthValue);
  
  const mockData = {
    Symbol: symbol,
    Name: symbol,
    PERatio: peRatio,
    PEGRatio: pegRatio,
    ProfitMargin: profitMargin,
    ReturnOnEquityTTM: roe,
    RevenueGrowthYOY: revenueGrowth,
    EPS: (Math.random() * 5 + 0.5).toFixed(2),
    NextQuarterEPS: estimatedEps.toFixed(2),
    AnnualEarningGrowth: growthRate.toFixed(2)
  };
  
  // Log the mock data to console for debugging
  console.log("Generated Mock Fundamentals:", JSON.stringify({
    symbol,
    nextQuarterEPS: mockData.NextQuarterEPS,
    annualEarningGrowth: mockData.AnnualEarningGrowth
  }, null, 2));
  
  return mockData;
};

// Get additional earnings data for better estimates
const getEarningsData = async (symbol: string) => {
  try {
    const response = await fetch(
      `https://www.alphavantage.co/query?function=EARNINGS&symbol=${symbol}&apikey=${API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error(`Earnings API Error: ${response.status}`);
    }
    
    const data = await response.json();
    console.log("EARNINGS DATA:", JSON.stringify(data, null, 2));
    
    return data;
  } catch (error) {
    console.error('Error fetching earnings data:', error);
    return null;
  }
};

// Get complete stock information including fundamentals
export const getStockQuote = async (symbol: string): Promise<StockInfo> => {
  try {
    console.log(`Fetching stock data for ${symbol}...`);
    
    // Try to get earnings data for better estimates
    const earningsData = await getEarningsData(symbol);
    
    // First, try to get the company overview (fundamentals)
    const overviewResponse = await fetch(
      `https://www.alphavantage.co/query?function=OVERVIEW&symbol=${symbol}&apikey=${API_KEY}`
    );
    
    if (!overviewResponse.ok) {
      console.error(`Overview API response not OK: ${overviewResponse.status}`);
      throw new Error(`API Error: ${overviewResponse.status}`);
    }
    
    const overviewData = await overviewResponse.json();
    console.log('Overview data:', JSON.stringify(overviewData, null, 2));
    
    // Check if we received valid data
    const usingMockFundamentals = overviewData.Note || Object.keys(overviewData).length === 0;
    
    // Combine overview data with earnings data
    let fundamentals = usingMockFundamentals ? getMockFundamentals(symbol) : {
      ...overviewData,
      ...(earningsData || {})
    };
    
    // Calculate stock score
    const stockScore = calculateStockScore(fundamentals);
    
    // Get next quarter EPS (using mock/estimated data)
    let nextQuarterValue;
    
    if (earningsData && earningsData.quarterlyEarnings && earningsData.quarterlyEarnings.length > 0) {
      // Use most recent quarterly EPS and adjust it by estimated growth
      const recentEPS = parseFloat(earningsData.quarterlyEarnings[0].reportedEPS);
      const estimatedGrowth = 0.05; // Assume 5% quarter-over-quarter growth
      nextQuarterValue = (recentEPS * (1 + estimatedGrowth)).toFixed(2);
    } else {
      // Use mock or overview data
      nextQuarterValue = fundamentals.NextQuarterEPS || fundamentals.QuarterlyEarnings?.[0]?.reportedEPS || '0.00';
    }
    
    const nextQuarterEarning = `$${parseFloat(nextQuarterValue).toFixed(2)}`;
    
    // Get annual earning growth rate (ensure it has a sign)
    let growthValue;
    
    if (earningsData && earningsData.annualEarnings && earningsData.annualEarnings.length >= 2) {
      // Calculate annual growth based on last two years
      const currentEPS = parseFloat(earningsData.annualEarnings[0].reportedEPS);
      const previousEPS = parseFloat(earningsData.annualEarnings[1].reportedEPS);
      
      if (previousEPS !== 0) {
        growthValue = ((currentEPS - previousEPS) / previousEPS) * 100;
      } else {
        growthValue = parseFloat(fundamentals.AnnualEarningGrowth || '0');
      }
    } else {
      growthValue = parseFloat(fundamentals.AnnualEarningGrowth || '0');
    }
    
    const annualEarningGrowth = `${growthValue >= 0 ? '+' : ''}${growthValue.toFixed(2)}%`;
    
    // Then get the quote data
    const quoteResponse = await fetch(
      `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${API_KEY}`
    );
    
    if (!quoteResponse.ok) {
      console.error(`Quote API response not OK: ${quoteResponse.status}`);
      throw new Error(`API Error: ${quoteResponse.status}`);
    }
    
    const quoteData = await quoteResponse.json();
    console.log('Quote data:', JSON.stringify(quoteData, null, 2));
    
    // Check if we got rate limited or empty data
    if (quoteData.Note || !quoteData['Global Quote'] || Object.keys(quoteData['Global Quote']).length === 0) {
      console.warn('API rate limit reached or invalid response, using mock data');
      const mockStockData = getMockStockData(symbol);
      
      const result = {
        ...mockStockData,
        stockScore,
        nextQuarterEarning,
        annualEarningGrowth
      };
      
      // Log the final result for debugging
      logStockData(result, "Final Stock Data (Mock Quote)");
      
      return result;
    }
    
    const quote = quoteData['Global Quote'];
    const price = parseFloat(quote['05. price']) || 0;
    const previousClose = parseFloat(quote['08. previous close']) || 0;
    const change = parseFloat(quote['09. change']) || 0;
    const changePercent = parseFloat(quote['10. change percent']?.replace('%', '')) || 0;
    
    const result = {
      symbol,
      name: fundamentals.Name || symbol,
      price,
      change,
      changePercent,
      open: parseFloat(quote['02. open']) || 0,
      high: parseFloat(quote['03. high']) || 0,
      low: parseFloat(quote['04. low']) || 0,
      volume: parseInt(quote['06. volume']) || 0,
      stockScore,
      nextQuarterEarning,
      annualEarningGrowth
    };
    
    // Log the final result for debugging
    logStockData(result, "Final Stock Data (API Success)");
    
    return result;
  } catch (error) {
    console.error('Error fetching stock data:', error);
    console.log('Falling back to mock data');
    const mockData = getMockStockData(symbol);
    const mockFundamentals = getMockFundamentals(symbol);
    
    // Format the mock data correctly
    const nextQtrEps = parseFloat(mockFundamentals.NextQuarterEPS).toFixed(2);
    const growthValue = parseFloat(mockFundamentals.AnnualEarningGrowth);
    
    const result = {
      ...mockData,
      stockScore: calculateStockScore(mockFundamentals),
      nextQuarterEarning: `$${nextQtrEps}`,
      annualEarningGrowth: `${growthValue >= 0 ? '+' : ''}${growthValue.toFixed(2)}%`
    };
    
    // Log the final result for debugging
    logStockData(result, "Final Stock Data (Error Fallback)");
    
    return result;
  }
};

// Mock data to use as fallback when API fails
const getMockStockData = (symbol: string): StockInfo => {
  // Generate some random but realistic looking data
  const basePrice = Math.floor(Math.random() * 1000) + 50;
  const change = Math.floor(Math.random() * 20) - 10;
  const changePercent = (change / basePrice) * 100;
  const open = basePrice - Math.floor(Math.random() * 10);
  const high = basePrice + Math.floor(Math.random() * 15);
  const low = basePrice - Math.floor(Math.random() * 15);
  const volume = Math.floor(Math.random() * 10000000) + 1000000;

  // Map common symbols to company names
  const companyNames: {[key: string]: string} = {
    'AAPL': 'Apple Inc.',
    'MSFT': 'Microsoft Corporation',
    'GOOGL': 'Alphabet Inc.',
    'AMZN': 'Amazon.com Inc.',
    'META': 'Meta Platforms Inc.',
    'TSLA': 'Tesla Inc.',
    'NVDA': 'NVIDIA Corporation',
    'NFLX': 'Netflix Inc.',
    'PYPL': 'PayPal Holdings Inc.',
    'INTC': 'Intel Corporation',
    'AMD': 'Advanced Micro Devices Inc.',
    'CSCO': 'Cisco Systems Inc.',
    'ORCL': 'Oracle Corporation',
    'IBM': 'International Business Machines Corporation',
    'UBER': 'Uber Technologies Inc.',
    'DIS': 'The Walt Disney Company',
    'NKLA': 'Nikola Corporation',
    'GME': 'GameStop Corporation',
    'AMC': 'AMC Entertainment Holdings Inc.',
    'GS': 'Goldman Sachs Group Inc.'
  };

  return {
    symbol: symbol.toUpperCase(),
    name: companyNames[symbol.toUpperCase()] || `${symbol.toUpperCase()} Corporation`,
    price: basePrice,
    change,
    changePercent,
    open,
    high,
    low,
    volume
  };
};

// Get multiple stocks
export const getMultipleStocks = async (symbols: string[]): Promise<StockInfo[]> => {
  const promises = symbols.map(symbol => getStockQuote(symbol));
  return Promise.all(promises);
};

// Get historical stock data for charts
export const getHistoricalData = async (
  symbol: string, 
  interval: 'daily' | 'weekly' | 'monthly' = 'daily'
): Promise<HistoricalStockData> => {
  try {
    console.log(`Fetching historical data for ${symbol} with interval ${interval}...`);
    
    // Map intervals to API function parameters
    const functionParam = {
      'daily': 'TIME_SERIES_DAILY',
      'weekly': 'TIME_SERIES_WEEKLY',
      'monthly': 'TIME_SERIES_MONTHLY'
    }[interval];
    
    // Map intervals to response key
    const responseKey = {
      'daily': 'Time Series (Daily)',
      'weekly': 'Weekly Time Series',
      'monthly': 'Monthly Time Series'
    }[interval];
    
    // Make API request
    const response = await fetch(
      `https://www.alphavantage.co/query?function=${functionParam}&symbol=${symbol}&apikey=${API_KEY}`
    );
    
    if (!response.ok) {
      console.error(`Historical data API response not OK: ${response.status}`);
      throw new Error(`API Error: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Historical data response:', Object.keys(data));
    
    // Check if we got rate limited or empty data
    if (data.Note || !data[responseKey] || Object.keys(data[responseKey]).length === 0) {
      console.warn('API rate limit reached or invalid response, using mock historical data');
      return getMockHistoricalData(symbol, interval);
    }
    
    // Process the historical data
    const timeSeries = data[responseKey];
    const dates = Object.keys(timeSeries).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
    
    // Get a reasonable number of data points based on interval
    const dataPoints = interval === 'daily' ? 30 : (interval === 'weekly' ? 26 : 12);
    const limitedDates = dates.slice(0, dataPoints);
    
    // Map the data to our format
    const processedData: HistoricalDataPoint[] = limitedDates.map(date => {
      const entry = timeSeries[date];
      return {
        date,
        open: parseFloat(entry['1. open']),
        high: parseFloat(entry['2. high']),
        low: parseFloat(entry['3. low']),
        close: parseFloat(entry['4. close']),
        volume: parseInt(entry['5. volume'])
      };
    });
    
    return {
      symbol,
      interval,
      data: processedData
    };
  } catch (error) {
    console.error('Error fetching historical data:', error);
    console.log('Falling back to mock historical data');
    return getMockHistoricalData(symbol, interval);
  }
};

// Generate mock historical data when API fails
const getMockHistoricalData = (
  symbol: string, 
  interval: 'daily' | 'weekly' | 'monthly'
): HistoricalStockData => {
  // Get number of data points based on interval
  const dataPoints = interval === 'daily' ? 30 : (interval === 'weekly' ? 26 : 12);
  
  // Start with a plausible price for the stock
  let basePrice = 100;
  if (symbol === 'AAPL') basePrice = 180;
  else if (symbol === 'MSFT') basePrice = 330;
  else if (symbol === 'GOOGL') basePrice = 135;
  else if (symbol === 'AMZN') basePrice = 145;
  else if (symbol === 'META') basePrice = 310;
  else if (symbol === 'TSLA') basePrice = 230;
  
  // Generate mock data points
  const mockData: HistoricalDataPoint[] = [];
  let currentPrice = basePrice;
  
  for (let i = 0; i < dataPoints; i++) {
    // Create a date string based on interval
    const date = new Date();
    if (interval === 'daily') {
      date.setDate(date.getDate() - i);
    } else if (interval === 'weekly') {
      date.setDate(date.getDate() - i * 7);
    } else {
      date.setMonth(date.getMonth() - i);
    }
    
    // Generate a price movement between -3% and +3%
    const dailyChange = (Math.random() * 0.06) - 0.03;
    currentPrice = currentPrice * (1 + dailyChange);
    
    // Create a random intraday range
    const open = currentPrice * (1 + (Math.random() * 0.02 - 0.01));
    const close = currentPrice;
    const high = Math.max(open, close) * (1 + Math.random() * 0.01);
    const low = Math.min(open, close) * (1 - Math.random() * 0.01);
    
    // Random volume between 1M and 10M
    const volume = Math.floor(Math.random() * 9000000) + 1000000;
    
    mockData.push({
      date: date.toISOString().split('T')[0],
      open,
      high,
      low,
      close,
      volume
    });
  }
  
  // Sort data by date in ascending order
  mockData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  return {
    symbol,
    interval,
    data: mockData
  };
}; 