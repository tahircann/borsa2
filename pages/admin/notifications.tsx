import { useState, useEffect } from 'react';
import { useAuth } from '../../utils/auth';
import { FiMail, FiBell, FiSend, FiUsers, FiShield, FiCalendar, FiEdit, FiTrash } from 'react-icons/fi';
import Layout from '../../components/Layout';

interface SystemNotification {
  id: string;
  title: string;
  message: string;
  type: 'system' | 'maintenance' | 'security' | 'promotional';
  targetAudience: 'all' | 'premium' | 'free' | 'admins';
  status: 'draft' | 'scheduled' | 'sent';
  createdAt: Date;
  scheduledFor?: Date;
  sentAt?: Date;
  recipientCount?: number;
}

export default function AdminNotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newNotification, setNewNotification] = useState({
    title: '',
    message: '',
    type: 'system' as const,
    targetAudience: 'all' as const,
    scheduleFor: ''
  });

  const isAdmin = user?.isAdmin || false;

  useEffect(() => {
    if (!isAdmin) return;
    loadNotifications();
  }, [isAdmin]);

  const loadNotifications = async () => {
    try {
      // Mock notifications - in real app, fetch from database
      const mockNotifications: SystemNotification[] = [
        {
          id: '1',
          title: 'Maintenance Scheduled',
          message: 'System maintenance will be performed on Sunday from 2-4 AM EST.',
          type: 'maintenance',
          targetAudience: 'all',
          status: 'sent',
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          sentAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          recipientCount: 150
        },
        {
          id: '2',
          title: 'New Premium Features',
          message: 'Check out our new advanced analytics dashboard!',
          type: 'promotional',
          targetAudience: 'premium',
          status: 'scheduled',
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          scheduledFor: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000)
        },
        {
          id: '3',
          title: 'Security Update',
          message: 'We have enhanced our security measures. Please review your account settings.',
          type: 'security',
          targetAudience: 'all',
          status: 'draft',
          createdAt: new Date()
        }
      ];
      setNotifications(mockNotifications);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const createNotification = async () => {
    if (!newNotification.title || !newNotification.message) {
      alert('Please fill in all required fields');
      return;
    }

    const notification: SystemNotification = {
      id: Date.now().toString(),
      title: newNotification.title,
      message: newNotification.message,
      type: newNotification.type,
      targetAudience: newNotification.targetAudience,
      status: newNotification.scheduleFor ? 'scheduled' : 'draft',
      createdAt: new Date(),
      scheduledFor: newNotification.scheduleFor ? new Date(newNotification.scheduleFor) : undefined
    };

    setNotifications([notification, ...notifications]);
    setNewNotification({
      title: '',
      message: '',
      type: 'system',
      targetAudience: 'all',
      scheduleFor: ''
    });
    setShowCreateModal(false);
  };

  const sendNotification = async (id: string) => {
    const updatedNotifications = notifications.map(n => 
      n.id === id ? { 
        ...n, 
        status: 'sent' as const, 
        sentAt: new Date(),
        recipientCount: Math.floor(Math.random() * 200) + 50 // Mock recipient count
      } : n
    );
    setNotifications(updatedNotifications);
  };

  const deleteNotification = (id: string) => {
    if (confirm('Are you sure you want to delete this notification?')) {
      setNotifications(notifications.filter(n => n.id !== id));
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'system': return 'bg-blue-100 text-blue-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      case 'security': return 'bg-red-100 text-red-800';
      case 'promotional': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'bg-green-100 text-green-800';
      case 'scheduled': return 'bg-yellow-100 text-yellow-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAudienceIcon = (audience: string) => {
    switch (audience) {
      case 'all': return <FiUsers className="h-4 w-4" />;
      case 'premium': return <FiMail className="h-4 w-4" />;
      case 'free': return <FiUsers className="h-4 w-4" />;
      case 'admins': return <FiShield className="h-4 w-4" />;
      default: return <FiUsers className="h-4 w-4" />;
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
              <FiBell className="mr-3 h-8 w-8" />
              System Notifications
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              Create and manage system-wide notifications for users
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            <FiMail className="mr-2 h-4 w-4" />
            Create Notification
          </button>
        </div>

        {/* Notification Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FiSend className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Sent</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {notifications.filter(n => n.status === 'sent').length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FiCalendar className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Scheduled</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {notifications.filter(n => n.status === 'scheduled').length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FiEdit className="h-8 w-8 text-gray-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Drafts</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {notifications.filter(n => n.status === 'draft').length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FiUsers className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Recipients</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {notifications.reduce((sum, n) => sum + (n.recipientCount || 0), 0)}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Notifications List */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              All Notifications ({notifications.length})
            </h3>
          </div>
          
          {loading ? (
            <div className="p-6">
              <div className="animate-pulse space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-20 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {notifications.map((notification) => (
                <div key={notification.id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="text-lg font-medium text-gray-900">{notification.title}</h4>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(notification.type)}`}>
                          {notification.type}
                        </span>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(notification.status)}`}>
                          {notification.status}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-3">{notification.message}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          {getAudienceIcon(notification.targetAudience)}
                          <span className="ml-1">Target: {notification.targetAudience}</span>
                        </div>
                        <div className="flex items-center">
                          <FiCalendar className="h-4 w-4 mr-1" />
                          <span>Created: {notification.createdAt.toLocaleDateString()}</span>
                        </div>
                        {notification.scheduledFor && (
                          <div className="flex items-center">
                            <FiCalendar className="h-4 w-4 mr-1" />
                            <span>Scheduled: {notification.scheduledFor.toLocaleDateString()}</span>
                          </div>
                        )}
                        {notification.recipientCount && (
                          <div className="flex items-center">
                            <FiUsers className="h-4 w-4 mr-1" />
                            <span>Recipients: {notification.recipientCount}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      {notification.status === 'draft' && (
                        <button
                          onClick={() => sendNotification(notification.id)}
                          className="text-green-600 hover:text-green-900"
                        >
                          <FiSend className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={() => deleteNotification(notification.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <FiTrash className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Create Notification Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Notification</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                    <input
                      type="text"
                      value={newNotification.title}
                      onChange={(e) => setNewNotification({...newNotification, title: e.target.value})}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      placeholder="Notification title"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                    <textarea
                      value={newNotification.message}
                      onChange={(e) => setNewNotification({...newNotification, message: e.target.value})}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      rows={3}
                      placeholder="Notification message"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                    <select
                      value={newNotification.type}
                      onChange={(e) => setNewNotification({...newNotification, type: e.target.value as any})}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                    >
                      <option value="system">System</option>
                      <option value="maintenance">Maintenance</option>
                      <option value="security">Security</option>
                      <option value="promotional">Promotional</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Target Audience</label>
                    <select
                      value={newNotification.targetAudience}
                      onChange={(e) => setNewNotification({...newNotification, targetAudience: e.target.value as any})}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                    >
                      <option value="all">All Users</option>
                      <option value="premium">Premium Users</option>
                      <option value="free">Free Users</option>
                      <option value="admins">Admins Only</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Schedule For (Optional)</label>
                    <input
                      type="datetime-local"
                      value={newNotification.scheduleFor}
                      onChange={(e) => setNewNotification({...newNotification, scheduleFor: e.target.value})}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={createNotification}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                  >
                    Create
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
