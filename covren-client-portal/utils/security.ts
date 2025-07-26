// Sovereign Command Center Security Utilities
// Covren Firm LLC - Production Grade Security Implementation

import type { SecurityEvent, AuditLog } from '../types';

// Security Configuration
const SECURITY_CONFIG = {
  maxInputLength: 10000,
  allowedHtmlTags: ['b', 'i', 'em', 'strong', 'u', 'br', 'p'],
  allowedAttributes: ['class', 'id', 'style'],
  maxFileSize: 50 * 1024 * 1024, // 50MB
  allowedFileTypes: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'text/csv',
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
    'video/mp4',
    'video/webm',
    'video/ogg',
  ],
  sessionTimeout: 30 * 60 * 1000, // 30 minutes
  maxLoginAttempts: 5,
  lockoutDuration: 15 * 60 * 1000, // 15 minutes
};

// Security Event Types
export type SecurityEventType = 
  | 'LOGIN_ATTEMPT'
  | 'LOGIN_SUCCESS'
  | 'LOGIN_FAILURE'
  | 'LOGOUT'
  | 'PASSWORD_CHANGE'
  | 'FILE_UPLOAD'
  | 'FILE_DOWNLOAD'
  | 'DATA_ACCESS'
  | 'PERMISSION_VIOLATION'
  | 'XSS_ATTEMPT'
  | 'SQL_INJECTION_ATTEMPT'
  | 'CSRF_ATTOLATION'
  | 'RATE_LIMIT_EXCEEDED'
  | 'SUSPICIOUS_ACTIVITY';

// Input Sanitization
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') {
    return '';
  }

  // Remove null bytes and control characters
  let sanitized = input.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
  
  // Normalize whitespace
  sanitized = sanitized.replace(/\s+/g, ' ').trim();
  
  // Limit length
  if (sanitized.length > SECURITY_CONFIG.maxInputLength) {
    sanitized = sanitized.substring(0, SECURITY_CONFIG.maxInputLength);
  }

  return sanitized;
}

// HTML Sanitization
export function sanitizeHtml(html: string): string {
  if (typeof html !== 'string') {
    return '';
  }

  // Create a temporary div to parse HTML
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;

  // Remove all scripts and event handlers
  const scripts = tempDiv.querySelectorAll('script');
  scripts.forEach(script => script.remove());

  // Remove all elements except allowed tags
  const allowedTags = SECURITY_CONFIG.allowedHtmlTags;
  const allElements = tempDiv.querySelectorAll('*');
  
  allElements.forEach(element => {
    if (!allowedTags.includes(element.tagName.toLowerCase())) {
      element.remove();
    } else {
      // Remove all attributes except allowed ones
      const allowedAttrs = SECURITY_CONFIG.allowedAttributes;
      const attributes = Array.from(element.attributes);
      
      attributes.forEach(attr => {
        if (!allowedAttrs.includes(attr.name.toLowerCase())) {
          element.removeAttribute(attr.name);
        }
      });
    }
  });

  return tempDiv.innerHTML;
}

// XSS Prevention
export function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

export function validateUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}

// File Security
export function validateFile(file: File): { isValid: boolean; error?: string } {
  // Check file size
  if (file.size > SECURITY_CONFIG.maxFileSize) {
    return {
      isValid: false,
      error: `File size must be less than ${SECURITY_CONFIG.maxFileSize / 1024 / 1024}MB`,
    };
  }

  // Check file type
  if (!SECURITY_CONFIG.allowedFileTypes.includes(file.type)) {
    return {
      isValid: false,
      error: 'File type not allowed',
    };
  }

  // Check file name for suspicious patterns
  const suspiciousPatterns = [
    /\.\.\//, // Directory traversal
    /[<>:"|?*]/, // Invalid characters
    /^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])$/i, // Reserved names
  ];

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(file.name)) {
      return {
        isValid: false,
        error: 'Invalid file name',
      };
    }
  }

  return { isValid: true };
}

// Password Security
export function validatePassword(password: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function hashPassword(password: string): Promise<string> {
  return new Promise((resolve, reject) => {
    // In a real implementation, use a proper hashing library
    // This is a simplified example
    const encoder = new TextEncoder();
    const data = encoder.encode(password + 'salt');
    
    crypto.subtle.digest('SHA-256', data)
      .then(hash => {
        const hashArray = Array.from(new Uint8Array(hash));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        resolve(hashHex);
      })
      .catch(reject);
  });
}

// Session Security
export class SessionManager {
  private static instance: SessionManager;
  private sessions: Map<string, { userId: string; expires: number }> = new Map();

  static getInstance(): SessionManager {
    if (!SessionManager.instance) {
      SessionManager.instance = new SessionManager();
    }
    return SessionManager.instance;
  }

  createSession(userId: string): string {
    const sessionId = this.generateSessionId();
    const expires = Date.now() + SECURITY_CONFIG.sessionTimeout;
    
    this.sessions.set(sessionId, { userId, expires });
    
    // Clean up expired sessions
    this.cleanupExpiredSessions();
    
    return sessionId;
  }

  validateSession(sessionId: string): { isValid: boolean; userId?: string } {
    const session = this.sessions.get(sessionId);
    
    if (!session) {
      return { isValid: false };
    }

    if (Date.now() > session.expires) {
      this.sessions.delete(sessionId);
      return { isValid: false };
    }

    return { isValid: true, userId: session.userId };
  }

  invalidateSession(sessionId: string): boolean {
    return this.sessions.delete(sessionId);
  }

  private generateSessionId(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  private cleanupExpiredSessions(): void {
    const now = Date.now();
    for (const [sessionId, session] of this.sessions.entries()) {
      if (now > session.expires) {
        this.sessions.delete(sessionId);
      }
    }
  }
}

// Rate Limiting
export class RateLimiter {
  private attempts: Map<string, { count: number; firstAttempt: number }> = new Map();

  checkRateLimit(key: string, maxAttempts: number = SECURITY_CONFIG.maxLoginAttempts): boolean {
    const now = Date.now();
    const attempt = this.attempts.get(key);

    if (!attempt) {
      this.attempts.set(key, { count: 1, firstAttempt: now });
      return true;
    }

    // Reset if lockout period has passed
    if (now - attempt.firstAttempt > SECURITY_CONFIG.lockoutDuration) {
      this.attempts.set(key, { count: 1, firstAttempt: now });
      return true;
    }

    // Check if limit exceeded
    if (attempt.count >= maxAttempts) {
      return false;
    }

    // Increment attempt count
    attempt.count++;
    return true;
  }

  resetRateLimit(key: string): void {
    this.attempts.delete(key);
  }

  getRemainingAttempts(key: string): number {
    const attempt = this.attempts.get(key);
    if (!attempt) {
      return SECURITY_CONFIG.maxLoginAttempts;
    }
    return Math.max(0, SECURITY_CONFIG.maxLoginAttempts - attempt.count);
  }
}

// Audit Logging
export class AuditLogger {
  private static instance: AuditLogger;
  private logs: AuditLog[] = [];

  static getInstance(): AuditLogger {
    if (!AuditLogger.instance) {
      AuditLogger.instance = new AuditLogger();
    }
    return AuditLogger.instance;
  }

  logSecurityEvent(
    eventType: SecurityEventType,
    userId: string,
    details: Record<string, any> = {},
    ipAddress?: string,
    userAgent?: string
  ): void {
    const log: AuditLog = {
      id: this.generateLogId(),
      event_type: eventType,
      user_id: userId,
      timestamp: new Date().toISOString(),
      details,
      ip_address: ipAddress,
      user_agent: userAgent,
      severity: this.getEventSeverity(eventType),
    };

    this.logs.push(log);
    this.persistLog(log);
  }

  getLogs(
    userId?: string,
    eventType?: SecurityEventType,
    startDate?: Date,
    endDate?: Date
  ): AuditLog[] {
    let filtered = this.logs;

    if (userId) {
      filtered = filtered.filter(log => log.user_id === userId);
    }

    if (eventType) {
      filtered = filtered.filter(log => log.event_type === eventType);
    }

    if (startDate) {
      filtered = filtered.filter(log => new Date(log.timestamp) >= startDate);
    }

    if (endDate) {
      filtered = filtered.filter(log => new Date(log.timestamp) <= endDate);
    }

    return filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  private generateLogId(): string {
    return `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getEventSeverity(eventType: SecurityEventType): 'low' | 'medium' | 'high' | 'critical' {
    const severityMap: Record<SecurityEventType, 'low' | 'medium' | 'high' | 'critical'> = {
      LOGIN_ATTEMPT: 'low',
      LOGIN_SUCCESS: 'low',
      LOGIN_FAILURE: 'medium',
      LOGOUT: 'low',
      PASSWORD_CHANGE: 'medium',
      FILE_UPLOAD: 'medium',
      FILE_DOWNLOAD: 'low',
      DATA_ACCESS: 'low',
      PERMISSION_VIOLATION: 'high',
      XSS_ATTEMPT: 'high',
      SQL_INJECTION_ATTEMPT: 'critical',
      CSRF_VIOLATION: 'high',
      RATE_LIMIT_EXCEEDED: 'medium',
      SUSPICIOUS_ACTIVITY: 'high',
    };

    return severityMap[eventType] || 'low';
  }

  private persistLog(log: AuditLog): void {
    // In a real implementation, this would send the log to a secure logging service
    console.log('Security Audit Log:', log);
  }
}

// Content Security Policy
export function generateCSP(): string {
  const directives = {
    'default-src': ["'self'"],
    'script-src': ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
    'style-src': ["'self'", "'unsafe-inline'"],
    'img-src': ["'self'", 'data:', 'https:'],
    'font-src': ["'self'", 'https:'],
    'connect-src': ["'self'", 'wss:', 'https:'],
    'frame-src': ["'none'"],
    'object-src': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"],
    'frame-ancestors': ["'none'"],
    'upgrade-insecure-requests': [],
  };

  return Object.entries(directives)
    .map(([directive, sources]) => `${directive} ${sources.join(' ')}`)
    .join('; ');
}

// CSRF Protection
export function generateCSRFToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

export function validateCSRFToken(token: string, storedToken: string): boolean {
  return token === storedToken;
}

// Input Validation
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePhoneNumber(phone: string): boolean {
  const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
  return phoneRegex.test(phone);
}

export function validateUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

// Security Headers
export function getSecurityHeaders(): Record<string, string> {
  return {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
    'Content-Security-Policy': generateCSP(),
  };
}

// Export utilities
export const sessionManager = SessionManager.getInstance();
export const rateLimiter = new RateLimiter();
export const auditLogger = AuditLogger.getInstance(); 