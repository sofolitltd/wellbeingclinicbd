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
    const userCredential = await signInWithEmailAndPassword(auth, email, pass);
    const idToken = await userCredential.user.getIdToken();

    await fetch('/api/auth/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken }),
    });

    return userCredential;
  };

  const logOut = async () => {
    await signOut(auth);
    await fetch('/api/auth/session', {
      method: 'DELETE',
    });
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
