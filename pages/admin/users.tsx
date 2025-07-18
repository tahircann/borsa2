import { useState, useEffect } from 'react';
import { useAuth } from '../../utils/auth';
import { FiUsers, FiMail, FiCalendar, FiShield, FiCreditCard, FiEdit, FiTrash, FiSearch } from 'react-icons/fi';
import Layout from '../../components/Layout';

interface User {
  id: string;
  email: string;
  username: string;
  isAdmin: boolean;
  membershipType: 'free' | 'premium';
  membershipExpiry?: Date;
  createdAt: Date;
  gumroadSubscription?: any;
}

export default function AdminUsersPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMembership, setFilterMembership] = useState<'all' | 'free' | 'premium'>('all');
  const [loading, setLoading] = useState(true);

  const isAdmin = user?.isAdmin || false;

  useEffect(() => {
    if (!isAdmin) {
      return;
    }
    loadUsers();
  }, [isAdmin]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      
      // Try to load from server first
      const response = await fetch('/api/admin/users', {
        headers: {
          'Authorization': 'admin-token',
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        const parsedUsers = data.users.map((u: any) => ({
          ...u,
          createdAt: new Date(u.createdAt),
          membershipExpiry: u.membershipExpiry ? new Date(u.membershipExpiry) : undefined
        }));
        setUsers(parsedUsers);
      } else {
        // Fallback to localStorage if server fails
        console.warn('Failed to load users from server, falling back to localStorage');
        const savedUsers = localStorage.getItem('users');
        if (savedUsers) {
          const parsedUsers = JSON.parse(savedUsers).map((u: any) => ({
            ...u,
            createdAt: new Date(u.createdAt),
            membershipExpiry: u.membershipExpiry ? new Date(u.membershipExpiry) : undefined
          }));
          setUsers(parsedUsers);
        }
      }
    } catch (error) {
      console.error('Error loading users:', error);
      // Fallback to localStorage
      const savedUsers = localStorage.getItem('users');
      if (savedUsers) {
        const parsedUsers = JSON.parse(savedUsers).map((u: any) => ({
          ...u,
          createdAt: new Date(u.createdAt),
          membershipExpiry: u.membershipExpiry ? new Date(u.membershipExpiry) : undefined
        }));
        setUsers(parsedUsers);
      }
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         u.username.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterMembership === 'all' || u.membershipType === filterMembership;
    return matchesSearch && matchesFilter;
  });

  const toggleUserAdmin = (userId: string) => {
    const updatedUsers = users.map(u => 
      u.id === userId ? { ...u, isAdmin: !u.isAdmin } : u
    );
    setUsers(updatedUsers);
    localStorage.setItem('users', JSON.stringify(updatedUsers));
  };

  const changeMembership = async (userId: string, newType: 'free' | 'premium_monthly' | 'premium_yearly') => {
    try {
      const membershipType: 'free' | 'premium' = newType === 'free' ? 'free' : 'premium';
      const duration = newType === 'premium_monthly' ? 'monthly' : newType === 'premium_yearly' ? 'yearly' : undefined;
      
      // Try to update on server first
      const response = await fetch('/api/admin/update-membership', {
        method: 'POST',
        headers: {
          'Authorization': 'admin-token',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          membershipType,
          duration,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Membership updated on server:', result);
        
        // Calculate expiry date
        let expiry: Date | undefined;
        if (membershipType === 'premium' && duration) {
          expiry = new Date();
          if (duration === 'monthly') {
            expiry.setMonth(expiry.getMonth() + 1);
          } else if (duration === 'yearly') {
            expiry.setFullYear(expiry.getFullYear() + 1);
          }
        }
        
        // Update local state
        const updatedUsers = users.map(u => 
          u.id === userId ? { 
            ...u, 
            membershipType: membershipType,
            membershipExpiry: expiry
          } : u
        );
        setUsers(updatedUsers);
        
        // Also update localStorage as backup
        localStorage.setItem('users', JSON.stringify(updatedUsers));
        
        alert('Membership updated successfully!');
      } else {
        throw new Error('Server update failed');
      }
    } catch (error) {
      console.error('Error updating membership:', error);
      
      // Calculate expiry date for fallback
      const membershipType: 'free' | 'premium' = newType === 'free' ? 'free' : 'premium';
      const duration = newType === 'premium_monthly' ? 'monthly' : newType === 'premium_yearly' ? 'yearly' : undefined;
      
      let expiry: Date | undefined;
      if (membershipType === 'premium' && duration) {
        expiry = new Date();
        if (duration === 'monthly') {
          expiry.setMonth(expiry.getMonth() + 1);
        } else if (duration === 'yearly') {
          expiry.setFullYear(expiry.getFullYear() + 1);
        }
      }
      
      // Fallback to localStorage only
      const updatedUsers = users.map(u => 
        u.id === userId ? { 
          ...u, 
          membershipType: membershipType,
          membershipExpiry: expiry
        } : u
      );
      setUsers(updatedUsers);
      localStorage.setItem('users', JSON.stringify(updatedUsers));
      
      alert('Membership updated locally (server update failed)');
    }
  };

  const deleteUser = (userId: string) => {
    if (confirm('Are you sure you want to delete this user?')) {
      const updatedUsers = users.filter(u => u.id !== userId);
      setUsers(updatedUsers);
      localStorage.setItem('users', JSON.stringify(updatedUsers));
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
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <FiUsers className="mr-3 h-8 w-8" />
            User Management
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage user accounts, subscriptions, and permissions
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search users by email or username..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <select
            value={filterMembership}
            onChange={(e) => setFilterMembership(e.target.value as 'all' | 'free' | 'premium')}
            className="px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Memberships</option>
            <option value="free">Free</option>
            <option value="premium">Premium</option>
          </select>
        </div>

        {/* Users Table */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Users ({filteredUsers.length})
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
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Membership
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Joined
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map((user) => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
                              <span className="text-white font-medium">
                                {user.username.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{user.username}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          user.membershipType === 'premium' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {user.membershipType}
                        </span>
                        {user.membershipExpiry && (
                          <div className="text-xs text-gray-500 mt-1">
                            Expires: {user.membershipExpiry.toLocaleDateString()}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          user.isAdmin 
                            ? 'bg-purple-100 text-purple-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {user.isAdmin ? 'Admin' : 'User'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.createdAt.toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => toggleUserAdmin(user.id)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <FiShield className="h-4 w-4" />
                        </button>
                        <select
                          value={user.membershipType === 'free' ? 'free' : 
                                user.membershipExpiry ? 
                                  (Math.abs(user.membershipExpiry.getTime() - new Date().getTime()) > 32 * 24 * 60 * 60 * 1000 ? 'premium_yearly' : 'premium_monthly')
                                  : 'premium_monthly'
                          }
                          onChange={(e) => changeMembership(user.id, e.target.value as 'free' | 'premium_monthly' | 'premium_yearly')}
                          className="text-xs border rounded px-2 py-1"
                        >
                          <option value="free">Free</option>
                          <option value="premium_monthly">Premium (1 Month)</option>
                          <option value="premium_yearly">Premium (1 Year)</option>
                        </select>
                        <button
                          onClick={() => deleteUser(user.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <FiTrash className="h-4 w-4" />
                        </button>
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
