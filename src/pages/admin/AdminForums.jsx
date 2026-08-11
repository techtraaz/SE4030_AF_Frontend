import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { useForums } from '../../hooks/useForum';
import { Trash2, Edit, Users, Plus } from 'lucide-react';
import { toastService } from '../../services/toastService';

const AdminForums = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { forums, isLoading, error, getAllForums, deleteForum } = useForums();
  const [filteredForums, setFilteredForums] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    getAllForums();
  }, []);

  useEffect(() => {
    // Filter forums based on user role
    let filtered = forums;
    
    // Content contributors see only their own forums
    if (user?.role === 'CONTENT_CONTRIBUTOR') {
      const userId = user._id?.toString() || user.id?.toString() || '';
      
      filtered = forums.filter(forum => {
        // createdBy might be:
        // 1. An object with _id property: { _id: "...", email, role }
        // 2. A string ID
        // 3. An ObjectId
        
        const creatorId = forum.createdBy?._id?.toString() || forum.createdBy?.toString() || '';
        return creatorId === userId;
      });

      console.log('AdminForums Filter Debug:', {
        userRole: user?.role,
        userId: user?._id,
        userIdString: userId,
        totalForums: forums.length,
        filteredCount: filtered.length,
        filteredForums: filtered.map(f => ({
          _id: f._id,
          name: f.name,
          createdBy: f.createdBy
        }))
      });
    }

    // Apply search filter
    if (searchTerm.trim()) {
      filtered = filtered.filter(forum =>
        forum.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        forum.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredForums(filtered);
  }, [forums, user, searchTerm]);

  const handleDelete = async (forumId) => {
    try {
      await deleteForum(forumId);
      toastService.success('Forum deleted successfully');
      setDeleteConfirm(null);
      getAllForums();
    } catch (error) {
      console.error('Delete error:', error);
      // Extract clean error message from HTML or error object
      let errorMessage = 'Failed to delete forum';
      
      if (typeof error === 'string') {
        // Extract text between HTML tags if it's an HTML error
        if (error.includes('<pre>')) {
          const match = error.match(/<pre>(.*?)<\/pre>/);
          errorMessage = match ? match[1].trim() : error;
        } else {
          errorMessage = error;
        }
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      toastService.error(errorMessage);
    }
  };

  const isCreator = (forumId) => {
    const forum = forums.find(f => f._id === forumId);
    if (!forum) return false;
    
    // Handle createdBy as either an object { _id, email, role } or a string ID
    const creatorId = forum.createdBy?._id?.toString() || forum.createdBy?.toString() || '';
    const userId = user._id?.toString() || user.id?.toString() || '';
    
    return creatorId === userId;
  };

  const canDelete = (forumId) => {
    return user?.role === 'ADMIN' || isCreator(forumId);
  };

  const canEdit = (forumId) => {
    return user?.role === 'ADMIN' || isCreator(forumId);
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Forums Management</h1>
          <p className="text-gray-600 mt-1">
            {user?.role === 'CONTENT_CONTRIBUTOR' ? 'Manage your forums' : 'Manage all platform forums'}
          </p>
        </div>
        <button
          onClick={() => navigate('/admin/forums/create')}
          className="flex items-center gap-2 bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition"
        >
          <Plus size={20} />
          Create Forum
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search forums by name or description..."
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

      {/* Forums List */}
      {filteredForums.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            {searchTerm ? 'No forums found matching your search' : 'No forums yet'}
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredForums.map(forum => (
            <div
              key={forum._id}
              className="bg-white rounded-lg border border-gray-200 p-6 hover:border-gray-300 transition"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">{forum.name}</h3>
                  <p className="text-gray-600 mt-1 line-clamp-2">{forum.description}</p>
                  <div className="flex gap-6 mt-3 text-sm text-gray-500">
                    <span>👥 {forum.memberCount || 0} members</span>
                    <span>📝 {forum.postCount || 0} posts</span>
                    <span>📅 {new Date(forum.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => navigate(`/dashboard/forum/${forum._id}`)}
                    className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition"
                    title="View Forum"
                  >
                    <Users size={18} />
                  </button>

                  {canEdit(forum._id) && (
                    <button
                      onClick={() => navigate(`/admin/forums/${forum._id}/edit`)}
                      className="p-2 text-orange-500 hover:bg-orange-50 rounded-lg transition"
                      title="Edit Forum"
                    >
                      <Edit size={18} />
                    </button>
                  )}

                  <button
                    onClick={() => navigate(`/admin/forums/${forum._id}/members`)}
                    className="p-2 text-green-500 hover:bg-green-50 rounded-lg transition"
                    title="Manage Members"
                  >
                    <Users size={18} />
                  </button>

                  {canDelete(forum._id) && (
                    <button
                      onClick={() => setDeleteConfirm(forum._id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                      title="Delete Forum"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              </div>

              {/* Delete Confirmation */}
              {deleteConfirm === forum._id && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded flex items-center justify-between">
                  <span className="text-red-700">Are you sure you want to delete this forum?</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setDeleteConfirm(null)}
                      className="px-3 py-1 text-sm border border-red-300 rounded text-red-700 hover:bg-red-100 transition"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleDelete(forum._id)}
                      className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminForums;
