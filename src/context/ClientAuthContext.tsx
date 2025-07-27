
'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, User, createUserWithEmailAndPassword, updateProfile, updatePassword as firebaseUpdatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { getAuth } from 'firebase/auth';
import { app } from '@/lib/firebase';
import { signUpClient, type SignUpData } from '@/app/(website)/auth/actions';
import { verifyClientExists } from '@/app/(website)/auth/actions';

const auth = getAuth(app);

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, pass: string) => Promise<any>;
  signUp: (email: string, pass: string, data: Omit<SignUpData, 'email'>) => Promise<any>;
  logOut: () => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
  reauthenticate: (password: string) => Promise<void>;
}

const ClientAuthContext = createContext<AuthContextType | undefined>(undefined);

export function ClientAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      const isClientSession = sessionStorage.getItem('wbc-client-session') === 'true';
      if (user && isClientSession) {
        // Verify user exists in clients collection on session restoration
        const clientExists = await verifyClientExists(user.email!);
        if (clientExists) {
            setUser(user);
        } else {
            await signOut(auth);
            sessionStorage.removeItem('wbc-client-session');
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
    const clientExists = await verifyClientExists(email);
    if (!clientExists) {
        throw new Error("No client account found for this email.");
    }

    const response = await signInWithEmailAndPassword(auth, email, pass);
    sessionStorage.setItem('wbc-client-session', 'true');
    setUser(response.user);
    return response;
  };

  const signUp = async (email: string, pass: string, data: Omit<SignUpData, 'email'>) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
    
    await updateProfile(userCredential.user, {
      displayName: `${data.firstName} ${data.lastName}`,
    });

    await signUpClient(userCredential.user.uid, { ...data, email });
    sessionStorage.setItem('wbc-client-session', 'true');
    setUser(userCredential.user);

    return userCredential;
  };

  const logOut = async () => {
    await signOut(auth);
    sessionStorage.removeItem('wbc-client-session');
    setUser(null);
  };
  
  const reauthenticate = async (password: string) => {
    const user = auth.currentUser;
    if (user && user.email) {
      const credential = EmailAuthProvider.credential(user.email, password);
      await reauthenticateWithCredential(user, credential);
    } else {
      throw new Error("User not found or email is missing for reauthentication.");
    }
  };

  const updatePassword = async (newPassword: string) => {
    const user = auth.currentUser;
    if (user) {
      await firebaseUpdatePassword(user, newPassword);
    } else {
      throw new Error("You must be logged in to update your password.");
    }
  };

  return (
    <ClientAuthContext.Provider value={{ user, loading, signIn, signUp, logOut, updatePassword, reauthenticate }}>
      {children}
    </ClientAuthContext.Provider>
  );
}

export function useClientAuth() {
  const context = useContext(ClientAuthContext);
  if (context === undefined) {
    throw new Error('useClientAuth must be used within a ClientAuthProvider');
  }
  return context;
}
