import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_BASE = typeof window !== 'undefined' && window.location.hostname === 'localhost' ? 'http://localhost:3000' : '';

  const apiRequest = async (endpoint, options: any = {}) => {
    try {
      const token = localStorage.getItem('auth_token');
      const { headers = {}, ...restOptions } = options;
      const response = await fetch(`${API_BASE}/api${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
          ...headers,
        },
        credentials: 'include',
        ...restOptions,
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}`);
      }

      return { data, error: null, success: true };
    } catch (error) {
      return { 
        data: null, 
        error: error instanceof Error ? error.message : 'Request failed', 
        success: false 
      };
    }
  };

  const login = useCallback(async (email, password) => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      if (response.success && response.data) {
        setUser(response.data.user);
        setSession({ token: response.data.token });
        localStorage.setItem('auth_token', response.data.token);
        return true;
      } else {
        setError(response.error || 'Login failed');
        return false;
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Login failed');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (userData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
      });

      if (response.success && response.data) {
        setUser(response.data.user);
        setSession({ token: response.data.token });
        localStorage.setItem('auth_token', response.data.token);
        return true;
      } else {
        setError(response.error || 'Registration failed');
        return false;
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Registration failed');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiRequest('/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setSession(null);
      localStorage.removeItem('auth_token');
    }
  }, []);

  const refreshSession = useCallback(async () => {
    try {
      const response = await apiRequest('/auth/profile');
      if (response.success && response.data) {
        setUser(response.data);
      } else {
        setUser(null);
        setSession(null);
        localStorage.removeItem('auth_token');
      }
    } catch (error) {
      console.error('Session refresh error:', error);
      setUser(null);
      setSession(null);
      localStorage.removeItem('auth_token');
    }
  }, []);

  const updateProfile = useCallback(async (profileData) => {
    try {
      setError(null);
      const response = await apiRequest('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(profileData),
      });

      if (response.success && response.data) {
        setUser(response.data);
        return true;
      } else {
        setError(response.error || 'Profile update failed');
        return false;
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Profile update failed');
      return false;
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        await refreshSession();
      }
      setLoading(false);
    };

    initializeAuth();
  }, [refreshSession]);

  useEffect(() => {
    if (user) {
      const interval = setInterval(refreshSession, 15 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [user, refreshSession]);

  const value = {
    user,
    session,
    loading,
    error,
    login,
    register,
    logout,
    refreshSession,
    clearError,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
