const React = require('react');
const { render, fireEvent, waitFor } = require('@testing-library/react');
const ClientPortal = require('../index.jsx').default;

jest.mock('../services/api.ts', () => ({
  authApi: {
    getSession: jest.fn(() => Promise.resolve({ data: null, error: null, success: false })),
    signIn: jest.fn(),
    signUp: jest.fn(),
    signOut: jest.fn(),
  },
  projectsApi: {
    getUserProjects: jest.fn(() => Promise.resolve({ data: [], error: null, success: true })),
    createProject: jest.fn(() => Promise.resolve({ data: {}, error: null, success: true })),
  },
  documentsApi: {
    uploadDocument: jest.fn(() => Promise.resolve({ data: {}, error: null, success: true })),
  },
  messagesApi: {
    getMessages: jest.fn(() => Promise.resolve({ data: [], error: null, success: true })),
  },
  notificationsApi: {
    getNotifications: jest.fn(() => Promise.resolve({ data: [], error: null, success: true })),
  }
}));

describe('ClientPortal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders login form with business terminology', () => {
    const { getByText, getByLabelText } = render(<ClientPortal />);
    expect(getByText('Login')).toBeInTheDocument();
    expect(getByLabelText('Email Address')).toBeInTheDocument();
    expect(getByLabelText('Password')).toBeInTheDocument();
  });

  test('handles login error', async () => {
    const mockError = new Error('Invalid credentials');
    createClient().auth.signInWithPassword.mockRejectedValue(mockError);
    const { getByLabelText, getByText, findByText } = render(<ClientPortal />);
    fireEvent.change(getByLabelText('Email Address'), { target: { value: 'test@business.com' } });
    fireEvent.change(getByLabelText('Password'), { target: { value: 'password' } });
    fireEvent.click(getByText('Login'));
    expect(await findByText('Invalid credentials')).toBeInTheDocument();
  });

  test('applies professional styles', () => {
    const { container } = render(<ClientPortal />);
    expect(container.querySelector('.neon-glow')).toBeInTheDocument();
    expect(container.querySelector('.glitch')).toBeInTheDocument();
    expect(container.querySelector('.flicker')).toBeInTheDocument();
  });
});
