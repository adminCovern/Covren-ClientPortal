import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { validateEmail, validateStringLength } from '../../utils/validation';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorToast from '../common/ErrorToast';

const UserProfile: React.FC = () => {
  const { user, updateProfile, loading } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    company: user?.company || '',
    position: user?.position || '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    const emailValidation = validateEmail(formData.email);
    if (!emailValidation.isValid) {
      newErrors.email = emailValidation.errors.email || 'Invalid email';
    }

    const nameValidation = validateStringLength(formData.name, 'name', 2, 100);
    if (!nameValidation.isValid) {
      newErrors.name = nameValidation.errors.name || 'Name is required';
    }

    if (formData.company) {
      const companyValidation = validateStringLength(formData.company, 'company', 1, 100);
      if (!companyValidation.isValid) {
        newErrors.company = companyValidation.errors.company || 'Invalid company name';
      }
    }

    if (formData.position) {
      const positionValidation = validateStringLength(formData.position, 'position', 1, 100);
      if (!positionValidation.isValid) {
        newErrors.position = positionValidation.errors.position || 'Invalid position';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const success = await updateProfile(formData);
    if (success) {
      setIsEditing(false);
      setSuccess('Profile updated successfully');
      setTimeout(() => setSuccess(null), 3000);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      company: user?.company || '',
      position: user?.position || '',
    });
    setErrors({});
    setIsEditing(false);
  };

  if (!user) {
    return null;
  }

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">User Profile</h2>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-md transition-colors"
          >
            Edit Profile
          </button>
        )}
      </div>

      {isEditing ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Full Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full px-3 py-2 bg-gray-700 border rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent ${
                errors.name ? 'border-red-500' : 'border-gray-600'
              }`}
              placeholder="Enter your full name"
              required
              disabled={loading}
            />
            {errors.name && <p className="text-red-400 text-sm mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Email Address *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full px-3 py-2 bg-gray-700 border rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent ${
                errors.email ? 'border-red-500' : 'border-gray-600'
              }`}
              placeholder="Enter your email address"
              required
              disabled={loading}
            />
            {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Company
            </label>
            <input
              type="text"
              name="company"
              value={formData.company}
              onChange={handleChange}
              className={`w-full px-3 py-2 bg-gray-700 border rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent ${
                errors.company ? 'border-red-500' : 'border-gray-600'
              }`}
              placeholder="Enter your company name"
              disabled={loading}
            />
            {errors.company && <p className="text-red-400 text-sm mt-1">{errors.company}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Position
            </label>
            <input
              type="text"
              name="position"
              value={formData.position}
              onChange={handleChange}
              className={`w-full px-3 py-2 bg-gray-700 border rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent ${
                errors.position ? 'border-red-500' : 'border-gray-600'
              }`}
              placeholder="Enter your position"
              disabled={loading}
            />
            {errors.position && <p className="text-red-400 text-sm mt-1">{errors.position}</p>}
          </div>

          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={loading}
              className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center">
                  <LoadingSpinner size="small" color="white" />
                  <span className="ml-2">Saving...</span>
                </div>
              ) : (
                'Save Changes'
              )}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Full Name</label>
            <p className="text-white">{user.name || 'Not provided'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Email Address</label>
            <p className="text-white">{user.email}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Company</label>
            <p className="text-white">{user.company || 'Not provided'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Position</label>
            <p className="text-white">{user.position || 'Not provided'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Role</label>
            <p className="text-white capitalize">{user.role}</p>
          </div>
        </div>
      )}

      {success && (
        <ErrorToast
          message={success}
          type="info"
          onClose={() => setSuccess(null)}
        />
      )}
    </div>
  );
};

export default UserProfile;
