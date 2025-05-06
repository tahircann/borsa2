import { useState } from 'react'
import Link from 'next/link'
import { FiBell, FiUser, FiSettings } from 'react-icons/fi'

export default function Navbar() {
  const [notifications, setNotifications] = useState(3)

  return (
    <nav className="bg-white shadow-sm px-6 py-3 flex justify-between items-center">
      <div>
        <h1 className="text-xl font-bold text-primary-600">Borsa22</h1>
      </div>
      <div className="flex items-center space-x-4">
        <div className="relative">
          <FiBell className="h-6 w-6 text-gray-500 hover:text-gray-700 cursor-pointer" />
          {notifications > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
              {notifications}
            </span>
          )}
        </div>
        <div className="border-l border-gray-300 h-6"></div>
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
            <FiUser className="h-5 w-5 text-gray-500" />
          </div>
          <span className="text-sm font-medium text-gray-700">User</span>
        </div>
        <FiSettings className="h-5 w-5 text-gray-500 hover:text-gray-700 cursor-pointer" />
      </div>
    </nav>
  )
} 