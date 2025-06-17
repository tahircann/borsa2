import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import Layout from '@/components/Layout'
import ErrorBoundary from '@/components/ErrorBoundary'
import { useEffect, createContext, useState } from 'react'
import { initMembershipChecker } from '../utils/membershipChecker'

export type Language = 'en' | 'tr';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
}

export const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {}
});

export default function App({ Component, pageProps }: AppProps) {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    // Initialize membership checker on app startup
    if (typeof window !== 'undefined') {
      const cleanup = initMembershipChecker();
      
      // Load saved language or default to English
      const savedLanguage = localStorage.getItem('language') as Language;
      if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'tr')) {
        setLanguageState(savedLanguage);
      }
      
      // Cleanup on unmount
      return cleanup;
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('language', lang);
    }
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      <Layout>
        <ErrorBoundary>
          <Component {...pageProps} />
        </ErrorBoundary>
      </Layout>
    </LanguageContext.Provider>
  )
}