// Sovereign Command Center User Inviter Component
// Covren Firm LLC - Production Grade User Management

import React, { useState, useCallback } from 'react';
import type { UserInviteForm, ProjectUser } from '../../types';
import { usersApi } from '../../services/api';
import { validateUserInviteForm } from '../../utils/validation';

interface UserInviterProps {
  projectId: string;
  onInviteComplete: (projectUser: ProjectUser) => void;
  onCancel: () => void;
}

const UserInviter: React.FC<UserInviterProps> = ({
  projectId,
  onInviteComplete,
  onCancel,
}) => {
  const [formData, setFormData] = useState<UserInviteForm>({
    email: '',
    role: 'viewer',
    project_id: projectId,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleInputChange = useCallback((field: keyof UserInviteForm, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  }, [errors]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const validation = validateUserInviteForm(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const response = await usersApi.inviteUser(formData);
      if (response.success && response.data) {
        onInviteComplete(response.data);
      } else {
        setErrors({ submit: response.error || 'Failed to invite user' });
      }
    } catch (err) {
      setErrors({ submit: 'An unexpected error occurred' });
    } finally {
      setLoading(false);
    }
  }, [formData, onInviteComplete]);

  const getRoleDescription = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Can manage project settings, invite users, and delete content';
      case 'editor':
        return 'Can edit project content, upload documents, and send messages';
      case 'viewer':
        return 'Can view project content and send messages';
      default:
        return '';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">Invite Team Member</h2>
        <p className="text-sm text-gray-600 mt-1">Add new members to your project</p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Email Input */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Email Address *
          </label>
          <input
            type="email"
            id="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.email ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Enter email address"
            disabled={loading}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
          )}
        </div>

        {/* Role Selection */}
        <div>
          <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
            Role *
          </label>
          <div className="space-y-3">
            {(['viewer', 'editor', 'admin'] as const).map((role) => (
              <div key={role} className="flex items-start">
                <input
                  id={`role-${role}`}
                  name="role"
                  type="radio"
                  value={role}
                  checked={formData.role === role}
                  onChange={(e) => handleInputChange('role', e.target.value)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 mt-1"
                  disabled={loading}
                />
                <label htmlFor={`role-${role}`} className="ml-3 flex-1">
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-900 capitalize">
                      {role}
                    </span>
                    {role === 'admin' && (
                      <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        Admin
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {getRoleDescription(role)}
                  </p>
                </label>
              </div>
            ))}
          </div>
          {errors.role && (
            <p className="mt-1 text-sm text-red-600">{errors.role}</p>
          )}
        </div>

        {/* Role Permissions Summary */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Role Permissions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Viewer</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• View project content</li>
                <li>• Send messages</li>
                <li>• Download documents</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Editor</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• All viewer permissions</li>
                <li>• Upload documents</li>
                <li>• Edit project details</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Admin</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• All editor permissions</li>
                <li>• Invite/remove users</li>
                <li>• Delete project</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Submit Error */}
        {errors.submit && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{errors.submit}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? 'Sending Invite...' : 'Send Invite'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserInviter; 