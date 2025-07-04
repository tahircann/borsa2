import { useEffect, useState } from 'react';
import { useAuth } from '../utils/auth';
import { useSubscription } from '../utils/subscription';
import { FiStar, FiLock, FiUser, FiCreditCard } from 'react-icons/fi';

interface PremiumGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function PremiumGuard({ children, fallback }: PremiumGuardProps) {
  const { user, isAuthenticated, hasPremiumMembership } = useAuth();
  const { subscriptionDetails } = useSubscription();
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    // Show content if user has premium access
    setShowContent(isAuthenticated() && hasPremiumMembership());
  }, [user, isAuthenticated, hasPremiumMembership]);

  if (!isAuthenticated()) {
    return fallback || (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
            <FiUser className="h-6 w-6 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Giriş Gerekli</h2>
          <p className="text-gray-600 mb-6">
            Bu özelliğe erişim için lütfen giriş yapın.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Giriş Yap
          </button>
        </div>
      </div>
    );
  }

  if (!hasPremiumMembership()) {
    return fallback || (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 mb-4">
            <FiStar className="h-6 w-6 text-yellow-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Premium Üyelik Gerekli</h2>
          <p className="text-gray-600 mb-6">
            Bu özellik sadece premium üyelerimiz için mevcuttur. 
            Premium üyelik ile gelişmiş analiz araçları ve özel raporlara erişim sağlayın.
          </p>
          
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-900 mb-2">Premium Özellikler:</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Stock Ranks (Hisse Sıralaması)</li>
              <li>• Portfolio (Portföy) yönetimi</li>
              <li>• Gelişmiş analiz araçları</li>
              <li>• Gerçek zamanlı veriler</li>
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
              Premium Ol
            </button>
            
            <button
              onClick={() => window.history.back()}
              className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              Geri Dön
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