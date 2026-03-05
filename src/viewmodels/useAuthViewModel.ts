'use client';

import { useState, useEffect } from 'react';
import { type User } from 'firebase/auth';
import { loginWithEmail, logoutUser, onAuthChange } from '@/services/auth.service';

interface AuthViewModel {
  currentUser: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

function getHebrewAuthError(code: string): string {
  switch (code) {
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
    case 'auth/user-not-found':
    case 'auth/invalid-email':
      return 'אימייל או סיסמה שגויים';
    case 'auth/too-many-requests':
      return 'יותר מדי ניסיונות, נסי שוב מאוחר יותר';
    case 'auth/user-disabled':
      return 'חשבון זה הושהה. פנה למנהל המערכת';
    case 'auth/network-request-failed':
      return 'בעיית חיבור לרשת. בדוק את החיבור ונסה שוב';
    default:
      return 'אירעה שגיאה, נסי שוב';
  }
}

export function useAuthViewModel(): AuthViewModel {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [loginLoading, setLoginLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthChange((user) => {
      setCurrentUser(user);
      setAuthLoading(false);
    });
    return unsubscribe;
  }, []);

  async function login(email: string, password: string): Promise<void> {
    setError(null);
    setLoginLoading(true);
    try {
      await loginWithEmail(email, password);
      // currentUser will update via onAuthChange listener
    } catch (err) {
      const code = (err as { code?: string }).code ?? '';
      setError(getHebrewAuthError(code));
    } finally {
      setLoginLoading(false);
    }
  }

  async function logout(): Promise<void> {
    setError(null);
    try {
      await logoutUser();
    } catch {
      setError('שגיאה בהתנתקות. נסה שוב.');
    }
  }

  const loading = authLoading || loginLoading;

  return {
    currentUser,
    loading,
    isAuthenticated: !!currentUser,
    error,
    login,
    logout,
  };
}
