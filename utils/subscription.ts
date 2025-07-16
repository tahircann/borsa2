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
    name: 'Monthly Premium',
    price: 25,
    period: 'monthly',
    description: 'Monthly access to all premium features',
    features: [
      'Stock Ranks access',
      'Portfolio management',
      'Advanced analysis tools',
      'Real-time data',
      'Email support'
    ],
  },
  {
    id: 'yearly',
    name: 'Yearly Premium',
    price: 240,
    originalPrice: 300,
    period: 'yearly',
    description: 'Yearly access to all premium features - 20% savings',
    features: [
      'Stock Ranks access',
      'Portfolio management',
      'Advanced analysis tools',
      'Real-time data',
      'Priority email support',
      '20% savings compared to monthly',
      'Exclusive investment recommendations'
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

// Gumroad payment processing
export const processPayment = async (planId: string, paymentMethod: 'gumroad' | 'card' = 'gumroad'): Promise<{
  success: boolean;
  message: string;
  transactionId?: string;
  paymentUrl?: string;
}> => {
  if (paymentMethod === 'gumroad') {
    // Gumroad ile ödeme
    const { getUser } = await import('./auth');
    
    const user = getUser();
    if (!user) {
      return {
        success: false,
        message: 'User login required'
      };
    }

    try {
      const response = await fetch('/api/gumroad/payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: user.email,
          returnUrl: window.location.origin + '/subscription-success'
        }),
      });

      const result = await response.json();

      if (result.success && result.paymentUrl) {
        // Ödeme sayfasına yönlendir
        window.open(result.paymentUrl, '_blank');
        
        return {
          success: true,
          message: 'You are being redirected to the payment page. Please complete your payment.',
          transactionId: result.productId,
          paymentUrl: result.paymentUrl
        };
      } else {
        return {
          success: false,
          message: result.message || 'Payment could not be initiated'
        };
      }
    } catch (error) {
      console.error('Gumroad payment error:', error);
      return {
        success: false,
        message: 'An error occurred while initiating payment'
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
                ? 'Your monthly premium membership has been successfully activated!' 
                : 'Your yearly premium membership has been successfully activated!',
              transactionId: `TRX_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
            });
          } else {
            resolve({
              success: false,
              message: 'An error occurred while updating membership. Please try again.'
            });
          }
        } else {
          resolve({
            success: false,
            message: 'Payment failed. Please check your card information and try again.'
          });
        }
      }, 2000);
    });
  }
};

// Check membership status from server API
const checkMembershipFromServer = async (email: string): Promise<{ type: 'free' | 'premium', expiry?: string, isActive: boolean }> => {
  try {
    const response = await fetch(`/api/membership/update?email=${encodeURIComponent(email)}`);
    const data = await response.json();
    
    return {
      type: data.membershipType || 'free',
      expiry: data.expiry,
      isActive: data.isActive || false
    };
  } catch (error) {
    console.error('Failed to check membership from server:', error);
    return { type: 'free', isActive: false };
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
        message: 'An error occurred. Please try again.'
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
        message: 'Your membership will be cancelled at the end of the current period.'
      };
    }
    return {
      success: false,
      message: 'No active membership found to cancel.'
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
