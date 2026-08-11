import React, { useEffect, useState } from 'react';
import { useForums } from '../../hooks/useForum';
import ForumCard from '../../components/forum/ForumCard';
import CreateForumForm from '../../components/forum/CreateForumForm';
import { useSelector } from 'react-redux';
import { UserRole } from '../../types/types';

const ForumHub = () => {
  const { forums, userForums, getAllForums, getUserForums, isLoading } = useForums();
  const { user } = useSelector((state) => state.auth);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    getAllForums();
    getUserForums(); // Fetch user's joined forums
  }, []);

  // Debug logging
  useEffect(() => {
    if (forums.length > 0 || userForums.length > 0) {
      console.log('ForumHub Debug - Forum Membership:', {
        totalForums: forums.length,
        userJoinedForums: userForums.length,
        forumDetails: forums.map(f => ({
          id: f._id,
          name: f.name,
          isMember: userForums.some(uf => uf._id === f._id)
        }))
      });
    }
  }, [forums, userForums]);

  const filteredForums = forums.filter((forum) =>
    forum.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const canCreateForum = user?.role === UserRole.ADMIN || user?.role === UserRole.CONTENT_CONTRIBUTOR;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Community Forums</h1>

        <div className="flex gap-4 mb-6">
          <input
            type="text"
            placeholder="Search forums..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
          />

          {canCreateForum && (
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="px-6 py-2 bg-orange-500 text-white rounded font-medium hover:bg-orange-600 transition"
            >
              {showCreateForm ? 'Cancel' : 'Create Forum'}
            </button>
          )}
        </div>

        {showCreateForm && (
          <CreateForumForm
              onForumCreated={() => {
                setShowCreateForm(false);
                getAllForums();
              }}
            />
          )}
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="spinner">Loading forums...</div>
          </div>
        ) : filteredForums.length > 0 ? (
          <div className="space-y-4">
            {filteredForums.map((forum) => {
              // Check if this forum is in the user's joined forums list
              const isMember = userForums.some(userForum => userForum._id === forum._id);
              return (
                <ForumCard key={forum._id} forum={forum} isMember={isMember} />
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            No forums found
          </div>
        )}
    </div>
  );
};

export default ForumHub;