import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { FiCheck, FiHome, FiStar } from 'react-icons/fi';
import Head from 'next/head';
import Layout from '../components/Layout';

export default function SubscriptionSuccess() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    // 10 saniye sonra ana sayfaya yönlendir
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

  return (
    <>
      <Head>
        <title>Ödeme Başarılı - Borsa22</title>
        <meta name="description" content="Premium üyeliğiniz başarıyla aktifleştirildi!" />
      </Head>
      
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full space-y-8">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-green-100 mb-4">
                <FiCheck className="h-10 w-10 text-green-600" />
              </div>
              
              <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                Ödeme Başarılı!
              </h2>
              
              <p className="mt-2 text-sm text-gray-600">
                Premium üyeliğiniz başarıyla aktifleştirildi.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-center mb-4">
                <FiStar className="h-8 w-8 text-yellow-500 mr-2" />
                <span className="text-xl font-semibold text-gray-900">Premium Üye</span>
              </div>
              
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-center">
                  <FiCheck className="h-4 w-4 text-green-500 mr-2" />
                  <span>Stock Ranks erişimi</span>
                </div>
                <div className="flex items-center">
                  <FiCheck className="h-4 w-4 text-green-500 mr-2" />
                  <span>Portfolio yönetimi</span>
                </div>
                <div className="flex items-center">
                  <FiCheck className="h-4 w-4 text-green-500 mr-2" />
                  <span>Gelişmiş analiz araçları</span>
                </div>
                <div className="flex items-center">
                  <FiCheck className="h-4 w-4 text-green-500 mr-2" />
                  <span>Gerçek zamanlı veriler</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col space-y-3">
              <button
                onClick={() => router.push('/')}
                className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <FiHome className="h-4 w-4 mr-2" />
                Ana Sayfaya Dön
              </button>
              
              <div className="text-center text-sm text-gray-500">
                {countdown} saniye sonra otomatik olarak ana sayfaya yönlendirileceksiniz.
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
} 