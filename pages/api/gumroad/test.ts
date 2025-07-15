import { NextApiRequest, NextApiResponse } from 'next';
import { gumroadService } from '@/services/gumroadService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('🧪 Testing Gumroad API connection...');
    
    // Try to get products - this is a simple test that should work with valid credentials
    const products = await gumroadService.getProducts();
    
    console.log('✅ Gumroad API test successful');
    
    return res.status(200).json({
      success: true,
      message: 'Gumroad API connection successful',
      productsCount: products.length,
      products: products.map(p => ({
        id: p.id,
        name: p.name,
        price: p.formatted_price,
        isSubscription: p.is_tiered_membership
      }))
    });

  } catch (error) {
    console.error('❌ Gumroad API test failed:', error);
    
    return res.status(500).json({ 
      success: false,
      error: 'Gumroad API test failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      details: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
}
