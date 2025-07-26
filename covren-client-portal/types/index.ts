// Sovereign Command Center TypeScript Interfaces
// Covren Firm LLC - Production Grade Type Definitions

export interface User {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  company?: string;
  position?: string;
  phone?: string;
  preferences: UserPreferences;
  created_at: string;
  updated_at: string;
}

export interface UserPreferences {
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  theme: 'dark' | 'light' | 'auto';
  language: string;
  timezone: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  status: 'active' | 'completed' | 'paused' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  created_at: string;
  updated_at: string;
  created_by: string;
  client_id: string;
  budget?: number;
  deadline?: string;
  tags: string[];
  metadata: Record<string, any>;
  stats?: ProjectStats;
}

export interface ProjectStats {
  total_members: number;
  total_documents: number;
  total_messages: number;
  active_documents: number;
  recent_activity?: string;
}

export interface ProjectUser {
  id: string;
  project_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'editor' | 'viewer';
  permissions: ProjectPermissions;
  joined_at: string;
  invited_by?: string;
  user?: User;
}

export interface ProjectPermissions {
  can_edit: boolean;
  can_delete: boolean;
  can_invite: boolean;
  can_upload: boolean;
  can_manage_users: boolean;
}

export interface Document {
  id: string;
  project_id: string;
  name: string;
  file_path: string;
  file_size?: number;
  mime_type?: string;
  uploaded_by: string;
  uploaded_at: string;
  version: number;
  is_public: boolean;
  encryption_key_id?: string;
  checksum?: string;
  metadata: Record<string, any>;
  status: 'active' | 'archived' | 'deleted';
  uploader?: User;
}

export interface Message {
  id: string;
  project_id: string;
  sender_id: string;
  content: string;
  message_type: 'text' | 'file' | 'system' | 'alert';
  created_at: string;
  updated_at: string;
  is_edited: boolean;
  reply_to?: string;
  metadata: Record<string, any>;
  sender?: User;
  recipients?: MessageRecipient[];
  reply_message?: Message;
}

export interface MessageRecipient {
  id: string;
  message_id: string;
  user_id: string;
  read_at?: string;
  delivered_at: string;
  user?: User;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'critical';
  created_at: string;
  read_at?: string;
  action_url?: string;
  metadata: Record<string, any>;
}

export interface ActivityLog {
  id: string;
  user_id?: string;
  project_id?: string;
  action: string;
  resource_type?: string;
  resource_id?: string;
  details: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
  user?: User;
  project?: Project;
}

// API Response Types
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// Real-time Event Types
export interface RealtimeEvent<T> {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  schema: string;
  table: string;
  record: T;
  oldRecord?: T;
}

// Form Types
export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  email: string;
  password: string;
  confirmPassword: string;
  full_name: string;
  company?: string;
  position?: string;
}

export interface ProjectForm {
  name: string;
  description?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  budget?: number;
  deadline?: string;
  tags: string[];
}

export interface DocumentUploadForm {
  file: File;
  name?: string;
  is_public: boolean;
  project_id: string;
}

export interface MessageForm {
  content: string;
  message_type: 'text' | 'file' | 'system' | 'alert';
  reply_to?: string;
  project_id: string;
}

export interface UserInviteForm {
  email: string;
  role: 'admin' | 'editor' | 'viewer';
  project_id: string;
}

// UI State Types
export interface AppState {
  user: User | null;
  session: any | null;
  loading: boolean;
  error: string | null;
  notifications: Notification[];
  unreadCount: number;
}

export interface ProjectState {
  projects: Project[];
  currentProject: Project | null;
  loading: boolean;
  error: string | null;
}

export interface DocumentState {
  documents: Document[];
  currentDocument: Document | null;
  loading: boolean;
  error: string | null;
  uploadProgress: number;
}

export interface MessageState {
  messages: Message[];
  loading: boolean;
  error: string | null;
  typing: string[];
}

// Filter and Search Types
export interface ProjectFilters {
  status?: string[];
  priority?: string[];
  tags?: string[];
  dateRange?: {
    start: string;
    end: string;
  };
  search?: string;
}

export interface DocumentFilters {
  status?: string[];
  uploadedBy?: string[];
  dateRange?: {
    start: string;
    end: string;
  };
  search?: string;
  mimeTypes?: string[];
}

export interface MessageFilters {
  messageType?: string[];
  sender?: string[];
  dateRange?: {
    start: string;
    end: string;
  };
  search?: string;
}

// Component Props Types
export interface ProjectCardProps {
  project: Project;
  onSelect: (project: Project) => void;
  onEdit: (project: Project) => void;
  onDelete: (projectId: string) => void;
  userRole: string;
}

export interface DocumentCardProps {
  document: Document;
  onView: (document: Document) => void;
  onDownload: (document: Document) => void;
  onDelete: (documentId: string) => void;
  userRole: string;
}

export interface MessageItemProps {
  message: Message;
  onReply: (message: Message) => void;
  onEdit: (message: Message) => void;
  onDelete: (messageId: string) => void;
  isOwnMessage: boolean;
  userRole: string;
}

export interface NotificationItemProps {
  notification: Notification;
  onRead: (notificationId: string) => void;
  onDelete: (notificationId: string) => void;
}

// Error Types
export interface AppError {
  code: string;
  message: string;
  details?: Record<string, any>;
  timestamp: string;
}

// Validation Types
export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

// Performance Metrics
export interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  apiResponseTime: number;
  memoryUsage: number;
  networkRequests: number;
}

// Security Types
export interface SecurityContext {
  userPermissions: Record<string, boolean>;
  projectPermissions: Record<string, ProjectPermissions>;
  sessionExpiry: string;
  lastActivity: string;
}

// Analytics Types
export interface AnalyticsEvent {
  event: string;
  properties: Record<string, any>;
  timestamp: string;
  userId?: string;
  sessionId?: string;
}

// Accessibility Types
export type LanguageDirection = 'ltr' | 'rtl';
export type CognitiveLoadLevel = 'simplified' | 'standard' | 'complex';

export interface AccessibilitySettings {
  // Visual Accessibility
  highContrast: boolean;
  fontSize: 'small' | 'medium' | 'large' | 'x-large';
  fontFamily: 'system' | 'serif' | 'sans-serif' | 'monospace';
  lineSpacing: 'normal' | 'relaxed' | 'tight';
  colorBlindnessSupport: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';
  
  // Motion and Animation
  reducedMotion: boolean;
  animationSpeed: 'slow' | 'normal' | 'fast';
  autoPlay: boolean;
  
  // Cognitive Load
  cognitiveLoadLevel: CognitiveLoadLevel;
  simplifiedInterface: boolean;
  stepByStepGuidance: boolean;
  contextualHelp: boolean;
  
  // Language and Localization
  language: string;
  direction: LanguageDirection;
  rtlSupport: boolean;
  
  // Screen Reader
  screenReaderOptimized: boolean;
  semanticMarkup: boolean;
  ariaLabels: boolean;
  focusIndicators: boolean;
  
  // Keyboard Navigation
  keyboardOnly: boolean;
  tabOrder: 'logical' | 'visual';
  skipLinks: boolean;
  
  // Audio and Speech
  speechToText: boolean;
  textToSpeech: boolean;
  audioDescriptions: boolean;
  
  // Performance and Bandwidth
  lowBandwidthMode: boolean;
  offlineSupport: boolean;
  progressiveEnhancement: boolean;
  
  // Compliance Standards
  wcagLevel: 'A' | 'AA' | 'AAA';
  section508Compliant: boolean;
  ariaCompliant: boolean;
}

// Collaboration Types
export interface CollaborationEvent {
  id: string;
  type: 'workflow_started' | 'workflow_completed' | 'message_sent' | 'notification_sent';
  userId: string;
  timestamp: string;
  metadata: Record<string, any>;
}

export interface TeamNotification {
  id: string;
  senderId: string;
  recipientId: string;
  type: string;
  title: string;
  message: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  channel: 'in-app' | 'email' | 'sms' | 'push';
  timestamp: string;
  read: boolean;
  readAt?: string;
  metadata?: Record<string, any>;
}

export interface WorkflowState {
  id: string;
  name: string;
  description?: string;
  initiatorId: string;
  participants: string[];
  steps: WorkflowStep[];
  currentStep: number;
  status: 'active' | 'paused' | 'completed' | 'cancelled';
  startedAt: string;
  updatedAt?: string;
  completedAt?: string;
  metadata?: Record<string, any>;
}

export interface WorkflowStep {
  id: string;
  title: string;
  description?: string;
  assigneeId?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'blocked';
  dueDate?: string;
  completedAt?: string;
  metadata?: Record<string, any>;
}

export interface AuditTrail {
  id: string;
  userId: string;
  action: string;
  resource: string;
  details?: Record<string, any>;
  timestamp: string;
  sessionId: string;
  ipAddress: string;
  userAgent: string;
}

export interface PermissionMatrix {
  [userId: string]: {
    [resource: string]: string[];
  };
}

export interface CommunicationChannel {
  id: string;
  name: string;
  type: 'project' | 'team' | 'direct' | 'announcement';
  participants: string[];
  messages: ChannelMessage[];
  createdBy: string;
  createdAt: string;
  lastActivity: string;
  metadata?: Record<string, any>;
}

export interface ChannelMessage {
  id: string;
  channelId: string;
  senderId: string;
  content: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface CollaborationMetrics {
  totalCollaborations: number;
  activeWorkflows: number;
  averageResponseTime: number;
  satisfactionScore: number;
  efficiencyGains: number;
}

// Analytics Types
export interface PredictiveInsight {
  id: string;
  type: string;
  title: string;
  description: string;
  confidence: number;
  impact: 'low' | 'medium' | 'high' | 'critical';
  recommendations: string[];
  timestamp: string;
}

export interface BehavioralPattern {
  id: string;
  userId: string;
  type: string;
  description: string;
  confidence: number;
  impact: 'low' | 'medium' | 'high' | 'critical';
  recommendations: string[];
  metadata?: Record<string, any>;
}

export interface ROICalculation {
  totalInvestment: number;
  totalReturn: number;
  roi: number;
  paybackPeriod: number;
  netPresentValue: number;
  internalRateOfReturn: number;
}

export interface AnomalyDetection {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface PerformanceMetrics {
  responseTime: number;
  throughput: number;
  errorRate: number;
  availability: number;
  userSatisfaction: number;
  conversionRate: number;
}

export interface AnalyticsDashboard {
  keyMetrics: Record<string, any>;
  trends: any[];
  alerts: any[];
  recommendations: string[];
}

// LLM Integration Types
export interface LLMRequest {
  message: string;
  context?: Record<string, any>;
  config: {
    model: string;
    temperature: number;
    maxTokens: number;
  };
}

export interface LLMResponse {
  id: string;
  content: string;
  timestamp: string;
  model: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  metadata: {
    confidence: number;
    processingTime: number;
    contextUsed: boolean;
  };
}

export interface AIConversation {
  id: string;
  topic: string;
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
  }>;
  startedAt: string;
  lastActivity: string;
  endedAt?: string;
  status: 'active' | 'ended';
}

export interface DocumentAnalysis {
  id: string;
  documentType: string;
  summary: string;
  keyPoints: string[];
  recommendations: string[];
  confidence: number;
  processingTime: number;
  timestamp: string;
}

export interface IntelligentRecommendation {
  id: string;
  type: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  actionItems: string[];
  expectedImpact: string;
  timestamp: string;
}

export interface AIAssistant {
  id: string;
  name: string;
  description: string;
  capabilities: string[];
  personality: string;
}

export interface LLMConfig {
  model: string;
  temperature: number;
  maxTokens: number;
  enableStreaming: boolean;
  enableMemory: boolean;
  enableContext: boolean;
  apiEndpoint: string;
  apiKey: string;
  timeout: number;
}

// All types are already exported above 