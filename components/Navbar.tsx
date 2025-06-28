import React, { useState, useEffect, useContext } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { FiBell, FiUser, FiLogOut, FiCreditCard, FiMenu, FiX, FiBarChart2, FiPieChart, FiTrendingUp, FiSearch, FiStar, FiUserPlus, FiSettings, FiCalendar } from 'react-icons/fi';
import { useAuth } from '../utils/auth';
import { useSubscription } from '../utils/subscription';
import { LanguageContext } from '../pages/_app';

interface NavbarProps {
  isAdmin?: boolean;
}

import LoginModal from './LoginModal';
import RegisterModal from './RegisterModal';
import SubscriptionModal from './SubscriptionModal';

export default function Navbar({ isAdmin }: NavbarProps) {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const { user, logout, isAuthenticated, hasPremiumMembership } = useAuth();
  const { isSubscribed, subscriptionDetails, loading: subscriptionLoading } = useSubscription();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();
  const { language, setLanguage } = useContext(LanguageContext);
  const [forceUpdate, setForceUpdate] = useState(0);

  // Remove redundant local state - use auth hook directly
  const isAuth = isAuthenticated();
  const isPremium = hasPremiumMembership();

  // Listen for auth state changes
  useEffect(() => {
    const handleAuthChange = () => {
      setForceUpdate(prev => prev + 1);
    };

    window.addEventListener('authStateChange', handleAuthChange);
    return () => window.removeEventListener('authStateChange', handleAuthChange);
  }, []);

  // Handle custom events for modal switching
  useEffect(() => {
    const handleOpenRegister = () => setShowRegisterModal(true);
    const handleOpenLogin = () => setShowLoginModal(true);

    document.addEventListener('openRegisterModal', handleOpenRegister);
    document.addEventListener('openLoginModal', handleOpenLogin);

    return () => {
      document.removeEventListener('openRegisterModal', handleOpenRegister);
      document.removeEventListener('openLoginModal', handleOpenLogin);
    };
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const navLinks = [
    { 
      href: '/portfolio', 
      label: language === 'en' ? 'Portfolio' : 'Portföy', 
      premium: true 
    },
    { 
      href: '/stock-ranks', 
      label: language === 'en' ? 'Stock Rankings' : 'Hisse Sıralaması', 
      premium: true 
    },
    // { href: '/trades', label: 'Trade History', premium: false }, // Removed transaction history
    // { href: '/trade-bot', label: 'Trade Bot', premium: false }, // Deactivated trade bot
    { 
      href: '/performance', 
      label: language === 'en' ? 'Performance' : 'Performans', 
      premium: false 
    },
    { 
      href: '/profile', 
      label: language === 'en' ? 'Profile' : 'Profil', 
      premium: false,
      authRequired: true  // Only show when logged in
    },
    { 
      href: '/about', 
      label: language === 'en' ? 'About' : 'Hakkında', 
      premium: false 
    },
  ];

  const handlePremiumFeatureClick = (href: string) => {
    if (!isAuth) {
      setShowLoginModal(true);
      return;
    }
    
    if (!isPremium) {
      setShowSubscriptionModal(true);
      return;
    }
    
    router.push(href);
  };

  const handleLinkClick = (link: any) => {
    if (link.authRequired && !isAuth) {
      setShowLoginModal(true);
      return;
    }
    
    if (link.premium) {
      handlePremiumFeatureClick(link.href);
    } else {
      router.push(link.href);
    }
  };

  const formatSubscriptionStatus = () => {
    if (!subscriptionDetails) return '';
    
    if (subscriptionDetails.type === 'premium') {
      if (subscriptionDetails.isLifetime) {
        return language === 'en' ? 'Lifetime Premium' : 'Süresiz Premium';
      } else if (subscriptionDetails.daysLeft !== undefined) {
        return language === 'en' 
          ? `Premium - ${subscriptionDetails.daysLeft} days left`
          : `Premium - ${subscriptionDetails.daysLeft} gün kaldı`;
      }
    }
    
    return language === 'en' ? 'Free' : 'Ücretsiz';
  };

  return (
    <>
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left side: Logo and Desktop Nav Links */}
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold text-slate-800 hover:text-blue-700 transition-colors flex items-center">
                <span className="text-blue-600 mr-1">Esen Global</span> Investment
              </Link>
              <div className="hidden md:ml-10 md:flex md:items-baseline md:space-x-6">
                {navLinks
                  .filter(link => !link.authRequired || isAuth) // Filter out auth-required links when not logged in
                  .map((link) => (
                  <div key={link.label} className="relative">
                    {link.premium ? (
                      <button
                        onClick={() => handleLinkClick(link)}
                        className={`flex items-center px-1 py-2 text-sm font-medium transition-colors border-b-2 border-transparent hover:border-blue-600 ${
                          router.pathname === link.href 
                            ? 'text-blue-600 border-blue-600' 
                            : 'text-slate-700 hover:text-blue-600'
                        }`}
                      >
                        {link.label}
                        {!isPremium && (
                          <FiStar className="ml-1 h-3 w-3 text-yellow-500" />
                        )}
                      </button>
                    ) : (
                      <button
                        onClick={() => handleLinkClick(link)}
                        className={`text-slate-700 hover:text-blue-600 px-1 py-2 text-sm font-medium transition-colors border-b-2 border-transparent hover:border-blue-600 ${
                          router.pathname === link.href 
                            ? 'text-blue-600 border-blue-600' 
                            : ''
                        }`}
                      >
                        {link.label}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Right side: Language, Icons, Auth, Subscribe */}
            <div className="hidden md:flex items-center space-x-4">
              {/* Language Switcher */}
              <div className="flex items-center space-x-1 bg-gray-100 rounded-md p-1">
                <button
                  onClick={() => setLanguage('en')}
                  className={`px-2 py-1 text-xs font-medium rounded transition-colors ${
                    language === 'en' 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  EN
                </button>
                <button
                  onClick={() => setLanguage('tr')}
                  className={`px-2 py-1 text-xs font-medium rounded transition-colors ${
                    language === 'tr' 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  TR
                </button>
              </div>
              {isAuth ? (
                <div className="flex items-center space-x-4">
                  {/* Subscription Status */}
                  {isPremium ? (
                    <div className="flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-gradient-to-r from-yellow-50 to-yellow-100 text-yellow-800 border border-yellow-200">
                      <FiStar className="h-3 w-3 mr-1" />
                      {formatSubscriptionStatus()}
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowSubscriptionModal(true)}
                      className="flex items-center px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-lg transition-all duration-200"
                    >
                      <FiStar className="h-4 w-4 mr-1" />
                      {language === 'en' ? 'Get Premium' : 'Premium Ol'}
                    </button>
                  )}
                  
                  {/* User Menu */}
                  <div className="flex items-center space-x-2">
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-700">
                        {user?.username}
                      </div>
                      {user?.isAdmin && (
                        <div className="text-xs text-blue-600">Admin</div>
                      )}
                    </div>
                    <button
                      onClick={handleLogout}
                      className="p-2 text-gray-500 hover:text-red-600 focus:outline-none transition-colors rounded-lg hover:bg-red-50"
                      title={language === 'en' ? 'Logout' : 'Çıkış Yap'}
                    >
                      <FiLogOut className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setShowLoginModal(true)}
                    className="text-sm font-medium text-slate-700 hover:text-blue-600 px-3 py-2 transition-colors"
                  >
                    {language === 'en' ? 'Login' : 'Giriş Yap'}
                  </button>
                  <button
                    onClick={() => setShowRegisterModal(true)}
                    className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                  >
                    <FiUserPlus className="h-4 w-4 mr-1" />
                    {language === 'en' ? 'Register' : 'Kayıt Ol'}
                  </button>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="-mr-2 flex md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 text-gray-500 hover:text-blue-600 focus:outline-none transition-colors"
                aria-controls="mobile-menu"
                aria-expanded="false"
              >
                <span className="sr-only">{language === 'en' ? 'Open main menu' : 'Ana menüyü aç'}</span>
                {mobileMenuOpen ? (
                  <FiX className="block h-6 w-6" aria-hidden="true" />
                ) : (
                  <FiMenu className="block h-6 w-6" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100" id="mobile-menu">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {navLinks
                .filter(link => !link.authRequired || isAuth) // Filter out auth-required links when not logged in
                .map((link) => (
                <div key={link.label}>
                  {link.premium ? (
                    <button
                      onClick={() => {
                        handleLinkClick(link);
                        setMobileMenuOpen(false);
                      }}
                      className="flex items-center justify-between w-full text-left px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                    >
                      <span>{link.label}</span>
                      {!isPremium && <FiStar className="h-4 w-4 text-yellow-500" />}
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        handleLinkClick(link);
                        setMobileMenuOpen(false);
                      }}
                      className="text-slate-700 hover:text-blue-600 hover:bg-blue-50 block px-3 py-2 rounded-md text-base font-medium transition-colors w-full text-left"
                    >
                      {link.label}
                    </button>
                  )}
                </div>
              ))}
            </div>
            
            {/* Mobile Auth Section */}
            <div className="pt-4 pb-3 border-t border-gray-200">
              {isAuth ? (
                <div className="px-4 space-y-3">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <FiUser className="h-4 w-4 text-blue-600" />
                      </div>
                    </div>
                    <div className="ml-3">
                      <div className="text-base font-medium text-gray-800">{user?.username}</div>
                      {user?.isAdmin && <div className="text-sm text-blue-600">Admin</div>}
                    </div>
                  </div>
                  
                  {isPremium ? (
                    <div className="px-3 py-2 bg-yellow-50 border border-yellow-200 rounded-md">
                      <div className="flex items-center text-sm text-yellow-800">
                        <FiStar className="h-4 w-4 mr-2" />
                        {formatSubscriptionStatus()}
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setShowSubscriptionModal(true);
                        setMobileMenuOpen(false);
                      }}
                      className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      <FiStar className="h-4 w-4 mr-2" />
                      Premium Ol
                    </button>
                  )}
                  
                                      <button
                      onClick={() => {
                        handleLogout();
                        setMobileMenuOpen(false);
                      }}
                      className="w-full flex items-center px-3 py-2 text-left text-red-600 hover:bg-red-50 rounded-md transition-colors"
                    >
                      <FiLogOut className="h-4 w-4 mr-2" />
                      {language === 'en' ? 'Logout' : 'Çıkış Yap'}
                    </button>
                </div>
              ) : (
                <div className="px-4 space-y-2">
                  <button
                    onClick={() => {
                      setShowLoginModal(true);
                      setMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    {language === 'en' ? 'Login' : 'Giriş Yap'}
                  </button>
                  <button
                    onClick={() => {
                      setShowRegisterModal(true);
                      setMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    <FiUserPlus className="h-4 w-4 mr-2" />
                    {language === 'en' ? 'Register' : 'Kayıt Ol'}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>
      
      {/* Modals */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSwitchToRegister={() => {
          setShowLoginModal(false);
          setTimeout(() => setShowRegisterModal(true), 150);
        }}
      />
      
      <RegisterModal
        isOpen={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
        onSwitchToLogin={() => {
          setShowRegisterModal(false);
          setTimeout(() => setShowLoginModal(true), 150);
        }}
      />
      
      <SubscriptionModal
        isOpen={showSubscriptionModal}
        onClose={() => setShowSubscriptionModal(false)}
      />
    </>
  );
}