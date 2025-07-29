// Covren Firm LLC - Production Grade Status Updates

import React, { useState, useCallback } from 'react';

const StatusUpdater = ({ 
  projectId, 
  projectName, 
  onStatusUpdate, 
  onCancel 
}) => {
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'info',
    notifyTeam: true,
    emailNotification: false
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleInputChange = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  }, [errors]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      setErrors({ title: 'Title is required' });
      return;
    }

    if (!formData.message.trim()) {
      setErrors({ message: 'Message is required' });
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        credentials: 'include',
        body: JSON.stringify({
          title: `${projectName}: ${formData.title}`,
          message: formData.message,
          type: formData.type,
          action_url: `/projects/${projectId}`,
          user_ids: formData.notifyTeam ? ['team'] : []
        })
      });

      if (response.ok) {
        onStatusUpdate({
          title: formData.title,
          message: formData.message,
          type: formData.type,
          projectId,
          timestamp: new Date().toISOString()
        });
      } else {
        const error = await response.json();
        setErrors({ submit: error.error || 'Failed to post status update' });
      }
    } catch (error) {
      setErrors({ submit: 'Failed to post status update' });
    } finally {
      setLoading(false);
    }
  }, [formData, projectId, projectName, onStatusUpdate]);

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-medium text-white">Post Status Update</h3>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Update Title *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            className={`w-full px-3 py-2 bg-gray-700 border rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent ${
              errors.title ? 'border-red-500' : 'border-gray-600'
            }`}
            placeholder="Brief update title"
            disabled={loading}
          />
          {errors.title && <p className="text-red-400 text-sm mt-1">{errors.title}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Update Message *
          </label>
          <textarea
            value={formData.message}
            onChange={(e) => handleInputChange('message', e.target.value)}
            rows={4}
            className={`w-full px-3 py-2 bg-gray-700 border rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent ${
              errors.message ? 'border-red-500' : 'border-gray-600'
            }`}
            placeholder="Detailed status update message"
            disabled={loading}
          />
          {errors.message && <p className="text-red-400 text-sm mt-1">{errors.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Update Type
          </label>
          <select
            value={formData.type}
            onChange={(e) => handleInputChange('type', e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            disabled={loading}
          >
            <option value="info">Information</option>
            <option value="success">Success</option>
            <option value="warning">Warning</option>
            <option value="error">Issue</option>
            <option value="critical">Critical</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.notifyTeam}
              onChange={(e) => handleInputChange('notifyTeam', e.target.checked)}
              className="mr-2 rounded border-gray-600 bg-gray-700 text-cyan-600 focus:ring-cyan-500"
              disabled={loading}
            />
            <span className="text-sm text-gray-300">Notify all team members</span>
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.emailNotification}
              onChange={(e) => handleInputChange('emailNotification', e.target.checked)}
              className="mr-2 rounded border-gray-600 bg-gray-700 text-cyan-600 focus:ring-cyan-500"
              disabled={loading}
            />
            <span className="text-sm text-gray-300">Send email notifications</span>
          </label>
        </div>

        {errors.submit && (
          <div className="p-3 bg-red-800 border border-red-600 rounded-md">
            <p className="text-red-100 text-sm">{errors.submit}</p>
          </div>
        )}

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-300 hover:text-white border border-gray-600 rounded-md transition-colors"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-md font-medium transition-colors disabled:opacity-50"
          >
            {loading ? 'Posting...' : 'Post Update'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default StatusUpdater;
