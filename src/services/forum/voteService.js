import api from '../axios.js';

const VOTE_API = '/votes';

// Helper function to extract error message
const extractErrorMessage = (error) => {
  if (typeof error === 'string') {
    if (error.includes('<pre>')) {
      const match = error.match(/<pre>(.*?)<\/pre>/);
      if (match) return match[1].trim();
    }
    return error;
  }
  if (error?.message) return error.message;
  if (error?.msg) return error.msg;
  return 'An error occurred';
};

export const voteService = {
  // Cast vote (Upvote/Downvote)
  castVote: async (targetId, targetType, voteType, forumId, postId) => {
    try {
      // Use simple /votes endpoint - backend endpoint structure
      const response = await api.post(VOTE_API, {
        targetId,
        targetType, // 'post' or 'answer'
        voteType, // 'upvote' or 'downvote'
      });
      return response.data;
    } catch (error) {
      console.error('Vote error details:', error.response?.data || error.message);
      throw extractErrorMessage(error.response?.data || error.message);
    }
  },
};

export default voteService;