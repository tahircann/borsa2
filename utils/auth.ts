import { useState, useEffect } from 'react';

// Types
export interface User {
  id: string;
  email: string;
  username: string;
  isAdmin: boolean;
  membershipType: 'free' | 'premium';
  membershipExpiry?: Date;
  createdAt: Date;
  gumroadSubscription?: any;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
}

// Admin credentials (in a real app, this would be verified server-side)
const ADMIN_EMAIL = 'admin@esenglobal.com';
const ADMIN_PASSWORD = '123456';
const ADMIN_USERNAME = 'admin';

// Check if running on client side
const isBrowser = () => typeof window !== 'undefined';

// Simple password hashing function (for demo purposes)
const hashPassword = (password: string): string => {
  // In a real app, use bcrypt or similar
  return btoa(password + 'salt123');
};

// Simple password verification
const verifyPassword = (password: string, hash: string): boolean => {
  return hashPassword(password) === hash;
};

// Get users from localStorage
export const getUsers = (): User[] => {
  if (!isBrowser()) return [];
  const usersStr = localStorage.getItem('users');
  return usersStr ? JSON.parse(usersStr) : [];
};

// Save users to localStorage
export const saveUsers = (users: User[]): void => {
  if (!isBrowser()) return;
  localStorage.setItem('users', JSON.stringify(users));
};

// Generate simple ID
const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Register function
export const register = async (credentials: RegisterCredentials): Promise<{ success: boolean; message: string; user?: User }> => {
  const { email, username, password, confirmPassword } = credentials;
  
  // Validation
  if (!email || !username || !password || !confirmPassword) {
    return { success: false, message: 'Tüm alanları doldurun' };
  }
  
  if (password !== confirmPassword) {
    return { success: false, message: 'Şifreler eşleşmiyor' };
  }
  
  if (password.length < 6) {
    return { success: false, message: 'Şifre en az 6 karakter olmalı' };
  }
  
  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { success: false, message: 'Geçerli bir email adresi girin' };
  }

  try {
    // Try to register via API first
    const response = await fetch('/api/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, username, password }),
    });

    const data = await response.json();

    if (response.ok) {
      return { success: true, message: 'Kayıt başarılı! Şimdi giriş yapabilirsiniz.', user: data.user };
    } else {
      // If API fails, fall back to localStorage
      console.log('API registration failed, using localStorage fallback:', data.error);
    }
  } catch (error) {
    console.error('Registration API error:', error);
  }

  // Fallback to localStorage
  const users = getUsers();
  
  // Check if user already exists
  if (users.find(u => u.email === email)) {
    return { success: false, message: 'Bu email adresi zaten kullanılıyor' };
  }
  
  if (users.find(u => u.username === username)) {
    return { success: false, message: 'Bu kullanıcı adı zaten kullanılıyor' };
  }
  
  // Create new user
  const newUser: User = {
    id: generateId(),
    email,
    username,
    isAdmin: false,
    membershipType: 'free',
    createdAt: new Date()
  };
  
  users.push(newUser);
  saveUsers(users);
  
  // Store password hash
  if (isBrowser()) {
    localStorage.setItem(`password_${newUser.id}`, hashPassword(password));
  }
  
  return { success: true, message: 'Kayıt başarılı! Şimdi giriş yapabilirsiniz.', user: newUser };
};

// Login function
export const login = async (credentials: LoginCredentials): Promise<{ success: boolean; message: string; user?: User }> => {
  const { email, password } = credentials;
  
  try {
    // Try to login via API first
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (response.ok) {
      if (isBrowser()) {
        localStorage.setItem('currentUser', JSON.stringify(data.user));
      }
      return { success: true, message: 'Giriş başarılı', user: data.user };
    } else {
      // If API fails, fall back to localStorage
      console.log('API login failed, using localStorage fallback:', data.error);
    }
  } catch (error) {
    console.error('Login API error:', error);
  }

  // Fallback to localStorage
  // Check admin credentials
  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    const adminUser: User = {
      id: 'admin',
      email: ADMIN_EMAIL,
      username: ADMIN_USERNAME,
      isAdmin: true,
      membershipType: 'premium',
      createdAt: new Date()
    };
    
    if (isBrowser()) {
      localStorage.setItem('currentUser', JSON.stringify(adminUser));
    }
    return { success: true, message: 'Giriş başarılı', user: adminUser };
  }
  
  // Check regular users
  const users = getUsers();
  const user = users.find(u => u.email === email);
  
  if (!user) {
    return { success: false, message: 'Email adresi bulunamadı' };
  }
  
  // For demo purposes, we'll use simple password verification
  // In a real app, you'd hash and compare passwords properly
  const storedPasswordHash = localStorage.getItem(`password_${user.id}`);
  if (!storedPasswordHash || !verifyPassword(password, storedPasswordHash)) {
    return { success: false, message: 'Şifre yanlış' };
  }
  
  // Check if membership expired
  if (user.membershipExpiry && new Date() > new Date(user.membershipExpiry)) {
    user.membershipType = 'free';
    user.membershipExpiry = undefined;
    const updatedUsers = users.map(u => u.id === user.id ? user : u);
    saveUsers(updatedUsers);
  }
  
  if (isBrowser()) {
    localStorage.setItem('currentUser', JSON.stringify(user));
  }
  
  return { success: true, message: 'Giriş başarılı', user };
};

// Store password when registering (demo purposes)
export const storePassword = (userId: string, password: string): void => {
  if (!isBrowser()) return;
  localStorage.setItem(`password_${userId}`, hashPassword(password));
};

// Logout function
export const logout = (): void => {
  if (isBrowser()) {
    localStorage.removeItem('currentUser');
  }
};

// Get current user
export const getUser = (): User | null => {
  if (isBrowser()) {
    const userStr = localStorage.getItem('currentUser');
    if (userStr) {
      return JSON.parse(userStr);
    }
  }
  return null;
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  return getUser() !== null;
};

// Check if user has premium membership
export const hasPremiumMembership = (): boolean => {
  const user = getUser();
  if (!user) return false;
  
  // Admin always has premium access
  if (user.isAdmin) return true;
  
  // Check premium membership and expiry
  if (user.membershipType === 'premium') {
    if (!user.membershipExpiry) return true; // Lifetime premium
    return new Date() <= new Date(user.membershipExpiry);
  }
  
  return false;
};

// Update user membership
export const updateMembership = (membershipType: 'monthly' | 'yearly'): boolean => {
  const user = getUser();
  if (!user) return false;
  
  const now = new Date();
  const expiry = new Date(now);
  
  if (membershipType === 'monthly') {
    expiry.setMonth(expiry.getMonth() + 1);
  } else if (membershipType === 'yearly') {
    expiry.setFullYear(expiry.getFullYear() + 1);
  }
  
  user.membershipType = 'premium';
  user.membershipExpiry = expiry;
  
  // Update in localStorage
  if (isBrowser()) {
    localStorage.setItem('currentUser', JSON.stringify(user));
    
    // Update in users array
    const users = getUsers();
    const updatedUsers = users.map(u => u.id === user.id ? user : u);
    saveUsers(updatedUsers);
  }
  
  return true;
};

// Update user membership by email (for webhook usage)
export const updateMembershipByEmail = (email: string, membershipType: 'monthly' | 'yearly', gumroadData?: any): boolean => {
  if (!isBrowser()) return false;
  
  const users = getUsers();
  const user = users.find(u => u.email === email);
  
  if (!user) {
    console.log(`❌ User not found for email: ${email}`);
    return false;
  }
  
  const now = new Date();
  const expiry = new Date(now);
  
  if (membershipType === 'monthly') {
    expiry.setMonth(expiry.getMonth() + 1);
  } else if (membershipType === 'yearly') {
    expiry.setFullYear(expiry.getFullYear() + 1);
  }
  
  user.membershipType = 'premium';
  user.membershipExpiry = expiry;
  if (gumroadData) {
    user.gumroadSubscription = gumroadData;
  }
  
  // Update in users array
  const updatedUsers = users.map(u => u.id === user.id ? user : u);
  saveUsers(updatedUsers);
  
  // If this is the current user, update current user data too
  const currentUser = getUser();
  if (currentUser && currentUser.id === user.id) {
    localStorage.setItem('currentUser', JSON.stringify(user));
    // Trigger auth state change event
    window.dispatchEvent(new CustomEvent('authStateChange', { detail: user }));
  }
  
  console.log(`✅ Updated membership for ${email} to ${membershipType} premium until ${expiry.toLocaleDateString()}`);
  return true;
};

// Remove user membership (for cancellations/refunds)
export const removeMembershipByEmail = (email: string): boolean => {
  if (!isBrowser()) return false;
  
  const users = getUsers();
  const user = users.find(u => u.email === email);
  
  if (!user) {
    console.log(`❌ User not found for email: ${email}`);
    return false;
  }
  
  user.membershipType = 'free';
  user.membershipExpiry = undefined;
  user.gumroadSubscription = undefined;
  
  // Update in users array
  const updatedUsers = users.map(u => u.id === user.id ? user : u);
  saveUsers(updatedUsers);
  
  // If this is the current user, update current user data too
  const currentUser = getUser();
  if (currentUser && currentUser.id === user.id) {
    localStorage.setItem('currentUser', JSON.stringify(user));
    // Trigger auth state change event
    window.dispatchEvent(new CustomEvent('authStateChange', { detail: user }));
  }
  
  console.log(`✅ Removed membership for ${email}`);
  return true;
};

// Check membership status from server API
const checkMembershipFromServer = async (email: string): Promise<{ type: 'free' | 'premium', expiry?: string, isActive: boolean }> => {
  try {
    const response = await fetch(`/api/membership/update?email=${encodeURIComponent(email)}`);
    const data = await response.json();
    
    return {
      type: data.membershipType || 'free',
      expiry: data.expiry,
      isActive: data.isActive || false
    };
  } catch (error) {
    console.error('Failed to check membership from server:', error);
    return { type: 'free', isActive: false };
  }
};

// Refresh membership from server and update local storage
export const refreshMembershipFromServer = async (): Promise<boolean> => {
  const user = getUser();
  if (!user) return false;

  try {
    const serverMembership = await checkMembershipFromServer(user.email);
    
    if (serverMembership.type === 'premium' && serverMembership.isActive) {
      // Update local user with server membership data
      user.membershipType = 'premium';
      user.membershipExpiry = serverMembership.expiry ? new Date(serverMembership.expiry) : undefined;
      
      // Update users array
      const users = getUsers();
      const userIndex = users.findIndex(u => u.id === user.id);
      if (userIndex !== -1) {
        users[userIndex] = user;
        if (typeof window !== 'undefined') {
          localStorage.setItem('users', JSON.stringify(users));
          localStorage.setItem('currentUser', JSON.stringify(user));
        }
      }
      
      console.log('✅ Membership refreshed from server - Premium active');
      return true;
    } else {
      // Update to free membership
      user.membershipType = 'free';
      user.membershipExpiry = undefined;
      
      // Update users array
      const users = getUsers();
      const userIndex = users.findIndex(u => u.id === user.id);
      if (userIndex !== -1) {
        users[userIndex] = user;
        if (typeof window !== 'undefined') {
          localStorage.setItem('users', JSON.stringify(users));
          localStorage.setItem('currentUser', JSON.stringify(user));
        }
      }
      
      console.log('ℹ️ Membership refreshed from server - Free membership');
      return false;
    }
  } catch (error) {
    console.error('Failed to refresh membership from server:', error);
    return false;
  }
};

// Custom hook for authentication
export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Listen for storage changes to sync across tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'currentUser') {
        setUser(e.newValue ? JSON.parse(e.newValue) : null);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  useEffect(() => {
    if (isBrowser()) {
      const currentUser = getUser();
      setUser(currentUser);
      
      // Check server membership status if user is logged in
      if (currentUser && !currentUser.isAdmin) {
        checkMembershipFromServer(currentUser.email).then(serverMembership => {
          if (serverMembership.isActive && serverMembership.type === 'premium') {
            // Update local user data with server membership
            currentUser.membershipType = 'premium';
            if (serverMembership.expiry) {
              currentUser.membershipExpiry = new Date(serverMembership.expiry);
            }
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            setUser({ ...currentUser });
            console.log('✅ Synced premium membership from server');
          } else if (currentUser.membershipType === 'premium' && !serverMembership.isActive) {
            // Server says no premium, but local says yes - server wins
            currentUser.membershipType = 'free';
            currentUser.membershipExpiry = undefined;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            setUser({ ...currentUser });
            console.log('⚠️ Premium membership expired - updated from server');
          }
        }).catch(error => {
          console.error('Failed to sync membership from server:', error);
        });
      }
      
      setLoading(false);
    }
  }, []);

  const loginUser = async (credentials: LoginCredentials) => {
    const result = await login(credentials);
    if (result.success && result.user) {
      setUser(result.user);
      
      // Check server membership status for non-admin users
      if (!result.user.isAdmin) {
        try {
          const serverMembership = await checkMembershipFromServer(result.user.email);
          if (serverMembership.isActive && serverMembership.type === 'premium') {
            // Update user with server membership data
            result.user.membershipType = 'premium';
            if (serverMembership.expiry) {
              result.user.membershipExpiry = new Date(serverMembership.expiry);
            }
            localStorage.setItem('currentUser', JSON.stringify(result.user));
            setUser({ ...result.user });
            console.log('✅ Synced premium membership from server on login');
          }
        } catch (error) {
          console.error('Failed to sync membership on login:', error);
        }
      }
      
      // Trigger a custom event to notify other components
      window.dispatchEvent(new CustomEvent('authStateChange', { detail: result.user }));
    }
    return result;
  };

  const logoutUser = () => {
    logout();
    setUser(null);
    // Trigger a custom event to notify other components
    window.dispatchEvent(new CustomEvent('authStateChange', { detail: null }));
  };

  const registerUser = async (credentials: RegisterCredentials) => {
    const result = await register(credentials);
    if (result.success && result.user) {
      // Store password for demo
      storePassword(result.user.id, credentials.password);
    }
    return result;
  };

  const updateUserMembership = (type: 'monthly' | 'yearly') => {
    const success = updateMembership(type);
    if (success) {
      const updatedUser = getUser();
      setUser(updatedUser);
      // Trigger a custom event to notify other components
      window.dispatchEvent(new CustomEvent('authStateChange', { detail: updatedUser }));
    }
    return success;
  };

  const refreshMembershipFromServerHook = async () => {
    const success = await refreshMembershipFromServer();
    if (success) {
      const updatedUser = getUser();
      setUser(updatedUser);
      // Trigger a custom event to notify other components
      window.dispatchEvent(new CustomEvent('authStateChange', { detail: updatedUser }));
    }
    return success;
  };

  return {
    user,
    loading,
    register: registerUser,
    login: loginUser,
    logout: logoutUser,
    isAuthenticated: () => user !== null,
    hasPremiumMembership: () => {
      if (!user) return false;
      if (user.isAdmin) return true;
      if (user.membershipType === 'premium') {
        if (!user.membershipExpiry) return true;
        return new Date() <= new Date(user.membershipExpiry);
      }
      return false;
    },
    updateMembership: updateUserMembership,
    refreshMembershipFromServer: refreshMembershipFromServerHook
  };
};