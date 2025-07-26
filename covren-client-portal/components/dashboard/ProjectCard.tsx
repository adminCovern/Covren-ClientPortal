// Sovereign Command Center Project Card Component
// Covren Firm LLC - Production Grade Project Display

import React, { useState, useCallback } from 'react';
import type { Project, ProjectCardProps } from '../../types';
import { projectsApi } from '../../services/api';

const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  onSelect,
  onEdit,
  onDelete,
  userRole,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = useCallback(async () => {
    if (!confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await projectsApi.deleteProject(project.id);
      if (response.success) {
        onDelete(project.id);
      } else {
        setError(response.error || 'Failed to delete project');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  }, [project.id, onDelete]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'paused': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatBudget = (budget?: number) => {
    if (!budget) return 'Not set';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(budget);
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {project.name}
            </h3>
            <div className="flex items-center gap-2 mb-2">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(project.status)}`}>
                {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
              </span>
              <div className={`w-2 h-2 rounded-full ${getPriorityColor(project.priority)}`} title={`Priority: ${project.priority}`} />
            </div>
          </div>
          <div className="flex items-center gap-2">
            {userRole === 'owner' && (
              <button
                onClick={() => onEdit(project)}
                className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                title="Edit project"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
            )}
            {userRole === 'owner' && (
              <button
                onClick={handleDelete}
                disabled={loading}
                className="p-1 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
                title="Delete project"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {project.description && (
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {project.description}
          </p>
        )}

        {/* Stats */}
        {project.stats && (
          <div className="grid grid-cols-3 gap-4 mb-3 text-xs">
            <div className="text-center">
              <div className="font-semibold text-gray-900">{project.stats.total_members}</div>
              <div className="text-gray-500">Members</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-gray-900">{project.stats.total_documents}</div>
              <div className="text-gray-500">Documents</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-gray-900">{project.stats.total_messages}</div>
              <div className="text-gray-500">Messages</div>
            </div>
          </div>
        )}

        {/* Tags */}
        {project.tags && project.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {project.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700"
              >
                {tag}
              </span>
            ))}
            {project.tags.length > 3 && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700">
                +{project.tags.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Details */}
        <div className="space-y-2 text-sm text-gray-600">
          {project.budget && (
            <div className="flex justify-between">
              <span>Budget:</span>
              <span className="font-medium">{formatBudget(project.budget)}</span>
            </div>
          )}
          {project.deadline && (
            <div className="flex justify-between">
              <span>Deadline:</span>
              <span className="font-medium">{formatDate(project.deadline)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span>Created:</span>
            <span className="font-medium">{formatDate(project.created_at)}</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
        <button
          onClick={() => onSelect(project)}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors duration-200 font-medium text-sm"
        >
          View Project
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="px-4 py-2 bg-red-50 border-t border-red-200">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}
    </div>
  );
};

export default ProjectCard; 