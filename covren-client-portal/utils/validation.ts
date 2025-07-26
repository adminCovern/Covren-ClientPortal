// Sovereign Command Center Validation Utilities
// Covren Firm LLC - Production Grade Validation

import type { ValidationResult, LoginForm, RegisterForm, ProjectForm, DocumentUploadForm, MessageForm, UserInviteForm } from '../types';

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Password strength requirements
const PASSWORD_REQUIREMENTS = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
};

// File size limits (in bytes)
const FILE_SIZE_LIMITS = {
  document: 50 * 1024 * 1024, // 50MB
  image: 10 * 1024 * 1024, // 10MB
  video: 100 * 1024 * 1024, // 100MB
};

// Allowed file types
const ALLOWED_MIME_TYPES = {
  documents: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'text/csv',
  ],
  images: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
  ],
  videos: [
    'video/mp4',
    'video/webm',
    'video/ogg',
  ],
};

/**
 * Validates email format
 */
export function validateEmail(email: string): ValidationResult {
  const errors: Record<string, string> = {};
  
  if (!email) {
    errors.email = 'Email is required';
  } else if (!EMAIL_REGEX.test(email)) {
    errors.email = 'Please enter a valid email address';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validates password strength
 */
export function validatePassword(password: string): ValidationResult {
  const errors: Record<string, string> = {};
  
  if (!password) {
    errors.password = 'Password is required';
  } else {
    if (password.length < PASSWORD_REQUIREMENTS.minLength) {
      errors.password = `Password must be at least ${PASSWORD_REQUIREMENTS.minLength} characters long`;
    }
    
    if (PASSWORD_REQUIREMENTS.requireUppercase && !/[A-Z]/.test(password)) {
      errors.password = 'Password must contain at least one uppercase letter';
    }
    
    if (PASSWORD_REQUIREMENTS.requireLowercase && !/[a-z]/.test(password)) {
      errors.password = 'Password must contain at least one lowercase letter';
    }
    
    if (PASSWORD_REQUIREMENTS.requireNumbers && !/\d/.test(password)) {
      errors.password = 'Password must contain at least one number';
    }
    
    if (PASSWORD_REQUIREMENTS.requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.password = 'Password must contain at least one special character';
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validates login form
 */
export function validateLoginForm(form: LoginForm): ValidationResult {
  const errors: Record<string, string> = {};
  
  const emailValidation = validateEmail(form.email);
  if (!emailValidation.isValid) {
    errors.email = emailValidation.errors.email!;
  }
  
  if (!form.password) {
    errors.password = 'Password is required';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validates registration form
 */
export function validateRegisterForm(form: RegisterForm): ValidationResult {
  const errors: Record<string, string> = {};
  
  const emailValidation = validateEmail(form.email);
  if (!emailValidation.isValid) {
    errors.email = emailValidation.errors.email!;
  }
  
  const passwordValidation = validatePassword(form.password);
  if (!passwordValidation.isValid) {
    errors.password = passwordValidation.errors.password!;
  }
  
  if (form.password !== form.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }
  
  if (!form.full_name?.trim()) {
    errors.full_name = 'Full name is required';
  } else if (form.full_name.trim().length < 2) {
    errors.full_name = 'Full name must be at least 2 characters long';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validates project form
 */
export function validateProjectForm(form: ProjectForm): ValidationResult {
  const errors: Record<string, string> = {};
  
  if (!form.name?.trim()) {
    errors.name = 'Project name is required';
  } else if (form.name.trim().length < 3) {
    errors.name = 'Project name must be at least 3 characters long';
  } else if (form.name.trim().length > 255) {
    errors.name = 'Project name must be less than 255 characters';
  }
  
  if (form.description && form.description.length > 1000) {
    errors.description = 'Description must be less than 1000 characters';
  }
  
  if (form.budget && form.budget < 0) {
    errors.budget = 'Budget cannot be negative';
  }
  
  if (form.deadline) {
    const deadlineDate = new Date(form.deadline);
    const today = new Date();
    if (deadlineDate < today) {
      errors.deadline = 'Deadline cannot be in the past';
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validates document upload
 */
export function validateDocumentUpload(form: DocumentUploadForm): ValidationResult {
  const errors: Record<string, string> = {};
  
  if (!form.file) {
    errors.file = 'File is required';
  } else {
    const file = form.file;
    
    // Check file size
    if (file.size > FILE_SIZE_LIMITS.document) {
      errors.file = `File size must be less than ${FILE_SIZE_LIMITS.document / (1024 * 1024)}MB`;
    }
    
    // Check file type
    const allAllowedTypes = [
      ...ALLOWED_MIME_TYPES.documents,
      ...ALLOWED_MIME_TYPES.images,
      ...ALLOWED_MIME_TYPES.videos,
    ];
    
    if (!allAllowedTypes.includes(file.type)) {
      errors.file = 'File type not supported. Please upload a document, image, or video file.';
    }
  }
  
  if (!form.project_id) {
    errors.project_id = 'Project is required';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validates message form
 */
export function validateMessageForm(form: MessageForm): ValidationResult {
  const errors: Record<string, string> = {};
  
  if (!form.content?.trim()) {
    errors.content = 'Message content is required';
  } else if (form.content.trim().length > 5000) {
    errors.content = 'Message must be less than 5000 characters';
  }
  
  if (!form.project_id) {
    errors.project_id = 'Project is required';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validates user invite form
 */
export function validateUserInviteForm(form: UserInviteForm): ValidationResult {
  const errors: Record<string, string> = {};
  
  const emailValidation = validateEmail(form.email);
  if (!emailValidation.isValid) {
    errors.email = emailValidation.errors.email!;
  }
  
  if (!form.project_id) {
    errors.project_id = 'Project is required';
  }
  
  const validRoles = ['admin', 'editor', 'viewer'];
  if (!validRoles.includes(form.role)) {
    errors.role = 'Invalid role selected';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validates file type and size
 */
export function validateFile(file: File, maxSize: number = FILE_SIZE_LIMITS.document): ValidationResult {
  const errors: Record<string, string> = {};
  
  if (file.size > maxSize) {
    errors.file = `File size must be less than ${maxSize / (1024 * 1024)}MB`;
  }
  
  const allAllowedTypes = [
    ...ALLOWED_MIME_TYPES.documents,
    ...ALLOWED_MIME_TYPES.images,
    ...ALLOWED_MIME_TYPES.videos,
  ];
  
  if (!allAllowedTypes.includes(file.type)) {
    errors.file = 'File type not supported';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Sanitizes HTML content to prevent XSS
 */
export function sanitizeHtml(html: string): string {
  const div = document.createElement('div');
  div.textContent = html;
  return div.innerHTML;
}

/**
 * Validates URL format
 */
export function validateUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validates phone number format
 */
export function validatePhoneNumber(phone: string): boolean {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
}

/**
 * Validates date format
 */
export function validateDate(date: string): boolean {
  const dateObj = new Date(date);
  return dateObj instanceof Date && !isNaN(dateObj.getTime());
}

/**
 * Validates UUID format
 */
export function validateUuid(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Validates JSON string
 */
export function validateJson(jsonString: string): boolean {
  try {
    JSON.parse(jsonString);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validates required fields
 */
export function validateRequired(value: any, fieldName: string): ValidationResult {
  const errors: Record<string, string> = {};
  
  if (!value || (typeof value === 'string' && !value.trim())) {
    errors[fieldName] = `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validates string length
 */
export function validateStringLength(value: string, fieldName: string, min: number, max: number): ValidationResult {
  const errors: Record<string, string> = {};
  
  if (value.length < min) {
    errors[fieldName] = `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} must be at least ${min} characters long`;
  }
  
  if (value.length > max) {
    errors[fieldName] = `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} must be less than ${max} characters`;
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Combines multiple validation results
 */
export function combineValidations(...validations: ValidationResult[]): ValidationResult {
  const allErrors: Record<string, string> = {};
  
  validations.forEach(validation => {
    Object.assign(allErrors, validation.errors);
  });
  
  return {
    isValid: Object.keys(allErrors).length === 0,
    errors: allErrors,
  };
} 