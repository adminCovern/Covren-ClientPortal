// Sovereign Command Center Error Handler Component
// Covren Firm LLC - Production Grade Error Management

import React, { useState, useEffect, useCallback } from 'react';
import type { AppError } from '../../types';

interface ErrorHandlerProps {
  error: AppError | null;
  onRetry?: () => void;
  onDismiss?: () => void;
  onReport?: (error: AppError) => void;
}

interface ErrorRecoveryOption {
  id: string;
  label: string;
  action: () => void;
  priority: 'high' | 'medium' | 'low';
}

const ErrorHandler: React.FC<ErrorHandlerProps> = ({
  error,
  onRetry,
  onDismiss,
  onReport,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [recoveryOptions, setRecoveryOptions] = useState<ErrorRecoveryOption[]>([]);

  useEffect(() => {
    if (error) {
      generateRecoveryOptions(error);
    }
  }, [error]);

  const generateRecoveryOptions = useCallback((error: AppError) => {
    const options: ErrorRecoveryOption[] = [];

    // Always add retry option if available
    if (onRetry) {
      options.push({
        id: 'retry',
        label: 'Try Again',
        action: onRetry,
        priority: 'high',
      });
    }

    // Add context-specific recovery options
    switch (error.code) {
      case 'NETWORK_ERROR':
        options.push(
          {
            id: 'check-connection',
            label: 'Check Internet Connection',
            action: () => window.location.reload(),
            priority: 'high',
          },
          {
            id: 'offline-mode',
            label: 'Continue Offline',
            action: () => console.log('Switch to offline mode'),
            priority: 'medium',
          }
        );
        break;

      case 'AUTHENTICATION_ERROR':
        options.push({
          id: 're-login',
          label: 'Sign In Again',
          action: () => window.location.href = '/login',
          priority: 'high',
        });
        break;

      case 'PERMISSION_ERROR':
        options.push({
          id: 'contact-admin',
          label: 'Contact Administrator',
          action: () => window.open('mailto:support@covrenfirm.com'),
          priority: 'medium',
        });
        break;

      case 'VALIDATION_ERROR':
        options.push({
          id: 'review-input',
          label: 'Review Input',
          action: () => setIsExpanded(false),
          priority: 'medium',
        });
        break;

      case 'SERVER_ERROR':
        options.push(
          {
            id: 'refresh-page',
            label: 'Refresh Page',
            action: () => window.location.reload(),
            priority: 'high',
          },
          {
            id: 'contact-support',
            label: 'Contact Support',
            action: () => window.open('mailto:support@covrenfirm.com'),
            priority: 'medium',
          }
        );
        break;

      default:
        options.push({
          id: 'refresh-page',
          label: 'Refresh Page',
          action: () => window.location.reload(),
          priority: 'medium',
        });
    }

    // Add dismiss option
    if (onDismiss) {
      options.push({
        id: 'dismiss',
        label: 'Dismiss',
        action: onDismiss,
        priority: 'low',
      });
    }

    setRecoveryOptions(options);
  }, [onRetry, onDismiss]);

  const getErrorIcon = (code: string) => {
    switch (code) {
      case 'NETWORK_ERROR':
        return (
          <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        );
      case 'AUTHENTICATION_ERROR':
        return (
          <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        );
      case 'PERMISSION_ERROR':
        return (
          <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        );
      default:
        return (
          <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  const getErrorColor = (code: string) => {
    switch (code) {
      case 'NETWORK_ERROR':
        return 'bg-orange-50 border-orange-200 text-orange-800';
      case 'AUTHENTICATION_ERROR':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'PERMISSION_ERROR':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'VALIDATION_ERROR':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'SERVER_ERROR':
        return 'bg-red-50 border-red-200 text-red-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!error) return null;

  return (
    <div className={`border rounded-lg p-4 ${getErrorColor(error.code)}`}>
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          {getErrorIcon(error.code)}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">
              {error.code.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
            </h3>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                {isExpanded ? 'Less' : 'More'}
              </button>
              {onReport && (
                <button
                  onClick={() => onReport(error)}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Report
                </button>
              )}
            </div>
          </div>
          
          <p className="mt-1 text-sm">{error.message}</p>
          
          {isExpanded && (
            <div className="mt-3 space-y-2">
              {error.details && (
                <div className="bg-white bg-opacity-50 rounded p-2">
                  <p className="text-xs font-medium text-gray-600">Details:</p>
                  <pre className="text-xs text-gray-700 mt-1 whitespace-pre-wrap">
                    {JSON.stringify(error.details, null, 2)}
                  </pre>
                </div>
              )}
              
              <div className="text-xs text-gray-500">
                Timestamp: {formatTimestamp(error.timestamp)}
              </div>
            </div>
          )}
          
          {/* Recovery Options */}
          {recoveryOptions.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {recoveryOptions
                .sort((a, b) => {
                  const priorityOrder = { high: 3, medium: 2, low: 1 };
                  return priorityOrder[b.priority] - priorityOrder[a.priority];
                })
                .map((option) => (
                  <button
                    key={option.id}
                    onClick={option.action}
                    className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                      option.priority === 'high'
                        ? 'bg-red-100 text-red-800 hover:bg-red-200'
                        : option.priority === 'medium'
                        ? 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ErrorHandler; 