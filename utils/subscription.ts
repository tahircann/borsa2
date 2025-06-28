import { useState, useEffect } from 'react';
import { getUser, updateMembership, hasPremiumMembership } from './auth';

// Subscription status type
export type SubscriptionStatus = 'active' | 'inactive' | 'trial' | 'expired';

// Subscription plan type
export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  period: 'monthly' | 'yearly';
  description: string;
  features: string[];
  popular?: boolean;
  savings?: number;
}

export const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: 'monthly',
    name: 'Aylık Premium',
    price: 25,
    period: 'monthly',
    description: 'Tüm premium özelliklere aylık erişim',
    features: [
      'Stock Ranks (Hisse Sıralaması) erişimi',
      'Portfolio (Portföy) yönetimi',
      'Gelişmiş analiz araçları',
      'Gerçek zamanlı veriler',
      'Email desteği'
    ],
  },
  {
    id: 'yearly',
    name: 'Yıllık Premium',
    price: 240,
    originalPrice: 300,
    period: 'yearly',
    description: 'Tüm premium özelliklere yıllık erişim - %20 tasarruf',
    features: [
      'Stock Ranks (Hisse Sıralaması) erişimi',
      'Portfolio (Portföy) yönetimi',
      'Gelişmiş analiz araçları',
      'Gerçek zamanlı veriler',
      'Öncelikli email desteği',
      'Aylık rapora göre %20 tasarruf',
      'Özel yatırım önerileri'
    ],
    popular: true,
    savings: 60
  }
];

// Get subscription details for display
export const getSubscriptionDetails = () => {
  const user = getUser();
  if (!user) return null;
  
  if (user.membershipType === 'premium') {
    if (user.membershipExpiry) {
      const expiry = new Date(user.membershipExpiry);
      const now = new Date();
      const daysLeft = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      return {
        type: 'premium',
        expiryDate: expiry,
        daysLeft: Math.max(0, daysLeft),
        isExpired: now > expiry
      };
    } else {
      return {
        type: 'premium',
        isLifetime: true
      };
    }
  }
  
  return {
    type: 'free'
  };
};

// Check if specific features are available
export const checkFeatureAccess = (feature: 'stock-ranks' | 'portfolio' | 'advanced-analytics') => {
  return hasPremiumMembership();
};

// Shopier payment processing
export const processPayment = async (planId: string, paymentMethod: 'shopier' | 'card' = 'shopier'): Promise<{
  success: boolean;
  message: string;
  transactionId?: string;
  paymentHTML?: string;
}> => {
  if (paymentMethod === 'shopier') {
    // Shopier ile ödeme
    const { initiateShopierPayment, openShopierPaymentWindow } = await import('../services/shopierService');
    const { getUser } = await import('./auth');
    
    const user = getUser();
    if (!user) {
      return {
        success: false,
        message: 'Kullanıcı girişi gerekli'
      };
    }

    try {
      const paymentResult = await initiateShopierPayment({
        planId: planId as 'monthly' | 'yearly',
        userEmail: user.email,
        userName: user.username,
        userSurname: user.username, // Eğer surname yoksa username kullan
        userId: user.id
      });

      if (paymentResult.success && paymentResult.paymentHTML) {
        // Ödeme penceresini aç
        const paymentOpened = await openShopierPaymentWindow(paymentResult.paymentHTML);
        
        if (paymentOpened) {
          return {
            success: true,
            message: 'Ödeme penceresi açıldı. Lütfen ödeme işleminizi tamamlayın.',
            transactionId: paymentResult.orderId,
            paymentHTML: paymentResult.paymentHTML
          };
        } else {
          return {
            success: false,
            message: 'Ödeme penceresi açılamadı. Pop-up engelleyicinizi kontrol edin.'
          };
        }
      } else {
        return {
          success: false,
          message: paymentResult.message || 'Ödeme başlatılamadı'
        };
      }
    } catch (error) {
      console.error('Shopier payment error:', error);
      return {
        success: false,
        message: 'Ödeme işlemi başlatılırken bir hata oluştu'
      };
    }
  } else {
    // Eski mock payment (fallback)
    return new Promise((resolve) => {
      setTimeout(() => {
        const success = Math.random() > 0.1; // 90% success rate
        
        if (success) {
          const membershipType = planId === 'monthly' ? 'monthly' : 'yearly';
          const updateSuccess = updateMembership(membershipType);
          
          if (updateSuccess) {
            resolve({
              success: true,
              message: planId === 'monthly' 
                ? 'Aylık premium üyeliğiniz başarıyla aktifleştirildi!' 
                : 'Yıllık premium üyeliğiniz başarıyla aktifleştirildi!',
              transactionId: `TRX_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
            });
          } else {
            resolve({
              success: false,
              message: 'Üyelik güncellenirken bir hata oluştu. Lütfen tekrar deneyin.'
            });
          }
        } else {
          resolve({
            success: false,
            message: 'Ödeme işlemi başarısız. Lütfen kart bilgilerinizi kontrol edip tekrar deneyin.'
          });
        }
      }, 2000);
    });
  }
};

// Custom hook for subscription management
export const useSubscription = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [subscriptionDetails, setSubscriptionDetails] = useState<any>(null);

  useEffect(() => {
    // Load subscription details
    const loadSubscriptionDetails = () => {
      setLoading(true);
      
      setTimeout(() => {
        const details = getSubscriptionDetails();
        setSubscriptionDetails(details);
        setLoading(false);
      }, 500);
    };

    loadSubscriptionDetails();
    
    // Set up interval to check for expired memberships
    const interval = setInterval(() => {
      const details = getSubscriptionDetails();
      if (details?.isExpired) {
        setSubscriptionDetails(details);
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  const subscribe = async (planId: string) => {
    setLoading(true);
    
    try {
      const result = await processPayment(planId);
      
      if (result.success) {
        // Refresh subscription details
        const details = getSubscriptionDetails();
        setSubscriptionDetails(details);
      }
      
      setLoading(false);
      return result;
    } catch (error) {
      setLoading(false);
      return {
        success: false,
        message: 'Bir hata oluştu. Lütfen tekrar deneyin.'
      };
    }
  };

  const cancelSubscription = () => {
    // In a real app, this would call an API to cancel the subscription
    // For demo purposes, we'll just set it to expire at the end of current period
    const user = getUser();
    if (user && user.membershipExpiry) {
      // Mark for cancellation but keep active until expiry
      localStorage.setItem('subscriptionCanceled', 'true');
      return {
        success: true,
        message: 'Üyeliğiniz mevcut dönem sonunda iptal edilecek.'
      };
    }
    return {
      success: false,
      message: 'İptal edilecek aktif üyelik bulunamadı.'
    };
  };

  return {
    isSubscribed: hasPremiumMembership(),
    subscriptionDetails,
    loading,
    subscribe,
    cancelSubscription,
    checkFeatureAccess,
    plans: subscriptionPlans
  };
};
