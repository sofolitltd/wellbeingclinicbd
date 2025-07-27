
'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, User } from 'firebase/auth';
import { getAuth } from 'firebase/auth';
import { app } from '@/lib/firebase';
import { verifyCounselorExists } from '@/app/(admin)/admin/counselors/actions';


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
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      const isCounselorSession = sessionStorage.getItem('wbc-counselor-session') === 'true';
      if (user && isCounselorSession) {
         // Verify user exists in counselors collection on session restoration
        const counselorExists = await verifyCounselorExists(user.email!);
        if (counselorExists) {
            setUser(user);
        } else {
            await signOut(auth);
            sessionStorage.removeItem('wbc-counselor-session');
            setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, pass: string) => {
    const counselorExists = await verifyCounselorExists(email);
    if (!counselorExists) {
        throw new Error("No counselor account found for this email.");
    }
    
    const response = await signInWithEmailAndPassword(auth, email, pass);
    sessionStorage.setItem('wbc-counselor-session', 'true');
    setUser(response.user); 
    return response;
  };

  const logOut = async () => {
    await signOut(auth);
    sessionStorage.removeItem('wbc-counselor-session');
    setUser(null);
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
