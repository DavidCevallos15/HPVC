import React, { createContext, useContext, useState, useCallback } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { 
      const data = localStorage.getItem('hpvc_user_v1');
      if (data) return JSON.parse(data);
      // Migrate old data if present
      const oldData = localStorage.getItem('hpvc_user');
      if (oldData) {
        localStorage.setItem('hpvc_user_v1', oldData);
        localStorage.removeItem('hpvc_user');
        return JSON.parse(oldData);
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
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuth: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
