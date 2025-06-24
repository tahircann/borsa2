import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('🔄 Background cache refresh initiated...');
    
    // Call the cache API to force a refresh
    const baseUrl = process.env.NODE_ENV === 'production' 
      ? `http://localhost:${process.env.PORT || 3000}`
      : 'http://localhost:3000';

    const cacheResponse = await fetch(`${baseUrl}/api/cache`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (cacheResponse.ok) {
      const result = await cacheResponse.json();
      console.log('✅ Background cache refresh completed:', result);
      
      return res.status(200).json({
        success: true,
        message: 'Cache refreshed successfully',
        lastUpdate: result.lastUpdate,
        nextUpdate: result.nextUpdate
      });
    } else {
      const error = await cacheResponse.text();
      console.error('❌ Background cache refresh failed:', error);
      
      return res.status(500).json({
        success: false,
        error: 'Cache refresh failed',
        details: error
      });
    }

  } catch (error) {
    console.error('❌ Background cache refresh error:', error);
    
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 