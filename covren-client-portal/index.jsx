// Sovereign Command Center Main Entry Point
// Covren Firm LLC - Production Grade Client Portal

import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/App';
import { AuthProvider } from './contexts/AuthContext';

console.log('JavaScript file loaded successfully');

function initializeApp() {
  console.log('initializeApp called');
  console.log('window.React:', typeof window.React, window.React);
  console.log('window.ReactDOM:', typeof window.ReactDOM, window.ReactDOM);
  
  const React = window.React;
  const ReactDOM = window.ReactDOM;
  
  if (!React || !ReactDOM) {
    console.log('Waiting for React/ReactDOM to load...');
    setTimeout(initializeApp, 100);
    return;
  }
  
  console.log('React and ReactDOM loaded successfully');

  function LoginForm() {
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState('');
    const [user, setUser] = React.useState(null);

    const handleLogin = async (e) => {
      e.preventDefault();
      setLoading(true);
      setError('');

      try {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok && data.success) {
          localStorage.setItem('auth_token', data.token);
          setUser(data.user);
        } else {
          setError(data.error || 'Login failed');
        }
      } catch (err) {
        setError('Network error: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    const handleLogout = () => {
      localStorage.removeItem('auth_token');
      setUser(null);
      setEmail('');
      setPassword('');
    };

    React.useEffect(() => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        fetch('/api/auth/profile', {
          headers: { 'Authorization': `Bearer ${token}` },
          credentials: 'include'
        })
        .then(res => res.json())
        .then(data => {
          if (data && !data.error) {
            setUser(data);
          } else {
            localStorage.removeItem('auth_token');
          }
        })
        .catch(() => {
          localStorage.removeItem('auth_token');
        });
      }
    }, []);

    if (user) {
      return React.createElement('div', {
        className: 'min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white p-8'
      }, [
        React.createElement('div', {
          key: 'header',
          className: 'flex justify-between items-center mb-8'
        }, [
          React.createElement('h1', {
            key: 'title',
            className: 'text-3xl font-bold text-cyan-400'
          }, 'Sovereign Command Center™'),
          React.createElement('button', {
            key: 'logout',
            onClick: handleLogout,
            className: 'bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-md transition-colors'
          }, 'Logout')
        ]),
        React.createElement('div', {
          key: 'content',
          className: 'bg-gray-800 p-6 rounded-lg border border-gray-700'
        }, [
          React.createElement('h2', {
            key: 'welcome',
            className: 'text-xl font-semibold mb-4'
          }, `Welcome, ${user.name || user.email}!`),
          React.createElement('p', {
            key: 'description',
            className: 'text-gray-300 mb-4'
          }, 'Authentication system is working correctly. You are now logged in.'),
          React.createElement('div', {
            key: 'user-info',
            className: 'bg-gray-700 p-4 rounded-md'
          }, [
            React.createElement('h3', {
              key: 'info-title',
              className: 'text-lg font-medium mb-2'
            }, 'User Information'),
            React.createElement('p', {
              key: 'email',
              className: 'text-gray-300'
            }, `Email: ${user.email}`),
            React.createElement('p', {
              key: 'role',
              className: 'text-gray-300'
            }, `Role: ${user.role || 'user'}`)
          ])
        ])
      ]);
    }

    return React.createElement('div', {
      className: 'min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-4'
    }, React.createElement('div', {
      className: 'w-full max-w-md'
    }, [
      React.createElement('div', {
        key: 'header',
        className: 'text-center mb-8'
      }, [
        React.createElement('h1', {
          key: 'title',
          className: 'text-4xl font-bold text-cyan-400 mb-2'
        }, 'Sovereign Command Center™'),
        React.createElement('p', {
          key: 'subtitle',
          className: 'text-gray-400 text-lg'
        }, 'Covren Firm LLC - Client Portal')
      ]),
      React.createElement('form', {
        key: 'form',
        onSubmit: handleLogin,
        className: 'bg-gray-800 p-6 rounded-lg border border-gray-700'
      }, [
        React.createElement('div', {
          key: 'email-field',
          className: 'mb-4'
        }, [
          React.createElement('label', {
            key: 'email-label',
            className: 'block text-sm font-medium text-gray-300 mb-1'
          }, 'Email'),
          React.createElement('input', {
            key: 'email-input',
            type: 'email',
            value: email,
            onChange: (e) => setEmail(e.target.value),
            className: 'w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500',
            placeholder: 'Enter your email',
            required: true,
            disabled: loading
          })
        ]),
        React.createElement('div', {
          key: 'password-field',
          className: 'mb-6'
        }, [
          React.createElement('label', {
            key: 'password-label',
            className: 'block text-sm font-medium text-gray-300 mb-1'
          }, 'Password'),
          React.createElement('input', {
            key: 'password-input',
            type: 'password',
            value: password,
            onChange: (e) => setPassword(e.target.value),
            className: 'w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500',
            placeholder: 'Enter your password',
            required: true,
            disabled: loading
          })
        ]),
        React.createElement('button', {
          key: 'submit-button',
          type: 'submit',
          disabled: loading,
          className: 'w-full bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-600 text-white py-2 px-4 rounded-md transition-colors'
        }, loading ? 'Signing In...' : 'Sign In')
      ]),
      error && React.createElement('div', {
        key: 'error',
        className: 'mt-4 p-3 bg-red-800 border border-red-600 rounded-md text-red-100'
      }, error)
    ]));
  }

  const rootElement = document.getElementById('root');
  if (rootElement) {
    const AppWrapper = () => React.createElement(AuthProvider, null, React.createElement(App));
    
    if (ReactDOM.createRoot) {
      const root = ReactDOM.createRoot(rootElement);
      root.render(React.createElement(AppWrapper));
    } else {
      ReactDOM.render(React.createElement(AppWrapper), rootElement);
    }
    console.log('App initialized successfully');
  } else {
    console.error('Root element not found');
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}
