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

    // Get products to find subscription products
    const products = await gumroadService.getProducts();
    const subscriptionProduct = products.find(p => p.is_tiered_membership);

    if (!subscriptionProduct) {
      return res.status(404).json({ error: 'No subscription product found' });
    }

    // Generate payment link
    const paymentLink = gumroadService.getPaymentLink(subscriptionProduct.id, email);

    return res.status(200).json({
      success: true,
      paymentUrl: paymentLink,
      productId: subscriptionProduct.id,
      productName: subscriptionProduct.name,
      price: subscriptionProduct.formatted_price
    });

  } catch (error) {
    console.error('Gumroad payment creation error:', error);
    return res.status(500).json({ 
      error: 'Failed to create payment',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
