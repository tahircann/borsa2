import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { 
  FiHome, 
  FiTrendingUp, 
  FiCompass, 
  FiStar, 
  FiBarChart, 
  FiBarChart2, 
  FiLayers, 
  FiGrid, 
  FiList, 
  FiUsers,
  FiSettings,
  FiPlus,
  FiPlusCircle,
  FiDatabase,
  FiX,
  FiBriefcase,
  FiDollarSign,
  FiInfo,
  FiLock
} from 'react-icons/fi'
import { useAuth } from '../utils/auth'

interface SidebarProps {
  onClose: () => void;
}

interface NavItem {
  name: string;
  href: string;
  icon: JSX.Element;
  adminOnly?: boolean;
  isHeader?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ onClose }) => {
  const router = useRouter()
  const { user } = useAuth()
  
  const navigation: NavItem[] = [
    // Dashboard sections
    { name: 'Dashboard', href: '/', icon: <FiHome className="h-5 w-5" />, isHeader: true },
    { name: 'Overview', href: '/', icon: <FiHome className="h-5 w-5" /> },
    { name: 'Stock Screener', href: '/screener', icon: <FiBarChart2 className="h-5 w-5" /> },
    
    // Portfolio sections
    { name: 'Portfolio Management', href: '#', icon: <FiStar className="h-5 w-5" />, isHeader: true },
    { name: 'Holdings', href: '/holdings', icon: <FiHome className="h-5 w-5" /> },
    { name: 'Positions', href: '/positions', icon: <FiList className="h-5 w-5" /> },
    { name: 'Trades', href: '/trades', icon: <FiTrendingUp className="h-5 w-5" /> },
    { name: 'Performance', href: '/performance', icon: <FiBarChart2 className="h-5 w-5" /> },
    { name: 'Sectors', href: '/sectors', icon: <FiGrid className="h-5 w-5" /> },
        { name: 'Portfolio', href: '/portfolio', icon: <FiBriefcase className="h-5 w-5" /> },      { name: 'Risk Insights', href: '/risk', icon: <FiInfo className="h-5 w-5" /> },
    
    // Admin sections
    { name: 'Admin', href: '#', icon: <FiSettings className="h-5 w-5" />, isHeader: true, adminOnly: true },
    { name: 'Stock Ranks', href: '/stock-ranks', icon: <FiBarChart className="h-5 w-5" />, adminOnly: true },
    { name: 'Portfolio Stock Ranks', href: '/portfolio-stock-ranks', icon: <FiBarChart2 className="h-5 w-5" />, adminOnly: true },
    { name: 'Performance', href: '/performance', icon: <FiTrendingUp className="h-5 w-5" />, adminOnly: true },
    { name: 'Positions', href: '/positions', icon: <FiList className="h-5 w-5" />, adminOnly: true },
    { name: 'Holdings', href: '/holdings', icon: <FiBriefcase className="h-5 w-5" />, adminOnly: true },
  ]

  // Always include all items for admin sidebar (since the entire sidebar is already admin-only)
  const filteredNavigation = navigation.filter(item => !item.adminOnly || (user?.isAdmin && item.adminOnly));

  return (
    <div className="w-64 h-screen bg-white border-r border-gray-200 flex flex-col shadow-lg overflow-hidden">
      {/* Sidebar header with close button */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-blue-800">Admin Mode</h2>
        <button 
          onClick={onClose} 
          className="lg:hidden p-1 rounded-full hover:bg-gray-100 text-gray-500"
        >
          <FiX className="h-5 w-5" />
        </button>
      </div>
      <nav className="mt-4 pb-12 overflow-y-auto flex-1">
        <ul className="px-2">
          {filteredNavigation.map((item) => {
            const isActive = router.pathname === item.href
            
            if (item.isHeader) {
              return (
                <li key={item.name} className="px-6 py-2 text-xs uppercase tracking-wider text-gray-400 font-semibold mt-6">
                  {item.name}
                </li>
              );
            }
            
            return (
              <li key={item.name}>
                <Link href={item.href}>
                  <div
                    className={`flex items-center px-6 py-3 text-sm font-medium transition-colors duration-200 ${
                      isActive
                        ? 'bg-blue-50 text-blue-700 border-r-4 border-blue-700 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-400'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-blue-700 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-blue-400'
                    }`}
                  >
                    <span className={`mr-3 ${isActive ? 'text-blue-700 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`}>{item.icon}</span>
                    {item.name}
                    {item.adminOnly && <FiLock className="ml-2 h-3 w-3 text-blue-500 dark:text-blue-400" />}
                  </div>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;