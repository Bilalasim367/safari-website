'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'customer' | 'admin';
  avatar?: string;
}

interface AuthContextType {
  user: User | null | undefined;
  loading: boolean;
  authChecking: boolean;
  loginFromResponse: (userData: User) => void;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  // undefined = session still being checked, null = confirmed logged out
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);

  const clearRefreshTimer = useCallback(() => {
    if (refreshTimerRef.current) {
      clearInterval(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }
  }, []);

  const refreshUser = useCallback(async () => {
    const readSession = async (): Promise<boolean> => {
      const r = await fetch('/api/auth/me', {
        credentials: 'include',
      });
      const data = await r.json().catch(() => null);
      if (data?.user) {
        setUser(data.user);
        return true;
      }
      setUser(null);
      clearRefreshTimer();
      return false;
    };

    try {
      await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include',
      });
    } catch {
      // network-level failures must not wipe a valid access token below
    }
    // Refresh failure falls back to the access token cookie, so /api/auth/me
    // is the single source of truth for the client-side session state.
    await readSession();
  }, [clearRefreshTimer]);

  const startRefreshTimer = useCallback(() => {
    clearRefreshTimer();
    refreshTimerRef.current = setInterval(() => {
      refreshUser();
    }, 13 * 60 * 1000);
  }, [clearRefreshTimer, refreshUser]);

  const logout = useCallback(async () => {
    setLoading(true);
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (e) {
      console.error('Logout error:', e);
    } finally {
      setUser(null);
      clearRefreshTimer();
      setLoading(false);
    }
  }, [clearRefreshTimer]);

  const loginFromResponse = useCallback((userData: User) => {
    setUser(userData);
    startRefreshTimer();
  }, [startRefreshTimer]);

  useEffect(() => {
    const initAuth = async () => {
      setAuthChecking(true);
      await refreshUser();
      setAuthChecking(false);
    };
    initAuth();
    
    return () => clearRefreshTimer();
  }, [refreshUser, clearRefreshTimer]);

  return (
    <AuthContext.Provider value={{ user, loading, authChecking, loginFromResponse, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
