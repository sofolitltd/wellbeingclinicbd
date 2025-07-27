
'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, User } from 'firebase/auth';
import { getAuth } from 'firebase/auth';
import { app } from '@/lib/firebase';

const auth = getAuth(app);

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, pass: string) => Promise<any>;
  logOut: () => Promise<void>;
}

const CounselorAuthContext = createContext<AuthContextType | undefined>(undefined);

export function CounselorAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, pass: string) => {
    return signInWithEmailAndPassword(auth, email, pass);
  };

  const logOut = async () => {
    return signOut(auth);
  };

  return (
    <CounselorAuthContext.Provider value={{ user, loading, signIn, logOut }}>
      {children}
    </CounselorAuthContext.Provider>
  );
}

export function useCounselorAuth() {
  const context = useContext(CounselorAuthContext);
  if (context === undefined) {
    throw new Error('useCounselorAuth must be used within a CounselorAuthProvider');
  }
  return context;
}
