const App = () => {
  const [user, setUser] = window.React.useState(null);
  const [session, setSession] = window.React.useState(null);
  const [loading, setLoading] = window.React.useState(true);
  const [error, setError] = window.React.useState(null);
  const [isRegistering, setIsRegistering] = window.React.useState(false);

  // Initialize app and check session
  const initializeApp = window.React.useCallback(async () => {
    try {
      setLoading(true);
      const response = await window.authApi.getSession();
      
      if (response.success && response.data) {
        setUser(response.data.user);
        setSession(response.data.session);
      }
      setLoading(false);
    } catch (error) {
      console.error('Failed to initialize app:', error);
      setError('Failed to initialize application');
      setLoading(false);
    }
  }, []);

  window.React.useEffect(() => {
    initializeApp();
  }, [initializeApp]);

  const handleLogin = async (credentials) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await window.authApi.signIn(credentials);
      
      if (response.success && response.data) {
        setUser(response.data.user);
        setSession(response.data.session);
      } else {
        setError(response.error || 'Login failed');
      }
      setLoading(false);
    } catch (error) {
      console.error('Login error:', error);
      setError('Login failed');
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await window.authApi.signOut();
      setUser(null);
      setSession(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (loading) {
    return window.React.createElement('div', {
      className: "min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white flex items-center justify-center"
    }, window.React.createElement('div', {
      className: "animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"
    }));
  }

  if (!user || !session) {
    return window.React.createElement('div', {
      className: "min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white"
    }, [
      window.React.createElement('div', {
        key: 'auth-container',
        className: "flex items-center justify-center min-h-screen"
      }, window.React.createElement('div', {
        className: "w-full max-w-md bg-gray-800 p-8 rounded-lg"
      }, [
        window.React.createElement('h2', {
          key: 'title',
          className: "text-2xl font-bold mb-6"
        }, 'Login'),
        window.React.createElement('form', {
          key: 'form',
          onSubmit: (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            handleLogin({
              email: formData.get('email'),
              password: formData.get('password'),
            });
          }
        }, [
          window.React.createElement('div', {
            key: 'email-field',
            className: "mb-4"
          }, [
            window.React.createElement('label', {
              key: 'email-label',
              className: "block text-sm font-medium mb-2"
            }, 'Email'),
            window.React.createElement('input', {
              key: 'email-input',
              type: "email",
              name: "email",
              defaultValue: "admin@covrenfirm.com",
              required: true,
              className: "w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
            })
          ]),
          window.React.createElement('div', {
            key: 'password-field',
            className: "mb-6"
          }, [
            window.React.createElement('label', {
              key: 'password-label',
              className: "block text-sm font-medium mb-2"
            }, 'Password'),
            window.React.createElement('input', {
              key: 'password-input',
              type: "password",
              name: "password",
              defaultValue: "admin123",
              required: true,
              className: "w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
            })
          ]),
          window.React.createElement('button', {
            key: 'submit-button',
            type: "submit",
            disabled: loading,
            className: "w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 px-4 py-2 rounded-md"
          }, loading ? 'Logging in...' : 'Login')
        ])
      ])),
      error && window.React.createElement('div', {
        key: 'error-toast',
        className: "fixed top-4 right-4 bg-red-600 text-white p-4 rounded-lg"
      }, [
        error,
        window.React.createElement('button', {
          key: 'close-error',
          onClick: () => setError(null),
          className: "ml-4 text-white hover:text-gray-200"
        }, '×')
      ])
    ]);
  }

  return window.React.createElement('div', {
    className: "min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white"
  }, [
    window.React.createElement('div', {
      key: 'main-container',
      className: "flex h-screen"
    }, [
      window.React.createElement('div', {
        key: 'sidebar',
        className: "w-64 bg-gray-800 border-r border-gray-700"
      }, window.React.createElement('div', {
        className: "p-4"
      }, [
        window.React.createElement('h1', {
          key: 'title',
          className: "text-xl font-bold"
        }, 'Covren Portal'),
        window.React.createElement('div', {
          key: 'user-info',
          className: "mt-4"
        }, window.React.createElement('p', {
          className: "text-sm text-gray-300"
        }, `Welcome, ${user.full_name || user.email}`)),
        window.React.createElement('button', {
          key: 'logout-button',
          onClick: handleLogout,
          className: "mt-4 bg-red-600 hover:bg-red-700 px-4 py-2 rounded"
        }, 'Logout')
      ])),
      window.React.createElement('div', {
        key: 'content',
        className: "flex-1"
      }, window.React.createElement(window.Dashboard, { user: user }))
    ]),
    error && window.React.createElement('div', {
      key: 'error-toast',
      className: "fixed top-4 right-4 bg-red-600 text-white p-4 rounded-lg"
    }, [
      error,
      window.React.createElement('button', {
        key: 'close-error',
        onClick: () => setError(null),
        className: "ml-4 text-white hover:text-gray-200"
      }, '×')
    ])
  ]);
};

export default App;
