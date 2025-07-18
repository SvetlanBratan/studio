
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
      // For development without firebase, create a mock user.
      const mockUser = { uid: 'mock-user', displayName: 'Guest', isAnonymous: true } as User;
      setUser(mockUser);
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
    if (loading) {
      return; // Wait until loading is false to check for redirects
    }

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
      // The useEffect above will handle the redirect
    } catch (error) {
      console.error("Ошибка анонимного входа:", error);
    } finally {
        setLoading(false);
    }
  };

  const signOut = async () => {
    if (!isFirebaseEnabled || !auth) return;
    setLoading(true);
    try {
      await firebaseSignOut(auth);
      // The useEffect above will handle the redirect
    } catch (error) {
      console.error("Ошибка выхода:", error);
    } finally {
        setLoading(false);
    }
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
