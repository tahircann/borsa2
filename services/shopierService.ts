import { getUser } from '../utils/auth';

export interface ShopierPaymentRequest {
  planId: 'monthly' | 'yearly';
  userEmail: string;
  userName: string;
  userSurname: string;
  userId: string;
}

export interface ShopierPaymentResponse {
  success: boolean;
  paymentURL?: string;
  amount?: number;
  orderId?: string;
  message?: string;
}

export const initiateShopierPayment = async (paymentData: ShopierPaymentRequest): Promise<ShopierPaymentResponse> => {
  try {
    const response = await fetch('/api/shopier/payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paymentData),
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Shopier payment initiation error:', error);
    return {
      success: false,
      message: 'Ödeme başlatılırken bir hata oluştu'
    };
  }
};

export const openShopierPaymentWindow = (paymentURL: string): Promise<boolean> => {
  return new Promise((resolve) => {
    // Shopier ödeme sayfasını yeni pencerede aç
    const paymentWindow = window.open(paymentURL, 'shopier_payment', 'width=800,height=600,scrollbars=yes,resizable=yes');
    
    if (!paymentWindow) {
      resolve(false);
      return;
    }

    // Pencere kapanışını dinle
    const checkClosed = setInterval(() => {
      if (paymentWindow.closed) {
        clearInterval(checkClosed);
        // Pencere kapandıktan sonra kullanıcının üyelik durumunu kontrol et
        setTimeout(() => {
          window.location.reload();
        }, 1000);
        resolve(true);
      }
    }, 1000);

    // 30 dakika sonra timeout
    setTimeout(() => {
      clearInterval(checkClosed);
      if (!paymentWindow.closed) {
        paymentWindow.close();
      }
      resolve(false);
    }, 30 * 60 * 1000);
  });
};

export const getShopierPlanData = (planId: 'monthly' | 'yearly') => {
  const plans = {
    monthly: {
      name: 'Aylık Premium',
      price: 25,
      description: 'Aylık premium üyelik'
    },
    yearly: {
      name: 'Yıllık Premium', 
      price: 240,
      description: 'Yıllık premium üyelik - %20 tasarruf'
    }
  };
  
  return plans[planId];
}; 