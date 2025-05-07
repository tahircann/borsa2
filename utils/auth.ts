import { useState, useEffect } from 'react';

// Types
export interface User {
  username: string;
  isAdmin: boolean;
}

// Admin credentials (in a real app, this would be verified server-side)
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = '123456';

// Check if running on client side
const isBrowser = () => typeof window !== 'undefined';

// Login function
export const login = (username: string, password: string): boolean => {
  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    if (isBrowser()) {
      localStorage.setItem('user', JSON.stringify({ username, isAdmin: true }));
    }
    return true;
  }
  return false;
};

// Logout function
export const logout = (): void => {
  if (isBrowser()) {
    localStorage.removeItem('user');
  }
};

// Get current user
export const getUser = (): User | null => {
  if (isBrowser()) {
    const userStr = localStorage.getItem('user');
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

// Custom hook for authentication
export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isBrowser()) {
      const user = getUser();
      setUser(user);
      setLoading(false);
    }
  }, []);

  return {
    user,
    loading,
    login: (username: string, password: string) => {
      const success = login(username, password);
      if (success) {
        setUser({ username, isAdmin: true });
      }
      return success;
    },
    logout: () => {
      logout();
      setUser(null);
    },
    isAuthenticated: () => user !== null
  };
}; 