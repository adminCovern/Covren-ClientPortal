// Sovereign Command Center Error Toast Component
// Covren Firm LLC - Production Grade Error Display

import React from 'react';

interface ErrorToastProps {
  message: string;
  onClose: () => void;
  type?: 'error' | 'warning' | 'info';
  duration?: number;
}

const ErrorToast: React.FC<ErrorToastProps> = ({
  message,
  onClose,
  type = 'error',
  duration = 5000,
}) => {
  React.useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const typeClasses = {
    error: 'bg-red-800 border-red-600 text-red-100',
    warning: 'bg-yellow-800 border-yellow-600 text-yellow-100',
    info: 'bg-blue-800 border-blue-600 text-blue-100',
  };

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm">
      <div className={`
        p-4 rounded-lg shadow-lg border-l-4
        ${typeClasses[type]}
        animate-slide-in
      `}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium">{message}</p>
          </div>
          <button
            onClick={onClose}
            className="ml-3 text-current opacity-70 hover:opacity-100 transition-opacity"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErrorToast; 