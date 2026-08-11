import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { useForums } from '../../hooks/useForum';
import { validateForum } from '../../validations/forumValidations';
import { toastService } from '../../services/toastService';
import { ArrowLeft } from 'lucide-react';

const EditForumForm = () => {
  const navigate = useNavigate();
  const { forumId } = useParams();
  const { user } = useAuth();
  const { currentForum, isLoading, error, getForumById, updateForum } = useForums();
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);

  useEffect(() => {
    getForumById(forumId);
  }, [forumId]);

  useEffect(() => {
    if (currentForum) {
      // Check permission - handle createdBy as either object or string
      const creatorId = currentForum.createdBy?._id?.toString() || 
                        currentForum.createdBy?.toString() || 
                        currentForum.createdBy;
      const userId = user._id?.toString() || user.id?.toString();
      
      // Permission check: user is creator, admin, or content contributor
      const isCreator = creatorId === userId;
      const isAdmin = user?.role === 'ADMIN';
      const isContentContributor = user?.role === 'CONTENT_CONTRIBUTOR';

      console.log('EditForumForm Permission Check:', {
        forumCreatedBy: currentForum.createdBy,
        creatorId: creatorId,
        userId: userId,
        isCreator,
        isAdmin,
        isContentContributor,
        userRole: user?.role,
        hasPermission: isCreator || isAdmin || isContentContributor
      });

      if (!isCreator && !isAdmin && !isContentContributor) {
        setPermissionDenied(true);
        return;
      }

      setFormData({
        name: currentForum.name || '',
        description: currentForum.description || '',
      });
    }
  }, [currentForum, user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validation = validateForum(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setSubmitting(true);

    try {
      await updateForum(forumId, formData);
      toastService.success('Forum updated successfully');
      navigate('/admin/forums');
    } catch (err) {
      const errorMsg = err.message || 'Failed to update forum';
      setErrors({ submit: errorMsg });
      toastService.error(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (permissionDenied) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <p className="text-red-700">
            You don't have permission to edit this forum. Only the forum creator, admin, or content contributor can edit forums.
          </p>
          <button
            onClick={() => navigate('/admin/forums')}
            className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
          >
            Back to Forums
          </button>
        </div>
      </div>
    );
  }

  if (!currentForum) {
    return (
      <div className="p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <p className="text-yellow-700">Forum not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/admin/forums')}
          className="flex items-center gap-2 text-blue-500 hover:text-blue-600 transition mb-4"
        >
          <ArrowLeft size={20} />
          Back to Forums
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Edit Forum</h1>
      </div>

      {/* Form */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Forum Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Forum Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., Python Programming"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe your forum..."
              rows={6}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
            />
            {errors.description && (
              <p className="text-red-500 text-sm mt-1">{errors.description}</p>
            )}
          </div>

          {/* Submit Error */}
          {errors.submit && (
            <p className="text-red-500 text-sm p-3 bg-red-50 rounded border border-red-200">{errors.submit}</p>
          )}

          {/* Form Error */}
          {error && (
            <p className="text-red-500 text-sm p-3 bg-red-50 rounded border border-red-200">{error}</p>
          )}

          {/* Buttons */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-2 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 disabled:bg-gray-400 transition"
            >
              {submitting ? 'Updating...' : 'Update Forum'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/admin/forums')}
              className="px-6 py-2 bg-gray-200 text-gray-900 rounded-lg font-medium hover:bg-gray-300 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditForumForm;
