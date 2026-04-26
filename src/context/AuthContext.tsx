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
  user: User | null;
  loading: boolean;
  authChecking: boolean;
  loginFromResponse: (userData: User) => void;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);

  const clearRefreshTimer = useCallback(() => {
    if (refreshTimerRef.current) {
      clearInterval(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }
  }, []);

  const startRefreshTimer = useCallback(() => {
    clearRefreshTimer();
    refreshTimerRef.current = setInterval(() => {
      refreshUser();
    }, 13 * 60 * 1000);
  }, [clearRefreshTimer]);

  const refreshUser = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include',
      });
      if (res.ok) {
        await fetch('/api/auth/me', {
          credentials: 'include',
        }).then(r => r.json()).then(data => {
          if (data.user) {
            setUser(data.user);
          } else {
            setUser(null);
            clearRefreshTimer();
          }
        });
      } else {
        setUser(null);
        clearRefreshTimer();
      }
    } catch {
      setUser(null);
      clearRefreshTimer();
    }
  }, [clearRefreshTimer]);

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