import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { useForums } from '../../hooks/useForum';
import { toastService } from '../../services/toastService';
import { ArrowLeft, Ban, RotateCcw } from 'lucide-react';

const ManageForumMembers = () => {
  const navigate = useNavigate();
  const { forumId } = useParams();
  const { user } = useAuth();
  const { 
    currentForum, 
    currentForumMembers, 
    bannedMembers,
    membersPagination,
    bannedPagination,
    isLoading, 
    getForumById, 
    getForumMembers, 
    getBannedUsers,
    banMember, 
    unbanMember 
  } = useForums();
  const [showBanModal, setShowBanModal] = useState(null);
  const [banningMember, setBanningMember] = useState(null);
  const [banReason, setBanReason] = useState('');
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [membersPage, setMembersPage] = useState(1);
  const [bannedPage, setBannedPage] = useState(1);
  const [searchActiveTerm, setSearchActiveTerm] = useState('');
  const [searchBannedTerm, setSearchBannedTerm] = useState('');

  useEffect(() => {
    getForumById(forumId);
    loadMembers();
    loadBanned();
  }, [forumId]);

  useEffect(() => {
    loadMembers(membersPage);
  }, [membersPage]);

  useEffect(() => {
    loadBanned(bannedPage);
  }, [bannedPage]);

  const loadMembers = (page = 1) => {
    getForumMembers(forumId, page, 10);
  };

  const loadBanned = (page = 1) => {
    getBannedUsers(forumId, page, 10);
  };

  useEffect(() => {
    if (currentForum) {
      // Handle createdBy as either object or string
      const creatorId = currentForum.createdBy?._id?.toString() || 
                        currentForum.createdBy?.toString() || 
                        currentForum.createdBy;
      const userId = user._id?.toString() || user.id?.toString();
      
      // Permission check: user is creator, admin, or content contributor
      const isCreator = creatorId === userId;
      const isAdmin = user?.role === 'ADMIN';
      const isContentContributor = user?.role === 'CONTENT_CONTRIBUTOR';

      console.log('ManageForumMembers Permission Check:', {
        forumCreatedBy: currentForum.createdBy,
        creatorId: creatorId,
        userId: userId,
        isCreator,
        isAdmin,
        isContentContributor,
        userRole: user?.role,
        hasPermission: isCreator || isAdmin || isContentContributor
      });

      if (!isCreator && !isAdmin && !isContentContributor) {
        setPermissionDenied(true);
      } else {
        setPermissionDenied(false);
      }
    }
  }, [currentForum, user]);

  const filteredActiveMembers = currentForumMembers.filter(member => {
    const searchTerm = searchActiveTerm.toLowerCase();
    return (
      (member.username?.toLowerCase().includes(searchTerm) || '') ||
      (member.email?.toLowerCase().includes(searchTerm) || '') ||
      (member.firstName?.toLowerCase().includes(searchTerm) || '')
    );
  });

  const filteredBannedMembers = bannedMembers.filter(ban => {
    const searchTerm = searchBannedTerm.toLowerCase();
    return (
      (ban.username?.toLowerCase().includes(searchTerm) || '') ||
      (ban.email?.toLowerCase().includes(searchTerm) || '') ||
      (ban.firstName?.toLowerCase().includes(searchTerm) || '')
    );
  });

  const handleBan = async () => {
    if (!banningMember) return;
    try {
      const userId = banningMember.userId?._id || banningMember.userId;
      await banMember(forumId, userId, banReason);
      toastService.success('Member banned successfully');
      setShowBanModal(null);
      setBanningMember(null);
      setBanReason('');
      loadMembers(membersPage);
      loadBanned(1);
    } catch (error) {
      const errorMsg = error.message || 'Failed to ban member';
      toastService.error(errorMsg);
    }
  };

  const handleUnban = async (memberId) => {
    try {
      await unbanMember(forumId, memberId);
      toastService.success('Member unbanned successfully');
      loadBanned(bannedPage);
      loadMembers(1);
    } catch (error) {
      const errorMsg = error.message || 'Failed to unban member';
      toastService.error(errorMsg);
    }
  };

  if (isLoading && !currentForum) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (permissionDenied) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <p className="text-red-700">
            You don't have permission to manage members in this forum. Only the forum creator, admin, or content contributor can manage members.
          </p>
          <button
            onClick={() => navigate('/admin/forums')}
            className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
          >
            Back to Forums
          </button>
        </div>
      </div>
    );
  }

  if (!currentForum) {
    return (
      <div className="p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <p className="text-yellow-700">Forum not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/admin/forums')}
          className="flex items-center gap-2 text-blue-500 hover:text-blue-600 transition mb-4"
        >
          <ArrowLeft size={20} />
          Back to Forums
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Manage Members: {currentForum.name}</h1>
      </div>

      {/* Active Members Section */}
      <div className="mb-8">
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="bg-gray-100 px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Active Members ({membersPagination.total})
            </h2>
          </div>

          {/* Search Bar */}
          <div className="px-6 py-4 border-b border-gray-200">
            <input
              type="text"
              placeholder="Search members by username, email, or name..."
              value={searchActiveTerm}
              onChange={(e) => setSearchActiveTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {filteredActiveMembers.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              {searchActiveTerm ? 'No members match your search' : 'No active members'}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Username</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Email</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Joined</th>
                      <th className="px-6 py-3 text-right text-sm font-medium text-gray-700">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredActiveMembers.map((member) => (
                      <tr key={member._id} className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="px-6 py-3 text-sm text-gray-900">{member.username || member.firstName}</td>
                        <td className="px-6 py-3 text-sm text-gray-600">{member.email}</td>
                        <td className="px-6 py-3 text-sm text-gray-600">
                          {member.joinedAt ? new Date(member.joinedAt).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="px-6 py-3 text-right">
                          <button
                            onClick={() => {
                              setShowBanModal(true);
                              setBanningMember(member);
                            }}
                            className="inline-flex items-center gap-1 px-3 py-1 text-sm bg-red-50 text-red-600 rounded hover:bg-red-100 transition"
                          >
                            <Ban size={14} />
                            Ban
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {membersPagination.total > 10 && (
                <div className="p-4 border-t border-gray-200 flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    Page {membersPagination.page} of {Math.ceil(membersPagination.total / 10)}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setMembersPage(p => Math.max(1, p - 1))}
                      disabled={membersPagination.page === 1}
                      className="px-3 py-1 text-sm border rounded disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setMembersPage(p => p + 1)}
                      disabled={membersPagination.page >= Math.ceil(membersPagination.total / 10)}
                      className="px-3 py-1 text-sm border rounded disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Banned Members Section */}
      <div>
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="bg-gray-100 px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Banned Members ({bannedPagination.total})
            </h2>
          </div>

          {/* Search Bar */}
          <div className="px-6 py-4 border-b border-gray-200">
            <input
              type="text"
              placeholder="Search banned members by username, email, or name..."
              value={searchBannedTerm}
              onChange={(e) => setSearchBannedTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {filteredBannedMembers.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              {searchBannedTerm ? 'No banned members match your search' : 'No banned members'}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Username</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Banned Date</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Ban Reason</th>
                      <th className="px-6 py-3 text-right text-sm font-medium text-gray-700">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBannedMembers.map((ban) => (
                      <tr key={ban._id} className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="px-6 py-3 text-sm text-gray-900">{ban.username || ban.firstName}</td>
                        <td className="px-6 py-3 text-sm text-gray-600">
                          {ban.createdAt ? new Date(ban.createdAt).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="px-6 py-3 text-sm text-gray-600">{ban.reason || 'No reason provided'}</td>
                        <td className="px-6 py-3 text-right">
                          <button
                            onClick={() => handleUnban(ban.userId._id || ban.userId)}
                            className="inline-flex items-center gap-1 px-3 py-1 text-sm bg-green-50 text-green-600 rounded hover:bg-green-100 transition"
                          >
                            <RotateCcw size={14} />
                            Unban
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {bannedPagination.total > 10 && (
                <div className="p-4 border-t border-gray-200 flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    Page {bannedPagination.page} of {Math.ceil(bannedPagination.total / 10)}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setBannedPage(p => Math.max(1, p - 1))}
                      disabled={bannedPagination.page === 1}
                      className="px-3 py-1 text-sm border rounded disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setBannedPage(p => p + 1)}
                      disabled={bannedPagination.page >= Math.ceil(bannedPagination.total / 10)}
                      className="px-3 py-1 text-sm border rounded disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Ban Modal */}
      {showBanModal && banningMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Ban Member</h3>
            <p className="text-sm text-gray-600 mb-4">
              Banning: <span className="font-medium">{banningMember.username || banningMember.firstName}</span>
            </p>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ban Reason (Optional)
              </label>
              <textarea
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
                placeholder="E.g., Spamming, Harassment, Violation of rules..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
              />
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowBanModal(null);
                  setBanningMember(null);
                  setBanReason('');
                }}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleBan}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
              >
                Ban Member
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageForumMembers;
