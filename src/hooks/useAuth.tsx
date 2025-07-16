
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
      setUser(null);
      setLoading(false);
      // If firebase is not configured, we don't need auth.
      // We can let the user proceed without being logged in if they are not on the login page.
      if (pathname !== '/login') {
         // Potentially handle this case, for now, it allows access to other pages
         // without forcing a login, which might be desired if firebase isn't set up.
      }
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      if (currentUser) {
        if (pathname === '/login') {
            router.push('/');
        }
      } else {
        if (pathname !== '/login') {
          router.push('/login');
        }
      }
    });

    return () => unsubscribe();
  }, [router, pathname]);

  const signInAsGuest = async () => {
    if (!isFirebaseEnabled || !auth) return;
    try {
      await signInAnonymously(auth);
      router.push('/');
    } catch (error) {
      console.error("Ошибка анонимного входа:", error);
    }
  };

  const signOut = async () => {
    if (!isFirebaseEnabled || !auth) return;
    try {
      await firebaseSignOut(auth);
      router.push('/login');
    } catch (error) {
      console.error("Ошибка выхода:", error);
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
