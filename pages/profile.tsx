import { useState, useEffect, useContext } from 'react';
import { useAuth, User } from '../utils/auth';
import { FiUser, FiMail, FiEdit2, FiSave, FiX, FiShield } from 'react-icons/fi';
import { LanguageContext } from './_app';
import { useRouter } from 'next/router';

export default function Profile() {
  const { user, isAuthenticated } = useAuth();
  const { language } = useContext(LanguageContext);
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState<Partial<User>>({});
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  // Initialize edited user data when user changes
  useEffect(() => {
    if (user) {
      setEditedUser({
        username: user.username,
        email: user.email,
      });
    }
  }, [user]);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-t-4 border-b-4 border-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">
            {language === 'en' ? 'Loading...' : 'Yükleniyor...'}
          </p>
        </div>
      </div>
    );
  }

  const handleEdit = () => {
    setIsEditing(true);
    setMessage('');
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedUser({
      username: user.username,
      email: user.email,
    });
    setMessage('');
  };

  const handleSave = () => {
    try {
      // Validation
      if (!editedUser.username || !editedUser.email) {
        setMessage(language === 'en' ? 'All fields are required' : 'Tüm alanlar gereklidir');
        setMessageType('error');
        return;
      }

      if (editedUser.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editedUser.email)) {
        setMessage(language === 'en' ? 'Please enter a valid email address' : 'Geçerli bir email adresi girin');
        setMessageType('error');
        return;
      }

      // Update user in localStorage
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const updatedUsers = users.map((u: User) => 
        u.id === user.id 
          ? { ...u, username: editedUser.username, email: editedUser.email }
          : u
      );
      localStorage.setItem('users', JSON.stringify(updatedUsers));

      // Update current user
      const updatedCurrentUser = { ...user, username: editedUser.username, email: editedUser.email };
      localStorage.setItem('currentUser', JSON.stringify(updatedCurrentUser));

      setIsEditing(false);
      setMessage(language === 'en' ? 'Profile updated successfully!' : 'Profil başarıyla güncellendi!');
      setMessageType('success');

      // Force page refresh to update navbar
      setTimeout(() => {
        window.location.reload();
      }, 1500);

    } catch (error) {
      setMessage(language === 'en' ? 'An error occurred while updating profile' : 'Profil güncellenirken bir hata oluştu');
      setMessageType('error');
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString(language === 'en' ? 'en-US' : 'tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatMembershipExpiry = () => {
    if (!user.membershipExpiry) {
      return language === 'en' ? 'Lifetime' : 'Süresiz';
    }
    return formatDate(user.membershipExpiry);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <FiUser className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  {language === 'en' ? 'Profile' : 'Profil'}
                </h1>
                <p className="text-blue-100">
                  {language === 'en' ? 'Manage your account information' : 'Hesap bilgilerinizi yönetin'}
                </p>
              </div>
            </div>
            {!isEditing && (
              <button
                onClick={handleEdit}
                className="flex items-center px-4 py-2 bg-white bg-opacity-20 text-white rounded-lg hover:bg-opacity-30 transition-colors"
              >
                <FiEdit2 className="w-4 h-4 mr-2" />
                {language === 'en' ? 'Edit Profile' : 'Profili Düzenle'}
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {message && (
            <div className={`mb-6 p-4 rounded-lg ${
              messageType === 'success' 
                ? 'bg-green-50 text-green-800 border border-green-200' 
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {message}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">
                {language === 'en' ? 'Basic Information' : 'Temel Bilgiler'}
              </h3>

              {/* Username */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {language === 'en' ? 'Username' : 'Kullanıcı Adı'}
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedUser.username || ''}
                    onChange={(e) => setEditedUser({ ...editedUser, username: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <div className="flex items-center px-3 py-2 bg-gray-50 border border-gray-200 rounded-md">
                    <FiUser className="w-4 h-4 text-gray-500 mr-2" />
                    <span className="text-gray-900">{user.username}</span>
                  </div>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {language === 'en' ? 'Email Address' : 'E-posta Adresi'}
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    value={editedUser.email || ''}
                    onChange={(e) => setEditedUser({ ...editedUser, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <div className="flex items-center px-3 py-2 bg-gray-50 border border-gray-200 rounded-md">
                    <FiMail className="w-4 h-4 text-gray-500 mr-2" />
                    <span className="text-gray-900">{user.email}</span>
                  </div>
                )}
              </div>

              {isEditing && (
                <div className="flex space-x-3">
                  <button
                    onClick={handleSave}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    <FiSave className="w-4 h-4 mr-2" />
                    {language === 'en' ? 'Save Changes' : 'Değişiklikleri Kaydet'}
                  </button>
                  <button
                    onClick={handleCancel}
                    className="flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                  >
                    <FiX className="w-4 h-4 mr-2" />
                    {language === 'en' ? 'Cancel' : 'İptal'}
                  </button>
                </div>
              )}
            </div>

            {/* Account Information */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">
                {language === 'en' ? 'Account Information' : 'Hesap Bilgileri'}
              </h3>

              {/* User ID */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {language === 'en' ? 'User ID' : 'Kullanıcı ID'}
                </label>
                <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md">
                  <span className="text-gray-900 font-mono text-sm">{user.id}</span>
                </div>
              </div>

              {/* Account Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {language === 'en' ? 'Account Type' : 'Hesap Türü'}
                </label>
                <div className="flex items-center px-3 py-2 bg-gray-50 border border-gray-200 rounded-md">
                  <FiShield className="w-4 h-4 text-gray-500 mr-2" />
                  <span className={`font-medium ${user.isAdmin ? 'text-purple-600' : 'text-gray-900'}`}>
                    {user.isAdmin 
                      ? (language === 'en' ? 'Administrator' : 'Yönetici')
                      : (language === 'en' ? 'Regular User' : 'Normal Kullanıcı')
                    }
                  </span>
                </div>
              </div>

              {/* Membership Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {language === 'en' ? 'Membership Status' : 'Üyelik Durumu'}
                </label>
                <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md">
                  <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    user.membershipType === 'premium' 
                      ? 'bg-yellow-100 text-yellow-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {user.membershipType === 'premium' 
                      ? (language === 'en' ? 'Premium' : 'Premium')
                      : (language === 'en' ? 'Free' : 'Ücretsiz')
                    }
                  </div>
                  {user.membershipType === 'premium' && (
                    <div className="text-sm text-gray-600 mt-1">
                      {language === 'en' ? 'Expires: ' : 'Bitiş tarihi: '}
                      {formatMembershipExpiry()}
                    </div>
                  )}
                </div>
              </div>

              {/* Member Since */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {language === 'en' ? 'Member Since' : 'Üyelik Tarihi'}
                </label>
                <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md">
                  <span className="text-gray-900">{formatDate(user.createdAt)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 