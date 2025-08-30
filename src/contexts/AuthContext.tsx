'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useLocalStorage from '@/hooks/useLocalStorage';

type UserRole = 'admin' | 'staff';

interface AuthContextType {
  isAuthenticated: boolean;
  userRole: UserRole | null;
  loading: boolean;
  login: (role: UserRole) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [userRole, setUserRole] = useLocalStorage<UserRole | null>('userRole', null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  
  const isAuthenticated = !!userRole;

  useEffect(() => {
    setLoading(false);
  }, [userRole]);

  const login = (role: UserRole) => {
    setUserRole(role);
    router.push('/dashboard');
  };

  const logout = () => {
    setUserRole(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, userRole, loading, login, logout }}>
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
