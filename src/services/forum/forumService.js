import api from '../axios.js';

const FORUM_API = '/forums';

// Helper function to extract error message from response
const extractErrorMessage = (error) => {
  // If it's already a string error message
  if (typeof error === 'string') {
    // Try to extract from HTML error pages
    if (error.includes('<pre>')) {
      const match = error.match(/<pre>(.*?)<\/pre>/);
      if (match) return match[1].trim();
    }
    return error;
  }

  // If it's an error object with message
  if (error?.message) {
    return error.message;
  }

  // If it's an error object with msg
  if (error?.msg) {
    return error.msg;
  }

  return 'An error occurred';
};

export const forumService = {
  // Get all forums
  getAllForums: async () => {
    try {
      const response = await api.get(`${FORUM_API}`);
      return response.data;
    } catch (error) {
      throw extractErrorMessage(error.response?.data || error.message);
    }
  },

  // Get forum by ID
  getForumById: async (forumId) => {
    try {
      const response = await api.get(`${FORUM_API}/${forumId}`);
      return response.data;
    } catch (error) {
      throw extractErrorMessage(error.response?.data || error.message);
    }
  },

  // Create forum
  createForum: async (forumData) => {
    try {
      const response = await api.post(`${FORUM_API}`, forumData);
      return response.data;
    } catch (error) {
      throw extractErrorMessage(error.response?.data || error.message);
    }
  },

  // Update forum
  updateForum: async (forumId, forumData) => {
    try {
      const response = await api.patch(`${FORUM_API}/${forumId}`, forumData);
      return response.data;
    } catch (error) {
      throw extractErrorMessage(error.response?.data || error.message);
    }
  },

  // Delete forum
  deleteForum: async (forumId) => {
    try {
      const response = await api.delete(`${FORUM_API}/${forumId}`);
      return response.data;
    } catch (error) {
      throw extractErrorMessage(error.response?.data || error.message);
    }
  },

  // // Get forum members (paginated)
  getForumMembers: async (forumId, page = 1, limit = 10) => {
    try {
      const response = await api.get(`${FORUM_API}/${forumId}/members`, {
        params: { page, limit }
      });
      return response.data;
    } catch (error) {
      throw extractErrorMessage(error.response?.data || error.message);
    }
  },

  // Get banned users in a forum (paginated, admin/contributor only)
  getBannedUsers: async (forumId, page = 1, limit = 10) => {
    try {
      const response = await api.get(`${FORUM_API}/${forumId}/banned`, {
        params: { page, limit }
      });
      return response.data;
    } catch (error) {
      throw extractErrorMessage(error.response?.data || error.message);
    }
  },

  // Get user's forums (paginated)
  getUserForums: async (page = 1, limit = 10) => {
    try {
      const response = await api.get(`${FORUM_API}/user/forums`, {
        params: { page, limit }
      });
      return response.data;
    } catch (error) {
      throw extractErrorMessage(error.response?.data || error.message);
    }
  },

  // Join forum
  joinForum: async (forumId) => {
    try {
      const response = await api.post(`${FORUM_API}/${forumId}/join`);
      return response.data;
    } catch (error) {
      throw extractErrorMessage(error.response?.data || error.message);
    }
  },

  // Leave forum
  leaveForum: async (forumId) => {
    try {
      const response = await api.delete(`${FORUM_API}/${forumId}/leave`);
      return response.data;
    } catch (error) {
      throw extractErrorMessage(error.response?.data || error.message);
    }
  },

  // Ban user
  banUser: async (forumId, targetUserId, reason) => {
    try {
      const response = await api.post(`${FORUM_API}/${forumId}/ban`, {
        targetUserId,
        reason,
      });
      return response.data;
    } catch (error) {
      throw extractErrorMessage(error.response?.data || error.message);
    }
  },

  // Unban user
  unbanUser: async (forumId, targetUserId) => {
    try {
      const response = await api.patch(`${FORUM_API}/${forumId}/unban`, {
        targetUserId,
      });
      return response.data;
    } catch (error) {
      throw extractErrorMessage(error.response?.data || error.message);
    }
  },
};

export default forumService;