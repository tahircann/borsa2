import axios from 'axios';
import https from 'https';
import { alphaVantageAPI } from './alphaVantageApi';

// Global tipini genişlet
declare global {
  interface Window {
    IB_CONFIG?: {
      ACCOUNT_ID: string;
      API_BASE_URL: string;
    };
  }
}

// Proxy üzerinden API istekleri yapılacak, tarayıcı güvenlik sorunlarını aşmak için
const API_PROXY_URL = '/api/proxy';
const USE_MOCK_DATA = false; // Gerçek veriyi zorlayalım

// Sabit hesap ID'si kullan (window.IB_CONFIG'den alınabilir veya doğrudan tanımlanabilir)
const IB_ACCOUNT_ID = typeof window !== 'undefined' && window.IB_CONFIG?.ACCOUNT_ID 
  ? window.IB_CONFIG.ACCOUNT_ID 
  : 'U7960949'; // Sabit olarak U7960949 hesabını kullan

console.log('=== API Konfigürasyonu ===');
console.log('API_PROXY_URL:', API_PROXY_URL);
console.log('USE_MOCK_DATA:', USE_MOCK_DATA);
console.log('IB_ACCOUNT_ID:', IB_ACCOUNT_ID);

// Proxy client'ını oluştur
const apiClient = axios.create({
  baseURL: API_PROXY_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 20000, // Increased from 15000 to 20000 (20 seconds)
});

// İstek interceptor
apiClient.interceptors.request.use(
  (config) => {
    // URL'yi proxy formatına dönüştür
    if (config.url && !config.url.startsWith('/')) {
      // IB Gateway API'si için
      if (config.url.includes('/portfolio/') || 
          config.url.includes('/iserver/') || 
          config.url.includes('/trsrv/')) {
        // URL parametrelerini ayarla
        config.params = {
          ...config.params,
          target: 'ibgateway',
          path: config.url
        };
        config.url = ''; // Ana proxy rotasına yönlendir
      } else {
        // Flask API'si için
        config.params = {
          ...config.params,
          target: 'flask',
          path: config.url
        };
        config.url = ''; // Ana proxy rotasına yönlendir
      }
    }
    console.log(`API isteği: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`, config.params);
    return config;
  },
  (error) => {
    console.error('API İstek hatası:', error);
    return Promise.reject(error);
  }
);

// Yanıt interceptor
apiClient.interceptors.response.use(
  (response) => {
    console.log(`${response.config.url} yanıtı:`, response.status);
    return response;
  },
  (error) => {
    console.error('API Yanıt hatası:', error.message);
    if (error.response) {
      console.error('Hata durumu:', error.response.status);
      console.error('Hata verisi:', error.response.data);
    } else if (error.request) {
      console.error('Yanıt alınamadı');
    }
    return Promise.reject(error);
  }
);

export type Portfolio = {
  totalValue: number;
  cash: number;
  positions: Position[];
};

export type Position = {
  symbol: string;
  name: string;
  quantity: number;
  averageCost: number;
  marketValue: number;
  unrealizedPnL: number;
  percentChange: number;
  dividendYield?: number;
  purchaseDate?: string;
  salePercentage?: number;
  country?: string;
};

export type Trade = {
  id: string;
  orderId: string;
  ticker: string;
  description: string;
  company: string;
  orderDescription: string;
  orderType: string;
  status: string;
  canCancel: boolean;
  acct?: string;
  conidex?: string;
  conid?: number;
  account?: string;
  cashCcy?: string;
  sizeAndFills?: string;
  description1?: string;
  secType?: string;
  listingExchange?: string;
  remainingQuantity?: number;
  filledQuantity?: number;
  totalSize?: number;
  companyName?: string;
  order_ccp_status?: string;
  avgPrice?: string;
  origOrderType?: string;
  supportsTaxOpt?: string;
  lastExecutionTime?: string;
  bgColor?: string;
  fgColor?: string;
  order_ref?: string;
  timeInForce?: string;
  lastExecutionTime_r?: number;
  side?: string;
};

export type Dividend = {
  id: string;
  symbol: string;
  name: string;
  exDate: string;
  paymentDate: string;
  amount: number;
  shares: number;
  total: number;
};

// Define allocation data types
export type AllocationData = {
  assetClass: AllocationItem[];
  sector: AllocationItem[];
  industry: AllocationItem[];
};

export type AllocationItem = {
  name: string;
  value: number;
  color?: string;
};

// API bağlantı kontrolü
const checkApiConnection = async (): Promise<boolean> => {
  if (USE_MOCK_DATA) {
    console.log('Mock veri kullanılıyor');
    return false;
  }
  
  console.log('API bağlantısı kontrol ediliyor...');
  
  try {
    // IB Gateway üzerinden kontrol - doğrudan belirtilen hesabı kullan
    const summaryResponse = await apiClient.get('', {
      params: {
        target: 'ibgateway',
        path: `portfolio/${IB_ACCOUNT_ID}/summary`
      },
      validateStatus: () => true,
    });
    
    console.log('Hesap özeti kontrolü:', summaryResponse.status);
    
    if (summaryResponse.status === 200) {
      return true;
    }
    
    // Flask backend'i kontrol et
    try {
      const flaskResponse = await apiClient.get('', { 
        params: {
          target: 'flask',
          path: ''
        },
        validateStatus: () => true,
      });
      console.log('Flask backend kontrolü:', flaskResponse.status);
      return flaskResponse.status === 200;
    } catch (flaskError: any) {
      console.error('Flask backend erişilemez:', flaskError.message);
    }
    
    return false;
  } catch (error: any) {
    console.error('Interactive Brokers API erişilemez:', error.message);
    return false;
  }
};

// Mock portfolio data
const mockPortfolio: Portfolio = {
  totalValue: 145642.85,
  cash: 15200.42,
  positions: [
    {
      symbol: 'AAPL',
      name: 'Apple Inc.',
      quantity: 50,
      averageCost: 165.48,
      marketValue: 9216.00,
      unrealizedPnL: 942.00,
      percentChange: 11.38,
      dividendYield: 0.0044, // 0.44%
      purchaseDate: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(), // 18 hours ago - NEW BUY
      salePercentage: 0,
      country: 'United States',
    },
    {
      symbol: 'MSFT',
      name: 'Microsoft Corp.',
      quantity: 25,
      averageCost: 305.22,
      marketValue: 8455.25,
      unrealizedPnL: 824.75,
      percentChange: 10.82,
      dividendYield: 0.0072, // 0.72%
      purchaseDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(), // 45 days ago
      salePercentage: 20,
      country: 'United States',
    },
    {
      symbol: 'NVDA',
      name: 'NVIDIA Corp.',
      quantity: 15,
      averageCost: 720.50,
      marketValue: 12450.75,
      unrealizedPnL: 1642.25,
      percentChange: 15.18,
      dividendYield: 0.0002, // 0.02%
      purchaseDate: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago - NEW BUY
      salePercentage: 0,
      country: 'United States',
    },
    {
      symbol: 'JPM',
      name: 'JPMorgan Chase & Co.',
      quantity: 40,
      averageCost: 145.80,
      marketValue: 7296.00,
      unrealizedPnL: 464.00,
      percentChange: 6.81,
      dividendYield: 0.0252, // 2.52%
      purchaseDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 days ago
      salePercentage: 0,
      country: 'United States',
    },
    {
      symbol: 'JNJ',
      name: 'Johnson & Johnson',
      quantity: 30,
      averageCost: 158.42,
      marketValue: 4935.60,
      unrealizedPnL: 183.00,
      percentChange: 3.85,
      dividendYield: 0.0287, // 2.87%
      purchaseDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
      salePercentage: 10,
      country: 'United States',
    },
    {
      symbol: 'GOOGL',
      name: 'Alphabet Inc.',
      quantity: 20,
      averageCost: 132.18,
      marketValue: 2843.00,
      unrealizedPnL: 199.40,
      percentChange: 7.54,
      dividendYield: 0.0000, // No dividend
      purchaseDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 days ago
      salePercentage: 0,
      country: 'United States',
    },
    {
      symbol: 'TSLA',
      name: 'Tesla Inc.',
      quantity: 30,
      averageCost: 195.40,
      marketValue: 5304.90,
      unrealizedPnL: -564.10,
      percentChange: -9.61,
      dividendYield: 0.0000, // No dividend
      purchaseDate: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago - NEW BUY
      salePercentage: 0,
      country: 'United States',
    },
    {
      symbol: 'KO',
      name: 'The Coca-Cola Company',
      quantity: 100,
      averageCost: 59.25,
      marketValue: 6180.00,
      unrealizedPnL: 255.00,
      percentChange: 4.30,
      dividendYield: 0.0301, // 3.01%
      purchaseDate: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(), // 120 days ago
      salePercentage: 5,
      country: 'United States',
    }
  ],
};

// Portföy verisi alma
export const getPortfolio = async (): Promise<Portfolio> => {
  try {
    const isApiConnected = await checkApiConnection();
    
    if (isApiConnected) {
      console.log('API bağlı, gerçek portföy verisi alınıyor...');
      console.log('Kullanılan hesap ID:', IB_ACCOUNT_ID);
      
      // Bu hesabın özetini ve pozisyonlarını al
      const summaryResponse = await apiClient.get('', {
        params: {
          target: 'ibgateway',
          path: `portfolio/${IB_ACCOUNT_ID}/summary`
        },
        validateStatus: () => true,
      });
      
      const positionsResponse = await apiClient.get('', {
        params: {
          target: 'ibgateway',
          path: `portfolio/${IB_ACCOUNT_ID}/positions/0`
        },
        validateStatus: () => true,
      });

      // Get trades data for purchase dates and sale information
      const tradesResponse = await apiClient.get('', {
        params: {
          target: 'ibgateway',
          path: 'iserver/account/orders'
        },
        validateStatus: () => true,
      });
      
      if (summaryResponse.status === 200 && positionsResponse.status === 200) {
        const summary = summaryResponse.data;
        const positions = positionsResponse.data || [];
        const trades = tradesResponse.status === 200 ? tradesResponse.data?.orders || [] : [];
        
        console.log('Alınan pozisyon verisi:', JSON.stringify(positions, null, 2));
        console.log('Alınan işlem verisi:', trades.length, 'trades');
        
        // Extract symbols for Alpha Vantage API calls
        const symbols = positions.map((pos: any) => pos.contractDesc || pos.symbol).filter(Boolean);
        
        // Get dividend and country data from Alpha Vantage
        let stockMetadata = new Map();
        try {
          console.log('Alpha Vantage API\'den temettü ve ülke bilgileri alınıyor...');
          stockMetadata = await alphaVantageAPI.getStockMetadata(symbols);
          console.log('Alpha Vantage metaveri alındı:', stockMetadata.size, 'hisse için');
        } catch (error) {
          console.error('Alpha Vantage API hatası:', error);
        }

        // Process trades to get purchase dates and sale information
        const tradesBySymbol = new Map();
        trades.forEach((trade: any) => {
          const symbol = trade.ticker || trade.description1 || trade.contractDesc;
          if (symbol) {
            if (!tradesBySymbol.has(symbol)) {
              tradesBySymbol.set(symbol, []);
            }
            tradesBySymbol.get(symbol).push({
              date: trade.lastExecutionTime || trade.submittedAt || new Date().toISOString(),
              action: trade.side || 'BUY',
              quantity: trade.totalSize || trade.filledQuantity || 0,
              status: trade.status || 'Unknown'
            });
          }
        });

        // Nakit değerini bul (IB API'de tutarsız biçimler var)
        let cashValue = 0;
        if (summary.totalcashvalue && summary.totalcashvalue.amount) {
          cashValue = Number(summary.totalcashvalue.amount);
        } else if (summary.settledcash && summary.settledcash.amount) {
          cashValue = Number(summary.settledcash.amount);
        }
        
        // Portföy objesi oluştur
        const portfolio: Portfolio = {
          totalValue: 0, // Pozisyonlar + nakit üzerinden hesaplanacak
          cash: cashValue,
          positions: Array.isArray(positions) ? positions.map((pos: any) => {
            const symbol = pos.contractDesc || pos.symbol || 'Unknown';
            
            // Get metadata from Alpha Vantage
            const metadata = stockMetadata.get(symbol) || { dividendYield: null, country: null };
            
            // Get trade information for this symbol
            const symbolTrades = tradesBySymbol.get(symbol) || [];
            
            // Find most recent purchase date
            const buyTrades = symbolTrades.filter((t: any) => t.action === 'BUY' || t.action === 'BOT');
            const mostRecentPurchase = buyTrades.length > 0 ? 
              buyTrades.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())[0] : null;
            
            // Calculate sale percentage
            const sellTrades = symbolTrades.filter((t: any) => t.action === 'SELL' || t.action === 'SLD');
            const totalSold = sellTrades.reduce((sum: number, trade: any) => sum + (trade.quantity || 0), 0);
            const totalBought = buyTrades.reduce((sum: number, trade: any) => sum + (trade.quantity || 0), 0);
            const salePercentage = totalBought > 0 ? Math.round((totalSold / totalBought) * 100) : 0;
            
            // Pozisyon detaylarını çıkar
            const position: Position = {
              symbol,
              name: pos.longName || pos.contractDesc || symbol,
              quantity: Number(pos.position) || 0,
              averageCost: Number(pos.avgPrice) || 0,
              marketValue: Number(pos.mktValue) || 0,
              unrealizedPnL: Number(pos.unrealizedPnL) || Number(pos.pnl) || Number(pos.profitLoss) || 0,
              percentChange: 0, // Aşağıda hesaplanacak
              dividendYield: metadata.dividendYield,
              purchaseDate: mostRecentPurchase?.date || undefined,
              salePercentage: salePercentage,
              country: metadata.country
            };
            
            // Eğer unrealizedPnL 0 ise, manuel hesaplama yap
            if (!position.unrealizedPnL && position.marketValue && position.averageCost && position.quantity) {
              position.unrealizedPnL = position.marketValue - (position.averageCost * position.quantity);
              console.log(`${position.symbol} için kar/zarar hesaplandı: ${position.unrealizedPnL}`);
            }
            
            // Yüzde değişimi hesapla
            if (position.unrealizedPnL !== 0 && position.marketValue !== 0) {
              const costBasis = position.marketValue - position.unrealizedPnL;
              if (costBasis !== 0) {
                position.percentChange = (position.unrealizedPnL / costBasis) * 100;
              }
            }
            
            return position;
          }) : [],
        };
        
        // Toplam değeri hesapla
        portfolio.totalValue = portfolio.positions.reduce(
          (sum, pos) => sum + pos.marketValue, 
          portfolio.cash
        );
        
        console.log('Dönüştürülmüş portföy verisi:', portfolio);
        return portfolio;
      }
    }
    
    // Son çare olarak mock veriye dön
    console.log('Mock portföy verisine dönülüyor');
    return mockPortfolio;
  } catch (error) {
    console.error('Portföy verisi alınırken hata:', error);
    return mockPortfolio;
  }
};

// Mock trades data generator - daha gerçekçi işlem verileri oluştur
const generateMockTrades = (count: number): Trade[] => {
  // İşlem sembollerini tanımla
  const symbols = [
    { ticker: 'AAPL', company: 'Apple Inc.', description: 'Consumer Electronics' },
    { ticker: 'MSFT', company: 'Microsoft Corp.', description: 'Software & Cloud' },
    { ticker: 'GOOGL', company: 'Alphabet Inc.', description: 'Internet Services' },
    { ticker: 'AMZN', company: 'Amazon.com Inc.', description: 'E-Commerce & Cloud' },
    { ticker: 'TSLA', company: 'Tesla Inc.', description: 'Electric Vehicles' },
    { ticker: 'META', company: 'Meta Platforms Inc.', description: 'Social Media' },
    { ticker: 'NVDA', company: 'NVIDIA Corp.', description: 'Semiconductors' },
    { ticker: 'JNJ', company: 'Johnson & Johnson', description: 'Healthcare' },
    { ticker: 'V', company: 'Visa Inc.', description: 'Financial Services' },
    { ticker: 'WMT', company: 'Walmart Inc.', description: 'Retail' },
    { ticker: 'JPM', company: 'JPMorgan Chase & Co.', description: 'Banking' },
    { ticker: 'PG', company: 'Procter & Gamble Co.', description: 'Consumer Goods' },
    { ticker: 'DIS', company: 'The Walt Disney Co.', description: 'Entertainment' },
    { ticker: 'MA', company: 'Mastercard Inc.', description: 'Financial Services' },
    { ticker: 'HD', company: 'Home Depot Inc.', description: 'Home Improvement Retail' }
  ];
  
  const orderTypes = ['Market', 'Limit', 'Stop', 'Stop Limit'];
  const statuses = ['Active', 'Filled', 'Cancelled', 'Rejected', 'Pending'];
  const orderDescriptions = ['Buy to Open', 'Sell to Close', 'Buy to Close', 'Sell to Open'];

  return Array.from({ length: count }).map((_, index) => {
    // Rastgele bir sembol seç
    const stockInfo = symbols[Math.floor(Math.random() * symbols.length)];
    const orderType = orderTypes[Math.floor(Math.random() * orderTypes.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const orderDescription = orderDescriptions[Math.floor(Math.random() * orderDescriptions.length)];
    
    // canCancel değeri sadece Active ve Pending durumundaki işlemler için true
    const canCancel = status === 'Active' || status === 'Pending';

    return {
      id: `trade-${index + 1}`,
      orderId: `ORD-${100000 + index}`,
      ticker: stockInfo.ticker,
      description: stockInfo.description,
      company: stockInfo.company,
      orderDescription,
      orderType,
      status,
      canCancel
    };
  });
};

// Normalize trade data - ensure all required fields are present and properly formatted
const normalizeTrade = (rawData: any, index: number): Trade => {
  // Try to extract ticker from multiple possible locations
  const ticker = rawData.ticker ||
                rawData.symbol || 
                rawData.contract?.symbol || 
                rawData.description1 || // API yanıtında gözüken description1 alanı ticker olabilir
                rawData.contract?.conid?.toString() || 
                (rawData.instrument ? rawData.instrument.symbol : null) ||
                'Unknown';
  
  // Define mapping of symbols to company names
  const symbolToCompany: Record<string, string> = {
    'AAPL': 'Apple Inc.',
    'MSFT': 'Microsoft Corp.',
    'GOOGL': 'Alphabet Inc.',
    'AMZN': 'Amazon.com Inc.',
    'TSLA': 'Tesla Inc.',
    'META': 'Meta Platforms Inc.',
    'NVDA': 'NVIDIA Corp.',
    'JNJ': 'Johnson & Johnson',
    'V': 'Visa Inc.',
    'WMT': 'Walmart Inc.',
    'JPM': 'JPMorgan Chase & Co.',
    'PG': 'Procter & Gamble Co.',
    'DIS': 'The Walt Disney Co.',
    'MA': 'Mastercard Inc.',
    'HD': 'Home Depot Inc.'
  };
  
  // Try to extract company from multiple possible locations
  let company = rawData.companyName || // Burada doğrudan API'den gelen companyName alanını kullan
                rawData.contract?.company || 
                rawData.contract?.description || 
                rawData.company ||
                rawData.name ||
                rawData.longName || 
                rawData.description;
  
  // Last resort: Check if the ticker itself contains company information
  // Sometimes tickers come in formats like "AAPL (Apple Inc.)" or "MSFT - Microsoft Corporation"
  if (!company && ticker !== 'Unknown') {
    const tickerParts = ticker.split(/[\(\)\-]/);
    if (tickerParts.length > 1) {
      const possibleCompanyName = tickerParts[1].trim();
      if (possibleCompanyName.length > 3) {
        company = possibleCompanyName;
        console.log(`Extracted company name "${company}" from ticker format: ${ticker}`);
      }
    }
  }
  
  // If ticker is valid but company is not found, use the mapping
  if ((!company || company === 'Unknown') && ticker !== 'Unknown' && ticker in symbolToCompany) {
    company = symbolToCompany[ticker];
    console.log(`Company name for ${ticker} derived from mapping: ${company}`);
  } else if (!company) {
    company = 'Unknown';
  }
  
  return {
    id: rawData.orderId || `order-${index}`,
    orderId: rawData.orderId?.toString() || `${index+100000}`,
    ticker,
    description: rawData.orderDesc || rawData.description1 || 'Standard Order',
    company,
    orderDescription: rawData.orderDesc || 'Market Order',
    orderType: rawData.orderType || rawData.origOrderType || 'Market',
    status: rawData.status || 'Unknown',
    canCancel: ['PreSubmitted', 'Submitted', 'Pending', 'Accepted'].includes(rawData.status)
  };
};

// İşlem verisi alma
export const getTrades = async (
  page = 1,
  limit = 20
): Promise<{ trades: Trade[]; total: number }> => {
  try {
    let isApiConnected = false;
    
    try {
      isApiConnected = await checkApiConnection();
    } catch (connError) {
      console.error('API bağlantı kontrolü sırasında hata:', connError);
      isApiConnected = false;
    }
    
    console.log('API bağlantı durumu:', isApiConnected ? 'Bağlı' : 'Bağlı değil');
    
    if (isApiConnected) {
      console.log('API bağlı, gerçek işlem verisi alınmaya çalışılıyor...');
      
      try {
        // Verdiğiniz API formatına göre filters=filled parametresi ile istek yapıyoruz
        console.log('IB Gateway API isteği yapılıyor... Endpoint: iserver/account/orders?filters=filled&force=true');
        const response = await apiClient.get('', {
          params: {
            target: 'ibgateway',
            path: 'iserver/account/orders?filters=filled&force=true'
          },
          validateStatus: () => true,
        });
        
        console.log('IB Gateway yanıtı:', response.status, response.statusText);
        
        if (response.status === 200) {
          console.log('IB Gateway yanıt içeriği:', response.data);
          
          // API yanıtını kontrol et
          if (response.data && typeof response.data === 'object') {
            const dataFields = Object.keys(response.data);
            console.log('Yanıtta bulunan ana alanlar:', dataFields);
            
            // orders alanını kontrol et
            if (response.data.orders && Array.isArray(response.data.orders)) {
              console.log('İlk order örneğindeki alanlar:', 
                response.data.orders.length > 0 ? Object.keys(response.data.orders[0]) : 'Boş');
            }
          }
          
          const ibOrders = response.data?.orders || [];
          if (ibOrders.length > 0) {
            console.log('IB Gateway\'den alınan emirler sayısı:', ibOrders.length);
            console.log('İlk emir örneği:', JSON.stringify(ibOrders[0], null, 2));
            
            // Verdiğiniz API formatına göre trade verilerini map ediyoruz
            const trades: Trade[] = ibOrders.map((order: any, index: number) => {
              if (index < 3) { // İlk 3 order için debug bilgisi
                console.log(`Processing order ${index}:`, JSON.stringify(order, null, 2));
              }
              
              // API formatınıza göre field mapping
              const trade: Trade = {
                // Temel alanlar
                id: order.orderId?.toString() || `order-${index}`,
                orderId: order.orderId?.toString() || `${index+100000}`,
                ticker: order.ticker || order.description1 || 'Unknown',
                description: order.orderDesc || order.description1 || 'Standard Order',
                company: order.companyName || 'Unknown Company',
                orderDescription: order.orderDesc || `${order.sizeAndFills || ''} ${order.orderType || 'Market'}`.trim(),
                orderType: order.orderType || order.origOrderType || 'Market',
                status: order.status || order.order_ccp_status || 'Unknown',
                canCancel: ['PreSubmitted', 'Submitted', 'Pending', 'Accepted', 'Active'].includes(order.status),
                
                // API formatınızdaki ek alanlar
                acct: order.acct,
                conidex: order.conidex,
                conid: order.conid,
                account: order.account,
                cashCcy: order.cashCcy,
                sizeAndFills: order.sizeAndFills,
                description1: order.description1,
                secType: order.secType,
                listingExchange: order.listingExchange,
                remainingQuantity: order.remainingQuantity,
                filledQuantity: order.filledQuantity,
                totalSize: order.totalSize,
                companyName: order.companyName,
                order_ccp_status: order.order_ccp_status,
                avgPrice: order.avgPrice,
                origOrderType: order.origOrderType,
                supportsTaxOpt: order.supportsTaxOpt,
                lastExecutionTime: order.lastExecutionTime,
                bgColor: order.bgColor,
                fgColor: order.fgColor,
                order_ref: order.order_ref,
                timeInForce: order.timeInForce,
                lastExecutionTime_r: order.lastExecutionTime_r,
                side: order.side
              };
              
              // Log the normalized result for verification
              if (index < 3) {
                console.log(`Normalized order ${index}:`, {
                  orderId: trade.orderId,
                  ticker: trade.ticker,
                  company: trade.company,
                  status: trade.status,
                  side: trade.side,
                  avgPrice: trade.avgPrice,
                  filledQuantity: trade.filledQuantity
                });
              }
              
              return trade;
            });
            
            // Log some samples of the processed trades to verify field extraction
            if (trades.length > 0) {
              console.log('İşlenen veri örnekleri:');
              trades.slice(0, Math.min(3, trades.length)).forEach((trade, i) => {
                console.log(`İşlem ${i+1}:`, {
                  ticker: trade.ticker,
                  company: trade.company,
                  status: trade.status,
                  side: trade.side,
                  orderType: trade.orderType
                });
              });
            }
            
            const startIndex = (page - 1) * limit;
            const endIndex = startIndex + limit;
            
            console.log(`Toplam ${trades.length} işlem bulundu.`);
            
            return {
              trades: trades.slice(startIndex, endIndex),
              total: trades.length,
            };
          } else {
            console.log('IB Gateway\'den alınan emirler boş veya bulunamadı.');
          }
        } else {
          console.error('API yanıt hatası:', response.status, response.statusText);
        }
      } catch (ibError) {
        console.error('IB Gateway\'den işlem verisi alınamadı:', ibError);
      }
    }
    
    // Gerçek veri alınamadığında boş dizi döndür
    console.log('Gerçek veri alınamadı, boş veri döndürülüyor.');
    return {
      trades: [],
      total: 0,
    };
  } catch (error) {
    console.error('Trades API hatası:', error);
    return {
      trades: [],
      total: 0,
    };
  }
};

// Tüm order'ları alma (filter olmadan)
export const getAllOrders = async (
  page = 1,
  limit = 20
): Promise<{ trades: Trade[]; total: number }> => {
  try {
    let isApiConnected = false;
    
    try {
      isApiConnected = await checkApiConnection();
    } catch (connError) {
      console.error('API bağlantı kontrolü sırasında hata:', connError);
      isApiConnected = false;
    }
    
    console.log('API bağlantı durumu:', isApiConnected ? 'Bağlı' : 'Bağlı değil');
    
    if (isApiConnected) {
      console.log('API bağlı, tüm order verisi alınmaya çalışılıyor...');
      
      try {
        // Filters parametresi olmadan tüm order'ları getiriyoruz
        console.log('IB Gateway API isteği yapılıyor... Endpoint: iserver/account/orders');
        const response = await apiClient.get('', {
          params: {
            target: 'ibgateway',
            path: 'iserver/account/orders'
          },
          validateStatus: () => true,
        });
        
        console.log('IB Gateway yanıtı:', response.status, response.statusText);
        
        if (response.status === 200) {
          console.log('IB Gateway yanıt içeriği:', response.data);
          
          // API yanıtını kontrol et
          if (response.data && typeof response.data === 'object') {
            const dataFields = Object.keys(response.data);
            console.log('Yanıtta bulunan ana alanlar:', dataFields);
            
            // orders alanını kontrol et
            if (response.data.orders && Array.isArray(response.data.orders)) {
              console.log('İlk order örneğindeki alanlar:', 
                response.data.orders.length > 0 ? Object.keys(response.data.orders[0]) : 'Boş');
            }
          }
          
          const ibOrders = response.data?.orders || [];
          if (ibOrders.length > 0) {
            console.log('IB Gateway\'den alınan tüm emirler sayısı:', ibOrders.length);
            console.log('İlk emir örneği:', JSON.stringify(ibOrders[0], null, 2));
            
            // Tüm order'ları API formatına göre map ediyoruz
            const trades: Trade[] = ibOrders.map((order: any, index: number) => {
              if (index < 3) { // İlk 3 order için debug bilgisi
                console.log(`Processing order ${index}:`, JSON.stringify(order, null, 2));
              }
              
              // API formatınıza göre field mapping
              const trade: Trade = {
                // Temel alanlar
                id: order.orderId?.toString() || `order-${index}`,
                orderId: order.orderId?.toString() || `${index+100000}`,
                ticker: order.ticker || order.description1 || 'Unknown',
                description: order.orderDesc || order.description1 || 'Standard Order',
                company: order.companyName || 'Unknown Company',
                orderDescription: order.orderDesc || `${order.sizeAndFills || ''} ${order.orderType || 'Market'}`.trim(),
                orderType: order.orderType || order.origOrderType || 'Market',
                status: order.status || order.order_ccp_status || 'Unknown',
                canCancel: ['PreSubmitted', 'Submitted', 'Pending', 'Accepted', 'Active'].includes(order.status),
                
                // API formatınızdaki ek alanlar
                acct: order.acct,
                conidex: order.conidex,
                conid: order.conid,
                account: order.account,
                cashCcy: order.cashCcy,
                sizeAndFills: order.sizeAndFills,
                description1: order.description1,
                secType: order.secType,
                listingExchange: order.listingExchange,
                remainingQuantity: order.remainingQuantity,
                filledQuantity: order.filledQuantity,
                totalSize: order.totalSize,
                companyName: order.companyName,
                order_ccp_status: order.order_ccp_status,
                avgPrice: order.avgPrice,
                origOrderType: order.origOrderType,
                supportsTaxOpt: order.supportsTaxOpt,
                lastExecutionTime: order.lastExecutionTime,
                bgColor: order.bgColor,
                fgColor: order.fgColor,
                order_ref: order.order_ref,
                timeInForce: order.timeInForce,
                lastExecutionTime_r: order.lastExecutionTime_r,
                side: order.side
              };
              
              return trade;
            });
            
            console.log(`Toplam ${trades.length} order bulundu.`);
            
            const startIndex = (page - 1) * limit;
            const endIndex = startIndex + limit;
            
            return {
              trades: trades.slice(startIndex, endIndex),
              total: trades.length,
            };
          } else {
            console.log('IB Gateway\'den alınan order\'lar boş veya bulunamadı.');
          }
        } else {
          console.error('API yanıt hatası:', response.status, response.statusText);
        }
      } catch (ibError) {
        console.error('IB Gateway\'den order verisi alınamadı:', ibError);
      }
    }
    
    // Gerçek veri alınamadığında boş dizi döndür
    console.log('Gerçek veri alınamadı, boş veri döndürülüyor.');
    return {
      trades: [],
      total: 0,
    };
  } catch (error) {
    console.error('Orders API hatası:', error);
    return {
      trades: [],
      total: 0,
    };
  }
};

// Mock dividends data generator
const generateMockDividends = (count: number): Dividend[] => {
  return Array.from({ length: count }).map((_, index) => {
    const symbol = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'PG', 'JNJ', 'KO', 'PEP'][Math.floor(Math.random() * 8)];
    const name = {
      'AAPL': 'Apple Inc.',
      'MSFT': 'Microsoft Corp.',
      'GOOGL': 'Alphabet Inc.',
      'AMZN': 'Amazon.com Inc.',
      'PG': 'Procter & Gamble Co.',
      'JNJ': 'Johnson & Johnson',
      'KO': 'Coca-Cola Co.',
      'PEP': 'PepsiCo Inc.',
    }[symbol] || '';
    
    const shares = Math.floor(Math.random() * 100) + 10;
    const amount = Number((Math.random() * 2).toFixed(2));
    
    return {
      id: `div-${index + 1}`,
      symbol,
      name,
      exDate: new Date(Date.now() - Math.random() * 1000 * 60 * 60 * 24 * 30 * 6).toISOString(),
      paymentDate: new Date(Date.now() - Math.random() * 1000 * 60 * 60 * 24 * 30 * 6 + 1000 * 60 * 60 * 24 * 7).toISOString(),
      amount,
      shares,
      total: Number((amount * shares).toFixed(2)),
    };
  });
};

export const getDividends = async (
  page = 1,
  limit = 20
): Promise<{ dividends: Dividend[]; total: number }> => {
  // Interactive Brokers API doesn't provide a direct endpoint for dividends
  // We'll use mock data for this feature
  const mockDividends = generateMockDividends(30);
  mockDividends.sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime());
  
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  
  return {
    dividends: mockDividends.slice(startIndex, endIndex),
    total: mockDividends.length,
  };
};

// Mock performance data generator
const generateMockPerformanceData = (days: number): {
  data: { date: string; value: number; return: number }[];
  startValue: number;
  endValue: number;
  percentChange: number;
} => {
  let value = 100000;
  const data = [];
  const startValue = value;
  
  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(date.getDate() - (days - i));
    
    // Random daily change, slightly biased upward
    const change = (Math.random() * 4) - 1.5;
    value = value * (1 + change / 100);
    
    // Calculate return as percentage change from start
    const returnValue = (value - startValue) / startValue;
    
    data.push({
      date: date.toISOString().split('T')[0],
      value: Number(value.toFixed(2)),
      return: Number(returnValue.toFixed(4)),
    });
  }
  
  return {
    data,
    startValue: Number(data[0].value.toFixed(2)),
    endValue: Number(data[data.length - 1].value.toFixed(2)),
    percentChange: Number((((data[data.length - 1].value - data[0].value) / data[0].value) * 100).toFixed(2)),
  };
};

export const getPerformance = async (period: string = '1m'): Promise<{
  data: { date: string; value: number; return: number }[];
  startValue: number;
  endValue: number;
  percentChange: number;
}> => {
  try {
    const isApiConnected = await checkApiConnection();
    
    if (isApiConnected) {
      console.log('API bağlı, gerçek performans verisi alınmaya çalışılıyor...');
      console.log('Kullanılan hesap ID:', IB_ACCOUNT_ID);
      
      // Flask backend'den performans verisi alma
      try {
        console.log('Performans verisi için Flask backend deneniyor');
        const response = await apiClient.get('', {
          params: {
            target: 'flask',
            path: `performance?period=${period}`
          },
          validateStatus: () => true,
        });
        
        if (response.status === 200 && response.data) {
          console.log('Flask backend\'den performans verisi alındı', response.data);
          return response.data;
        } else {
          console.warn('Flask backend yanıt verdi, ancak geçerli veri yok:', response.status, response.data);
        }
      } catch (flaskError) {
        console.error('Flask backend\'den veri alınamadı:', flaskError);
      }
    }
    
    // Mock veriye dön
    console.log('Mock performans verisine dönülüyor');
    
    let days = 30;
    switch (period) {
      case '1w': days = 7; break;
      case '1m': days = 30; break;
      case '3m': days = 90; break;
      case '6m': days = 180; break;
      case '1y': days = 365; break;
      case 'all': days = 730; break;
    }
    
    return generateMockPerformanceData(days);
  } catch (error) {
    console.error('Performans verisi alınırken hata:', error);
    // Hata durumunda mock veriye dön
    let days = 30;
    switch (period) {
      case '1w': days = 7; break;
      case '1m': days = 30; break;
      case '3m': days = 90; break;
      case '6m': days = 180; break;
      case '1y': days = 365; break;
      case 'all': days = 730; break;
    }
    
    return generateMockPerformanceData(days);
  }
};

export const getPositions = async (): Promise<any> => {
  try {
    console.log('Fetching positions data from API...');
    // Add timestamp to prevent caching
    const timestamp = new Date().getTime();
    // Use direct URL since it's a local API outside the proxy system
    const response = await axios.get(`http://localhost:5056/positions?_t=${timestamp}`, {
      timeout: 8000 // 8 second timeout - increased from 5s
    });
    
    console.log('Positions data received, status:', response.status);
    
    // Validate the data structure
    if (response.data) {
      // Check if we have an array of position objects with the expected structure
      if (Array.isArray(response.data)) {
        // Transform the API response to the format expected by the frontend
        const transformedPositions = response.data.map((pos: any) => {
          // Calculate percentChange if not provided
          let percentChange = 0;
          if (pos.unrealizedPnl && pos.marketValue && pos.avgCost && pos.position) {
            const costBasis = pos.avgCost * pos.position;
            if (costBasis !== 0) {
              percentChange = (pos.unrealizedPnl / costBasis) * 100;
            }
          }

          return {
            symbol: pos.symbol || pos.description || pos.conid || 'Unknown',
            name: pos.name || pos.description || 'Unknown',
            quantity: pos.quantity || pos.position || 0,
            averageCost: pos.averageCost || pos.avgCost || 0,
            marketValue: pos.marketValue || (pos.marketPrice * pos.position) || 0,
            unrealizedPnL: pos.unrealizedPnL || pos.unrealizedPnl || 0,
            percentChange: pos.percentChange || percentChange || 0,
            // Add additional fields that might be useful
            sector: pos.sector || null,
            group: pos.group || null,
            assetClass: pos.assetClass || null
          };
        });

        console.log(`Transformed ${transformedPositions.length} positions`);
        return transformedPositions;
      } else {
        console.warn('API returned non-array data:', response.data);
        throw new Error('Invalid data format returned from API');
      }
    } else {
      console.error('API returned null or undefined data');
      throw new Error('Empty data returned from API');
    }
  } catch (error: any) {
    console.error('Failed to fetch positions data:', error.message);
    
    // More detailed error logging to help diagnose the issue
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Server responded with error:', {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers
      });
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received from server. Is the API running?');
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error setting up request:', error.message);
    }
    
    // Return mock data when API call fails
    console.warn('Returning mock position data instead');
    return [
      {
        symbol: 'AAPL',
        name: 'Apple Inc.',
        quantity: 50,
        averageCost: 165.48,
        marketValue: 15000,
        unrealizedPnL: 942.00,
        percentChange: 11.38,
      },
      {
        symbol: 'MSFT',
        name: 'Microsoft Corp.',
        quantity: 25,
        averageCost: 305.22,
        marketValue: 12500,
        unrealizedPnL: 824.75,
        percentChange: 10.82,
      },
      {
        symbol: 'GOOGL',
        name: 'Alphabet Inc.',
        quantity: 20,
        averageCost: 132.18,
        marketValue: 9500,
        unrealizedPnL: 199.40,
        percentChange: 7.54,
      },
      {
        symbol: 'AMZN',
        name: 'Amazon.com Inc.',
        quantity: 15,
        averageCost: 130.25,
        marketValue: 8200,
        unrealizedPnL: 231.45,
        percentChange: 11.85,
      },
      {
        symbol: 'XOM',
        name: 'Exxon Mobil Corp.',
        quantity: 30,
        averageCost: 95.40,
        marketValue: 7500,
        unrealizedPnL: 564.10,
        percentChange: 9.61,
      },
      {
        symbol: 'NEE',
        name: 'NextEra Energy Inc.',
        quantity: 40,
        averageCost: 75.20,
        marketValue: 6000,
        unrealizedPnL: 348.00,
        percentChange: 8.25,
      },
      {
        symbol: 'LIN',
        name: 'Linde plc',
        quantity: 10,
        averageCost: 320.10,
        marketValue: 5500,
        unrealizedPnL: 178.90,
        percentChange: 6.42,
      },
      {
        symbol: 'HON',
        name: 'Honeywell International Inc.',
        quantity: 15,
        averageCost: 210.30,
        marketValue: 4800,
        unrealizedPnL: 155.50,
        percentChange: 5.18,
      },
      {
        symbol: 'NFLX',
        name: 'Netflix Inc.',
        quantity: 10,
        averageCost: 450.75,
        marketValue: 4700,
        unrealizedPnL: 292.50,
        percentChange: 12.45,
      },
    ];
  }
};

export const getAllocation = async (): Promise<AllocationData> => {
  try {
    console.log('Fetching allocation data...');
    const response = await axios.get('http://127.0.0.1:5056/api/allocation', {
      timeout: 12000 // Increased from 8000 to 12000
    });
    
    console.log('Allocation data received:', response.data);
    
    if (response.data && typeof response.data === 'object') {
      // Create a properly structured response
      const result: AllocationData = {
        assetClass: [],
        sector: [],
        industry: []
      };
      
      // Process asset class data if available
      if (Array.isArray(response.data.assetClass)) {
        result.assetClass = response.data.assetClass.map((item: any) => ({
          name: item.name || 'Unknown',
          value: typeof item.value === 'number' ? item.value : parseFloat(item.value) || 0,
          color: item.color
        }));
      }
      
      // Process sector data if available
      if (Array.isArray(response.data.sector)) {
        result.sector = response.data.sector.map((item: any) => ({
          name: item.name || 'Unknown',
          value: typeof item.value === 'number' ? item.value : parseFloat(item.value) || 0,
          color: item.color
        }));
      }
      
      // Process industry data if available
      if (Array.isArray(response.data.industry)) {
        result.industry = response.data.industry.map((item: any) => ({
          name: item.name || 'Unknown',
          value: typeof item.value === 'number' ? item.value : parseFloat(item.value) || 0,
          color: item.color
        }));
      }
      
      console.log('Processed allocation data:', result);
      return result;
    }
    
    throw new Error('Invalid response format');
  } catch (error: any) {
    console.error('Failed to fetch allocation data:', error.message);
    // Return mock data on error as fallback
    return generateMockAllocationData();
  }
};

// Generate mock allocation data for testing
const generateMockAllocationData = (): AllocationData => {
  return {
    assetClass: [
      { name: 'Stocks', value: 1850000, color: '#8fffa9' },
      { name: 'Cash', value: 450000, color: '#e9e9e9' },
      { name: 'Accruals', value: 172630, color: '#75d7ff' }
    ],
    sector: [
      { name: 'Technology', value: 780000, color: '#292b3c' },
      { name: 'Consumer Cyclical', value: 520000, color: '#f9d673' },
      { name: 'Energy', value: 320000, color: '#ff85c0' },
      { name: 'Industrial', value: 230000, color: '#aaaaaa' },
      { name: 'Utilities', value: 180000, color: '#5bc0de' },
      { name: 'Communications', value: 120000, color: '#99ddff' },
      { name: 'Basic Materials', value: 70000, color: '#d9534f' },
      { name: 'Others', value: 80000, color: '#f0ad4e' }
    ],
    industry: [
      { name: 'Healthcare Products', value: 580000, color: '#bc8f50' },
      { name: 'Others', value: 420000, color: '#f0ad4e' },
      { name: 'Biotechnology', value: 350000, color: '#ceeaff' },
      { name: 'Computers', value: 280000, color: '#f3f3ab' },
      { name: 'Semiconductors', value: 240000, color: '#ffea95' },
      { name: 'Transportation', value: 120000, color: '#ff7575' },
      { name: 'Telecommunications', value: 100000, color: '#ffc8b3' },
      { name: 'Mining', value: 80000, color: '#9e9e9e' }
    ]
  };
};

// Mock S&P 500 data generator
const generateMockSP500Data = (days: number): {
  data: { date: string; value: number; return: number }[];
  startValue: number;
  endValue: number;
  percentChange: number;
} => {
  let value = 4500; // Typical S&P 500 index value
  const data = [];
  let baseReturn = 0;
  
  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(date.getDate() - (days - i));
    
    // Random daily change for S&P 500 (generally less volatile than individual portfolios)
    const change = (Math.random() * 2.5) - 1.0; // ±1% typical daily range
    const returnChange = change / 100;
    value = value * (1 + returnChange);
    baseReturn += returnChange;
    
    data.push({
      date: date.toISOString().split('T')[0],
      value: Number(value.toFixed(2)),
      return: Number(baseReturn.toFixed(4))
    });
  }
  
  return {
    data,
    startValue: Number(data[0].value.toFixed(2)),
    endValue: Number(data[data.length - 1].value.toFixed(2)),
    percentChange: Number((((data[data.length - 1].value - data[0].value) / data[0].value) * 100).toFixed(2)),
  };
};

// Get S&P 500 data for comparison
export const getSP500Data = async (period: string = '1m'): Promise<{
  data: { date: string; value: number; return: number }[];
  startValue: number;
  endValue: number;
  percentChange: number;
}> => {
  try {
    // For now, we'll use mock data for S&P 500
    // In a production environment, this would fetch real S&P 500 data from an API
    
    let days = 30;
    switch (period) {
      case '1w': days = 7; break;
      case '1m': days = 30; break;
      case '3m': days = 90; break;
      case '6m': days = 180; break;
      case '1y': days = 365; break;
      case 'all': days = 730; break;
    }
    
    return generateMockSP500Data(days);
  } catch (error) {
    console.error('S&P 500 data retrieval error:', error);
    // Return minimal data in case of error
    return {
      data: [],
      startValue: 0,
      endValue: 0,
      percentChange: 0
    };
  }
};

export default {
  getPortfolio,
  getTrades,
  getDividends,
  getPerformance,
  getPositions,
  getAllocation,
  getSP500Data,
  getAllOrders,
}; 