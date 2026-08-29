import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { api, getToken, setToken } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [profile, setProfile] = useState(null); // { user, education, physical, preferences }
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!getToken()) { setProfile(null); setLoading(false); return; }
    try {
      const data = await api.get('/auth/me');
      setProfile(data);
    } catch (e) {
      setToken(null);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const login = async (email, password) => {
    const data = await api.post('/auth/login', { email, password });
    setToken(data.token);
    await refresh();
    return data.user;
  };

  const signup = async (name, email, password) => {
    const data = await api.post('/auth/signup', { name, email, password });
    setToken(data.token);
    await refresh();
    return data.user;
  };

  const logout = () => {
    setToken(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{ profile, loading, login, signup, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
