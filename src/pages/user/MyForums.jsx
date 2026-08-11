import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForums } from '../../hooks/useForum';
import { toastService } from '../../services/toastService';
import { MessageSquare } from 'lucide-react';

const MyForums = () => {
  const navigate = useNavigate();
  const { forums, userForums, isLoading, error, getAllForums, getUserForums, joinForum, leaveForum } = useForums();
  const [activeTab, setActiveTab] = useState('joined');
  const [joinedForums, setJoinedForums] = useState([]);
  const [availableForums, setAvailableForums] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Fetch all forums
    getAllForums();
    
    // Attempt to fetch user's specific forums (will fail gracefully if endpoint doesn't exist)
    getUserForums(1, 100).catch(err => {
      console.warn('getUserForums endpoint not available, using isMember flag instead:', err);
    });
  }, []);

  // Debug: Log state changes
  useEffect(() => {
    console.log('MyForums State:', {
      totalForums: forums.length,
      joinedFromBackend: userForums.length,
      joinedViaIsMember: forums.filter(f => f.isMember).length,
      displayingJoined: joinedForums.length,
    });
  }, [forums, userForums, joinedForums]);

  // Update forum lists based on user membership
  useEffect(() => {
    // Strategy: Use isMember flag (set when user joins) + userForums data
    // userForums come from getUserForums endpoint (has forumId nested structure flattened by reducer)
    
    const joinedForumIds = new Set();
    
    // Add forums from userForums (from backend endpoint - now flattened by reducer)
    userForums.forEach(forum => {
      if (forum._id) joinedForumIds.add(forum._id);
    });
    
    // Also check isMember flag (this is what's maintained by join/leave in Redux)
    forums.forEach(f => {
      if (f.isMember) joinedForumIds.add(f._id);
    });
    
    // Joined forums - match by ID from the Set
    const joined = forums.filter(forum => joinedForumIds.has(forum._id));

    // Available forums - all forums, those already joined will show leave button
    const available = forums;

    setJoinedForums(joined);
    setAvailableForums(available);
    
    console.log('✅ Forums filtered:', {
      joined: joined.length,
      total: forums.length,
      fromUserForums: userForums.length,
      usingIsMemberFlag: forums.filter(f => f.isMember).length
    });
  }, [forums, userForums]);

  // Filter by search term
  const getFilteredForums = (forumList) => {
    if (!searchTerm.trim()) return forumList;
    return forumList.filter(forum =>
      forum.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      forum.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const handleJoin = async (forumId) => {
    try {
      await joinForum(forumId);
      toastService.success('Joined forum successfully');
      getAllForums();
      getUserForums(1, 100); // Refresh user forums list
    } catch (error) {
      toastService.error(error.message || 'Failed to join forum');
    }
  };

  const handleLeave = async (forumId) => {
    try {
      await leaveForum(forumId);
      toastService.success('Left forum successfully');
      getAllForums();
      getUserForums(1, 100); // Refresh user forums list
    } catch (error) {
      toastService.error(error.message || 'Failed to leave forum');
    }
  };

  const filteredJoined = getFilteredForums(joinedForums);
  const filteredAvailable = getFilteredForums(availableForums);

  if (isLoading && forums.length === 0) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <MessageSquare size={32} className="text-orange-500" />
          <h1 className="text-3xl font-bold text-gray-900">My Forums</h1>
        </div>
        <p className="text-gray-600">Join forums to ask questions, share knowledge, and learn from the community</p>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search forums..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="mb-6 flex gap-4 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('joined')}
          className={`pb-3 px-1 font-medium transition-colors ${
            activeTab === 'joined'
              ? 'text-orange-500 border-b-2 border-orange-500'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Joined Forums ({joinedForums.length})
        </button>
        <button
          onClick={() => setActiveTab('all')}
          className={`pb-3 px-1 font-medium transition-colors ${
            activeTab === 'all'
              ? 'text-orange-500 border-b-2 border-orange-500'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          All Forums ({availableForums.length})
        </button>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'joined' ? (
          // Joined Forums Tab
          <div>
            {filteredJoined.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare size={48} className="mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500 text-lg">
                  {searchTerm ? 'No forums match your search' : 'You haven\'t joined any forums yet'}
                </p>
                <p className="text-gray-400 text-sm mt-1">
                  {!searchTerm && 'Explore the "All Forums" tab to find communities to join'}
                </p>
              </div>
            ) : (
              <div className="grid gap-4">
                {filteredJoined.map(forum => (
                  <div key={forum._id} className="flex items-start justify-between gap-4">
                    <div 
                      className="flex-1 cursor-pointer" 
                      onClick={() => navigate(`/dashboard/forum/${forum._id}`)}
                    >
                      <h3 className="text-lg font-semibold text-gray-900 hover:text-orange-500 transition">
                        {forum.name}
                      </h3>
                      <p className="text-gray-600 mt-1 line-clamp-2">{forum.description}</p>
                      <div className="flex gap-4 mt-2 text-sm text-gray-500">
                        <span>👥 {forum.memberCount || 0} members</span>
                        <span>📝 {forum.postCount || 0} posts</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleLeave(forum._id)}
                      className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition whitespace-nowrap"
                    >
                      Leave
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          // All Forums Tab
          <div>
            {filteredAvailable.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare size={48} className="mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500 text-lg">No forums found</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {filteredAvailable.map(forum => {
                  const isJoined = joinedForums.some(jf => jf._id === forum._id);
                  return (
                    <div key={forum._id} className="flex items-start justify-between gap-4">
                      <div 
                        className="flex-1 cursor-pointer"
                        onClick={() => navigate(`/dashboard/forum/${forum._id}`)}
                      >
                        <h3 className="text-lg font-semibold text-gray-900 hover:text-orange-500 transition">
                          {forum.name}
                        </h3>
                        <p className="text-gray-600 mt-1 line-clamp-2">{forum.description}</p>
                        <div className="flex gap-4 mt-2 text-sm text-gray-500">
                          <span>👥 {forum.memberCount || 0} members</span>
                          <span>📝 {forum.postCount || 0} posts</span>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          if (isJoined) {
                            handleLeave(forum._id);
                          } else {
                            handleJoin(forum._id);
                          }
                        }}
                        className={`px-4 py-2 rounded-lg transition whitespace-nowrap font-medium ${
                          isJoined
                            ? 'bg-red-50 text-red-600 hover:bg-red-100'
                            : 'bg-orange-500 text-white hover:bg-orange-600'
                        }`}
                      >
                        {isJoined ? 'Leave' : 'Join'}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyForums;
