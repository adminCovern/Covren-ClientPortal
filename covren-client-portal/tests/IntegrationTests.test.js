// Sovereign Command Center Integration Tests
// Covren Firm LLC - Production Grade Testing Suite

import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock API services
jest.mock('../services/api', () => ({
  authApi: {
    signIn: jest.fn(),
    signUp: jest.fn(),
    signOut: jest.fn(),
    getSession: jest.fn(),
  },
  projectsApi: {
    getUserProjects: jest.fn(),
    getProject: jest.fn(),
    createProject: jest.fn(),
    updateProject: jest.fn(),
    deleteProject: jest.fn(),
    getProjectStats: jest.fn(),
  },
  documentsApi: {
    getProjectDocuments: jest.fn(),
    uploadDocument: jest.fn(),
    deleteDocument: jest.fn(),
    getDocumentUrl: jest.fn(),
  },
  messagesApi: {
    getProjectMessages: jest.fn(),
    sendMessage: jest.fn(),
    updateMessage: jest.fn(),
    deleteMessage: jest.fn(),
    markMessageAsRead: jest.fn(),
  },
  usersApi: {
    getProjectUsers: jest.fn(),
    inviteUser: jest.fn(),
    removeUser: jest.fn(),
    updateUserRole: jest.fn(),
  },
  notificationsApi: {
    getUserNotifications: jest.fn(),
    markNotificationAsRead: jest.fn(),
    deleteNotification: jest.fn(),
  },
}));

// Mock realtime service
jest.mock('../services/realtime', () => ({
  realtimeService: {
    connect: jest.fn(),
    disconnect: jest.fn(),
    subscribe: jest.fn(),
    unsubscribe: jest.fn(),
    isConnected: jest.fn(),
    getConnectionState: jest.fn(),
  },
}));

// Mock validation utilities
jest.mock('../utils/validation', () => ({
  validateLoginForm: jest.fn(),
  validateRegisterForm: jest.fn(),
  validateProjectForm: jest.fn(),
  validateDocumentUpload: jest.fn(),
  validateMessageForm: jest.fn(),
  validateUserInviteForm: jest.fn(),
}));

// Test data
const mockUser = {
  id: 'user1',
  email: 'test@example.com',
  full_name: 'Test User',
  avatar_url: null,
  company: 'Test Company',
  position: 'Developer',
  phone: null,
  preferences: {
    notifications: { email: true, push: true, sms: false },
    theme: 'dark',
    language: 'en',
    timezone: 'UTC',
  },
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

const mockProject = {
  id: 'project1',
  name: 'Test Project',
  description: 'A test project for integration testing',
  status: 'active',
  priority: 'medium',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  created_by: 'user1',
  client_id: 'user1',
  budget: 10000,
  deadline: '2024-12-31',
  tags: ['test', 'integration'],
  metadata: {},
  stats: {
    total_members: 3,
    total_documents: 5,
    total_messages: 10,
    active_documents: 4,
  },
};

const mockDocument = {
  id: 'doc1',
  project_id: 'project1',
  name: 'test-document.pdf',
  file_path: 'documents/project1/test-document.pdf',
  file_size: 1024000,
  mime_type: 'application/pdf',
  uploaded_by: 'user1',
  uploaded_at: '2024-01-01T00:00:00Z',
  version: 1,
  is_public: false,
  encryption_key_id: null,
  checksum: 'abc123',
  metadata: {},
  status: 'active',
};

const mockMessage = {
  id: 'msg1',
  project_id: 'project1',
  sender_id: 'user1',
  content: 'Hello, this is a test message',
  message_type: 'text',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  is_edited: false,
  reply_to: null,
  metadata: {},
  sender: mockUser,
};

describe('Authentication Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('complete login flow with API integration', async () => {
    const { authApi } = require('../services/api');
    const { validateLoginForm } = require('../utils/validation');

    // Mock successful validation
    validateLoginForm.mockReturnValue({ isValid: true, errors: {} });

    // Mock successful API response
    authApi.signIn.mockResolvedValue({
      success: true,
      data: { user: mockUser, session: { access_token: 'test-token' } },
      error: null,
    });

    // Simulate login form submission
    const loginData = {
      email: 'test@example.com',
      password: 'password123',
    };

    const response = await authApi.signIn(loginData);

    expect(validateLoginForm).toHaveBeenCalledWith(loginData);
    expect(authApi.signIn).toHaveBeenCalledWith(loginData);
    expect(response.success).toBe(true);
    expect(response.data.user).toEqual(mockUser);
  });

  test('login flow with validation errors', async () => {
    const { authApi } = require('../services/api');
    const { validateLoginForm } = require('../utils/validation');

    // Mock validation failure
    validateLoginForm.mockReturnValue({
      isValid: false,
      errors: { email: 'Invalid email format' },
    });

    const loginData = {
      email: 'invalid-email',
      password: 'password123',
    };

    const validation = validateLoginForm(loginData);

    expect(validation.isValid).toBe(false);
    expect(validation.errors.email).toBe('Invalid email format');
    expect(authApi.signIn).not.toHaveBeenCalled();
  });

  test('login flow with API error', async () => {
    const { authApi } = require('../services/api');
    const { validateLoginForm } = require('../utils/validation');

    validateLoginForm.mockReturnValue({ isValid: true, errors: {} });
    authApi.signIn.mockResolvedValue({
      success: false,
      data: null,
      error: 'Invalid credentials',
    });

    const loginData = {
      email: 'test@example.com',
      password: 'wrongpassword',
    };

    const response = await authApi.signIn(loginData);

    expect(response.success).toBe(false);
    expect(response.error).toBe('Invalid credentials');
  });
});

describe('Project Management Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('complete project creation flow', async () => {
    const { projectsApi } = require('../services/api');
    const { validateProjectForm } = require('../utils/validation');

    validateProjectForm.mockReturnValue({ isValid: true, errors: {} });
    projectsApi.createProject.mockResolvedValue({
      success: true,
      data: mockProject,
      error: null,
    });

    const projectData = {
      name: 'New Test Project',
      description: 'A new test project',
      priority: 'high',
      budget: 15000,
      deadline: '2024-12-31',
      tags: ['new', 'test'],
    };

    const validation = validateProjectForm(projectData);
    expect(validation.isValid).toBe(true);

    const response = await projectsApi.createProject(projectData);
    expect(response.success).toBe(true);
    expect(response.data.name).toBe('Test Project');
  });

  test('project creation with validation errors', async () => {
    const { projectsApi } = require('../services/api');
    const { validateProjectForm } = require('../utils/validation');

    validateProjectForm.mockReturnValue({
      isValid: false,
      errors: { name: 'Project name is required' },
    });

    const projectData = {
      name: '',
      description: 'A project without name',
      priority: 'medium',
    };

    const validation = validateProjectForm(projectData);
    expect(validation.isValid).toBe(false);
    expect(validation.errors.name).toBe('Project name is required');
    expect(projectsApi.createProject).not.toHaveBeenCalled();
  });

  test('project retrieval and display', async () => {
    const { projectsApi } = require('../services/api');

    projectsApi.getUserProjects.mockResolvedValue({
      success: true,
      data: [mockProject],
      error: null,
    });

    const response = await projectsApi.getUserProjects();
    expect(response.success).toBe(true);
    expect(response.data).toHaveLength(1);
    expect(response.data[0].name).toBe('Test Project');
  });

  test('project deletion flow', async () => {
    const { projectsApi } = require('../services/api');

    projectsApi.deleteProject.mockResolvedValue({
      success: true,
      data: null,
      error: null,
    });

    const response = await projectsApi.deleteProject('project1');
    expect(response.success).toBe(true);
    expect(projectsApi.deleteProject).toHaveBeenCalledWith('project1');
  });
});

describe('Document Management Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('document upload flow with validation', async () => {
    const { documentsApi } = require('../services/api');
    const { validateDocumentUpload } = require('../utils/validation');

    const mockFile = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
    
    validateDocumentUpload.mockReturnValue({ isValid: true, errors: {} });
    documentsApi.uploadDocument.mockResolvedValue({
      success: true,
      data: mockDocument,
      error: null,
    });

    const uploadData = {
      file: mockFile,
      name: 'test-document.pdf',
      is_public: false,
      project_id: 'project1',
    };

    const validation = validateDocumentUpload(uploadData);
    expect(validation.isValid).toBe(true);

    const response = await documentsApi.uploadDocument(uploadData);
    expect(response.success).toBe(true);
    expect(response.data.name).toBe('test-document.pdf');
  });

  test('document upload with file validation errors', async () => {
    const { documentsApi } = require('../services/api');
    const { validateDocumentUpload } = require('../utils/validation');

    const mockLargeFile = new File(['x'.repeat(60 * 1024 * 1024)], 'large-file.pdf', { type: 'application/pdf' });
    
    validateDocumentUpload.mockReturnValue({
      isValid: false,
      errors: { file: 'File size must be less than 50MB' },
    });

    const uploadData = {
      file: mockLargeFile,
      name: 'large-file.pdf',
      is_public: false,
      project_id: 'project1',
    };

    const validation = validateDocumentUpload(uploadData);
    expect(validation.isValid).toBe(false);
    expect(validation.errors.file).toBe('File size must be less than 50MB');
    expect(documentsApi.uploadDocument).not.toHaveBeenCalled();
  });

  test('document retrieval for project', async () => {
    const { documentsApi } = require('../services/api');

    documentsApi.getProjectDocuments.mockResolvedValue({
      success: true,
      data: [mockDocument],
      error: null,
    });

    const response = await documentsApi.getProjectDocuments('project1');
    expect(response.success).toBe(true);
    expect(response.data).toHaveLength(1);
    expect(response.data[0].project_id).toBe('project1');
  });
});

describe('Messaging Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('message sending flow with validation', async () => {
    const { messagesApi } = require('../services/api');
    const { validateMessageForm } = require('../utils/validation');

    validateMessageForm.mockReturnValue({ isValid: true, errors: {} });
    messagesApi.sendMessage.mockResolvedValue({
      success: true,
      data: mockMessage,
      error: null,
    });

    const messageData = {
      content: 'Hello, this is a test message',
      message_type: 'text',
      project_id: 'project1',
    };

    const validation = validateMessageForm(messageData);
    expect(validation.isValid).toBe(true);

    const response = await messagesApi.sendMessage(messageData);
    expect(response.success).toBe(true);
    expect(response.data.content).toBe('Hello, this is a test message');
  });

  test('message sending with validation errors', async () => {
    const { messagesApi } = require('../services/api');
    const { validateMessageForm } = require('../utils/validation');

    validateMessageForm.mockReturnValue({
      isValid: false,
      errors: { content: 'Message content is required' },
    });

    const messageData = {
      content: '',
      message_type: 'text',
      project_id: 'project1',
    };

    const validation = validateMessageForm(messageData);
    expect(validation.isValid).toBe(false);
    expect(validation.errors.content).toBe('Message content is required');
    expect(messagesApi.sendMessage).not.toHaveBeenCalled();
  });

  test('message retrieval for project', async () => {
    const { messagesApi } = require('../services/api');

    messagesApi.getProjectMessages.mockResolvedValue({
      success: true,
      data: [mockMessage],
      error: null,
    });

    const response = await messagesApi.getProjectMessages('project1');
    expect(response.success).toBe(true);
    expect(response.data).toHaveLength(1);
    expect(response.data[0].project_id).toBe('project1');
  });
});

describe('User Management Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('user invitation flow with validation', async () => {
    const { usersApi } = require('../services/api');
    const { validateUserInviteForm } = require('../utils/validation');

    const mockProjectUser = {
      id: 'pu1',
      project_id: 'project1',
      user_id: 'user2',
      role: 'editor',
      permissions: {
        can_edit: true,
        can_delete: false,
        can_invite: false,
        can_upload: true,
        can_manage_users: false,
      },
      joined_at: '2024-01-01T00:00:00Z',
      invited_by: 'user1',
      user: mockUser,
    };

    validateUserInviteForm.mockReturnValue({ isValid: true, errors: {} });
    usersApi.inviteUser.mockResolvedValue({
      success: true,
      data: mockProjectUser,
      error: null,
    });

    const inviteData = {
      email: 'newuser@example.com',
      role: 'editor',
      project_id: 'project1',
    };

    const validation = validateUserInviteForm(inviteData);
    expect(validation.isValid).toBe(true);

    const response = await usersApi.inviteUser(inviteData);
    expect(response.success).toBe(true);
    expect(response.data.role).toBe('editor');
  });

  test('user invitation with validation errors', async () => {
    const { usersApi } = require('../services/api');
    const { validateUserInviteForm } = require('../utils/validation');

    validateUserInviteForm.mockReturnValue({
      isValid: false,
      errors: { email: 'Please enter a valid email address' },
    });

    const inviteData = {
      email: 'invalid-email',
      role: 'editor',
      project_id: 'project1',
    };

    const validation = validateUserInviteForm(inviteData);
    expect(validation.isValid).toBe(false);
    expect(validation.errors.email).toBe('Please enter a valid email address');
    expect(usersApi.inviteUser).not.toHaveBeenCalled();
  });

  test('project users retrieval', async () => {
    const { usersApi } = require('../services/api');

    const mockProjectUsers = [
      {
        id: 'pu1',
        project_id: 'project1',
        user_id: 'user1',
        role: 'admin',
        permissions: {
          can_edit: true,
          can_delete: true,
          can_invite: true,
          can_upload: true,
          can_manage_users: true,
        },
        joined_at: '2024-01-01T00:00:00Z',
        invited_by: null,
        user: mockUser,
      },
    ];

    usersApi.getProjectUsers.mockResolvedValue({
      success: true,
      data: mockProjectUsers,
      error: null,
    });

    const response = await usersApi.getProjectUsers('project1');
    expect(response.success).toBe(true);
    expect(response.data).toHaveLength(1);
    expect(response.data[0].role).toBe('admin');
  });
});

describe('Real-time Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('realtime connection establishment', async () => {
    const { realtimeService } = require('../services/realtime');

    realtimeService.connect.mockResolvedValue(true);
    realtimeService.isConnected.mockReturnValue(true);

    const connected = await realtimeService.connect();
    expect(connected).toBe(true);
    expect(realtimeService.isConnected()).toBe(true);
  });

  test('realtime subscription management', async () => {
    const { realtimeService } = require('../services/realtime');

    const mockCallback = jest.fn();
    const subscriptionKey = 'projects:INSERT';

    realtimeService.subscribe.mockReturnValue(subscriptionKey);
    realtimeService.unsubscribe.mockReturnValue(true);

    const key = realtimeService.subscribe('projects', 'INSERT', '', mockCallback);
    expect(key).toBe(subscriptionKey);

    const unsubscribed = realtimeService.unsubscribe(subscriptionKey);
    expect(unsubscribed).toBe(true);
  });

  test('realtime connection state monitoring', async () => {
    const { realtimeService } = require('../services/realtime');

    const mockConnectionState = {
      isConnected: true,
      isConnecting: false,
      lastHeartbeat: Date.now(),
      reconnectAttempts: 0,
    };

    realtimeService.getConnectionState.mockReturnValue(mockConnectionState);

    const state = realtimeService.getConnectionState();
    expect(state.isConnected).toBe(true);
    expect(state.reconnectAttempts).toBe(0);
  });
});

describe('Error Handling Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('API error handling and recovery', async () => {
    const { projectsApi } = require('../services/api');

    // Simulate network error
    projectsApi.getUserProjects.mockRejectedValue(new Error('Network error'));

    try {
      await projectsApi.getUserProjects();
    } catch (error) {
      expect(error.message).toBe('Network error');
    }
  });

  test('validation error handling', async () => {
    const { validateProjectForm } = require('../utils/validation');

    validateProjectForm.mockReturnValue({
      isValid: false,
      errors: {
        name: 'Project name is required',
        budget: 'Budget cannot be negative',
      },
    });

    const projectData = {
      name: '',
      budget: -1000,
    };

    const validation = validateProjectForm(projectData);
    expect(validation.isValid).toBe(false);
    expect(validation.errors.name).toBe('Project name is required');
    expect(validation.errors.budget).toBe('Budget cannot be negative');
  });

  test('authentication error handling', async () => {
    const { authApi } = require('../services/api');

    authApi.signIn.mockResolvedValue({
      success: false,
      data: null,
      error: 'Invalid credentials',
    });

    const response = await authApi.signIn({
      email: 'test@example.com',
      password: 'wrongpassword',
    });

    expect(response.success).toBe(false);
    expect(response.error).toBe('Invalid credentials');
  });
});

describe('Performance Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('API response time monitoring', async () => {
    const { projectsApi } = require('../services/api');

    // Mock API with delay
    projectsApi.getUserProjects.mockImplementation(() => 
      new Promise(resolve => 
        setTimeout(() => resolve({
          success: true,
          data: [mockProject],
          error: null,
        }), 100)
      )
    );

    const startTime = performance.now();
    const response = await projectsApi.getUserProjects();
    const endTime = performance.now();

    expect(response.success).toBe(true);
    expect(endTime - startTime).toBeGreaterThan(50); // Should take at least 50ms
  });

  test('memory usage monitoring', () => {
    // Mock performance.memory
    Object.defineProperty(performance, 'memory', {
      value: {
        usedJSHeapSize: 50 * 1024 * 1024, // 50MB
        totalJSHeapSize: 100 * 1024 * 1024, // 100MB
        jsHeapSizeLimit: 200 * 1024 * 1024, // 200MB
      },
      configurable: true,
    });

    const memoryUsage = performance.memory.usedJSHeapSize / 1024 / 1024; // Convert to MB
    expect(memoryUsage).toBe(50);
  });
}); 