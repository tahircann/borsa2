import { useState, useEffect } from 'react';
import { useAuth } from '../../utils/auth';
import { FiDollarSign, FiTrendingUp, FiCalendar, FiShield, FiDownload, FiFilter } from 'react-icons/fi';
import Layout from '../../components/Layout';

interface PaymentData {
  id: string;
  userEmail: string;
  amount: number;
  productName: string;
  date: Date;
  status: 'completed' | 'pending' | 'failed' | 'refunded';
  paymentMethod: string;
  gumroadId?: string;
}

export default function AdminPaymentsPage() {
  const { user } = useAuth();
  const [payments, setPayments] = useState<PaymentData[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<PaymentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'pending' | 'failed' | 'refunded'>('all');

  const isAdmin = user?.isAdmin || false;

  useEffect(() => {
    if (!isAdmin) return;
    loadPaymentData();
  }, [isAdmin]);

  useEffect(() => {
    filterPayments();
  }, [payments, dateRange, statusFilter]);

  const loadPaymentData = async () => {
    try {
      // Mock payment data - in real app, fetch from Gumroad API
      const mockPayments: PaymentData[] = [
        {
          id: '1',
          userEmail: 'user1@example.com',
          amount: 29.99,
          productName: 'Monthly Premium',
          date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          status: 'completed',
          paymentMethod: 'Credit Card',
          gumroadId: 'gum_123'
        },
        {
          id: '2',
          userEmail: 'user2@example.com',
          amount: 299.99,
          productName: 'Yearly Premium',
          date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          status: 'completed',
          paymentMethod: 'PayPal',
          gumroadId: 'gum_124'
        },
        {
          id: '3',
          userEmail: 'user3@example.com',
          amount: 29.99,
          productName: 'Monthly Premium',
          date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          status: 'failed',
          paymentMethod: 'Credit Card',
          gumroadId: 'gum_125'
        }
      ];
      setPayments(mockPayments);
    } catch (error) {
      console.error('Error loading payment data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterPayments = () => {
    let filtered = [...payments];

    // Filter by date range
    const now = new Date();
    const startDate = new Date();
    switch (dateRange) {
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        startDate.setMonth(now.getMonth() - 3);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
    }
    filtered = filtered.filter(payment => payment.date >= startDate);

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(payment => payment.status === statusFilter);
    }

    setFilteredPayments(filtered);
  };

  const getTotalRevenue = () => {
    return filteredPayments
      .filter(p => p.status === 'completed')
      .reduce((total, payment) => total + payment.amount, 0);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'refunded': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const exportPayments = () => {
    const csvContent = [
      ['Date', 'User Email', 'Product', 'Amount', 'Status', 'Payment Method', 'Gumroad ID'],
      ...filteredPayments.map(payment => [
        payment.date.toLocaleDateString(),
        payment.userEmail,
        payment.productName,
        payment.amount.toString(),
        payment.status,
        payment.paymentMethod,
        payment.gumroadId || ''
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payments_${dateRange}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
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
              <FiDollarSign className="mr-3 h-8 w-8" />
              Payment Analytics
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              Track payment performance and revenue analytics
            </p>
          </div>
          <button
            onClick={exportPayments}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <FiDownload className="mr-2 h-4 w-4" />
            Export CSV
          </button>
        </div>

        {/* Revenue Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FiDollarSign className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Revenue</dt>
                  <dd className="text-lg font-medium text-gray-900">${getTotalRevenue().toFixed(2)}</dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FiTrendingUp className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Completed Payments</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {filteredPayments.filter(p => p.status === 'completed').length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FiCalendar className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Failed Payments</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {filteredPayments.filter(p => p.status === 'failed').length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FiFilter className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Success Rate</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {filteredPayments.length > 0 
                      ? ((filteredPayments.filter(p => p.status === 'completed').length / filteredPayments.length) * 100).toFixed(1)
                      : '0'
                    }%
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Date Range:</label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as any)}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm"
            >
              <option value="week">Last Week</option>
              <option value="month">Last Month</option>
              <option value="quarter">Last Quarter</option>
              <option value="year">Last Year</option>
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Status:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm"
            >
              <option value="all">All Statuses</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>
        </div>

        {/* Payments Table */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Payment History ({filteredPayments.length})
            </h3>
          </div>
          
          {loading ? (
            <div className="p-6">
              <div className="animate-pulse space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-16 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Payment Method
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredPayments.map((payment) => (
                    <tr key={payment.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {payment.date.toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {payment.userEmail}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {payment.productName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${payment.amount.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(payment.status)}`}>
                          {payment.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {payment.paymentMethod}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
