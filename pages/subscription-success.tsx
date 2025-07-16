import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { FiCheck, FiHome, FiStar } from 'react-icons/fi';
import Head from 'next/head';
import Layout from '../components/Layout';
import { useAuth } from '../utils/auth';

export default function SubscriptionSuccess() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(10);
  const { refreshMembershipFromServer } = useAuth();

  useEffect(() => {
    // Refresh membership status when user returns from Gumroad
    const refreshMembership = async () => {
      try {
        console.log('🔄 Refreshing membership status after Gumroad purchase...');
        await refreshMembershipFromServer();
        
        // Trigger auth state change event to update UI
        window.dispatchEvent(new Event('authStateChange'));
        
        console.log('✅ Membership status refreshed');
      } catch (error) {
        console.error('❌ Failed to refresh membership:', error);
      }
    };
    
    // Check URL parameters for purchase confirmation
    const urlParams = new URLSearchParams(window.location.search);
    const purchaseSuccess = urlParams.get('purchase') === 'success';
    const fromGumroad = urlParams.get('from') === 'gumroad';
    
    if (purchaseSuccess || fromGumroad) {
      console.log('🎉 Purchase detected from URL parameters - refreshing membership');
    }
    
    // Refresh immediately and after delays to ensure sync
    refreshMembership();
    setTimeout(refreshMembership, 2000);
    setTimeout(refreshMembership, 5000);
    
    // Redirect to homepage after 10 seconds
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push('/');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router, refreshMembershipFromServer]);

  return (
    <>
      <Head>
        <title>Payment Successful - Esen Global Investment</title>
        <meta name="description" content="Your premium membership has been successfully activated!" />
      </Head>
      
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full space-y-8">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-green-100 mb-4">
                <FiCheck className="h-10 w-10 text-green-600" />
              </div>
              
              <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                Payment Successful!
              </h2>
              
              <p className="mt-2 text-sm text-gray-600">
                Your premium membership has been successfully activated.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-center mb-4">
                <FiStar className="h-8 w-8 text-yellow-500 mr-2" />
                <span className="text-xl font-semibold text-gray-900">Premium Member</span>
              </div>
              
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-center">
                  <FiCheck className="h-4 w-4 text-green-500 mr-2" />
                  <span>Stock Ranks access</span>
                </div>
                <div className="flex items-center">
                  <FiCheck className="h-4 w-4 text-green-500 mr-2" />
                  <span>Portfolio management</span>
                </div>
                <div className="flex items-center">
                  <FiCheck className="h-4 w-4 text-green-500 mr-2" />
                  <span>Advanced analysis tools</span>
                </div>
                <div className="flex items-center">
                  <FiCheck className="h-4 w-4 text-green-500 mr-2" />
                  <span>Real-time data</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col space-y-3">
              <button
                onClick={() => router.push('/')}
                className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <FiHome className="h-4 w-4 mr-2" />
                Return to Homepage
              </button>
              
              <div className="text-center text-sm text-gray-500">
                You will be automatically redirected to the homepage in {countdown} seconds.
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
}