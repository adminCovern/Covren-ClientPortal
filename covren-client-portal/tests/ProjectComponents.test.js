// Sovereign Command Center Project Components Tests
// Covren Firm LLC - Production Grade Testing

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock API services
jest.mock('../services/api', () => ({
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

// Mock validation utilities
jest.mock('../utils/validation', () => ({
  validateProjectForm: jest.fn(),
  validateDocumentUpload: jest.fn(),
  validateMessageForm: jest.fn(),
  validateUserInviteForm: jest.fn(),
}));

// Test data
const mockProject = {
  id: '1',
  name: 'Test Project',
  description: 'A test project for testing',
  status: 'active',
  priority: 'medium',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  created_by: 'user1',
  client_id: 'user1',
  budget: 10000,
  deadline: '2024-12-31',
  tags: ['test', 'demo'],
  metadata: {},
  stats: {
    total_members: 3,
    total_documents: 5,
    total_messages: 10,
    active_documents: 4,
  },
};

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

const mockDocument = {
  id: 'doc1',
  project_id: '1',
  name: 'test-document.pdf',
  file_path: 'documents/1/test-document.pdf',
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
  project_id: '1',
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

const mockProjectUser = {
  id: 'pu1',
  project_id: '1',
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
};

describe('ProjectCard Component', () => {
  const defaultProps = {
    project: mockProject,
    onSelect: jest.fn(),
    onEdit: jest.fn(),
    onDelete: jest.fn(),
    userRole: 'admin',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders project information correctly', () => {
    render(<div data-testid="project-card" {...defaultProps} />);
    
    expect(screen.getByText('Test Project')).toBeInTheDocument();
    expect(screen.getByText('A test project for testing')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.getByText('$10,000.00')).toBeInTheDocument();
  });

  test('displays project stats when available', () => {
    render(<div data-testid="project-card" {...defaultProps} />);
    
    expect(screen.getByText('3')).toBeInTheDocument(); // Members
    expect(screen.getByText('5')).toBeInTheDocument(); // Documents
    expect(screen.getByText('10')).toBeInTheDocument(); // Messages
  });

  test('shows edit and delete buttons for admin role', () => {
    render(<div data-testid="project-card" {...defaultProps} />);
    
    const editButton = screen.getByTitle('Edit project');
    const deleteButton = screen.getByTitle('Delete project');
    
    expect(editButton).toBeInTheDocument();
    expect(deleteButton).toBeInTheDocument();
  });

  test('hides edit and delete buttons for non-admin role', () => {
    render(<div data-testid="project-card" {...defaultProps} userRole="viewer" />);
    
    const editButton = screen.queryByTitle('Edit project');
    const deleteButton = screen.queryByTitle('Delete project');
    
    expect(editButton).not.toBeInTheDocument();
    expect(deleteButton).not.toBeInTheDocument();
  });

  test('calls onSelect when view project button is clicked', () => {
    render(<div data-testid="project-card" {...defaultProps} />);
    
    const viewButton = screen.getByText('View Project');
    fireEvent.click(viewButton);
    
    expect(defaultProps.onSelect).toHaveBeenCalledWith(mockProject);
  });
});

describe('ProjectCreator Component', () => {
  const defaultProps = {
    onProjectCreated: jest.fn(),
    onCancel: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders form fields correctly', () => {
    render(<div data-testid="project-creator" {...defaultProps} />);
    
    expect(screen.getByLabelText('Project Name *')).toBeInTheDocument();
    expect(screen.getByLabelText('Description')).toBeInTheDocument();
    expect(screen.getByLabelText('Priority')).toBeInTheDocument();
    expect(screen.getByLabelText('Budget (USD)')).toBeInTheDocument();
    expect(screen.getByLabelText('Deadline')).toBeInTheDocument();
  });

  test('validates required fields', async () => {
    const { validateProjectForm } = require('../utils/validation');
    validateProjectForm.mockReturnValue({
      isValid: false,
      errors: { name: 'Project name is required' },
    });

    render(<div data-testid="project-creator" {...defaultProps} />);
    
    const submitButton = screen.getByText('Create Project');
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Project name is required')).toBeInTheDocument();
    });
  });

  test('submits form with valid data', async () => {
    const { validateProjectForm } = require('../utils/validation');
    const { projectsApi } = require('../services/api');
    
    validateProjectForm.mockReturnValue({ isValid: true, errors: {} });
    projectsApi.createProject.mockResolvedValue({
      success: true,
      data: mockProject,
      error: null,
    });

    render(<div data-testid="project-creator" {...defaultProps} />);
    
    const nameInput = screen.getByLabelText('Project Name *');
    const descriptionInput = screen.getByLabelText('Description');
    
    fireEvent.change(nameInput, { target: { value: 'New Project' } });
    fireEvent.change(descriptionInput, { target: { value: 'New project description' } });
    
    const submitButton = screen.getByText('Create Project');
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(projectsApi.createProject).toHaveBeenCalled();
      expect(defaultProps.onProjectCreated).toHaveBeenCalledWith(mockProject);
    });
  });

  test('handles tag input correctly', () => {
    render(<div data-testid="project-creator" {...defaultProps} />);
    
    const tagInput = screen.getByPlaceholderText('Type tags and press Enter or comma');
    
    fireEvent.change(tagInput, { target: { value: 'tag1' } });
    fireEvent.keyDown(tagInput, { key: 'Enter' });
    
    expect(screen.getByText('tag1')).toBeInTheDocument();
  });
});

describe('ProjectDetails Component', () => {
  const defaultProps = {
    projectId: '1',
    onBack: jest.fn(),
    onEdit: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('loads and displays project data', async () => {
    const { projectsApi, documentsApi, messagesApi, usersApi } = require('../services/api');
    
    projectsApi.getProject.mockResolvedValue({
      success: true,
      data: mockProject,
    });
    documentsApi.getProjectDocuments.mockResolvedValue({
      success: true,
      data: [mockDocument],
    });
    messagesApi.getProjectMessages.mockResolvedValue({
      success: true,
      data: [mockMessage],
    });
    usersApi.getProjectUsers.mockResolvedValue({
      success: true,
      data: [mockProjectUser],
    });

    render(<div data-testid="project-details" {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Project')).toBeInTheDocument();
    });
  });

  test('displays loading state initially', () => {
    render(<div data-testid="project-details" {...defaultProps} />);
    
    expect(screen.getByText('Loading project details...')).toBeInTheDocument();
  });

  test('handles error state', async () => {
    const { projectsApi } = require('../services/api');
    projectsApi.getProject.mockResolvedValue({
      success: false,
      error: 'Failed to load project',
    });

    render(<div data-testid="project-details" {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.getByText('Error loading project')).toBeInTheDocument();
      expect(screen.getByText('Failed to load project')).toBeInTheDocument();
    });
  });

  test('switches between tabs correctly', async () => {
    const { projectsApi } = require('../services/api');
    projectsApi.getProject.mockResolvedValue({
      success: true,
      data: mockProject,
    });

    render(<div data-testid="project-details" {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.getByText('Overview')).toBeInTheDocument();
    });

    const documentsTab = screen.getByText('Documents');
    fireEvent.click(documentsTab);
    
    expect(screen.getByText('Documents (0)')).toBeInTheDocument();
  });
});

describe('DocumentUploader Component', () => {
  const defaultProps = {
    projectId: '1',
    onUploadComplete: jest.fn(),
    onCancel: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders upload area correctly', () => {
    render(<div data-testid="document-uploader" {...defaultProps} />);
    
    expect(screen.getByText('Upload Document')).toBeInTheDocument();
    expect(screen.getByText('Drop files here or click to browse')).toBeInTheDocument();
  });

  test('handles file selection', () => {
    const { validateDocumentUpload } = require('../utils/validation');
    validateDocumentUpload.mockReturnValue({ isValid: true, errors: {} });

    render(<div data-testid="document-uploader" {...defaultProps} />);
    
    const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
    const input = screen.getByLabelText(/Drop files here or click to browse/);
    
    fireEvent.change(input, { target: { files: [file] } });
    
    expect(screen.getByText('test.pdf')).toBeInTheDocument();
  });

  test('validates file upload', () => {
    const { validateDocumentUpload } = require('../utils/validation');
    validateDocumentUpload.mockReturnValue({
      isValid: false,
      errors: { file: 'File size must be less than 50MB' },
    });

    render(<div data-testid="document-uploader" {...defaultProps} />);
    
    const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
    const input = screen.getByLabelText(/Drop files here or click to browse/);
    
    fireEvent.change(input, { target: { files: [file] } });
    
    expect(screen.getByText('File size must be less than 50MB')).toBeInTheDocument();
  });

  test('uploads document successfully', async () => {
    const { validateDocumentUpload } = require('../utils/validation');
    const { documentsApi } = require('../services/api');
    
    validateDocumentUpload.mockReturnValue({ isValid: true, errors: {} });
    documentsApi.uploadDocument.mockResolvedValue({
      success: true,
      data: mockDocument,
    });

    render(<div data-testid="document-uploader" {...defaultProps} />);
    
    const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
    const input = screen.getByLabelText(/Drop files here or click to browse/);
    
    fireEvent.change(input, { target: { files: [file] } });
    
    const uploadButton = screen.getByText('Upload Document');
    fireEvent.click(uploadButton);
    
    await waitFor(() => {
      expect(documentsApi.uploadDocument).toHaveBeenCalled();
      expect(defaultProps.onUploadComplete).toHaveBeenCalledWith(mockDocument);
    });
  });
});

describe('MessageCenter Component', () => {
  const defaultProps = {
    projectId: '1',
    currentUser: mockUser,
    onClose: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders message center correctly', () => {
    render(<div data-testid="message-center" {...defaultProps} />);
    
    expect(screen.getByText('Project Messages')).toBeInTheDocument();
    expect(screen.getByText('Real-time communication with your team')).toBeInTheDocument();
  });

  test('loads and displays messages', async () => {
    const { messagesApi } = require('../services/api');
    messagesApi.getProjectMessages.mockResolvedValue({
      success: true,
      data: [mockMessage],
    });

    render(<div data-testid="message-center" {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.getByText('Hello, this is a test message')).toBeInTheDocument();
    });
  });

  test('sends new message', async () => {
    const { validateMessageForm } = require('../utils/validation');
    const { messagesApi } = require('../services/api');
    
    validateMessageForm.mockReturnValue({ isValid: true, errors: {} });
    messagesApi.sendMessage.mockResolvedValue({
      success: true,
      data: mockMessage,
    });

    render(<div data-testid="message-center" {...defaultProps} />);
    
    const messageInput = screen.getByPlaceholderText('Type your message...');
    fireEvent.change(messageInput, { target: { value: 'New message' } });
    
    const sendButton = screen.getByRole('button', { name: /send/i });
    fireEvent.click(sendButton);
    
    await waitFor(() => {
      expect(messagesApi.sendMessage).toHaveBeenCalled();
    });
  });

  test('handles empty message validation', () => {
    const { validateMessageForm } = require('../utils/validation');
    validateMessageForm.mockReturnValue({
      isValid: false,
      errors: { content: 'Message content is required' },
    });

    render(<div data-testid="message-center" {...defaultProps} />);
    
    const sendButton = screen.getByRole('button', { name: /send/i });
    fireEvent.click(sendButton);
    
    expect(screen.getByText('Message content is required')).toBeInTheDocument();
  });
});

describe('UserInviter Component', () => {
  const defaultProps = {
    projectId: '1',
    onInviteComplete: jest.fn(),
    onCancel: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders invite form correctly', () => {
    render(<div data-testid="user-inviter" {...defaultProps} />);
    
    expect(screen.getByText('Invite Team Member')).toBeInTheDocument();
    expect(screen.getByLabelText('Email Address *')).toBeInTheDocument();
    expect(screen.getByText('Role *')).toBeInTheDocument();
  });

  test('displays role options with descriptions', () => {
    render(<div data-testid="user-inviter" {...defaultProps} />);
    
    expect(screen.getByText('viewer')).toBeInTheDocument();
    expect(screen.getByText('editor')).toBeInTheDocument();
    expect(screen.getByText('admin')).toBeInTheDocument();
    
    expect(screen.getByText('Can view project content and send messages')).toBeInTheDocument();
    expect(screen.getByText('Can edit project content, upload documents, and send messages')).toBeInTheDocument();
    expect(screen.getByText('Can manage project settings, invite users, and delete content')).toBeInTheDocument();
  });

  test('validates email input', () => {
    const { validateUserInviteForm } = require('../utils/validation');
    validateUserInviteForm.mockReturnValue({
      isValid: false,
      errors: { email: 'Please enter a valid email address' },
    });

    render(<div data-testid="user-inviter" {...defaultProps} />);
    
    const emailInput = screen.getByLabelText('Email Address *');
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    
    const submitButton = screen.getByText('Send Invite');
    fireEvent.click(submitButton);
    
    expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();
  });

  test('sends invite successfully', async () => {
    const { validateUserInviteForm } = require('../utils/validation');
    const { usersApi } = require('../services/api');
    
    validateUserInviteForm.mockReturnValue({ isValid: true, errors: {} });
    usersApi.inviteUser.mockResolvedValue({
      success: true,
      data: mockProjectUser,
    });

    render(<div data-testid="user-inviter" {...defaultProps} />);
    
    const emailInput = screen.getByLabelText('Email Address *');
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    
    const adminRole = screen.getByLabelText(/admin/i);
    fireEvent.click(adminRole);
    
    const submitButton = screen.getByText('Send Invite');
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(usersApi.inviteUser).toHaveBeenCalled();
      expect(defaultProps.onInviteComplete).toHaveBeenCalledWith(mockProjectUser);
    });
  });

  test('displays role permissions summary', () => {
    render(<div data-testid="user-inviter" {...defaultProps} />);
    
    expect(screen.getByText('Role Permissions')).toBeInTheDocument();
    expect(screen.getByText('Viewer')).toBeInTheDocument();
    expect(screen.getByText('Editor')).toBeInTheDocument();
    expect(screen.getByText('Admin')).toBeInTheDocument();
  });
}); 