import React from 'react'
import Link from 'next/link'
import { FiMail, FiMapPin, FiPhone } from 'react-icons/fi'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center mb-4">
              <span className="text-2xl font-bold">
                <span className="text-blue-400">Esen Global</span> Investment
              </span>
            </div>
            <p className="text-gray-300 mb-6 max-w-md">
              We provide portfolio management, market analysis, and real-time trading monitoring services through the Interactive Brokers platform.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center">
                <FiMapPin className="h-5 w-5 text-blue-400 mr-3" />
                <span className="text-gray-300 text-sm">
                  CUMHURİYET MAH. ATATÜRK BULVARI No:186 /Z01 Door No: 05500<br />
                  SULUOVA/ Amasya / Turkey
                </span>
              </div>
              <div className="flex items-center">
                <FiMail className="h-5 w-5 text-blue-400 mr-3" />
                <a href="mailto:esenglobal@esenglobalinvest.com" className="text-gray-300 hover:text-blue-400 transition-colors text-sm">
                  esenglobal@esenglobalinvest.com
                </a>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/portfolio" className="text-gray-300 hover:text-blue-400 transition-colors text-sm">
                  Portfolio
                </Link>
              </li>
              <li>
                <Link href="/stock-ranks" className="text-gray-300 hover:text-blue-400 transition-colors text-sm">
                  Stock Rankings
                </Link>
              </li>
              <li>
                <Link href="/performance" className="text-gray-300 hover:text-blue-400 transition-colors text-sm">
                  Performance
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-300 hover:text-blue-400 transition-colors text-sm">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="text-gray-300 hover:text-blue-400 transition-colors text-sm">
                  How It Works
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Pages */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Legal Documents</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/privacy-policy" className="text-gray-300 hover:text-blue-400 transition-colors text-sm">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms-conditions" className="text-gray-300 hover:text-blue-400 transition-colors text-sm">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link href="/subscription-terms" className="text-gray-300 hover:text-blue-400 transition-colors text-sm">
                  Subscription Terms
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-700 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-400 text-sm mb-4 md:mb-0">
              © 2025 Esen Global Investment. All rights reserved.
            </div>
            
            {/* Payment Methods */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <span className="text-xs text-gray-400">Accepted Payments:</span>
                <div className="flex items-center space-x-2">
                  {/* Visa Logo */}
                  <div className="bg-white px-2 py-1 rounded text-blue-900 font-bold text-xs">
                    VISA
                  </div>
                  {/* Mastercard Logo */}
                  <div className="bg-white px-2 py-1 rounded text-red-600 font-bold text-xs">
                    MC
                  </div>
                  {/* Iyzico Logo */}
                  <div className="bg-blue-500 px-2 py-1 rounded text-white font-bold text-xs">
                    iyzico
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row justify-between items-center mt-4">
            <div className="flex items-center space-x-4 text-xs text-gray-400 mb-2 md:mb-0">
              <span>🔒 SSL Secure</span>
              <span>•</span>
              <span>💳 Secure Payment</span>
            </div>
          </div>
          
          {/* Legal Footer Text */}
          <div className="mt-4 text-xs text-gray-500 text-center">
            <p>
              The information provided on this platform is for educational and informational purposes only and does not constitute investment advice. 
              Past performance does not guarantee future results. You are fully responsible for your investment decisions.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
} 