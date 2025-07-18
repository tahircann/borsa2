import { useEffect, useState } from 'react';
import { useAuth } from '../utils/auth';
import { useSubscription } from '../utils/subscription';
import { FiStar, FiLock, FiUser, FiCreditCard } from 'react-icons/fi';
import BlurOverlay from './BlurOverlay';

interface PremiumGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  useBlurOverlay?: boolean; // New prop to enable blur overlay instead of full blocking
  blurMessage?: string;
}

export default function PremiumGuard({ 
  children, 
  fallback, 
  useBlurOverlay = true, // Default to blur overlay
  blurMessage = "Upgrade to access premium features"
}: PremiumGuardProps) {
  const { user, isAuthenticated, hasPremiumMembership } = useAuth();
  const { subscriptionDetails } = useSubscription();
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    // Show content if user has premium access
    setShowContent(isAuthenticated() && hasPremiumMembership());
  }, [user, isAuthenticated, hasPremiumMembership]);

  if (!isAuthenticated()) {
    // Show blur overlay for non-logged-in users instead of login prompt
    if (useBlurOverlay) {
      return (
        <div className="relative">
          {children}
          <BlurOverlay 
            message="Login and upgrade to access premium features"
            onUpgrade={() => {
              const event = new CustomEvent('openLoginModal');
              document.dispatchEvent(event);
            }}
            visiblePercent={15} // Show only 15% of content (85% blurred)
          />
        </div>
      );
    }
    
    return fallback || (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
            <FiUser className="h-6 w-6 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Login Required</h2>
          <p className="text-gray-600 mb-6">
            Please log in to access this feature.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Log In
          </button>
        </div>
      </div>
    );
  }

  if (!hasPremiumMembership()) {
    // Use blur overlay if enabled, otherwise use full blocking
    if (useBlurOverlay) {
      return (
        <div className="relative">
          {children}
          <BlurOverlay 
            message={blurMessage}
            onUpgrade={() => {
              const event = new CustomEvent('openSubscriptionModal');
              document.dispatchEvent(event);
            }}
            visiblePercent={15} // Show only 15% of content (85% blurred)
          />
        </div>
      );
    }

    // Fallback to full blocking for critical features
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
              onClick={() => {
                // Trigger subscription modal
                const event = new CustomEvent('openSubscriptionModal');
                document.dispatchEvent(event);
              }}
              className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <FiCreditCard className="h-4 w-4 mr-2" />
              Get Premium
            </button>
            
            <button
              onClick={() => window.history.back()}
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