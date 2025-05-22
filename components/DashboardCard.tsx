import { ReactNode } from 'react'
import { FiTrendingUp, FiTrendingDown } from 'react-icons/fi'
import { formatPercent } from '../utils/formatters'

type DashboardCardProps = {
  title: string;
  value: string;
  change: number;
  icon: ReactNode;
}

export default function DashboardCard({ title, value, change, icon }: DashboardCardProps) {
  const isPositive = change >= 0

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow card-hover">
      <div className="flex justify-between items-start mb-3">
        <div className="text-sm font-medium text-gray-500">{title}</div>
        <div className="rounded-full bg-primary-100 p-3 text-primary-600">
          {icon}
        </div>
      </div>
      <div className="text-3xl font-bold text-gray-800 mb-2">{value}</div>
      <div className={`flex items-center text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}
      >
        {isPositive ? 
          <FiTrendingUp className="mr-1 h-4 w-4" /> : 
          <FiTrendingDown className="mr-1 h-4 w-4" />
        }
        <span>{formatPercent(change)}</span>
      </div>
    </div>
  )
} 