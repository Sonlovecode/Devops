import { useState, useCallback } from 'react';
import { API_BASE } from '../utils/api';

export function useAuth() {
  const [user, setUser] = useState(() => {
    // Initialize from localStorage
    try {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (res.ok && data.token) {
        // Save token to localStorage
        localStorage.setItem('token', data.token);
        // Save user info to localStorage and state
        const userInfo = data.user || { email, role: 'customer' };
        localStorage.setItem('user', JSON.stringify(userInfo));
        setUser(userInfo);
        return { success: true, user: userInfo };
      } else {
        const errorMsg = data.message || 'Đăng nhập thất bại';
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }
    } catch (err) {
      const errorMsg = err.message || 'Lỗi kết nối';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (name, email, password) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();

      if (res.ok && data.token) {
        // Save token and user info
        localStorage.setItem('token', data.token);
        const userInfo = data.user || { name, email, role: 'customer' };
        localStorage.setItem('user', JSON.stringify(userInfo));
        setUser(userInfo);
        return { success: true, user: userInfo };
      } else {
        const errorMsg = data.message || 'Đăng ký thất bại';
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }
    } catch (err) {
      const errorMsg = err.message || 'Lỗi kết nối';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setError(null);
  }, []);

  const isAuthenticated = !!user;

  return {
    user,
    loading,
    error,
    login,
    register,
    logout,
    isAuthenticated,
  };
}
