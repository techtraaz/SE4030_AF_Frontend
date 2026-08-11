import api from '../axios.js';

const ANSWER_API = '/forums';

export const answerService = {
  // Get answers by post
  getAnswersByPost: async (forumId, postId) => {
    try {
      const response = await api.get(`${ANSWER_API}/${forumId}/posts/${postId}/answers`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Create answer
  createAnswer: async (forumId, postId, content) => {
    try {
      const response = await api.post(`${ANSWER_API}/${forumId}/posts/${postId}/answers`, { content });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update answer
  updateAnswer: async (forumId, postId, answerId, content) => {
    try {
      const response = await api.put(`${ANSWER_API}/${forumId}/posts/${postId}/answers/${answerId}`, { content });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Delete answer
  deleteAnswer: async (forumId, postId, answerId) => {
    try {
      const response = await api.delete(`${ANSWER_API}/${forumId}/posts/${postId}/answers/${answerId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Accept answer
  acceptAnswer: async (forumId, postId, answerId) => {
    try {
      const response = await api.patch(`${ANSWER_API}/${forumId}/posts/${postId}/answers/${answerId}/accept`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

export default answerService;