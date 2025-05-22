import { useState, useEffect } from 'react';

// Subscription status type
export type SubscriptionStatus = 'active' | 'inactive' | 'trial';

// Subscription plan type
export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  description: string;
  features: string[];
  popular?: boolean;
}

export const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: 'basic',
    name: 'Basic',
    price: 9.99,
    description: 'Essential features for individual investors',
    features: ['Basic portfolio tracking', 'Limited charts', '5 stock analyses per month'],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 29.99,
    description: 'Advanced tools for serious investors',
    features: ['Advanced portfolio tracking', 'All charts & analytics', 'Unlimited stock analyses', 'Priority support'],
    popular: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 99.99,
    description: 'Comprehensive solution for investment firms',
    features: ['Everything in Pro', 'Team access (5 users)', 'API access', 'Dedicated support'],
  },
];

// Mock subscription check - in a real app, this would connect to a backend
export const useSubscription = () => {
  const [isSubscribed, setIsSubscribed] = useState<boolean>(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus>('inactive');
  const [plan, setPlan] = useState<string>('basic');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Simulate API call to check subscription status
    setTimeout(() => {
      // Check if there's a stored subscription status
      const storedSubscription = localStorage.getItem('subscriptionStatus');
      const storedPlan = localStorage.getItem('subscriptionPlan');
      
      if (storedSubscription) {
        setSubscriptionStatus(storedSubscription as SubscriptionStatus);
        setIsSubscribed(storedSubscription === 'active' || storedSubscription === 'trial');
      }
      
      if (storedPlan) {
        setPlan(storedPlan);
      }
      
      setLoading(false);
    }, 1000);
  }, []);

  const subscribe = (planId: string, status: SubscriptionStatus = 'active') => {
    setIsSubscribed(status === 'active' || status === 'trial');
    setSubscriptionStatus(status);
    setPlan(planId);
    localStorage.setItem('subscriptionStatus', status);
    localStorage.setItem('subscriptionPlan', planId);
  };

  const unsubscribe = () => {
    setIsSubscribed(false);
    setSubscriptionStatus('inactive');
    setPlan('basic');
    localStorage.setItem('subscriptionStatus', 'inactive');
    localStorage.setItem('subscriptionPlan', 'basic');
  };

  return {
    isSubscribed,
    subscriptionStatus,
    plan,
    subscribe,
    unsubscribe,
    loading
  };
};
