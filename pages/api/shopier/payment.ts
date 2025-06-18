import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { planId, userEmail, userName, userSurname, userId } = req.body;

    // Shopier Personal Access Token (JWT)
    const personalAccessToken = process.env.SHOPIER_PERSONAL_ACCESS_TOKEN || process.env.SHOPIER_API_KEY;
    const callbackUrl = process.env.SHOPIER_CALLBACK_URL;
    const successUrl = process.env.SHOPIER_SUCCESS_URL;
    const failUrl = process.env.SHOPIER_FAIL_URL;

    if (!personalAccessToken) {
      return res.status(500).json({ message: 'Shopier Personal Access Token yapılandırılmamış' });
    }

    // JWT token kullanarak direkt API çağrısı yapacağız
    // shopier-api paketi yerine direkt REST API kullanımı

    // Plan fiyatlarını belirle
    const planPrices = {
      monthly: 25,
      yearly: 240
    };

    const amount = planPrices[planId as keyof typeof planPrices];
    if (!amount) {
      return res.status(400).json({ message: 'Geçersiz plan ID' });
    }

    // Shopier API ile ödeme sayfası oluşturma
    const orderData = {
      order_id: `ORDER_${Date.now()}_${userId}`,
      amount: amount,
      currency: 'TRY',
      product_name: planId === 'monthly' ? 'Aylık Premium Üyelik' : 'Yıllık Premium Üyelik',
      buyer_name: userName,
      buyer_surname: userSurname,
      buyer_email: userEmail,
      buyer_phone: '05555555555',
      billing_address: 'Türkiye',
      billing_city: 'İstanbul',
      billing_country: 'TR',
      billing_postcode: '34000',
      shipping_address: 'Türkiye',
      shipping_city: 'İstanbul',
      shipping_country: 'TR',
      shipping_postcode: '34000',
      callback_url: callbackUrl,
      success_url: successUrl,
      fail_url: failUrl
    };

    // Shopier form-based payment system kullanıyor, REST API değil
    // Personal Access Token ile direkt HTML form oluşturacağız
    
    try {
      // Shopier form parametreleri
      const shopierParams: Record<string, string> = {
        'API_key': personalAccessToken.split('.')[0], // JWT'nin ilk kısmı
        'website_index': '1',
        'platform_order_id': orderData.order_id,
        'product_name': orderData.product_name,
        'product_type': '0', // 0: Fiziksel ürün, 1: Dijital ürün
        'buyer_name': userName || '',
        'buyer_surname': userSurname || '',
        'buyer_email': userEmail || '',
        'buyer_phone': orderData.buyer_phone,
        'buyer_address': orderData.billing_address,
        'buyer_city': orderData.billing_city,
        'buyer_country': orderData.billing_country,
        'buyer_postcode': orderData.billing_postcode,
        'shipping_address': orderData.shipping_address,
        'shipping_city': orderData.shipping_city,
        'shipping_country': orderData.shipping_country,
        'shipping_postcode': orderData.shipping_postcode,
        'total_amount': amount.toString(),
        'currency': orderData.currency,
        'platform': 'NextJS App',
        'callback_url': callbackUrl || '',
        'OK_url': successUrl || '',
        'Fail_url': failUrl || '',
        'random_nr': Math.random().toString(36).substring(7)
      };

      // Form URL oluştur
      const formParams = new URLSearchParams(shopierParams);
      const shopierFormURL = `https://www.shopier.com/ShowProduct/api_pay4.php?${formParams.toString()}`;

      res.status(200).json({
        success: true,
        paymentURL: shopierFormURL,
        amount,
        orderId: orderData.order_id,
        message: 'Shopier payment URL generated successfully'
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