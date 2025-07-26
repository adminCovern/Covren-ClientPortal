// Sovereign Command Center Main Entry Point
// Covren Firm LLC - Production Grade Client Portal

// Wait for Supabase and ReactDOM to load with retry limit and flexible detection
function waitForDependencies(maxRetries = 50) {
  return new Promise((resolve, reject) => {
    let retries = 0;
    let supabaseInitialized = false;
    const checkDependencies = () => {
      const hasReact = typeof window.React !== 'undefined' && window.React !== null;
      const hasReactDOM = typeof window.ReactDOM !== 'undefined' && window.ReactDOM !== null && typeof window.ReactDOM.render === 'function';
      const supabaseModule = window.supabase || window.Supabase;
      let hasSupabase = false;
      if (supabaseModule && typeof supabaseModule === 'object' && !supabaseInitialized) {
        console.log('Supabase module debug:', supabaseModule);
        if (typeof supabaseModule.createClient === 'function') {
          hasSupabase = true;
        } else if (typeof supabaseModule.auth === 'object' && typeof supabaseModule.from === 'function') {
          hasSupabase = true;
          supabaseInitialized = true; // Mark as initialized to prevent re-creation
        }
      } else if (supabaseInitialized) {
        hasSupabase = true; // Use initialized state
      }
      const supabaseObj = supabaseModule;
      console.log('Dependency check:', { hasReact, hasReactDOM, hasSupabase, supabaseObj });
      if (hasReact && hasReactDOM && hasSupabase) {
        resolve();
      } else if (retries >= maxRetries) {
        reject(new Error('Max retry attempts reached for dependency loading: ' + JSON.stringify({ hasReact, hasReactDOM, hasSupabase, supabaseObj })));
      } else {
        retries++;
        console.log(`Dependencies not loaded yet. Retrying... (Attempt ${retries}/${maxRetries})`, { hasReact, hasReactDOM, hasSupabase });
        setTimeout(checkDependencies, 300); // Increased delay for initialization
      }
    };
    checkDependencies();
  });
}

// Initialize once dependencies are loaded, creating client if needed
async function initializeApp() {
  try {
    await waitForDependencies();
    let supabase = window.supabase || window.Supabase;
    if (typeof supabase.createClient === 'function') {
      // Factory detected; create client
      supabase = supabase.createClient(
        'https://flyflafbdqhdhgxngahz.supabase.co',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZseWZsYWZiZHFoZGhneG5nYWh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyMzMzMzAsImV4cCI6MjA2ODgwOTMzMH0.pRpNyNwr6AQRg3eHA5XDgxJwhGZXwlakVx7in9ciOms'
      );
      window.supabase = supabase; // Update global with the client
    } else if (typeof supabase.auth === 'object' && typeof supabase.from === 'function') {
      console.log('Using existing Supabase client');
    } else {
      throw new Error('Invalid Supabase object: ' + JSON.stringify(supabase));
    }
    return supabase;
  } catch (err) {
    console.error('Dependency loading failed:', err);
    throw err;
  }
}

// Loading spinner component
const LoadingSpinner = ({ size = 'medium', color = 'cyan', className = '' }) => {
  const sizeClasses = {
    small: 'h-4 w-4',
    medium: 'h-8 w-8',
    large: 'h-12 w-12',
  };

  const colorClasses = {
    cyan: 'border-cyan-400',
    white: 'border-white',
    gray: 'border-gray-400',
  };

  return (
    <div className={`flex justify-center items-center ${className}`}>
      <div
        className={`
          animate-spin rounded-full border-2 border-t-transparent
          ${sizeClasses[size]}
          ${colorClasses[color]}
        `}
      />
    </div>
  );
};

// Error toast component
const ErrorToast = ({ message, onClose, type = 'error', duration = 5000 }) => {
  React.useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const typeClasses = {
    error: 'bg-red-800 border-red-600 text-red-100',
    warning: 'bg-yellow-800 border-yellow-600 text-yellow-100',
    info: 'bg-blue-800 border-blue-600 text-blue-100',
  };

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm">
      <div className={`
        p-4 rounded-lg shadow-lg border-l-4
        ${typeClasses[type]}
        animate-slide-in
      `}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium">{message}</p>
          </div>
          <button
            onClick={onClose}
            className="ml-3 text-current opacity-70 hover:opacity-100 transition-opacity"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

// Main App Component
const App = () => {
  const [supabase, setSupabase] = React.useState(null);
  const [session, setSession] = React.useState(null);
  const [user, setUser] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [isRegistering, setIsRegistering] = React.useState(false);
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [fullName, setFullName] = React.useState('');
  const [company, setCompany] = React.useState('');
  const [position, setPosition] = React.useState('');

  React.useEffect(() => {
    initializeApp().then((sb) => {
      setSupabase(sb);
      checkSession(sb);
    }).catch((err) => {
      console.error('App initialization failed:', err);
      setError('Failed to initialize application');
      setLoading(false);
    });
  }, []);

  const checkSession = async (sb) => {
    try {
      const { data: { session: currentSession } } = await sb.auth.getSession();
      if (currentSession) {
        setSession(currentSession);
        setUser(currentSession.user);
      }
    } catch (err) {
      console.error('Session check failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      setSession(data.session);
      setUser(data.user);
      setEmail('');
      setPassword('');
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!email || !password || !confirmPassword || !fullName) {
      setError('Please fill in all required fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            company,
            position,
          },
        },
      });

      if (error) throw error;
      setSession(data.session);
      setUser(data.user);
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setFullName('');
      setCompany('');
      setPosition('');
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setSession(null);
      setUser(null);
    } catch (err) {
      console.error('Logout error:', err);
      setError('Logout failed');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white font-inter flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white font-inter flex items-center justify-center p-4">
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
            <div className="bg-gray-800 rounded-lg shadow-xl border border-gray-700 p-6">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">Create Command Center Account</h2>
                <p className="text-gray-400">Join the Sovereign Command Center™</p>
              </div>

              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    placeholder="Enter your full name"
                    required
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    placeholder="Enter your email address"
                    required
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Company
                  </label>
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    placeholder="Enter your company name"
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Position
                  </label>
                  <input
                    type="text"
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    placeholder="Enter your position"
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Password *
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    placeholder="Create a strong password"
                    required
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Confirm Password *
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    placeholder="Confirm your password"
                    required
                    disabled={loading}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-700 hover:to-cyan-800 text-white font-medium py-2 px-4 rounded-md transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <LoadingSpinner size="small" color="white" />
                      <span className="ml-2">Creating Account...</span>
                    </div>
                  ) : (
                    'Create Command Center Account'
                  )}
                </button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-gray-400">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => setIsRegistering(false)}
                    className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
                    disabled={loading}
                  >
                    Sign In
                  </button>
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-gray-800 rounded-lg shadow-xl border border-gray-700 p-6">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">Access Command Center</h2>
                <p className="text-gray-400">Enter your credentials to proceed</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    placeholder="Enter your email"
                    required
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    placeholder="Enter your password"
                    required
                    disabled={loading}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-700 hover:to-cyan-800 text-white font-medium py-2 px-4 rounded-md transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <LoadingSpinner size="small" color="white" />
                      <span className="ml-2">Authenticating...</span>
                    </div>
                  ) : (
                    'Access Command Center'
                  )}
                </button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-gray-400">
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => setIsRegistering(true)}
                    className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
                    disabled={loading}
                  >
                    Create Account
                  </button>
                </p>
              </div>
            </div>
          )}

          {error && (
            <ErrorToast
              message={error}
              onClose={() => setError(null)}
            />
          )}
        </div>
      </div>
    );
  }

  // Main application dashboard
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
      {/* Navigation */}
      <nav className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Sovereign Command Center™</h1>
                <p className="text-xs text-gray-400">Covren Firm LLC</p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={handleLogout}
              className="text-gray-300 hover:text-white transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome, {user.user_metadata?.full_name || user.email}
          </h1>
          <p className="text-gray-400">
            Welcome to your Sovereign Command Center™ dashboard
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center">
              <div className="p-2 bg-blue-600 rounded-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Total Projects</p>
                <p className="text-2xl font-bold text-white">0</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center">
              <div className="p-2 bg-green-600 rounded-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Active Projects</p>
                <p className="text-2xl font-bold text-white">0</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center">
              <div className="p-2 bg-purple-600 rounded-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Documents</p>
                <p className="text-2xl font-bold text-white">0</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center">
              <div className="p-2 bg-red-600 rounded-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Critical</p>
                <p className="text-2xl font-bold text-white">0</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-gray-800 rounded-lg border border-gray-700">
          <div className="px-6 py-4 border-b border-gray-700">
            <h3 className="text-lg font-medium text-white">Recent Activity</h3>
          </div>
          <div className="p-6">
            <div className="text-center py-8">
              <p className="text-gray-400">No recent activity. Create your first project to get started.</p>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <ErrorToast
          message={error}
          onClose={() => setError(null)}
        />
      )}
    </div>
  );
};

// Render the app once dependencies are loaded
initializeApp().then(() => {
  const { createElement } = window.React;
  const { render } = window.ReactDOM;
  
  render(createElement(App), document.getElementById('root'));
}).catch((error) => {
  console.error('Failed to initialize app:', error);
  document.getElementById('root').innerHTML = `
    <div class="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white font-inter flex items-center justify-center p-4">
      <div class="text-center">
        <h1 class="text-2xl font-bold text-red-400 mb-4">Initialization Failed</h1>
        <p class="text-gray-400">Failed to load the application. Please refresh the page and try again.</p>
        <button onclick="window.location.reload()" class="mt-4 bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-md">
          Refresh Page
        </button>
      </div>
    </div>
  `;
});
