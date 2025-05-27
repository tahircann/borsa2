import React, { useState, useEffect, useContext } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { FiBell, FiUser, FiLogOut, FiCreditCard, FiMenu, FiX, FiBarChart2, FiPieChart, FiTrendingUp, FiSearch } from 'react-icons/fi';
import { useAuth } from '../utils/auth';

interface NavbarProps {
  isAdmin?: boolean;
}

import LoginModal from './LoginModal';
import SubscriptionModal from './SubscriptionModal';
import { SubscriptionContext } from './Layout';

export default function Navbar({ isAdmin }: NavbarProps) {
  const [notifications, setNotifications] = useState(0); // Default to 0 notifications
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const { user, logout, isAuthenticated } = useAuth();
  const [isAuth, setIsAuth] = useState(false);
  const { isSubscribed, subscriptionStatus, plan, subscribe, loading: subscriptionLoading } = useContext(SubscriptionContext);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setIsAuth(isAuthenticated());
  }, [user, isAuthenticated]);

  const handleLogout = () => {
    logout();
    setIsAuth(false);
  };

  const handleLoginSuccess = () => {
    setShowLoginModal(false);
    window.location.reload(); 
  };

  const navLinks = [
    { href: '/portfolio', label: 'Portfolio' },
    { href: '/stock-ranks', label: 'Stock Ranks' },
    { href: '/trades', label: 'Trading History' },
    { href: '/trade-bot', label: 'Trade Bot' },
    { href: '/performance', label: 'Performance' },
    { href: '/how-it-works', label: 'About' },
    { href: '#', label: 'Subscribe', isButton: true },
  ];

  return (
    <>
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left side: Logo and Desktop Nav Links */}
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold text-slate-800 hover:text-blue-700 transition-colors flex items-center">
                <span className="text-blue-600 mr-1">Stock</span> Guide
              </Link>
              <div className="hidden md:ml-10 md:flex md:items-baseline md:space-x-6">
                {navLinks.map((link) => (
                  link.isButton ? (
                    <button
                      key={link.label}
                      onClick={() => setShowSubscriptionModal(true)}
                      className="text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 text-sm font-medium rounded transition-colors"
                    >
                      {link.label}
                    </button>
                  ) : (
                    <Link 
                      key={link.label} 
                      href={link.href} 
                      className="text-slate-700 hover:text-blue-600 px-1 py-2 text-sm font-medium transition-colors border-b-2 border-transparent hover:border-blue-600"
                    >
                      {link.label}
                    </Link>
                  )
                ))}
              </div>
            </div>

            {/* Right side: Icons, Auth, Subscribe */}
            <div className="hidden md:flex items-center space-x-6">
              <div className="relative">
                <button className="p-1 text-gray-500 hover:text-blue-600 focus:outline-none transition-colors">
                  <FiSearch className="h-5 w-5" />
                </button>
              </div>
              
              {isAuth ? (
                <div className="relative flex items-center">
                  <span className="text-sm font-medium text-gray-700 mr-3">{user?.username} {user?.isAdmin && '(Admin)'}</span>
                  <button
                    onClick={handleLogout}
                    className="p-1 text-gray-500 hover:text-blue-600 focus:outline-none transition-colors"
                    title="Logout"
                  >
                    <FiLogOut className="h-5 w-5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowLoginModal(true)}
                  className="text-sm font-medium text-slate-700 hover:text-blue-600 px-3 py-2 transition-colors"
                >
                  Login
                </button>
              )}

              {!subscriptionLoading && !isSubscribed && (
                <button
                  onClick={() => setShowSubscriptionModal(true)}
                  className="ml-4 inline-flex items-center px-5 py-2 border border-transparent text-sm font-medium rounded text-white bg-blue-600 hover:bg-blue-700 transition-all duration-200 ease-in-out"
                >
                  Subscribe
                </button>
              )}
              {isSubscribed && (
                <div className="ml-4 inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-blue-50 text-blue-700 border border-blue-200">
                  {subscriptionStatus === 'trial' ? 'Trial Active' : `${plan.charAt(0).toUpperCase() + plan.slice(1)} Plan`}
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
                <span className="sr-only">Open main menu</span>
                {mobileMenuOpen ? (
                  <FiX className="block h-6 w-6" aria-hidden="true" />
                ) : (
                  <FiMenu className="block h-6 w-6" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu, show/hide based on menu state. */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100" id="mobile-menu">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {navLinks.map((link) => (
                link.isButton ? (
                  <button
                    key={link.label}
                    onClick={() => {setShowSubscriptionModal(true); setMobileMenuOpen(false);}}
                    className="text-white bg-blue-600 hover:bg-blue-700 w-full text-left px-3 py-2 rounded-md text-base font-medium transition-colors"
                  >
                    {link.label}
                  </button>
                ) : (
                  <Link 
                    key={link.label} 
                    href={link.href} 
                    className="text-slate-700 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium transition-colors"
                  >
                    {link.label}
                  </Link>
                )
              ))}
            </div>
            <div className="pt-4 pb-3 border-t border-gray-800">
              <div className="flex items-center px-5">
                {isAuth ? (
                  <>
                    <FiUser className="h-8 w-8 text-amber-500" />
                    <div className="ml-3">
                      <div className="text-base font-medium text-white">{user?.username}</div>
                      {user?.isAdmin && <div className="text-sm font-medium text-gray-400">(Admin)</div>}
                    </div>
                    <button className="ml-auto flex-shrink-0 p-1 text-gray-300 hover:text-amber-500 focus:outline-none transition-colors">
                      <FiSearch className="h-6 w-6" />
                    </button>
                  </>
                ) : (
                   <FiUser className="h-8 w-8 text-amber-500" />
                )}
              </div>
              <div className="mt-3 px-2 space-y-1">
                {isAuth ? (
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-white hover:text-amber-500 transition-colors"
                  >
                    Logout
                  </button>
                ) : (
                  <button
                    onClick={() => { setShowLoginModal(true); setMobileMenuOpen(false); }}
                    className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-white hover:text-amber-500 transition-colors"
                  >
                    Login
                  </button>
                )}
                {!subscriptionLoading && !isSubscribed && (
                  <button
                    onClick={() => { setShowSubscriptionModal(true); setMobileMenuOpen(false); }}
                    className="block w-full text-left mt-1 px-3 py-2 rounded-md text-base font-medium text-white bg-amber-500 hover:bg-amber-600 transition-colors"
                  >
                    Subscribe
                  </button>
                )}
                 {isSubscribed && (
                    <div className="mt-2 px-3 py-2 text-sm bg-green-900 text-green-100 rounded-md font-medium border border-green-700">
                        {subscriptionStatus === 'trial' ? 'Trial Active' : `${plan.charAt(0).toUpperCase() + plan.slice(1)} Plan`}
                    </div>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
      {showLoginModal && <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />}
      {showSubscriptionModal && <SubscriptionModal isOpen={showSubscriptionModal} onClose={() => setShowSubscriptionModal(false)} onSubscribe={(planId) => subscribe(planId)} />}
    </>
  );
}