import { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { planId, userEmail, userName, userSurname, userId } = req.body;

    // Shopier API credentials - Using your provided credentials
    const apiKey = process.env.SHOPIER_API_KEY || '83caba4b067c5967d7a1077a09e91907';
    const apiSecret = process.env.SHOPIER_API_SECRET || '5ae98d8858ff0eec7ed72b0d3657268a';
    const websiteIndex = process.env.SHOPIER_WEBSITE_INDEX || '1'; // Default website index
    
    // URLs for callback and redirect
    const baseUrl = process.env.NODE_ENV === 'production' 
      ? 'https://esenglobalinvest.com'
      : 'http://localhost:3000';
    
    const callbackUrl = `${baseUrl}/api/shopier/callback`;
    const successUrl = `${baseUrl}/subscription-success`;
    const failUrl = `${baseUrl}/subscription-failed`;

    if (!apiKey || !apiSecret) {
      return res.status(500).json({ message: 'Shopier API bilgileri eksik' });
    }

    // Plan fiyatlarını belirle
    const planPrices = {
      monthly: 25,
      yearly: 240
    };

    const amount = planPrices[planId as keyof typeof planPrices];
    if (!amount) {
      return res.status(400).json({ message: 'Geçersiz plan ID' });
    }

    try {
      // Unique order ID
      const platformOrderId = `BORSA2_${Date.now()}_${userId}`;
      const productName = planId === 'monthly' ? 'Aylık Premium Üyelik' : 'Yıllık Premium Üyelik';
      
      // Currency mapping: TRY=0, USD=1, EUR=2
      const currency = 0; // TRY
      
      // Random number for signature
      const randomNr = Math.floor(Math.random() * 900000) + 100000; // 6 digit random
      
      // Create signature according to Shopier documentation
      const signatureData = randomNr.toString() + platformOrderId + amount.toString() + currency.toString();
      const signature = crypto.createHmac('SHA256', apiSecret).update(signatureData).digest('base64');

      // Shopier parameters according to official module format
      const shopierParams: Record<string, string> = {
        'API_key': apiKey,
        'website_index': websiteIndex,
        'platform_order_id': platformOrderId,
        'product_name': productName,
        'product_type': '1', // 1: Digital product
        'buyer_name': userName || '',
        'buyer_surname': userSurname || '',
        'buyer_email': userEmail || '',
        'buyer_account_age': '0',
        'buyer_id_nr': userId || '0',
        'buyer_phone': '05555555555',
        'billing_address': 'Türkiye',
        'billing_city': 'İstanbul',
        'billing_country': 'Turkey',
        'billing_postcode': '34000',
        'shipping_address': 'Türkiye',
        'shipping_city': 'İstanbul', 
        'shipping_country': 'Turkey',
        'shipping_postcode': '34000',
        'total_order_value': amount.toString(),
        'currency': currency.toString(),
        'platform': '1', // 1: Custom platform
        'is_in_frame': '0',
        'current_language': '1', // 0: Turkish, 1: English
        'modul_version': '2.0.0',
        'random_nr': randomNr.toString(),
        'signature': signature
      };

      // Create form HTML for auto-submit
      const formFields = Object.entries(shopierParams)
        .map(([key, value]) => `<input type="hidden" name="${key}" value="${value}">`)
        .join('\n');

      const paymentFormHTML = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Shopier Ödeme Yönlendirme</title>
          <meta charset="utf-8">
        </head>
        <body>
          <div style="text-align: center; padding: 50px; font-family: Arial, sans-serif;">
            <h3>Shopier Ödeme Sayfasına Yönlendiriliyorsunuz...</h3>
            <p>Lütfen bekleyiniz...</p>
            <form id="shopierForm" method="POST" action="https://www.shopier.com/ShowProduct/api_pay4.php">
              ${formFields}
            </form>
          </div>
          <script>
            setTimeout(function() {
              document.getElementById('shopierForm').submit();
            }, 1000);
          </script>
        </body>
        </html>
      `;

      res.status(200).json({
        success: true,
        paymentHTML: paymentFormHTML,
        paymentURL: `https://www.shopier.com/ShowProduct/api_pay4.php`,
        amount,
        orderId: platformOrderId,
        message: 'Shopier payment form generated successfully',
        formParams: shopierParams
      });
      
    } catch (error) {
      console.error('Shopier Form Generation Error:', error);
      res.status(500).json({
        success: false,
        message: 'Shopier ödeme formu oluşturulurken hata oluştu'
      });
    }

  } catch (error) {
    console.error('Shopier payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Ödeme başlatılırken bir hata oluştu'
    });
  }
} 