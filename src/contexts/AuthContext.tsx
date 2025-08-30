'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useLocalStorage from '@/hooks/useLocalStorage';
import { CredentialResponse, googleLogout } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';

type UserRole = 'admin' | 'staff';

interface GoogleUser {
  name: string;
  email: string;
  picture: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: GoogleUser | null;
  userRole: UserRole | null;
  loading: boolean;
  handleGoogleLogin: (cred: CredentialResponse) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// In a real app, this would come from a database
const ADMIN_USERS = ['admin@example.com'];

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useLocalStorage<GoogleUser | null>('user', null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const isAuthenticated = !!user;
  const userRole = user ? (ADMIN_USERS.includes(user.email) ? 'admin' : 'staff') : null;

  useEffect(() => {
    setLoading(false);
  }, [user]);

  const handleGoogleLogin = (cred: CredentialResponse) => {
    if (cred.credential) {
      const decoded: GoogleUser = jwtDecode(cred.credential);
      setUser({
        name: decoded.name,
        email: decoded.email,
        picture: decoded.picture,
      });
      router.push('/dashboard');
    }
  };

  const logout = () => {
    googleLogout();
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, userRole, loading, handleGoogleLogin, logout }}>
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
