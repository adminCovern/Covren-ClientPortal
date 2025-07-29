// Sovereign Command Center API Service Layer
// Covren Firm LLC - Production Grade API Integration

import type { 
  User, 
  Project, 
  Document, 
  Message, 
  Notification, 
  ActivityLog,
  ProjectUser,
  ApiResponse,
  PaginatedResponse,
  ProjectForm,
  DocumentUploadForm,
  MessageForm,
  UserInviteForm,
  LoginForm,
  RegisterForm,
  ProjectFilters,
  DocumentFilters,
  MessageFilters
} from '../types';

// API Configuration
const API_CONFIG = {
  baseUrl: process.env.NODE_ENV === 'production' ? 'https://portal.covrenfirm.com/api' : 'http://localhost:8080/api',
  timeout: 30000,
  retryAttempts: 3,
  retryDelay: 1000,
};

// Error handling
class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

let authToken: string | null = null;

function setAuthToken(token: string | null) {
  authToken = token;
  if (token) {
    localStorage.setItem('auth_token', token);
  } else {
    localStorage.removeItem('auth_token');
  }
}

function getAuthToken(): string | null {
  if (authToken) return authToken;
  if (typeof window !== 'undefined') {
    authToken = localStorage.getItem('auth_token');
  }
  return authToken;
}

// Request wrapper with retry logic
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
  retryCount = 0
): Promise<T> {
  const url = `${API_CONFIG.baseUrl}${endpoint}`;
  
  const token = getAuthToken();
  const defaultOptions: RequestInit = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, defaultOptions);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(
        errorData.error || `HTTP ${response.status}`,
        response.status,
        errorData.code,
        errorData.details
      );
    }

    // Handle empty responses
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      return data.success ? data : { success: true, data };
    }
    
    return { success: true } as T;
  } catch (error) {
    if (retryCount < API_CONFIG.retryAttempts && error instanceof ApiError && error.status >= 500) {
      await new Promise(resolve => setTimeout(resolve, API_CONFIG.retryDelay * (retryCount + 1)));
      return apiRequest<T>(endpoint, options, retryCount + 1);
    }
    throw error;
  }
}

// Authentication API
export const authApi = {
  /**
   * Sign in user
   */
  async signIn(credentials: LoginForm): Promise<ApiResponse<{ user: User; session: any }>> {
    try {
      const response = await apiRequest<{ success: boolean; data: { user: User; token: string } }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: credentials.email,
          password: credentials.password,
        }),
      });
      
      if (response.success && response.data) {
        setAuthToken(response.data.token);
        return { 
          data: { 
            user: response.data.user, 
            session: { user: response.data.user, access_token: response.data.token } 
          }, 
          error: null, 
          success: true 
        };
      }
      
      return { data: null, error: 'Authentication failed', success: false };
    } catch (error) {
      return { 
        data: null, 
        error: error instanceof Error ? error.message : 'Authentication failed', 
        success: false 
      };
    }
  },

  /**
   * Sign up user
   */
  async signUp(userData: RegisterForm): Promise<ApiResponse<{ user: User; session: any }>> {
    try {
      const response = await apiRequest<{ success: boolean; data: { user: User; token: string } }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          email: userData.email,
          password: userData.password,
          full_name: userData.full_name,
          company: userData.company,
          position: userData.position,
        }),
      });
      
      if (response.success && response.data) {
        setAuthToken(response.data.token);
        return { 
          data: { 
            user: response.data.user, 
            session: { user: response.data.user, access_token: response.data.token } 
          }, 
          error: null, 
          success: true 
        };
      }
      
      return { data: null, error: 'Registration failed', success: false };
    } catch (error) {
      return { 
        data: null, 
        error: error instanceof Error ? error.message : 'Registration failed', 
        success: false 
      };
    }
  },

  /**
   * Sign out user
   */
  async signOut(): Promise<ApiResponse<void>> {
    try {
      await apiRequest('/auth/logout', { method: 'POST' });
      setAuthToken(null);
      return { data: null, error: null, success: true };
    } catch (error) {
      setAuthToken(null);
      return { 
        data: null, 
        error: error instanceof Error ? error.message : 'Sign out failed', 
        success: false 
      };
    }
  },

  /**
   * Get current session
   */
  async getSession(): Promise<ApiResponse<any>> {
    try {
      const response = await apiRequest<{ success: boolean; data: { user: User } }>('/auth/me');
      if (response.success && response.data) {
        return { 
          data: { 
            user: response.data.user, 
            session: { user: response.data.user, access_token: getAuthToken() } 
          }, 
          error: null, 
          success: true 
        };
      }
      return { data: null, error: 'Failed to get session', success: false };
    } catch (error) {
      return { 
        data: null, 
        error: error instanceof Error ? error.message : 'Failed to get session', 
        success: false 
      };
    }
  },
};

// Projects API
export const projectsApi = {
  /**
   * Get user's projects
   */
  async getUserProjects(filters?: ProjectFilters): Promise<ApiResponse<Project[]>> {
    try {
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
      
      const response = await apiRequest<{ success: boolean; data: { projects: Project[] } }>(query);
      if (response.success && response.data) {
        return { data: response.data.projects, error: null, success: true };
      }
      return { data: [], error: null, success: true };
    } catch (error) {
      return { 
        data: null, 
        error: error instanceof Error ? error.message : 'Failed to fetch projects', 
        success: false 
      };
    }
  },

  /**
   * Get project by ID
   */
  async getProject(id: string): Promise<ApiResponse<Project>> {
    try {
      const response = await apiRequest<Project>(`projects?id=eq.${id}&select=*&limit=1`);
      const project = Array.isArray(response) ? response[0] : response;
      return { data: project, error: null, success: true };
    } catch (error) {
      return { 
        data: null, 
        error: error instanceof Error ? error.message : 'Failed to fetch project', 
        success: false 
      };
    }
  },

  /**
   * Create new project
   */
  async createProject(projectData: ProjectForm): Promise<ApiResponse<Project>> {
    try {
      const response = await apiRequest<Project[]>('projects', {
        method: 'POST',
        body: JSON.stringify({
          name: projectData.name,
          description: projectData.description,
          priority: projectData.priority,
          budget: projectData.budget,
          deadline: projectData.deadline,
          tags: projectData.tags,
        }),
      });
      
      const project = Array.isArray(response) ? response[0] : response;
      return { data: project, error: null, success: true };
    } catch (error) {
      return { 
        data: null, 
        error: error instanceof Error ? error.message : 'Failed to create project', 
        success: false 
      };
    }
  },

  /**
   * Update project
   */
  async updateProject(id: string, projectData: Partial<ProjectForm>): Promise<ApiResponse<Project>> {
    try {
      const response = await apiRequest<Project[]>(`projects?id=eq.${id}`, {
        method: 'PATCH',
        body: JSON.stringify(projectData),
      });
      
      const project = Array.isArray(response) ? response[0] : response;
      return { data: project, error: null, success: true };
    } catch (error) {
      return { 
        data: null, 
        error: error instanceof Error ? error.message : 'Failed to update project', 
        success: false 
      };
    }
  },

  /**
   * Delete project
   */
  async deleteProject(id: string): Promise<ApiResponse<void>> {
    try {
      await apiRequest(`projects?id=eq.${id}`, { method: 'DELETE' });
      return { data: null, error: null, success: true };
    } catch (error) {
      return { 
        data: null, 
        error: error instanceof Error ? error.message : 'Failed to delete project', 
        success: false 
      };
    }
  },

  /**
   * Get project statistics
   */
  async getProjectStats(id: string): Promise<ApiResponse<any>> {
    try {
      const response = await apiRequest<any>(`rpc/get_project_stats?project_uuid=${id}`);
      return { data: response, error: null, success: true };
    } catch (error) {
      return { 
        data: null, 
        error: error instanceof Error ? error.message : 'Failed to fetch project stats', 
        success: false 
      };
    }
  },
};

// Documents API
export const documentsApi = {
  /**
   * Get project documents
   */
  async getProjectDocuments(projectId: string, filters?: DocumentFilters): Promise<ApiResponse<Document[]>> {
    try {
      let query = `documents?project_id=eq.${projectId}&select=*`;
      
      if (filters) {
        if (filters.status?.length) {
          query += `&status=in.(${filters.status.join(',')})`;
        }
        if (filters.search) {
          query += `&name=ilike.*${filters.search}*`;
        }
      }
      
      const response = await apiRequest<Document[]>(query);
      return { data: response, error: null, success: true };
    } catch (error) {
      return { 
        data: null, 
        error: error instanceof Error ? error.message : 'Failed to fetch documents', 
        success: false 
      };
    }
  },

  /**
   * Upload document
   */
  async uploadDocument(uploadData: DocumentUploadForm): Promise<ApiResponse<Document>> {
    try {
      // First, upload file to storage
      const fileName = `${Date.now()}-${uploadData.file.name}`;
      const filePath = `documents/${uploadData.project_id}/${fileName}`;
      
      const formData = new FormData();
      formData.append('file', uploadData.file);
      
      const token = getAuthToken();
      const uploadResponse = await fetch(`${API_CONFIG.baseUrl}/documents/upload`, {
        method: 'POST',
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error('File upload failed');
      }

      // Create document record
      const response = await apiRequest<Document[]>('documents', {
        method: 'POST',
        body: JSON.stringify({
          project_id: uploadData.project_id,
          name: uploadData.name || uploadData.file.name,
          file_path: filePath,
          file_size: uploadData.file.size,
          mime_type: uploadData.file.type,
          is_public: uploadData.is_public,
        }),
      });
      
      const document = Array.isArray(response) ? response[0] : response;
      return { data: document, error: null, success: true };
    } catch (error) {
      return { 
        data: null, 
        error: error instanceof Error ? error.message : 'Failed to upload document', 
        success: false 
      };
    }
  },

  /**
   * Delete document
   */
  async deleteDocument(id: string): Promise<ApiResponse<void>> {
    try {
      await apiRequest(`documents?id=eq.${id}`, { method: 'DELETE' });
      return { data: null, error: null, success: true };
    } catch (error) {
      return { 
        data: null, 
        error: error instanceof Error ? error.message : 'Failed to delete document', 
        success: false 
      };
    }
  },

  /**
   * Get document download URL
   */
  getDocumentUrl(filePath: string): string {
    return `${API_CONFIG.baseUrl}/storage/v1/object/public/documents/${filePath}`;
  },
};

// Messages API
export const messagesApi = {
  /**
   * Get project messages
   */
  async getProjectMessages(projectId: string, filters?: MessageFilters): Promise<ApiResponse<Message[]>> {
    try {
      let query = `messages?project_id=eq.${projectId}&select=*,sender:user_profiles(*),recipients:message_recipients(*,user:user_profiles(*))&order=created_at.desc`;
      
      if (filters) {
        if (filters.messageType?.length) {
          query += `&message_type=in.(${filters.messageType.join(',')})`;
        }
        if (filters.search) {
          query += `&content=ilike.*${filters.search}*`;
        }
      }
      
      const response = await apiRequest<Message[]>(query);
      return { data: response, error: null, success: true };
    } catch (error) {
      return { 
        data: null, 
        error: error instanceof Error ? error.message : 'Failed to fetch messages', 
        success: false 
      };
    }
  },

  /**
   * Send message
   */
  async sendMessage(messageData: MessageForm): Promise<ApiResponse<Message>> {
    try {
      const response = await apiRequest<Message[]>('messages', {
        method: 'POST',
        body: JSON.stringify({
          project_id: messageData.project_id,
          content: messageData.content,
          message_type: messageData.message_type,
          reply_to: messageData.reply_to,
        }),
      });
      
      const message = Array.isArray(response) ? response[0] : response;
      return { data: message, error: null, success: true };
    } catch (error) {
      return { 
        data: null, 
        error: error instanceof Error ? error.message : 'Failed to send message', 
        success: false 
      };
    }
  },

  /**
   * Update message
   */
  async updateMessage(id: string, content: string): Promise<ApiResponse<Message>> {
    try {
      const response = await apiRequest<Message[]>(`messages?id=eq.${id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          content,
          is_edited: true,
        }),
      });
      
      const message = Array.isArray(response) ? response[0] : response;
      return { data: message, error: null, success: true };
    } catch (error) {
      return { 
        data: null, 
        error: error instanceof Error ? error.message : 'Failed to update message', 
        success: false 
      };
    }
  },

  /**
   * Delete message
   */
  async deleteMessage(id: string): Promise<ApiResponse<void>> {
    try {
      await apiRequest(`messages?id=eq.${id}`, { method: 'DELETE' });
      return { data: null, error: null, success: true };
    } catch (error) {
      return { 
        data: null, 
        error: error instanceof Error ? error.message : 'Failed to delete message', 
        success: false 
      };
    }
  },

  /**
   * Mark message as read
   */
  async markMessageAsRead(messageId: string, userId: string): Promise<ApiResponse<void>> {
    try {
      await apiRequest('message_recipients', {
        method: 'POST',
        body: JSON.stringify({
          message_id: messageId,
          user_id: userId,
          read_at: new Date().toISOString(),
        }),
      });
      return { data: null, error: null, success: true };
    } catch (error) {
      return { 
        data: null, 
        error: error instanceof Error ? error.message : 'Failed to mark message as read', 
        success: false 
      };
    }
  },
};

// Notifications API
export const notificationsApi = {
  /**
   * Get user notifications
   */
  async getUserNotifications(): Promise<ApiResponse<Notification[]>> {
    try {
      const response = await apiRequest<Notification[]>('notifications?select=*&order=created_at.desc');
      return { data: response, error: null, success: true };
    } catch (error) {
      return { 
        data: null, 
        error: error instanceof Error ? error.message : 'Failed to fetch notifications', 
        success: false 
      };
    }
  },

  /**
   * Mark notification as read
   */
  async markNotificationAsRead(id: string): Promise<ApiResponse<void>> {
    try {
      await apiRequest(`notifications?id=eq.${id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          read_at: new Date().toISOString(),
        }),
      });
      return { data: null, error: null, success: true };
    } catch (error) {
      return { 
        data: null, 
        error: error instanceof Error ? error.message : 'Failed to mark notification as read', 
        success: false 
      };
    }
  },

  /**
   * Delete notification
   */
  async deleteNotification(id: string): Promise<ApiResponse<void>> {
    try {
      await apiRequest(`notifications?id=eq.${id}`, { method: 'DELETE' });
      return { data: null, error: null, success: true };
    } catch (error) {
      return { 
        data: null, 
        error: error instanceof Error ? error.message : 'Failed to delete notification', 
        success: false 
      };
    }
  },
};

// User Management API
export const usersApi = {
  /**
   * Get project users
   */
  async getProjectUsers(projectId: string): Promise<ApiResponse<ProjectUser[]>> {
    try {
      const response = await apiRequest<ProjectUser[]>(`project_users?project_id=eq.${projectId}&select=*,user:user_profiles(*)`);
      return { data: response, error: null, success: true };
    } catch (error) {
      return { 
        data: null, 
        error: error instanceof Error ? error.message : 'Failed to fetch project users', 
        success: false 
      };
    }
  },

  /**
   * Invite user to project
   */
  async inviteUser(inviteData: UserInviteForm): Promise<ApiResponse<ProjectUser>> {
    try {
      const response = await apiRequest<ProjectUser[]>('project_users', {
        method: 'POST',
        body: JSON.stringify({
          project_id: inviteData.project_id,
          user_id: inviteData.email, // This would need to be resolved to actual user ID
          role: inviteData.role,
        }),
      });
      
      const projectUser = Array.isArray(response) ? response[0] : response;
      return { data: projectUser, error: null, success: true };
    } catch (error) {
      return { 
        data: null, 
        error: error instanceof Error ? error.message : 'Failed to invite user', 
        success: false 
      };
    }
  },

  /**
   * Remove user from project
   */
  async removeUser(projectId: string, userId: string): Promise<ApiResponse<void>> {
    try {
      await apiRequest(`project_users?project_id=eq.${projectId}&user_id=eq.${userId}`, { method: 'DELETE' });
      return { data: null, error: null, success: true };
    } catch (error) {
      return { 
        data: null, 
        error: error instanceof Error ? error.message : 'Failed to remove user', 
        success: false 
      };
    }
  },

  /**
   * Update user role
   */
  async updateUserRole(projectId: string, userId: string, role: string): Promise<ApiResponse<ProjectUser>> {
    try {
      const response = await apiRequest<ProjectUser[]>(`project_users?project_id=eq.${projectId}&user_id=eq.${userId}`, {
        method: 'PATCH',
        body: JSON.stringify({ role }),
      });
      
      const projectUser = Array.isArray(response) ? response[0] : response;
      return { data: projectUser, error: null, success: true };
    } catch (error) {
      return { 
        data: null, 
        error: error instanceof Error ? error.message : 'Failed to update user role', 
        success: false 
      };
    }
  },
};

// Activity Logs API
export const activityApi = {
  /**
   * Get project activity logs
   */
  async getProjectActivity(projectId: string): Promise<ApiResponse<ActivityLog[]>> {
    try {
      const response = await apiRequest<ActivityLog[]>(`activity_logs?project_id=eq.${projectId}&select=*,user:user_profiles(*),project:projects(*)&order=created_at.desc`);
      return { data: response, error: null, success: true };
    } catch (error) {
      return { 
        data: null, 
        error: error instanceof Error ? error.message : 'Failed to fetch activity logs', 
        success: false 
      };
    }
  },
};

// Real-time API
export const realtimeApi = {
  /**
   * Subscribe to project changes
   */
  subscribeToProject(projectId: string, callback: (payload: any) => void) {
    // This would integrate with Supabase real-time subscriptions
    // Implementation depends on the specific real-time setup
    console.log(`Subscribing to project ${projectId}`);
    return () => console.log(`Unsubscribing from project ${projectId}`);
  },

  /**
   * Subscribe to messages
   */
  subscribeToMessages(projectId: string, callback: (payload: any) => void) {
    console.log(`Subscribing to messages for project ${projectId}`);
    return () => console.log(`Unsubscribing from messages for project ${projectId}`);
  },

  /**
   * Subscribe to notifications
   */
  subscribeToNotifications(callback: (payload: any) => void) {
    console.log('Subscribing to notifications');
    return () => console.log('Unsubscribing from notifications');
  },
};                  