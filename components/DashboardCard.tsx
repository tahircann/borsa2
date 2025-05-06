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
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-start mb-2">
        <div className="text-sm font-medium text-gray-500">{title}</div>
        <div className="rounded-full bg-gray-100 p-2">
          {icon}
        </div>
      </div>
      <div className="text-2xl font-semibold mb-1">{value}</div>
      <div className={`flex items-center text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
        {isPositive ? 
          <FiTrendingUp className="mr-1 h-4 w-4" /> : 
          <FiTrendingDown className="mr-1 h-4 w-4" />
        }
        <span>{formatPercent(change)}</span>
      </div>
    </div>
  )
} 