
'use client';

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { auth, isFirebaseEnabled } from '@/lib/firebase';
import { 
  onAuthStateChanged, 
  signOut as firebaseSignOut, 
  User,
  signInAnonymously
} from 'firebase/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInAsGuest: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!isFirebaseEnabled) {
      setLoading(false);
      // Immediately redirect to login if firebase is not configured, except for the login page itself.
      if (window.location.pathname !== '/login') {
          router.push('/login');
      }
      return;
    }
    
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const signInAsGuest = async () => {
    if (!isFirebaseEnabled || !auth) return;
    setLoading(true);
    try {
      await signInAnonymously(auth);
      // onAuthStateChanged will handle routing to /duels via the Home page component
    } catch (error) {
      console.error("Ошибка анонимного входа:", error);
      setLoading(false);
    }
  };

  const signOut = async () => {
    if (!isFirebaseEnabled || !auth) return;
    await firebaseSignOut(auth);
    router.push('/login');
  };

  const value = { user, loading, signInAsGuest, signOut };

  return (
    <AuthContext.Provider value={value}>
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
