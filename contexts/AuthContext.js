'use client';
import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('admin_token');
    const savedAdmin = localStorage.getItem('admin_info');
    if (saved) {
      setToken(saved);
      if (savedAdmin) setAdmin(JSON.parse(savedAdmin));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error };

      setToken(data.token);
      setAdmin(data.admin);
      localStorage.setItem('admin_token', data.token);
      localStorage.setItem('admin_info', JSON.stringify(data.admin));
      return { success: true };
    } catch {
      return { success: false, error: 'Erro de conexão' };
    }
  };

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setToken(null);
    setAdmin(null);
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_info');
  };

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider value={{ token, admin, loading, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
