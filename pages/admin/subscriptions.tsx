import { useState, useEffect } from 'react';
import { useAuth } from '../../utils/auth';
import { FiCreditCard, FiDollarSign, FiCalendar, FiShield, FiTrendingUp, FiUsers, FiRefreshCw } from 'react-icons/fi';
import Layout from '../../components/Layout';

interface SubscriptionStats {
  totalUsers: number;
  premiumUsers: number;
  freeUsers: number;
  monthlyRevenue: number;
  yearlyRevenue: number;
  churnRate: number;
  newSubscriptions: number;
}

export default function AdminSubscriptionsPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<SubscriptionStats>({
    totalUsers: 0,
    premiumUsers: 0,
    freeUsers: 0,
    monthlyRevenue: 0,
    yearlyRevenue: 0,
    churnRate: 0,
    newSubscriptions: 0
  });
  const [loading, setLoading] = useState(true);

  const isAdmin = user?.isAdmin || false;

  useEffect(() => {
    if (!isAdmin) return;
    loadSubscriptionStats();
  }, [isAdmin]);

  const loadSubscriptionStats = async () => {
    try {
      // In a real app, this would fetch from Gumroad API
      const savedUsers = localStorage.getItem('users');
      if (savedUsers) {
        const users = JSON.parse(savedUsers);
        const premiumUsers = users.filter((u: any) => u.membershipType === 'premium').length;
        const freeUsers = users.filter((u: any) => u.membershipType === 'free').length;
        
        setStats({
          totalUsers: users.length,
          premiumUsers,
          freeUsers,
          monthlyRevenue: premiumUsers * 29.99, // Mock data
          yearlyRevenue: premiumUsers * 299.99, // Mock data
          churnRate: 5.2, // Mock data
          newSubscriptions: Math.floor(premiumUsers * 0.1) // Mock data
        });
      }
    } catch (error) {
      console.error('Error loading subscription stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const syncWithGumroad = async () => {
    setLoading(true);
    try {
      // In a real app, this would sync with Gumroad API
      const response = await fetch('/api/gumroad/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ syncAll: true })
      });
      
      if (response.ok) {
        await loadSubscriptionStats();
        alert('Successfully synced with Gumroad!');
      } else {
        alert('Failed to sync with Gumroad');
      }
    } catch (error) {
      console.error('Error syncing with Gumroad:', error);
      alert('Error syncing with Gumroad');
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <FiShield className="mx-auto h-12 w-12 text-red-500" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Access Denied</h3>
            <p className="mt-1 text-sm text-gray-500">You don't have permission to access this page.</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <FiCreditCard className="mr-3 h-8 w-8" />
              Subscription Management
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              Monitor and manage user subscriptions and revenue
            </p>
          </div>
          <button
            onClick={syncWithGumroad}
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
          >
            <FiRefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Sync with Gumroad
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FiUsers className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Users</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.totalUsers}</dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FiCreditCard className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Premium Users</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.premiumUsers}</dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FiDollarSign className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Monthly Revenue</dt>
                  <dd className="text-lg font-medium text-gray-900">${stats.monthlyRevenue.toFixed(2)}</dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FiTrendingUp className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Churn Rate</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.churnRate}%</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Subscription Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Subscription Breakdown</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Free Users</span>
                <div className="flex items-center">
                  <span className="text-sm font-medium text-gray-900 mr-2">{stats.freeUsers}</span>
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gray-600 h-2 rounded-full" 
                      style={{ width: `${(stats.freeUsers / stats.totalUsers) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Premium Users</span>
                <div className="flex items-center">
                  <span className="text-sm font-medium text-gray-900 mr-2">{stats.premiumUsers}</span>
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full" 
                      style={{ width: `${(stats.premiumUsers / stats.totalUsers) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Revenue Overview</h3>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Monthly Potential Revenue</span>
                <span className="text-sm font-medium text-gray-900">${stats.monthlyRevenue.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Yearly Potential Revenue</span>
                <span className="text-sm font-medium text-gray-900">${(stats.yearlyRevenue).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">New Subscriptions (This Month)</span>
                <span className="text-sm font-medium text-green-600">+{stats.newSubscriptions}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Gumroad Integration Status */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Gumroad Integration</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border border-gray-200 rounded-lg">
              <FiCreditCard className="mx-auto h-8 w-8 text-blue-600 mb-2" />
              <h4 className="text-sm font-medium text-gray-900">Payment Processing</h4>
              <p className="text-xs text-green-600 mt-1">Active</p>
            </div>
            <div className="text-center p-4 border border-gray-200 rounded-lg">
              <FiRefreshCw className="mx-auto h-8 w-8 text-green-600 mb-2" />
              <h4 className="text-sm font-medium text-gray-900">Webhook Sync</h4>
              <p className="text-xs text-green-600 mt-1">Configured</p>
            </div>
            <div className="text-center p-4 border border-gray-200 rounded-lg">
              <FiShield className="mx-auto h-8 w-8 text-yellow-600 mb-2" />
              <h4 className="text-sm font-medium text-gray-900">License Verification</h4>
              <p className="text-xs text-yellow-600 mt-1">Needs Setup</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
