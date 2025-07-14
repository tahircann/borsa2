import { useState, useEffect } from 'react';
import { useAuth } from '../../utils/auth';
import { FiShield, FiAlertTriangle, FiLock, FiEye, FiRefreshCw, FiUsers, FiActivity } from 'react-icons/fi';
import Layout from '../../components/Layout';

interface SecurityEvent {
  id: string;
  type: 'login' | 'failed_login' | 'password_change' | 'suspicious_activity';
  userEmail: string;
  timestamp: Date;
  ipAddress: string;
  userAgent: string;
  severity: 'low' | 'medium' | 'high';
}

export default function AdminSecurityPage() {
  const { user } = useAuth();
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');

  const isAdmin = user?.isAdmin || false;

  useEffect(() => {
    if (!isAdmin) return;
    loadSecurityEvents();
  }, [isAdmin]);

  const loadSecurityEvents = async () => {
    try {
      // Mock security events - in real app, fetch from security logs
      const mockEvents: SecurityEvent[] = [
        {
          id: '1',
          type: 'failed_login',
          userEmail: 'user1@example.com',
          timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
          ipAddress: '192.168.1.100',
          userAgent: 'Mozilla/5.0...',
          severity: 'medium'
        },
        {
          id: '2',
          type: 'suspicious_activity',
          userEmail: 'user2@example.com',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
          ipAddress: '10.0.0.50',
          userAgent: 'Chrome/91.0...',
          severity: 'high'
        },
        {
          id: '3',
          type: 'login',
          userEmail: 'user3@example.com',
          timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
          ipAddress: '172.16.0.1',
          userAgent: 'Safari/14.1...',
          severity: 'low'
        }
      ];
      setSecurityEvents(mockEvents);
    } catch (error) {
      console.error('Error loading security events:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'login': return <FiEye className="h-4 w-4" />;
      case 'failed_login': return <FiAlertTriangle className="h-4 w-4" />;
      case 'password_change': return <FiLock className="h-4 w-4" />;
      case 'suspicious_activity': return <FiShield className="h-4 w-4" />;
      default: return <FiActivity className="h-4 w-4" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getEventTypeLabel = (type: string) => {
    switch (type) {
      case 'login': return 'Login';
      case 'failed_login': return 'Failed Login';
      case 'password_change': return 'Password Change';
      case 'suspicious_activity': return 'Suspicious Activity';
      default: return type;
    }
  };

  const filteredEvents = securityEvents.filter(event => 
    filter === 'all' || event.severity === filter
  );

  const getSecurityStats = () => {
    const high = securityEvents.filter(e => e.severity === 'high').length;
    const medium = securityEvents.filter(e => e.severity === 'medium').length;
    const low = securityEvents.filter(e => e.severity === 'low').length;
    const failedLogins = securityEvents.filter(e => e.type === 'failed_login').length;
    
    return { high, medium, low, failedLogins };
  };

  const stats = getSecurityStats();

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
              <FiShield className="mr-3 h-8 w-8" />
              Security Dashboard
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              Monitor security events and user access patterns
            </p>
          </div>
          <button
            onClick={loadSecurityEvents}
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
          >
            <FiRefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Security Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FiAlertTriangle className="h-8 w-8 text-red-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">High Severity</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.high}</dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FiShield className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Medium Severity</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.medium}</dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FiLock className="h-8 w-8 text-red-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Failed Logins</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.failedLogins}</dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FiUsers className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Active Sessions</dt>
                  <dd className="text-lg font-medium text-gray-900">23</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Security Settings</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">Two-Factor Authentication</p>
                  <p className="text-xs text-gray-500">Require 2FA for admin accounts</p>
                </div>
                <div className="flex items-center">
                  <input type="checkbox" className="rounded border-gray-300 text-blue-600" defaultChecked />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">Session Timeout</p>
                  <p className="text-xs text-gray-500">Auto-logout after inactivity</p>
                </div>
                <select className="text-sm border border-gray-300 rounded px-2 py-1">
                  <option>30 minutes</option>
                  <option>1 hour</option>
                  <option>2 hours</option>
                  <option>Never</option>
                </select>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">IP Whitelist</p>
                  <p className="text-xs text-gray-500">Restrict admin access by IP</p>
                </div>
                <div className="flex items-center">
                  <input type="checkbox" className="rounded border-gray-300 text-blue-600" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Security Monitoring</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">Real-time Alerts</p>
                  <p className="text-xs text-gray-500">Email notifications for security events</p>
                </div>
                <div className="flex items-center">
                  <input type="checkbox" className="rounded border-gray-300 text-blue-600" defaultChecked />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">Login Attempt Logging</p>
                  <p className="text-xs text-gray-500">Log all authentication attempts</p>
                </div>
                <div className="flex items-center">
                  <input type="checkbox" className="rounded border-gray-300 text-blue-600" defaultChecked />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">Suspicious Activity Detection</p>
                  <p className="text-xs text-gray-500">AI-powered threat detection</p>
                </div>
                <div className="flex items-center">
                  <input type="checkbox" className="rounded border-gray-300 text-blue-600" defaultChecked />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Security Events Filter */}
        <div className="mb-6">
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-gray-700">Filter by Severity:</label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm"
            >
              <option value="all">All Events</option>
              <option value="high">High Severity</option>
              <option value="medium">Medium Severity</option>
              <option value="low">Low Severity</option>
            </select>
          </div>
        </div>

        {/* Security Events Table */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Recent Security Events ({filteredEvents.length})
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
                      Event
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      IP Address
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Severity
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredEvents.map((event) => (
                    <tr key={event.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 mr-3">
                            {getEventIcon(event.type)}
                          </div>
                          <div className="text-sm text-gray-900">
                            {getEventTypeLabel(event.type)}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {event.userEmail}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {event.timestamp.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {event.ipAddress}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSeverityColor(event.severity)}`}>
                          {event.severity}
                        </span>
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
