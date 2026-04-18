import React, { createContext, useContext, useState, useEffect } from 'react';
import apiClient from '../api/apiClient';

interface User {
  userId: string;
  email: string;
  role: 'ADMIN' | 'STAFF' | 'RENTER';
  branchId: string | null;
  branchName: string | null;
  verified: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, userData: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));

  const fetchProfile = async () => {
    try {
      const { data } = await apiClient.get('/api/users/me');
      const enrichedUser: User = {
        userId: data.userId,
        email: data.email,
        role: data.role,
        branchId: data.branchId,
        branchName: data.branchName,
        verified: data.verified,
      };
      setUser(enrichedUser);
      localStorage.setItem('user', JSON.stringify(enrichedUser));
    } catch {
      // If profile fetch fails, fall back to stored data
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    }
  };

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser && token) {
      setUser(JSON.parse(savedUser));
      // Enrich with fresh data from backend
      fetchProfile();
    }
  }, [token]);

  const login = async (newToken: string, userData: User) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);
    // Immediately fetch full profile after login
    try {
      const { data } = await apiClient.get('/api/users/me');
      const enriched: User = {
        userId: data.userId,
        email: data.email,
        role: data.role,
        branchId: data.branchId,
        branchName: data.branchName,
        verified: data.verified,
      };
      setUser(enriched);
      localStorage.setItem('user', JSON.stringify(enriched));
    } catch {
      // Keep basic user data from login response
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!token, refreshProfile: fetchProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
