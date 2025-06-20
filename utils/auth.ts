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
export const register = (credentials: RegisterCredentials): { success: boolean; message: string; user?: User } => {
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
  
  return { success: true, message: 'Kayıt başarılı! Şimdi giriş yapabilirsiniz.', user: newUser };
};

// Login function
export const login = (credentials: LoginCredentials): { success: boolean; message: string; user?: User } => {
  const { email, password } = credentials;
  
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
      setLoading(false);
    }
  }, []);

  const loginUser = (credentials: LoginCredentials) => {
    const result = login(credentials);
    if (result.success && result.user) {
      setUser(result.user);
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

  const registerUser = (credentials: RegisterCredentials) => {
    const result = register(credentials);
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
    updateMembership: updateUserMembership
  };
}; 