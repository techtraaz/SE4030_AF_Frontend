import React, { useState } from 'react';
import { useForums } from '../../hooks/useForum';
import { toastService } from '../../services/toastService';
import { validateForum } from '../../validations/forumValidations';

const CreateForumForm = ({ onForumCreated }) => {
  const { createForum, isLoading } = useForums();
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [errors, setErrors] = useState({});

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
      toastService.error('Please fix the form errors');
      return;
    }

    try {
      console.log('Submitting forum data:', formData);
      await createForum(formData);
      console.log('Forum created successfully');
      toastService.success('Forum created successfully!');
      setFormData({ name: '', description: '' });
      setErrors({});
      if (onForumCreated) onForumCreated();
    } catch (error) {
      console.error('Create forum error:', error);
      const errorMsg = typeof error === 'string' ? error : error?.message || 'Failed to create forum';
      toastService.error(errorMsg);
      setErrors({ submit: errorMsg });
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-xl font-semibold mb-4">Create a New Forum</h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Forum Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g., Python Programming"
            className="w-full mt-1 px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          {errors.name && (
            <p className="text-red-500 text-sm mt-1">{errors.name}</p>
          )}
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe your forum..."
            rows={4}
            className="w-full mt-1 px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          {errors.description && (
            <p className="text-red-500 text-sm mt-1">{errors.description}</p>
          )}
        </div>

        {errors.submit && (
          <p className="text-red-500 text-sm">{errors.submit}</p>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-2 bg-orange-500 text-white rounded font-medium hover:bg-orange-600 disabled:bg-gray-400 transition"
        >
          {isLoading ? 'Creating...' : 'Create Forum'}
        </button>
      </form>
    </div>
  );
};

export default CreateForumForm;