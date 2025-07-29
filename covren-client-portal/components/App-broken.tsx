// Sovereign Command Center Main App Component
// Covren Firm LLC - Production Grade React Application

import { authApi, notificationsApi } from '../services/api';

// Import components
import LoginForm from './auth/LoginForm';
import RegisterForm from './auth/RegisterForm';
import Dashboard from './dashboard/Dashboard';
import Navigation from './navigation/Navigation';
import NotificationCenter from './notifications/NotificationCenter';
import ErrorBoundary from './common/ErrorBoundary';
import LoadingSpinner from './common/LoadingSpinner';
import ErrorToast from './common/ErrorToast';

// App State Management
const useAppState = () => {
  const [state, setState] = window.React.useState({
    user: null,
    session: null,
    loading: true,
    error: null,
    notifications: [],
    unreadCount: 0,
  });

  const updateState = window.React.useCallback((updates) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  const setError = window.React.useCallback((error) => {
    updateState({ error });
  }, [updateState]);

  const setLoading = window.React.useCallback((loading) => {
    updateState({ loading });
  }, [updateState]);

  const setUser = window.React.useCallback((user) => {
    updateState({ user });
  }, [updateState]);

  const setSession = window.React.useCallback((session) => {
    updateState({ session });
  }, [updateState]);

  const addNotification = window.React.useCallback((notification) => {
    setState(prev => ({
      ...prev,
      notifications: [notification, ...(prev.notifications || [])],
      unreadCount: (prev.unreadCount || 0) + 1,
    }));
  }, []);

  const markNotificationAsRead = window.React.useCallback((notificationId) => {
    setState(prev => ({
      ...prev,
      notifications: (prev.notifications || []).map(n => 
        n && n.id === notificationId ? { ...n, read_at: new Date().toISOString() } : n
      ),
      unreadCount: Math.max(0, (prev.unreadCount || 0) - 1),
    }));
  }, []);

  const removeNotification = window.React.useCallback((notificationId) => {
    setState(prev => ({
      ...prev,
      notifications: (prev.notifications || []).filter(n => n && n.id !== notificationId),
      unreadCount: Math.max(0, (prev.unreadCount || 0) - 1),
    }));
  }, []);

  return {
    state,
    updateState,
    setError,
    setLoading,
    setUser,
    setSession,
    addNotification,
    markNotificationAsRead,
    removeNotification,
  };
};

// Main App Component
const MainAppComponent = () => {
  const {
    state,
    setError,
    setLoading,
    setUser,
    setSession,
    addNotification,
    markNotificationAsRead,
    removeNotification,
  } = useAppState();

  const [isRegistering, setIsRegistering] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // Initialize app and check session
  useEffect(() => {
    const initializeApp = async () => {
      try {
        setLoading(true);
        
        // Check for existing session
        const sessionResponse = await authApi.getSession();
        if (sessionResponse.success && sessionResponse.data) {
          setUser(sessionResponse.data.user);
          setSession(sessionResponse.data.session);
          
          // Load notifications
          const notificationsResponse = await notificationsApi.getUserNotifications();
          if (notificationsResponse.success && notificationsResponse.data) {
            const unreadCount = notificationsResponse.data.filter(n => !n.read_at).length;
            setState(prev => ({
              ...prev,
              notifications: notificationsResponse.data,
              unreadCount,
            }));
          }
        }
      } catch (error) {
        console.error('App initialization error:', error);
        setError('Failed to initialize application');
      } finally {
        setLoading(false);
      }
    };

    initializeApp();
  }, []);

  // Handle login
  const handleLogin = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);

      // Validate form
      const validation = validateLoginForm({ email, password });
      if (!validation.isValid) {
        setError(Object.values(validation.errors)[0]);
        return;
      }

      const response = await authApi.signIn({ email, password });
      if (response.success && response.data) {
        setUser(response.data.user);
        setSession(null);
        addNotification({
          id: Date.now().toString(),
          user_id: response.data.user.id,
          title: 'Welcome Back',
          message: `Successfully logged in as ${response.data.user.email}`,
          type: 'success',
          created_at: new Date().toISOString(),
          metadata: {},
        });
      } else {
        setError(response.error || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle registration
  const handleRegister = async (userData: any) => {
    try {
      setLoading(true);
      setError(null);

      // Validate form
      const validation = validateRegisterForm(userData);
      if (!validation.isValid) {
        setError(Object.values(validation.errors)[0]);
        return;
      }

      const response = await authApi.signUp(userData);
      if (response.success && response.data) {
        setUser(response.data.user);
        setSession(null);
        addNotification({
          id: Date.now().toString(),
          user_id: response.data.user.id,
          title: 'Account Created',
          message: 'Your account has been successfully created',
          type: 'success',
          created_at: new Date().toISOString(),
          metadata: {},
        });
      } else {
        setError(response.error || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setError('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      setLoading(true);
      await authApi.signOut();
      setUser(null);
      setSession(null);
      updateState({
        notifications: [],
        unreadCount: 0,
      });
    } catch (error) {
      console.error('Logout error:', error);
      setError('Logout failed');
    } finally {
      setLoading(false);
    }
  };

  // Handle notification actions
  const handleNotificationRead = async (notificationId: string) => {
    try {
      const response = await notificationsApi.markNotificationAsRead(notificationId);
      if (response.success) {
        markNotificationAsRead(notificationId);
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const handleNotificationDelete = async (notificationId: string) => {
    try {
      const response = await notificationsApi.deleteNotification(notificationId);
      if (response.success) {
        removeNotification(notificationId);
      }
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  // Render loading state
  if (state.loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  // Render authentication forms
  if (!state.user) {
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
              loading={state.loading}
            />
          ) : (
            <LoginForm
              onSubmit={handleLogin}
              onSwitchToRegister={() => setIsRegistering(true)}
              loading={state.loading}
            />
          )}

          {state.error && (
            <ErrorToast
              message={state.error}
              onClose={() => setError(null)}
            />
          )}
        </div>
      </div>
    );
  }

  // Render main application
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white"></div>
    </ErrorBoundary>
  );
};

const ErrorBoundaryWrapper: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white"></div>
  );
};

const MainApp: React.FC = () => {
  const {
    state,
    setError,
    setLoading,
    setUser,
    setSession,
    addNotification,
    markNotificationAsRead,
    removeNotification,
  } = useAppState();

  const [isRegistering, setIsRegistering] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // Initialize app and check session
  useEffect(() => {
    const initializeApp = async () => {
      try {
        setLoading(true);
        
        // Check for existing session
        const sessionResponse = await authApi.getSession();
        if (sessionResponse.success && sessionResponse.data) {
          setUser(sessionResponse.data.user);
          setSession(null);
          
          // Load notifications
          const notificationsResponse = await notificationsApi.getUserNotifications();
          if (notificationsResponse.success && notificationsResponse.data) {
            const unreadCount = notificationsResponse.data.filter(n => !n.read_at).length;
            updateState({
              notifications: notificationsResponse.data,
              unreadCount,
            });
          }
        }
      } catch (error) {
        console.error('App initialization error:', error);
        setError('Failed to initialize application');
      } finally {
        setLoading(false);
      }
    };

    initializeApp();
  }, []);

  // Handle login
  const handleLogin = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);

      // Validate form
      const validation = validateLoginForm({ email, password });
      if (!validation.isValid) {
        setError(Object.values(validation.errors)[0]);
        return;
      }

      const response = await authApi.signIn({ email, password });
      if (response.success && response.data) {
        setUser(response.data.user);
        setSession(null);
        addNotification({
          id: Date.now().toString(),
          user_id: response.data.user.id,
          title: 'Welcome Back',
          message: `Successfully logged in as ${response.data.user.email}`,
          type: 'success',
          created_at: new Date().toISOString(),
          metadata: {},
        });
      } else {
        setError(response.error || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle registration
  const handleRegister = async (userData: any) => {
    try {
      setLoading(true);
      setError(null);

      // Validate form
      const validation = validateRegisterForm(userData);
      if (!validation.isValid) {
        setError(Object.values(validation.errors)[0]);
        return;
      }

      const response = await authApi.signUp(userData);
      if (response.success && response.data) {
        setUser(response.data.user);
        setSession(null);
        addNotification({
          id: Date.now().toString(),
          user_id: response.data.user.id,
          title: 'Account Created',
          message: 'Your account has been successfully created',
          type: 'success',
          created_at: new Date().toISOString(),
          metadata: {},
        });
      } else {
        setError(response.error || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setError('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      setLoading(true);
      await authApi.signOut();
      setUser(null);
      setSession(null);
      updateState({
        notifications: [],
        unreadCount: 0,
      });
    } catch (error) {
      console.error('Logout error:', error);
      setError('Logout failed');
    } finally {
      setLoading(false);
    }
  };

  // Handle notification actions
  const handleNotificationRead = async (notificationId: string) => {
    try {
      const response = await notificationsApi.markNotificationAsRead(notificationId);
      if (response.success) {
        markNotificationAsRead(notificationId);
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const handleNotificationDelete = async (notificationId: string) => {
    try {
      const response = await notificationsApi.deleteNotification(notificationId);
      if (response.success) {
        removeNotification(notificationId);
      }
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  // Render loading state
  if (state.loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  // Render authentication forms
  if (!state.user) {
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
              loading={state.loading}
            />
          ) : (
            <LoginForm
              onSubmit={handleLogin}
              onSwitchToRegister={() => setIsRegistering(true)}
              loading={state.loading}
            />
          )}

          {state.error && (
            <ErrorToast
              message={state.error}
              onClose={() => setError(null)}
            />
          )}
        </div>
      </div>
    );
  }

  // Render main application
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white"></div>
  );
};

const AppWithErrorBoundary: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white"></div>
  );
};

const FinalApp: React.FC = () => {
  const {
    state,
    updateState,
    setError,
    setLoading,
    setUser,
    setSession,
    addNotification,
    markNotificationAsRead,
    removeNotification,
  } = useAppState();

  const [isRegistering, setIsRegistering] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // Initialize app and check session
  useEffect(() => {
    const initializeApp = async () => {
      try {
        setLoading(true);
        
        // Check for existing session
        const sessionResponse = await authApi.getSession();
        if (sessionResponse.success && sessionResponse.data) {
          setUser(sessionResponse.data.user);
          setSession(null);
          
          // Load notifications
          const notificationsResponse = await notificationsApi.getUserNotifications();
          if (notificationsResponse.success && notificationsResponse.data) {
            const unreadCount = notificationsResponse.data.filter(n => !n.read_at).length;
            updateState({
              notifications: notificationsResponse.data,
              unreadCount,
            });
          }
        }
      } catch (error) {
        console.error('App initialization error:', error);
        setError('Failed to initialize application');
      } finally {
        setLoading(false);
      }
    };

    initializeApp();
  }, []);

  // Handle login
  const handleLogin = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);

      // Validate form
      const validation = validateLoginForm({ email, password });
      if (!validation.isValid) {
        setError(Object.values(validation.errors)[0]);
        return;
      }

      const response = await authApi.signIn({ email, password });
      if (response.success && response.data) {
        setUser(response.data.user);
        setSession(null);
        addNotification({
          id: Date.now().toString(),
          user_id: response.data.user.id,
          title: 'Welcome Back',
          message: `Successfully logged in as ${response.data.user.email}`,
          type: 'success',
          created_at: new Date().toISOString(),
          metadata: {},
        });
      } else {
        setError(response.error || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle registration
  const handleRegister = async (userData: any) => {
    try {
      setLoading(true);
      setError(null);

      // Validate form
      const validation = validateRegisterForm(userData);
      if (!validation.isValid) {
        setError(Object.values(validation.errors)[0]);
        return;
      }

      const response = await authApi.signUp(userData);
      if (response.success && response.data) {
        setUser(response.data.user);
        setSession(null);
        addNotification({
          id: Date.now().toString(),
          user_id: response.data.user.id,
          title: 'Account Created',
          message: 'Your account has been successfully created',
          type: 'success',
          created_at: new Date().toISOString(),
          metadata: {},
        });
      } else {
        setError(response.error || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setError('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      setLoading(true);
      await authApi.signOut();
      setUser(null);
      setSession(null);
      updateState({
        notifications: [],
        unreadCount: 0,
      });
    } catch (error) {
      console.error('Logout error:', error);
      setError('Logout failed');
    } finally {
      setLoading(false);
    }
  };

  // Handle notification actions
  const handleNotificationRead = async (notificationId: string) => {
    try {
      const response = await notificationsApi.markNotificationAsRead(notificationId);
      if (response.success) {
        markNotificationAsRead(notificationId);
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const handleNotificationDelete = async (notificationId: string) => {
    try {
      const response = await notificationsApi.deleteNotification(notificationId);
      if (response.success) {
        removeNotification(notificationId);
      }
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  // Render loading state
  if (state.loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  // Render authentication forms
  if (!state.user) {
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
              loading={state.loading}
            />
          ) : (
            <LoginForm
              onSubmit={handleLogin}
              onSwitchToRegister={() => setIsRegistering(true)}
              loading={state.loading}
            />
          )}

          {state.error && (
            <ErrorToast
              message={state.error}
              onClose={() => setError(null)}
            />
          )}
        </div>
      </div>
    );
  }

  // Render main application
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
      {/* Navigation */}
      <Navigation
        user={state.user}
        onLogout={handleLogout}
        notificationCount={state.unreadCount}
        onNotificationClick={() => setShowNotifications(!showNotifications)}
      />

      {/* Main Content */}
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-gray-800 border-r border-gray-700 min-h-screen">
          {/* Sidebar content will be added here */}
        </div>

        {/* Main Content Area */}
        <div className="flex-1">
          <Dashboard user={state.user} />
        </div>
      </div>

      {/* Notification Center */}
      {showNotifications && (
        <NotificationCenter
          notifications={state.notifications}
          onRead={handleNotificationRead}
          onDelete={handleNotificationDelete}
          onClose={() => setShowNotifications(false)}
        />
      )}

      {/* Error Toast */}
      {state.error && (
        <ErrorToast
          message={state.error}
          onClose={() => setError(null)}
        />
      )}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <FinalApp />
    </ErrorBoundary>
  );
};
        {/* Navigation */}
        <Navigation
          user={state.user}
          onLogout={handleLogout}
          notificationCount={state.unreadCount}
          onNotificationClick={() => setShowNotifications(!showNotifications)}
        />

        {/* Main Content */}
        <div className="flex">
          {/* Sidebar */}
          <div className="w-64 bg-gray-800 border-r border-gray-700 min-h-screen">
            {/* Sidebar content will be added here */}
          </div>

          {/* Main Content Area */}
          <div className="flex-1">
            <Dashboard user={state.user} />
          </div>
        </div>

        {/* Notification Center */}
        {showNotifications && (
          <NotificationCenter
            notifications={state.notifications}
            onRead={handleNotificationRead}
            onDelete={handleNotificationDelete}
            onClose={() => setShowNotifications(false)}
          />
        )}

        {/* Error Toast */}
        {state.error && (
          <ErrorToast
            message={state.error}
            onClose={() => setError(null)}
          />
        )}
      </div>
    </ErrorBoundary>
  );
};

export default MainAppComponent;      