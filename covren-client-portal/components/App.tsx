// Sovereign Command Center Main App Component
// Covren Firm LLC - Production Grade React Application

import React, { useState } from 'react';
import type { Notification } from '../types';
import { notificationsApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

// Import components
import LoginForm from './auth/LoginForm';
import RegisterForm from './auth/RegisterForm';
import ProtectedRoute from './auth/ProtectedRoute';
import Dashboard from './dashboard/Dashboard';
import Navigation from './navigation/Navigation';
import NotificationCenter from './notifications/NotificationCenter';
import ErrorBoundary from './common/ErrorBoundary';
import LoadingSpinner from './common/LoadingSpinner';
import ErrorToast from './common/ErrorToast';


// Main App Component
const App = () => {
  const { user, loading, error, login, register, logout, clearError } = useAuth();
  const [isRegistering, setIsRegistering] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Handle login
  const handleLogin = async (email: string, password: string) => {
    const success = await login(email, password);
    if (success) {
      loadNotifications();
    }
  };

  // Handle registration
  const handleRegister = async (userData: any) => {
    const success = await register(userData);
    if (success) {
      loadNotifications();
    }
  };

  // Load notifications
  const loadNotifications = async () => {
    try {
      const response = await notificationsApi.getUserNotifications();
      if (response.success && response.data) {
        const unread = response.data.filter(n => !n.read_at).length;
        setNotifications(response.data);
        setUnreadCount(unread);
      }
    } catch (error) {
      console.error('Failed to load notifications:', error);
    }
  };

  // Handle notification actions
  const handleNotificationRead = async (notificationId: string) => {
    try {
      const response = await notificationsApi.markNotificationAsRead(notificationId);
      if (response.success) {
        setNotifications(prev => 
          prev.map(n => 
            n.id === notificationId ? { ...n, read_at: new Date().toISOString() } : n
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const handleNotificationDelete = async (notificationId: string) => {
    try {
      const response = await notificationsApi.deleteNotification(notificationId);
      if (response.success) {
        setNotifications(prev => prev.filter(n => n.id !== notificationId));
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  // Render loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  // Render authentication forms
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-cyan-400 neon-glow mb-2">
              Sovereign Command Center™
            </h1>
            <p className="text-gray-400 text-lg">
              Covren Firm LLC - Client Portal
            </p>
          </div>

          {isRegistering ? (
            <RegisterForm
              onSubmit={handleRegister}
              onSwitchToLogin={() => setIsRegistering(false)}
              loading={loading}
            />
          ) : (
            <LoginForm
              onSubmit={handleLogin}
              onSwitchToRegister={() => setIsRegistering(true)}
              loading={loading}
            />
          )}

          {error && (
            <ErrorToast
              message={error}
              onClose={clearError}
            />
          )}
        </div>
      </div>
    );
  }

  // Render main application
  return (
    <ErrorBoundary>
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
          <Navigation
            user={user}
            onLogout={logout}
            notificationCount={unreadCount}
            onNotificationClick={() => setShowNotifications(!showNotifications)}
          />

          <div className="flex">
            <div className="w-64 bg-gray-800 border-r border-gray-700 min-h-screen">
            </div>

            <div className="flex-1">
              <Dashboard user={user} />
            </div>
          </div>

          {showNotifications && (
            <NotificationCenter
              notifications={notifications}
              onRead={handleNotificationRead}
              onDelete={handleNotificationDelete}
              onClose={() => setShowNotifications(false)}
            />
          )}

          {error && (
            <ErrorToast
              message={error}
              onClose={clearError}
            />
          )}
        </div>
      </ProtectedRoute>
    </ErrorBoundary>
  );
};

export default App;    