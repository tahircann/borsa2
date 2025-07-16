import { NextApiRequest, NextApiResponse } from 'next';
import { gumroadService } from '@/services/gumroadService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, returnUrl } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Get products to find the premium subscription product
    const products = await gumroadService.getProducts();
    console.log('📦 Available products:', products.map(p => ({ name: p.name, price: p.formatted_price, isSubscription: p.is_tiered_membership })));
    
    // Find the premium subscription product (highest price subscription)
    const subscriptionProducts = products.filter(p => p.is_tiered_membership);
    const premiumProduct = subscriptionProducts.find(p => 
      p.name.toLowerCase().includes('premium') || p.price >= 20
    ) || subscriptionProducts[0]; // Fallback to first subscription if no premium found

    if (!premiumProduct) {
      return res.status(404).json({ error: 'No premium subscription product found' });
    }

    console.log('💎 Selected premium product:', premiumProduct.name, premiumProduct.formatted_price);

    // Generate payment link for premium product only
    const paymentLink = gumroadService.getPaymentLink(
      premiumProduct.id, 
      email,
      returnUrl || `${req.headers.origin || 'http://localhost:3000'}/subscription-success`
    );

    return res.status(200).json({
      success: true,
      paymentUrl: paymentLink,
      productId: premiumProduct.id,
      productName: premiumProduct.name,
      price: premiumProduct.formatted_price
    });

  } catch (error) {
    console.error('Gumroad payment creation error:', error);
    return res.status(500).json({ 
      error: 'Failed to create payment',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
