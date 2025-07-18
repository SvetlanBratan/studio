
'use client';

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
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
  const pathname = usePathname();

  useEffect(() => {
    if (!isFirebaseEnabled) {
      setLoading(false);
      return;
    }
    
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (loading) return;

    const isAuthPage = pathname === '/login';
    
    if (!user && !isAuthPage) {
      router.push('/login');
    } else if (user && isAuthPage) {
      router.push('/duels');
    }
  }, [user, loading, router, pathname]);

  const signInAsGuest = async () => {
    if (!isFirebaseEnabled || !auth) return;
    setLoading(true);
    try {
      await signInAnonymously(auth);
      // onAuthStateChanged will handle the rest
    } catch (error) {
      console.error("Ошибка анонимного входа:", error);
      setLoading(false);
    }
  };

  const signOut = async () => {
    if (!isFirebaseEnabled || !auth) return;
    setLoading(true);
    try {
      await firebaseSignOut(auth);
      // onAuthStateChanged will handle the rest
    } catch (error) {
      console.error("Ошибка выхода:", error);
    } 
  };

  const value = { user, loading, signInAsGuest, signOut };

  // Render children immediately to avoid hydration issues.
  // The loading state will be handled by individual pages.
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
