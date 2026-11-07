import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import client from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore an existing session from local storage on first load.
  useEffect(() => {
    const token = localStorage.getItem('otpms_token');
    const stored = localStorage.getItem('otpms_user');
    if (token && stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem('otpms_token');
        localStorage.removeItem('otpms_user');
      }
    }
    setLoading(false);
  }, []);

  /** Authenticate against the API and persist the session. */
  async function login(email, password) {
    const { data } = await client.post('/login', { email, password });
    localStorage.setItem('otpms_token', data.token);
    localStorage.setItem('otpms_user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  }

  function logout() {
    client.post('/logout').catch(() => {});
    localStorage.removeItem('otpms_token');
    localStorage.removeItem('otpms_user');
    setUser(null);
  }

  /** Refresh the stored user object after a profile update. */
  function refreshUser(next) {
    localStorage.setItem('otpms_user', JSON.stringify(next));
    setUser(next);
  }

  const value = useMemo(
    () => ({ user, loading, login, logout, refreshUser, isAuthenticated: !!user }),
    [user, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
