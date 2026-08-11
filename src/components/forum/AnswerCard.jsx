import React, { useState } from 'react';
import VoteButton from './VoteButton';
import { formatTimeAgo, formatDateTime } from '../../lib/timeFormatter';
import { getAuthorName } from '../../lib/utils';
import { useAnswers } from '../../hooks/useAnswers';
import { useSelector } from 'react-redux';
import { toastService } from '../../services/toastService';
import { BsCheckCircle } from 'react-icons/bs';
import { BiTrash, BiPencil, BiCheck } from 'react-icons/bi';
import ConfirmationModal from '../shared/ConfirmationModal';

const AnswerCard = ({ answer, forumId, postId, postAuthorId, onAccept }) => {
  const { deleteAnswer, updateAnswer } = useAnswers();
  const { user } = useSelector((state) => state.auth);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(answer.content);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isAccepting, setIsAccepting] = useState(false);

  const isAuthor = user?._id === answer.authorId?._id;
  const isPostAuthor = user?._id === postAuthorId;

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteAnswer(forumId, postId, answer._id);
      setShowDeleteConfirm(false);
      toastService.success('Answer deleted successfully');
    } catch (error) {
      console.error('Delete error:', error);
      toastService.error('Failed to delete answer');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleAccept = async () => {
    setIsAccepting(true);
    try {
      await onAccept(answer._id);
      toastService.success('Answer marked as accepted!');
    } catch (error) {
      console.error('Accept error:', error);
      toastService.error('Failed to accept answer');
    } finally {
      setIsAccepting(false);
    }
  };

  const handleUpdate = async () => {
    if (editContent.trim()) {
      try {
        await updateAnswer(answer._id, editContent);
        setIsEditing(false);
      } catch (error) {
        console.error('Update error:', error);
      }
    }
  };

  return (
    <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 mt-4">
      <div className="flex gap-4">
        <div className="flex-shrink-0">
          <VoteButton
            targetId={answer._id}
            targetType="Answer"
            forumId={forumId}
            postId={postId}
            initialVotes={{
              upvotes: answer.upvoteCount || 0,
              downvotes: 0,
            }}
          />
        </div>

        <div className="flex-1">
          {isEditing ? (
            <div>
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                rows={4}
              />
              <div className="flex gap-2 mt-2">
                <button
                  onClick={handleUpdate}
                  className="px-3 py-1 bg-orange-500 text-white rounded hover:bg-orange-600 text-sm"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditContent(answer.content);
                  }}
                  className="px-3 py-1 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <p className="text-gray-700">{answer.content}</p>
          )}

          <div className="flex items-center justify-between mt-4 pt-4 border-t">
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <span className="text-gray-900 font-semibold">
                  {getAuthorName(answer.authorId)}
                </span>
              </div>
              <span className="text-gray-500">{formatTimeAgo(answer.createdAt)}</span>
            </div>

            <div className="flex items-center gap-2">
              {isPostAuthor && !answer.isAccepted && (
                <button
                  onClick={handleAccept}
                  disabled={isAccepting}
                  className="inline-flex items-center gap-1 px-3 py-2 bg-green-50 text-green-600 hover:bg-green-100 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-medium transition text-sm"
                >
                  {isAccepting ? (
                    <>
                      <div className="animate-spin">
                        <BiCheck size={16} />
                      </div>
                      Accepting...
                    </>
                  ) : (
                    <>
                      <BiCheck size={16} />
                      Accept Answer
                    </>
                  )}
                </button>
              )}

              {answer.isAccepted && (
                <span className="inline-flex items-center gap-1 px-3 py-2 bg-green-100 text-green-700 rounded-lg font-medium text-sm">
                  <BiCheck size={16} />
                  Accepted
                </span>
              )}

              {isAuthor && !isEditing && (
                <>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="inline-flex items-center gap-1 px-3 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg font-medium transition text-sm"
                  >
                    <BiPencil size={16} />
                    Edit
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="inline-flex items-center gap-1 px-3 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg font-medium transition text-sm"
                  >
                    <BiTrash size={16} />
                    Delete
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <ConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Answer"
        message="Are you sure you want to delete this answer? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        type="delete"
        loading={isDeleting}
      />
    </div>
  );
};

export default AnswerCard;