import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { FiX, FiHome, FiRefreshCw } from 'react-icons/fi';
import Head from 'next/head';
import Layout from '../components/Layout';

export default function SubscriptionFailed() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(15);

  useEffect(() => {
    // Redirect to homepage after 15 seconds
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
  }, [router]);

  const handleRetry = () => {
    // Redirect to homepage to open premium modal
    router.push('/?showSubscription=true');
  };

  return (
    <>
      <Head>
        <title>Payment Failed - Esen Global Investment</title>
        <meta name="description" content="Your payment could not be completed." />
      </Head>
      
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full space-y-8">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-red-100 mb-4">
                <FiX className="h-10 w-10 text-red-600" />
              </div>
              
              <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                Payment Failed
              </h2>
              
              <p className="mt-2 text-sm text-gray-600">
                Your payment could not be completed. Please try again.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Possible Reasons:
              </h3>
              
              <div className="space-y-2 text-sm text-gray-600">
                <div>• There may be an error in your card information</div>
                <div>• Your card may not have sufficient credit limit</div>
                <div>• The transaction may have been declined by your bank</div>
                <div>• There may have been an internet connection problem</div>
              </div>
              
              <div className="mt-4 p-3 bg-blue-50 rounded-md">
                <p className="text-sm text-blue-800">
                  If the problem persists, please contact your bank or try a different card.
                </p>
              </div>
            </div>

            <div className="flex flex-col space-y-3">
              <button
                onClick={handleRetry}
                className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <FiRefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </button>
              
              <button
                onClick={() => router.push('/')}
                className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
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