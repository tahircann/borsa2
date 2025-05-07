import Link from 'next/link'
import { useRouter } from 'next/router'
import { 
  FiHome, 
  FiTrendingUp, 
  FiBarChart2, 
  FiDollarSign, 
  FiInfo, 
  FiBriefcase,
  FiPieChart,
  FiGrid 
} from 'react-icons/fi'

type NavItem = {
  name: string;
  href: string;
  icon: JSX.Element;
}

export default function Sidebar() {
  const router = useRouter()
  
  const navigation: NavItem[] = [
    { name: 'Home', href: '/', icon: <FiHome className="h-5 w-5" /> },
    { name: 'Trades', href: '/trades', icon: <FiTrendingUp className="h-5 w-5" /> },
    { name: 'Portfolio Stock Ranks', href: '/stock-ranks', icon: <FiBarChart2 className="h-5 w-5" /> },
    { name: 'Performance', href: '/performance', icon: <FiPieChart className="h-5 w-5" /> },
    { name: 'Sectors', href: '/sectors', icon: <FiGrid className="h-5 w-5" /> },
    { name: 'How it Works?', href: '/how-it-works', icon: <FiInfo className="h-5 w-5" /> },
    { name: 'Portfolio', href: '/portfolio', icon: <FiBriefcase className="h-5 w-5" /> },
    { name: 'Dividend', href: '/dividend', icon: <FiDollarSign className="h-5 w-5" /> },
  ]

  return (
    <aside className="w-64 bg-white shadow-md">
      <div className="p-6">
        <Link href="/">
          <span className="text-2xl font-bold text-primary-600">Borsa22</span>
        </Link>
      </div>
      <nav className="mt-6">
        <ul>
          {navigation.map((item) => {
            const isActive = router.pathname === item.href
            return (
              <li key={item.name}>
                <Link href={item.href}>
                  <div
                    className={`flex items-center px-6 py-3 text-sm font-medium ${
                      isActive
                        ? 'bg-primary-50 text-primary-600 border-r-4 border-primary-600'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <span className="mr-3">{item.icon}</span>
                    {item.name}
                  </div>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </aside>
  )
} 