import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import https from 'https';

// Hedef API'ler - environment based
const isProduction = process.env.NODE_ENV === 'production';
const FLASK_API_URL = isProduction 
  ? 'http://172.18.0.2:5056'      // Docker container internal IP (production)
  : 'http://localhost:8080';      // SSH tunnel (local development)
const IB_GATEWAY_URL = isProduction
  ? 'https://172.18.0.2:5055/v1/api'  // Docker container internal IP (production)
  : 'https://localhost:5055/v1/api';  // SSH tunnel (local development)

// Güvenli olmayan HTTPS istemcisi oluştur
const httpsAgent = new https.Agent({
  rejectUnauthorized: false
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { target, path } = req.query;
  
  // Log isteği
  console.log(`API Proxy isteği: ${req.method} ${target}/${path}`);
  
  // Hedef URL'yi belirle
  let targetUrl = '';
  if (target === 'flask') {
    targetUrl = `${FLASK_API_URL}/${path || ''}`;
  } else if (target === 'ibgateway') {
    targetUrl = `${IB_GATEWAY_URL}/${path || ''}`;
  } else {
    return res.status(400).json({ error: 'Geçersiz hedef. "flask" veya "ibgateway" kullanın.' });
  }

  try {
    // İsteği hedef API'ye yönlendir
    const response = await axios({
      method: req.method as string,
      url: targetUrl,
      data: req.method !== 'GET' ? req.body : undefined,
      params: req.method === 'GET' ? req.query : undefined,
      headers: {
        'Content-Type': 'application/json',
        ...req.headers,
        // Host header'ı kaldır
        host: undefined,
      },
      httpsAgent: targetUrl.startsWith('https') ? httpsAgent : undefined,
      validateStatus: () => true, // Tüm durum kodlarını kabul et
    });

    // API yanıtının durum kodunu ve verileri al
    res.status(response.status).json(response.data);
  } catch (error: any) {
    console.error('Proxy hatası:', error.message);
    res.status(500).json({ 
      error: 'Proxy hatası',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
} 