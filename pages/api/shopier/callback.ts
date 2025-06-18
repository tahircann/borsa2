import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const personalAccessToken = process.env.SHOPIER_PERSONAL_ACCESS_TOKEN || process.env.SHOPIER_API_KEY;
    
    if (!personalAccessToken) {
      return res.status(500).json({ message: 'Shopier Personal Access Token yapılandırılmamış' });
    }

    // Shopier'dan gelen callback verisini işle
    const { status, order_id, payment_id, amount, buyer_email } = req.body;
    
    if (status === 'success' && order_id && payment_id) {
      // Ödeme başarılı
      
      // Shopier callback'inden gelen kullanıcı ID'sini al (req.body'den)
      const userId = req.body.platform_order_id || req.body.buyer_id_nr;
      
      if (userId) {
        try {
          // Kullanıcının localStorage'ını güncelle (client-side için)
          // Bu kısım normalde veritabanı güncellemesi olacak
          const users = JSON.parse(global.localStorage?.getItem('users') || '[]');
          const userIndex = users.findIndex((u: any) => u.id === userId);
          
          if (userIndex !== -1) {
            const now = new Date();
            const membershipType = req.body.product_name?.includes('Yıllık') ? 'yearly' : 'monthly';
            const expiryDate = new Date(now);
            
            if (membershipType === 'yearly') {
              expiryDate.setFullYear(now.getFullYear() + 1);
            } else {
              expiryDate.setMonth(now.getMonth() + 1);
            }
            
            users[userIndex].membershipType = 'premium';
            users[userIndex].membershipExpiry = expiryDate.toISOString();
            
            if (typeof global !== 'undefined' && global.localStorage) {
              global.localStorage.setItem('users', JSON.stringify(users));
            }
          }
        } catch (error) {
          console.error('Error updating user membership:', error);
        }
      }
      
      console.log('Shopier payment successful:', {
        order_id,
        payment_id,
        amount,
        userId,
        status
      });
      
      res.status(200).json({
        success: true,
        message: 'Ödeme başarıyla tamamlandı',
        order_id,
        payment_id
      });
    } else {
      // Ödeme başarısız
      console.log('Shopier payment failed:', req.body);
      
      res.status(400).json({
        success: false,
        message: 'Ödeme başarısız'
      });
    }

  } catch (error) {
    console.error('Shopier callback error:', error);
    res.status(500).json({
      success: false,
      message: 'Callback işlenirken bir hata oluştu'
    });
  }
} 