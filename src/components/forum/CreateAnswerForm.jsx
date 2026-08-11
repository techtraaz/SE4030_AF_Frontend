import React, { useState } from 'react';
import { useAnswers } from '../../hooks/useAnswers';
import { validateAnswer } from '../../validations/answerValidations';

const CreateAnswerForm = ({ forumId, postId, onAnswerCreated, onClose, isModal = false }) => {
  const { createAnswer, isCreating } = useAnswers();
  const [content, setContent] = useState('');
  const [errors, setErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validation = validateAnswer({ content });
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    try {
      await createAnswer(forumId, postId, content);
      setContent('');
      setErrors({});
      
      // Call the callback to refresh answers and wait for it
      if (onAnswerCreated) {
        const refreshResult = onAnswerCreated();
        // If it's a promise, wait for it
        if (refreshResult && typeof refreshResult.then === 'function') {
          await refreshResult;
        }
      }
      
      // Close the modal if provided (after answers are refreshed)
      if (onClose && isModal) {
        setTimeout(() => onClose(), 200);
      }
    } catch (error) {
      console.error('Create answer error:', error);
      const errorMessage = error?.message || error?.error || 'Failed to create answer';
      setErrors({ submit: errorMessage });
    }
  };

  const formContent = (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <textarea
          value={content}
          onChange={(e) => {
            setContent(e.target.value);
            setErrors((prev) => ({ ...prev, content: '' }));
          }}
          placeholder="Write your answer..."
          rows={isModal ? 4 : 5}
          className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
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
          disabled={isCreating}
          className="flex-1 py-2 bg-orange-500 text-white rounded font-medium hover:bg-orange-600 disabled:bg-gray-400 transition"
        >
          {isCreating ? 'Posting...' : 'Post Answer'}
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
    <div className="bg-white rounded-lg border border-gray-200 p-6 mt-8">
      <h3 className="text-lg font-semibold mb-4">Your Answer</h3>

      {!forumId ? (
        <p className="text-gray-500 text-sm">Loading post information...</p>
      ) : (
        formContent
      )}
    </div>
  );
};

export default CreateAnswerForm;