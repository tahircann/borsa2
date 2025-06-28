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
              Interactive Brokers platformu üzerinden portföy yönetimi, piyasa analizi ve gerçek zamanlı alım-satım takibi hizmetleri sunuyoruz.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center">
                <FiMapPin className="h-5 w-5 text-blue-400 mr-3" />
                <span className="text-gray-300 text-sm">
                  CUMHURİYET MAH. ATATÜRK BULVARI No:186 /Z01 Kapı No: 05500<br />
                  SULUOVA/ Amasya / Türkiye
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
            <h3 className="text-lg font-semibold mb-4">Hızlı Linkler</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/portfolio" className="text-gray-300 hover:text-blue-400 transition-colors text-sm">
                  Portföy
                </Link>
              </li>
              <li>
                <Link href="/stock-ranks" className="text-gray-300 hover:text-blue-400 transition-colors text-sm">
                  Hisse Sıralaması
                </Link>
              </li>
              <li>
                <Link href="/performance" className="text-gray-300 hover:text-blue-400 transition-colors text-sm">
                  Performans
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-300 hover:text-blue-400 transition-colors text-sm">
                  Hakkımızda
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="text-gray-300 hover:text-blue-400 transition-colors text-sm">
                  Nasıl Çalışır
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Pages */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Yasal Belgeler</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/privacy-policy" className="text-gray-300 hover:text-blue-400 transition-colors text-sm">
                  Gizlilik Politikası
                </Link>
              </li>
              <li>
                <Link href="/terms-conditions" className="text-gray-300 hover:text-blue-400 transition-colors text-sm">
                  Kullanım Koşulları
                </Link>
              </li>
              <li>
                <Link href="/subscription-terms" className="text-gray-300 hover:text-blue-400 transition-colors text-sm">
                  Abonelik Şartları
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-700 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-400 text-sm mb-4 md:mb-0">
              © 2024 Esen Global Investment. Tüm hakları saklıdır.
            </div>
            
            {/* Payment and Security Badges */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-xs text-gray-400">
                <span>🔒 SSL Güvenli</span>
                <span>•</span>
                <span>💳 Güvenli Ödeme</span>
              </div>
            </div>
          </div>
          
          {/* Legal Footer Text */}
          <div className="mt-4 text-xs text-gray-500 text-center">
            <p>
              Bu platformda sunulan bilgiler yalnızca eğitim ve bilgi amaçlıdır, yatırım tavsiyesi niteliği taşımaz. 
              Geçmiş performans gelecekteki sonuçları garanti etmez. Yatırım kararlarınızdan tamamen sorumlusunuz.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
} 