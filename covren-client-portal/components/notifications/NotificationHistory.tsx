// Sovereign Command Center Notification History Component
// Covren Firm LLC - Production Grade Notification History Management

import React, { useState, useEffect } from 'react';

const NotificationHistory = ({ onClose }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    loadNotificationHistory();
  }, []);

  const loadNotificationHistory = async () => {
    try {
      const response = await fetch('/api/notifications?include_read=true', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
      }
    } catch (error) {
      console.error('Failed to load notification history:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAndSortedNotifications = notifications
    .filter(notification => {
      if (filter === 'all') return true;
      if (filter === 'read') return notification.read_at;
      if (filter === 'unread') return !notification.read_at;
      return notification.type === filter;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      } else {
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      }
    });

  const handleBulkDelete = async (type) => {
    const notificationsToDelete = notifications.filter(n => {
      if (type === 'read') return n.read_at;
      if (type === 'older_than_week') {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return new Date(n.created_at) < weekAgo;
      }
      return false;
    });

    for (const notification of notificationsToDelete) {
      try {
        await fetch(`/api/notifications/${notification.id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          },
          credentials: 'include'
        });
      } catch (error) {
        console.error('Failed to delete notification:', error);
      }
    }

    loadNotificationHistory();
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-gray-900 rounded-lg p-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-lg font-semibold text-white">Notification History</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 border-b border-gray-700">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap gap-2">
              <label className="text-sm text-gray-400">Filter:</label>
              {['all', 'unread', 'read', 'info', 'success', 'warning', 'error', 'critical'].map((filterType) => (
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

            <div className="flex items-center gap-4">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
              </select>

              <div className="flex gap-2">
                <button
                  onClick={() => handleBulkDelete('read')}
                  className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs transition-colors"
                >
                  Delete Read
                </button>
                <button
                  onClick={() => handleBulkDelete('older_than_week')}
                  className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs transition-colors"
                >
                  Delete Old
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-y-auto max-h-96 p-6">
          {filteredAndSortedNotifications.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400">No notifications found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredAndSortedNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 rounded-lg border transition-colors ${
                    notification.read_at
                      ? 'bg-gray-800 border-gray-700'
                      : 'bg-gray-700 border-gray-600'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-medium text-white">{notification.title}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          notification.type === 'success' ? 'bg-green-600 text-green-100' :
                          notification.type === 'warning' ? 'bg-yellow-600 text-yellow-100' :
                          notification.type === 'error' || notification.type === 'critical' ? 'bg-red-600 text-red-100' :
                          'bg-blue-600 text-blue-100'
                        }`}>
                          {notification.type}
                        </span>
                      </div>
                      <p className="text-sm text-gray-300 mb-2">{notification.message}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-400">
                        <span>{new Date(notification.created_at).toLocaleString()}</span>
                        {notification.read_at && (
                          <span>Read: {new Date(notification.read_at).toLocaleString()}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationHistory;
