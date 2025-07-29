// Sovereign Command Center Notification Center Component
// Covren Firm LLC - Production Grade Notification Management

import React, { useState } from 'react';
import type { Notification } from '../../types';
import NotificationPreferences from './NotificationPreferences';
import NotificationHistory from './NotificationHistory';

interface NotificationCenterProps {
  notifications: Notification[];
  onRead: (notificationId: string) => void;
  onDelete: (notificationId: string) => void;
  onClose: () => void;
}

const NotificationCenter = ({
  notifications,
  onRead,
  onDelete,
  onClose,
}) => {
  const [filter, setFilter] = useState('all');
  const [showPreferences, setShowPreferences] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !notification.read_at;
    return notification.type === filter;
  });
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return (
          <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'warning':
        return (
          <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        );
      case 'error':
      case 'critical':
        return (
          <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'border-green-500 bg-green-900/20';
      case 'warning':
        return 'border-yellow-500 bg-yellow-900/20';
      case 'error':
      case 'critical':
        return 'border-red-500 bg-red-900/20';
      default:
        return 'border-blue-500 bg-blue-900/20';
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-end z-50">
      <div className="w-full max-w-md h-full bg-gray-900 border-l border-gray-700 shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-lg font-semibold text-white">Notifications</h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowHistory(true)}
              className="text-gray-400 hover:text-white transition-colors"
              title="Notification History"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
            <button
              onClick={() => setShowPreferences(true)}
              className="text-gray-400 hover:text-white transition-colors"
              title="Notification Preferences"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex flex-wrap gap-2">
            {['all', 'unread', 'info', 'success', 'warning', 'error', 'critical'].map((filterType) => (
              <button
                key={filterType}
                onClick={() => setFilter(filterType)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  filter === filterType
                    ? 'bg-cyan-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto">
          {filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4.83 19.13a11.25 11.25 0 01-1.77-1.89 9 9 0 01-.31-13.84 9 9 0 0113.36-1.64 9 9 0 01.31 13.84 11.25 11.25 0 01-1.77 1.89M8.59 21l.81.81a2 2 0 002.83 0l.81-.81a2 2 0 00-2.83 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-white mb-2">No notifications</h3>
              <p className="text-gray-400">You're all caught up!</p>
            </div>
          ) : (
            <div className="p-4 space-y-3">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`
                    p-4 rounded-lg border-l-4 transition-all duration-200
                    ${getNotificationColor(notification.type)}
                    ${!notification.read_at ? 'bg-opacity-30' : 'bg-opacity-10'}
                  `}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-white">
                            {notification.title}
                          </h4>
                          <p className="text-sm text-gray-300 mt-1">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-400 mt-2">
                            {formatTime(notification.created_at)}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                          {!notification.read_at && (
                            <button
                              onClick={() => onRead(notification.id)}
                              className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
                            >
                              Mark read
                            </button>
                          )}
                          <button
                            onClick={() => onDelete(notification.id)}
                            className="text-xs text-red-400 hover:text-red-300 transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                      {notification.action_url && (
                        <div className="mt-3">
                          <a
                            href={notification.action_url}
                            className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
                          >
                            View Details →
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="p-4 border-t border-gray-700">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">
                {filteredNotifications.length} of {notifications.length} notifications
              </span>
              <button
                onClick={() => {
                  notifications.forEach(n => {
                    if (!n.read_at) onRead(n.id);
                  });
                }}
                className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                Mark all as read
              </button>
            </div>
          </div>
        )}

        {/* Notification Preferences Modal */}
        {showPreferences && (
          <NotificationPreferences onClose={() => setShowPreferences(false)} />
        )}

        {/* Notification History Modal */}
        {showHistory && (
          <NotificationHistory onClose={() => setShowHistory(false)} />
        )}
      </div>
    </div>
  );
};

export default NotificationCenter;      