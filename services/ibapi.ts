import axios from 'axios';
import https from 'https';

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
  timeout: 15000, // 15 saniye timeout
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
  totalValue: 125842.65,
  cash: 12500.82,
  positions: [
    {
      symbol: 'AAPL',
      name: 'Apple Inc.',
      quantity: 50,
      averageCost: 165.48,
      marketValue: 9216.00,
      unrealizedPnL: 942.00,
      percentChange: 11.38,
    },
    {
      symbol: 'MSFT',
      name: 'Microsoft Corp.',
      quantity: 25,
      averageCost: 305.22,
      marketValue: 8455.25,
      unrealizedPnL: 824.75,
      percentChange: 10.82,
    },
    {
      symbol: 'GOOGL',
      name: 'Alphabet Inc.',
      quantity: 20,
      averageCost: 132.18,
      marketValue: 2843.00,
      unrealizedPnL: 199.40,
      percentChange: 7.54,
    },
    {
      symbol: 'AMZN',
      name: 'Amazon.com Inc.',
      quantity: 15,
      averageCost: 130.25,
      marketValue: 2185.20,
      unrealizedPnL: 231.45,
      percentChange: 11.85,
    },
    {
      symbol: 'TSLA',
      name: 'Tesla Inc.',
      quantity: 30,
      averageCost: 195.40,
      marketValue: 5304.90,
      unrealizedPnL: -564.10,
      percentChange: -9.61,
    },
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
      
      if (summaryResponse.status === 200 && positionsResponse.status === 200) {
        const summary = summaryResponse.data;
        const positions = positionsResponse.data || [];
        
        console.log('Alınan pozisyon verisi:', JSON.stringify(positions, null, 2));
        
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
            // Pozisyon detaylarını çıkar
            const position = {
              symbol: pos.contractDesc || 'Bilinmiyor',
              name: pos.longName || pos.contractDesc || 'Bilinmiyor',
              quantity: Number(pos.position) || 0,
              averageCost: Number(pos.avgPrice) || 0,
              marketValue: Number(pos.mktValue) || 0,
              unrealizedPnL: Number(pos.unrealizedPnL) || Number(pos.pnl) || Number(pos.profitLoss) || 0,
              percentChange: 0, // Aşağıda hesaplanacak
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
          
          // Debug: Doğrudan companyName ve diğer alanların tüm yanıtta olup olmadığını kontrol et
          if (response.data && typeof response.data === 'object') {
            console.log('Yanıtta companyName alanı var mı?', 'companyName' in response.data);
            
            // Veri yapısını analiz et
            const dataFields = Object.keys(response.data);
            console.log('Yanıtta bulunan ana alanlar:', dataFields);
            
            // orders alanını kontrol et
            if (response.data.orders && Array.isArray(response.data.orders)) {
              console.log('İlk order örneğindeki alanlar:', 
                response.data.orders.length > 0 ? Object.keys(response.data.orders[0]) : 'Boş');
              
              // companyName alanını doğrudan kontrol et
              if (response.data.orders.length > 0) {
                console.log('companyName mevcut mu?', 'companyName' in response.data.orders[0]);
              }
            }
          }
          
          const ibOrders = response.data?.orders || [];
          if (ibOrders.length > 0) {
            console.log('IB Gateway\'den alınan emirler sayısı:', ibOrders.length);
            console.log('İlk emir örneği:', JSON.stringify(ibOrders[0], null, 2));
            
            // Use the normalization function for each trade
            const trades: Trade[] = ibOrders.map((order: any, index: number) => {
              if (index < 3) { // Only log first 3 orders to avoid console spam
                console.log(`Processing order ${index}:`, JSON.stringify(order, null, 2));
                
                // Check directly if order has companyName field
                if (order.companyName) {
                  console.log(`Buldum! Emir #${index} için companyName: ${order.companyName}`);
                }
              }
              
              // Enhanced direct field mapping based on the observed API response
              const normalized = {
                id: order.orderId?.toString() || `order-${index}`,
                orderId: order.orderId?.toString() || `${index+100000}`,
                ticker: order.ticker || order.description1 || 'Unknown',
                description: order.orderDesc || 'Standard Order',
                company: order.companyName || 'Unknown',
                orderDescription: order.orderDesc || 'Market Order',
                orderType: order.orderType || order.origOrderType || 'Market',
                status: order.status || 'Unknown',
                canCancel: ['PreSubmitted', 'Submitted', 'Pending', 'Accepted'].includes(order.status)
              };
              
              // Log the normalized result for verification
              if (index < 3) {
                console.log(`Normalized order ${index}:`, normalized);
              }
              
              return normalized;
            });
            
            // Log some samples of the processed trades to verify field extraction
            if (trades.length > 0) {
              console.log('İşlenen veri örnekleri:');
              trades.slice(0, Math.min(3, trades.length)).forEach((trade, i) => {
                console.log(`İşlem ${i+1}:`, {
                  ticker: trade.ticker,
                  company: trade.company,
                  status: trade.status
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
        }
      } catch (ibError) {
        console.error('IB Gateway\'den işlem verisi alınamadı:', ibError);
      }
      
      console.log('Gerçek veri alınamadı, mock veri kullanılacak');
    }
    
    // Mock veri kullan
    console.log('Mock trade verileri oluşturuluyor...');
    // Create a predefined set of trades with guaranteed company data
    const symbolList = [
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

    // Generate guaranteed valid mock data
    const mockData = Array.from({ length: 50 }).map((_, index) => {
      const symbolInfo = symbolList[index % symbolList.length];
      const orderType = orderTypes[Math.floor(Math.random() * orderTypes.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const orderDescription = orderDescriptions[Math.floor(Math.random() * orderDescriptions.length)];
      const canCancel = status === 'Active' || status === 'Pending';
      
      return {
        id: `trade-${index + 1}`,
        orderId: `ORD-${100000 + index}`,
        ticker: symbolInfo.ticker,
        description: symbolInfo.description,
        company: symbolInfo.company, // Guaranteed to have a company name
        orderDescription,
        orderType,
        status,
        canCancel
      };
    });

    // Debug: Print samples of the mock data to verify company values
    console.log('Generated mock data samples:');
    mockData.slice(0, 3).forEach((item, index) => {
      console.log(`Mock item ${index}:`, {
        ticker: item.ticker,
        company: item.company,
        description: item.description
      });
    });

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    
    return {
      trades: mockData.slice(startIndex, endIndex),
      total: mockData.length,
    };
  } catch (error) {
    console.error('Trades API hatası:', error);
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
  data: { date: string; value: number }[];
  startValue: number;
  endValue: number;
  percentChange: number;
} => {
  let value = 100000;
  const data = [];
  
  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(date.getDate() - (days - i));
    
    // Random daily change, slightly biased upward
    const change = (Math.random() * 4) - 1.5;
    value = value * (1 + change / 100);
    
    data.push({
      date: date.toISOString().split('T')[0],
      value: Number(value.toFixed(2)),
    });
  }
  
  return {
    data,
    startValue: Number(data[0].value.toFixed(2)),
    endValue: Number(data[data.length - 1].value.toFixed(2)),
    percentChange: Number((((data[data.length - 1].value - data[0].value) / data[0].value) * 100).toFixed(2)),
  };
};

export const getPerformance = async (period: string): Promise<{
  data: { date: string; value: number }[];
  startValue: number;
  endValue: number;
  percentChange: number;
}> => {
  try {
    const isApiConnected = await checkApiConnection();
    
    if (isApiConnected) {
      console.log('API bağlı, gerçek performans verisi alınmaya çalışılıyor...');
      console.log('Kullanılan hesap ID:', IB_ACCOUNT_ID);
      
      // Flask backend'den hesap geçmişini alma
      try {
        console.log('Performans verisi için Flask backend deneniyor');
        const response = await apiClient.get('', {
          params: {
            target: 'flask',
            path: `performance?period=${period}&account=${IB_ACCOUNT_ID}`
          },
          validateStatus: () => true,
        });
        
        if (response.status === 200 && response.data) {
          console.log('Flask backend\'den performans verisi alındı');
          return response.data;
        }
      } catch (flaskError) {
        console.error('Flask backend\'den veri alınamadı:', flaskError);
      }
      
      // IB Gateway verisi üzerinden performans hesaplama
      try {
        // IB Gateway API'si doğrudan performans geçmişi sağlamıyor
        // Mevcut portföy değerini alıp basit bir grafik oluşturalım
        const summaryResponse = await apiClient.get('', {
          params: {
            target: 'ibgateway',
            path: `portfolio/${IB_ACCOUNT_ID}/summary`
          },
          validateStatus: () => true,
        });
        
        if (summaryResponse.status === 200) {
          const summary = summaryResponse.data;
          console.log('Performans hesaplaması için hesap özeti alındı');
          
          // Periyoda göre gün sayısını belirle
          let days = 30;
          switch (period) {
            case '1w': days = 7; break;
            case '1m': days = 30; break;
            case '3m': days = 90; break;
            case '6m': days = 180; break;
            case '1y': days = 365; break;
            case 'all': days = 730; break;
          }
          
          // Özetten mevcut portföy değerini çıkar
          let currentValue = 0;
          if (summary.totalnetvalue && summary.totalnetvalue.amount) {
            currentValue = Number(summary.totalnetvalue.amount);
          } else if (summary.netvalue && summary.netvalue.amount) {
            currentValue = Number(summary.netvalue.amount);
          }
          
          if (currentValue > 0) {
            // Mevcut değeri kullanarak yarı-gerçekçi bir grafik oluştur
            let startValue = currentValue * (1 - (Math.random() * 0.1 + 0.05)); // Mevcut değerden %5-15 daha az
            const data = [];
            
            for (let i = 0; i < days; i++) {
              const date = new Date();
              date.setDate(date.getDate() - (days - i));
              
              // Mevcut değere doğru ilerleyen bir değer üret
              const progress = i / (days - 1);
              const randomFactor = 1 + ((Math.random() - 0.5) * 0.01); // Küçük rastgele varyasyon
              const value = startValue + (currentValue - startValue) * progress * randomFactor;
              
              data.push({
                date: date.toISOString().split('T')[0],
                value: Number(value.toFixed(2)),
              });
            }
            
            // Son değerin mevcut portföy değerine eşit olmasını sağla
            if (data.length > 0) {
              data[data.length - 1].value = currentValue;
            }
            
            return {
              data,
              startValue: Number(data[0].value.toFixed(2)),
              endValue: Number(data[data.length - 1].value.toFixed(2)),
              percentChange: Number((((data[data.length - 1].value - data[0].value) / data[0].value) * 100).toFixed(2)),
            };
          }
        }
      } catch (ibError) {
        console.error('IB verisi üzerinden performans hesaplanamadı:', ibError);
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

export default {
  getPortfolio,
  getTrades,
  getDividends,
  getPerformance,
}; 