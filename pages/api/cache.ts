import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import axios from 'axios';

const CACHE_DIR = path.join(process.cwd(), 'cache');
const CACHE_FILE = path.join(CACHE_DIR, 'ibapi-data.json');
const CACHE_DURATION = 4 * 60 * 60 * 1000; // 4 hours in milliseconds

interface CacheData {
  data: {
    portfolio?: any;
    positions?: any;
    summary?: any;
    allocation?: any;
  };
  lastUpdate: string;
  nextUpdate: string;
  status: 'fresh' | 'stale' | 'updating';
}

// Ensure cache directory exists
if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
}

const isCacheValid = (lastUpdate: string): boolean => {
  const lastUpdateTime = new Date(lastUpdate).getTime();
  const currentTime = new Date().getTime();
  return (currentTime - lastUpdateTime) < CACHE_DURATION;
};

const fetchFreshData = async (): Promise<any> => {
  console.log('🔄 Fetching fresh data directly from IBKR Gateway...');
  
  // Connect directly to IBKR Gateway using localhost to avoid external access issues
  const baseUrl = 'https://localhost:5055/v1/api';

  try {
    // First get accounts using the working iserver endpoint
    const accountsRes = await axios.get(`${baseUrl}/iserver/accounts`, { 
      timeout: 30000,
      httpsAgent: new (require('https').Agent)({
        rejectUnauthorized: false
      })
    });
    
    const accountsData = accountsRes.data;
    if (!accountsData || !accountsData.accounts || accountsData.accounts.length === 0) {
      throw new Error('No accounts found');
    }
    
    // Find the correct trading account - prefer U7960949 which has positions
    let tradingAccount = accountsData.accounts.find((acc: string) => acc === 'U7960949');
    
    // If U7960949 not found, fall back to any trading account
    if (!tradingAccount) {
      tradingAccount = accountsData.accounts.find((acc: string) => 
        acc.startsWith('U') && acc.length > 1 && /^\d+$/.test(acc.slice(1))
      );
    }
    
    if (!tradingAccount) {
      throw new Error('No trading account found');
    }
    
    console.log(`Using account: ${tradingAccount}`);
    
    // Fetch all data in parallel with longer timeout
    const [summaryRes, positionsRes, allocationRes] = await Promise.all([
      axios.get(`${baseUrl}/portfolio/${tradingAccount}/summary`, { 
        timeout: 30000,
        httpsAgent: new (require('https').Agent)({
          rejectUnauthorized: false
        })
      }),
      axios.get(`${baseUrl}/portfolio/${tradingAccount}/positions/0`, { 
        timeout: 30000,
        httpsAgent: new (require('https').Agent)({
          rejectUnauthorized: false
        })
      }),
      axios.get(`${baseUrl}/portfolio/${tradingAccount}/allocation`, { 
        timeout: 30000,
        httpsAgent: new (require('https').Agent)({
          rejectUnauthorized: false
        })
      })
    ]);

    const data: any = {
      summary: summaryRes.data,
      positions: positionsRes.data,
      allocation: allocationRes.data
    };

    // Debug: Log the type of data we received
    console.log('🔍 Summary data type:', typeof summaryRes.data, summaryRes.data?.constructor?.name);
    console.log('🔍 Positions data type:', typeof positionsRes.data, positionsRes.data?.constructor?.name);
    console.log('🔍 Allocation data type:', typeof allocationRes.data, allocationRes.data?.constructor?.name);
    
    // Check if we got HTML instead of JSON
    if (typeof summaryRes.data === 'string' && summaryRes.data.includes('<html>')) {
      console.error('❌ Received HTML instead of JSON from summary API');
    }
    if (typeof positionsRes.data === 'string' && positionsRes.data.includes('<html>')) {
      console.error('❌ Received HTML instead of JSON from positions API');
    }
    if (typeof allocationRes.data === 'string' && allocationRes.data.includes('<html>')) {
      console.error('❌ Received HTML instead of JSON from allocation API');
    }
    
    // Process portfolio data from positions and summary
    const portfolio: any = {
      totalValue: 0,
      cash: 0,
      positions: []
    };

    if (data.summary && data.positions) {
      // Calculate cash value
      let cashValue = 0;
      if (data.summary.totalcashvalue && data.summary.totalcashvalue.amount) {
        cashValue = Number(data.summary.totalcashvalue.amount);
      } else if (data.summary.settledcash && data.summary.settledcash.amount) {
        cashValue = Number(data.summary.settledcash.amount);
      }

      // Process positions
      const positions = Array.isArray(data.positions) ? data.positions.map((pos: any) => ({
        symbol: pos.contractDesc || pos.description || 'Unknown',
        name: pos.name || pos.description || pos.contractDesc || 'Unknown', 
        quantity: Number(pos.position) || 0,
        averageCost: Number(pos.avgCost) || 0,
        marketValue: Number(pos.mktValue) || 0,
        unrealizedPnL: Number(pos.unrealizedPnl) || 0,
        percentChange: 0,
        country: 'US'
      })).filter((pos: any) => pos.marketValue !== 0) : [];

      // Calculate percentage changes
      positions.forEach((position: any) => {
        if (position.unrealizedPnL !== 0 && position.marketValue !== 0) {
          const costBasis = position.marketValue - position.unrealizedPnL;
          if (costBasis !== 0) {
            position.percentChange = (position.unrealizedPnL / costBasis) * 100;
          }
        }
      });

      portfolio.cash = cashValue;
      portfolio.positions = positions;
      portfolio.totalValue = positions.reduce((sum: number, pos: any) => sum + pos.marketValue, cashValue);
    }

    // Convert IBKR allocation format to our expected format
    if (data.allocation) {
      // Convert sector allocation from object to array format
      if (data.allocation.sector && data.allocation.sector.long) {
        data.allocation.sector = Object.entries(data.allocation.sector.long).map(([name, value]) => ({
          name,
          value: Number(value)
        })).filter((item: any) => item.name && item.name.toLowerCase() !== 'cash');
      } else {
        data.allocation.sector = [];
      }
      
      // Set industry to empty array since IBKR doesn't provide this breakdown
      data.allocation.industry = [];
      
      // Convert asset class allocation from object to array format
      if (data.allocation.assetClass && data.allocation.assetClass.long) {
        data.allocation.assetClass = Object.entries(data.allocation.assetClass.long).map(([name, value]) => ({
          name,
          value: Number(value)
        })).filter((item: any) => item.name && item.name.toLowerCase() !== 'cash');
      } else {
        data.allocation.assetClass = [];
      }
    }

    data.portfolio = portfolio;

    console.log('✅ Fresh data fetched successfully');
    console.log(`� Portfolio: ${portfolio.positions.length} positions`);
    console.log(`🎯 Allocation sectors:`, data.allocation?.sector?.length || 0);
    console.log(`🏭 Allocation industries:`, data.allocation?.industry?.length || 0);
    
    return data;
  } catch (error) {
    console.error('❌ Error fetching fresh data:', error);
    throw error;
  }
};

const updateCache = async (forceUpdate = false): Promise<CacheData> => {
  let existingCache: CacheData | null = null;

  // Try to read existing cache
  try {
    if (fs.existsSync(CACHE_FILE)) {
      const cacheContent = fs.readFileSync(CACHE_FILE, 'utf8');
      existingCache = JSON.parse(cacheContent);
    }
  } catch (error) {
    console.error('Error reading existing cache:', error);
  }

  // Check if we need to update
  const needsUpdate = forceUpdate || 
    !existingCache || 
    !isCacheValid(existingCache.lastUpdate) ||
    existingCache.status === 'stale';

  if (!needsUpdate && existingCache) {
    console.log('📂 Cache is still valid, returning existing data');
    return existingCache;
  }

  // Mark cache as updating
  const now = new Date();
  const nextUpdate = new Date(now.getTime() + CACHE_DURATION);
  
  if (existingCache) {
    existingCache.status = 'updating';
    try {
      fs.writeFileSync(CACHE_FILE, JSON.stringify(existingCache, null, 2));
    } catch (error) {
      console.error('Error updating cache status:', error);
    }
  }

  try {
    // Fetch fresh data
    const freshData = await fetchFreshData();

    // Create new cache data
    const newCacheData: CacheData = {
      data: freshData,
      lastUpdate: now.toISOString(),
      nextUpdate: nextUpdate.toISOString(),
      status: 'fresh'
    };

    // Write to cache file
    fs.writeFileSync(CACHE_FILE, JSON.stringify(newCacheData, null, 2));
    
    console.log(`💾 Cache updated successfully. Next update: ${nextUpdate.toLocaleString()}`);
    return newCacheData;

  } catch (error) {
    console.error('❌ Failed to update cache:', error);
    
    // If we have existing cache, mark it as stale but still return it
    if (existingCache) {
      existingCache.status = 'stale';
      try {
        fs.writeFileSync(CACHE_FILE, JSON.stringify(existingCache, null, 2));
      } catch (writeError) {
        console.error('Error writing stale cache:', writeError);
      }
      console.log('⚠️ Returning stale cache data due to fetch error');
      return existingCache;
    }

    throw error;
  }
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { type, refresh } = req.query;
    const forceRefresh = refresh === 'true';

    if (req.method === 'GET') {
      // Get cached data (with automatic refresh if needed)
      const cacheData = await updateCache(forceRefresh);

      // If specific data type is requested
      if (type && typeof type === 'string') {
        const requestedData = cacheData.data[type as keyof typeof cacheData.data];
        
        if (!requestedData) {
          return res.status(404).json({ 
            error: `Data type '${type}' not found in cache`,
            availableTypes: Object.keys(cacheData.data),
            lastUpdate: cacheData.lastUpdate,
            status: cacheData.status
          });
        }

        return res.status(200).json({
          data: requestedData,
          lastUpdate: cacheData.lastUpdate,
          nextUpdate: cacheData.nextUpdate,
          status: cacheData.status,
          cached: true
        });
      }

      // Return all cache data
      return res.status(200).json({
        ...cacheData,
        cached: true
      });
    }

    if (req.method === 'POST') {
      // Force cache refresh
      console.log('🔄 Manual cache refresh triggered');
      const cacheData = await updateCache(true);
      
      return res.status(200).json({ 
        message: 'Cache refreshed successfully',
        lastUpdate: cacheData.lastUpdate,
        nextUpdate: cacheData.nextUpdate,
        status: cacheData.status
      });
    }

    if (req.method === 'DELETE') {
      // Clear cache
      if (fs.existsSync(CACHE_FILE)) {
        fs.unlinkSync(CACHE_FILE);
      }
      
      return res.status(200).json({ 
        message: 'Cache cleared successfully'
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    console.error('Cache API error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Cache operation failed'
    });
  }
}