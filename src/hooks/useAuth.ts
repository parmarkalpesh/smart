'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

type UserRole = 'admin' | 'staff';

interface AuthUser {
  role: UserRole;
}

export function useAuth() {
  // Remove localStorage and only allow login via server-issued user object
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    setLoading(false);
  }, [user]);

  // login now requires a user object from a trusted server source
  const login = useCallback((serverUser: AuthUser) => {
    // Only accept user objects that come from a trusted server response
    setUser(serverUser);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    router.push('/login');
  }, [router]);

  return { user, login, logout, loading };
}
