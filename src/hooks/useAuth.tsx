
'use client';

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { auth, isFirebaseEnabled } from '@/lib/firebase';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut as firebaseSignOut, 
  User,
  signInAnonymously
} from 'firebase/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
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
      // If firebase is not configured, we don't need auth.
      // We can let the user proceed or show a message.
      // For now, let's just stop loading.
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
      if (user) {
        if(window.location.pathname === '/login') {
            router.push('/');
        }
      } else {
        router.push('/login');
      }
    });

    return () => unsubscribe();
  }, [router]);

  const signInWithGoogle = async () => {
    if (!isFirebaseEnabled || !auth) return;
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      router.push('/');
    } catch (error) {
      console.error("Ошибка входа с Google:", error);
    }
  };
  
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

  const value = { user, loading, signInWithGoogle, signInAsGuest, signOut };

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
