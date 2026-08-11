import React, { useState } from 'react';
import { usePosts } from '../../hooks/usePosts';
import { validatePost } from '../../validations/postValidation';

const CreatePostForm = ({ forumId, onPostCreated, onClose, isModal = false }) => {
  const { createPost, isLoading } = usePosts();
  const [formData, setFormData] = useState({ title: '', content: '' });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validation = validatePost(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    try {
      const result = await createPost(forumId, formData);
      console.log('Post created successfully:', result);
      setFormData({ title: '', content: '' });
      setErrors({});
      
      // Call the callback to refresh posts and wait for it
      if (onPostCreated) {
        const refreshResult = onPostCreated();
        // If it's a promise, wait for it
        if (refreshResult && typeof refreshResult.then === 'function') {
          await refreshResult;
        }
      }
      
      // Close the modal if provided (after posts are refreshed)
      if (onClose && isModal) {
        setTimeout(() => onClose(), 200);
      }
    } catch (error) {
      console.error('Create post error:', error);
      const errorMessage = error?.message || error?.error || 'Failed to create post';
      setErrors({ submit: errorMessage });
    }
  };

  const formContent = (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          Title
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="What's your question or topic?"
          className="w-full mt-1 px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
        {errors.title && (
          <p className="text-red-500 text-sm mt-1">{errors.title}</p>
        )}
      </div>

      <div>
        <label htmlFor="content" className="block text-sm font-medium text-gray-700">
          Content
        </label>
        <textarea
          id="content"
          name="content"
          value={formData.content}
          onChange={handleChange}
          placeholder="Provide details..."
          rows={isModal ? 4 : 6}
          className="w-full mt-1 px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
        {errors.content && (
          <p className="text-red-500 text-sm mt-1">{errors.content}</p>
        )}
      </div>

      {errors.submit && (
        <p className="text-red-500 text-sm">{errors.submit}</p>
      )}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 py-2 bg-orange-500 text-white rounded font-medium hover:bg-orange-600 disabled:bg-gray-400 transition"
        >
          {isLoading ? 'Creating...' : 'Create Post'}
        </button>
        {isModal && onClose && (
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2 bg-gray-300 text-gray-700 rounded font-medium hover:bg-gray-400 transition"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );

  if (isModal) {
    return formContent;
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
      <h3 className="text-xl font-semibold mb-4">Create a Post</h3>
      {formContent}
    </div>
  );
};

export default CreatePostForm;