import api from '../axios.js';

const POST_API = '/forums';

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

export const postService = {
  // Get posts by forum
  getPostsByForum: async (forumId, page = 1, limit = 10) => {
    try {
      const response = await api.get(
        `${POST_API}/${forumId}/posts?page=${page}&limit=${limit}`
      );
      return response.data;
    } catch (error) {
      throw extractErrorMessage(error.response?.data || error.message);
    }
  },

  // Get post by ID
  getPostById: async (forumId, postId) => {
    try {
      // Backend route: GET /api/forums/{forumId}/posts/{postId}
      const response = await api.get(`${POST_API}/${forumId}/posts/${postId}`);
      return response.data;
    } catch (error) {
      throw extractErrorMessage(error.response?.data || error.message);
    }
  },

  // Create post
  createPost: async (forumId, postData) => {
    try {
      const response = await api.post(`${POST_API}/${forumId}/posts`, postData);
      return response.data;
    } catch (error) {
      throw extractErrorMessage(error.response?.data || error.message);
    }
  },

  // Update post
  updatePost: async (forumId, postId, postData) => {
    try {
      const response = await api.put(`${POST_API}/${forumId}/posts/${postId}`, postData);
      return response.data;
    } catch (error) {
      throw extractErrorMessage(error.response?.data || error.message);
    }
  },

  // Delete post
  deletePost: async (forumId, postId) => {
    try {
      const response = await api.delete(`${POST_API}/${forumId}/posts/${postId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

export default postService;