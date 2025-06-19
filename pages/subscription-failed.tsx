import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { FiX, FiHome, FiRefreshCw } from 'react-icons/fi';
import Head from 'next/head';
import Layout from '../components/Layout';

export default function SubscriptionFailed() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(15);

  useEffect(() => {
    // 15 saniye sonra ana sayfaya yönlendir
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
    // Premium modal'ı açmak için ana sayfaya yönlendir
    router.push('/?showSubscription=true');
  };

  return (
    <>
      <Head>
        <title>Ödeme Başarısız - Esen Global Investment</title>
        <meta name="description" content="Ödeme işleminiz tamamlanamadı." />
      </Head>
      
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full space-y-8">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-red-100 mb-4">
                <FiX className="h-10 w-10 text-red-600" />
              </div>
              
              <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                Ödeme Başarısız
              </h2>
              
              <p className="mt-2 text-sm text-gray-600">
                Ödeme işleminiz tamamlanamadı. Lütfen tekrar deneyin.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Olası Nedenler:
              </h3>
              
              <div className="space-y-2 text-sm text-gray-600">
                <div>• Kart bilgilerinizde hata olabilir</div>
                <div>• Kartınızda yeterli limit bulunmayabilir</div>
                <div>• Banka tarafından işlem reddedilmiş olabilir</div>
                <div>• İnternet bağlantınızda sorun yaşanmış olabilir</div>
              </div>
              
              <div className="mt-4 p-3 bg-blue-50 rounded-md">
                <p className="text-sm text-blue-800">
                  Sorun devam ederse, lütfen bankanızla iletişime geçin veya farklı bir kart deneyin.
                </p>
              </div>
            </div>

            <div className="flex flex-col space-y-3">
              <button
                onClick={handleRetry}
                className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <FiRefreshCw className="h-4 w-4 mr-2" />
                Tekrar Dene
              </button>
              
              <button
                onClick={() => router.push('/')}
                className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
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