
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
      // Mock user for development without firebase
      const mockUser = { uid: 'mock-user', displayName: 'Guest' } as User;
      setUser(mockUser);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      if (!currentUser && pathname !== '/login') {
          router.push('/login');
      } else if (currentUser && pathname === '/login') {
          router.push('/');
      }
    });

    return () => unsubscribe();
  }, [router, pathname]);

  const signInAsGuest = async () => {
    if (!isFirebaseEnabled || !auth) return;
    setLoading(true);
    try {
      await signInAnonymously(auth);
      router.push('/');
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
      router.push('/login');
    } catch (error) {
      console.error("Ошибка выхода:", error);
    } finally {
        setLoading(false);
    }
  };

  const value = { user, loading, signInAsGuest, signOut };

  return (
    <AuthContext.Provider value={value}>
      {loading ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-primary"></div>
        </div>
      ) : children}
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

    