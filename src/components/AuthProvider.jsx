'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

const AuthContext = createContext({
  user: null,
  profile: null,
  loading: true,
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active sessions from localStorage
    const savedSession = localStorage.getItem('orange_session');
    if (savedSession) {
      try {
        const profileData = JSON.parse(savedSession);
        setUser(profileData);
        setProfile(profileData);
      } catch (err) {
        console.error('Failed to parse session:', err);
        localStorage.removeItem('orange_session');
      }
    }
    setLoading(false);
  }, []);

  const login = (userData) => {
    setUser(userData);
    setProfile(userData);
    localStorage.setItem('orange_session', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    setProfile(null);
    localStorage.removeItem('orange_session');
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
