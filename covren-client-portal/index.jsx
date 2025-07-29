// Sovereign Command Center Main Entry Point
// Covren Firm LLC - Production Grade Client Portal

// Wait for React and ReactDOM to load
function waitForDependencies(maxRetries = 50) {
  return new Promise((resolve, reject) => {
    let retries = 0;
    const checkDependencies = () => {
      const hasReact = typeof window.React !== 'undefined' && window.React !== null;
      const hasReactDOM = typeof window.ReactDOM !== 'undefined' && window.ReactDOM !== null && typeof window.ReactDOM.render === 'function';
      
      console.log('Dependency check:', { hasReact, hasReactDOM });
      if (hasReact && hasReactDOM) {
        resolve();
      } else if (retries >= maxRetries) {
        reject(new Error('Max retry attempts reached for dependency loading: ' + JSON.stringify({ hasReact, hasReactDOM })));
      } else {
        retries++;
        console.log(`Dependencies not loaded yet. Retrying... (Attempt ${retries}/${maxRetries})`, { hasReact, hasReactDOM });
        setTimeout(checkDependencies, 300);
      }
    };
    checkDependencies();
  });
}

// Initialize React app
async function initializeApp() {
  try {
    await waitForDependencies();
    
    const { createElement } = window.React;
    const { render } = window.ReactDOM;
    
    render(createElement(App), document.getElementById('root'));
  } catch (err) {
    console.error('App initialization failed:', err);
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

const Dashboard = ({ user }) => {
  const [projects, setProjects] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [selectedView, setSelectedView] = React.useState('overview');
  const [showProjectCreator, setShowProjectCreator] = React.useState(false);

  React.useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      console.log('Dashboard: Starting loadProjects...');
      
      if (window.projectsApi) {
        const response = await window.projectsApi.getUserProjects();
        console.log('Dashboard: API response:', response);
        console.log('Dashboard: Response success:', response.success);
        console.log('Dashboard: Response data:', response.data);
        console.log('Dashboard: Is data array?', Array.isArray(response.data));
        if (response.success && response.data) {
          console.log('Dashboard: Setting projects to:', response.data);
          const projectsArray = Array.isArray(response.data) ? response.data : (response.data.projects || []);
          setProjects(projectsArray);
        } else {
          console.log('Dashboard: API failed, setting error:', response.error);
          setError(response.error || 'Failed to load projects');
        }
      } else {
        console.error('Dashboard: projectsApi not available on window');
        setError('API not available');
      }
    } catch (error) {
      console.error('Dashboard: Exception in loadProjects:', error);
      setError('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const handleProjectCreated = (project) => {
    setProjects(prev => [project, ...prev]);
    setShowProjectCreator(false);
  };

  const handleCancelProjectCreation = () => {
    setShowProjectCreator(false);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const getProjectStats = () => {
    const total = projects.length;
    const active = projects.filter(p => p.status === 'active').length;
    const completed = projects.filter(p => p.status === 'completed').length;
    const critical = projects.filter(p => p.priority === 'critical').length;

    return { total, active, completed, critical };
  };

  const stats = getProjectStats();

  if (loading) {
    return React.createElement('div', {
      className: "min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white flex items-center justify-center"
    }, React.createElement(LoadingSpinner, { size: 'lg' }));
  }

  return React.createElement('div', {
    className: "min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white"
  }, [
    React.createElement('nav', {
      key: 'nav',
      className: "bg-gray-800 border-b border-gray-700 px-6 py-4"
    }, React.createElement('div', {
      className: "flex items-center justify-between"
    }, [
      React.createElement('div', {
        key: 'nav-left',
        className: "flex items-center"
      }, React.createElement('div', {
        className: "flex items-center space-x-3"
      }, [
        React.createElement('div', {
          key: 'logo',
          className: "w-8 h-8 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center"
        }, React.createElement('svg', {
          className: "w-5 h-5 text-white",
          fill: "none",
          stroke: "currentColor",
          viewBox: "0 0 24 24"
        }, React.createElement('path', {
          strokeLinecap: "round",
          strokeLinejoin: "round",
          strokeWidth: 2,
          d: "M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
        }))),
        React.createElement('div', {
          key: 'title'
        }, [
          React.createElement('h1', {
            key: 'h1',
            className: "text-xl font-bold text-white"
          }, 'Sovereign Command Center™'),
          React.createElement('p', {
            key: 'p',
            className: "text-xs text-gray-400"
          }, 'Covren Firm LLC')
        ])
      ])),
      React.createElement('div', {
        key: 'nav-right',
        className: "flex items-center space-x-4"
      }, React.createElement('button', {
        onClick: () => window.location.reload(),
        className: "text-gray-300 hover:text-white transition-colors"
      }, 'Sign Out'))
    ])),
    
    React.createElement('div', {
      key: 'content',
      className: "p-6"
    }, [
      React.createElement('div', {
        key: 'welcome',
        className: "mb-8"
      }, [
        React.createElement('h1', {
          key: 'greeting',
          className: "text-3xl font-bold text-white mb-2"
        }, `${getGreeting()}, ${user.full_name || user.email}`),
        React.createElement('p', {
          key: 'subtitle',
          className: "text-gray-400"
        }, 'Welcome to your Sovereign Command Center™ dashboard')
      ]),

      React.createElement('div', {
        key: 'stats',
        className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      }, [
        React.createElement('div', {
          key: 'total',
          className: "bg-gray-800 rounded-lg p-6 border border-gray-700"
        }, React.createElement('div', {
          className: "flex items-center"
        }, [
          React.createElement('div', {
            key: 'icon',
            className: "p-2 bg-blue-600 rounded-lg"
          }, React.createElement('svg', {
            className: "w-6 h-6 text-white",
            fill: "none",
            stroke: "currentColor",
            viewBox: "0 0 24 24"
          }, React.createElement('path', {
            strokeLinecap: "round",
            strokeLinejoin: "round",
            strokeWidth: 2,
            d: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
          }))),
          React.createElement('div', {
            key: 'text',
            className: "ml-4"
          }, [
            React.createElement('p', {
              key: 'label',
              className: "text-sm font-medium text-gray-400"
            }, 'Total Projects'),
            React.createElement('p', {
              key: 'value',
              className: "text-2xl font-bold text-white"
            }, stats.total.toString())
          ])
        ])),

        React.createElement('div', {
          key: 'active',
          className: "bg-gray-800 rounded-lg p-6 border border-gray-700"
        }, React.createElement('div', {
          className: "flex items-center"
        }, [
          React.createElement('div', {
            key: 'icon',
            className: "p-2 bg-green-600 rounded-lg"
          }, React.createElement('svg', {
            className: "w-6 h-6 text-white",
            fill: "none",
            stroke: "currentColor",
            viewBox: "0 0 24 24"
          }, React.createElement('path', {
            strokeLinecap: "round",
            strokeLinejoin: "round",
            strokeWidth: 2,
            d: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          }))),
          React.createElement('div', {
            key: 'text',
            className: "ml-4"
          }, [
            React.createElement('p', {
              key: 'label',
              className: "text-sm font-medium text-gray-400"
            }, 'Active Projects'),
            React.createElement('p', {
              key: 'value',
              className: "text-2xl font-bold text-white"
            }, stats.active.toString())
          ])
        ])),

        React.createElement('div', {
          key: 'docs',
          className: "bg-gray-800 rounded-lg p-6 border border-gray-700"
        }, React.createElement('div', {
          className: "flex items-center"
        }, [
          React.createElement('div', {
            key: 'icon',
            className: "p-2 bg-purple-600 rounded-lg"
          }, React.createElement('svg', {
            className: "w-6 h-6 text-white",
            fill: "none",
            stroke: "currentColor",
            viewBox: "0 0 24 24"
          }, React.createElement('path', {
            strokeLinecap: "round",
            strokeLinejoin: "round",
            strokeWidth: 2,
            d: "M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          }))),
          React.createElement('div', {
            key: 'text',
            className: "ml-4"
          }, [
            React.createElement('p', {
              key: 'label',
              className: "text-sm font-medium text-gray-400"
            }, 'Documents'),
            React.createElement('p', {
              key: 'value',
              className: "text-2xl font-bold text-white"
            }, '0')
          ])
        ])),

        React.createElement('div', {
          key: 'critical',
          className: "bg-gray-800 rounded-lg p-6 border border-gray-700"
        }, React.createElement('div', {
          className: "flex items-center"
        }, [
          React.createElement('div', {
            key: 'icon',
            className: "p-2 bg-red-600 rounded-lg"
          }, React.createElement('svg', {
            className: "w-6 h-6 text-white",
            fill: "none",
            stroke: "currentColor",
            viewBox: "0 0 24 24"
          }, React.createElement('path', {
            strokeLinecap: "round",
            strokeLinejoin: "round",
            strokeWidth: 2,
            d: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
          }))),
          React.createElement('div', {
            key: 'text',
            className: "ml-4"
          }, [
            React.createElement('p', {
              key: 'label',
              className: "text-sm font-medium text-gray-400"
            }, 'Critical'),
            React.createElement('p', {
              key: 'value',
              className: "text-2xl font-bold text-white"
            }, stats.critical.toString())
          ])
        ]))
      ]),

      React.createElement('div', {
        key: 'activity',
        className: "mt-8 bg-gray-800 rounded-lg border border-gray-700"
      }, [
        React.createElement('div', {
          key: 'header',
          className: "px-6 py-4 border-b border-gray-700"
        }, React.createElement('h3', {
          className: "text-lg font-medium text-white"
        }, 'Recent Activity')),
        React.createElement('div', {
          key: 'content',
          className: "p-6"
        }, React.createElement('div', {
          className: "text-center py-8"
        }, React.createElement('p', {
          className: "text-gray-400"
        }, projects.length === 0 ? 'No recent activity. Create your first project to get started.' : `${projects.length} projects loaded successfully.`)))
      ])
    ])
  ]);
};

window.Dashboard = Dashboard;

const authApi = {
  async signIn(credentials) {
    try {
      const response = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: credentials.email,
          password: credentials.password,
        }),
      });
      
      const data = await response.json();
      if (data.success && data.data) {
        localStorage.setItem('auth_token', data.data.token);
        return { 
          data: { 
            user: data.data.user, 
            session: { user: data.data.user, access_token: data.data.token } 
          }, 
          error: null, 
          success: true 
        };
      }
      
      return { data: null, error: data.error || 'Authentication failed', success: false };
    } catch (error) {
      return { 
        data: null, 
        error: error.message || 'Authentication failed', 
        success: false 
      };
    }
  },

  async signOut() {
    try {
      const token = localStorage.getItem('auth_token');
      if (token) {
        await fetch('http://localhost:8080/api/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
      }
      localStorage.removeItem('auth_token');
      return { data: null, error: null, success: true };
    } catch (error) {
      localStorage.removeItem('auth_token');
      return { 
        data: null, 
        error: error.message || 'Sign out failed', 
        success: false 
      };
    }
  },

  async getSession() {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        return { data: null, error: 'No token found', success: false };
      }

      const response = await fetch('http://localhost:8080/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      if (data.success && data.data) {
        return { 
          data: { 
            user: data.data.user, 
            session: { user: data.data.user, access_token: token } 
          }, 
          error: null, 
          success: true 
        };
      }
      return { data: null, error: data.error || 'Failed to get session', success: false };
    } catch (error) {
      return { 
        data: null, 
        error: error.message || 'Failed to get session', 
        success: false 
      };
    }
  }
};

const projectsApi = {
  async getUserProjects(filters) {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        return { data: [], error: 'No authentication token', success: false };
      }

      let query = '/projects';
      const params = new URLSearchParams();
      
      if (filters) {
        if (filters.status?.length) {
          params.append('status', filters.status.join(','));
        }
        if (filters.priority?.length) {
          params.append('priority', filters.priority.join(','));
        }
        if (filters.search) {
          params.append('search', filters.search);
        }
      }
      
      if (params.toString()) {
        query += `?${params.toString()}`;
      }
      
      const response = await fetch(`http://localhost:3000/api${query}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      if (data.success && data.data) {
        return { data: data.data, error: null, success: true };
      }
      return { data: [], error: data.error || 'Failed to load projects', success: false };
    } catch (error) {
      return { 
        data: [], 
        error: error.message || 'Failed to load projects', 
        success: false 
      };
    }
  },

  async createProject(projectData) {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        return { data: null, error: 'No authentication token', success: false };
      }

      const response = await fetch('http://localhost:3000/api/projects', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(projectData),
      });
      
      const data = await response.json();
      if (data.success && data.data) {
        return { data: data.data, error: null, success: true };
      }
      return { data: null, error: data.error || 'Failed to create project', success: false };
    } catch (error) {
      return { 
        data: null, 
        error: error.message || 'Failed to create project', 
        success: false 
      };
    }
  }
};

window.authApi = authApi;
window.projectsApi = projectsApi;

console.log('API services loaded:', { 
  authApi: !!window.authApi, 
  projectsApi: !!window.projectsApi 
});

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
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (token) {
        const response = await fetch('http://localhost:8080/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            setUser(result.data.user);
            setSession({ user: result.data.user, access_token: token });
          }
        } else {
          localStorage.removeItem('auth_token');
        }
      }
    } catch (err) {
      console.error('Session check failed:', err);
      localStorage.removeItem('auth_token');
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
      
      const response = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const result = await response.json();
      
      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Login failed');
      }

      localStorage.setItem('auth_token', result.data.token);
      setSession({ user: result.data.user, access_token: result.data.token });
      setUser(result.data.user);
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
      
      const response = await fetch('http://localhost:8080/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          email, 
          password, 
          full_name: fullName,
          company,
          position
        })
      });

      const result = await response.json();
      
      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Registration failed');
      }

      localStorage.setItem('auth_token', result.data.token);
      setSession({ user: result.data.user, access_token: result.data.token });
      setUser(result.data.user);
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
      const token = localStorage.getItem('auth_token');
      if (token) {
        await fetch('http://localhost:8080/api/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
      }
      localStorage.removeItem('auth_token');
      setSession(null);
      setUser(null);
    } catch (err) {
      console.error('Logout error:', err);
      localStorage.removeItem('auth_token');
      setSession(null);
      setUser(null);
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

  // Main application dashboard - use the Dashboard component
  if (window.Dashboard) {
    return window.React.createElement(window.Dashboard, { user: user });
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-400">Loading Dashboard...</p>
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

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { default: App };
}

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
