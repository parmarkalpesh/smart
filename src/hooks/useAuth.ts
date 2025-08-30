
'use client';

import { useState, useEffect, useCallback } from 'react';
import useLocalStorage from './useLocalStorage';
import { useRouter } from 'next/navigation';

type UserRole = 'admin' | 'staff';

interface AuthUser {
  role: UserRole;
}

export function useAuth() {
  const [user, setUser] = useLocalStorage<AuthUser | null>('auth-user', null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    setLoading(false);
  }, [user]);

  const login = useCallback(
    (role: UserRole) => {
      setUser({ role });
    },
    [setUser]
  );

  const logout = useCallback(() => {
    setUser(null);
    router.push('/login');
  }, [setUser, router]);

  return { user, login, logout, loading };
}
