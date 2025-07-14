import { NextApiRequest, NextApiResponse } from 'next';
import { gumroadService } from '@/services/gumroadService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, licenseKey, productId } = req.body;

    if (!email && !licenseKey) {
      return res.status(400).json({ 
        error: 'Either email or license key is required' 
      });
    }

    let hasAccess = false;
    let subscriptionInfo = null;

    // Check by license key if provided
    if (licenseKey && productId) {
      const verification = await gumroadService.verifyLicense(licenseKey, productId);
      hasAccess = verification.success;
      subscriptionInfo = verification;
    }

    // Check by email if license verification failed or not provided
    if (!hasAccess && email) {
      // Get all sales for this email
      const sales = await gumroadService.getSales();
      const userSales = sales.filter(sale => 
        sale.email.toLowerCase() === email.toLowerCase()
      );

      // Check if user has any active purchases
      hasAccess = userSales.length > 0;
      
      if (hasAccess) {
        subscriptionInfo = {
          success: true,
          email: email,
          purchases: userSales.map(sale => ({
            productId: sale.id,
            productName: sale.product_name,
            purchaseDate: sale.created_at,
            price: sale.price
          }))
        };
      }
    }

    return res.status(200).json({
      hasAccess,
      email,
      subscriptionInfo,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Subscription verification error:', error);
    return res.status(500).json({ 
      error: 'Verification failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
