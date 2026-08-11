import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForums } from '../../hooks/useForum';
import { usePosts } from '../../hooks/usePosts';
import PostCard from '../../components/forum/PostCard';
import CreatePostForm from '../../components/forum/CreatePostForm';
import { ArrowLeft } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../components/ui/dialog';
import { useSelector } from 'react-redux';

const ForumPage = () => {
  const { forumId } = useParams();
  const navigate = useNavigate();
  const { 
    currentForum, 
    getForumById, 
    joinForum, 
    userForums, 
    getUserForums,
    getForumMembers
  } = useForums();
  const { posts, getPostsByForum, isLoading, pagination } = usePosts();
  const { user } = useSelector((state) => state.auth);
  const [currentPage, setCurrentPage] = useState(1);
  const [memberCount, setMemberCount] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    getForumById(forumId);
    getPostsByForum(forumId, 1, 10);
    getUserForums(1, 100).catch(err => console.warn('Could not fetch user forums:', err));
    getForumMembers(forumId, 1, 1)
      .catch(err => console.warn('Could not fetch forum members:', err));
  }, [forumId]);

  // Update memberCount when currentForum changes
  useEffect(() => {
    if (currentForum?.memberCount !== undefined && currentForum.memberCount !== null) {
      setMemberCount(currentForum.memberCount);
    }
  }, [currentForum?.memberCount]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    getPostsByForum(forumId, page, 10);
  };

  const handleJoinForum = async () => {
    try {
      await joinForum(forumId);
      await getUserForums(1, 100);
      await getForumById(forumId);
      await getForumMembers(forumId, 1, 1);
    } catch (error) {
      console.error('Error joining forum:', error);
    }
  };

  const handlePostCreated = () => {
    setCurrentPage(1);
    getPostsByForum(forumId, 1, 10);
    // Return a promise that resolves after a short delay to allow Redux to update
    return new Promise((resolve) => {
      setTimeout(resolve, 300);
    });
  };

  if (!currentForum) {
    return <div className="text-center py-12">Loading forum...</div>;
  }

  const totalPages = Math.ceil(pagination.total / pagination.limit);
  
  // Check membership: first from userForums list, then from isMember flag
  const isUserForumMember = userForums.some(f => f._id === forumId);
  const isMemberOfForum = isUserForumMember || currentForum.isMember;

  // Debug membership status
  console.log('Forum Membership Check:', {
    forumId,
    currentForumId: currentForum._id,
    userForumsCount: userForums.length,
    isUserForumMember,
    currentForumIsMember: currentForum.isMember,
    finalMembershipStatus: isMemberOfForum
  });

  return (
    <div className="space-y-6">
      {/* Back to Forums */}
      <div className="max-w-6xl mx-auto px-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-blue-500 hover:text-blue-600 transition"
        >
          <ArrowLeft size={20} />
          Back to Forums
        </button>
      </div>

      {/* Forum Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {currentForum.name}
            </h1>
            <p className="text-gray-600 mt-2">{currentForum.description}</p>
            <div className="mt-4 text-gray-500 text-sm">
              {memberCount || currentForum.memberCount || 0} members
            </div>
          </div>

          <div className="flex gap-2">
            {isMemberOfForum && (
              <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogTrigger asChild>
                  <button
                    className="px-6 py-2 bg-orange-500 text-white rounded font-medium hover:bg-orange-600 transition"
                  >
                    Create Post
                  </button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create a New Post</DialogTitle>
                    <DialogDescription>
                      Share your thoughts and discussions with the community
                    </DialogDescription>
                  </DialogHeader>
                  <CreatePostForm
                    forumId={forumId}
                    isModal={true}
                    onPostCreated={() => {
                      handlePostCreated();
                    }}
                    onClose={() => setIsModalOpen(false)}
                  />
                </DialogContent>
              </Dialog>
            )}

            {!isMemberOfForum && (
              <button
                onClick={handleJoinForum}
                className="px-6 py-2 bg-orange-500 text-white rounded font-medium hover:bg-orange-600 transition"
              >
                Join Forum
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Posts List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-12">Loading posts...</div>
        ) : posts && posts.length > 0 ? (
          posts
            .filter((post) => post && post._id) // Filter out any undefined/null posts
            .map((post) => <PostCard key={post._id} post={post} />)
        ) : (
          <div className="text-center py-12 text-gray-500">
            No posts yet. Be the first to start a discussion!
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`px-3 py-2 rounded transition ${
                currentPage === page
                  ? 'bg-orange-500 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {page}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ForumPage;