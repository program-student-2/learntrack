import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut as fbSignOut,
  type User,
} from 'firebase/auth';
import { auth, googleProvider, isEmailAllowed, isFirebaseConfigured } from './firebase';

type AuthStatus = 'loading' | 'signed-out' | 'signed-in' | 'forbidden' | 'unconfigured';

interface AuthContextValue {
  status: AuthStatus;
  user: User | null;
  error: string | null;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<AuthStatus>(
    isFirebaseConfigured ? 'loading' : 'unconfigured'
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!auth) return;
    return onAuthStateChanged(auth, (u) => {
      if (!u) {
        setUser(null);
        setStatus('signed-out');
        return;
      }
      if (!isEmailAllowed(u.email)) {
        setUser(u);
        setStatus('forbidden');
        return;
      }
      setUser(u);
      setStatus('signed-in');
    });
  }, []);

  const signIn = async () => {
    if (!auth) return;
    setError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'サインインに失敗しました';
      setError(msg);
    }
  };

  const signOut = async () => {
    if (!auth) return;
    await fbSignOut(auth);
  };

  return (
    <AuthContext.Provider value={{ status, user, error, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
