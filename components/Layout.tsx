import React, { ReactNode, useState, useEffect } from 'react'
import Head from 'next/head'
import Navbar from './Navbar'
import Sidebar from './Sidebar'
import Script from 'next/script'
import { useSubscription } from '../utils/subscription'
import { useAuth } from '../utils/auth'
import { FiMenu } from 'react-icons/fi'

// Create a context for subscription status
export const SubscriptionContext = React.createContext<{
  isSubscribed: boolean;
  subscriptionDetails: any;
  loading: boolean;
  subscribe: (planId: string) => Promise<{ success: boolean; message: string; transactionId?: string; }>;
  cancelSubscription: () => { success: boolean; message: string; };
  checkFeatureAccess: (feature: 'stock-ranks' | 'portfolio' | 'advanced-analytics') => boolean;
  plans: any[];
}>({
  isSubscribed: false,
  subscriptionDetails: null,
  loading: true,
  subscribe: async () => ({ success: false, message: '' }),
  cancelSubscription: () => ({ success: false, message: '' }),
  checkFeatureAccess: () => false,
  plans: []
});

type LayoutProps = {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const subscription = useSubscription();
  const { user } = useAuth();
  const isAdmin = user?.isAdmin === true;
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  
  return (
    <>
      <Head>
        <title>Esen Global Investment - Trading Platform</title>
        <meta name="description" content="Interactive Brokers trading platform" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      {/* Hesap konfigürasyonu */}
      <Script src="/account-config.js" strategy="beforeInteractive" />
      
      <SubscriptionContext.Provider value={subscription}>
        <div className="flex min-h-screen bg-gray-50 relative">
          {/* Hamburger menu button for admin - always visible */}
          {isAdmin && (
            <button 
              onClick={toggleSidebar} 
              className="fixed left-4 top-20 z-50 bg-blue-600 text-white p-3 rounded-md shadow-lg hover:bg-blue-700 transition-colors"
              aria-label="Toggle admin menu"
            >
              <FiMenu className="h-6 w-6" />
            </button>
          )}
          
          {/* Admin sidebar overlay - only visible when sidebar is open */}
          {isAdmin && sidebarOpen && (
            <div 
              className="fixed inset-0 bg-gray-600 bg-opacity-50 z-20" 
              onClick={toggleSidebar}
              aria-hidden="true"
            ></div>
          )}
          
          {/* Admin sidebar */}
          {isAdmin && (
            <div 
              className={`
                transform transition-transform duration-300 ease-in-out fixed
                left-0 top-0 h-full z-30 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
              `}
            >
              <Sidebar onClose={toggleSidebar} />
            </div>
          )}
          <div className="flex-1">
            <Navbar isAdmin={isAdmin} />
            <main className="container mx-auto px-4 py-6">
              {children}
            </main>
          </div>
        </div>
      </SubscriptionContext.Provider>
    </>
  )
}