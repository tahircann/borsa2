import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { 
  FiHome, 
  FiTrendingUp, 
  FiBarChart, 
  FiBarChart2, 
  FiGrid, 
  FiList, 
  FiX,
  FiBriefcase,
  FiUser,
  FiUsers,
  FiLock,
  FiCreditCard,
  FiSettings,
  FiMail,
  FiShield,
  FiClock,
  FiChevronDown,
  FiChevronRight,
  FiDollarSign
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
  children?: NavItem[];
}

const Sidebar: React.FC<SidebarProps> = ({ onClose }) => {
  const router = useRouter()
  const { user } = useAuth()
  const [expandedMenus, setExpandedMenus] = useState<string[]>(['Account'])

  const toggleMenu = (menuName: string) => {
    setExpandedMenus(prev => 
      prev.includes(menuName) 
        ? prev.filter(name => name !== menuName)
        : [...prev, menuName]
    )
  }
  
  const navigation: NavItem[] = [
    // Dashboard sections
    { name: 'DASHBOARD', href: '#', icon: <FiHome className="h-5 w-5" />, isHeader: true },
    { name: 'Overview', href: '/', icon: <FiHome className="h-5 w-5" /> },
    
    // Portfolio sections
    { name: 'PORTFOLIO MANAGEMENT', href: '#', icon: <FiBriefcase className="h-5 w-5" />, isHeader: true },
    { name: 'Portfolio', href: '/portfolio', icon: <FiBriefcase className="h-5 w-5" /> },
    { name: 'Positions', href: '/positions', icon: <FiList className="h-5 w-5" /> },
    { name: 'Trades', href: '/trades', icon: <FiTrendingUp className="h-5 w-5" /> },
    { name: 'Performance', href: '/performance', icon: <FiBarChart2 className="h-5 w-5" /> },
    { name: 'Sectors', href: '/sectors', icon: <FiGrid className="h-5 w-5" /> },
    
    // Admin sections
    { name: 'ADMIN', href: '#', icon: <FiSettings className="h-5 w-5" />, isHeader: true, adminOnly: true },
    { name: 'Stock Ranks', href: '/stock-ranks', icon: <FiBarChart className="h-5 w-5" />, adminOnly: true },
    { name: 'Portfolio Stock Ranks', href: '/portfolio-stock-ranks', icon: <FiBarChart2 className="h-5 w-5" />, adminOnly: true },
    
    // Admin User Management
    { 
      name: 'USER MANAGEMENT', 
      href: '#', 
      icon: <FiUsers className="h-5 w-5" />, 
      isHeader: true,
      adminOnly: true,
      children: [
        { name: 'All Users', href: '/admin/users', icon: <FiUsers className="h-4 w-4" />, adminOnly: true },
        { name: 'Subscription Management', href: '/admin/subscriptions', icon: <FiCreditCard className="h-4 w-4" />, adminOnly: true },
        { name: 'Payment Analytics', href: '/admin/payments', icon: <FiDollarSign className="h-4 w-4" />, adminOnly: true },
        { name: 'User Security', href: '/admin/security', icon: <FiShield className="h-4 w-4" />, adminOnly: true },
        { name: 'System Notifications', href: '/admin/notifications', icon: <FiMail className="h-4 w-4" />, adminOnly: true }
      ]
    },
    
    // Account Management
    { 
      name: 'ACCOUNT', 
      href: '#', 
      icon: <FiUser className="h-5 w-5" />, 
      isHeader: true,
      children: [
        { name: 'Profile Settings', href: '/profile', icon: <FiUser className="h-4 w-4" /> },
        { name: 'Subscription', href: '/subscription-manage', icon: <FiCreditCard className="h-4 w-4" /> },
        { name: 'Payment History', href: '/payment-history', icon: <FiClock className="h-4 w-4" /> },
        { name: 'Security', href: '/account-security', icon: <FiShield className="h-4 w-4" /> },
        { name: 'Notifications', href: '/notifications', icon: <FiMail className="h-4 w-4" /> }
      ]
    }
  ]

  // Filter navigation based on admin status
  const filteredNavigation = navigation.filter(item => !item.adminOnly || (user?.isAdmin && item.adminOnly));

  const renderNavItem = (item: NavItem) => {
    const isActive = router.pathname === item.href
    const isExpanded = expandedMenus.includes(item.name)
    
    if (item.isHeader) {
      if (item.children) {
        return (
          <div key={item.name}>
            <li className="px-6 py-2 text-xs uppercase tracking-wider text-gray-400 font-semibold mt-6">
              <button 
                onClick={() => toggleMenu(item.name)}
                className="flex items-center justify-between w-full text-left"
              >
                <span>{item.name}</span>
                {isExpanded ? <FiChevronDown className="h-3 w-3" /> : <FiChevronRight className="h-3 w-3" />}
              </button>
            </li>
            {isExpanded && item.children.map(child => renderNavItem(child))}
          </div>
        );
      } else {
        return (
          <li key={item.name} className="px-6 py-2 text-xs uppercase tracking-wider text-gray-400 font-semibold mt-6">
            {item.name}
          </li>
        );
      }
    }
    
    return (
      <li key={item.name}>
        <Link href={item.href}>
          <div
            className={`flex items-center px-6 py-3 text-sm font-medium transition-colors duration-200 ${
              isActive
                ? 'bg-blue-50 text-blue-700 border-r-4 border-blue-700'
                : 'text-gray-700 hover:bg-gray-50 hover:text-blue-700'
            }`}
          >
            <span className={`mr-3 ${isActive ? 'text-blue-700' : 'text-gray-500'}`}>{item.icon}</span>
            {item.name}
            {item.adminOnly && <FiLock className="ml-2 h-3 w-3 text-blue-500" />}
          </div>
        </Link>
      </li>
    )
  }

  return (
    <div className="w-64 h-screen bg-white border-r border-gray-200 flex flex-col shadow-lg overflow-hidden">
      {/* Sidebar header with close button */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-blue-800">DASHBOARD</h2>
        <button 
          onClick={onClose} 
          className="lg:hidden p-1 rounded-full hover:bg-gray-100 text-gray-500"
        >
          <FiX className="h-5 w-5" />
        </button>
      </div>
      <nav className="mt-4 pb-12 overflow-y-auto flex-1">
        <ul className="px-2">
          {filteredNavigation.map(renderNavItem)}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;