import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

const CACHE_DIR = path.join(process.cwd(), 'cache');
const CACHE_FILE = path.join(CACHE_DIR, 'ibapi-data.json');

interface CacheData {
  data: {
    portfolio?: any;
    positions?: any;
    trades?: any;
  };
  lastUpdate: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { type } = req.query;

    if (req.method === 'GET') {
      // Cache'deki veriyi oku
      if (!fs.existsSync(CACHE_FILE)) {
        return res.status(404).json({ 
          error: 'Cache not found',
          message: 'Cache henüz oluşturulmamış'
        });
      }

      const cacheContent = fs.readFileSync(CACHE_FILE, 'utf8');
      const cacheData: CacheData = JSON.parse(cacheContent);

      // Belirli bir veri tipi isteniyorsa
      if (type && typeof type === 'string') {
        const requestedData = cacheData.data[type as keyof typeof cacheData.data];
        
        if (!requestedData) {
          return res.status(404).json({ 
            error: `Data type '${type}' not found in cache`,
            availableTypes: Object.keys(cacheData.data),
            lastUpdate: cacheData.lastUpdate
          });
        }

        return res.status(200).json({
          data: requestedData,
          lastUpdate: cacheData.lastUpdate,
          cached: true
        });
      }

      // Tüm cache verisini döndür
      return res.status(200).json({
        ...cacheData,
        cached: true
      });
    }

    if (req.method === 'POST') {
      // Cache'i güncelle (manuel trigger için)
      // Bu endpoint cache service'ine yeniden fetch yapmasını söyleyebilir
      return res.status(200).json({ 
        message: 'Cache refresh triggered',
        note: 'Cache servisi otomatik olarak 4 saatte bir güncellenir'
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    console.error('Cache API error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: 'Cache okunamadı'
    });
  }
} 