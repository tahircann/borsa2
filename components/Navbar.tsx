import { useState, useEffect } from 'react'
import Link from 'next/link'
import { FiBell, FiUser, FiSettings, FiLogOut } from 'react-icons/fi'
import { useAuth } from '../utils/auth'
import LoginModal from './LoginModal'

export default function Navbar() {
  const [notifications, setNotifications] = useState(3)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const { user, logout, isAuthenticated } = useAuth()
  const [isAuth, setIsAuth] = useState(false)
  
  // This ensures the authentication state is updated after the component mounts
  useEffect(() => {
    setIsAuth(isAuthenticated())
    // Add this console log to help debug the auth state
    console.log("Auth state in Navbar:", { user, isAuthenticated: isAuthenticated() })
  }, [user, isAuthenticated])

  const handleLogout = () => {
    logout()
    setIsAuth(false)
  }

  const handleLoginSuccess = () => {
    setShowLoginModal(false)
    // Force refresh to update auth state throughout the app
    window.location.reload()
  }

  return (
    <>
      <nav className="bg-white shadow-sm px-6 py-3 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-bold text-primary-600">Borsa22</h1>
          
          {!isAuth && (
            <button 
              onClick={() => setShowLoginModal(true)}
              className="text-sm bg-primary-50 text-primary-600 px-3 py-1 rounded hover:bg-primary-100 transition-colors"
            >
              Admin Login
            </button>
          )}
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
          
          {isAuth ? (
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                <FiUser className="h-5 w-5 text-primary-600" />
              </div>
              <span className="text-sm font-medium text-gray-700">{user?.username} {user?.isAdmin && '(Admin)'}</span>
              <button 
                onClick={handleLogout}
                className="text-gray-500 hover:text-gray-700"
                title="Logout"
              >
                <FiLogOut className="h-5 w-5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                <FiUser className="h-5 w-5 text-gray-500" />
              </div>
              <span className="text-sm font-medium text-gray-700">Guest</span>
            </div>
          )}
          
          <FiSettings className="h-5 w-5 text-gray-500 hover:text-gray-700 cursor-pointer" />
        </div>
      </nav>
      
      <LoginModal 
        isOpen={showLoginModal} 
        onClose={handleLoginSuccess} 
      />
    </>
  )
} 