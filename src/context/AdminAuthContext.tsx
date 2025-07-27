
'use client';

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { verifyAdminCredentials } from '@/app/(admin)/admin/actions';

interface AdminUser {
  username: string;
}

interface AuthContextType {
  user: AdminUser | null;
  loading: boolean;
  signIn: (username: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  logOut: () => void;
}

const AdminAuthContext = createContext<AuthContextType | undefined>(undefined);

const SESSION_STORAGE_KEY = 'wbc-admin-session';

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const storedUser = sessionStorage.getItem(SESSION_STORAGE_KEY);
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to parse admin session:", error);
      sessionStorage.removeItem(SESSION_STORAGE_KEY);
    } finally {
      setLoading(false);
    }
  }, []);

  const signIn = async (username: string, pass: string) => {
    setLoading(true);
    const result = await verifyAdminCredentials({ username, password: pass });
    if (result.success && result.user) {
      setUser(result.user);
      sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(result.user));
      setLoading(false);
      return { success: true };
    } else {
      setLoading(false);
      return { success: false, error: result.error || "An unknown error occurred." };
    }
  };

  const logOut = useCallback(() => {
    setUser(null);
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
  }, []);

  return (
    <AdminAuthContext.Provider value={{ user, loading, signIn, logOut }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
}
