import React from 'react'
import { FiCheckCircle, FiBarChart2, FiShield, FiRefreshCw } from 'react-icons/fi'

export default function HowItWorks() {
  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">How It Works?</h1>
        <p className="text-gray-600">
          Learn how the Esen Global Investment platform integrates with Interactive Brokers to help you manage your investments.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-start mb-4">
            <div className="bg-primary-100 p-3 rounded-full mr-4">
              <FiBarChart2 className="h-6 w-6 text-primary-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold mb-2">Real-Time Data</h2>
              <p className="text-gray-600">
                Esen Global Investment connects securely to your Interactive Brokers account to provide real-time data about your portfolio, trades, and performance.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-start mb-4">
            <div className="bg-green-100 p-3 rounded-full mr-4">
              <FiShield className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold mb-2">Secure Connection</h2>
              <p className="text-gray-600">
                Your data security is our priority. We use industry-standard encryption and secure API connections to protect your information.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-start mb-4">
            <div className="bg-indigo-100 p-3 rounded-full mr-4">
              <FiRefreshCw className="h-6 w-6 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold mb-2">Automated Analysis</h2>
              <p className="text-gray-600">
                Our platform automatically analyzes your portfolio data to provide insights, performance metrics, and opportunities for optimization.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-start mb-4">
            <div className="bg-yellow-100 p-3 rounded-full mr-4">
              <FiCheckCircle className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold mb-2">Easy Setup</h2>
              <p className="text-gray-600">
                Getting started is simple. Just connect your Interactive Brokers account and our platform will automatically import and analyze your data.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-8 mb-10">
        <h2 className="text-xl font-semibold mb-6 text-center">Setup Process</h2>
        
        <div className="relative">
          {/* Connection line */}
          <div className="absolute left-8 top-10 w-0.5 h-full -ml-px bg-gray-200 hidden md:block"></div>
          
          <div className="mb-12 relative flex flex-col md:flex-row">
            <div className="md:w-16 md:text-center flex-shrink-0 relative z-10">
              <div className="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center text-white font-bold">1</div>
            </div>
            <div className="md:ml-6 mt-3 md:mt-0">
              <h3 className="text-lg font-medium">Create an Account</h3>
              <p className="mt-2 text-gray-600">
                Sign up for an Esen Global Investment account using your email address and create a secure password.
              </p>
            </div>
          </div>
          
          <div className="mb-12 relative flex flex-col md:flex-row">
            <div className="md:w-16 md:text-center flex-shrink-0 relative z-10">
              <div className="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center text-white font-bold">2</div>
            </div>
            <div className="md:ml-6 mt-3 md:mt-0">
              <h3 className="text-lg font-medium">Connect Your Interactive Brokers Account</h3>
              <p className="mt-2 text-gray-600">
                Generate an API key in your Interactive Brokers account and enter it in the Esen Global Investment platform to establish the connection.
              </p>
            </div>
          </div>
          
          <div className="mb-12 relative flex flex-col md:flex-row">
            <div className="md:w-16 md:text-center flex-shrink-0 relative z-10">
              <div className="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center text-white font-bold">3</div>
            </div>
            <div className="md:ml-6 mt-3 md:mt-0">
              <h3 className="text-lg font-medium">Import and Analyze</h3>
              <p className="mt-2 text-gray-600">
                Esen Global Investment automatically imports your portfolio data and begins analyzing it to provide personalized insights.
              </p>
            </div>
          </div>
          
          <div className="relative flex flex-col md:flex-row">
            <div className="md:w-16 md:text-center flex-shrink-0 relative z-10">
              <div className="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center text-white font-bold">4</div>
            </div>
            <div className="md:ml-6 mt-3 md:mt-0">
              <h3 className="text-lg font-medium">Start Using the Dashboard</h3>
              <p className="mt-2 text-gray-600">
                Explore your portfolio insights, track performance, review trades, and manage your investments more effectively.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-8">
        <h2 className="text-xl font-semibold mb-6">Frequently Asked Questions</h2>
        
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-2">Is my data secure?</h3>
            <p className="text-gray-600">
              Yes, we use bank-level encryption and secure connections. We never store your Interactive Brokers credentials, only the API token which can be revoked at any time.
            </p>
          </div>
          
          <div>
                          <h3 className="text-lg font-medium mb-2">Does Esen Global Investment have access to make trades?</h3>
              <p className="text-gray-600">
                No, by default the connection is read-only. Esen Global Investment can only view your portfolio and trade data but cannot make trades or withdraw funds.
              </p>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-2">How often is my data updated?</h3>
            <p className="text-gray-600">
              The platform syncs with Interactive Brokers in real-time during market hours. Historical data is updated daily after market close.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-2">Can I cancel my subscription?</h3>
            <p className="text-gray-600">
              Yes, you can cancel your subscription at any time from your account settings. You'll continue to have access until the end of your current billing period.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-2">Which brokers are supported?</h3>
            <p className="text-gray-600">
                              Currently, Esen Global Investment supports Interactive Brokers. We're working on adding support for additional brokers in the future.
            </p>
          </div>
        </div>
      </div>
    </>
  )
} 