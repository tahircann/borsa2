import { useEffect, useState } from 'react';
import { useAuth } from '../utils/auth';
import { useSubscription } from '../utils/subscription';
import { FiStar, FiLock, FiUser, FiCreditCard, FiArrowLeft } from 'react-icons/fi';
import { useRouter } from 'next/router';
import BlurOverlay from './BlurOverlay';

interface PremiumGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  useBlurOverlay?: boolean;
  blurMessage?: string;
}

export default function PremiumGuard({ 
  children, 
  fallback, 
  useBlurOverlay = true,
  blurMessage = "Upgrade to access premium features"
}: PremiumGuardProps) {
  const { user, isAuthenticated, hasPremiumMembership } = useAuth();
  const { subscriptionDetails } = useSubscription();
  const [showContent, setShowContent] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setShowContent(isAuthenticated() && hasPremiumMembership());
  }, [user, isAuthenticated, hasPremiumMembership]);

  const handleUpgrade = () => {
    const event = new CustomEvent('openSubscriptionModal');
    document.dispatchEvent(event);
  };

  const handleLogin = () => {
    const event = new CustomEvent('openLoginModal');
    document.dispatchEvent(event);
  };

  const handleGoBack = () => {
    router.back();
  };

  if (!isAuthenticated()) {
    if (useBlurOverlay) {
      return (
        <BlurOverlay 
          message="Log in to access full content and premium features"
          onUpgrade={handleLogin}
          visiblePercent={25}
        >
          {children}
        </BlurOverlay>
      );
    }
    
    return fallback || (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
            <FiUser className="h-6 w-6 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Login Required</h2>
          <p className="text-gray-600 mb-6">Please log in to access this feature.</p>
          <button
            onClick={handleLogin}
            className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Log In
          </button>
        </div>
      </div>
    );
  }

  if (!hasPremiumMembership()) {
    if (useBlurOverlay) {
      return (
        <div className="relative min-h-screen">
          {/* Show partial content with blur */}
          <div className="relative">
            <div 
              className="filter blur-sm pointer-events-none select-none"
              style={{ 
                maxHeight: '300px',
                overflow: 'hidden'
              }}
            >
              {children}
            </div>
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/80 to-white"></div>
          </div>

          {/* Premium upgrade section */}
          <div className="bg-white py-12 px-6 text-center">
            <div className="max-w-md mx-auto">
              <div className="inline-flex items-center justify-center rounded-full bg-yellow-100 p-3 mx-auto mb-4">
                <FiStar className="h-6 w-6 text-yellow-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Premium Content</h2>
              <p className="text-gray-600 mb-6">{blurMessage}</p>
              
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-gray-900 mb-2">Premium Features:</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Full portfolio analytics</li>
                  <li>• Advanced stock rankings</li>
                  <li>• Copy trading features</li>
                  <li>• Real-time market data</li>
                </ul>
              </div>
              
              <div className="space-y-3">
                <button
                  onClick={handleUpgrade}
                  className="w-full flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  <FiCreditCard className="mr-2 h-5 w-5" />
                  Upgrade to Premium
                </button>
                
                <button 
                  onClick={handleGoBack}
                  className="w-full flex items-center justify-center px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  <FiArrowLeft className="mr-2 h-4 w-4" />
                  Go Back
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return fallback || (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 mb-4">
            <FiStar className="h-6 w-6 text-yellow-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Premium Membership Required</h2>
          <p className="text-gray-600 mb-6">
            This feature is only available to our premium members. 
            Get premium membership to access advanced analysis tools and exclusive reports.
          </p>
          
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-900 mb-2">Premium Features:</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Stock Ranks</li>
              <li>• Portfolio management</li>
              <li>• Advanced analysis tools</li>
              <li>• Real-time data</li>
            </ul>
          </div>
          
          <div className="space-y-3">
            <button
              onClick={handleUpgrade}
              className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <FiCreditCard className="h-4 w-4 mr-2" />
              Get Premium
            </button>
            
            <button
              onClick={handleGoBack}
              className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

// Higher-order component version
export function withPremiumGuard<T extends {}>(
  WrappedComponent: React.ComponentType<T>,
  fallback?: React.ReactNode
) {
  return function PremiumGuardedComponent(props: T) {
    return (
      <PremiumGuard fallback={fallback}>
        <WrappedComponent {...props} />
      </PremiumGuard>
    );
  };
} 