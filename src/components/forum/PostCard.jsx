import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import VoteButton from './VoteButton';
import { formatTimeAgo } from '../../lib/timeFormatter';
import { getAuthorName } from '../../lib/utils';
import { usePosts } from '../../hooks/usePosts';
import { BiComment, BiTrash } from 'react-icons/bi';
import ConfirmationModal from '../shared/ConfirmationModal';

const PostCard = ({ post, onUpdate, onDelete }) => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { deletePost } = usePosts();
  const [isNew, setIsNew] = React.useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);

  React.useEffect(() => {
    setIsNew(true);
    const timer = setTimeout(() => setIsNew(false), 15000);
    return () => clearTimeout(timer);
  }, [post._id]);

  const isPostAuthor = user?._id === post.authorId?._id;

  const handleDeleteClick = async (e) => {
    e.stopPropagation();
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      const forumId = post.forumId || post.forum?._id;
      await deletePost(post._id, forumId);
      if (onDelete) onDelete(post._id);
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error('Delete post error:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div
      className="bg-white rounded-lg border border-gray-200 hover:shadow-md transition p-4 cursor-pointer group"
      onClick={() => {
        const forumId = post.forumId || post.forum?._id;
        navigate(`/dashboard/forum/${forumId}/post/${post._id}`);
      }}
    >
      <div className="flex gap-4">
        <div className="flex-shrink-0">
          <VoteButton
            targetId={post._id}
            targetType="Post"
            forumId={post.forumId || post.forum?._id}
            postId={post._id}
            initialVotes={{
              upvotes: post.upvoteCount || 0,
              downvotes: 0,
            }}
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h2 className="text-lg font-semibold text-gray-900 hover:text-orange-500 flex-1">
              {post.title}
            </h2>
            {isPostAuthor && (
              <button
                onClick={handleDeleteClick}
                className="p-2 text-red-600 hover:bg-red-50 rounded transition"
                title="Delete post"
              >
                <BiTrash size={18} />
              </button>
            )}
          </div>

          <p className="text-gray-600 text-sm mt-2 line-clamp-2">
            {post.content}
          </p>

          <div className="flex items-center gap-4 mt-3 text-sm">
            <div className="flex items-center gap-1">
              <span className="text-gray-900 font-semibold">
                {getAuthorName(post.authorId)}
              </span>
            </div>
            <span className="text-gray-500">{formatTimeAgo(post.createdAt)}</span>
            <div className="flex items-center gap-1 text-gray-500">
              <BiComment size={16} />
              <span>{post.answerCount || 0} answers</span>
            </div>
            {post.isAccepted && (
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                Solved
              </span>
            )}
          </div>
        </div>
      </div>

      <ConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Post"
        message="Are you sure you want to delete this post? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        type="delete"
        loading={isDeleting}
      />
    </div>
  );
};

export default PostCard;