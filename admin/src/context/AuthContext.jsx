import React, { createContext, useContext, useState, useCallback } from 'react';
import api from '../api/axios';
import posthog from 'posthog-js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const data = localStorage.getItem('hpvc_user_v1');
      if (data) {
        const parsed = JSON.parse(data);
        posthog.identify(String(parsed?.id), { role: parsed?.rol || 'admin' });
        return parsed;
      }
      // Migrate old data if present
      const oldData = localStorage.getItem('hpvc_user');
      if (oldData) {
        localStorage.setItem('hpvc_user_v1', oldData);
        localStorage.removeItem('hpvc_user');
        const parsed = JSON.parse(oldData);
        posthog.identify(String(parsed?.id), { role: parsed?.rol || 'admin' });
        return parsed;
      }
      return null;
    } catch { return null; }
  });

  const login = useCallback(async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    setUser(data.data);
    localStorage.setItem('hpvc_user_v1', JSON.stringify(data.data));
    return data.data;
  }, []);

  const logout = useCallback(async () => {
    try { await api.post('/auth/logout'); } catch {}
    setUser(null);
    localStorage.removeItem('hpvc_user_v1');
    localStorage.removeItem('hpvc_user'); // just in case
    posthog.reset();
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuth: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
