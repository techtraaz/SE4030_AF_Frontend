import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePosts } from '../../hooks/usePosts';
import { useAnswers } from '../../hooks/useAnswers';
import VoteButton from '../../components/forum/VoteButton';
import AnswerCard from '../../components/forum/AnswerCard';
import CreateAnswerForm from '../../components/forum/CreateAnswerForm';
import ConfirmationModal from '../../components/shared/ConfirmationModal';
import { formatTimeAgo, formatDateTime } from '../../lib/timeFormatter';
import { getAuthorName } from '../../lib/utils';
import { useSelector } from 'react-redux';
import { BiTrash, BiPencil } from 'react-icons/bi';
import { ArrowLeft } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../components/ui/dialog';

const PostThread = () => {
  const { forumId, postId } = useParams();
  const navigate = useNavigate();
  const { currentPost, getPostById, isLoading: postLoading, deletePost } = usePosts();
  const { answers, getAnswersByPost, acceptAnswer, isFetching: answersLoading } = useAnswers();
  const { user } = useSelector((state) => state.auth);
  const [isAnswerModalOpen, setIsAnswerModalOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (forumId && postId) {
      getPostById(forumId, postId);
    }
  }, [forumId, postId]);

  const handleDeletePost = () => {
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      await deletePost(postId, forumId);
      setShowDeleteConfirm(false);
      navigate(-1);
    } catch (error) {
      console.error('Delete post error:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  // Fetch answers when we have postId and forumId
  useEffect(() => {
    if (forumId && postId) {
      getAnswersByPost(forumId, postId);
    }
  }, [forumId, postId]);

  const handleAcceptAnswer = async (answerId) => {
    try {
      await acceptAnswer(forumId, postId, answerId);
      // Refresh answers after accepting
      setTimeout(() => {
        getAnswersByPost(forumId, postId);
      }, 500);
    } catch (error) {
      console.error('Accept answer error:', error);
    }
  };

  if (postLoading || !currentPost) {
    return <div className="text-center py-12">Loading post...</div>;
  }

  const isPostAuthor = user?._id === currentPost.authorId?._id;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Back to Forum */}
        <button
          onClick={() => {
            console.log('Back button clicked - going back');
            navigate(-1);
          }}
          className="flex items-center gap-2 text-blue-500 hover:text-blue-600 transition mb-6"
        >
          <ArrowLeft size={20} />
          Back to Forum
        </button>

        {/* Post */}
        <article className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <VoteButton
                targetId={currentPost._id}
                targetType="Post"
                forumId={forumId}
                postId={postId}
                initialVotes={{
                  upvotes: currentPost.upvoteCount || 0,
                  downvotes: 0,
                }}
              />
            </div>

            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900">
                {currentPost.title}
              </h1>

              <div className="flex items-center gap-4 mt-4 text-sm">
                <div className="flex items-center gap-1">
                  <span className="text-gray-900 font-semibold">
                    by {getAuthorName(currentPost.authorId)}
                  </span>
                </div>
                <span className="text-gray-500" title={formatDateTime(currentPost.createdAt)}>
                  {formatTimeAgo(currentPost.createdAt)}
                </span>
                {currentPost.isAccepted && (
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded">
                    Solved
                  </span>
                )}
              </div>

              <div className="mt-6 prose max-w-none text-gray-700">
                {currentPost.content}
              </div>

              {isPostAuthor && (
                <div className="flex gap-2 mt-6 border-t pt-4">
                  <button className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg font-medium transition">
                    <BiPencil size={18} />
                    Edit Post
                  </button>
                  <button
                    onClick={handleDeletePost}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg font-medium transition"
                  >
                    <BiTrash size={18} />
                    Delete Post
                  </button>
                </div>
              )}
            </div>
          </div>
        </article>

        {/* Answers Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {answers.length} Answer{answers.length !== 1 ? 's' : ''}
            </h2>

            {/* Add Answer Button and Modal */}
            <Dialog open={isAnswerModalOpen} onOpenChange={setIsAnswerModalOpen}>
              <DialogTrigger asChild>
                <button
                  className="px-6 py-2 bg-orange-500 text-white rounded font-medium hover:bg-orange-600 transition"
                >
                  Add Answer
                </button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Post Your Answer</DialogTitle>
                  <DialogDescription>
                    Share your knowledge and help the community by providing an answer
                  </DialogDescription>
                </DialogHeader>
                <CreateAnswerForm
                  forumId={forumId}
                  postId={postId}
                  isModal={true}
                  onAnswerCreated={() => {
                    if (forumId && postId) {
                      return getAnswersByPost(forumId, postId);
                    }
                  }}
                  onClose={() => setIsAnswerModalOpen(false)}
                />
              </DialogContent>
            </Dialog>
          </div>

          {answersLoading ? (
            <div className="text-center py-12">Loading answers...</div>
          ) : answers.length > 0 ? (
            <div className="space-y-4">
              {answers.map((answer) => (
                <AnswerCard
                  key={answer._id}
                  answer={answer}
                  forumId={forumId}
                  postId={postId}
                  postAuthorId={currentPost.authorId?._id}
                  onAccept={handleAcceptAnswer}
                />
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No answers yet. Be the first to answer!</p>
          )}
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

export default PostThread;